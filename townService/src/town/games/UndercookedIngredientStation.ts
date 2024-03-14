import {
  UndercookedIngredient,
  UndercookedPlayer,
  UndercookedStation,
  UndercookedStationID,
  UndercookedStationType,
} from '../../types/CoveyTownSocket';

export default class UndercookedIngredientStation implements UndercookedStation {
  id: UndercookedStationID;

  type: UndercookedStationType;

  friendlyName: string;

  ingredient: UndercookedIngredient;

  public invoke(player: UndercookedPlayer): void {
    player.holding = this.ingredient;
  }

  constructor(id: UndercookedStationID, ingredient: UndercookedIngredient, friendlyName: string) {
    this.id = id;
    this.type = 'Ingredient';
    this.ingredient = ingredient;
    this.friendlyName = friendlyName;
  }
}
