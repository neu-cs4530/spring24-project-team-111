import React from 'react';
import { Flex, Heading, Icon, Text } from '@chakra-ui/react';
import { FaRegClock } from 'react-icons/fa';
import { UndercookedGameProps } from './UndercookedArea';

export default function UndercookedTimerDisplay({
  gameAreaController,
}: UndercookedGameProps): JSX.Element {
  return (
    <Flex gap={2} alignItems='center'>
      <Icon as={FaRegClock} />
      <Heading as='h4' size='sm'>
        Time Left
      </Heading>
      <Text>3:00</Text>
    </Flex>
  );
}
