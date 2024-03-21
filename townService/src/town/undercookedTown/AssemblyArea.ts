import Player from '../../lib/Player';
import {
  AssemblyArea as AssemblyAreaModel,
  InteractableCommand,
  InteractableCommandReturnType,
} from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';

export default class AssemblyArea extends InteractableArea {
  public toModel(): AssemblyAreaModel {
    throw new Error('Method not implemented.');
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    throw new Error('Method not implemented.');
  }
}
