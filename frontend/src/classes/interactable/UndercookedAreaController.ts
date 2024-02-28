import GameAreaController from './GameAreaController';

export default class UndercookedAreaController extends GameAreaController<any, any> {
  public isActive(): boolean {
    return true;
  }
}
