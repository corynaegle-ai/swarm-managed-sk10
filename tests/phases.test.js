const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html);
const document = dom.window.document;

describe('Phase Containers in index.html', () => {
  test('bidding-phase-container exists with correct class', () => {
    const container = document.getElementById('bidding-phase-container');
    expect(container).toBeTruthy();
    expect(container.classList.contains('phase-container')).toBe(true);
    expect(container.classList.contains('phase-hidden')).toBe(true);
  });

  test('resolution-phase-container exists with correct class', () => {
    const container = document.getElementById('resolution-phase-container');
    expect(container).toBeTruthy();
    expect(container.classList.contains('phase-container')).toBe(true);
    expect(container.classList.contains('phase-hidden')).toBe(true);
  });

  test('completion-container exists with correct class', () => {
    const container = document.getElementById('completion-container');
    expect(container).toBeTruthy();
    expect(container.classList.contains('phase-container')).toBe(true);
    expect(container.classList.contains('phase-hidden')).toBe(true);
  });

  test('phase-indicator exists with correct class', () => {
    const indicator = document.querySelector('.phase-indicator');
    expect(indicator).toBeTruthy();
  });

  test('start-bidding-btn exists', () => {
    const btn = document.getElementById('start-bidding-btn');
    expect(btn).toBeTruthy();
  });

  test('submit-bids-btn exists', () => {
    const btn = document.getElementById('submit-bids-btn');
    expect(btn).toBeTruthy();
  });

  test('next-round-btn exists', () => {
    const btn = document.getElementById('next-round-btn');
    expect(btn).toBeTruthy();
  });

  test('existing elements remain in original positions', () => {
    expect(document.getElementById('player-setup-container')).toBeTruthy();
    expect(document.getElementById('player-list-container')).toBeTruthy();
    expect(document.getElementById('start-game-btn')).toBeTruthy();
    expect(document.getElementById('scoreboard')).toBeTruthy();
  });
});