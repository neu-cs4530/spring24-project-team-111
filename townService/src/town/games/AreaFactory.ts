import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import { BoundingBox, TownEmitter, UndercookedIngredient } from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import UndercookedArea from '../UndercookedArea';
import AssemblyArea from '../undercookedTown/AssemblyArea';
import IngredientArea from '../undercookedTown/IngredientArea';
import TrashArea from '../undercookedTown/TrashArea';
import ConnectFourGameArea from './ConnectFourGameArea';
import TicTacToeGameArea from './TicTacToeGameArea';

/**
 * Creates one fo the following areas from a map object:
 * - TicTacToe
 * - ConnectFour
 * - Undercooked
 * - Ingredient (specific to Undercooked town)
 * - Assembly (specific to Undercooked town)
 * - Trash (specific to Undercooked town)
 *
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
  if (type === 'Undercooked') {
    return new UndercookedArea(name, rect, broadcastEmitter);
  }
  if (type === 'Ingredient') {
    const ingredientName = mapObject.properties?.find(prop => prop.name === 'ingredientName')
      ?.value as UndercookedIngredient;
    return new IngredientArea(name, rect, broadcastEmitter, ingredientName);
  }
  if (type === 'Assembly') {
    return new AssemblyArea(name, rect, broadcastEmitter);
  }
  if (type === 'Trash') {
    return new TrashArea(name, rect, broadcastEmitter);
  }
  throw new Error(`Unknown game area type ${mapObject.class}`);
}
