import assert from 'assert';
import { BroadcastOperator } from 'socket.io';
import { ITiledMap, ITiledMapObjectLayer } from '@jonbell/tiled-map-type-guard';
import { SocketReservedEventsMap } from 'socket.io/dist/socket';
import { ReservedOrUserEventNames } from 'socket.io/dist/typed-events';
import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  GAME_NOT_STARTABLE_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  ClientToServerEvents,
  CoveyTownSocket,
  GameInstanceID,
  GameMove,
  InteractableCommand,
  InteractableCommandBase,
  PlayerLocation,
  ServerToClientEvents,
  SocketData,
  UndercookedGameState,
  UndercookedIngredient,
  UndercookedMove,
  UndercookedRecipe,
} from '../../types/CoveyTownSocket';
import UndercookedPlayer from '../../lib/UndercookedPlayer';
import { logError } from '../../Utils';
import InteractableArea from '../InteractableArea';
import AreaFactory from '../games/AreaFactory';
import MapStore from '../../lib/MapStore';

type RoomEmitter = BroadcastOperator<ServerToClientEvents, SocketData>;
type ClientSocket = CoveyTownSocket;
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type EventHandler = (param: any) => void;
type EventMessageAndHandler = [string, EventHandler];
type EventName = ReservedOrUserEventNames<SocketReservedEventsMap, ClientToServerEvents>;

/**
 * The UndercookedTown class implements the logic for an Undercooked game: managing the various
 * events that can occur (e.g. joining a game, leaving a game, moving around in the undercooked town, etc.)
 *
 * The implementation of this class will be similar to Town.ts in the townService directory but tweaked
 * for Undercooked game rules and mechanics.
 */
export default class UndercookedTown {
  private readonly _id: GameInstanceID;

  private _broadcastEmitter: RoomEmitter;

  private _state: UndercookedGameState;

  private _players: Player[] = [];

  private _stations: InteractableArea[] = [];

  private _clientSockets: Map<string, ClientSocket> = new Map();

  private _handlers: Map<string, EventMessageAndHandler[]> = new Map();

  private _inGamePlayerModels = new Map<string, UndercookedPlayer>();

  public get players(): Player[] {
    return this._players;
  }

  public get occupancy(): number {
    return this.players.length;
  }

  public get townID(): string {
    return this._id;
  }

  public get interactables(): InteractableArea[] {
    return this._stations;
  }

  public get state(): UndercookedGameState {
    return this._state;
  }

  public set state(newState: UndercookedGameState) {
    this._state = newState;
  }

  constructor(townID: string, broadcastEmitter: RoomEmitter) {
    this._id = townID;
    this._broadcastEmitter = broadcastEmitter;
    this._state = {
      instanceID: townID,
      status: 'WAITING_FOR_PLAYERS',
      playerOne: undefined,
      playerTwo: undefined,
      playerOneReady: false,
      playerTwoReady: false,
      currentRecipe: this._generateRecipe(),
      currentAssembled: [],
      timeRemaining: 0,
      score: 0,
    };
  }

  /**
   * Joins a player to the game.
   * - Assigns the player to a player 1 or player 2.
   * - If both players are now assigned, updates the game status to WAITING_TO_START.
   *
   * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
   * @throws InvalidParametersError if the game is full (GAME_FULL_MESSAGE)
   *
   * @param player the player to join the game
   */
  public join(player: Player, socket: ClientSocket): void {
    if (this.state.playerOne === player.id || this.state.playerTwo === player.id) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (!this.state.playerOne) {
      this.state = {
        ...this.state,
        status: 'WAITING_FOR_PLAYERS',
        playerOne: player.id,
      };
    } else if (!this.state.playerTwo) {
      this.state = {
        ...this.state,
        status: 'WAITING_FOR_PLAYERS',
        playerTwo: player.id,
      };
    } else {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }
    this._players.push(player);
    this._clientSockets.set(player.id, socket);
    if (this.state.playerOne && this.state.playerTwo) {
      this.state.status = 'WAITING_TO_START';
    }
  }

