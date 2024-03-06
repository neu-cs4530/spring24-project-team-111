import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import GamePlayer from '../../lib/GamePlayer';
import { GameEmitter, GameSocket } from '../../types/CoveyTownSocket';
import GameMotionManager from './GameMotionManager';

function mockGamePlayer(): GamePlayer {
  return new GamePlayer('testName', nanoid());
}

describe('Motion Manager', () => {
  const gameEmitter: DeepMockProxy<GameEmitter> = mockDeep<GameEmitter>();
  let manager: GameMotionManager;

  beforeEach(async () => {
    manager = new GameMotionManager(gameEmitter);
  });

  it('should add players', () => {
    const player1Socket = mockDeep<GameSocket>();
    const player1 = mockGamePlayer();
    manager.addPlayer(player1, player1Socket);
    expect(manager.players.length).toBe(1);
    expect(manager.players.find(p => p === player1)).toBeTruthy();
  });

  it('should remove players', () => {
    const player1Socket = mockDeep<GameSocket>();
    const player1 = mockGamePlayer();
    manager.addPlayer(player1, player1Socket);
    expect(manager.players.length).toBe(1);
    expect(manager.players.find(p => p === player1)).toBeTruthy();

    manager.removePlayer(player1);
    expect(manager.players.length).toBe(0);
    expect(manager.players.find(p => p === player1)).toBeFalsy();
  });

  it('should return a list of players being managed', () => {
    expect(manager.players.length).toBe(0);

    const player1Socket = mockDeep<GameSocket>();
    const player2Socket = mockDeep<GameSocket>();
    const player3Socket = mockDeep<GameSocket>();
    const player1 = mockGamePlayer();
    const player2 = mockGamePlayer();
    const player3 = mockGamePlayer();

    manager.addPlayer(player1, player1Socket);
    manager.addPlayer(player2, player2Socket);
    manager.addPlayer(player3, player3Socket);
    const sortCriteria = (a: GamePlayer, b: GamePlayer) => a.id.localeCompare(b.id);
    const managedPlayers = [player1, player2, player3].sort(sortCriteria);

    expect(manager.players.sort(sortCriteria)).toEqual(managedPlayers);
  });

  // it('should ')
});
