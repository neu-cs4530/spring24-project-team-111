import Player from '../../lib/Player';
import {
  BoundingBox,
  IngredientArea as IngredientAreaModel,
  InteractableCommand,
  InteractableCommandReturnType,
  TownEmitter,
  UndercookedIngredient,
} from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';

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

  public toModel(): IngredientAreaModel {
    throw new Error('Method not implemented.');
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    throw new Error('Method not implemented.');
  }
}
