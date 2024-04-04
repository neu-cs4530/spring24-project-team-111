import assert from 'assert';
import UndercookedTownController from '../../classes/UndercookedTownController';
import TownController from '../../classes/TownController';
import PlayerController, { MOVEMENT_SPEED } from '../../classes/PlayerController';
import ConversationArea from './interactables/ConversationArea';
import GameArea from './interactables/GameArea';
import Transporter from './interactables/Transporter';
import UndercookedArea from './interactables/UndercookedArea';
import ViewingArea from './interactables/ViewingArea';
import Interactable from './Interactable';
import { PlayerLocation } from '../../types/CoveyTownSocket';
import { Callback } from '../VideoCall/VideoFrontend/types';
import IngredientArea from './interactables/Undercooked/IngredientArea';
import TrashArea from './interactables/Undercooked/TrashArea';
import AssemblyArea from './interactables/Undercooked/AssemblyArea';

// NOTES: need to add the interactables for undercooked.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function interactableTypeForObjectType(type: string): any {
  if (type === 'ConversationArea') {
    return ConversationArea;
  } else if (type === 'Transporter') {
    return Transporter;
  } else if (type === 'ViewingArea') {
    return ViewingArea;
  } else if (type === 'GameArea') {
    return GameArea;
  } else if (type === 'UndercookedArea') {
    return UndercookedArea;
  } else if (type === 'IngredientArea') {
    return IngredientArea;
  } else if (type === 'TrashArea') {
    return TrashArea;
  } else if (type == 'AssemblyArea') {
    return AssemblyArea;
  } else {
    throw new Error(`Unknown object type: ${type}`);
  }
}

export type SceneController = TownController | UndercookedTownController;

export default class WalkableScene extends Phaser.Scene {
  private _controller: SceneController;

  protected interactables: Interactable[] = [];

  protected onGameReadyListeners: Callback[] = [];

  protected cursors: Phaser.Types.Input.Keyboard.CursorKeys[] = [];

  protected collidingLayers: Phaser.Tilemaps.TilemapLayer[] = [];

  private _pendingOverlapExits = new Map<Interactable, () => void>();

  private _paused = false;

  private _lastLocation?: PlayerLocation;

  private _players: PlayerController[] = [];

  private _previouslyCapturedKeys: number[] = [];

  protected ready = false;

  private _map?: Phaser.Tilemaps.Tilemap;

  private _cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;

  private _gameIsReady = new Promise<void>(resolve => {
    if (this.ready) {
      resolve();
    } else {
      this.onGameReadyListeners.push(resolve);
    }
  });

  constructor(controller: SceneController, name = 'WalkableScene') {
    super(name);
    this._controller = controller;
    this._players = controller.players;
  }

  public get controller(): SceneController {
    return this._controller;
  }

  public get map(): Phaser.Tilemaps.Tilemap {
    const map = this._map;
    if (!map) {
      throw new Error('Cannot access map before it is initialized');
    }
    return map;
  }

  public set map(map: Phaser.Tilemaps.Tilemap) {
    this._map = map;
  }

  public get gameIsReady() {
    return this._gameIsReady;
  }

  public get cursorKeys() {
    const ret = this._cursorKeys;
    if (!ret) {
      throw new Error('Unable to access cursors before game scene is loaded');
    }
    return ret;
  }

  public set cursorKeys(keys: Phaser.Types.Input.Keyboard.CursorKeys) {
    this._cursorKeys = keys;
  }

  addOverlapExit(interactable: Interactable, callback: () => void) {
    this._pendingOverlapExits.set(interactable, callback);
  }

