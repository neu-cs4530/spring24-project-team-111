import React, { useEffect, useState } from 'react';
import { Flex, Heading, Icon, Text, useToast } from '@chakra-ui/react';
import { FaRegStar } from 'react-icons/fa6';
import { UndercookedGameProps } from './UndercookedArea';

export default function UndercookedScoreDisplay({
  undercookedAreaController,
}: UndercookedGameProps): JSX.Element {
  const [currentScore, setCurrentScore] = useState<number>(undercookedAreaController.currentScore);

  const toast = useToast();

  useEffect(() => {
    const updateScore = () => {
      setCurrentScore(undercookedAreaController.currentScore);
    };

    const onGameEnd = () => {
      toast({
        title: 'Time is up!',
        description: `Final score: ${currentScore}`,
        status: 'success',
        duration: 8000,
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
    </Flex>
  );
}
