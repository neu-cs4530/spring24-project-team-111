import { ITiledMap } from '@jonbell/tiled-map-type-guard';

export const simpleMap = {
  name: 'Undercooked',
  width: 100,
  height: 100,
  x: 0,
  y: 0,
  layers: [{ name: 'Objects', objects: [] }],
} as unknown as ITiledMap;
export const mapWithStations = {
  name: 'Undercooked',
  width: 100,
  height: 100,
  x: 0,
  y: 0,
  layers: [
    {
      name: 'Objects',
      objects: [
        {
          height: 30,
          id: 1,
          name: 'Milk',
          properties: [
            {
              name: 'ingredientName',
              type: 'string',
              value: 'Milk',
            },
            {
              name: 'type',
              type: 'string',
              value: 'Ingredient',
            },
          ],
          rotation: 0,
          type: 'IngredientArea',
          visible: true,
          width: 30,
          x: 68.2052709019881,
          y: 236.56879595279,
        },
        {
          height: 30,
          id: 2,
          name: 'Steak',
          properties: [
            {
              name: 'ingredientName',
              type: 'string',
              value: 'Steak',
            },
            {
              name: 'type',
              type: 'string',
              value: 'Ingredient',
            },
          ],
          rotation: 0,
          type: 'IngredientArea',
          visible: true,
          width: 30,
          x: 368.335823494518,
          y: 78.5281224631521,
        },
      ],
    },
  ],
} as unknown as ITiledMap;

export default class TestMapStore {
  private _testMap: ITiledMap;

  constructor(map: ITiledMap) {
    this._testMap = map;
  }

  get map(): ITiledMap {
    return this._testMap;
  }
}