  /**
   * Removes a player from the game and disconnects the socket if the game is in progress.
   * Updates the game's state to reflect the player leaving.
   *
   * If the game state is currently "IN_PROGRESS", updates the game's status to OVER and disconnects all players.
   *
   * If the game state is currently "WAITING_TO_START", updates the game's status to WAITING_FOR_PLAYERS.
   *
   * If the game state is currently "WAITING_FOR_PLAYERS" or "OVER", the game status is unchanged.
   *
   * @param player The player to remove from the game
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   */
  public leave(player: Player): void {
    const gameStatus = this.state.status;
    if (gameStatus === 'OVER') {
      return;
    }
    this._removePlayer(player);
    if (gameStatus === 'IN_PROGRESS') {
      this.state = {
        ...this.state,
        status: 'OVER',
      };
    } else if (gameStatus === 'WAITING_TO_START' || gameStatus === 'WAITING_FOR_PLAYERS') {
      this.state = {
        ...this.state,
        status: 'WAITING_FOR_PLAYERS',
      };
    } else {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
  }

  /**
   * Indicates that a player is ready to start the game.
   *
   * Updates the game state to indicate that the player is ready to start the game.
   *
   * If both players are ready, the game will start.
   *
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   * @throws InvalidParametersError if the game is not in the WAITING_TO_START state (GAME_NOT_STARTABLE_MESSAGE)
   *
   * @param player The player who is ready to start the game
   */
  public startGame(player: Player): void {
    const newState = { ...this.state };
    if (this.state.status !== 'WAITING_TO_START') {
      throw new InvalidParametersError(GAME_NOT_STARTABLE_MESSAGE);
    }
    if (this.state.playerOne !== player.id && this.state.playerTwo !== player.id) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    if (this.state.playerOne === player.id) {
      newState.playerOneReady = true;
    }
    if (this.state.playerTwo === player.id) {
      newState.playerTwoReady = true;
    }
    const ready = newState.playerOneReady && newState.playerTwoReady;
    this.state = {
      ...newState,
      status: ready ? 'IN_PROGRESS' : 'WAITING_TO_START',
    };
    if (ready) {
      // need to initialize ingame model before calling handlers.
      // otherwise, the handlers will not be able to find the player model.
      this._initInGamePlayerModels();
      this._initializeFromMap(MapStore.getInstance().map);
      this._initHandlers();
    }
  }

  public applyMove(move: GameMove<UndercookedMove>) {
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }

    if (move.playerID !== this.state.playerOne && move.playerID !== this.state.playerTwo) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }

    this.state = {
      ...this.state,
      currentAssembled: [...this.state.currentAssembled, move.move.gamePiece],
    };

