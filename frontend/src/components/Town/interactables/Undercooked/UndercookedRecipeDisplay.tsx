import React, { useEffect, useState } from 'react';
import { Flex, Heading, Icon } from '@chakra-ui/react';
import { FaBowlRice } from 'react-icons/fa6';
import { LuSalad, LuBeef } from 'react-icons/lu';
import { CiFries } from 'react-icons/ci';
import { MdOutlineEggAlt } from 'react-icons/md';
import { TbMilk } from 'react-icons/tb';
import { IconType } from 'react-icons';
import { UndercookedGameProps } from './UndercookedArea';
import { UndercookedIngredient, UndercookedRecipe } from '../../../../types/CoveyTownSocket';

type IngredientIcon = {
  icon: IconType;
};

type IngredientsList = {
  [index in UndercookedIngredient]: IngredientIcon;
};

/**
 * The UndercookedRecipeDisplay component displays the current recipe and assembled recipe for the Undercooked game.
 *
 * It performs the following:
 * - It uses the UndercookedAreaController to get the current recipe and assembled recipe.
 * - It listens for the 'gameUpdated' event on the controller, and re-renders the current recipe and assembled recipe accordingly.
 * - It subscribes to these events when the component mounts, and unsubscribes when the component unmounts.
 * - It also unsubscribes when the gameAreaController changes.
 *
 * @param gameAreaController the controller for the Undercooked game
 */
export default function UndercookedRecipeDisplay({
  undercookedAreaController,
}: UndercookedGameProps): JSX.Element {
  // list of ingredients in the Undercooked game and their corresponding icons
  const ingredientsList: IngredientsList = {
    Steak: {
      icon: LuBeef,
    },
    Rice: {
      icon: FaBowlRice,
    },
    Salad: {
      icon: LuSalad,
    },
    Milk: {
      icon: TbMilk,
    },
    Fries: {
      icon: CiFries,
    },
    Egg: {
      icon: MdOutlineEggAlt,
    },
  };

  const [currentRecipe, setCurrentRecipe] = useState<UndercookedRecipe | undefined>(
    undercookedAreaController.currentRecipe,
  );
  const [currentAssembled, setCurrentAssembled] = useState<UndercookedIngredient[] | undefined>(
    undercookedAreaController.currentAssembled,
  );

  useEffect(() => {
    const updateRecipe = () => {
      setCurrentAssembled(undercookedAreaController.currentAssembled);
      setCurrentRecipe(undercookedAreaController.currentRecipe);
    };

    undercookedAreaController.addListener('gameUpdated', updateRecipe);

    return () => {
      undercookedAreaController.removeListener('gameUpdated', updateRecipe);
    };
  }, [undercookedAreaController]);

  return (
    <Flex gap={2} alignItems='center'>
      <Flex alignItems='center' gap={1}>
        <Heading as='h4' size='sm'>
          Current Recipe
        </Heading>
        {currentRecipe?.map(ingredient => (
          <Icon key={`recipe-${ingredient}`} as={ingredientsList[ingredient].icon} />
        ))}
      </Flex>
      <Flex alignItems='center' gap={1}>
        <Heading as='h4' size='sm'>
          Assembled Recipe
        </Heading>
        {currentAssembled?.map(ingredient => (
          <Icon key={`assembled-${ingredient}`} as={ingredientsList[ingredient].icon} />
        ))}
      </Flex>
    </Flex>
  );
}
