import GenericGameArea from '../GenericGameArea';
import { KnownInteractableTypes } from '../Interactable';

export default class GameArea extends GenericGameArea {
  getType(): KnownInteractableTypes {
    return 'gameArea';
  }
}