    // if the currentAssembled recipe matches the currentRecipe
    // update the currentRecipe with a new one and reset the currentAssembled
    // [TODO]: add to score
    if (
      this.state.currentRecipe.every(ingredient => this.state.currentAssembled.includes(ingredient))
    ) {
      const newRecipe = this._generateRecipe();
      this.state = {
        ...this.state,
        currentRecipe: newRecipe,
        currentAssembled: [],
      };
    }
  }

  private _initInGamePlayerModels() {
    this._players.forEach(player => {
      this._initInGamePlayerModel(player);
    });
  }

  private _initInGamePlayerModel(player: Player) {
    const newPlayer = new UndercookedPlayer(player.userName, player.id);
    this._inGamePlayerModels.set(player.id, newPlayer);
  }

  private _initHandler(
    socket: CoveyTownSocket,
    event: EventName,
    id: string,
    handler: EventHandler,
  ) {
    socket.on(event, handler);
    if (!this._handlers.has(id)) {
      this._handlers.set(id, []);
    }
    (this._handlers.get(id) as EventMessageAndHandler[]).push([event, handler]);
  }

  private _initHandlers(): void {
    this._clientSockets.forEach((socket, playerID) => {
      const move: EventHandler = (movementData: PlayerLocation) => {
        try {
          const player = this._players.find(p => p.id === playerID);
          assert(player);
          const inGamePlayerModel = this._inGamePlayerModels.get(playerID);
          assert(inGamePlayerModel);
          inGamePlayerModel.location = movementData;
          this._broadcastEmitter.emit('ucPlayerMoved', inGamePlayerModel.toPlayerModel());
        } catch (err) {
          logError(err);
        }
      };

      const onCommand = (command: InteractableCommand & InteractableCommandBase) => {
        const interactable = this._stations.find(
          eachStation => eachStation.id === command.interactableID,
        );
        if (interactable) {
          try {
            const player = this._players.find(p => p.id === playerID);
            assert(player);
            const inGamePlayerModel = this._inGamePlayerModels.get(playerID);
            assert(inGamePlayerModel);
            const payload = interactable.handleCommand(
              command,
              inGamePlayerModel as unknown as Player,
              socket,
            );
            socket.emit('commandResponse', {
              commandID: command.commandID,
              interactableID: command.interactableID,
              isOK: true,
              payload,
            });
          } catch (err) {
            if (err instanceof InvalidParametersError) {
              socket.emit('commandResponse', {
                commandID: command.commandID,
                interactableID: command.interactableID,
                isOK: false,
                error: err.message,
              });
            } else {
              logError(err);
              socket.emit('commandResponse', {
                commandID: command.commandID,
                interactableID: command.interactableID,
                isOK: false,
                error: 'Unknown error',
              });
            }
          }
        } else {
          socket.emit('commandResponse', {
            commandID: command.commandID,
            interactableID: command.interactableID,
            isOK: false,
            error: `No such interactable ${command.interactableID}`,
          });
        }
      };
      this._initHandler(socket, 'ucPlayerMovement', playerID, move);
      this._initHandler(socket, 'interactableCommand', playerID, onCommand);
    });
  }

  private _cleanupHandlers(player: Player) {
    if (this._handlers.has(player.id)) {
      (this._handlers.get(player.id) as EventMessageAndHandler[]).forEach(eventAndHandler => {
        const [event, handler] = eventAndHandler;
        this._clientSockets.get(player.id)?.removeListener(event, handler);
      });
    }
  }

  private _removePlayer(player: Player): void {
    if (this.state.playerOne !== player.id && this.state.playerTwo !== player.id) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    if (this.state.playerOne === player.id) {
      this.state = {
        ...this.state,
        playerOne: undefined,
        playerOneReady: false,
      };
    } else {
      this.state = {
        ...this.state,
        playerTwo: undefined,
        playerTwoReady: false,
      };
    }
    this._players = this._players.filter(p => p.id !== player.id);
    if (this._handlers.has(player.id)) {
      this._cleanupHandlers(player);
      this._handlers.delete(player.id);
    }
    this._clientSockets.delete(player.id);
    this._inGamePlayerModels.delete(player.id);
  }

  private _validateStations() {
    // Make sure that the IDs are unique
    const interactableIDs = this._stations.map(eachInteractable => eachInteractable.id);
    if (
      interactableIDs.some(
        item => interactableIDs.indexOf(item) !== interactableIDs.lastIndexOf(item),
      )
    ) {
      throw new Error(
        `Expected all interactable IDs to be unique, but found duplicate interactable ID in ${interactableIDs}`,
      );
    }
    // Make sure that there are no overlapping objects
    for (const station of this._stations) {
      for (const otherStation of this._stations) {
        if (station !== otherStation && station.overlaps(otherStation)) {
          throw new Error(
            `Expected interactables not to overlap, but found overlap between ${station.id} and ${otherStation.id}`,
          );
        }
      }
    }
  }

  private _initializeFromMap(map: ITiledMap) {
    const objectLayer = map.layers.find(
      eachLayer => eachLayer.name === 'Objects',
    ) as ITiledMapObjectLayer;
    if (!objectLayer) {
      throw new Error('Unable to find objects layer in map');
    }

    const ingredientArea = objectLayer.objects
      .filter(eachObject => eachObject.type === 'IngredientArea')
      .map(eachIngredientArea => AreaFactory(eachIngredientArea, this._broadcastEmitter));

    this._stations = this._stations.concat(ingredientArea);
    this._validateStations();
  }

  private _generateRecipe(): UndercookedRecipe {
    const ingredientBank: UndercookedIngredient[] = [
      'Milk',
      'Salad',
      'Fries',
      'Rice',
      'Steak',
      'Egg',
    ];

    const recipe: UndercookedRecipe = [];

    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * ingredientBank.length);
      recipe.push(ingredientBank[randomIndex]);

      // remove the chosen ingredient from the array to avoid duplicate ingredients in the recipe
      ingredientBank.splice(randomIndex, 1);
    }

    return recipe;
  }
}
