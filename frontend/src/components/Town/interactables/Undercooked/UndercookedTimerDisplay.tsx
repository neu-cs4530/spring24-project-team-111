import React, { useState, useEffect } from 'react';
import { Flex, Heading, Icon, Text } from '@chakra-ui/react';
import { FaRegClock } from 'react-icons/fa';
import { UndercookedGameProps } from './UndercookedArea';

export default function UndercookedTimerDisplay({
  undercookedAreaController,
}: UndercookedGameProps): JSX.Element {
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>(
    undercookedAreaController.currentTime,
  );

  useEffect(() => {
    const updateTime = () => {
      setTimeRemaining(undercookedAreaController.currentTime);
    };

    undercookedAreaController.addListener('gameUpdated', updateTime);

    return () => {
      undercookedAreaController.removeListener('gameUpdated', updateTime);
    };
  }, [undercookedAreaController]);

  return (
    <Flex gap={2} alignItems='center'>
      <Icon as={FaRegClock} />
      <Heading as='h4' size='sm'>
        Time Left
      </Heading>
      <Text>{timeRemaining}</Text>
    </Flex>
  );
}
