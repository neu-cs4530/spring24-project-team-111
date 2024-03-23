import { nanoid } from 'nanoid';
import {
  Player as PlayerModel,
  PlayerLocation,
  UndercookedIngredient,
} from '../types/CoveyTownSocket';

/**
 * Each user who is connected to a game is representaed by a GamePlayer object.
 * This object is used to manage the player's location and other game-related data.
 * We give the user a new ingame id to avoid clashes when broadcasting events to the clients.
 */
export default class UndercookedPlayer {
  public location: PlayerLocation;

  private readonly _id: string;

  private readonly _userName: string;

  private readonly _inGameId: string;

  public ingredientInHand?: UndercookedIngredient;

  constructor(username: string, playerId: string) {
    this.location = {
      x: 0,
      y: 0,
      moving: false,
      rotation: 'front',
    };
    this._id = playerId;
    this._userName = username;
    this._inGameId = nanoid();
  }

  public get userName(): string {
    return this._userName;
  }

  public get id(): string {
    return this._id;
  }

  public get inGameId(): string {
    return this._inGameId;
  }

  /**
   * Creates a player model for the in-game character.
   *
   * @returns The player model of the in-game character.
   */
  public toPlayerModel(): PlayerModel {
    return {
      id: this.inGameId,
      location: this.location,
      userName: this.userName,
    };
  }
}
