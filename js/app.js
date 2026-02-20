// js/app.js - Main game application integrating round management

// Import the Round class (assuming it's defined in js/round.js)
import Round from './round.js';

// Game state variables
let currentRound = null;
let gameOver = false;
let roundNumber = 1;

// DOM elements (assuming they exist in index.html)
const roundInfoElement = document.querySelector('#round-info');
const handsCountElement = document.querySelector('#hands-count');
const gameEndElement = document.querySelector('#game-end');

// Function to initialize the game
function initGame() {
  roundNumber = 1;
  gameOver = false;
  currentRound = new Round(roundNumber);
  updateRoundDisplay();
  startRound();
}

// Function to start a round
function startRound() {
  if (gameOver) return;
  currentRound.start();
  // TODO: Integrate with existing game flow by calling dealCards() or similar game logic here
  // This should trigger the card dealing and hand setup for the current round
}

// Function to handle scoring phase end and advance to next round
function advanceRound() {
  if (gameOver) return;
  // Assume scoring is handled elsewhere, now advance
  if (roundNumber < 10) {
    roundNumber++;
    currentRound = new Round(roundNumber);
    updateRoundDisplay();
    startRound();
  } else {
    endGame();
  }
}

// Function to update DOM with round info
function updateRoundDisplay() {
  if (roundInfoElement) {
    roundInfoElement.textContent = `Round: ${roundNumber}`;
  }
  if (handsCountElement && currentRound) {
    // Verify the method exists before calling
    const handsCount = typeof currentRound.getHandsCount === 'function' 
      ? currentRound.getHandsCount() 
      : 'N/A';
    handsCountElement.textContent = `Hands: ${handsCount}`;
  }
}

// Function to handle game end
function endGame() {
  gameOver = true;
  if (gameEndElement) {
    gameEndElement.textContent = 'Game Over! Congratulations!';
  }
  // Trigger any game end sequence, e.g., show final scores
}

// Event listeners or hooks to call advanceRound after scoring
// NOTE: This requires a custom 'scoringPhaseEnd' event to be dispatched
// by the scoring module when scoring is complete. Example dispatch:
// document.dispatchEvent(new CustomEvent('scoringPhaseEnd'));
document.addEventListener('scoringPhaseEnd', advanceRound);

// Initialize game on load
window.addEventListener('DOMContentLoaded', initGame);

// Export for potential use in other modules
export { initGame, advanceRound, endGame };