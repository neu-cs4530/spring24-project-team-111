import React, { useState } from 'react';
import { Flex, Heading, Icon } from '@chakra-ui/react';
import { FaBowlRice } from 'react-icons/fa6';
import { LuSalad, LuBeef } from 'react-icons/lu';
import { IconType } from 'react-icons';
import { UndercookedGameProps } from './UndercookedArea';

type Ingredient = {
  name: string;
  icon: IconType;
};

type Recipe = Ingredient[];

type IngredientsList = {
  [index: string]: Ingredient;
};

const ingredientsList: IngredientsList = {
  steak: {
    name: 'Steak',
    icon: LuBeef,
  },
  rice: {
    name: 'Rice',
    icon: FaBowlRice,
  },
  salad: {
    name: 'Salad',
    icon: LuSalad,
  },
};

const DUMMY_CURRENT_RECIPE: Recipe = [
  ingredientsList.steak,
  ingredientsList.rice,
  ingredientsList.salad,
];

const DUMMY_ASEMBLED_RECIPE: Recipe = [ingredientsList.steak];

export default function UndercookedRecipeDisplay({
  gameAreaController,
}: UndercookedGameProps): JSX.Element {
  // currently using hard coded values for current and assembled recipes
  // change implementation to use gameAreaController to get the current and assembled recipes when backend is completed
  const [currentRecipe, setCurrentRecipe] = useState<Recipe>(DUMMY_CURRENT_RECIPE);
  const [assembledRecipe, setAssembledRecipe] = useState<Recipe>(DUMMY_ASEMBLED_RECIPE);

  return (
    <Flex gap={2} alignItems='center'>
      <Flex alignItems='center' gap={1}>
        <Heading as='h4' size='sm'>
          Current Recipe
        </Heading>
        {currentRecipe.map((ingredient: Ingredient) => (
          <Icon key={`recipe-${ingredient.name}`} as={ingredient.icon} />
        ))}
      </Flex>
      <Flex alignItems='center' gap={1}>
        <Heading as='h4' size='sm'>
          Assembled Recipe
        </Heading>
        {assembledRecipe.map((ingredient: Ingredient) => (
          <Icon key={`assembled-${ingredient.name}`} as={ingredient.icon} />
        ))}
      </Flex>
    </Flex>
  );
}
