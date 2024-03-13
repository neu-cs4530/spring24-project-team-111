import { MockProxy, mock, mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import GamePlayer from '../../lib/GamePlayer';
import {
  Direction,
  TownEmitter as GameEmitter,
  CoveyTownSocket as GameSocket,
} from '../../types/CoveyTownSocket';
import GameMotionManager from './GameMotionManager';
import { getEventListener, getLastEmittedEvent } from '../../TestUtils';

/**
 * A mocked player for testing purposes.
 */
class MockedPlayer {
  socket: MockProxy<GameSocket>;

  player: GamePlayer;

  constructor(socket: MockProxy<GameSocket>, player: GamePlayer) {
    this.socket = socket;
    this.player = player;
  }

  public moveTo(x: number, y: number, rotation: Direction = 'front', moving = false) {
    const onMovementListener = getEventListener(this.socket, 'playerMovement');
    onMovementListener({ x, y, rotation, moving });
  }
}

function createPlayerForTesting(): GamePlayer {
  const username = (Math.random() + 1).toString(36).substring(7);
  return new GamePlayer(username, nanoid());
}

function createMockPlayer(gameId: string): MockedPlayer {
  const player = createPlayerForTesting();
  const socket = mock<GameSocket>();
  const emitter: DeepMockProxy<GameEmitter> = mockDeep<GameEmitter>();

  socket.to.mockImplementation((room: string | string[]) => {
    if (room === gameId) {
      return emitter;
    }
    const msg = `Tried to broadcast to ${room} but this player is in ${gameId}`;
    throw new Error(msg);
  });
  return new MockedPlayer(socket, player);
}

describe('Motion Manager.', () => {
  let manager: GameMotionManager;
  let mockPlayer: MockedPlayer;
  let emitter: DeepMockProxy<GameEmitter>;
  let gameId: string;

  beforeEach(async () => {
    gameId = nanoid();
    mockPlayer = createMockPlayer(gameId);
    emitter = mockDeep<GameEmitter>();
    manager = new GameMotionManager(emitter);
  });

  describe('Adding and removing players.', () => {
    let players: MockedPlayer[];

    beforeEach(() => {
      const player1 = createMockPlayer(gameId);
      const player2 = createMockPlayer(gameId);
      const player3 = createMockPlayer(gameId);
      players = [player1, player2, player3];
    });

    it('should register/add players.', () => {
      expect(manager.players.length).toBe(0);
      players.forEach(p => manager.register(p.player, p.socket));
      expect(manager.players.length).toBe(3);
      players.forEach(p => {
        expect(manager.players.find(player => player === p.player)).toBeTruthy();
      });
    });

    it('should deregister/remove players.', () => {
      const idx = Math.floor(Math.random() * players.length);
      const playerBeingRemoved = players[idx];
      players.forEach(p => manager.register(p.player, p.socket));

      expect(manager.players.length).toBe(3);
      manager.deregister(playerBeingRemoved.player);

      expect(manager.players.length).toBe(2);
      players
        .filter(p => p !== playerBeingRemoved)
        .forEach(p => {
          expect(manager.players.find(player => player === p.player)).toBeTruthy();
        });

      expect(manager.players.find(p => p === playerBeingRemoved.player)).toBeFalsy();
    });

    it('should remove listener is tracking is active and player is removed.', () => {
      const { socket, player } = players[0];
      manager.register(player, socket);
      manager.watch(player);
      expect(manager.isWatching(player)).toBeTruthy();
      manager.deregister(player);
      expect(socket.removeListener).toBeCalledWith('playerMovement', expect.any(Function));
      expect(manager.isWatching(player)).toBeFalsy();
    });

    it('should remove all players', () => {
      players.forEach(p => manager.register(p.player, p.socket));
      expect(manager.players.length).toBe(3);
      manager.deregisterAll();
      expect(manager.players.length).toBe(0);
    });
  });

  describe('Tracking player movement.', () => {
    let player: GamePlayer;
    let socket: GameSocket;

    beforeEach(() => {
      socket = mockPlayer.socket;
      player = mockPlayer.player;
    });

    it('should determine whether a player is being tracked', () => {
      expect(manager.isWatching(player)).toBeFalsy();
      manager.register(player, socket);
      manager.watch(player);
      expect(manager.isWatching(player)).toBeTruthy();
    });

    it('should add listeners for player movement.', async () => {
      manager.register(player, socket);
      expect(manager.isWatching(player)).toBeFalsy();
      await manager.watch(mockPlayer.player);
      expect(socket.on).toBeCalledWith('playerMovement', expect.any(Function));
      expect(manager.isWatching(player)).toBeTruthy();
    });

    it('should remove listeners for player movement.', async () => {
      manager.register(player, socket);
      await manager.watch(mockPlayer.player);
      expect(manager.isWatching(player)).toBeTruthy();
      await manager.stopWatching(player);
      expect(socket.removeListener).toBeCalledWith('playerMovement', expect.any(Function));
      expect(manager.isWatching(player)).toBeFalsy();
    });

    it('should add listeners to all players.', async () => {
      const player1 = createMockPlayer(gameId);
      const player2 = createMockPlayer(gameId);
      const players = [player1, player2];
      players.forEach(p => manager.register(p.player, p.socket));

      await manager.watchAll();
      players.forEach(p => {
        expect(p.socket.on).toBeCalledWith('playerMovement', expect.any(Function));
      });
      players.forEach(p => {
        expect(manager.isWatching(p.player)).toBeTruthy();
      });
    });

    it('should remove listeners to all players.', async () => {
      const player1 = createMockPlayer(gameId);
      const player2 = createMockPlayer(gameId);
      const players = [player1, player2];
      players.forEach(p => manager.register(p.player, p.socket));

      await manager.watchAll();
      players.forEach(p => {
        expect(manager.isWatching(p.player)).toBeTruthy();
      });

      await manager.stopWatchingAll();
      players.forEach(p => {
        expect(p.socket.removeListener).toBeCalledWith('playerMovement', expect.any(Function));
      });
      players.forEach(p => {
        expect(manager.isWatching(p.player)).toBeFalsy();
      });
    });

    it('should emit player movement events.', async () => {
      const player1 = createMockPlayer(gameId);
      const player2 = createMockPlayer(gameId);
      const players = [player1, player2];
      players.forEach(p => manager.register(p.player, p.socket));

      await manager.watchAll();
      const x = Math.floor(Math.random() * 100);
      const y = Math.floor(Math.random() * 100);
      const rotation: Direction = 'front';
      const moving = false;

      players.forEach(p => {
        p.moveTo(x, y, rotation, moving);
        const model = p.player.toPlayerModel();
        expect(emitter.emit).toBeCalledWith('playerMoved', model);
        expect(getLastEmittedEvent(emitter, 'playerMoved')).toEqual(model);
      });
    });
  });
});
