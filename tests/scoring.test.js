/**
 * Test suite for Skull King scoring engine
 */

// Import the scoring functions (adjust path as needed)
const { calculateRoundScore, calculateBonusPoints } = require('../js/scoring.js');

describe('Skull King Scoring Engine', () => {
  describe('calculateRoundScore', () => {
    // Test zero bid scenarios
    test('correct zero bid should return +10 × hand count', () => {
      expect(calculateRoundScore(0, 0, 1)).toBe(10);
      expect(calculateRoundScore(0, 0, 5)).toBe(50);
      expect(calculateRoundScore(0, 0, 10)).toBe(100);
    });

    test('incorrect zero bid should return -10 × hand count', () => {
      expect(calculateRoundScore(0, 1, 1)).toBe(-10);
      expect(calculateRoundScore(0, 2, 5)).toBe(-50);
      expect(calculateRoundScore(0, 1, 10)).toBe(-100);
    });

    // Test correct non-zero bids
    test('correct non-zero bid should return +20 per trick', () => {
      expect(calculateRoundScore(1, 1, 5)).toBe(20);
      expect(calculateRoundScore(3, 3, 5)).toBe(60);
      expect(calculateRoundScore(5, 5, 10)).toBe(100);
    });

    // Test incorrect non-zero bids
    test('incorrect non-zero bid should return -10 per trick difference', () => {
      expect(calculateRoundScore(2, 1, 5)).toBe(-10); // |2-1| = 1
      expect(calculateRoundScore(1, 3, 5)).toBe(-20); // |1-3| = 2
      expect(calculateRoundScore(5, 2, 10)).toBe(-30); // |5-2| = 3
    });

    // Test input validation
    test('should throw error for invalid inputs', () => {
      expect(() => calculateRoundScore(-1, 0, 5)).toThrow();
      expect(() => calculateRoundScore(1.5, 0, 5)).toThrow();
      expect(() => calculateRoundScore(1, -1, 5)).toThrow();
      expect(() => calculateRoundScore(1, 0, 0)).toThrow();
      expect(() => calculateRoundScore(1, 0, 11)).toThrow();
    });
  });

  describe('calculateBonusPoints', () => {
    // Test that bonuses only apply when bid is correct
    test('should return 0 when bid is incorrect', () => {
      const cards = [{ type: 'skull_king' }];
      expect(calculateBonusPoints(cards, 1, 2)).toBe(0);
      expect(calculateBonusPoints(cards, 0, 1)).toBe(0);
    });

    test('should calculate bonuses when bid is correct', () => {
      const skullKingCard = [{ type: 'skull_king' }];
      const pirateCard = [{ type: 'pirate' }];
      const mermaidCard = [{ type: 'mermaid' }];
      
      // Test with correct bids
      expect(calculateBonusPoints(skullKingCard, 1, 1)).toBe(30);
      expect(calculateBonusPoints(pirateCard, 1, 1)).toBe(20);
      expect(calculateBonusPoints(mermaidCard, 1, 1)).toBe(20);
      expect(calculateBonusPoints(skullKingCard, 0, 0)).toBe(30);
    });

    test('should handle multiple special cards', () => {
      const multipleCards = [
        { type: 'skull_king' },
        { type: 'pirate' },
        { type: 'mermaid' },
        { type: 'skull_king' }
      ];
      
      // 2 skull kings (60) + 1 pirate (20) + 1 mermaid (20) = 100
      expect(calculateBonusPoints(multipleCards, 2, 2)).toBe(100);
    });

    test('should handle alternative card formats', () => {
      const altFormatCards = [
        { name: 'Skull King' },
        { suit: 'pirates' },
        { suit: 'mermaids' }
      ];
      
      // 1 skull king (30) + 1 pirate (20) + 1 mermaid (20) = 70
      expect(calculateBonusPoints(altFormatCards, 1, 1)).toBe(70);
    });

    test('should handle invalid cards gracefully', () => {
      const mixedCards = [
        null,
        { type: 'skull_king' },
        'invalid',
        { type: 'pirate' }
      ];
      
      // 1 skull king (30) + 1 pirate (20) = 50
      expect(calculateBonusPoints(mixedCards, 1, 1)).toBe(50);
    });

    test('should throw error for invalid inputs', () => {
      expect(() => calculateBonusPoints('not array', 1, 1)).toThrow();
      expect(() => calculateBonusPoints([], -1, 1)).toThrow();
      expect(() => calculateBonusPoints([], 1, -1)).toThrow();
    });
  });
});