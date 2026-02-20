/**
 * Game Flow Management
 * Handles phase-specific UI rendering and transitions
 */

// Import game state functions (assuming they exist)
// import { gameState, transitionToPhase } from './gameState.js';

// Game phases
const PHASES = {
  SETUP: 'setup',
  BIDDING: 'bidding',
  SCORING: 'scoring',
  COMPLETED: 'completed'
};

// Current game phase
let currentPhase = PHASES.SETUP;

/**
 * Main function to render phase-specific UI
 * Shows/hides appropriate UI elements based on current gamePhase
 */
function renderPhaseUI(phase = currentPhase) {
  try {
    // Update current phase
    currentPhase = phase;
    
    // Hide all phase-specific containers first
    hideAllPhaseContainers();
    
    // Show relevant UI based on phase
    switch (phase) {
      case PHASES.SETUP:
        renderSetupPhase();
        break;
      case PHASES.BIDDING:
        renderBiddingPhase();
        break;
      case PHASES.SCORING:
        renderScoringPhase();
        break;
      case PHASES.COMPLETED:
        renderCompletedPhase();
        break;
      default:
        console.error('Unknown game phase:', phase);
        renderSetupPhase(); // Default fallback
    }
    
    // Update phase indicator
    updatePhaseIndicator(phase);
    
  } catch (error) {
    console.error('Error rendering phase UI:', error);
  }
}

/**
 * Hide all phase-specific containers
 */
function hideAllPhaseContainers() {
  const containers = [
    'setup-container',
    'bidding-container', 
    'scoring-container',
    'completed-container'
  ];
  
  containers.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.add('phase-hidden');
      element.classList.remove('phase-visible');
    }
  });
}

/**
 * Show specific container
 */
function showContainer(containerId) {
  const element = document.getElementById(containerId);
  if (element) {
    element.classList.remove('phase-hidden');
    element.classList.add('phase-visible');
  }
}

/**
 * Render Setup Phase UI
 * Shows game configuration options
 */
function renderSetupPhase() {
  showContainer('setup-container');
  
  // Create setup UI if it doesn't exist
  const container = document.getElementById('setup-container');
  if (!container) {
    createSetupContainer();
  }
  
  // Create Start Bidding button
  const startButton = document.getElementById('start-bidding-btn') || createButton('start-bidding-btn', 'Start Bidding');
  startButton.onclick = () => handlePhaseTransition(PHASES.BIDDING);
  
  console.log('Setup phase UI rendered');
}

/**
 * Render Bidding Phase UI
 * Shows bid input controls
 */
function renderBiddingPhase() {
  showContainer('bidding-container');
  
  // Create bidding UI if it doesn't exist
  const container = document.getElementById('bidding-container');
  if (!container) {
    createBiddingContainer();
  }
  
  // Create Submit Bids button
  const submitButton = document.getElementById('submit-bids-btn') || createButton('submit-bids-btn', 'Submit Bids');
  submitButton.onclick = () => handlePhaseTransition(PHASES.SCORING);
  
  console.log('Bidding phase UI rendered');
}

/**
 * Render Scoring Phase UI
 * Shows score calculation interface
 */
function renderScoringPhase() {
  showContainer('scoring-container');
  
  // Create scoring UI if it doesn't exist
  const container = document.getElementById('scoring-container');
  if (!container) {
    createScoringContainer();
  }
  
  // Create Next Round button
  const nextRoundButton = document.getElementById('next-round-btn') || createButton('next-round-btn', 'Next Round');
  nextRoundButton.onclick = () => handlePhaseTransition(PHASES.BIDDING);
  
  // Create End Game button
  const endGameButton = document.getElementById('end-game-btn') || createButton('end-game-btn', 'End Game');
  endGameButton.onclick = () => handlePhaseTransition(PHASES.COMPLETED);
  
  console.log('Scoring phase UI rendered');
}

/**
 * Render Completed Phase UI
 * Shows final results
 */
function renderCompletedPhase() {
  showContainer('completed-container');
  
  // Create completed UI if it doesn't exist
  const container = document.getElementById('completed-container');
  if (!container) {
    createCompletedContainer();
  }
  
  // Create New Game button
  const newGameButton = document.getElementById('new-game-btn') || createButton('new-game-btn', 'New Game');
  newGameButton.onclick = () => handlePhaseTransition(PHASES.SETUP);
  
  console.log('Completed phase UI rendered');
}

