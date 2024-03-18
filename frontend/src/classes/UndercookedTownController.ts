import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { PlayerLocation, UndercookedTownSocket } from '../types/CoveyTownSocket';
import TownController, { TownEvents } from './TownController';
import { UndercookedArea as UndercookedAreaModel } from '../types/CoveyTownSocket';
import { io } from 'socket.io-client';
import assert from 'assert';
import { InteractableID } from '../generated/client';

/**
 * The UndercookedTownController emits these events. Components may subscribe to these events
 * by calling the 'addListener' method on UndercookedTownController
 */
export type UndercookedTownEvents = TownEvents;

/**
 * The (frontend) UndercookedTownController manages the communication between the frontend
 * and the backend. When a player joins an Undercooked game, a new UndercookedTownController is created,
 * and frontend components can register to receive events (@see UndercookedTownEvents).
 */
export default class UndercookedTownController extends (EventEmitter as new () => TypedEmitter<UndercookedTownEvents>) {
  /** The socket connection to the townsService. Messages emitted here
   * are received by the TownController in that service.
   */
  private _socket!: UndercookedTownSocket;

  private _model: UndercookedAreaModel;

  private _townController: TownController;

  private _id: InteractableID;

  constructor(id: InteractableID, model: UndercookedAreaModel, townController: TownController) {
    super();
    this._model = model;
    this._townController = townController;
    this._id = id;
  }

  public async connect() {
    return new Promise<void>(resolve => {
      const url = process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL;
      assert(url);
      this._socket = io(`${url}/undercooked`);
      resolve();
    });
  }

  // Our player should be the in-game player the client controls.
  // used in WalkableScene.ts
  public get ourPlayer() {
    // this is a stub. Replace with the actual player object.
    return this._townController.ourPlayer;
  }

  public get players() {
    // this is a stub, it should return the list of players in the game.
    return this._townController.players;
  }

  /**
   * Emit a movement event for the current player, updating the state locally and
   * also notifying the townService that our player moved.
   *
   * Note: it is the responsibility of the townService to set the 'interactableID' parameter
   * of the player's location, and any interactableID set here may be overwritten by the townService
   *
   * @param newLocation
   */
  public emitMovement(newLocation: PlayerLocation) {
    this._socket.emit('playerMovement', newLocation);
    const player = this.ourPlayer;
    assert(player);
    player.location = newLocation;
    this.emit('playerMoved', player);
  }
}
