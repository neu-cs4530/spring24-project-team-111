import InvalidParametersError, {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  InteractableType,
  InteractableCommand,
  InteractableCommandReturnType,
  GameInstance,
  UndercookedGameState,
} from '../../types/CoveyTownSocket';
import GameArea from './GameArea';
import UndercookedGame from './UndercookedGame';

// todo: handle move
/**
 * Handle a command from a player in this game area.
 * Supported commands:
 * - JoinGame (joins the game `this._game`, or creates a new one if none is in progress)
 * - GameMove (applies a move to the game)
 * - LeaveGame (leaves the game)
 *
 * If the command is successful (does not throw an error), calls this._emitAreaChanged (necessary
 * to notify any listeners of a state update, including any change to history)
 * If the command is unsuccessful (throws an error), the error is propagated to the caller
 *
 * @see InteractableCommand
 *
 * @param command command to handle
 * @param player player making the request
 * @returns response to the command, @see InteractableCommandResponse
 * @throws InvalidParametersError if the command is not supported or is invalid. Invalid commands:
 *  - LeaveGame and GameMove: No game in progress (GAME_NOT_IN_PROGRESS_MESSAGE),
 *        or gameID does not match the game in progress (GAME_ID_MISSMATCH_MESSAGE)
 *  - Any command besides LeaveGame, GameMove and JoinGame: INVALID_COMMAND_MESSAGE
 */
export default class UndercookedGameArea extends GameArea<UndercookedGame> {
  protected getType(): InteractableType {
    return 'UndercookedArea';
  }

  private _stateUpdated(updatedState: GameInstance<UndercookedGameState>) {
    this._emitAreaChanged();
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'JoinGame') {
      let game = this._game;
      if (!game || game.state.status === 'OVER') {
        game = new UndercookedGame();
        this._game = game;
      }
      game.join(player);
      this._stateUpdated(game.toModel());
      return { gameID: game.id } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'LeaveGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
      }
      game.leave(player);
      this._stateUpdated(game.toModel());
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }
}
