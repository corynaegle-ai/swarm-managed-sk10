const PlayerManager = require('../src/playerManager');

describe('PlayerManager', () => {
  let manager;

  beforeEach(() => {
    manager = new PlayerManager();
  });

  describe('addPlayer', () => {
    test('should add valid player', () => {
      const player = manager.addPlayer('John Doe');
      expect(player.name).toBe('John Doe');
      expect(manager.getPlayerCount()).toBe(1);
    });

    test('should prevent duplicate names (case insensitive)', () => {
      manager.addPlayer('John Doe');
      expect(() => manager.addPlayer('john doe')).toThrow('Player name must be unique');
      expect(() => manager.addPlayer('JOHN DOE')).toThrow('Player name must be unique');
    });

    test('should prevent adding more than 8 players', () => {
      for (let i = 1; i <= 8; i++) {
        manager.addPlayer(`Player ${i}`);
      }
      expect(() => manager.addPlayer('Player 9')).toThrow('Cannot add more than 8 players');
    });
  });

  describe('isNameTaken', () => {
    test('should return false for available names', () => {
      manager.addPlayer('John Doe');
      expect(manager.isNameTaken('Jane Smith')).toBe(false);
    });

    test('should return true for taken names', () => {
      manager.addPlayer('John Doe');
      expect(manager.isNameTaken('John Doe')).toBe(true);
      expect(manager.isNameTaken('john doe')).toBe(true);
    });
  });

  describe('removePlayer', () => {
    test('should remove player by ID', () => {
      const player = manager.addPlayer('John Doe');
      const removed = manager.removePlayer(player.id);
      
      expect(removed).toBe(true);
      expect(manager.getPlayerCount()).toBe(0);
    });

    test('should return false for non-existent player', () => {
      const removed = manager.removePlayer('non-existent-id');
      expect(removed).toBe(false);
    });
  });

  describe('canStartGame', () => {
    test('should return false with fewer than 2 players', () => {
      expect(manager.canStartGame()).toBe(false);
      
      manager.addPlayer('Player 1');
      expect(manager.canStartGame()).toBe(false);
    });

    test('should return true with 2-8 players', () => {
      manager.addPlayer('Player 1');
      manager.addPlayer('Player 2');
      expect(manager.canStartGame()).toBe(true);
      
      for (let i = 3; i <= 8; i++) {
        manager.addPlayer(`Player ${i}`);
        expect(manager.canStartGame()).toBe(true);
      }
    });
  });

  describe('getValidationStatus', () => {
    test('should return correct status for empty game', () => {
      const status = manager.getValidationStatus();
      
      expect(status.playerCount).toBe(0);
      expect(status.canStartGame).toBe(false);
      expect(status.needsMorePlayers).toBe(true);
      expect(status.message).toContain('Need 2 more players');
    });

    test('should return correct status for valid game', () => {
      manager.addPlayer('Player 1');
      manager.addPlayer('Player 2');
      
      const status = manager.getValidationStatus();
      
      expect(status.playerCount).toBe(2);
      expect(status.canStartGame).toBe(true);
      expect(status.needsMorePlayers).toBe(false);
      expect(status.message).toContain('Ready to start');
    });
  });

  describe('clearPlayers', () => {
    test('should remove all players', () => {
      manager.addPlayer('Player 1');
      manager.addPlayer('Player 2');
      
      manager.clearPlayers();
      
      expect(manager.getPlayerCount()).toBe(0);
      expect(manager.getPlayers()).toEqual([]);
    });
  });
});