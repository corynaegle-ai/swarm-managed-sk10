import { phase, round } from './gameState.js';
import { incrementRound } from './gameFlow.js';

function initGameFlow() {
  phase = 'setup';
  transitionPhase('setup');
}

function transitionPhase(newPhase) {
  // Hide all phase containers
  document.querySelectorAll('.phase-container').forEach(container => {
    container.classList.remove('phase-visible');
    container.classList.add('phase-hidden');
  });
  // Show the new phase container
  const newContainer = document.querySelector(`.phase-container[data-phase="${newPhase}"]`);
  if (newContainer) {
    newContainer.classList.remove('phase-hidden');
    newContainer.classList.add('phase-visible');
  }
  // Update phase indicator
  const indicator = document.querySelector('.phase-indicator');
  if (indicator) {
    indicator.textContent = newPhase.charAt(0).toUpperCase() + newPhase.slice(1);
  }
  // Update buttons based on phase
  // Example: disable/enable specific buttons
  const startBiddingBtn = document.getElementById('start-bidding-btn');
  const submitBidsBtn = document.getElementById('submit-bids-btn');
  const nextRoundBtn = document.getElementById('next-round-btn');
  if (startBiddingBtn) startBiddingBtn.disabled = newPhase !== 'setup';
  if (submitBidsBtn) submitBidsBtn.disabled = newPhase !== 'bidding';
  if (nextRoundBtn) nextRoundBtn.disabled = newPhase !== 'resolution';
}

// Event listeners
if (document.getElementById('start-bidding-btn')) {
  document.getElementById('start-bidding-btn').addEventListener('click', () => transitionPhase('bidding'));
}
if (document.getElementById('submit-bids-btn')) {
  document.getElementById('submit-bids-btn').addEventListener('click', () => transitionPhase('resolution'));
}
if (document.getElementById('next-round-btn')) {
  document.getElementById('next-round-btn').addEventListener('click', () => {
    incrementRound();
    if (round > 10) {
      transitionPhase('completion');
    } else {
      transitionPhase('bidding');
    }
  });
}

// Hook into existing start-game-btn
if (document.getElementById('start-game-btn')) {
  document.getElementById('start-game-btn').addEventListener('click', () => {
    transitionPhase('bidding');
  });
}

// Initialize on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  // Existing initialization can be here, but we add initGameFlow
  initGameFlow();
});