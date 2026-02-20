const Player = require('../src/player');

describe('Player', () => {
  describe('constructor', () => {
    test('should create player with valid name', () => {
      const player = new Player('John Doe');
      expect(player.name).toBe('John Doe');
      expect(player.runningTotal).toBe(0);
      expect(player.id).toBeDefined();
    });

    test('should trim whitespace from name', () => {
      const player = new Player('  Jane Smith  ');
      expect(player.name).toBe('Jane Smith');
    });

    test('should throw error for empty name', () => {
      expect(() => new Player('')).toThrow('Player name is required');
      expect(() => new Player('   ')).toThrow('Player name is required');
    });

    test('should throw error for invalid name types', () => {
      expect(() => new Player(null)).toThrow('Player name is required');
      expect(() => new Player(undefined)).toThrow('Player name is required');
      expect(() => new Player(123)).toThrow('Player name is required');
    });
  });

  describe('addPoints', () => {
    test('should add positive points', () => {
      const player = new Player('Test Player');
      player.addPoints(10);
      expect(player.runningTotal).toBe(10);
    });

    test('should add negative points', () => {
      const player = new Player('Test Player');
      player.addPoints(15);
      player.addPoints(-5);
      expect(player.runningTotal).toBe(10);
    });

    test('should throw error for invalid points', () => {
      const player = new Player('Test Player');
      expect(() => player.addPoints('invalid')).toThrow('Points must be a valid number');
      expect(() => player.addPoints(NaN)).toThrow('Points must be a valid number');
    });
  });

  describe('getScore', () => {
    test('should return current running total', () => {
      const player = new Player('Test Player');
      player.addPoints(25);
      expect(player.getScore()).toBe(25);
    });
  });

  describe('resetScore', () => {
    test('should reset running total to zero', () => {
      const player = new Player('Test Player');
      player.addPoints(50);
      player.resetScore();
      expect(player.runningTotal).toBe(0);
    });
  });

  describe('toJSON', () => {
    test('should return player data as object', () => {
      const player = new Player('Test Player');
      player.addPoints(15);
      const json = player.toJSON();
      
      expect(json).toEqual({
        id: player.id,
        name: 'Test Player',
        runningTotal: 15
      });
    });
  });
});