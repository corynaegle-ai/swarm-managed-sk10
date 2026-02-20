// Scoring functions will be available from scoring.js loaded separately
// Functions: validateTrickEntry, updatePlayerRoundScore

// Game state management
let gameState = {
  currentRound: 1,
  maxRounds: 10,
  players: [],
  gameActive: true
};

// Initialize the application
function initializeApp() {
  setupEventListeners();
  initializeGameState();
}

// Setup event listeners for form submission
function setupEventListeners() {
  const trickForm = document.getElementById('trick-entry-form');
  if (trickForm) {
    trickForm.addEventListener('submit', handleTrickSubmission);
  }
  
  // Also initialize players when form is available
  initializePlayersFromForm();
}

// Initialize game state
function initializeGameState() {
  // Initialize with empty players array - will be populated from form
  if (gameState.players.length === 0) {
    gameState.players = [];
  }
}

// Initialize players from form elements
function initializePlayersFromForm() {
  const playerInputs = document.querySelectorAll('.player-name');
  if (playerInputs.length > 0 && gameState.players.length === 0) {
    gameState.players = Array.from(playerInputs).map((input, index) => ({
      id: index + 1,
      name: input.value || `Player ${index + 1}`,
      scores: []
    }));
  }
}

// Handle trick entry form submission
function handleTrickSubmission(event) {
  event.preventDefault();
  
  try {
    // Clear previous error messages
    clearErrorMessages();
    
    // Ensure players are initialized
    if (gameState.players.length === 0) {
      initializePlayersFromForm();
    }
    
    if (gameState.players.length === 0) {
      displayError('No players found. Please ensure player inputs are available.');
      return;
    }
    
    // Extract form data
    const formData = extractFormData();
    
    // Check if scoring functions are available
    if (typeof validateTrickEntry !== 'function') {
      displayError('Scoring functions not available. Please ensure scoring.js is loaded.');
      return;
    }
    
    // Validate trick entry
    const validationResult = validateTrickEntry(formData);
    
    // Defensive check for validation result structure
    if (!validationResult || typeof validationResult.isValid === 'undefined') {
      displayError('Validation function returned invalid result.');
      return;
    }
    
    if (!validationResult.isValid) {
      const errors = validationResult.errors || ['Validation failed'];
      displayValidationErrors(errors);
      return;
    }
    
    // Update player scores for current round
    updatePlayerScores(formData);
    
    // Check if game should advance to next round or end
    if (gameState.currentRound >= gameState.maxRounds) {
      endGame();
    } else {
      advanceToNextRound();
    }
    
  } catch (error) {
    console.error('Error processing trick submission:', error);
    displayError('An error occurred while processing the submission. Please try again.');
  }
}

// Extract data from the trick entry form
function extractFormData() {
  const formData = {
    round: gameState.currentRound,
    players: []
  };
  
  // Extract trick values and bonus selections for each player
  gameState.players.forEach(player => {
    // Try multiple possible ID patterns for form elements
    let trickInput = document.querySelector(`#tricks-player-${player.id}`) ||
                    document.querySelector(`#player-${player.id}-tricks`) ||
                    document.querySelector(`[name="player${player.id}_tricks"]`);
    
    let bonusCheckbox = document.querySelector(`#bonus-player-${player.id}`) ||
                       document.querySelector(`#player-${player.id}-bonus`) ||
                       document.querySelector(`[name="player${player.id}_bonus"]`);
    
    if (!trickInput) {
      console.warn(`Trick input not found for player ${player.id}`);
    }
    
    formData.players.push({
      id: player.id,
      name: player.name,
      tricks: parseInt((trickInput?.value || '0')),
      bonus: bonusCheckbox?.checked || false
    });
  });
  
  return formData;
}

// Update player scores using scoring logic
function updatePlayerScores(formData) {
  // Check if scoring function is available
  if (typeof updatePlayerRoundScore !== 'function') {
    displayError('Scoring function updatePlayerRoundScore not available.');
    return;
  }
  
  formData.players.forEach(playerData => {
    const player = gameState.players.find(p => p.id === playerData.id);
    if (player) {
      try {
        const result = updatePlayerRoundScore(
          player,
          playerData.tricks,
          playerData.bonus,
          gameState.currentRound
        );
        
        // Handle different possible return types from scoring function
        let roundScore = 0;
        if (typeof result === 'number') {
          roundScore = result;
        } else if (result && typeof result.score === 'number') {
          roundScore = result.score;
        } else {
          console.warn(`Unexpected return from updatePlayerRoundScore:`, result);
        }
        
        // Ensure player has scores array
        if (!player.scores) {
          player.scores = [];
        }
        
        // Add round score to player's scores
        player.scores.push(roundScore);
        
        // Update UI with new score
        updatePlayerScoreDisplay(player.id, roundScore);
        
      } catch (error) {
        console.error(`Error updating score for player ${player.name}:`, error);
        displayError(`Error updating score for ${player.name}`);
      }
    }
  });
}

