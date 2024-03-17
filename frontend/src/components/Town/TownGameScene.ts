import assert from 'assert';
import Phaser from 'phaser';
import TownController from '../../classes/TownController';
import WalkableScene from './WalkableScene';

// Original inspiration and code from:
// https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
export default class TownGameScene extends WalkableScene {
  private _resourcePathPrefix: string;

  constructor(coveyTownController: TownController, resourcePathPrefix = '') {
    super(coveyTownController, 'TownGameScene');
    this._resourcePathPrefix = resourcePathPrefix;
  }

  preload() {
    this.load.image(
      'Room_Builder_32x32',
      this._resourcePathPrefix + '/assets/tilesets/Room_Builder_32x32.png',
    );
    this.load.image(
      '22_Museum_32x32',
      this._resourcePathPrefix + '/assets/tilesets/22_Museum_32x32.png',
    );
    this.load.image(
      '5_Classroom_and_library_32x32',
      this._resourcePathPrefix + '/assets/tilesets/5_Classroom_and_library_32x32.png',
    );
    this.load.image(
      '12_Kitchen_32x32',
      this._resourcePathPrefix + '/assets/tilesets/12_Kitchen_32x32.png',
    );
    this.load.image(
      '1_Generic_32x32',
      this._resourcePathPrefix + '/assets/tilesets/1_Generic_32x32.png',
    );
    this.load.image(
      '13_Conference_Hall_32x32',
      this._resourcePathPrefix + '/assets/tilesets/13_Conference_Hall_32x32.png',
    );
    this.load.image(
      '14_Basement_32x32',
      this._resourcePathPrefix + '/assets/tilesets/14_Basement_32x32.png',
    );
    this.load.image(
      '16_Grocery_store_32x32',
      this._resourcePathPrefix + '/assets/tilesets/16_Grocery_store_32x32.png',
    );
    this.load.tilemapTiledJSON('map', this._resourcePathPrefix + '/assets/tilemaps/indoors.json');
    this.load.atlas(
      'atlas',
      this._resourcePathPrefix + '/assets/atlas/atlas.png',
      this._resourcePathPrefix + '/assets/atlas/atlas.json',
    );
  }

