import { PlayerRoundScore } from '../PlayerRoundScore';

describe('PlayerRoundScore', () => {
  test('constructor sets properties correctly', () => {
    const score = new PlayerRoundScore(1, 'Alice', 2);
    expect(score.playerId).toBe(1);
    expect(score.playerName).toBe('Alice');
    expect(score.bid).toBe(2);
    expect(score.tricksWon).toBe(0);
  });

  test('setTricksWon updates tricksWon', () => {
    const score = new PlayerRoundScore(1, 'Alice', 2);
    score.setTricksWon(3);
    expect(score.tricksWon).toBe(3);
  });

  test('validateBidLimit returns true for valid bid', () => {
    expect(PlayerRoundScore.validateBidLimit(2, 5)).toBe(true);
  });

  test('validateBidLimit returns false for invalid bid', () => {
    expect(PlayerRoundScore.validateBidLimit(6, 5)).toBe(false);
  });

  test('getScore returns correct score for exact bid', () => {
    const score = new PlayerRoundScore(1, 'Alice', 2);
    score.setTricksWon(2);
    expect(score.getScore()).toBe(12);
  });

  test('getScore returns correct score for non-exact bid', () => {
    const score = new PlayerRoundScore(1, 'Alice', 2);
    score.setTricksWon(3);
    expect(score.getScore()).toBe(-1);
  });
});
