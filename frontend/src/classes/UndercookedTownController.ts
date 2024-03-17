import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { UndercookedGameState, UndercookedTownSocket } from '../types/CoveyTownSocket';

/**
 * The UndercookedTownController emits these events. Components may subscribe to these events
 * by calling the 'addListener' method on UndercookedTownController
 */
export type UndercookedTownEvents = {
  stubEvent: () => void;
};

/**
 * The (frontend) UndercookedTownController manages the communication between the frontend
 * and the backend. When a player joins an Undercooked game, a new UndercookedTownController is created,
 * and frontend components can register to receive events (@see UndercookedTownEvents).
 */
export default class UndercookedTownController extends (EventEmitter as new () => TypedEmitter<UndercookedTownEvents>) {
  /** The socket connection to the townsService. Messages emitted here
   * are received by the TownController in that service.
   */
  private _socket: UndercookedTownSocket;

  private _model: UndercookedGameState;

  constructor(socket: UndercookedTownSocket, model: UndercookedGameState) {
    super();
    this._socket = socket;
    this._model = model;
  }
}
