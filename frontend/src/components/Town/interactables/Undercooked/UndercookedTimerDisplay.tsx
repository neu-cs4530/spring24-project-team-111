import React, { useState } from 'react';
import { Flex, Heading, Icon, Text } from '@chakra-ui/react';
import { FaRegClock } from 'react-icons/fa';
import { UndercookedGameProps } from './UndercookedArea';

type Time = number;

const DUMMY_TIME_LEFT: Time = 120;

export default function UndercookedTimerDisplay({
  undercookedAreaController,
}: UndercookedGameProps): JSX.Element {
  // currently using hard coded value for time left
  // change implementation to use gameAreaController to get the time left when backend is completed
  const [timeRemaining, setTimeRemaining] = useState<Time>(DUMMY_TIME_LEFT);

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
