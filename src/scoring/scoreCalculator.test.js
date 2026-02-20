const ScoreCalculator = require('./scoreCalculator');

describe('ScoreCalculator', () => {
  describe('calculateRoundScore', () => {
    // AC1: Correct bid (1+): +20 points per trick
    test('AC1: Correct non-zero bid should give +20 points per trick', () => {
      const result = ScoreCalculator.calculateRoundScore(3, 3, 5);
      expect(result.roundScore).toBe(60); // 20 * 3
      expect(result.bidCorrect).toBe(true);
    });

    // AC2: Incorrect bid (1+): -10 points per trick difference
    test('AC2: Incorrect non-zero bid should give -10 points per difference', () => {
      const result = ScoreCalculator.calculateRoundScore(3, 1, 5);
      expect(result.roundScore).toBe(-20); // -10 * 2 difference
      expect(result.bidCorrect).toBe(false);
    });

    test('AC2: Incorrect bid with over-tricks should still be -10 per difference', () => {
      const result = ScoreCalculator.calculateRoundScore(2, 4, 5);
      expect(result.roundScore).toBe(-20); // -10 * 2 difference
      expect(result.bidCorrect).toBe(false);
    });

    // AC3: Zero bid correct: +10 × hand count
    test('AC3: Correct zero bid should give +10 × hand count', () => {
      const result = ScoreCalculator.calculateRoundScore(0, 0, 7);
      expect(result.roundScore).toBe(70); // 10 * 7
      expect(result.bidCorrect).toBe(true);
    });

    // AC4: Zero bid incorrect: -10 × hand count
    test('AC4: Incorrect zero bid should give -10 × hand count', () => {
      const result = ScoreCalculator.calculateRoundScore(0, 2, 6);
      expect(result.roundScore).toBe(-60); // -10 * 6
      expect(result.bidCorrect).toBe(false);
    });

    // AC5: Bonus points only added if bid was correct
    test('AC5: Bonus points should be added only when bid is correct', () => {
      const correctBid = ScoreCalculator.calculateRoundScore(2, 2, 5, 30);
      expect(correctBid.roundScore).toBe(70); // 40 + 30 bonus
      expect(correctBid.appliedBonusPoints).toBe(30);

      const incorrectBid = ScoreCalculator.calculateRoundScore(2, 3, 5, 30);
      expect(incorrectBid.roundScore).toBe(-10); // -10, no bonus
      expect(incorrectBid.appliedBonusPoints).toBe(0);
    });

    test('should handle edge cases and validation', () => {
      expect(() => ScoreCalculator.calculateRoundScore('invalid', 2, 5))
        .toThrow('Invalid input parameters');
      
      expect(() => ScoreCalculator.calculateRoundScore(-1, 2, 5))
        .toThrow('Invalid input values');
    });
  });

  describe('updatePlayerTotal', () => {
    // AC6: Updates player total scores
    test('AC6: Should correctly update player total score', () => {
      const newTotal = ScoreCalculator.updatePlayerTotal(50, 30);
      expect(newTotal).toBe(80);
      
      const negativeRound = ScoreCalculator.updatePlayerTotal(50, -20);
      expect(negativeRound).toBe(30);
    });

    test('should validate input parameters', () => {
      expect(() => ScoreCalculator.updatePlayerTotal('invalid', 20))
        .toThrow('Invalid input parameters');
    });
  });

  describe('calculateRoundScores', () => {
    test('should calculate scores for multiple players', () => {
      const players = [
        { name: 'Player1', bid: 2, tricksWon: 2, currentScore: 50, bonusPoints: 10 },
        { name: 'Player2', bid: 1, tricksWon: 3, currentScore: 30 },
        { name: 'Player3', bid: 0, tricksWon: 0, currentScore: 0 }
      ];
      
      const results = ScoreCalculator.calculateRoundScores(players, 4);
      
      expect(results[0].roundScore).toBe(50); // 40 + 10 bonus
      expect(results[0].totalScore).toBe(100);
      expect(results[1].roundScore).toBe(-20); // -10 * 2 difference
      expect(results[1].totalScore).toBe(10);
      expect(results[2].roundScore).toBe(40); // 10 * 4
      expect(results[2].totalScore).toBe(40);
    });
  });
});