const { calculateRoundScore, calculateBonusPoints } = require('../js/scoring');

describe('calculateRoundScore', () => {
  it('should return correct score for bid 1+ and correct tricks', () => {
    expect(calculateRoundScore(3, 3, 5)).toBe(60);
  });

  it('should return correct score for bid 1+ and incorrect tricks', () => {
    expect(calculateRoundScore(3, 2, 5)).toBe(-10);
  });

  it('should return correct score for bid 0 and 0 tricks', () => {
    expect(calculateRoundScore(0, 0, 5)).toBe(50);
  });

  it('should return correct score for bid 0 and some tricks', () => {
    expect(calculateRoundScore(0, 2, 5)).toBe(-50);
  });

  it('should throw error for invalid bid', () => {
    expect(() => calculateRoundScore(-1, 0, 5)).toThrow('Bid must be a non-negative integer');
  });

  it('should throw error for invalid actualTricks', () => {
    expect(() => calculateRoundScore(0, -1, 5)).toThrow('Actual tricks must be a non-negative integer');
  });

  it('should throw error for invalid handCount', () => {
    expect(() => calculateRoundScore(0, 0, 0)).toThrow('Hand count must be a positive integer');
  });
});

describe('calculateBonusPoints', () => {
  it('should return bonus only when bid is correct', () => {
    const cards = [{ type: 'skull_king' }, { type: 'pirate' }];
    expect(calculateBonusPoints(cards, 2, 2)).toBe(80);
    expect(calculateBonusPoints(cards, 2, 1)).toBe(0);
  });

  it('should calculate bonuses correctly for special cards', () => {
    const cards = [{ type: 'skull_king' }, { type: 'pirate' }, { type: 'mermaid' }, { type: 'numbered' }];
    expect(calculateBonusPoints(cards, 3, 3)).toBe(100); // 50 + 30 + 20
  });

  it('should return 0 for no special cards', () => {
    const cards = [{ type: 'numbered' }];
    expect(calculateBonusPoints(cards, 1, 1)).toBe(0);
  });

  it('should throw error for invalid cards', () => {
    expect(() => calculateBonusPoints('not array', 1, 1)).toThrow('Cards must be an array');
  });

  it('should throw error for invalid bid', () => {
    expect(() => calculateBonusPoints([], -1, 0)).toThrow('Bid must be a non-negative integer');
  });

  it('should throw error for invalid actualTricks', () => {
    expect(() => calculateBonusPoints([], 0, -1)).toThrow('Actual tricks must be a non-negative integer');
  });
});
