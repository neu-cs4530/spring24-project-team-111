import Player from '../../lib/Player';
import {
  BoundingBox,
  Interactable,
  InteractableCommand,
  InteractableCommandReturnType,
  TownEmitter,
  UndercookedIngredient,
} from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';

/**
 * IngredientArea represents an interactable area in Undercooked town that players can interact with,
 * specifically to add an ingredient to the current assembled.
 */
export default class IngredientArea extends InteractableArea {
  private _ingredientName: UndercookedIngredient;

  constructor(
    name: string,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
    ingredientName: UndercookedIngredient,
  ) {
    super(name, coordinates, townEmitter);
    this._ingredientName = ingredientName;
  }

  public toModel(): Interactable {
    throw new Error('Method not implemented.');
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    throw new Error('Method not implemented.');
  }
}
