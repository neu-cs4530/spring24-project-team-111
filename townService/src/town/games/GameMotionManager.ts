import { BroadcastOperator } from 'socket.io';
import {
  GameSocket,
  PlayerLocation,
  ServerToClientEvents,
  SocketData,
} from '../../types/CoveyTownSocket';
import { logError } from '../../Utils';
import GamePlayer from '../../lib/GamePlayer';

/**
 * Manages the movement and motions of a player inside a game.
 * Manages any event related to the player's movement inside a game.
 */
export default class GameMotionManager {
  private _players: Map<GamePlayer, GameSocket> = new Map();

  private _broadcastEmitter: BroadcastOperator<ServerToClientEvents, SocketData>;

  private _connectedSockets: Set<GameSocket> = new Set();

  constructor(broadcastEmitter: BroadcastOperator<ServerToClientEvents, SocketData>) {
    this._broadcastEmitter = broadcastEmitter;
  }

  get players(): GamePlayer[] {
    return [...this._players.keys()];
  }

  /**
   * Adds a new player for the manager to manage/track its movement.
   *
   * @param player The player to add to the manager.
   */
  public addPlayer(player: GamePlayer, socket: GameSocket): void {
    this._players.set(player, socket);
  }

  /**
   * Removes a player from the manager if the manager has the player listed.
   *
   * @param player The player to remove from the manager.
   */
  public removePlayer(player: GamePlayer): void {
    const socket = this._players.get(player);
    if (socket) {
      this._connectedSockets.delete(socket);
      this._players.delete(player);
    }
  }

  /**
   * Begin tracking location data by register an event listener for the client
   * socket. If the client updates their location, inform the corresponding
   * controller about the updated location.
   */
  async beginTracking(): Promise<void> {
    this._players.forEach((socket, player) => {
      this._connectedSockets.add(socket);
      socket.on('playerMovement', (newLocation: PlayerLocation) => {
        try {
          this._updatePlayerLocation(player, newLocation);
        } catch (err) {
          logError(err);
        }
      });
    });
  }

  private _updatePlayerLocation(player: GamePlayer, newLocation: PlayerLocation): void {
    player.location = newLocation;
    this._broadcastEmitter.emit('playerMoved', player.toPlayerModel());
  }
}
