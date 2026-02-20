// Test file for app.js functionality
const { TricksterGame } = require('../js/app.js');

// Mock DOM elements
const mockDOM = {
  getElementById: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(),
  createElement: jest.fn(),
  addEventListener: jest.fn()
};

// Mock window object
global.window = {
  calculateRoundScore: jest.fn((predicted, actual, bonus) => {
    if (predicted === actual) {
      return 10 + actual + (bonus ? 5 : 0);
    }
    return -Math.abs(predicted - actual);
  })
};

global.document = mockDOM;

describe('TricksterGame', () => {
  let game;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock form elements
    mockDOM.getElementById.mockImplementation((id) => {
      const elements = {
        'num-players': { value: '4', addEventListener: jest.fn() },
        'start-game': { addEventListener: jest.fn() },
        'trick-entry-form': { 
          addEventListener: jest.fn(),
          reset: jest.fn()
        },
        'clear-form': { addEventListener: jest.fn() },
        'new-game': { addEventListener: jest.fn() },
        'player-names': { innerHTML: '' },
        'current-round': { textContent: '' },
        'round-display': { textContent: '' },
        'hand-count': { textContent: '' },
        'player-tricks-container': { innerHTML: '' },
        'scoreboard-container': { innerHTML: '' },
        'error-container': { 
          style: { display: 'none' }, 
          innerHTML: '' 
        }
      };
      return elements[id] || null;
    });
    
    mockDOM.querySelectorAll.mockReturnValue([]);
    mockDOM.querySelector.mockReturnValue(null);
    
    game = new TricksterGame();
  });
  
  describe('Form submission handling', () => {
    test('should prevent default form submission', () => {
      const mockEvent = {
        preventDefault: jest.fn()
      };
      
      // Setup mock form data
      game.players = [
        { id: 1, name: 'Player 1', totalScore: 0, roundScores: [] }
      ];
      
      game.currentRound = 1;
      
      // Mock form extraction to return valid data
      game.extractFormData = jest.fn().mockReturnValue([
        { playerId: 1, playerName: 'Player 1', predicted: 3, actual: 3, bonus: false }
      ]);
      
      // Mock validation to pass
      game.validateTrickEntry = jest.fn().mockReturnValue({ isValid: true });
      
      game.handleTrickSubmission();
      
      // Verify form processing occurred
      expect(game.extractFormData).toHaveBeenCalled();
    });
    
    test('should display validation errors', () => {
      game.players = [
        { id: 1, name: 'Player 1', totalScore: 0, roundScores: [] }
      ];
      
      game.currentRound = 1;
      
      // Mock form extraction to return valid data
      game.extractFormData = jest.fn().mockReturnValue([
        { playerId: 1, playerName: 'Player 1', predicted: 3, actual: 2, bonus: false }
      ]);
      
      // Mock validation to fail
      game.validateTrickEntry = jest.fn().mockReturnValue({ 
        isValid: false, 
        error: 'Total tricks must equal 5' 
      });
      
      game.showError = jest.fn();
      
      game.handleTrickSubmission();
      
      expect(game.showError).toHaveBeenCalledWith('Total tricks must equal 5');
    });
  });
  
  describe('Form data extraction', () => {
    test('should extract trick values and bonus selections', () => {
      game.players = [
        { id: 1, name: 'Player 1' },
        { id: 2, name: 'Player 2' }
      ];
      
      // Mock input elements
      const mockInputs = {
        'input.predicted-tricks[data-player-id="1"]': { value: '3' },
        'input.actual-tricks[data-player-id="1"]': { value: '2' },
        'input.bonus-earned[data-player-id="1"]': { checked: true },
        'input.predicted-tricks[data-player-id="2"]': { value: '2' },
        'input.actual-tricks[data-player-id="2"]': { value: '3' },
        'input.bonus-earned[data-player-id="2"]': { checked: false }
      };
      
      mockDOM.querySelector.mockImplementation((selector) => {
        return mockInputs[selector] || null;
      });
      
      const result = game.extractFormData();
      
      expect(result).toEqual([
        { playerId: 1, playerName: 'Player 1', predicted: 3, actual: 2, bonus: true },
        { playerId: 2, playerName: 'Player 2', predicted: 2, actual: 3, bonus: false }
      ]);
    });
    
    test('should return null for invalid form data', () => {
      game.players = [
        { id: 1, name: 'Player 1' }
      ];
      
      // Mock missing inputs
      mockDOM.querySelector.mockReturnValue(null);
      
      const result = game.extractFormData();
      
      expect(result).toBeNull();
    });
  });
  
  describe('Validation', () => {
    test('should validate trick totals match hand count', () => {
      const playerTricks = [
        { predicted: 2, actual: 2, playerName: 'Player 1' },
        { predicted: 3, actual: 3, playerName: 'Player 2' }
      ];
      
      const result = game.validateTrickEntry(playerTricks, 5);
      
      expect(result.isValid).toBe(true);
    });
    
    test('should reject when totals do not match', () => {
      const playerTricks = [
        { predicted: 2, actual: 2, playerName: 'Player 1' },
        { predicted: 3, actual: 4, playerName: 'Player 2' }
      ];
      
      const result = game.validateTrickEntry(playerTricks, 5);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must equal hand count');
    });
  });
  
  describe('Score updates', () => {
    test('should update player scores after successful entry', () => {
      game.players = [
        { id: 1, name: 'Player 1', totalScore: 0, roundScores: [] }
      ];
      
      game.currentRound = 1;
      game.updatePlayerScoreDisplay = jest.fn();
      
      const playerTricks = [
        { playerId: 1, playerName: 'Player 1', predicted: 3, actual: 3, bonus: true }
      ];
      
      game.updatePlayerScores(playerTricks);
      
      expect(game.players[0].roundScores[0]).toBe(18); // 10 + 3 + 5 bonus
      expect(game.players[0].totalScore).toBe(18);
      expect(game.updatePlayerScoreDisplay).toHaveBeenCalledWith(game.players[0]);
    });
  });
  
  describe('Game progression', () => {
    test('should advance to next round after successful submission', () => {
      game.currentRound = 5;
      game.maxRounds = 10;
      game.clearForm = jest.fn();
      game.setupGameRound = jest.fn();
      game.showSuccess = jest.fn();
      
      game.advanceToNextRound();
      
      expect(game.currentRound).toBe(6);
      expect(game.clearForm).toHaveBeenCalled();
      expect(game.setupGameRound).toHaveBeenCalled();
      expect(game.showSuccess).toHaveBeenCalled();
    });
    
    test('should end game after final round', () => {
      game.currentRound = 10;
      game.maxRounds = 10;
      game.endGame = jest.fn();
      
      game.advanceGameState();
      
      expect(game.endGame).toHaveBeenCalled();
    });
  });
});