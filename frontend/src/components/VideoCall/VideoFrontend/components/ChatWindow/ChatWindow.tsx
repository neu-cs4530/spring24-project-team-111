import ChatInput from './ChatInput/ChatInput';
import ChatWindowHeader from './ChatWindowHeader/ChatWindowHeader';
import MessageList from './MessageList/MessageList';
import React from 'react';

export default function ChatWindow({interactableID} : {interactableID: string}) {
  return (
    <>
      <ChatWindowHeader />
      <MessageList />
      <ChatInput interactableID={interactableID} />
    </>
  );
}
