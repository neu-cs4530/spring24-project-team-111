import { UndercookedIngredient } from '../../../../types/CoveyTownSocket';
import Interactable, { KnownInteractableTypes } from '../../Interactable';

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
    console.log('interacting with ingredient area:', this.name);
    this.townController.sendInteractableCommand(this.id, {
      type: 'GameMove',
      gameID: 'Undercooked',
      move: {
        gamePiece: this.name as UndercookedIngredient,
      },
    });
  }
}