  updatePlayers(players: PlayerController[]) {
    //Make sure that each player has sprites
    players.map(eachPlayer => this.createPlayerSprites(eachPlayer));
    console.log('Players:', players);

    // Remove disconnected players from board
    const disconnectedPlayers = this._players.filter(
      player => !players.find(p => p.id === player.id),
    );
    console.log('Disconnected players:', disconnectedPlayers);

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

  moveOurPlayerTo(destination: Partial<PlayerLocation>) {
    const gameObjects = this.controller.ourPlayer.gameObjects;
    if (!gameObjects) {
      throw new Error('Unable to move player without game objects created first');
    }
    if (!this._lastLocation) {
      this._lastLocation = { moving: false, rotation: 'front', x: 0, y: 0 };
    }
    if (destination.x !== undefined) {
      gameObjects.sprite.x = destination.x;
      this._lastLocation.x = destination.x;
    }
    if (destination.y !== undefined) {
      gameObjects.sprite.y = destination.y;
      this._lastLocation.y = destination.y;
    }
    if (destination.moving !== undefined) {
      this._lastLocation.moving = destination.moving;
    }
    if (destination.rotation !== undefined) {
      this._lastLocation.rotation = destination.rotation;
    }
    this.controller.emitMovement(this._lastLocation);
  }

  getNewMovementDirection() {
    if (this.cursors.find(keySet => keySet.left?.isDown)) {
      return 'left';
    }
    if (this.cursors.find(keySet => keySet.right?.isDown)) {
      return 'right';
    }
    if (this.cursors.find(keySet => keySet.down?.isDown)) {
      return 'front';
    }
    if (this.cursors.find(keySet => keySet.up?.isDown)) {
      return 'back';
    }
    return undefined;
  }

  update() {
    if (this._paused) {
      return;
    }
    const gameObjects = this.controller.ourPlayer.gameObjects;
    if (gameObjects && this.cursors) {
      const prevVelocity = gameObjects.sprite.body.velocity.clone();
      const body = gameObjects.sprite.body as Phaser.Physics.Arcade.Body;

      // Stop any previous movement from the last frame
      body.setVelocity(0);

      const primaryDirection = this.getNewMovementDirection();
      switch (primaryDirection) {
        case 'left':
          body.setVelocityX(-MOVEMENT_SPEED);
          gameObjects.sprite.anims.play('misa-left-walk', true);
          break;
        case 'right':
          body.setVelocityX(MOVEMENT_SPEED);
          gameObjects.sprite.anims.play('misa-right-walk', true);
          break;
        case 'front':
          body.setVelocityY(MOVEMENT_SPEED);
          gameObjects.sprite.anims.play('misa-front-walk', true);
          break;
        case 'back':
          body.setVelocityY(-MOVEMENT_SPEED);
          gameObjects.sprite.anims.play('misa-back-walk', true);
          break;
        default:
          // Not moving
          gameObjects.sprite.anims.stop();
          // If we were moving, pick and idle frame to use
          if (prevVelocity.x < 0) {
            gameObjects.sprite.setTexture('atlas', 'misa-left');
          } else if (prevVelocity.x > 0) {
            gameObjects.sprite.setTexture('atlas', 'misa-right');
          } else if (prevVelocity.y < 0) {
            gameObjects.sprite.setTexture('atlas', 'misa-back');
          } else if (prevVelocity.y > 0) gameObjects.sprite.setTexture('atlas', 'misa-front');
          break;
      }

      // Normalize and scale the velocity so that player can't move faster along a diagonal
      gameObjects.sprite.body.velocity.normalize().scale(MOVEMENT_SPEED);

      const isMoving = primaryDirection !== undefined;
      gameObjects.label.setX(body.x);
      gameObjects.label.setY(body.y - 20);
      const x = gameObjects.sprite.getBounds().centerX;
      const y = gameObjects.sprite.getBounds().centerY;
      //Move the sprite
      if (
        !this._lastLocation ||
        (isMoving && this._lastLocation.rotation !== primaryDirection) ||
        this._lastLocation.moving !== isMoving
      ) {
        if (!this._lastLocation) {
          this._lastLocation = {
            x,
            y,
            rotation: primaryDirection || 'front',
            moving: isMoving,
          };
        }
        this._lastLocation.x = x;
        this._lastLocation.y = y;
        this._lastLocation.rotation = primaryDirection || this._lastLocation.rotation || 'front';
        this._lastLocation.moving = isMoving;
        this._pendingOverlapExits.forEach((cb, interactable) => {
          if (
            !Phaser.Geom.Rectangle.Overlaps(
              interactable.getBounds(),
              gameObjects.sprite.getBounds(),
            )
          ) {
            this._pendingOverlapExits.delete(interactable);
            cb();
          }
        });
        this.controller.emitMovement(this._lastLocation);
      }

      //Update the location for the labels of all of the other players
      for (const player of this._players) {
        if (player.gameObjects?.label && player.gameObjects?.sprite.body) {
          player.gameObjects.label.setX(player.gameObjects.sprite.body.x);
          player.gameObjects.label.setY(player.gameObjects.sprite.body.y - 20);
        }
      }
    }
  }

  getInteractables(): Interactable[] {
    const typedObjects = this.map.filterObjects('Objects', obj => obj.type !== '');
    assert(typedObjects);
    const gameObjects = this.map.createFromObjects(
      'Objects',
      typedObjects.map(obj => ({
        id: obj.id,
        classType: interactableTypeForObjectType(obj.type),
      })),
    );

    return gameObjects as Interactable[];
  }

  createPlayerSprites(player: PlayerController) {
    if (!player.gameObjects) {
      const sprite = this.physics.add
        .sprite(player.location.x, player.location.y, 'atlas', 'misa-front')
        .setSize(30, 40)
        .setOffset(0, 24);
      const label = this.add.text(
        player.location.x,
        player.location.y - 20,
        player === this.controller.ourPlayer ? '(You)' : player.userName,
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
      this.collidingLayers.forEach(layer => this.physics.add.collider(sprite, layer));
    }
  }

  pause() {
    if (!this._paused) {
      this._paused = true;
      const gameObjects = this.controller.ourPlayer.gameObjects;
      if (gameObjects) {
        gameObjects.sprite.anims.stop();
        const body = gameObjects.sprite.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0);
      }
      assert(this.input.keyboard);
      this._previouslyCapturedKeys = this.input.keyboard.getCaptures();
      this.input.keyboard.clearCaptures();
    }
  }

  resume() {
    if (this._paused) {
      this._paused = false;
      if (this.input && this.input.keyboard) {
        this.input.keyboard.addCapture(this._previouslyCapturedKeys);
      }
      this._previouslyCapturedKeys = [];
    }
  }

  protected createSpawnPoint() {
    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    const spawnPoint = this.map.findObject(
      'Objects',
      obj => obj.name === 'Spawn Point',
    ) as unknown as Phaser.GameObjects.Components.Transform;

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
    this.moveOurPlayerTo({ rotation: 'front', moving: false, x: spawnPoint.x, y: spawnPoint.y });
    return sprite;
  }

  protected addCamera() {
    const camera = this.cameras.main;
    const playerGameObjects = this.controller.ourPlayer.gameObjects;
    assert(playerGameObjects);
    camera.startFollow(playerGameObjects.sprite);
    camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
  }

  protected createAnimationsForSprite() {
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
  }

  protected lockLabelPositions() {
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
  }

  protected createLabels() {
    const labels = this.map.filterObjects('Objects', obj => obj.name === 'label');
    labels?.forEach(label => {
      if (label.x && label.y) {
        this.add.text(label.x, label.y, label.text.text, {
          color: '#FFFFFF',
          backgroundColor: '#000000',
        });
      }
    });
  }
}
