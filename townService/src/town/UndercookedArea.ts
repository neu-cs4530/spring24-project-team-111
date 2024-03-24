import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import InvalidParametersError, { INVALID_COMMAND_MESSAGE } from '../lib/InvalidParametersError';
import Player from '../lib/Player';
import UndercookedTownsStore from '../lib/UndercookedTownStore';
import {
  BoundingBox,
  CoveyTownSocket,
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableID,
  TownEmitter,
  UndercookedArea as UndercookedAreaModel,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';
import UndercookedTown from './undercookedTown/UndercookedTown';

export default class UndercookedArea extends InteractableArea {
  /**
   * Creates a new UndercookedArea
   *
   * @param id the unique identifier for this undercooked area
   * @param coordinates the bounding box that defines this undercooked area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(id: InteractableID, coordinates: BoundingBox, townEmitter: TownEmitter) {
    super(id as unknown as InteractableID, coordinates, townEmitter);
  }

  /**
   * Creates a new UndercookedArea object that will represent an Undercooked Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this undercooked area exists
   * @param broadcastEmitter An emitter that can be used by this undercooked area to broadcast updates
   * @returns undercooked area object
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): UndercookedArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new UndercookedArea(name as InteractableID, rect, broadcastEmitter);
  }

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
    socket: CoveyTownSocket,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'JoinUndercookedGame') {
      const townStore = UndercookedTownsStore.getInstance();
      const town = townStore.getUndercookedTownByCoveyTownID(command.coveyTownID);

      if (!town || town.state.status === 'OVER') {
        townStore.createTown('Undercooked', command.coveyTownID);
      }

      town?.joinPlayer(player.userName, socket);

      return {} as unknown as InteractableCommandReturnType<CommandType>;
    }
    throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
  }
}
