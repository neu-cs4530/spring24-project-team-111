import Interactable, { KnownInteractableTypes } from '../../Interactable';

export default class AssemblyArea extends Interactable {
  getType(): KnownInteractableTypes {
    throw new Error('Method not implemented.');
  }
}
