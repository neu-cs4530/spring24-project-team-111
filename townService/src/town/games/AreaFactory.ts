import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import { BoundingBox, TownEmitter, UndercookedIngredient } from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import IngredientArea from '../undercooked/IngredientArea';
// import UndercookedArea from '../undercooked/UndercookedArea';
import ConnectFourGameArea from './ConnectFourGameArea';
import TicTacToeGameArea from './TicTacToeGameArea';

/**
 * Creates a new GameArea from a map object
 * @param mapObject the map object to create the game area from
 * @param broadcastEmitter a broadcast emitter that can be used to emit updates to players
 * @returns the interactable area
 * @throws an error if the map object is malformed
 */
export default function AreaFactory(
  mapObject: ITiledMapObject,
  broadcastEmitter: TownEmitter,
): InteractableArea {
  const { name, width, height } = mapObject;
  if (!width || !height) {
    throw new Error(`Malformed viewing area ${name}`);
  }
  const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
  const type = mapObject.properties?.find(prop => prop.name === 'type')?.value;
  if (type === 'TicTacToe') {
    return new TicTacToeGameArea(name, rect, broadcastEmitter);
  }
  if (type === 'ConnectFour') {
    return new ConnectFourGameArea(name, rect, broadcastEmitter);
  }
  if (type === 'Ingredient') {
    // get the ingredient supplied by the ingredient area
    const ingredient = mapObject.properties?.find(prop => prop.name === 'ingredient')?.value;
    return new IngredientArea(name, rect, broadcastEmitter, ingredient as UndercookedIngredient);
  }
  throw new Error(`Unknown game area type ${mapObject.class}`);
}
