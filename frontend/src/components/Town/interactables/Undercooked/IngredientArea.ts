import UndercookedTownController from '../../../../classes/UndercookedTownController';
import { UndercookedIngredient } from '../../../../types/CoveyTownSocket';
import Interactable, { KnownInteractableTypes } from '../../Interactable';

/**
 * Represents an "interactable" area in the Phaser game world that is used to interact with ingredients in the Undercooked game.
 * The player can interact with this area by pressing the spacebar when they are overlapping with it.
 */
export default class IngredientArea extends Interactable {
  getType(): KnownInteractableTypes {
    return 'ingredientArea';
  }

  addedToScene() {
    super.addedToScene();
    this.setTintFill();
    this.setAlpha(0.3);

    this.setDepth(-1);
    this.scene.add.text(this.x, this.y, this.name, {
      color: '#FFFFFF',
      backgroundColor: '#000000',
    });
  }

  interact() {
    // we can safely cast town controller to be UndercookedTownController since
    // the IngredientArea is only used in the Undercooked game
    (this.townController as UndercookedTownController).makeMove(this.name as UndercookedIngredient);
  }
}
