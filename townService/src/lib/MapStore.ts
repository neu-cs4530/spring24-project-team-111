import { ITiledMap } from '@jonbell/tiled-map-type-guard';

/**
 * Represnets a storage for Phaser Scene map definitions.
 */
export default class MapStore {
  private static _instance: MapStore;

  private _map: ITiledMap;

  static initializeMapStore(map: ITiledMap) {
    MapStore._instance = new MapStore(map);
  }

  /**
   * Retrieve the singleton MapStore.
   *
   * There is only a single instance of the MapStore - it follows the singleton pattern
   */
  static getInstance(): MapStore {
    if (MapStore._instance === undefined) {
      throw new Error('MapStore must be initialized before getInstance is called');
    }
    return MapStore._instance;
  }

  private constructor(map: ITiledMap) {
    this._map = map;
  }

  get map(): ITiledMap {
    return this._map;
  }
}
