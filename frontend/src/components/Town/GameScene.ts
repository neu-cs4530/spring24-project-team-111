import Phaser from 'phaser';
import TypedEventEmitter from 'typed-emitter';
import PlayerController, { MOVEMENT_SPEED } from '../../classes/PlayerController';
import TownController from '../../classes/TownController';
import { PlayerLocation } from '../../types/CoveyTownSocket';
import { Callback } from '../VideoCall/VideoFrontend/types';
import Interactable from './Interactable';

type MovementEvent = {
  /**
   * An event that indicates that a player has moved. This event is dispatched after updating the player's location -
   * the new location can be found on the PlayerController.
   */
  playerMoved: (movedPlayer: PlayerController) => void;
};

export default class GameScene extends Phaser.Scene {
  private _cursors: Phaser.Types.Input.Keyboard.CursorKeys[] = [];

  private _emitter: TypedEventEmitter<MovementEvent>;

  private _physics: Phaser.Physics.Arcade.ArcadePhysics;

  constructor(
    controller: TypedEventEmitter<MovementEvent>,
    physics: Phaser.Physics.Arcade.ArcadePhysics,
  ) {
    super('game-scene');
    this._emitter = controller;
  }

  getNewMovementDirection() {
    if (this._cursors.find(keySet => keySet.left?.isDown)) {
      return 'left';
    }
    if (this._cursors.find(keySet => keySet.right?.isDown)) {
      return 'right';
    }
    if (this._cursors.find(keySet => keySet.down?.isDown)) {
      return 'front';
    }
    if (this._cursors.find(keySet => keySet.up?.isDown)) {
      return 'back';
    }
    return undefined;
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
        player === this.coveyTownController.ourPlayer ? '(You)' : player.userName,
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
