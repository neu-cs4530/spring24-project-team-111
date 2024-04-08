import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import { nanoid } from 'nanoid';
import InvalidParametersError, {
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  BoundingBox,
  CoveyTownSocket,
  InteractableCommand,
  InteractableCommandReturnType,
  TownEmitter,
  UndercookedArea as UndercookedAreaModel,
} from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import UndercookedTown from './UndercookedTown';

/**
 * The UndercookedArea class is responsible for handling the commands receieved from the frontend.
 *
 * Commands from the frontend can be:
 *   - JoinGame: Join the game
 *   - LeaveGame: Leave the game
 *   - StartGame: Start the game
 *   - GameMove: Make a move in the game (i.e. add an ingredient)
 *
 * The UndercookedArea holds the UndercookedTown object so
 * when it receives a command, it'll invoke the appropriate function in the UndercookedTown object.
 */
export default class UndercookedArea extends InteractableArea {
  private _game = new UndercookedTown(
    nanoid(),
    this._townEmitter,
    this._emitAreaChanged.bind(this),
  );

  public get game(): UndercookedTown {
    return this._game;
  }

  public set game(newGame: UndercookedTown) {
    this._game = newGame;
  }

  public get isActive(): boolean {
    return true;
  }

  public toModel(): UndercookedAreaModel {
    return {
      type: 'UndercookedArea',
      id: this.id,
      occupants: this.occupantsByID,
      players: this.game.players.map(player => player.id),
      inGameModels: this.game.inGamePlayerModels.map(player => player.toPlayerModel()),
      ...this.game.state,
    };
  }

  /**
   * Handle a command from a player in the Undercooked game.
   * Supported commands:
   *   - JoinGame (joins the game `this._game`, or creates a new one if none is in progress)
   *   - LeaveGame (leaves the game)
   *   - StartGame (indicates that the player is ready to start the game)
   *   - GameMove (applies a move to the game)
   *
   * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
   * to notify any listeners of a state update, including any change to history)
   * If the command is unsuccessful (throws an error), the error is propagated to the caller
   *
   * @see InteractableCommand
   *
   * @param command command to handle
   * @param player player making the request
   * @param socket socket of the player (when a player joins an Undercooked game, the socket is used to emit Undercooked-specific events to the player)
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is invalid
   * Invalid commands:
   *   - GameMove, StartGame and LeaveGame: if the game is not in progress (GAME_NOT_IN_PROGRESS_MESSAGE)
   *   - Any command besides JoinGame, GameMove, StartGame and LeaveGame: INVALID_COMMAND_MESSAGE
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
    socket: CoveyTownSocket,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'JoinGame') {
      if (!this.game || this.game.state.status === 'OVER') {
        // no game in progress or game is over, make a new one
        this.game = new UndercookedTown(
          nanoid(),
          this._townEmitter,
          this._emitAreaChanged.bind(this),
        );
      }
      this.game.join(player, socket);
      this._emitAreaChanged();

      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'LeaveGame') {
      if (!this.game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      this.game.leave(player);
      this._emitAreaChanged();

      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'StartGame') {
      if (!this.game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      this.game.startGame(player);
      this._emitAreaChanged();

      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'GameMove') {
      if (!this.game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }

      const { gamePiece } = command.move;
      if (
        gamePiece !== 'Egg' &&
        gamePiece !== 'Fries' &&
        gamePiece !== 'Milk' &&
        gamePiece !== 'Rice' &&
        gamePiece !== 'Salad' &&
        gamePiece !== 'Steak'
      ) {
        throw new InvalidParametersError('Invalid game piece');
      }

      this.game.applyMove({
        gameID: command.gameID,
        playerID: player.id,
        move: command.move,
      });
      this._emitAreaChanged();

      return undefined as InteractableCommandReturnType<CommandType>;
    }

    if (this.game.state.timeRemaining === 0) {
      this._emitAreaChanged();
    }

    // add interactable mesages for the game.
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }

  /**
   * Creates a new UndercookedArea object that will represent a Conversation Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this conversation area exists
   * @param broadcastEmitter An emitter that can be used by this undercooked area to broadcast updates
   * @returns
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): UndercookedArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed undercooked area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new UndercookedArea(name, rect, broadcastEmitter);
  }
}