  create() {
    this.map = this.make.tilemap({ key: 'map' });

    /* Parameters are the name you gave the tileset in Tiled and then the key of the
         tileset image in Phaser's cache (i.e. the name you used in preload)
         */
    const tileset = [
      'Room_Builder_32x32',
      '22_Museum_32x32',
      '5_Classroom_and_library_32x32',
      '12_Kitchen_32x32',
      '1_Generic_32x32',
      '13_Conference_Hall_32x32',
      '14_Basement_32x32',
      '16_Grocery_store_32x32',
    ].map(v => {
      const ret = this.map.addTilesetImage(v);
      assert(ret);
      return ret;
    });

    this.collidingLayers = [];
    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = this.map.createLayer('Below Player', tileset, 0, 0);
    assert(belowLayer);
    belowLayer.setDepth(-10);
    const wallsLayer = this.map.createLayer('Walls', tileset, 0, 0);
    const onTheWallsLayer = this.map.createLayer('On The Walls', tileset, 0, 0);
    assert(wallsLayer);
    assert(onTheWallsLayer);
    wallsLayer.setCollisionByProperty({ collides: true });
    onTheWallsLayer.setCollisionByProperty({ collides: true });

    const worldLayer = this.map.createLayer('World', tileset, 0, 0);
    assert(worldLayer);
    worldLayer.setCollisionByProperty({ collides: true });
    const aboveLayer = this.map.createLayer('Above Player', tileset, 0, 0);
    assert(aboveLayer);
    aboveLayer.setCollisionByProperty({ collides: true });

    const veryAboveLayer = this.map.createLayer('Very Above Player', tileset, 0, 0);
    assert(veryAboveLayer);
    /* By default, everything gets depth sorted on the screen in the order we created things.
         Here, we want the "Above Player" layer to sit on top of the player, so we explicitly give
         it a depth. Higher depths will sit on top of lower depth objects.
         */
    worldLayer.setDepth(5);
    aboveLayer.setDepth(10);
    veryAboveLayer.setDepth(15);

    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    const spawnPoint = this.map.findObject(
      'Objects',
      obj => obj.name === 'Spawn Point',
    ) as unknown as Phaser.GameObjects.Components.Transform;

    const labels = this.map.filterObjects('Objects', obj => obj.name === 'label');
    labels?.forEach(label => {
      if (label.x && label.y) {
        this.add.text(label.x, label.y, label.text.text, {
          color: '#FFFFFF',
          backgroundColor: '#000000',
        });
      }
    });
    assert(this.input.keyboard);
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.cursors.push(this.cursorKeys);
    this.cursors.push(
      this.input.keyboard.addKeys(
        {
          up: Phaser.Input.Keyboard.KeyCodes.W,
          down: Phaser.Input.Keyboard.KeyCodes.S,
          left: Phaser.Input.Keyboard.KeyCodes.A,
          right: Phaser.Input.Keyboard.KeyCodes.D,
        },
        false,
      ) as Phaser.Types.Input.Keyboard.CursorKeys,
    );
    this.cursors.push(
      this.input.keyboard.addKeys(
        {
          up: Phaser.Input.Keyboard.KeyCodes.H,
          down: Phaser.Input.Keyboard.KeyCodes.J,
          left: Phaser.Input.Keyboard.KeyCodes.K,
          right: Phaser.Input.Keyboard.KeyCodes.L,
        },
        false,
      ) as Phaser.Types.Input.Keyboard.CursorKeys,
    );

    // Create a sprite with physics enabled via the physics system. The image used for the sprite
    // has a bit of whitespace, so I'm using setSize & setOffset to control the size of the
    // player's body.
    const sprite = this.physics.add
      .sprite(spawnPoint.x, spawnPoint.y, 'atlas', 'misa-front')
      .setSize(30, 40)
      .setOffset(0, 24)
      .setDepth(6);
    const label = this.add
      .text(spawnPoint.x, spawnPoint.y - 20, '(You)', {
        font: '18px monospace',
        color: '#000000',
        // padding: {x: 20, y: 10},
        backgroundColor: '#ffffff',
      })
      .setDepth(6);
    this.controller.ourPlayer.gameObjects = {
      sprite,
      label,
      locationManagedByGameScene: true,
    };

    this.interactables = this.getInteractables();

    this.moveOurPlayerTo({ rotation: 'front', moving: false, x: spawnPoint.x, y: spawnPoint.y });

    // Watch the player and worldLayer for collisions, for the duration of the scene:
    this.collidingLayers.push(worldLayer);
    this.collidingLayers.push(wallsLayer);
    this.collidingLayers.push(aboveLayer);
    this.collidingLayers.push(onTheWallsLayer);
    this.collidingLayers.forEach(layer => this.physics.add.collider(sprite, layer));

    // Create the player's walking animations from the texture atlas. These are stored in the global
    // animation manager so any sprite can access them.
    const { anims } = this;
    anims.create({
      key: 'misa-left-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-left-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-right-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-right-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-front-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-front-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    anims.create({
      key: 'misa-back-walk',
      frames: anims.generateFrameNames('atlas', {
        prefix: 'misa-back-walk.',
        start: 0,
        end: 3,
        zeroPad: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    const camera = this.cameras.main;
    camera.startFollow(this.controller.ourPlayer.gameObjects.sprite);
    camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    // Help text that has a "fixed" position on the screen
    this.add
      .text(16, 16, `Arrow keys to move`, {
        font: '18px monospace',
        color: '#000000',
        padding: {
          x: 20,
          y: 10,
        },
        backgroundColor: '#ffffff',
      })
      .setScrollFactor(0)
      .setDepth(30);

    this.ready = true;
    this.updatePlayers(this.controller.players);
    // Call any listeners that are waiting for the game to be initialized
    this.onGameReadyListeners.forEach(listener => listener());
    this.onGameReadyListeners = [];
    this.controller.addListener('playersChanged', players => this.updatePlayers(players));
  }
}
