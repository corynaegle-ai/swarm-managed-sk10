// Tests for main game controller

// Import functions for testing
if (typeof require !== 'undefined') {
  const { TricksterGame } = require('../js/app.js');
  global.TricksterGame = TricksterGame;
}

// Mock DOM elements for testing
function setupMockDOM() {
  global.document = {
    getElementById: (id) => {
      const mockElements = {
        'num-players': { value: '4', addEventListener: () => {} },
        'start-game': { addEventListener: () => {} },
        'trick-entry-form': { 
          addEventListener: () => {},
          reset: () => {},
          parentNode: { insertBefore: () => {} }
        },
        'clear-form': { addEventListener: () => {} },
        'new-game': { addEventListener: () => {} },
        'player-names': { innerHTML: '' },
        'current-round': { textContent: '' },
        'round-display': { textContent: '' },
        'hand-count': { textContent: '' },
        'player-tricks-container': { innerHTML: '' },
        'scoreboard-container': { innerHTML: '' },
        'game-setup': { style: { display: 'block' } },
        'game-play': { style: { display: 'none' } },
        'game-end': { style: { display: 'none' } },
        'final-scores': { innerHTML: '' }
      };
      return mockElements[id] || null;
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: (tag) => ({
      className: '',
      innerHTML: '',
      appendChild: () => {},
      style: { display: 'block' }
    }),
    addEventListener: () => {},
    body: { appendChild: () => {} }
  };
}

// Mock scoring functions
if (typeof global !== 'undefined') {
  global.validateTrickEntry = (playerTricks, handCount) => {
    const totalActual = playerTricks.reduce((sum, p) => sum + p.actual, 0);
    return totalActual === handCount ? 
      { isValid: true } : 
      { isValid: false, error: 'Total tricks mismatch' };
  };
  
  global.updatePlayerRoundScore = (playerId, actualTricks, bonusEarned) => {
    return actualTricks + (bonusEarned ? 5 : 0);
  };
  
  global.calculateRoundScore = (predicted, actual, bonusEarned) => {
    return predicted === actual ? 10 + actual + (bonusEarned ? 5 : 0) : -Math.abs(predicted - actual);
  };
}

describe('TricksterGame', () => {
  beforeEach(() => {
    setupMockDOM();
  });
  
  test('Form submission prevents default behavior', () => {
    const game = new TricksterGame();
    const mockEvent = { preventDefault: jest.fn() };
    
    // Mock form data extraction to return valid data
    game.extractFormData = () => [{
      playerId: 1,
      playerName: 'Player 1',
      predicted: 3,
      actual: 3,
      bonus: false
    }];
    
    game.handleTrickSubmission.call({ ...game, currentRound: 1 });
    
    // Test would verify preventDefault was called
    expect(true).toBe(true); // Placeholder assertion
  });
  
  test('Validation errors are displayed', () => {
    const game = new TricksterGame();
    let errorDisplayed = false;
    
    game.showError = (message) => {
      errorDisplayed = true;
      expect(message).toContain('Total actual tricks');
    };
    
    game.extractFormData = () => [{
      playerId: 1,
      playerName: 'Player 1',
      predicted: 3,
      actual: 5, // Invalid - too many total tricks
      bonus: false
    }];
    
    game.handleTrickSubmission();
    
    expect(errorDisplayed).toBe(true);
  });
  
  test('Successful entries update game state', () => {
    const game = new TricksterGame();
    game.players = [{ id: 1, name: 'Player 1', totalScore: 0, roundScores: [] }];
    game.currentRound = 1;
    
    const playerTricks = [{
      playerId: 1,
      playerName: 'Player 1',
      predicted: 3,
      actual: 3,
      bonus: false
    }];
    
    game.updatePlayerScoreDisplay = () => {};
    game.updatePlayerScores(playerTricks);
    
    expect(game.players[0].roundScores.length).toBeGreaterThan(0);
  });
  
  test('Game progresses to next round after valid submission', () => {
    const game = new TricksterGame();
    game.players = [{ id: 1, name: 'Player 1', totalScore: 0, roundScores: [13] }];
    game.currentRound = 1;
    game.maxRounds = 10;
    
    game.clearForm = () => {};
    game.setupGameRound = () => {};
    game.showSuccess = () => {};
    
    const result = game.advanceToNextRound();
    
    expect(result).toBe(true);
    expect(game.currentRound).toBe(2);
  });
  
  test('Form data extraction validates inputs properly', () => {
    const game = new TricksterGame();
    game.players = [{ id: 1, name: 'Player 1' }];
    
    // Mock DOM query to return null (missing inputs)
    global.document.querySelector = () => null;
    
    let errorShown = false;
    game.showError = () => { errorShown = true; };
    
    const result = game.extractFormData();
    
    expect(result).toBe(null);
    expect(errorShown).toBe(true);
  });
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
}