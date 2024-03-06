import { Player as PlayerModel, PlayerLocation } from '../types/CoveyTownSocket';

/**
 * Each user who is connected to a town is represented by a Player object
 */
export default class GamePlayer {
  /** The current location of this user in the game map * */
  public location: PlayerLocation;

  /** The unique identifier for this player * */
  private readonly _id: string;

  /** The player's username, which is not guaranteed to be unique within the game * */
  private readonly _userName: string;

  constructor(username: string, id: string) {
    this.location = {
      x: 0,
      y: 0,
      moving: false,
      rotation: 'front',
    };
    this._userName = username;
    this._id = id;
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  toPlayerModel(): PlayerModel {
    return {
      id: this._id,
      location: this.location,
      userName: this._userName,
    };
  }
}
