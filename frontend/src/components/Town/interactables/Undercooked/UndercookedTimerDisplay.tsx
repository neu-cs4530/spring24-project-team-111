import React, { useState, useEffect } from 'react';
import { Flex, Heading, Icon, Text, useToast } from '@chakra-ui/react';
import { FaRegClock } from 'react-icons/fa';
import { UndercookedGameProps } from './UndercookedArea';

export default function UndercookedTimerDisplay({
  undercookedAreaController,
}: UndercookedGameProps): JSX.Element {
  // currently using hard coded value for time left
  // change implementation to use gameAreaController to get the time left when backend is completed
  let t = undercookedAreaController.time;
  if (t === undefined) {
    t = 0;
  }
  const toast = useToast();
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>(t);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      const updatedTime = t;
      setTimeRemaining(updatedTime);
    }, 1000); // get time every second as it updates

    return () => clearInterval(timerInterval);
  }, [t, timeRemaining]);

  if (timeRemaining === 0) {
    toast({
      title: 'Game Over.',
      description: 'Score is ' + undercookedAreaController.score,
      status: 'info',
    });
  }

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
