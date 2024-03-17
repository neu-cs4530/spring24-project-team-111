import Phaser from 'phaser';
import PlayerController from '../../classes/PlayerController';
import TownController from '../../classes/TownController';

export default class WalkableWorld extends Phaser.Scene {
  private _controller: TownController;

  private _cursors: Phaser.Types.Input.Keyboard.CursorKeys[] = [];

  private _collidingLayers: Phaser.Tilemaps.TilemapLayer[] = [];

  constructor(name: string, controller: TownController) {
    super(name);
    this._controller = controller;
  }

  /**
   * Renders a player sprite/player inside in the scene.
   *
   * @param player The player to be rendered.
   */
  public createPlayerSprites(player: PlayerController) {
    if (!player.gameObjects) {
      const sprite = this.physics.add
        .sprite(player.location.x, player.location.y, 'atlas', 'misa-front')
        .setSize(30, 40)
        .setOffset(0, 24);
      const label = this.add.text(
        player.location.x,
        player.location.y - 20,
        player === this._controller.ourPlayer ? '(You)' : player.userName,
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

  /**
   * Gets the directtion of the player's movement.
   *
   * @returns The direction of the player's movement.
   */
  public getNewMovementDirection() {
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
}
