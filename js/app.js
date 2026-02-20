// js/app.js
// Integrates Round class and manages game flow with round progression
import { Round } from './Round.js';

class Game {
  constructor() {
    this.currentRound = new Round(1);
    this.maxRounds = 10;
    this.gameEnded = false;
    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.roundDisplay = document.querySelector('#round-info');
    this.handsCountDisplay = document.querySelector('#hands-count');
    if (!this.roundDisplay || !this.handsCountDisplay) {
      console.error('Required DOM elements not found');
    }
    this.updateRoundInfo();
  }

  bindEvents() {
    // Assume existing scoring event or button
    const scoreButton = document.querySelector('#score-button');
    if (scoreButton) {
      scoreButton.addEventListener('click', () => this.handleScoringPhase());
    }
    // Other game events as needed
  }

  updateRoundInfo() {
    if (this.roundDisplay) {
      this.roundDisplay.textContent = `Round: ${this.currentRound.number}`;
    }
    if (this.handsCountDisplay) {
      this.handsCountDisplay.textContent = `Hands: ${this.currentRound.handsCount}`;
    }
  }

  handleScoringPhase() {
    // Assume scoring logic here
    // After scoring, advance round
    this.advanceRound();
  }

  advanceRound() {
    if (this.gameEnded) return;
    if (this.currentRound.number >= this.maxRounds) {
      this.endGame();
      return;
    }
    this.currentRound = new Round(this.currentRound.number + 1);
    this.updateRoundInfo();
    // Trigger next round logic, e.g., deal new hands
    console.log('Advanced to round', this.currentRound.number);
  }

  endGame() {
    this.gameEnded = true;
    alert('Game Over!');
    // Additional end game logic, e.g., show final scores
  }
}

// Initialize game on DOM load
document.addEventListener('DOMContentLoaded', () => {
  new Game();
});