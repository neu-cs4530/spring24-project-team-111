import React, { useState } from 'react';
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

export default function UndercookedRecipeDisplay({
  undercookedAreaController,
}: UndercookedGameProps): JSX.Element {
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
