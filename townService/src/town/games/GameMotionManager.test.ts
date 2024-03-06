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

    const player2Socket = mockDeep<GameSocket>();
    const player2 = mockGamePlayer();
    manager.addPlayer(player2, player2Socket);
    expect(manager.players.length).toBe(2);
    expect(manager.players.find(p => p === player2)).toBeTruthy();
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
});
