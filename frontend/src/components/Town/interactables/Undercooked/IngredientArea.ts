import UndercookedTownController from '../../../../classes/UndercookedTownController';
import { UndercookedIngredient } from '../../../../types/CoveyTownSocket';
import Interactable, { KnownInteractableTypes } from '../../Interactable';

/**
 * IngredientArea represents an "interactable" area in the Undercooked Phaser game world.
 * It is used to interact with ingredients in the Undercooked game.
 */
export default class IngredientArea extends Interactable {
  getType(): KnownInteractableTypes {
    return 'ingredientArea';
  }

  /**
   * Callback invoked by Phaser once the interactable is added to the scene. Before the
   * interactable is added to the scene, some fields may not yet be computed (such as the
   * size of this sprite).
   */
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

  /**
   * Invoked when the player is overlapping with this interactable and first
   * presses the spacebar
   */
  interact() {
    // we can safely cast town controller to be UndercookedTownController since
    // the IngredientArea is only used in the Undercooked game
    (this.townController as UndercookedTownController).makeMove(this.name as UndercookedIngredient);
  }
}
