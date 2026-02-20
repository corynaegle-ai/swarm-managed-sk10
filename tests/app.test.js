// tests/app.test.js
// Basic tests for Game class integration with Round

import { Game } from '../js/app.js';
import { Round } from '../js/Round.js';

describe('Game Round Integration', () => {
  let game;
  beforeEach(() => {
    // Mock DOM elements
    document.body.innerHTML = '<div id="round-info"></div><div id="hands-count"></div><button id="score-button"></button>';
    game = new Game();
  });

  test('Round info updates on init', () => {
    expect(document.querySelector('#round-info').textContent).toBe('Round: 1');
    expect(document.querySelector('#hands-count').textContent).toBe('Hands: 1'); // Assuming Round(1) has handsCount=1
  });

  test('Advances round after scoring', () => {
    const button = document.querySelector('#score-button');
    button.click();
    expect(game.currentRound.number).toBe(2);
    expect(document.querySelector('#round-info').textContent).toBe('Round: 2');
  });

  test('Game ends at round 10', () => {
    game.currentRound = new Round(9);
    game.advanceRound();
    expect(game.currentRound.number).toBe(10);
    game.advanceRound();
    expect(game.gameEnded).toBe(true);
  });

  test('Handles DOM errors', () => {
    document.body.innerHTML = '';
    expect(() => new Game()).toThrow('Required DOM elements not found');
  });
});