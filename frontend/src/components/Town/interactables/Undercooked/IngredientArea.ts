import Interactable, { KnownInteractableTypes } from '../../Interactable';

export default class IngredientArea extends Interactable {
  getType(): KnownInteractableTypes {
    throw new Error('Method not implemented.');
  }
}
