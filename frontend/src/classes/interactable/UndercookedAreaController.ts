import {
  GameStatus,
  UndercookedGameState,
  // UndercookedMove,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import { ConnectFourEvents } from './ConnectFourAreaController';
import GameAreaController from './GameAreaController';

/**
 * This class is responsible for managing the state of the Undercooked game,
 * and for sending commands to the server
 */
export default class UndercookedAreaController extends GameAreaController<
  UndercookedGameState,
  ConnectFourEvents // this is a stub so that it type checks for now.
> {
  public isActive(): boolean {
    return true;
  }

  /**
   * Returns player 1 from the game, if there is one, or undefined otherwise.
   */
  get playerOne(): PlayerController | undefined {
    return this._playerController(this._model.game?.state.playerOne);
  }

  /**
   * Returns player 2 from the game, if there is one, or undefined otherwise.
   */
  get playerTwo(): PlayerController | undefined {
    return this._playerController(this._model.game?.state.playerTwo);
  }

  /**
   * Returns the status of the game
   * If there is no game, returns 'WAITING_FOR_PLAYERS'
   */
  get status(): GameStatus {
    const status = this._model.game?.state.status;
    if (!status) {
      return 'WAITING_FOR_PLAYERS';
    }
    return status;
  }

  private _playerController(id: string | undefined): PlayerController | undefined {
    return this.occupants.find(occupant => occupant.id === id);
  }
}
