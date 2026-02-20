let gameState = {
  phase: 'setup',
  round: 1
};

function initGameFlow() {
  gameState.phase = 'setup';
  transitionPhase('setup');
}

function transitionPhase(newPhase) {
  gameState.phase = newPhase;

  // Hide all phase containers
  document.querySelectorAll('.phase-container').forEach(el => {
    el.classList.remove('phase-visible');
    el.classList.add('phase-hidden');
  });

  // Show the container for newPhase
  const container = document.getElementById(`${newPhase}-phase`);
  if (container) {
    container.classList.remove('phase-hidden');
    container.classList.add('phase-visible');
  }

  // Update phase indicator text
  const indicator = document.querySelector('.phase-indicator');
  if (indicator) {
    indicator.textContent = newPhase;
  }

  // Enable/disable buttons appropriate to the phase
  document.getElementById('start-bidding-btn').disabled = newPhase !== 'setup';
  document.getElementById('submit-bids-btn').disabled = newPhase !== 'bidding';
  document.getElementById('next-round-btn').disabled = newPhase !== 'resolution';
}

document.addEventListener('DOMContentLoaded', () => {
  initGameFlow();

  // Hook into start-game-btn (add to existing handler if present)
  const startGameBtn = document.getElementById('start-game-btn');
  if (startGameBtn) {
    startGameBtn.addEventListener('click', () => transitionPhase('bidding'));
  }

  // Add event listeners for other buttons
  document.getElementById('start-bidding-btn').addEventListener('click', () => transitionPhase('bidding'));
  document.getElementById('submit-bids-btn').addEventListener('click', () => transitionPhase('resolution'));
  document.getElementById('next-round-btn').addEventListener('click', () => {
    gameState.round++;
    if (gameState.round > 10) {
      transitionPhase('completion');
    } else {
      transitionPhase('bidding');
    }
  });
});