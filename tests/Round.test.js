const Round = require('../src/models/Round');

describe('Round', () => {
  test('creates round with correct number and hand count', () => {
    const round = new Round(5);
    expect(round.number).toBe(5);
    expect(round.handCount).toBe(5);
    expect(round.isCompleted).toBe(false);
  });

  test('throws error for invalid round numbers', () => {
    expect(() => new Round(0)).toThrow('Round number must be between 1 and 10');
    expect(() => new Round(11)).toThrow('Round number must be between 1 and 10');
  });

  test('can be completed with scores', () => {
    const round = new Round(3);
    const scores = [100, 85, 92];
    round.complete(scores);
    
    expect(round.isComplete()).toBe(true);
    expect(round.scores).toEqual(scores);
  });

  test('provides correct round info', () => {
    const round = new Round(7);
    const info = round.getInfo();
    
    expect(info).toEqual({
      number: 7,
      handCount: 7,
      isCompleted: false,
      scores: []
    });
  });
});