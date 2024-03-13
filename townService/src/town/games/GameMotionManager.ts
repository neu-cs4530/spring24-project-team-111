import {
  PlayerLocation,
  CoveyTownSocket as GameSocket,
  TownEmitter as GameEmitter,
} from '../../types/CoveyTownSocket';
import { logError } from '../../Utils';
import GamePlayer from '../../lib/GamePlayer';

type LocationMutator = (newLocation: PlayerLocation) => void;

/**
 * Updates and handles the movement of players in the game.
 */
export default class GameMotionManager {
  private _playerSockets: Map<GamePlayer, GameSocket> = new Map();

  private _playerHandlers: Map<GamePlayer, LocationMutator> = new Map();

  // the emitter should be a room that targets the game that the manager is managing.
  private _broadcastEmitter: GameEmitter;

  constructor(broadcastEmitter: GameEmitter) {
    this._broadcastEmitter = broadcastEmitter;
  }

  get players(): GamePlayer[] {
    return [...this._playerSockets.keys()];
  }

  public isWatching(player: GamePlayer): boolean {
    return this._playerHandlers.has(player);
  }

  /**
   * Adds a new player for the manager to manage/track its movement.
   *
   * @param player The player to add to the manager.
   */
  public register(player: GamePlayer, socket: GameSocket): void {
    this._playerSockets.set(player, socket);
  }

  /**
   * Removes a player from the manager if the manager has the player listed.
   * IF any listeners are associated with the player, they are removed as well.
   *
   * @param player The player to remove from the manager.
   */
  public deregister(player: GamePlayer): void {
    const handler = this._playerHandlers.get(player);
    if (handler) {
      this.stopWatching(player);
    }
    this._playerSockets.delete(player);
  }

  /**
   * Removes all players from the manager and any listeners associated with
   * the manager.
   */
  public deregisterAll(): void {
    this._playerSockets.forEach((socket, player) => {
      const handler = this._playerHandlers.get(player);
      if (handler) {
        socket.removeListener('playerMovement', handler);
      }
    });
    this._playerSockets.clear();
  }

  /**
   * Starts tracking the movement of a player by adding an event listener.
   *
   * @param player The player to track.
   */
  public async watch(player: GamePlayer): Promise<void> {
    const handler = (newLocation: PlayerLocation) => {
      this._updatePlayerLocation(player, newLocation);
    };
    if (!this._playerHandlers.has(player)) {
      this._playerHandlers.set(player, handler);
      this._playerSockets.get(player)?.on('playerMovement', handler);
    }
  }

  /**
   * Stops tracking the movement of a player by removing the event listener.
   *
   * @param player The player to stop tracking.
   */
  public stopWatching(player: GamePlayer): void {
    const handler = this._playerHandlers.get(player);
    if (handler) {
      this._playerSockets.get(player)?.removeListener('playerMovement', handler);
      this._playerHandlers.delete(player);
    }
  }

  /**
   * Begin tracking location data by register an event listener for the client
   * socket. If the client updates their location, inform the corresponding
   * controller about the updated location.
   */
  public async watchAll(): Promise<void> {
    this._playerSockets.forEach((_, player) => {
      this.watch(player).catch(err => logError(err));
    });
  }

  /**
   * Stop tracking location data by removing the event listeners.
   */
  public async stopWatchingAll(): Promise<void> {
    this._playerSockets.forEach((_, player) => {
      this.stopWatching(player);
    });
  }

  private _updatePlayerLocation(player: GamePlayer, newLocation: PlayerLocation): void {
    player.location = newLocation;
    this._broadcastEmitter.emit('playerMoved', player.toPlayerModel());
  }
}
