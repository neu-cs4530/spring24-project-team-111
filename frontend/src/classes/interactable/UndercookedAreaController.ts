import {
  InteractableID,
  UndercookedArea as UndercookedAreaModel,
} from '../../types/CoveyTownSocket';
import TownController from '../TownController';
import UndercookedTownController, { UndercookedTownEvents } from '../UndercookedTownController';
import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';

export type UndercookedAreaEvents = BaseInteractableEventMap & UndercookedTownEvents;

/**
 * The UndercookedAreaController class is an adapter class that wraps the UndercookedTownController.
 * This class was created so the TownController can add an instance of an InteractableAreaController
 * corresponding to an UndercookedArea in Covey.Town. The actual communication between the frontend
 * and backend of the Undercooked game will be handled by the UndercookedTownController class.
 */
export default class UndercookedAreaController extends InteractableAreaController<
  UndercookedAreaEvents,
  UndercookedAreaModel
> {
  /**
   * The UndercookedTownController that will handle the communication between the Undercooked
   * game's frontend and backend service.
   */
  private _undercookedTownController: UndercookedTownController;

  constructor(
    id: InteractableID,
    undercookedAreaModel: UndercookedAreaModel,
    townController: TownController,
  ) {
    super(id);
    this._undercookedTownController = new UndercookedTownController(
      id,
      undercookedAreaModel,
      townController,
    );
  }

  public get undercookedTownController(): UndercookedTownController {
    return this._undercookedTownController;
  }

  // just a stub to satisfy UndercookedGameScene
  public get players() {
    return [];
  }

  public joinGame() {
    this._undercookedTownController.joinGame();
  }

  public leaveGame() {
    this._undercookedTownController.leaveGame();
  }

  toInteractableAreaModel(): UndercookedAreaModel {
    throw new Error('Method not implemented.');
  }

  protected _updateFrom(newModel: UndercookedAreaModel): void {
    throw new Error('Method not implemented.');
  }

  public isActive(): boolean {
    throw new Error('Method not implemented.');
  }

  public get friendlyName(): string {
    throw new Error('Method not implemented.');
  }

  public get type(): string {
    throw new Error('Method not implemented.');
  }
}
