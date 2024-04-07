import { ITiledMapObjectLayer } from '@jonbell/tiled-map-type-guard';
import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { GAME_FULL_MESSAGE } from '../../lib/InvalidParametersError';
import MapStore from '../../lib/MapStore';
import Player from '../../lib/Player';
import { CoveyTownSocket, TownEmitter, UndercookedIngredient } from '../../types/CoveyTownSocket';
import { TestMapStore, mapWithStations, simpleMap } from '../../TestUtils';
import UndercookedTown from './UndercookedTown';

describe('UndercookedTown', () => {
  const townEmitter = mock<TownEmitter>();
  const id = nanoid();
  let town: UndercookedTown;

  beforeEach(() => {
    town = new UndercookedTown(id, townEmitter);
    mockClear(townEmitter);
  });

  describe('Joining the game', () => {
    it('should allow players to join', () => {
      const p1 = new Player(nanoid(), townEmitter);
      const p2 = new Player(nanoid(), townEmitter);
      const s1 = mock<CoveyTownSocket>();
      const s2 = mock<CoveyTownSocket>();
      expect(town.players.length).toBe(0);
      town.join(p1, s1);
      expect(town.players.length).toBe(1);
      expect(town.players[0].id).toBe(p1.id);
      town.join(p2, s2);
      expect(town.players.length).toBe(2);
      expect(town.players[1].id).toBe(p2.id);
      expect(town.players[0].id).toBe(p1.id);
    });
    it('should keep the status as waiting for players if minimum players are not met', () => {
      const p1 = new Player(nanoid(), townEmitter);
      const s1 = mock<CoveyTownSocket>();
      expect(town.state.status).toBe('WAITING_FOR_PLAYERS');
      town.join(p1, s1);
      expect(town.state.status).toBe('WAITING_FOR_PLAYERS');
    });
    it('should change the status to ready if minimum players are met', () => {
      const p1 = new Player(nanoid(), townEmitter);
      const p2 = new Player(nanoid(), townEmitter);
      const s1 = mock<CoveyTownSocket>();
      const s2 = mock<CoveyTownSocket>();
      expect(town.state.status).toBe('WAITING_FOR_PLAYERS');
      town.join(p1, s1);
      expect(town.state.status).toBe('WAITING_FOR_PLAYERS');
      town.join(p2, s2);
      expect(town.state.status).toBe('WAITING_TO_START');
    });
    it('should assign player1 or player2 to the joining player', () => {
      const p1 = new Player(nanoid(), townEmitter);
      const p2 = new Player(nanoid(), townEmitter);
      const s1 = mock<CoveyTownSocket>();
      const s2 = mock<CoveyTownSocket>();
      town.join(p1, s1);
      expect(town.state.playerOne).toBe(p1.id);
      town.join(p2, s2);
      expect(town.state.playerTwo).toBe(p2.id);
    });
    it('should throw and error if a player tries to join a full game', () => {
      const p1 = new Player(nanoid(), townEmitter);
      const p2 = new Player(nanoid(), townEmitter);
      const p3 = new Player(nanoid(), townEmitter);
      const s1 = mock<CoveyTownSocket>();
      const s2 = mock<CoveyTownSocket>();
      const s3 = mock<CoveyTownSocket>();
      town.join(p1, s1);
      town.join(p2, s2);
      expect(() => town.join(p3, s3)).toThrowError(GAME_FULL_MESSAGE);
    });
  });

  describe('Leave the game', () => {
    let p1: Player;
    let p2: Player;

    beforeEach(() => {
      p1 = new Player(nanoid(), townEmitter);
      p2 = new Player(nanoid(), townEmitter);
      const s1 = mock<CoveyTownSocket>();
      const s2 = mock<CoveyTownSocket>();
      town.join(p1, s1);
      town.join(p2, s2);
      mockClear(townEmitter);
    });
    it('should allow a player to leave', () => {
      expect(town.players.length).toBe(2);
      town.leave(p1);
      expect(town.players.length).toBe(1);
      town.leave(p2);
      expect(town.players.length).toBe(0);
      expect(!town.state.playerOne && !town.state.playerTwo).toBeTruthy();
    });
    it('should change the status to waiting for players if a player leaves', () => {
      expect(town.state.status).toBe('WAITING_TO_START');
      town.leave(p1);
      expect(town.state.status).toBe('WAITING_FOR_PLAYERS');
    });
    it('should change the status to over if a player leaves while game in progress', () => {
      town.state = { ...town.state, status: 'IN_PROGRESS' };
      expect(town.state.status).toBe('IN_PROGRESS');
      town.leave(p1);
      expect(town.state.status).toBe('OVER');
    });
    it('should chnage ready status to not ready if a player leaves', () => {
      town.state = { ...town.state, playerOneReady: true, playerTwoReady: true };
      expect(town.state.playerOneReady).toBe(true);
      expect(town.state.playerTwoReady).toBe(true);
      town.leave(p1);
      expect(town.state.playerOneReady).toBe(false);
      expect(town.state.playerTwoReady).toBe(true);
    });
  });
  describe('Setting ready status', () => {
    let p1: Player;
    let p2: Player;
    let s1: CoveyTownSocket;
    let s2: CoveyTownSocket;

    beforeEach(() => {
      jest
        .spyOn(MapStore, 'getInstance')
        .mockImplementation(() => new TestMapStore(simpleMap) as unknown as MapStore);
      p1 = new Player(nanoid(), townEmitter);
      p2 = new Player(nanoid(), townEmitter);
      s1 = mock<CoveyTownSocket>();
      s2 = mock<CoveyTownSocket>();
      town.join(p1, s1);
      town.join(p2, s2);
      mockClear(townEmitter);
    });
    it('should change the status to in progress if both players are ready', () => {
      expect(town.state.status).toBe('WAITING_TO_START');
      town.startGame(p1);
      expect(town.state.status).toBe('WAITING_TO_START');
      town.startGame(p2);
      expect(town.state.status).toBe('IN_PROGRESS');
    });
    it('should set player ready status to true if player is ready', () => {
      expect(town.state.playerOneReady).toBe(false);
      town.startGame(p1);
      expect(town.state.playerOneReady).toBe(true);
      expect(town.state.playerTwoReady).toBe(false);
      town.startGame(p2);
      expect(town.state.playerTwoReady).toBe(true);
    });
  });
  describe('Game start handlers.', () => {
    let p1: Player;
    let p2: Player;
    let s1: CoveyTownSocket;
    let s2: CoveyTownSocket;

    beforeEach(() => {
      jest
        .spyOn(MapStore, 'getInstance')
        .mockImplementation(() => new TestMapStore(mapWithStations) as unknown as MapStore);
      p1 = new Player(nanoid(), townEmitter);
      p2 = new Player(nanoid(), townEmitter);
      s1 = mock<CoveyTownSocket>();
      s2 = mock<CoveyTownSocket>();
      town.join(p1, s1);
      town.join(p2, s2);
      mockClear(townEmitter);
    });

    it('should create all the stations when the game starts', () => {
      expect(town.interactables.length).toBe(0);
      town.startGame(p1);
      town.startGame(p2);
      expect(town.interactables.length).toBe(2);
      const objectLayer = mapWithStations.layers.find(
        eachLayer => eachLayer.name === 'Objects',
      ) as ITiledMapObjectLayer;
      expect(town.interactables[0].id).toBe(objectLayer.objects[0].name);
      expect(town.interactables[1].id).toBe(objectLayer.objects[1].name);
    });

    it('should set listeners for players actions for client events', () => {
      town.startGame(p1);
      town.startGame(p2);
      expect(s1.on).toBeCalledWith('ucPlayerMovement', expect.any(Function));
      expect(s1.on).toBeCalledWith('interactableCommand', expect.any(Function));
    });

    it('should clean up handlers when players leaves and handlers exist.', () => {
      town.startGame(p1);
      town.startGame(p2);
      expect(s1.on).toBeCalledWith('ucPlayerMovement', expect.any(Function));
      expect(s1.on).toBeCalledWith('interactableCommand', expect.any(Function));
      expect(town.state.status).toBe('IN_PROGRESS');
      town.leave(p1);
      expect(s1.removeListener).toBeCalledWith('ucPlayerMovement', expect.any(Function));
      expect(s1.removeListener).toBeCalledWith('interactableCommand', expect.any(Function));
    });
  });
  describe('Handling in game events', () => {
    let p1: Player;
    let p2: Player;
    let s1: CoveyTownSocket;
    let s2: CoveyTownSocket;

    beforeEach(() => {
      jest
        .spyOn(MapStore, 'getInstance')
        .mockImplementation(() => new TestMapStore(mapWithStations) as unknown as MapStore);
      p1 = new Player(nanoid(), townEmitter);
      p2 = new Player(nanoid(), townEmitter);
      s1 = mock<CoveyTownSocket>();
      s2 = mock<CoveyTownSocket>();
      town.join(p1, s1);
      town.join(p2, s2);
      mockClear(townEmitter);
      town.startGame(p1);
      town.startGame(p2);
    });

    it('should generate an initial recipe', () => {
      expect(town.state.currentRecipe).toBeDefined();
      expect(town.state.currentAssembled).toEqual([]);
    });

    it('should add an ingredient to current assembled recipe if the ingredient is correct', () => {
      const correctIngredient = town.state.currentRecipe[0];
      town.applyMove({ gameID: town.townID, playerID: p1.id, move: { gamePiece: correctIngredient } });
      expect(town.state.currentAssembled).toEqual([correctIngredient]);
    });

    it('should not add an ingredient to current assembled recipe if the ingredient is incorrect' , () => {
      const ingredientList: UndercookedIngredient[] = ['Egg', 'Fries', 'Milk', 'Rice', 'Salad', 'Steak'];
      const incorrectIngredient = ingredientList.find(ingredient => !town.state.currentRecipe.includes(ingredient));
      if (incorrectIngredient) {
        town.applyMove({ gameID: town.townID, playerID: p1.id, move: { gamePiece: incorrectIngredient } });
        expect(town.state.currentAssembled).toEqual([]);
      }
      const correctIngredient = town.state.currentRecipe[0];
      town.applyMove({ gameID: town.townID, playerID: p1.id, move: { gamePiece: correctIngredient } });
      expect(town.state.currentAssembled).toEqual([correctIngredient]);
      town.applyMove({ gameID: town.townID, playerID: p1.id, move: { gamePiece: correctIngredient } });
      expect(town.state.currentAssembled).toEqual([correctIngredient]);
    });
  });
});
