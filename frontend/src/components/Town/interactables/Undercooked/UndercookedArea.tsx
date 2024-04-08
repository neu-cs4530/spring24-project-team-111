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

export type UndercookedGameProps = {
  undercookedAreaController: UndercookedAreaController;
};

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
