import React, { useEffect, useState } from 'react';
import { Flex, Heading, Icon, Text } from '@chakra-ui/react';
import { FaRegStar } from 'react-icons/fa6';
import { UndercookedGameProps } from './UndercookedArea';

export default function UndercookedScoreDisplay({
  undercookedAreaController,
}: UndercookedGameProps): JSX.Element {
  const [currentScore, setCurrentScore] = useState<number>(undercookedAreaController.currentScore);

  useEffect(() => {
    const updateScore = () => {
      setCurrentScore(undercookedAreaController.currentScore);
    };

    undercookedAreaController.addListener('gameUpdated', updateScore);

    return () => {
      undercookedAreaController.removeListener('gameUpdated', updateScore);
    };
  }, [undercookedAreaController]);

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
