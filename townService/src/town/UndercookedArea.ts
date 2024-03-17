import Player from '../lib/Player';
import {
  Interactable,
  InteractableCommand,
  InteractableCommandReturnType,
  UndercookedArea as UndercookedAreaModel,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class UndercookedArea extends InteractableArea {
  public toModel(): UndercookedAreaModel {
    return {} as UndercookedAreaModel;
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    throw new Error('Method not implemented.');
  }
}
