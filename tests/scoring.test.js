// Tests for scoring logic

if (typeof require !== 'undefined') {
  const { validateTrickEntry, updatePlayerRoundScore, calculateRoundScore } = require('../js/scoring.js');
  global.validateTrickEntry = validateTrickEntry;
  global.updatePlayerRoundScore = updatePlayerRoundScore;
  global.calculateRoundScore = calculateRoundScore;
}

describe('Scoring Functions', () => {
  test('validateTrickEntry validates total tricks correctly', () => {
    const playerTricks = [
      { playerId: 1, playerName: 'Player 1', predicted: 3, actual: 3, bonus: false },
      { playerId: 2, playerName: 'Player 2', predicted: 2, actual: 2, bonus: false }
    ];
    
    const result = validateTrickEntry(playerTricks, 5);
    
    expect(result.isValid).toBe(true);
  });
  
  test('validateTrickEntry rejects incorrect total', () => {
    const playerTricks = [
      { playerId: 1, playerName: 'Player 1', predicted: 3, actual: 4, bonus: false },
      { playerId: 2, playerName: 'Player 2', predicted: 2, actual: 3, bonus: false }
    ];
    
    const result = validateTrickEntry(playerTricks, 5);
    
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('must equal hand count');
  });
  
  test('calculateRoundScore awards correct prediction bonus', () => {
    const score = calculateRoundScore(3, 3, true);
    
    expect(score).toBe(18); // 10 + 3 + 5 bonus
  });
  
  test('calculateRoundScore penalizes incorrect prediction', () => {
    const score = calculateRoundScore(3, 5, false);
    
    expect(score).toBe(-2); // -(|3-5|)
  });
  
  test('updatePlayerRoundScore returns calculated score', () => {
    const score = updatePlayerRoundScore(1, 3, true);
    
    expect(typeof score).toBe('number');
  });
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {};
}