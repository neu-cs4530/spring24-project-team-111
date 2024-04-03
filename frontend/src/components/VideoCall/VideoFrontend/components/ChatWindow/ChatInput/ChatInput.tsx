import { makeStyles } from '@material-ui/core';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import UndercookedAreaController from '../../../../../../classes/interactable/UndercookedAreaController';
import { useInteractableAreaController } from '../../../../../../classes/TownController';
import useTownController from '../../../../../../hooks/useTownController';
import useChatContext from '../../../hooks/useChatContext/useChatContext';
import { isMobile } from '../../../utils';
import Snackbar from '../../Snackbar/Snackbar';
import EmojiPicker from 'emoji-picker-react';

const useStyles = makeStyles(theme => ({
  chatInputContainer: {
    borderTop: '1px solid #e4e7e9',
    borderBottom: '1px solid #e4e7e9',
    padding: '1em 1.2em 1em',
  },
  textArea: {
    width: '100%',
    border: '0',
    resize: 'none',
    fontSize: '14px',
    fontFamily: 'Inter',
    outline: 'none',
  },
  button: {
    padding: '0.56em',
    minWidth: 'auto',
    '&:disabled': {
      background: 'none',
      '& path': {
        fill: '#d8d8d8',
      },
    },
  },
  buttonContainer: {
    margin: '1em 0 0 1em',
    display: 'flex',
  },
  fileButtonContainer: {
    position: 'relative',
    marginRight: '1em',
  },
  fileButtonLoadingSpinner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  textAreaContainer: {
    display: 'flex',
    marginTop: '0.4em',
    padding: '0.48em 0.7em',
    border: '2px solid transparent',
  },
  isTextareaFocused: {
    borderColor: theme.palette.primary.main,
    borderRadius: '4px',
  },
}));

const ALLOWED_FILE_TYPES =
  'audio/*, image/*, text/*, video/*, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document .xslx, .ppt, .pdf, .key, .svg, .csv';

export default function ChatInput({ interactableID }: { interactableID: string }) {
  const classes = useStyles();
  const [messageBody, setMessageBody] = useState('');
  const [isSendingFile, setIsSendingFile] = useState(false);
  const [fileSendError, setFileSendError] = useState<string | null>(null);
  const isValidMessage = /\S/.test(messageBody);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const coveyTownController = useTownController();
  const {conversation, isChatWindowOpen, setIsChatWindowOpen} = useChatContext();
  try {
    const undercookedAreaController =
    useInteractableAreaController<UndercookedAreaController>(interactableID);
    useEffect(() => {
      try {
        if (isTextareaFocused) {
          undercookedAreaController.pause();
        } else {
          undercookedAreaController.unPause();
          }
      } catch (e) {
        // we don't need to do anything area exists but modal is off.
      };
    }, [isTextareaFocused, undercookedAreaController]);
  } catch (e) { 
    // we don't need to do anything if we can't get the undercookedAreaController
  };

  const [isOpen, setIsOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false); // New state to track emoji picker visibility
   const emojiPickerRef = useRef<HTMLElement | null>(null);

   useEffect(() => {
     function handleOutsideClick(event: MouseEvent) {
      if (
        !emojiPickerRef.current?.contains(event.target as Node) &&
        !textInputRef.current?.contains(event.target as Node)
      ) {
                 setIsEmojiPickerOpen(false);
       }
     }

     document.addEventListener('mousedown', handleOutsideClick);

     return () => {
       document.removeEventListener('mousedown', handleOutsideClick);
     };
   }, []);

  useEffect(() => {
    if(isTextareaFocused){
      coveyTownController.pause();
    }else{
      coveyTownController.unPause();
    }
  }, [isTextareaFocused, coveyTownController]);

  useEffect(() => {
    if (isChatWindowOpen) {
      // When the chat window is opened, we will focus on the text input.
      // This is so the user doesn't have to click on it to begin typing a message.
      textInputRef.current?.focus();
    }
  }, [isChatWindowOpen]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageBody(event.target.value);
  };

  const handleSendMessage = (message: string) => {
    if (isValidMessage && conversation) {
      conversation.sendMessage(message.trim());
      setMessageBody('');
    }
  };

  // ensures pressing enter + shift creates a new line, so that enter on its own only sends the message:
  const handleReturnKeyPress = (event: React.KeyboardEvent) => {
    if (!isMobile && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage(messageBody);
    }
    if(!isMobile && event.key === 'Escape'){
      setIsChatWindowOpen(false);
    }
  };

  const toggleChatWindow = () => {
    setIsOpen(!isOpen);
  };
  const toggleEmojiPicker = () => {
    setIsEmojiPickerOpen(!isEmojiPickerOpen);
  };

  const handleEmojiClick = (emojiData, event) => {
    const { emoji } = emojiData;
    const currentMessage = messageBody;
    const cursorPosition = textInputRef.current.selectionStart;
    const newMessage =
      currentMessage.substring(0, cursorPosition) +
      emoji +
      currentMessage.substring(cursorPosition);

    setMessageBody(newMessage);

    // Set focus back to the input after inserting the emoji
    textInputRef.current.focus();
  };

  return (
    <div className={classes.chatInputContainer}>
      <Snackbar
       open={Boolean(fileSendError)}
       headline="Error"
       message={fileSendError || ''}
       variant="error"
       handleClose={() => setFileSendError(null)}
     />
     <div className={clsx(classes.textAreaContainer, { [classes.isTextareaFocused]: isTextareaFocused })}>
       {/* 
       Here we add the "isTextareaFocused" class when the user is focused on the TextareaAutosize component.
       This helps to ensure a consistent appearance across all browsers. Adding padding to the TextareaAutosize
       component does not work well in Firefox. See: https://github.com/twilio/twilio-video-app-react/issues/498
       */}
       <TextareaAutosize
 minRows={1}
     maxRows={3}
     className={classes.textArea}
     aria-label="chat input"
     placeholder="Write a message..."
     onKeyPress={handleReturnKeyPress}
     onChange={(e) => setMessageBody(e.target.value)}
     value={messageBody}
     data-cy-chat-input
     ref={textInputRef}
     onFocus={() => setIsTextareaFocused(true)}
     onBlur={() => setIsTextareaFocused(false)}
   />
   <div>
 <button onClick={toggleEmojiPicker}>
  {isEmojiPickerOpen ? "" : "😀"}
</button>
{isEmojiPickerOpen && (
  <div ref={(element) => { emojiPickerRef.current = element; }}>
 <EmojiPicker onEmojiClick={handleEmojiClick} />
  </div>
)}
    </div>
      </div>
    </div>
  );
}

