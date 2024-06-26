import assert from 'assert';
import UndercookedAreaController from '../../../../classes/interactable/UndercookedAreaController';
import UndercookedTownController from '../../../../classes/UndercookedTownController';
import WalkableScene, { SceneType } from '../../WalkableScene';

// Original inspiration and code from:
// https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
/**
 * UndercookedGameScene is a Phaser Scene that represents the Undercooked game.
 * This scene mimics the same functionality as the TownGameScene, but is specific to the Undercooked game.
 * The main differences are the tilesets and the layers that are created.
 */
export default class UndercookedGameScene extends WalkableScene {
  private _resourcePathPrefix: string;

  public undercookedController: UndercookedAreaController;

  constructor(undercookedAreaController: UndercookedAreaController, resourcePathPrefix = '') {
    super(undercookedAreaController.undercookedTownController, 'UndercookedGameScene');
    this._resourcePathPrefix = resourcePathPrefix;
    this.undercookedController = undercookedAreaController;
  }

  /**
   * Gets the stype of scene.
   *
   * @returns the type of scene this is
   */
  public getType(): SceneType {
    return 'Undercooked';
  }

  initScene() {
    // Call any listeners that are waiting for the game to be initialized
    this.onGameReadyListeners.forEach(listener => listener());
    this.onGameReadyListeners = [];
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

    this.load.atlas(
      'atlas',
      this._resourcePathPrefix + '/assets/atlas/atlas.png',
      this._resourcePathPrefix + '/assets/atlas/atlas.json',
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
    const walls = this.map.createLayer('Walls', tilesets);
    assert(walls);
    walls.setCollisionByProperty({ collides: true });
    const kitchenSurfaces = this.map.createLayer('StaticKitchenSurfaces', tilesets);
    assert(kitchenSurfaces);
    kitchenSurfaces.setCollisionByProperty({ collides: true });
    const staicProps = this.map.createLayer('StaticKitchenProps', tilesets);
    assert(staicProps);
    staicProps.setCollisionByProperty({ collides: true });
    const interactableKitchen = this.map.createLayer('InteractableKitchen', tilesets);
    assert(interactableKitchen);
    interactableKitchen.setCollisionByProperty({ collides: true });

    this.createLabels();

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

    const sprite = this.createSprite();

    // Watch the player and worldLayer for collisions, for the duration of the scene:
    this.collidingLayers.push(walls);
    this.collidingLayers.push(kitchenSurfaces);
    this.collidingLayers.push(staicProps);
    this.collidingLayers.push(interactableKitchen);
    if (sprite) {
      this.collidingLayers.forEach(layer => this.physics.add.collider(sprite, layer));
    }

    this.interactables = this.getInteractables();
    this.createAnimationsForSprite();
    this.addCamera();

    this.ready = true;

    this.lockLabelPositions();

    this.ready = true;
    this.updatePlayers((this.controller as UndercookedTownController).inGamePlayers);
    this.initScene();
  }
}
