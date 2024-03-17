import GenericGameArea from '../GenericGameArea';
import { KnownInteractableTypes } from '../Interactable';

/**
 * An UndercookedArea is an InteractableArea on the map that can host an Undercooked game.
 * At any given point in time, there is at most one Undercooked game in progress in an UndercookedArea.
 */
export default class UndercookedArea extends GenericGameArea {
  public getType(): KnownInteractableTypes {
    return 'undercookedArea';
  }
}
