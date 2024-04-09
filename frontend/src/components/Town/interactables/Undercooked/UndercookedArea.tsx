import {
  Modal,
  Box,
  Button,
  Flex,
  Heading,
  List,
  ListItem,
  Text,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import UndercookedAreaController from '../../../../classes/interactable/UndercookedAreaController';
import { useInteractable, useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import ChatChannel from '../ChatChannel';
import UndercookedAreaInteractable from '../UndercookedArea';
import UndercookedBoard from './UndercookedBoard';
import UndercookedRecipeDisplay from './UndercookedRecipeDisplay';
import UndercookedTimerDisplay from './UndercookedTimerDisplay';
import { GameStatus, InteractableID } from '../../../../types/CoveyTownSocket';
import PlayerController from '../../../../classes/PlayerController';
import UndercookedScoreDisplay from './UndercookedScoreDisplay';

/**
 * Represents the props that are passed to the UndercookedArea component.
 */
export type UndercookedGameProps = {
  undercookedAreaController: UndercookedAreaController;
};

/**
 * The UndercookedArea component renders the Undercooked game area.
 * It renders the current state of the area, optionally allowing the player to join the game.
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * It uses the UndercookedAreaController to get the current state of the game.
 * It listens for the 'gameUpdated' event on the controller, and re-renders accordingly.
 * It subscribes to these events when the component mounts, and unsubscribes when the component unmounts. It also unsubscribes when the gameAreaController changes.
 * If player clicks join or start button, it should send join game or start game command (respectively) via UndercookedAreaController
 * Listens for model changed event from backend and updates status and list of players accordingly
 *
 * - A welcome message to the Undercooked game area.
 * - A button to join the game.
 * - A button to start the game.
 * - A message with the score board.
 * - A message with the recipe.
 * - A message with the assembled recipe.
 * - A message with the timer.
 * - A message indicating the current game status.
 *   - If the game is in progress, the message is 'In Progress'.
 *   - If the game is in status WAITING_FOR_PLAYERS, the message is 'Waiting For Players'.
 *   - If the game is in status WAITING_TO_START, the message is 'Waiting To Start'.
 *   - If the game is in status OVER, the message is 'Over'.
 * - A list of players' usernames (one item for Chef 1 and one for Chef 2).
 *    - If there is no player in the game, the username is '(Chef needed!)'
 *    - List the players as (exactly) `Chef 1: ${username}` and `Chef 2: ${username}`
 * - The UndercookedBoard component, which is passed the current gameAreaController as a prop (@see UndercookedBoard.tsx)
 *
 * - When the game ends, a toast is displayed with the result of the game:
 *    - Time is up! Final score: 0
 */
function UndercookedArea({ interactableID }: { interactableID: InteractableID }): JSX.Element {
  const undercookedAreaController =
    useInteractableAreaController<UndercookedAreaController>(interactableID);

  const [playerOne, setPlayerOne] = useState<PlayerController | undefined>(
    undercookedAreaController.playerOne,
  );
  const [playerTwo, setPlayerTwo] = useState<PlayerController | undefined>(
    undercookedAreaController.playerTwo,
  );
  const [joiningGame, setJoiningGame] = useState(false);

  const [gameStatus, setGameStatus] = useState<GameStatus>(undercookedAreaController.status);

  const toast = useToast();

  const convertToTitleCase = (str: string) => {
    return str
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  useEffect(() => {
    const updateGameState = () => {
      setPlayerOne(undercookedAreaController.playerOne);
      setPlayerTwo(undercookedAreaController.playerTwo);
      setGameStatus(undercookedAreaController.status || 'WAITING_TO_START');
    };

    undercookedAreaController.addListener('gameUpdated', updateGameState);

    return () => {
      undercookedAreaController.removeListener('gameUpdated', updateGameState);
    };
  }, [undercookedAreaController]);

  return (
    <Flex width='768px' mt={2} direction='column' alignItems='center'>
      <Box width='100%' aria-label='game lobby information'>
        <Heading as='h1' size='lg' textAlign='center'>
          Welcome to Undercooked!
        </Heading>
        <Heading mt={2} as='h2' size='md' textAlign='center'>
          Game Status{' '}
          <Text as='span' fontWeight='normal'>
            {convertToTitleCase(gameStatus)}
          </Text>
        </Heading>
        <Flex mt={2} justifyContent='space-between' alignItems='center'>
          <Flex gap={2} alignItems='center'>
            <Heading as='h3' size='sm'>
              Chefs
            </Heading>
            <List aria-label='list of players in the game' display='flex' gap={1}>
              <ListItem>Chef 1: {playerOne?.userName || '(Chef needed!)'}</ListItem>
              <ListItem>Chef 2: {playerTwo?.userName || '(Chef needed!)'}</ListItem>
            </List>
          </Flex>
          <Flex gap={2}>
            <Button
              size='xs'
              type='button'
              onClick={async () => {
                setJoiningGame(true);
                try {
                  await undercookedAreaController.joinGame();
                } catch (err) {
                  toast({
                    title: 'Error joining game',
                    description: (err as Error).toString(),
                    status: 'error',
                  });
                }
                setJoiningGame(false);
              }}
              isLoading={joiningGame}
              disabled={joiningGame}>
              Join Game
            </Button>
            <Button
              size='xs'
              type='button'
              onClick={async () => {
                setJoiningGame(true);
                try {
                  await undercookedAreaController.startGame();
                } catch (err) {
                  toast({
                    title: 'Error starting game',
                    description: (err as Error).toString(),
                    status: 'error',
                  });
                }
                setJoiningGame(false);
              }}
              isLoading={joiningGame}
              disabled={joiningGame}>
              Start Game
            </Button>
          </Flex>
        </Flex>
      </Box>
      {gameStatus === 'IN_PROGRESS' ? (
        <Box>
          <Flex mt={2} width='100%' justifyContent='space-between'>
            <UndercookedRecipeDisplay undercookedAreaController={undercookedAreaController} />
            <UndercookedScoreDisplay undercookedAreaController={undercookedAreaController} />
            <UndercookedTimerDisplay undercookedAreaController={undercookedAreaController} />
          </Flex>
          <UndercookedBoard undercookedAreaController={undercookedAreaController} />
        </Box>
      ) : (
        <></>
      )}
    </Flex>
  );
}

/**
 * A wrapper component for the UndercookedArea component.
 * Renders the selected game area component in a modal.
 * Sets listeners to pause and unpause the game when interacting with the chat.
 * Sets listeners to close the modal when the player leaves the game.
 */
export default function UndercookedAreaWrapper(): JSX.Element {
  const coveyTownController = useTownController();
  const undercookedArea = useInteractable<UndercookedAreaInteractable>('undercookedArea');

  useEffect(() => {
    if (undercookedArea) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, undercookedArea]);

  const closeModal = useCallback(() => {
    if (undercookedArea) {
      coveyTownController.interactEnd(undercookedArea);
      const undercookedAreaController =
        coveyTownController.getUndercookedAreaController(undercookedArea);
      undercookedAreaController.leaveGame();
    }
  }, [coveyTownController, undercookedArea]);

  if (undercookedArea) {
    return (
      <Modal
        isOpen={true}
        onClose={() => {
          closeModal();
          coveyTownController.unPause();
        }}
        size='full'>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody display='flex' justifyContent='space-between' alignItems='center'>
            <Box flex={2}>
              <UndercookedArea interactableID={undercookedArea.id} />
            </Box>
            <Box flex={1}>
              <Box
                style={{
                  height: '400px',
                  overflowY: 'scroll',
                  flex: 1,
                }}>
                <div
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                  <ChatChannel interactableID={undercookedArea.id} />
                </div>
              </Box>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
  return <></>;
}
