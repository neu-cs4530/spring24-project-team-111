import React, { useEffect, useState } from 'react';
import { Button, Flex, Heading, Icon, Text, useToast } from '@chakra-ui/react';
import { FaRegStar } from 'react-icons/fa6';
import { UndercookedGameProps } from './UndercookedArea';

export default function UndercookedScoreDisplay({
  undercookedAreaController,
}: UndercookedGameProps): JSX.Element {
  const [currentScore, setCurrentScore] = useState<number>(undercookedAreaController.currentScore);

  const toast = useToast();

  const testOnGameEnd = () => {
    toast({
      title: 'Time is up!',
      description: `Final score: ${currentScore}`,
      status: 'success',
    });
  };

  useEffect(() => {
    const updateScore = () => {
      setCurrentScore(undercookedAreaController.currentScore);
    };

    const onGameEnd = () => {
      toast({
        title: 'Game over',
        description: `You scored ${currentScore} points!`,
        status: 'success',
      });
    };

    undercookedAreaController.addListener('gameUpdated', updateScore);
    undercookedAreaController.addListener('gameEnd', onGameEnd);

    return () => {
      undercookedAreaController.removeListener('gameUpdated', updateScore);
      undercookedAreaController.removeListener('gameEnd', onGameEnd);
    };
  }, [undercookedAreaController, toast, currentScore]);

  return (
    <Flex gap={2} alignItems='center'>
      <Icon as={FaRegStar} />
      <Heading as='h4' size='sm'>
        Score
      </Heading>
      <Text>{currentScore}</Text>
      <Button size='xs' onClick={testOnGameEnd}>
        call onGameEnd function
      </Button>
    </Flex>
  );
}
