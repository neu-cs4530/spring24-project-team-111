import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { CoveyTownSocket, PlayerLocation, UndercookedIngredient } from '../types/CoveyTownSocket';
import Interactable from '../components/Town/Interactable';
import TownController, { TownEvents } from './TownController';
import { UndercookedArea as UndercookedAreaModel } from '../types/CoveyTownSocket';
import assert from 'assert';
import { InteractableID } from '../generated/client';
import PlayerController from './PlayerController';
import { nanoid } from 'nanoid';

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
  private _socket: CoveyTownSocket;

  private _model: UndercookedAreaModel;

  private _inGamePlayerModel: PlayerController;

  /**
   * The default spawn location for in game player models. Set in Undercooked scene.
   */
  private _spawnLocation?: PlayerLocation;

  private _townController: TownController;

  private _id: InteractableID;

  /**
   * The current list of players in the Undercooked town. Adding or removing players might replace the array
   * with a new one; clients should take note not to retain stale references.
   */
  private _playersInternalUndercooked: PlayerController[] = [];

  /**
   * A flag indicating whether the current 2D game is paused, or not. Pausing the game will prevent it from updating,
   * and will also release any key bindings, allowing all keys to be used for text entry or other purposes.
   */
  private _paused = false;

  /**
   * An event emitter that broadcasts interactable-specific events
   */
  private _interactableEmitter = new EventEmitter();

  constructor(
    id: InteractableID,
    model: UndercookedAreaModel,
    townController: TownController,
    socket: CoveyTownSocket,
  ) {
    super();
    this._model = model;
    this._townController = townController;
    this._id = id;
    this._socket = socket;
    this._inGamePlayerModel = this._defaultInGamePlayerModel();
  }

  public get paused() {
    return this._paused;
  }

  public get interactableEmitter() {
    return this._interactableEmitter;
  }

  public get playerOne() {
    const playerOne = this._model.playerOne;
    return this._playersInternalUndercooked.find(player => player.id === playerOne);
  }

  public get playerTwo() {
    const playerTwo = this._model.playerTwo;
    return this._playersInternalUndercooked.find(player => player.id === playerTwo);
  }

  public get status() {
    return this._model.status;
  }

  public get model() {
    return this._model;
  }

  public set model(model: UndercookedAreaModel) {
    this._model = model;
  }

  public get currentRecipe() {
    return this._model.currentRecipe;
  }

  public get currentAssembled() {
    return this._model.currentAssembled;
  }

  public get inGamePlayerModel() {
    return this._inGamePlayerModel;
  }

  /**
   * Get the player in covey.town, not in Undercooked.
   */
  public get ourPlayer() {
    const player = this._inGamePlayerModel;
    assert(player);
    return player;
  }

  public get players() {
    return this._playersInternalUndercooked;
  }

  public set players(newPlayers: PlayerController[]) {
    this.emit('playersChanged', newPlayers);
    this._playersInternalUndercooked = newPlayers;
  }

  public set spawnLocation(location: PlayerLocation) {
    this._spawnLocation = location;
  }

  /**
   * Sends a request to the server to join the current Undercooked game in the Undercooked area.
   *
   * @throws An error if the server rejects the request to join the game.
   */
  public async joinGame() {
    await this._townController.sendInteractableCommand(this._id, {
      type: 'JoinGame',
    });
  }

  /**
   * Sends a request to the server to leave the current Undercooked game in the Undercooked area.
   */
  public async leaveGame() {
    // we don't use the gameID in the backend, so we can just pass a dummy value
    await this._townController.sendInteractableCommand(this._id, {
      type: 'LeaveGame',
      gameID: 'Undercooked',
    });
    this._inGamePlayerModel = this._defaultInGamePlayerModel();
  }

  /**
   * Sends a request to the server to start the game. Indicates the player is ready to start the game.
   *
   * If the game is not in the WAITING_TO_START state, throws an error.
   *
   * @throws an error with message NO_GAME_STARTABLE if there is no game waiting to start
   */
  public async startGame() {
    // we don't use the gameID in the backend, so we can just pass a dummy value
    await this._townController.sendInteractableCommand(this._id, {
      type: 'StartGame',
      gameID: 'Undercooked',
    });
  }

  /**
   * Sends a request to the server to update the current assembled recipe with the
   * ingredient at the ingredient area the player interacted with.
   *
   * Does not check if the move is valid (i.e. if the ingredient is included in the current recipe).
   *
   * @throws an error with message NO_GAME_IN_PROGRESS_ERROR if there is no game in progress
   *
   * @param ingredient the ingredient area the player interacted with
   */
  public async makeMove(ingredient: UndercookedIngredient) {
    // we don't use the gameID in the backend, so we can just pass a dummy value
    await this._townController.sendInteractableCommand(this._id, {
      type: 'GameMove',
      gameID: 'Undercooked',
      move: {
        gamePiece: ingredient,
      },
    });
  }

  public pause(): void {
    if (!this._paused) {
      this._paused = true;
      this.emit('ucPause');
    }
  }

  public unPause(): void {
    if (this._paused) {
      this._paused = false;
      this.emit('ucUnPause');
    }
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
    this._socket.emit('ucPlayerMovement', newLocation);
    const player = this._inGamePlayerModel;
    assert(player);
    player.location = newLocation;
  }

  /**
   * Begin interacting with an interactable object. Emits an event to all listeners.
   * @param interactedObj
   */
  public interact<T extends Interactable>(interactedObj: T) {
    this._interactableEmitter.emit(interactedObj.getType(), interactedObj);
  }

  private _defaultInGamePlayerModel() {
    // the values may be undefined when server starts so we add default values.
    const spawnLoc = this._spawnLocation || { x: 0, y: 0, rotation: 'front', moving: false };
    try {
      const id = this._townController.ourPlayer.id || nanoid();
      const userName = this._townController.ourPlayer.userName || 'default';
      return new PlayerController(id, userName, spawnLoc);
    } catch (e) {
      return new PlayerController('default', 'default', spawnLoc);
    }
  }
}
