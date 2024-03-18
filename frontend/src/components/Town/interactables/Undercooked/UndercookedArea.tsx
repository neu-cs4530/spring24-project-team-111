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
  AccordionButton,
  Accordion,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from '@chakra-ui/react';
import React, { useCallback, useEffect } from 'react';
import UndercookedAreaController from '../../../../classes/interactable/UndercookedAreaController';
import { useInteractable } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import ChatChannel from '../ChatChannel';
import UndercookedAreaInteractable from '../UndercookedArea';
import UndercookedBoard from './UndercookedBoard';
import UndercookedRecipeDisplay from './UndercookedRecipeDisplay';
import UndercookedTimerDisplay from './UndercookedTimerDisplay';

export type UndercookedGameProps = {
  undercookedAreaController: UndercookedAreaController;
};

function UndercookedArea({
  undercookedAreaController,
}: {
  undercookedAreaController: UndercookedAreaController;
}): JSX.Element {
  const townController = useTownController();

  useEffect(() => {
    undercookedAreaController.undercookedTownController.connect();
  }, [townController, undercookedAreaController]);

  return (
    <Flex width='768px' mt={2} direction='column' alignItems='center'>
      <Box width='100%' aria-label='game lobby information'>
        <Heading as='h1' size='lg' textAlign='center'>
          Welcome to Undercooked!
        </Heading>
        <Heading mt={2} as='h2' size='md' textAlign='center'>
          Game Status{' '}
          <Text as='span' fontWeight='normal'>
            Waiting for Players
          </Text>
        </Heading>
        <Flex mt={2} justifyContent='space-between' alignItems='center'>
          <Flex gap={2} alignItems='center'>
            <Heading as='h3' size='sm'>
              Chefs
            </Heading>
            <List aria-label='list of players in the game' display='flex' gap={1}>
              <ListItem>Chef 1: (Chef needed!)</ListItem>
              <ListItem>Chef 2: (Chef needed!)</ListItem>
            </List>
          </Flex>
          <Flex gap={2}>
            <Button size='xs' type='button' onClick={() => console.log('join game button clicked')}>
              Join Game
            </Button>
            <Button
              size='xs'
              type='button'
              onClick={() => console.log('start game button clicked')}>
              Start Game
            </Button>
          </Flex>
        </Flex>
      </Box>
      <Flex mt={2} width='100%' justifyContent='space-between'>
        <UndercookedRecipeDisplay undercookedAreaController={undercookedAreaController} />
        <UndercookedTimerDisplay undercookedAreaController={undercookedAreaController} />
      </Flex>
      <UndercookedBoard undercookedAreaController={undercookedAreaController} />
    </Flex>
  );
}

export default function UndercookedAreaWrapper(): JSX.Element {
  const coveyTownController = useTownController();
  const undercookedArea = useInteractable<UndercookedAreaInteractable>('undercookedArea');
  const undercookedAreaController =
    undercookedArea && coveyTownController.getUndercookedAreaController(undercookedArea);

  useEffect(() => {
    if (undercookedArea) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, undercookedArea, undercookedAreaController]);

  const closeModal = useCallback(() => {
    if (undercookedArea) {
      coveyTownController.interactEnd(undercookedArea);
      // undercookedAreaController.leaveGame(); or something like that
    }
  }, [coveyTownController, undercookedArea]);

  if (undercookedArea && undercookedAreaController) {
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
              <UndercookedArea undercookedAreaController={undercookedAreaController} />
            </Box>
            <Box flex={1}>
              <Accordion allowToggle>
                <AccordionItem>
                  <Heading as='h3'>
                    <AccordionButton backgroundColor='#F4F4F6'>
                      <Box flex='1' textAlign='left'>
                        Leaderboard
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel>Show leaderboard here</AccordionPanel>
                  </Heading>
                </AccordionItem>
              </Accordion>
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
                  <ChatChannel interactableID={undercookedAreaController.id} />
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
// <Flex width='768px' mt={2} direction='column' alignItems='center'>
//   <Box width='100%' aria-label='game lobby information'>
//     <Heading as='h1' size='lg' textAlign='center'>
//       Welcome to Undercooked!
//     </Heading>
//     <Heading mt={2} as='h2' size='md' textAlign='center'>
//       Game Status{' '}
//       <Text as='span' fontWeight='normal'>
//         {gameStatus}
//       </Text>
//     </Heading>
//     <Flex mt={2} justifyContent='space-between' alignItems='center'>
//       <Flex gap={2} alignItems='center'>
//         <Heading as='h3' size='sm'>
//           Chefs
//         </Heading>
//         <List aria-label='list of players in the game' display='flex' gap={1}>
//           <ListItem>Chef 1: {playerOne?.userName || '(Chef needed!)'}</ListItem>
//           <ListItem>Chef 2: {playerTwo?.userName || '(Chef needed!)'}</ListItem>
//         </List>
//       </Flex>
//       <Flex gap={2}>
//         <Button size='xs' type='button' onClick={handleJoinGame} disabled={joiningGame}>
//           Join Game
//         </Button>
//         <Button
//           size='xs'
//           type='button'
//           onClick={() => console.log('start game button clicked')}>
//           Start Game
//         </Button>
//       </Flex>
//     </Flex>
//   </Box>
//   <Flex mt={2} width='100%' justifyContent='space-between'>
//     <UndercookedRecipeDisplay gameAreaController={gameAreaController} />
//     <UndercookedTimerDisplay gameAreaController={gameAreaController} />
//   </Flex>
//   <UndercookedBoard gameAreaController={gameAreaController} />
// </Flex>
//   );
// }
