// Basic test for initGameFlow and transitionPhase
const { JSDOM } = require('jsdom');

const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <div id="setup-phase" class="phase-container"></div>
      <div id="bidding-phase" class="phase-container"></div>
      <div id="resolution-phase" class="phase-container"></div>
      <div id="completion-phase" class="phase-container"></div>
      <div class="phase-indicator"></div>
      <button id="start-game-btn"></button>
      <button id="start-bidding-btn"></button>
      <button id="submit-bids-btn"></button>
      <button id="next-round-btn"></button>
    </body>
  </html>
`);

global.document = dom.window.document;
global.window = dom.window;

// Mock modules since this is a stub test
jest.mock('../js/gameState.js', () => ({ gameState: { round: 1 } }));
jest.mock('../js/gameFlow.js', () => ({ gameFlow: {} }));

require('../js/app.js');

describe('Game Flow Integration', () => {
  test('initGameFlow sets setup phase', () => {
    const setup = document.getElementById('setup-phase');
    const bidding = document.getElementById('bidding-phase');
    expect(setup.classList.contains('phase-visible')).toBe(true);
    expect(bidding.classList.contains('phase-hidden')).toBe(true);
  });

  test('transitionPhase updates visibility', () => {
    transitionPhase('bidding');
    const setup = document.getElementById('setup-phase');
    const bidding = document.getElementById('bidding-phase');
    expect(setup.classList.contains('phase-hidden')).toBe(true);
    expect(bidding.classList.contains('phase-visible')).toBe(true);
  });

  test('Phase indicator updates', () => {
    transitionPhase('resolution');
    const indicator = document.querySelector('.phase-indicator');
    expect(indicator.textContent).toBe('Phase: Resolution');
  });
});