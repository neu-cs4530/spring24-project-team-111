import { nanoid } from 'nanoid';
import Player from '../../lib/Player';
import {
  UndercookedGameState,
  UndercookedIngredient,
  UndercookedMove,
  UndercookedPlayer,
  UndercookedRecipe,
  GameMove,
  TownEmitter as GameEmitter,
} from '../../types/CoveyTownSocket';
import Game from './Game';
import InteractableArea from '../InteractableArea';

export default class UndercookedGameWire extends Game<UndercookedGameState, UndercookedMove> {
  private static _ingredientBank: UndercookedIngredient[] = [
    'Chicken',
    'Rice',
    'Egg',
    'Pasta',
    'Salad',
  ];

  private _currentRecipe: UndercookedRecipe;

  private _playerOne: UndercookedPlayer | undefined;

  private _playerTwo: UndercookedPlayer | undefined;

  private _stations: InteractableArea[];

  private _assembledIngredients: UndercookedIngredient[];

  private _gameId: string;

  private _broadcastEmitter: GameEmitter;

  constructor(broadcastEmitter: GameEmitter) {
    super({
      oneReady: false,
      twoReady: false,
      assembledIngredients: [],
      score: 0,
      status: 'IN_PROGRESS',
    });
    this._gameId = nanoid();
    this._broadcastEmitter = broadcastEmitter;
    this._stations = [];
    this._assembledIngredients = [];
    this._currentRecipe = [];
  }

  // This will also move the player. When u start game u need to set listeners.
  // This just updates the position and emmites apporapiet message/event.
  // This also handles when a person interacts with station x.
  public applyMove(move: GameMove<UndercookedMove>): void {
    throw new Error('Method not implemented.');
  }

  protected _join(player: Player): void {
    throw new Error('Method not implemented.');
  }

  protected _leave(player: Player): void {
    throw new Error('Method not implemented.');
  }

  public startGame(player: Player): void {
    throw new Error('Method not implemented.');
  }
}
