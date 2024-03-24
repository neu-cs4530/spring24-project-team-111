import Player from '../lib/Player';
import {
  InteractableCommand,
  InteractableCommandReturnType,
  UndercookedArea as UndercookedAreaModel,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class UndercookedArea extends InteractableArea {
  public toModel(): UndercookedAreaModel {
    return {
      type: 'UndercookedArea',
      id: this.id,
      occupants: this.occupantsByID,
    };
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'JoinUndercookedGame')
  }
}
