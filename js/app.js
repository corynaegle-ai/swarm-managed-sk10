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
  // Assume startRound is defined elsewhere or call it here
  startRound();
}

// Function to start a round
function startRound() {
  if (gameOver) return;
  currentRound.start();
  // Integrate with existing game flow - assume dealCards() or similar is called here
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
  if (handsCountElement) {
    handsCountElement.textContent = `Hands: ${currentRound.getHandsCount()}`; // Assume Round has getHandsCount method
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
// Assuming there's a scoring phase end event, e.g.,
document.addEventListener('scoringPhaseEnd', advanceRound);

// Initialize game on load
window.addEventListener('DOMContentLoaded', initGame);

// Export for potential use in other modules
export { initGame, advanceRound, endGame };