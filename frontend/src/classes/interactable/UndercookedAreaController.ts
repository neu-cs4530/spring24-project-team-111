import {
  InteractableID,
  UndercookedArea as UndercookedAreaModel,
} from '../../types/CoveyTownSocket';
import TownController from '../TownController';
import UndercookedTownController, { UndercookedTownEvents } from '../UndercookedTownController';
import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';

export type UndercookedAreaEvents = BaseInteractableEventMap & UndercookedTownEvents;

export default class UndercookedAreaController extends InteractableAreaController<
  UndercookedAreaEvents,
  UndercookedAreaModel
> {
  private _undercookedTownController: UndercookedTownController;

  constructor(
    id: InteractableID,
    undercookedAreaModel: UndercookedAreaModel,
    townController: TownController,
  ) {
    super(id);
    this._undercookedTownController = new UndercookedTownController(
      id,
      undercookedAreaModel,
      townController,
    );
  }

  toInteractableAreaModel(): UndercookedAreaModel {
    throw new Error('Method not implemented.');
  }

  protected _updateFrom(newModel: UndercookedAreaModel): void {
    throw new Error('Method not implemented.');
  }

  public isActive(): boolean {
    throw new Error('Method not implemented.');
  }

  public get friendlyName(): string {
    throw new Error('Method not implemented.');
  }

  public get type(): string {
    throw new Error('Method not implemented.');
  }
}
