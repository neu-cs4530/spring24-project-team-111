import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import { nanoid } from 'nanoid';
import InvalidParametersError, { INVALID_COMMAND_MESSAGE } from '../../lib/InvalidParametersError';
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

export default class UndercookedArea extends InteractableArea {
  private _game = new UndercookedTown(nanoid(), this._townEmitter);

  public get game(): UndercookedTown {
    return this._game;
  }

  public get isActive(): boolean {
    return true;
  }

  public toModel(): UndercookedAreaModel {
    return {
      type: 'UndercookedArea',
      id: this.id,
      occupants: this.occupantsByID,
      players: this._game.players.map(player => player.id),
      ...this._game.state,
    };
  }

  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
    socket: CoveyTownSocket,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'JoinGame') {
      if (this._game.state.status === 'OVER') {
        this._game = new UndercookedTown(nanoid(), this._townEmitter);
      }
      this._game.join(player, socket);
      this._emitAreaChanged();

      return { gameID: this._game.townID } as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'LeaveGame') {
      this._game.leave(player);
      this._emitAreaChanged();
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    if (command.type === 'StartGame') {
      const game = this._game;
      
      game.startGame(player);
      this._emitAreaChanged();
      return undefined as InteractableCommandReturnType<CommandType>;
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
