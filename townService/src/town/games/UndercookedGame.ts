import InvalidParametersError, {
  BOARD_POSITION_NOT_VALID_MESSAGE,
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  GAME_NOT_STARTABLE_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  UndercookedGameState,
  UndercookedGamepiece,
  UndercookedIngredient,
  UndercookedMove,
  UndercookedPlayer,
  UndercookedRecipe,
  UndercookedStation,
  UndercookedStationID,
  UndercookedStationType,
  GameMove,
  PlayerID,
  Direction,
} from '../../types/CoveyTownSocket';
import Game from './Game';
import UndercookedIngredientStation from './UndercookedIngredientStation';

export default class UndercookedGame extends Game<UndercookedGameState, UndercookedMove> {
  private _recipe: UndercookedRecipe;

  private _stations: UndercookedStation[];

  private _playerOne: UndercookedPlayer | undefined;

  private _playerTwo: UndercookedPlayer | undefined;

  public constructor() {
    super({
      status: 'WAITING_TO_START',
      oneReady: false,
      twoReady: false,
      score: 0,
      assembledIngredients: [],
    });
    this._recipe = [];
    this._stations = [];
    this._playerOne = undefined;
    this._playerTwo = undefined;
  }

  public applyMove(move: GameMove<UndercookedMove>): void {
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    if (move.playerID !== this.state.playerOne && move.playerID !== this.state.playerTwo) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    // handle player movement

    // handle player interaction with stations

    // Logic for checking player held ingredients is on the recipe and automatically adding to the assembledIngredients array
    // will be moved to assymbly station in the future
    if (move.move.playerChar.holding) {
      const heldIngredient = move.move.playerChar.holding;
      if (
        this._recipe.includes(heldIngredient) &&
        !move.move.assymbledIngredients.includes(heldIngredient)
      ) {
        // add ingredient to the assymbled ingredients
        move.move.assymbledIngredients.push(heldIngredient);
        move.move.playerChar.holding = undefined;
      } else {
        // drop the ingredient
        move.move.playerChar.holding = undefined;
      }
    }

    // check if assymbled ingredients are complete
    if (move.move.assymbledIngredients === this._recipe) {
      this.state.score += 1;
      this._generateRecipe(3); // 3 is the recipe length, can be changed later
    }
  }

  /**
   * Indicates that a player is ready to start the game.
   *
   * Updates the game state to indicate that the player is ready to start the game.
   *
   * If both players are ready, the game will start.
   *
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   * @throws InvalidParametersError if the game is not in the WAITING_TO_START state (GAME_NOT_STARTABLE_MESSAGE)
   *
   * @param player The player who is ready to start the game
   */
  public startGame(player: Player): void {
    if (this.state.status !== 'WAITING_TO_START') {
      throw new InvalidParametersError(GAME_NOT_STARTABLE_MESSAGE);
    }
    if (this.state.playerOne !== player.id && this.state.playerTwo !== player.id) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    if (this.state.playerOne === player.id) {
      this.state.oneReady = true;
    }
    if (this.state.playerTwo === player.id) {
      this.state.twoReady = true;
    }
    this.state = {
      ...this.state,
      status: this.state.oneReady && this.state.twoReady ? 'IN_PROGRESS' : 'WAITING_TO_START',
    };
    if (this.state.status === 'IN_PROGRESS') {
      this._initGame();
    }
  }

  /**
   * logic for initializaing the game
   */
  private _initGame(): void {
    if (this.state.playerOne === undefined || this.state.playerTwo === undefined) {
      throw new InvalidParametersError(GAME_NOT_STARTABLE_MESSAGE);
    }

    // // initializaing the players
    // this._playerOne = {
    //   id: this.state.playerOne,
    //   location: { x: 0, y: 0, rotation: 'front', moving: false }, // change x and y
    //   holding: undefined,
    // };

    // this._playerTwo = {
    //   id: this.state.playerTwo,
    //   location: { x: 0, y: 0, rotation: 'front', moving: false }, // change x and y
    //   holding: undefined,
    // };

    this._generateRecipe(3); // 3 is the recipe length, can be changed later
    this._generateStations();
  }

  private _generateStations(): void {
    this._stations = [];
    const chickenStation: UndercookedStation = new UndercookedIngredientStation(
      'chickenID',
      'Chicken',
      'Chicken Station',
    );
    this._stations.push(chickenStation);
  }

  private _generateRecipe(recipeLength: number): void {
    // update this as UndercookedIngredient is updated
    const ingredients: UndercookedIngredient[] = ['Chicken', 'Rice', 'Egg', 'Pasta', 'Salad'];
    if (recipeLength > ingredients.length || recipeLength < 1) {
      throw new Error('Invalid recipe length');
    }

    // Fisher-Yates shuffle algorithm
    for (let i = ingredients.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ingredients[i], ingredients[j]] = [ingredients[j], ingredients[i]];
    }

    const uniqueIngredients = Array.from(new Set(ingredients)).slice(0, recipeLength);
    this._recipe = uniqueIngredients;
  }

  /**
   * Joins a player to the game.
   * - If the player lobby is full, updates the game status to WAITING_TO_START.
   *
   * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
   * @throws InvalidParametersError if the game is full (GAME_FULL_MESSAGE)
   *
   * @param player the player to join the game
   */
  protected _join(player: Player): void {
    if (this.state.playerOne === player.id || this.state.playerTwo === player.id) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (!this.state.playerOne) {
      this.state = {
        ...this.state,
        playerOne: player.id,
      };
    } else if (!this.state.playerTwo) {
      this.state = {
        ...this.state,
        playerTwo: player.id,
      };
    } else {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }
    if (this.state.playerOne && this.state.playerTwo) {
      this.state = {
        ...this.state,
        status: 'WAITING_TO_START',
      };
    }
  }

  /**
   * Removes a player from the game.
   * Updates the game's state to reflect the player leaving.
   *
   * If the game state is currently "IN_PROGRESS", updates the game's status to OVER.
   *
   * If the game state is currently "WAITING_TO_START", updates the game's status to WAITING_FOR_PLAYERS.
   *
   * If the game state is currently "WAITING_FOR_PLAYERS" or "OVER", the game state is unchanged.
   *
   * @param player The player to remove from the game
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   */
  protected _leave(player: Player): void {
    if (this.state.status === 'OVER') {
      return;
    }
    if (this.state.playerOne === player.id) {
      this.state = {
        ...this.state,
        playerOne: undefined,
        oneReady: false,
      };
    }
    if (this.state.playerTwo === player.id) {
      this.state = {
        ...this.state,
        playerTwo: undefined,
        twoReady: false,
      };
    } else {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    switch (this.state.status) {
      case 'WAITING_TO_START':
      case 'WAITING_FOR_PLAYERS':
        // no-ops: nothing needs to happen here
        this.state.status = 'WAITING_FOR_PLAYERS';
        break;
      case 'IN_PROGRESS':
        this.state = {
          ...this.state,
          status: 'OVER',
        };
        break;
      default:
        // This behavior can be undefined :)
        throw new Error(`Unexpected game status: ${this.state.status}`);
    }
  }
}
