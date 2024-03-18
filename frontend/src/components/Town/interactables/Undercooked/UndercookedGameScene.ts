import Phaser from 'phaser';
import UndercookedAreaController from '../../../../classes/interactable/UndercookedAreaController';
import PlayerController from '../../../../classes/PlayerController';

export default class UndercookedGameScene extends Phaser.Scene {
  private _resourcePathPrefix: string;

  private _players: PlayerController[] = [];

  public undercookedController: UndercookedAreaController;

  private _map?: Phaser.Tilemaps.Tilemap;

  constructor(undercookedAreaController: UndercookedAreaController, resourcePathPrefix = '') {
    super('UndercookedGameScene');
    this._resourcePathPrefix = resourcePathPrefix;
    this.undercookedController = undercookedAreaController;
    this._players = this.undercookedController.players;
  }

  public get map(): Phaser.Tilemaps.Tilemap {
    const map = this._map;
    if (!map) {
      throw new Error('Cannot access map before it is initialized');
    }
    return map;
  }

  preload() {
    this.load.image(
      '12_Kitchen_32x32',
      this._resourcePathPrefix + '/assets/tilesets/12_Kitchen_32x32.png',
    );
    this.load.image(
      'Room_Builder_32x32',
      this._resourcePathPrefix + '/assets/tilesets/Room_Builder_32x32.png',
    );
    this.load.tilemapTiledJSON(
      'map',
      this._resourcePathPrefix + '/assets/tilemaps/undercooked.json',
    );
  }

  create() {
    this._map = this.make.tilemap({ key: 'map' });

    // add the tilesets
    const kitchenTileset = this.map.addTilesetImage('kitchen_tiles', '12_Kitchen_32x32');
    const roomBuilderTileset = this.map.addTilesetImage('room_builder_tiles', 'Room_Builder_32x32');
    const tilesets = [
      kitchenTileset as Phaser.Tilemaps.Tileset,
      roomBuilderTileset as Phaser.Tilemaps.Tileset,
    ];

    // create the layers
    this.map.createLayer('Walls', tilesets);
    this.map.createLayer('Floor', tilesets);
    this.map.createLayer('StaticKitchenSurfaces', tilesets);
    this.map.createLayer('StaticKitchenProps', tilesets);
    this.map.createLayer('InteractableKitchen', tilesets);
  }
}
