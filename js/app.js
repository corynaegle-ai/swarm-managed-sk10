// Import gameState and gameFlow modules (stubs created if not existing)
import { gameState } from './gameState.js';
import { gameFlow } from './gameFlow.js';

// Initialize game flow
function initGameFlow() {
  transitionPhase('setup');
}

// Transition to a new phase
function transitionPhase(newPhase) {
  // Hide all phase containers
  document.querySelectorAll('.phase-container').forEach(container => {
    container.classList.add('phase-hidden');
    container.classList.remove('phase-visible');
  });
  
  // Show the new phase container
  const newContainer = document.getElementById(`${newPhase}-phase`);
  if (newContainer) {
    newContainer.classList.remove('phase-hidden');
    newContainer.classList.add('phase-visible');
  }
  
  // Update phase indicator
  const indicator = document.querySelector('.phase-indicator');
  if (indicator) {
    indicator.textContent = `Phase: ${newPhase.charAt(0).toUpperCase() + newPhase.slice(1)}`;
  }
  
  // Enable/disable buttons based on phase
  // Add specific logic here if needed, e.g., disable certain buttons in certain phases
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Existing initialization code can be added here if present
  initGameFlow();
  
  // Hook into existing start-game-btn (add to it, don't replace)
  const startGameBtn = document.getElementById('start-game-btn');
  if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
      transitionPhase('bidding');
    });
  }
  
  document.getElementById('start-bidding-btn')?.addEventListener('click', () => {
    transitionPhase('bidding');
  });
  
  document.getElementById('submit-bids-btn')?.addEventListener('click', () => {
    transitionPhase('resolution');
  });
  
  document.getElementById('next-round-btn')?.addEventListener('click', () => {
    gameState.round++;
    if (gameState.round > 10) {
      transitionPhase('completion');
    } else {
      transitionPhase('bidding');
    }
  });
});