/**
 * Handle phase transitions
 * Triggers phase changes and updates UI
 */
function handlePhaseTransition(newPhase) {
  try {
    console.log(`Transitioning from ${currentPhase} to ${newPhase}`);
    
    // Call external phase transition function if available
    if (typeof transitionToPhase === 'function') {
      transitionToPhase(newPhase);
    }
    
    // Update UI
    renderPhaseUI(newPhase);
    
    // Trigger custom event for other components
    const event = new CustomEvent('phaseTransition', {
      detail: { from: currentPhase, to: newPhase }
    });
    document.dispatchEvent(event);
    
  } catch (error) {
    console.error('Error during phase transition:', error);
  }
}

/**
 * Create setup container dynamically
 */
function createSetupContainer() {
  const container = document.createElement('div');
  container.id = 'setup-container';
  container.className = 'phase-container';
  container.innerHTML = `
    <h2>Game Setup</h2>
    <div class="config-options">
      <label>Players: <input type="number" id="player-count" min="2" max="6" value="4"></label>
      <label>Rounds: <input type="number" id="round-count" min="1" max="10" value="5"></label>
    </div>
    <div class="phase-controls"></div>
  `;
  document.body.appendChild(container);
}

/**
 * Create bidding container dynamically
 */
function createBiddingContainer() {
  const container = document.createElement('div');
  container.id = 'bidding-container';
  container.className = 'phase-container phase-hidden';
  container.innerHTML = `
    <h2>Bidding Phase</h2>
    <div class="bid-controls">
      <label>Your Bid: <input type="number" id="player-bid" min="0" max="13" value="0"></label>
      <div id="bid-status">Waiting for bids...</div>
    </div>
    <div class="phase-controls"></div>
  `;
  document.body.appendChild(container);
}

/**
 * Create scoring container dynamically
 */
function createScoringContainer() {
  const container = document.createElement('div');
  container.id = 'scoring-container';
  container.className = 'phase-container phase-hidden';
  container.innerHTML = `
    <h2>Scoring Phase</h2>
    <div class="score-display">
      <div id="round-results">Calculating scores...</div>
      <div id="current-scores"></div>
    </div>
    <div class="phase-controls"></div>
  `;
  document.body.appendChild(container);
}

/**
 * Create completed container dynamically
 */
function createCompletedContainer() {
  const container = document.createElement('div');
  container.id = 'completed-container';
  container.className = 'phase-container phase-hidden';
  container.innerHTML = `
    <h2>Game Complete</h2>
    <div class="final-results">
      <div id="winner-display"></div>
      <div id="final-scores"></div>
    </div>
    <div class="phase-controls"></div>
  `;
  document.body.appendChild(container);
}

/**
 * Create and configure phase control buttons
 */
function createButton(id, text) {
  const button = document.createElement('button');
  button.id = id;
  button.textContent = text;
  button.className = 'phase-btn';
  
  // Find appropriate container and append
  const containers = document.querySelectorAll('.phase-controls');
  if (containers.length > 0) {
    containers[containers.length - 1].appendChild(button);
  } else {
    document.body.appendChild(button);
  }
  
  return button;
}

/**
 * Update phase indicator in UI
 */
function updatePhaseIndicator(phase) {
  let indicator = document.getElementById('phase-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'phase-indicator';
    indicator.className = 'phase-indicator';
    document.body.insertBefore(indicator, document.body.firstChild);
  }
  
  indicator.textContent = `Current Phase: ${phase.charAt(0).toUpperCase() + phase.slice(1)}`;
  indicator.className = `phase-indicator phase-${phase}`;
}

/**
 * Get current game phase
 */
function getCurrentPhase() {
  return currentPhase;
}

/**
 * Initialize game flow
 */
function initializeGameFlow() {
  // Start with setup phase
  renderPhaseUI(PHASES.SETUP);
  
  console.log('Game flow initialized');
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    renderPhaseUI,
    handlePhaseTransition,
    getCurrentPhase,
    initializeGameFlow,
    PHASES
  };
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGameFlow);
} else {
  initializeGameFlow();
}