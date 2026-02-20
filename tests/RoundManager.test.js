const RoundManager = require('../src/managers/RoundManager');

describe('RoundManager', () => {
  let roundManager;

  beforeEach(() => {
    roundManager = new RoundManager();
  });

  test('initializes with round 1', () => {
    expect(roundManager.getCurrentRoundNumber()).toBe(1);
    expect(roundManager.getCurrentHandCount()).toBe(1);
    expect(roundManager.isGameCompleted()).toBe(false);
  });

  test('progresses through all rounds correctly', () => {
    for (let i = 1; i <= 10; i++) {
      expect(roundManager.getCurrentRoundNumber()).toBe(i);
      expect(roundManager.getCurrentHandCount()).toBe(i);
      
      if (i < 10) {
        const progressed = roundManager.completeCurrentRound([]);
        expect(progressed).toBe(true);
      }
    }
    
    // Complete final round
    const progressed = roundManager.completeCurrentRound([]);
    expect(progressed).toBe(false);
    expect(roundManager.isGameCompleted()).toBe(true);
  });

  test('tracks game status correctly', () => {
    // Initial status
    let status = roundManager.getGameStatus();
    expect(status.currentRound).toBe(1);
    expect(status.roundsCompleted).toBe(0);
    expect(status.gameCompleted).toBe(false);
    
    // After completing first round
    roundManager.completeCurrentRound([100, 85]);
    status = roundManager.getGameStatus();
    expect(status.currentRound).toBe(2);
    expect(status.roundsCompleted).toBe(1);
    expect(status.gameCompleted).toBe(false);
  });

  test('handles game completion correctly', () => {
    // Complete all rounds
    for (let i = 0; i < 10; i++) {
      roundManager.completeCurrentRound([]);
    }
    
    expect(roundManager.isGameCompleted()).toBe(true);
    expect(roundManager.getCurrentRoundNumber()).toBe(10);
    
    // Attempting to complete when already done
    const result = roundManager.completeCurrentRound([]);
    expect(result).toBe(false);
  });

  test('can be reset', () => {
    roundManager.completeCurrentRound([]);
    roundManager.completeCurrentRound([]);
    
    roundManager.reset();
    
    expect(roundManager.getCurrentRoundNumber()).toBe(1);
    expect(roundManager.getCurrentHandCount()).toBe(1);
    expect(roundManager.isGameCompleted()).toBe(false);
  });
});