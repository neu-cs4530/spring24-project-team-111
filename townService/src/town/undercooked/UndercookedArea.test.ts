import { ITiledMap } from '@jonbell/tiled-map-type-guard';
import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import MapStore from '../../lib/MapStore';
import Player from '../../lib/Player';
import { CoveyTownSocket, TownEmitter } from '../../types/CoveyTownSocket';
import UndercookedArea from './UndercookedArea';
import { TestMapStore, simpleMap } from '../../TestUtils';

describe('UndercookedArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  const townEmitter = mock<TownEmitter>();
  const id = nanoid();
  let testArea: UndercookedArea;
  let addPlayers: (...players: Player[]) => void;
  let interactableUpdateSpy: jest.SpyInstance<void, []>;

  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new UndercookedArea(id, testAreaBox, townEmitter);
    addPlayers = (...players: Player[]) => {
      players.forEach(player => testArea.add(player));
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Test requires access to protected method)
    interactableUpdateSpy = jest.spyOn(testArea, '_emitAreaChanged');
    interactableUpdateSpy.mockClear();
  });

  describe('JoinGame Command', () => {
    it('should add players to the game.', () => {
      const p1 = new Player(nanoid(), townEmitter);
      const p2 = new Player(nanoid(), townEmitter);
      const s1 = mock<CoveyTownSocket>();
      const s2 = mock<CoveyTownSocket>();
      addPlayers(p1, p2);
      expect(testArea.game.players).toHaveLength(0);
      testArea.handleCommand({ type: 'JoinGame' }, p1, s1);
      expect(testArea.game.players).toHaveLength(1);
      expect(testArea.game.players[0].id).toBe(p1.id);
      expect(interactableUpdateSpy).toBeCalled();
      interactableUpdateSpy.mockClear();
      testArea.handleCommand({ type: 'JoinGame' }, p2, s2);
      expect(testArea.game.players).toHaveLength(2);
      expect(testArea.game.players[1].id).toBe(p2.id);
      expect(interactableUpdateSpy).toBeCalled();
    });
    it('Leave Game Command', () => {
      const p1 = new Player(nanoid(), townEmitter);
      const p2 = new Player(nanoid(), townEmitter);
      const s1 = mock<CoveyTownSocket>();
      const s2 = mock<CoveyTownSocket>();
      addPlayers(p1, p2);
      testArea.handleCommand({ type: 'JoinGame' }, p1, s1);
      testArea.handleCommand({ type: 'JoinGame' }, p2, s2);
      expect(testArea.game.players).toHaveLength(2);
      testArea.handleCommand({ type: 'LeaveGame', gameID: testArea.game.townID }, p1, s1);
      expect(interactableUpdateSpy).toBeCalled();
      expect(testArea.game.players).toHaveLength(1);
      expect(testArea.game.players.filter(p => p.id !== p1.id)).toHaveLength(1);
    });

    it('should should update player status when start game command is received', () => {
      const p1 = new Player(nanoid(), townEmitter);
      const p2 = new Player(nanoid(), townEmitter);
      const s1 = mock<CoveyTownSocket>();
      const s2 = mock<CoveyTownSocket>();
      addPlayers(p1);
      testArea.handleCommand({ type: 'JoinGame' }, p1, s1);
      testArea.handleCommand({ type: 'JoinGame' }, p2, s2);
      const isPlayer1 = testArea.game.state.playerOne === p1.id;
      const isPlayer2 = testArea.game.state.playerTwo === p1.id;
      expect(isPlayer1 !== isPlayer2).toBeTruthy();
      testArea.handleCommand({ type: 'StartGame', gameID: testArea.game.townID }, p1, s1);
      expect(interactableUpdateSpy).toBeCalled();
      if (isPlayer1) {
        expect(testArea.game.state.playerOneReady).toBeTruthy();
      } else {
        expect(testArea.game.state.playerTwoReady).toBeTruthy();
      }
    });
    it('should start the game when both players are ready', () => {
      jest
        .spyOn(MapStore, 'getInstance')
        .mockImplementation(() => new TestMapStore(simpleMap) as unknown as MapStore);
      const p1 = new Player(nanoid(), townEmitter);
      const p2 = new Player(nanoid(), townEmitter);
      const s1 = mock<CoveyTownSocket>();
      const s2 = mock<CoveyTownSocket>();
      addPlayers(p1);
      testArea.handleCommand({ type: 'JoinGame' }, p1, s1);
      testArea.handleCommand({ type: 'JoinGame' }, p2, s2);
      testArea.handleCommand({ type: 'StartGame', gameID: testArea.game.townID }, p1, s1);
      expect(interactableUpdateSpy).toBeCalled();
      interactableUpdateSpy.mockClear();
      testArea.handleCommand({ type: 'StartGame', gameID: testArea.game.townID }, p2, s2);
      expect(interactableUpdateSpy).toBeCalled();
      interactableUpdateSpy.mockClear();
      expect(testArea.game.state.status).toBe('IN_PROGRESS');
    });

    it('should reset the game when the game is over', () => {
      jest
        .spyOn(MapStore, 'getInstance')
        .mockImplementation(() => new TestMapStore(simpleMap) as unknown as MapStore);
      const p1 = new Player(nanoid(), townEmitter);
      const p2 = new Player(nanoid(), townEmitter);
      const s1 = mock<CoveyTownSocket>();
      const s2 = mock<CoveyTownSocket>();
      addPlayers(p1);
      testArea.handleCommand({ type: 'JoinGame' }, p1, s1);
      testArea.handleCommand({ type: 'JoinGame' }, p2, s2);
      testArea.handleCommand({ type: 'StartGame', gameID: testArea.game.townID }, p1, s1);
      testArea.handleCommand({ type: 'StartGame', gameID: testArea.game.townID }, p2, s2);
      testArea.game.state.status = 'OVER';
      testArea.handleCommand({ type: 'JoinGame' }, p1, s1);
      expect(testArea.game.players).toHaveLength(1);
    });
  });

  it('should set the corrdinates of the area based on the map file.', () => {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const map: any = {
      name: 'Undercooked',
      width: 100,
      height: 100,
      x: 0,
      y: 0,
    } as unknown as ITiledMap;
    jest
      .spyOn(MapStore, 'getInstance')
      .mockImplementation(() => new TestMapStore(simpleMap) as unknown as MapStore);
    const area = UndercookedArea.fromMapObject(map, townEmitter);
    expect(area.boundingBox).toEqual({ x: 0, y: 0, width: 100, height: 100 });
    expect(area.id).toBe('Undercooked');
  });
});
