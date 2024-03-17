import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { UndercookedTownSocket } from '../types/CoveyTownSocket';
import TownController from './TownController';
import { UndercookedArea as UndercookedAreaModel } from '../types/CoveyTownSocket';
import { io } from 'socket.io-client';
import assert from 'assert';
import { InteractableID } from '../generated/client';

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

  private _model: UndercookedAreaModel;

  private _townController: TownController;

  private _id: InteractableID;

  constructor(id: InteractableID, model: UndercookedAreaModel, townController: TownController) {
    super();
    const url = process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL;
    assert(url);
    this._socket = io(`${url}/undercooked`);
    this._model = model;
    this._townController = townController;
    this._id = id;
    this._socket.connect();
    console.log('UndercookedTownController connected');
  }
}
