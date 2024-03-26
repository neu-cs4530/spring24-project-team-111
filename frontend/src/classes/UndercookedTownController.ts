import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { PlayerLocation, UndercookedTownSocket } from '../types/CoveyTownSocket';
import Interactable from '../components/Town/Interactable';
import TownController, { TownEvents } from './TownController';
import { UndercookedArea as UndercookedAreaModel } from '../types/CoveyTownSocket';
import { io } from 'socket.io-client';
import assert from 'assert';
import { InteractableID } from '../generated/client';
import PlayerController from './PlayerController';

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

  private _ourPlayer?: PlayerController;

  private _townController: TownController;

  private _id: InteractableID;

  /**
   * A flag indicating whether the current 2D game is paused, or not. Pausing the game will prevent it from updating,
   * and will also release any key bindings, allowing all keys to be used for text entry or other purposes.
   */
  private _paused = false;

  /**
   * An event emitter that broadcasts interactable-specific events
   */
  private _interactableEmitter = new EventEmitter();

  constructor(id: InteractableID, model: UndercookedAreaModel, townController: TownController) {
    super();
    this._model = model;
    this._townController = townController;
    this._id = id;
  }

  // Our player should be the in-game player the client controls.
  // used in WalkableScene.ts
  get ourPlayer() {
    // this is a stub. Replace with the actual player object.
    const player = this._townController.ourPlayer;
    assert(player);
    return player;
  }

  get paused() {
    return this._paused;
  }

  get players() {
    // this is a stub, it should return the list of players in the game.
    return this._townController.players;
  }

  public pause(): void {
    if (!this._paused) {
      this._paused = true;
      this.emit('pause');
    }
  }

  public unPause(): void {
    if (this._paused) {
      this._paused = false;
      this.emit('unPause');
    }
  }

  /**
   * Sends a request to the server to join the current game in the game area, or create a new one if there is no game in progress.
   *
   * @throws An error if the server rejects the request to join the game.
   */
  public async joinGame(coveyTownID: string) {
    const response = await this._townController.sendInteractableCommand(this._id, {
      type: 'JoinUndercookedGame',
      coveyTownID: coveyTownID,
    });
    console.log('joinGame response:', this._model);
    this._model = response;
    console.log('joinGame response:', this._model);
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

  /**
   * Begin interacting with an interactable object. Emits an event to all listeners.
   * @param interactedObj
   */
  public interact<T extends Interactable>(interactedObj: T) {
    this._interactableEmitter.emit(interactedObj.getType(), interactedObj);
  }

  public async connect(townID: string) {
    return new Promise<void>(resolve => {
      const url = process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL;
      assert(url);
      this._socket = io(`${url}/undercooked`, {
        query: {
          townID,
        },
      });
      resolve();
    });
  }
}
