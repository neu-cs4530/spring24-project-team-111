import { Box, Button, Flex, Heading, List, ListItem, Text, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import PlayerController from '../../../../classes/PlayerController';
import { useInteractableAreaController as getAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { GameStatus, InteractableID } from '../../../../types/CoveyTownSocket';
import UndercookedBoard from './UndercookedBoard';
import UndercookedRecipeDisplay from './UndercookedRecipeDisplay';
import UndercookedTimerDisplay from './UndercookedTimerDisplay';

export default function UndercookedArea(): JSX.Element {
  return <>hello</>;
}

// export default function UndercookedArea({
//   interactableID,
// }: {
//   interactableID: InteractableID;
// }): JSX.Element {
//   const toast = useToast();
//   const townController = useTownController();
//   const gameAreaController = getAreaController<UndercookedAreaController>(interactableID);

//   const [joiningGame, setJoiningGame] = useState<boolean>(false);
//   const [playerOne, setPlayerOne] = useState<PlayerController | undefined>(
//     gameAreaController.playerOne,
//   );
//   const [playerTwo, setPlayerTwo] = useState<PlayerController | undefined>(
//     gameAreaController.playerTwo,
//   );
//   const [gameStatus, setGameStatus] = useState<GameStatus>(gameAreaController.status);

//   useEffect(() => {
//     const updateGameState = () => {
//       setPlayerOne(gameAreaController.playerOne);
//       setPlayerTwo(gameAreaController.playerTwo);
//       setGameStatus(gameAreaController.status || 'WAITING_TO_START');
//     };
//     gameAreaController.addListener('gameUpdated', updateGameState);

//     return () => {
//       gameAreaController.removeListener('gameUpdated', updateGameState);
//     };
//   }, [townController, gameAreaController, toast]);

//   const handleJoinGame = async () => {
//     setJoiningGame(true);
//     try {
//       await gameAreaController.joinGame();
//     } catch (err) {
//       toast({
//         title: 'Failed to join game',
//         description: (err as Error).toString(),
//         status: 'error',
//       });
//     } finally {
//       setJoiningGame(false);
//     }
//   };

//   return (
//     <Flex width='768px' mt={2} direction='column' alignItems='center'>
//       <Box width='100%' aria-label='game lobby information'>
//         <Heading as='h1' size='lg' textAlign='center'>
//           Welcome to Undercooked!
//         </Heading>
//         <Heading mt={2} as='h2' size='md' textAlign='center'>
//           Game Status{' '}
//           <Text as='span' fontWeight='normal'>
//             {gameStatus}
//           </Text>
//         </Heading>
//         <Flex mt={2} justifyContent='space-between' alignItems='center'>
//           <Flex gap={2} alignItems='center'>
//             <Heading as='h3' size='sm'>
//               Chefs
//             </Heading>
//             <List aria-label='list of players in the game' display='flex' gap={1}>
//               <ListItem>Chef 1: {playerOne?.userName || '(Chef needed!)'}</ListItem>
//               <ListItem>Chef 2: {playerTwo?.userName || '(Chef needed!)'}</ListItem>
//             </List>
//           </Flex>
//           <Flex gap={2}>
//             <Button size='xs' type='button' onClick={handleJoinGame} disabled={joiningGame}>
//               Join Game
//             </Button>
//             <Button
//               size='xs'
//               type='button'
//               onClick={() => console.log('start game button clicked')}>
//               Start Game
//             </Button>
//           </Flex>
//         </Flex>
//       </Box>
//       <Flex mt={2} width='100%' justifyContent='space-between'>
//         <UndercookedRecipeDisplay gameAreaController={gameAreaController} />
//         <UndercookedTimerDisplay gameAreaController={gameAreaController} />
//       </Flex>
//       <UndercookedBoard gameAreaController={gameAreaController} />
//     </Flex>
//   );
// }
