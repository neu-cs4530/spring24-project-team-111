import { ITiledMap, ITiledMapObjectLayer } from '@jonbell/tiled-map-type-guard';
import { nanoid } from 'nanoid';
import { BroadcastOperator } from 'socket.io';
import InvalidParametersError from '../lib/InvalidParametersError';
import IVideoClient from '../lib/IVideoClient';
import Player from '../lib/Player';
import TwilioVideo from '../lib/TwilioVideo';
import { isViewingArea } from '../TestUtils';
import {
  ChatMessage,
  ConversationArea as ConversationAreaModel,
  CoveyTownSocket,
  Interactable,
  InteractableCommand,
  InteractableCommandBase,
  PlayerLocation,
  ServerToClientEvents,
  SocketData,
  UndercookedGameState,
  UndercookedPlayer,
  UndercookedInteractable,
  ViewingArea as ViewingAreaModel,
  PlayerID,
} from '../types/CoveyTownSocket';
import { logError } from '../Utils';
import ConversationArea from './ConversationArea';
import GameAreaFactory from './games/GameAreaFactory';
import InteractableArea from './InteractableArea';
import ViewingArea from './ViewingArea';
import GamePlayer from '../lib/GamePlayer';

/**
 * The UndercookedTown class implements the logic for an Undercooked game: managing the various
 * events that can occur (e.g. joining a game, leaving a game, moving around in the undercooked town, etc.)
 *
 * The implementation of this class will be similar to Town.ts in the townService directory but tweaked
 * for Undercooked game rules and mechanics.
 */
export default class UndercookedTown {
  /** The list of players currently in the town * */
  private _players: UndercookedPlayer[] = [];

  private _stations: UndercookedInteractable[] = [];

  private readonly _underCookedGameID: string;

  private _broadcastEmitter: BroadcastOperator<ServerToClientEvents, SocketData>;

  private _connectedSockets: Set<CoveyTownSocket> = new Set();

  private _chatMessages: ChatMessage[] = [];

  private _gameState: UndercookedGameState;

  get players(): UndercookedPlayer[] {
    return this._players;
  }

  get occupancy(): number {
    return this.players.length;
  }

  get townID(): string {
    return this._underCookedGameID;
  }

  get interactables(): UndercookedInteractable[] {
    return this._stations;
  }

  get gameState(): UndercookedGameState {
    return this._gameState;
  }

  constructor(
    // friendlyName: string,
    // isPubliclyListed: boolean,
    townID: string,
    broadcastEmitter: BroadcastOperator<ServerToClientEvents, SocketData>,
  ) {
    this._underCookedGameID = townID;
    // this._capacity = 50;
    // this._townUpdatePassword = nanoid(24);
    // this._isPubliclyListed = isPubliclyListed;
    // this._friendlyName = friendlyName;
    this._broadcastEmitter = broadcastEmitter;
    this._gameState = {
      status: 'WAITING_FOR_PLAYERS',
      playerOne: undefined,
      playerTwo: undefined,
      playerOneReady: false,
      playerTwoReady: false,
      currentRecipe: [],
      timeRemaining: 0,
      score: 0,
    };
  }

  /**
   * Adds a player to this the UnderCooked game, provisioning the necessary credentials for the
   * player, and returning them
   *
   * @param newPlayer The new player to add to the town
   */
  // GamePlayer or UndercookedGamePlayer?????
  async joinPlayer(userName: string, socket: CoveyTownSocket): Promise<Player> {
    if (this._gameState.status !== 'WAITING_FOR_PLAYERS') {
      throw new Error('Player maximum has been reached.');
    }

    const newPlayer = new Player(userName, socket.to(this._underCookedGameID));
    const newUndercookedPlayer: UndercookedPlayer = {
        id: newPlayer.id,
        userName: newPlayer.userName,
        // add new fields for holding etc
    }
    this._players.push(newUndercookedPlayer);

    this._connectedSockets.add(socket);

    // // Create a video token for this user to join this town
    // newPlayer.videoToken = await this._videoClient.getTokenForTown(this._underCookedGameID, newPlayer.id);

    // Notify other players that this player has joined
    this._broadcastEmitter.emit('playerJoined', newPlayer.toPlayerModel());

    // Register an event listener for the client socket: if the client disconnects,
    // clean up our listener adapter, and then let the CoveyTownController know that the
    // player's session is disconnected
    socket.on('disconnect', () => {
      this._removePlayer(newPlayer);
      this._connectedSockets.delete(socket);
    });

    // Set up a listener to forward all chat messages to all clients in the town
    socket.on('chatMessage', (message: ChatMessage) => {
      this._broadcastEmitter.emit('chatMessage', message);
      this._chatMessages.push(message);
      if (this._chatMessages.length > 200) {
        this._chatMessages.shift();
      }
    });

    // Register an event listener for the client socket: if the client updates their
    // location, inform the UnderCookedGameController
    // socket.on('playerMovement', (movementData: PlayerLocation) => {
    //   try {
    //     this._updatePlayerLocation(newPlayer, movementData);
    //   } catch (err) {
    //     logError(err);
    //   }
    // });

    // Set up a listener to process updates to interactables.
    // Currently only knows how to process updates for ViewingArea's, and
    // ignores any other updates for any other kind of interactable.
    // For ViewingArea's: dispatches an updateModel call to the viewingArea that
    // corresponds to the interactable being updated. Does not throw an error if
    // the specified viewing area does not exist.
    // USE FOR ASSEMBLY STATION
    // socket.on('interactableUpdate', (update: Interactable) => {
    //   if (isViewingArea(update)) {
    //     newPlayer.townEmitter.emit('interactableUpdate', update);
    //     const viewingArea = this._interactables.find(
    //       eachInteractable => eachInteractable.id === update.id,
    //     );
    //     if (viewingArea) {
    //       (viewingArea as ViewingArea).updateModel(update);
    //     }
    //   }
    // });

    // Set up a listener to process commands to interactables.
    // Dispatches commands to the appropriate interactable and sends the response back to the client
    socket.on('interactableCommand', (command: InteractableCommand & InteractableCommandBase) => {
      const station = this._stations.find(
        eachInteractable => eachInteractable.id === command.interactableID,
      );
      if (station) {
        try {
          const payload = station.handleCommand(command, newPlayer);
          socket.emit('commandResponse', {
            commandID: command.commandID,
            interactableID: command.interactableID,
            isOK: true,
            payload,
          });
        } catch (err) {
          if (err instanceof InvalidParametersError) {
            socket.emit('commandResponse', {
              commandID: command.commandID,
              interactableID: command.interactableID,
              isOK: false,
              error: err.message,
            });
          } else {
            logError(err);
            socket.emit('commandResponse', {
              commandID: command.commandID,
              interactableID: command.interactableID,
              isOK: false,
              error: 'Unknown error',
            });
          }
        }
      } else {
        socket.emit('commandResponse', {
          commandID: command.commandID,
          interactableID: command.interactableID,
          isOK: false,
          error: `No such interactable ${command.interactableID}`,
        });
      }
    });
    return newPlayer;
  }

  /**
   * Destroys all data related to a player in this town.
   *
   * @param session PlayerSession to destroy
   */
  private _removePlayer(player: Player): void {
    this._players = this._players.filter(p => p.id !== player.id);
    this._broadcastEmitter.emit('playerDisconnect', player.toPlayerModel());
    this._gameState = {
      ...this._gameState,
      status: 'WAITING_FOR_PLAYERS',
    };
  }

  startGame(player: UndercookedPlayer) : void {
    if () {
// same implementation as undercookedgame
    }
  }

  move() : void {} //gameMotionManager


}
