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

  public get playerOne() {
    const playerOne = this._undercookedTownController.playerOne;
    if (playerOne) {
      return this.occupants.find(eachOccupant => eachOccupant.id === playerOne);
    }
    return undefined;
  }

  public get playerTwo() {
    const playerTwo = this._undercookedTownController.playerTwo;
    if (playerTwo) {
      return this.occupants.find(eachOccupant => eachOccupant.id === playerTwo);
    }
    return undefined;
  }

  public get status() {
    const status = this._undercookedTownController.status;
    if (!status) {
      return 'WAITING_FOR_PLAYERS';
    }
    return status;
  }

  public async joinGame() {
    this._undercookedTownController.joinGame();
  }

  public async leaveGame() {
    this._undercookedTownController.leaveGame();
  }

  public async startGame() {
    this._undercookedTownController.startGame();
  }

  toInteractableAreaModel(): UndercookedAreaModel {
    return this._undercookedTownController.model;
  }

  protected _updateFrom(newModel: UndercookedAreaModel): void {
    throw new Error('Method not implemented.');
  }

  /**
   * Returns true if the game is not empty and the game is not waiting for players
   * @returns boolean representing if the game is active
   */
  public isActive(): boolean {
    return !this.isEmpty() && this.status !== 'WAITING_FOR_PLAYERS';
  }

  public get friendlyName(): string {
    return this.id;
  }

  public get type(): string {
    throw new Error('Method not implemented.');
  }
}
