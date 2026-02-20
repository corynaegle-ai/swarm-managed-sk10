import { round, phase as gamePhase } from './gameState.js';
import * as gameFlow from './gameFlow.js';

function initGameFlow() {
  gamePhase = 'setup';
  transitionPhase('setup');
}

function transitionPhase(newPhase) {
  // Hide all .phase-container
  document.querySelectorAll('.phase-container').forEach(el => {
    el.classList.add('phase-hidden');
    el.classList.remove('phase-visible');
  });
  // Show the newPhase container
  const container = document.querySelector(`.phase-container[data-phase="${newPhase}"]`);
  if (container) {
    container.classList.remove('phase-hidden');
    container.classList.add('phase-visible');
  }
  // Update phase indicator
  const indicator = document.querySelector('.phase-indicator');
  if (indicator) {
    indicator.textContent = newPhase;
  }
  // Enable/disable buttons appropriate to the phase
  // Disable all phase buttons first
  ['start-bidding-btn', 'submit-bids-btn', 'next-round-btn'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.disabled = true;
  });
  // Enable based on phase
  if (newPhase === 'setup') {
    const btn = document.getElementById('start-bidding-btn');
    if (btn) btn.disabled = false;
  } else if (newPhase === 'bidding') {
    const btn = document.getElementById('submit-bids-btn');
    if (btn) btn.disabled = false;
  } else if (newPhase === 'resolution') {
    const btn = document.getElementById('next-round-btn');
    if (btn) btn.disabled = false;
  }
  gamePhase = newPhase;
}

document.addEventListener('DOMContentLoaded', () => {
  initGameFlow();
  // Hook into existing start-game-btn click (add to it)
  const startGameBtn = document.getElementById('start-game-btn');
  if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
      transitionPhase('bidding');
    });
  }
  // Event listeners for phase control buttons
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
      round++;
      if (round > 10) {
        transitionPhase('completion');
      } else {
        transitionPhase('bidding');
      }
    });
  }
});