import Player from '../../lib/Player';
import {
  InteractableCommand,
  InteractableCommandReturnType,
  TrashArea as TrashAreaModel,
} from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';

export default class TrashArea extends InteractableArea {
  public toModel(): TrashAreaModel {
    throw new Error('Method not implemented.');
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    throw new Error('Method not implemented.');
  }
}