// Display validation errors to the user
function displayValidationErrors(errors) {
  let errorContainer = document.getElementById('error-messages');
  if (!errorContainer) {
    createErrorContainer();
    errorContainer = document.getElementById('error-messages');
  }
  
  if (!errorContainer) {
    console.error('Could not create or find error container');
    return;
  }
  
  const errorList = document.createElement('ul');
  errorList.className = 'validation-errors';
  
  // Ensure errors is an array
  const errorArray = Array.isArray(errors) ? errors : [errors];
  
  errorArray.forEach(error => {
    const errorItem = document.createElement('li');
    errorItem.textContent = String(error);
    errorItem.className = 'error-message';
    errorList.appendChild(errorItem);
  });
  
  errorContainer.innerHTML = '';
  errorContainer.appendChild(errorList);
  errorContainer.style.display = 'block';
}

// Display general error message
function displayError(message) {
  const errorContainer = document.getElementById('error-messages');
  if (!errorContainer) {
    createErrorContainer();
  }
  
  const errorContainer2 = document.getElementById('error-messages');
  errorContainer2.innerHTML = `<div class="error-message">${message}</div>`;
  errorContainer2.style.display = 'block';
}

// Create error container if it doesn't exist
function createErrorContainer() {
  const form = document.getElementById('trick-entry-form');
  if (form && !document.getElementById('error-messages')) {
    const errorContainer = document.createElement('div');
    errorContainer.id = 'error-messages';
    errorContainer.className = 'error-container';
    errorContainer.style.display = 'none';
    form.insertBefore(errorContainer, form.firstChild);
  }
}

// Clear previous error messages
function clearErrorMessages() {
  const errorContainer = document.getElementById('error-messages');
  if (errorContainer) {
    errorContainer.innerHTML = '';
    errorContainer.style.display = 'none';
  }
}

// Update player score display in UI
function updatePlayerScoreDisplay(playerId, roundScore) {
  // Try multiple possible selectors for score elements
  const scoreElement = document.querySelector(`#score-player-${playerId}`) ||
                      document.querySelector(`#player-${playerId}-score`) ||
                      document.querySelector(`[data-player-id="${playerId}"][data-type="total-score"]`);
  
  if (scoreElement) {
    const player = gameState.players.find(p => p.id === playerId);
    if (player && player.scores) {
      const totalScore = player.scores.reduce((sum, score) => sum + score, 0);
      scoreElement.textContent = totalScore;
    }
  } else {
    console.warn(`Score display element not found for player ${playerId}`);
  }
  
  // Update round score display if exists
  const roundScoreElement = document.querySelector(`#round-score-player-${playerId}`) ||
                           document.querySelector(`#player-${playerId}-round-score`) ||
                           document.querySelector(`[data-player-id="${playerId}"][data-type="round-score"]`);
  
  if (roundScoreElement) {
    roundScoreElement.textContent = roundScore;
  }
}

// Advance game to next round
function advanceToNextRound() {
  gameState.currentRound++;
  
  // Update round display
  const roundDisplay = document.getElementById('current-round');
  if (roundDisplay) {
    roundDisplay.textContent = gameState.currentRound;
  }
  
  // Reset form for next round
  const form = document.getElementById('trick-entry-form');
  if (form) {
    form.reset();
  }
  
  // Clear error messages
  clearErrorMessages();
  
  // Update hand count display if applicable
  updateHandCountDisplay();
}

// Update hand count display for current round
function updateHandCountDisplay() {
  const handCountElement = document.getElementById('hand-count');
  if (handCountElement) {
    // Hand count logic based on round (this depends on game rules)
    const handCount = calculateHandCountForRound(gameState.currentRound);
    handCountElement.textContent = handCount;
  }
}

// Calculate hand count based on round
function calculateHandCountForRound(round) {
  // Standard Oh Hell / Up and Down the River pattern
  // Rounds 1-10: 10 cards down to 1 card
  // Rounds 11-20: 1 card back up to 10 cards
  if (round <= 10) {
    return 11 - round;
  } else if (round <= 20) {
    return round - 10;
  } else {
    // Extended game pattern if more than 20 rounds
    const cycle = ((round - 1) % 20) + 1;
    return calculateHandCountForRound(cycle);
  }
}

// End the game
function endGame() {
  gameState.gameActive = false;
  
  // Calculate final scores and determine winner
  const finalScores = gameState.players.map(player => ({
    name: player.name,
    totalScore: player.scores.reduce((sum, score) => sum + score, 0)
  }));
  
  // Sort by score to find winner
  finalScores.sort((a, b) => b.totalScore - a.totalScore);
  
  // Display game end message
  displayGameEndMessage(finalScores);
  
  // Disable form
  const form = document.getElementById('trick-entry-form');
  if (form) {
    const inputs = form.querySelectorAll('input, button');
    inputs.forEach(input => input.disabled = true);
  }
}

// Display game end message
function displayGameEndMessage(finalScores) {
  const messageContainer = document.getElementById('game-message');
  if (messageContainer) {
    const winner = finalScores[0];
    messageContainer.innerHTML = `<h2>Game Over!</h2><p>Winner: ${winner.name} with ${winner.totalScore} points!</p>`;
    messageContainer.style.display = 'block';
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Make functions available globally for testing (non-module approach)
if (typeof window !== 'undefined') {
  window.gameAppFunctions = {
    handleTrickSubmission,
    extractFormData,
    updatePlayerScores,
    displayValidationErrors,
    advanceToNextRound,
    endGame,
    initializePlayersFromForm
  };
}