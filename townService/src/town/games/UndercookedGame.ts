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
} from '../../types/CoveyTownSocket';
import Game from './Game';

export default class UndercookedGame extends Game<UndercookedGameState, UndercookedMove> {
    public constructor() {
        super({
            status: 'WAITING_TO_START',
            oneReady: false,
            twoReady: false,
            assembledIngredients: [],
            score: 0
        });
    }

    applyMove(move: UndercookedMove): void {
        // Implement the logic for applying the move
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
    _join(player: Player): void {
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
    _leave(player: Player): void {
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
        }
        else {
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