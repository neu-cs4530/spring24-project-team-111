import React, { useState, useEffect } from 'react';
import { Flex, Heading, Icon, Text } from '@chakra-ui/react';
import { FaRegClock } from 'react-icons/fa';
import { UndercookedGameProps } from './UndercookedArea';

/**
 * It displays the time remaining in the current Undercooked game.
 *
 * It performs the following:
 * - It uses the UndercookedAreaController to get the current time remaining.
 * - It listens for the 'gameUpdated' event on the controller, and re-renders accordingly.
 * - It subscribes to these events when the component mounts, and unsubscribes when the component unmounts.
 *
 * @param gameAreaController the controller for the Undercooked game.
 */
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
