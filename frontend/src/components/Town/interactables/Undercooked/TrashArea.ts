import Interactable, { KnownInteractableTypes } from '../../Interactable';

export default class TrashArea extends Interactable {
  getType(): KnownInteractableTypes {
    throw new Error('Method not implemented.');
  }
}
