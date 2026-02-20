import { gameState } from './gameState.js';
import { gameFlow } from './gameFlow.js';

function initGameFlow() {
  gameState.phase = 'setup';
  transitionPhase('setup');
}

function transitionPhase(newPhase) {
  // Hide all phase containers
  document.querySelectorAll('.phase-container').forEach(container => {
    container.classList.add('phase-hidden');
    container.classList.remove('phase-visible');
  });
  // Show the new phase container
  const newContainer = document.getElementById(`${newPhase}-container`);
  if (newContainer) {
    newContainer.classList.remove('phase-hidden');
    newContainer.classList.add('phase-visible');
  }
  // Update phase indicator
  const indicator = document.querySelector('.phase-indicator');
  if (indicator) {
    indicator.textContent = newPhase.charAt(0).toUpperCase() + newPhase.slice(1);
  }
  // Update gameState
  gameState.phase = newPhase;
  // Enable/disable buttons (simplified)
  // Assuming buttons exist; add logic as needed
}

document.addEventListener('DOMContentLoaded', () => {
  // Existing initialization code can be added here

  // Hook into existing start-game-btn
  const startGameBtn = document.getElementById('start-game-btn');
  if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
      // Add to existing handler
      transitionPhase('bidding');
    });
  }

  // Add event listeners for phase control buttons
  const startBiddingBtn = document.getElementById('start-bidding-btn');
  if (startBiddingBtn) {
    startBiddingBtn.addEventListener('click', () => {
      transitionPhase('bidding');
    });
  }

  const submitBidsBtn = document.getElementById('submit-bids-btn');
  if (submitBidsBtn) {
    submitBidsBtn.addEventListener('click', () => {
      transitionPhase('resolution');
    });
  }

  const nextRoundBtn = document.getElementById('next-round-btn');
  if (nextRoundBtn) {
    nextRoundBtn.addEventListener('click', () => {
      gameState.round++;
      if (gameState.round > 10) {
        transitionPhase('completion');
      } else {
        transitionPhase('bidding');
      }
    });
  }

  // Call initGameFlow at the end
  initGameFlow();
});