// Basic test for app.js functions (using a simple test runner like Jest)
import { initGameFlow, transitionPhase } from '../js/app.js';
import { currentPhase, round } from '../js/gameState.js';

describe('initGameFlow', () => {
  it('should set initial phase to setup', () => {
    initGameFlow();
    expect(currentPhase).toBe('setup');
  });
});

describe('transitionPhase', () => {
  it('should update phase and handle round increment', () => {
    transitionPhase('bidding');
    expect(currentPhase).toBe('bidding');
    // Mock DOM for full test
  });
});