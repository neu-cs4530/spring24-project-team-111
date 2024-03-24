import { customAlphabet } from 'nanoid';
import * as fs from 'fs/promises';
import { ITiledMap } from '@jonbell/tiled-map-type-guard';
import UndercookedTown from '../town/undercookedTown/UndercookedTown';
import { TownEmitterFactory } from '../types/CoveyTownSocket';

const friendlyNanoID = customAlphabet('1234567890ABCDEF', 8);

export default class UndercookedTownsStore {
  private static _instance: UndercookedTownsStore;

  private _undercookedTownsMap: Map<string, UndercookedTown> = new Map();

  private _emitterFactory: TownEmitterFactory;

  static initializeTownsStore(emitterFactory: TownEmitterFactory) {
    UndercookedTownsStore._instance = new UndercookedTownsStore(emitterFactory);
  }

  /**
   * Retrieve the singleton UndercookedTownsStore.
   *
   * There is only a single instance of the UndercookedTownsStore - it follows the singleton pattern
   */
  static getInstance(): UndercookedTownsStore {
    if (UndercookedTownsStore._instance === undefined) {
      throw new Error('TownsStore must be initialized before getInstance is called');
    }
    return UndercookedTownsStore._instance;
  }

  private constructor(emitterFactory: TownEmitterFactory) {
    this._emitterFactory = emitterFactory;
  }

  /**
   * Get the undercooked town within the covey town with the given id
   *
   * @param coveyTownID townID of the covey town
   * @returns the existing undercooked town controller, or undefined if there is no such undercooked town in
   */
  getUndercookedTownByCoveyTownID(coveyTownID: string): UndercookedTown | undefined {
    const town = this._undercookedTownsMap.get(coveyTownID);

    return town;
  }

  /**
   * Creates a new town, registering it in the Town Store, and returning that new town
   * @param friendlyName
   * @param isPubliclyListed
   * @returns the new town controller
   */
  async createTown(
    friendlyName: string,
    coveyTownID: string,
    mapFile = '../frontend/public/assets/tilemaps/undercooked.json',
  ): Promise<UndercookedTown> {
    if (friendlyName.length === 0) {
      throw new Error('FriendlyName must be specified');
    }
    const townID = friendlyNanoID();
    const newTown = new UndercookedTown(friendlyName, townID, this._emitterFactory(townID));
    const data = JSON.parse(await fs.readFile(mapFile, 'utf-8'));
    const map = ITiledMap.parse(data);
    newTown.initializeFromMap(map);

    this._undercookedTownsMap.set(coveyTownID, newTown);

    return newTown;
  }
}
