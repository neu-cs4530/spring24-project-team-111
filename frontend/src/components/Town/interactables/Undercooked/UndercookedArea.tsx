import { Box, Button, Container, List, ListItem, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import UndercookedAreaController from '../../../../classes/interactable/UndercookedAreaController';
import { useInteractableAreaController as getAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { InteractableID } from '../../../../types/CoveyTownSocket';
import UndercookedBoard from './UndercookedBoard';

export default function UndercookedArea({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  const toast = useToast();
  const townController = useTownController();
  const gameAreaController = getAreaController<UndercookedAreaController>(interactableID);

  const [joiningGame, setJoiningGame] = useState(false);
  const [playerOne, setPlayerOne] = useState(gameAreaController.playerOne);
  const [playerTwo, setPlayerTwo] = useState(gameAreaController.playerTwo);
  const [gameStatus, setGameStatus] = useState(gameAreaController.status);

  useEffect(() => {
    const updateGameState = () => {
      setPlayerOne(gameAreaController.playerOne);
      setPlayerTwo(gameAreaController.playerTwo);
      setGameStatus(gameAreaController.status || 'WAITING_TO_START');
    };
    gameAreaController.addListener('gameUpdated', updateGameState);

    return () => {
      gameAreaController.removeListener('gameUpdated', updateGameState);
    };
  }, [townController, gameAreaController, toast]);

  const handleJoinGame = async () => {
    setJoiningGame(true);
    try {
      await gameAreaController.joinGame();
    } catch (err) {
      toast({
        title: 'Failed to join game',
        description: (err as Error).toString(),
        status: 'error',
      });
    } finally {
      setJoiningGame(false);
    }
  };

  return (
    <Container margin={0}>
      <Box>
        <b>{gameStatus}</b>
      </Box>
      <Button type='button' onClick={handleJoinGame} disabled={joiningGame}>
        Join Game
      </Button>
      <List aria-label='list of players in the game'>
        <ListItem>Chef 1: {playerOne?.userName || '(Chef needed!)'}</ListItem>
        <ListItem>Chef 2: {playerTwo?.userName || '(Chef needed!)'}</ListItem>
      </List>
      <UndercookedBoard gameAreaController={gameAreaController} />
    </Container>
  );
}
