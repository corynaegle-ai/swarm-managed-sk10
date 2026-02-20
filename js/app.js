import { currentPhase, round } from './gameState.js';
import {} from './gameFlow.js'; // Imported for potential future use, minimal stub

// Function to initialize game flow
function initGameFlow() {
  currentPhase = 'setup';
  transitionPhase('setup');
}

// Function to transition to a new phase
function transitionPhase(newPhase) {
  // Hide all phase containers
  document.querySelectorAll('.phase-container').forEach(container => {
    container.classList.add('phase-hidden');
    container.classList.remove('phase-visible');
  });
  
  // Show the container for the new phase
  const phaseContainer = document.querySelector(`#${newPhase}-container`);
  if (phaseContainer) {
    phaseContainer.classList.remove('phase-hidden');
    phaseContainer.classList.add('phase-visible');
  } else {
    console.error(`Phase container #${newPhase}-container not found`);
  }
  
  // Update phase indicator
  const phaseIndicator = document.querySelector('.phase-indicator');
  if (phaseIndicator) {
    phaseIndicator.textContent = newPhase;
  }
  
  // Enable/disable buttons based on phase
  // Assuming buttons exist; add specific logic if needed
  const startBiddingBtn = document.querySelector('#start-bidding-btn');
  const submitBidsBtn = document.querySelector('#submit-bids-btn');
  const nextRoundBtn = document.querySelector('#next-round-btn');
  
  if (startBiddingBtn) startBiddingBtn.disabled = newPhase !== 'setup';
  if (submitBidsBtn) submitBidsBtn.disabled = newPhase !== 'bidding';
  if (nextRoundBtn) nextRoundBtn.disabled = newPhase !== 'resolution';
  
  currentPhase = newPhase;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Integrate with existing initialization (assume minimal)
  initGameFlow();
  
  // Add to existing start-game-btn handler (assume it exists)
  const startGameBtn = document.querySelector('#start-game-btn');
  if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
      transitionPhase('bidding');
    });
  }
  
  const startBiddingBtn = document.querySelector('#start-bidding-btn');
  if (startBiddingBtn) {
    startBiddingBtn.addEventListener('click', () => {
      transitionPhase('bidding');
    });
  }
  
  const submitBidsBtn = document.querySelector('#submit-bids-btn');
  if (submitBidsBtn) {
    submitBidsBtn.addEventListener('click', () => {
      transitionPhase('resolution');
    });
  }
  
  const nextRoundBtn = document.querySelector('#next-round-btn');
  if (nextRoundBtn) {
    nextRoundBtn.addEventListener('click', () => {
      round++;
      if (round > 10) {
        transitionPhase('completion');
      } else {
        transitionPhase('bidding');
      }
    });
  }
});