import UndercookedAreaController from '../../../../classes/interactable/UndercookedAreaController';
import WalkableScene from '../../WalkableScene';

export default class UndercookedGameScene extends WalkableScene {
  private _resourcePathPrefix: string;

  public undercookedController: UndercookedAreaController;

  constructor(undercookedAreaController: UndercookedAreaController, resourcePathPrefix = '') {
    super(undercookedAreaController.undercookedTownController, 'UndercookedGameScene');
    this._resourcePathPrefix = resourcePathPrefix;
    this.undercookedController = undercookedAreaController;
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
    this.map = this.make.tilemap({ key: 'map' });

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
