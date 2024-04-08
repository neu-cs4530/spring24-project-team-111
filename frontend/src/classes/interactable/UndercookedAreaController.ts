import assert from 'assert';
import _ from 'lodash';
import {
  CoveyTownSocket,
  InteractableID,
  UndercookedArea as UndercookedAreaModel,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import UndercookedTownController, { UndercookedTownEvents } from '../UndercookedTownController';
import { GameEventTypes } from './GameAreaController';
import InteractableAreaController, { UNDERCOOKED_AREA_TYPE } from './InteractableAreaController';

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

  public get currentRecipe() {
    return this._undercookedTownController.currentRecipe;
  }

  public get currentAssembled() {
    return this._undercookedTownController.currentAssembled;
  }

  public get currentScore() {
    return this._undercookedTownController.currentScore;
  }

  public async joinGame() {
    await this._undercookedTownController.joinGame();
  }

  public async leaveGame() {
    await this._undercookedTownController.leaveGame();
  }

  public async startGame() {
    await this._undercookedTownController.startGame();
  }

  toInteractableAreaModel(): UndercookedAreaModel {
    return this._undercookedTownController.model;
  }

  protected _updateFrom(newModel: UndercookedAreaModel): void {
    const townController = this.undercookedTownController.townController;
    const gameInProgress = this._undercookedTownController.model.status === 'IN_PROGRESS';

    const gameEnded = gameInProgress && newModel.status === 'OVER';
    const newPlayers = newModel.players?.map(playerID => townController.getPlayer(playerID)) ?? [];
    const newInGamePlayers = newModel.inGameModels?.map(playerModel =>
      PlayerController.fromPlayerModel(playerModel),
    );

    if (!newPlayers && this._undercookedTownController.players.length > 0) {
      this._undercookedTownController.players = [];
      this._undercookedTownController.inGamePlayers = [];
    }
    if (
      this._undercookedTownController.players.length !== newModel.players?.length ||
      _.xor(newPlayers, this._undercookedTownController.players).length > 0
    ) {
      this._undercookedTownController.players = newPlayers;
      assert(newInGamePlayers);
      this._undercookedTownController.inGamePlayers = newInGamePlayers;
    }
    this._undercookedTownController.model = newModel;
    this.emit('gameUpdated');

    if (gameEnded) {
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
    return UNDERCOOKED_AREA_TYPE;
  }

  public pause() {
    this._undercookedTownController.pause();
  }

  public unPause() {
    this._undercookedTownController.unPause();
  }
}
