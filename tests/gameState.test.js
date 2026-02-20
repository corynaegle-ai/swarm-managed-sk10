const GameState = require('../src/gameState');

describe('GameState', () => {
  let gameState;

  beforeEach(() => {
    gameState = new GameState();
  });

  describe('addPlayer', () => {
    test('should successfully add valid player', () => {
      const result = gameState.addPlayer('John Doe');
      
      expect(result.success).toBe(true);
      expect(result.player.name).toBe('John Doe');
      expect(result.validationStatus).toBeDefined();
    });

    test('should fail for duplicate names', () => {
      gameState.addPlayer('John Doe');
      const result = gameState.addPlayer('John Doe');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('unique');
    });

    test('should fail to add players after game starts', () => {
      gameState.addPlayer('Player 1');
      gameState.addPlayer('Player 2');
      gameState.startGame();
      
      const result = gameState.addPlayer('Player 3');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('after game has started');
    });
  });

  describe('startGame', () => {
    test('should fail with insufficient players', () => {
      const result = gameState.startGame();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Need');
    });

    test('should succeed with valid player count', () => {
      gameState.addPlayer('Player 1');
      gameState.addPlayer('Player 2');
      
      const result = gameState.startGame();
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('started successfully');
      expect(result.players).toHaveLength(2);
    });

    test('should fail if game already started', () => {
      gameState.addPlayer('Player 1');
      gameState.addPlayer('Player 2');
      gameState.startGame();
      
      const result = gameState.startGame();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('already started');
    });
  });

  describe('getPlayersForDisplay', () => {
    test('should return formatted player data', () => {
      gameState.addPlayer('Alice');
      gameState.addPlayer('Bob');
      
      const displayPlayers = gameState.getPlayersForDisplay();
      
      expect(displayPlayers).toHaveLength(2);
      expect(displayPlayers[0]).toMatchObject({
        name: 'Alice',
        score: 0,
        position: 1
      });
      expect(displayPlayers[1]).toMatchObject({
        name: 'Bob',
        score: 0,
        position: 2
      });
    });
  });

  describe('reset', () => {
    test('should reset game to initial state', () => {
      gameState.addPlayer('Player 1');
      gameState.addPlayer('Player 2');
      gameState.startGame();
      
      gameState.reset();
      
      const state = gameState.getState();
      expect(state.gameStarted).toBe(false);
      expect(state.currentRound).toBe(0);
      expect(state.players).toHaveLength(0);
    });
  });
});