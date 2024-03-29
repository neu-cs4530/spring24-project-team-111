import _ from 'lodash';
import {
  CoveyTownSocket,
  InteractableID,
  PlayerLocation,
  UndercookedArea as UndercookedAreaModel,
} from '../../types/CoveyTownSocket';
import TownController from '../TownController';
import UndercookedTownController, { UndercookedTownEvents } from '../UndercookedTownController';
import { GameEventTypes } from './GameAreaController';
import InteractableAreaController from './InteractableAreaController';

export type UndercookedAreaEvents = GameEventTypes & UndercookedTownEvents;

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

  private _townController: TownController;

  constructor(
    id: InteractableID,
    undercookedAreaModel: UndercookedAreaModel,
    townController: TownController,
    socket: CoveyTownSocket,
  ) {
    super(id);
    this._undercookedTownController = new UndercookedTownController(
      id,
      undercookedAreaModel,
      townController,
      socket,
    );
    this._townController = townController;
  }

  public get undercookedTownController(): UndercookedTownController {
    return this._undercookedTownController;
  }

  public get playerOne() {
    return this._undercookedTownController.playerOne;
  }

  public get playerTwo() {
    return this._undercookedTownController.playerTwo;
  }

  public get status() {
    const status = this._undercookedTownController.status;
    if (!status) {
      return 'WAITING_FOR_PLAYERS';
    }
    return status;
  }

  public set spawnLocation(location: PlayerLocation) {
    this._undercookedTownController.spawnLocation = location;
  }

  public async joinGame() {
    await this._undercookedTownController.joinGame();
  }

  public async leaveGame() {
    this._undercookedTownController.leaveGame();
  }

  public async startGame() {
    await this._undercookedTownController.startGame();
  }

  toInteractableAreaModel(): UndercookedAreaModel {
    return this._undercookedTownController.model;
  }

  protected _updateFrom(newModel: UndercookedAreaModel): void {
    const gameEnding =
      this._undercookedTownController.model.status === 'IN_PROGRESS' && newModel.status === 'OVER';
    const newPlayers =
      newModel.players?.map(playerID => this._townController.getPlayer(playerID)) ?? [];
    if (!newPlayers && this._undercookedTownController.players.length > 0) {
      this._undercookedTownController.players = [];
      this.emit('playersChange', []);
    }
    if (
      this._undercookedTownController.players.length !== newModel.players?.length ||
      _.xor(newPlayers, this._undercookedTownController.players).length > 0
    ) {
      this._undercookedTownController.players = newPlayers;
      this.emit('playersChange', newPlayers);
    }
    this._undercookedTownController.model = newModel;
    this.emit('gameUpdated');

    if (gameEnding) {
      this.emit('gameEnd');
    }
  }

  /**
   * Returns true if the game is not empty and the game is not waiting for players
   * @returns boolean representing if the game is active
   */
  public isActive(): boolean {
    return !this.isEmpty() && this.status && this.status !== 'OVER';
  }

  public get friendlyName(): string {
    return this.id;
  }

  public get type(): string {
    throw new Error('Method not implemented.');
  }
}
