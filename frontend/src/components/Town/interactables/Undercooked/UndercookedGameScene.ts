import Phaser from 'phaser';
import UndercookedAreaController from '../../../../classes/interactable/UndercookedAreaController';
import PlayerController from '../../../../classes/PlayerController';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// function interactableTypeFor(type: string): any {
//   throw new Error(`Unknown object type: ${type}`);
// }

export default class UndercookedGameScene extends Phaser.Scene {
  private _resourcePathPrefix: string;

  private _players: PlayerController[] = [];

  private _map?: Phaser.Tilemaps.Tilemap;

  private _cursors: Phaser.Types.Input.Keyboard.CursorKeys[] = [];

  private _cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;

  private _collidingLayers: Phaser.Tilemaps.TilemapLayer[] = [];

  private _previouslyCapturedKeys: number[] = [];

  private _ready = false;

  private _paused = false;

  public undercookedController: UndercookedAreaController;

  constructor(gameController: UndercookedAreaController, resourcePathPrefix = '') {
    super('UndercookedGameScene');
    this._resourcePathPrefix = resourcePathPrefix;
    this.undercookedController = gameController;
    this._players = this.undercookedController.players;
  }

  public get cursorKeys() {
    const ret = this._cursorKeys;
    if (!ret) {
      throw new Error('Unable to access cursors before game scene is loaded');
    }
    return ret;
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
    this.map.createLayer('Floor', tilesets);
    this.map.createLayer('Walls', tilesets);
    this.map.createLayer('StaticKitchenSurfaces', tilesets);
    this.map.createLayer('StaticKitchenProps', tilesets);
    this.map.createLayer('InteractableKitchen', tilesets);
  }

  public updatePlayers(players: PlayerController[]) {
    //Make sure that each player has sprites
    players.map(eachPlayer => this.createPlayerSprites(eachPlayer));

    // Remove disconnected players from board
    const disconnectedPlayers = this._players.filter(
      player => !players.find(p => p.id === player.id),
    );

    disconnectedPlayers.forEach(disconnectedPlayer => {
      if (disconnectedPlayer.gameObjects) {
        const { sprite, label } = disconnectedPlayer.gameObjects;
        if (sprite && label) {
          sprite.destroy();
          label.destroy();
        }
      }
    });
    // Remove disconnected players from list
    this._players = players;
  }

  public createPlayerSprites(player: PlayerController) {
    if (!player.gameObjects) {
      const sprite = this.physics.add
        .sprite(player.location.x, player.location.y, 'atlas', 'misa-front')
        .setSize(30, 40)
        .setOffset(0, 24);
      const label = this.add.text(
        player.location.x,
        player.location.y - 20,
        player === this.undercookedController.ourPlayer ? '(You)' : player.userName,
        {
          font: '18px monospace',
          color: '#000000',
          // padding: {x: 20, y: 10},
          backgroundColor: '#ffffff',
        },
      );
      player.gameObjects = {
        sprite,
        label,
        locationManagedByGameScene: false,
      };
      this._collidingLayers.forEach(layer => this.physics.add.collider(sprite, layer));
    }
  }
}
