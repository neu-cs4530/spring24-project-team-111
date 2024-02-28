import Player from '../../lib/Player';
import { GameMove } from '../../types/CoveyTownSocket';
import Game from './Game';

export default class UndercookedGame extends Game<any, any> {
  public applyMove(move: GameMove<any>): void {}

  protected _join(player: Player): void {}

  protected _leave(player: Player): void {}

  public constructor(priorGame?: any) {
    super({});
  }
}
