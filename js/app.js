// Import necessary modules
import { initializeGame, playCard, scoreRound } from './game.js';
import { Round } from './round.js';

let gameState = {
  isGameActive: true,
  currentRound: null,
  // Other game state properties
};

function initGame() {
  try {
    initializeGame(game);
    gameState.currentRound = new Round(1); // Start with round 1
    updateRoundDisplay(); // Update DOM for initial round
  } catch (error) {
    console.error('Error initializing game:', error);
  }
}

function gameLoop() {
  if (!gameState.isGameActive) return;
  // Existing game loop logic
  // Assume playCard and other functions are called here
}

function handleScoringPhase() {
  // After scoring phase
  scoreRound(gameState.currentRound);
  advanceRound();
}

function advanceRound() {
  if (gameState.currentRound.number < 10) {
    gameState.currentRound = new Round(gameState.currentRound.number + 1);
    updateRoundDisplay();
  } else {
    endGame();
  }
}

function updateRoundDisplay() {
  const roundElement = document.querySelector('#round-number');
  const handsElement = document.querySelector('#hands-count');
  if (roundElement) {
    roundElement.textContent = `Round: ${gameState.currentRound.number}`;
  }
  if (handsElement) {
    handsElement.textContent = `Hands: ${gameState.currentRound.hands}`; // Assuming Round has a hands property
  }
}

function endGame() {
  gameState.isGameActive = false;
  // Existing end game logic
  alert('Game Over!');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initGame);
