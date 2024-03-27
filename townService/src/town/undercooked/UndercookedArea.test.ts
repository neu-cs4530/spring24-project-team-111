import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../../lib/Player';
import { CoveyTownSocket, TownEmitter } from '../../types/CoveyTownSocket';
import UndercookedArea from './UndercookedArea';

describe('ConversationArea', () => {
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
      expect(testArea.game.players).toHaveLength(1);
      expect(testArea.game.players.filter(p => p.id !== p1.id)).toHaveLength(1);
    });

    // it('should throw an error if the gameID does not match the gameID of the game when leaving.', () => {
    //   const p1 = new Player(nanoid(), townEmitter);
    //   const s1 = mock<CoveyTownSocket>();
    //   addPlayers(p1);
    //   testArea.handleCommand({ type: 'JoinGame' }, p1, s1);
    //   expect(() =>
    //     testArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, p1, s1),
    //   ).toThrow();
    // });

    // it('should throw an error if the gameID does not match the gameID of the game when starting.', () => {
    //   const p1 = new Player(nanoid(), townEmitter);
    //   const s1 = mock<CoveyTownSocket>();
    //   addPlayers(p1);
    //   testArea.handleCommand({ type: 'JoinGame' }, p1, s1);
    //   expect(() =>
    //     testArea.handleCommand({ type: 'StartGame', gameID: nanoid() }, p1, s1),
    //   ).toThrow();
    // });

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
      if (isPlayer1) {
        expect(testArea.game.state.playerOneReady).toBeTruthy();
      } else {
        expect(testArea.game.state.playerTwoReady).toBeTruthy();
      }
    });
  });
});
