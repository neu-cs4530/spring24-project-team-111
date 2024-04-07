import TownGameScene from './TownGameScene';
import { SceneController } from './WalkableScene';
import UndercookedGameScene from './interactables/Undercooked/UndercookedGameScene';

//TODO is there not some way to figure this out from generic types/supertypes?
export type KnownInteractableTypes =
  | 'conversationArea'
  | 'viewingArea'
  | 'transporter'
  | 'gameArea'
  | 'undercookedArea'
  | 'ingredientArea';

type GameScene = TownGameScene | UndercookedGameScene;

/**
 * A base abstract class for representing an "interactable" in the Phaser game world.
 *
 * The Interactable will automatically determine when the player is overlapping with it, and
 * also when the player overlaps with it and presses the spacebar.
 *
 */
export default abstract class Interactable extends Phaser.GameObjects.Sprite {
  /**
   * The town controller associated with this interactable
   */
  protected townController: SceneController;

  /**
   * The Phaser game scene associated with this interactable
   */
  protected _scene: GameScene;

  /**
   * The current state of whether the player is or is not overlapping with this interactable
   */
  private _isOverlapping = false;

  /**
   * The ID of the interactable
   */
  private _id?: string;

  get id() {
    if (!this._id) {
      throw new Error('Expected ID to be set');
    }
    return this._id;
  }

  get isOverlapping() {
    return this._isOverlapping;
  }

  constructor(scene: GameScene) {
    super(scene, 0, 0, 'Interactable');
    this._scene = scene;
    this.townController = scene.controller;
    scene.physics.world.enable(this);
  }

  /**
   * Callback invoked by Phaser once the interactable is added to the scene. Before the
   * interactable is added to the scene, some fields may not yet be computed (such as the
   * size of this sprite).
   */
  addedToScene(): void {
    super.addedToScene();
    this.townController = (this.scene as GameScene).controller;
    this._id = this.name;
    if (!this.townController.ourPlayer) {
      return;
    }
    const sprite = this.townController.ourPlayer.gameObjects?.sprite;
    if (!sprite) {
      throw new Error('Expected player sprite created by now');
    }
    this.scene.physics.add.overlap(sprite, this, () => {
      if (!this._isOverlapping) {
        this._isOverlapping = true;
        this._scene.addOverlapExit(this, () => {
          this._isOverlapping = false;
          this.overlapExit();
        });
        this.overlap();
      }
      if (
        this.isOverlapping &&
        Phaser.Input.Keyboard.JustDown(this._scene.cursorKeys.space) &&
        !this.townController.paused
      ) {
        this.townController.interact(this);
        this.interact();
      }
    });
  }

  /**
   * The name of the type of interactable. @see KnownInteractableTypes
   */
  abstract getType(): KnownInteractableTypes;

  /**
   * Invoked when the player begins to overlap with this interactable
   */
  overlap(): void {}

  /**
   * Invoked when the player no longer overlaps with this interactable
   */
  overlapExit(): void {}

  /**
   * Invoked when the player is overlapping with this interactable and first
   * presses the spacebar
   */
  interact(): void {}
}
