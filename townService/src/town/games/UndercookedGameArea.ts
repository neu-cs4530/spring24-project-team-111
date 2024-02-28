import Player from '../../lib/Player';
import {
  InteractableType,
  InteractableCommand,
  InteractableCommandReturnType,
} from '../../types/CoveyTownSocket';
import GameArea from './GameArea';

export default class UndercookedGameArea extends GameArea<any> {
  protected getType(): InteractableType {
    return 'UndercookedArea';
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    throw new Error('Method not implemented.');
  }
}
