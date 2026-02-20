// Import scoring functions
import { validateTrickEntry, updatePlayerRoundScore } from './scoring.js';

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
}

// Initialize game state
function initializeGameState() {
  // Get player names from form or initialize default players
  const playerInputs = document.querySelectorAll('.player-name');
  gameState.players = Array.from(playerInputs).map((input, index) => ({
    id: index + 1,
    name: input.value || `Player ${index + 1}`,
    scores: []
  }));
}

// Handle trick entry form submission
function handleTrickSubmission(event) {
  event.preventDefault();
  
  try {
    // Clear previous error messages
    clearErrorMessages();
    
    // Extract form data
    const formData = extractFormData();
    
    // Validate trick entry
    const validationResult = validateTrickEntry(formData);
    
    if (!validationResult.isValid) {
      displayValidationErrors(validationResult.errors);
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
    const trickInput = document.querySelector(`#tricks-player-${player.id}`);
    const bonusCheckbox = document.querySelector(`#bonus-player-${player.id}`);
    
    formData.players.push({
      id: player.id,
      name: player.name,
      tricks: parseInt(trickInput?.value || 0),
      bonus: bonusCheckbox?.checked || false
    });
  });
  
  return formData;
}

// Update player scores using scoring logic
function updatePlayerScores(formData) {
  formData.players.forEach(playerData => {
    const player = gameState.players.find(p => p.id === playerData.id);
    if (player) {
      const roundScore = updatePlayerRoundScore(
        player,
        playerData.tricks,
        playerData.bonus,
        gameState.currentRound
      );
      
      // Update UI with new score
      updatePlayerScoreDisplay(player.id, roundScore);
    }
  });
}

// Display validation errors to the user
function displayValidationErrors(errors) {
  const errorContainer = document.getElementById('error-messages');
  if (!errorContainer) {
    createErrorContainer();
  }
  
  const errorList = document.createElement('ul');
  errorList.className = 'validation-errors';
  
  errors.forEach(error => {
    const errorItem = document.createElement('li');
    errorItem.textContent = error;
    errorItem.className = 'error-message';
    errorList.appendChild(errorItem);
  });
  
  const errorContainer2 = document.getElementById('error-messages');
  errorContainer2.innerHTML = '';
  errorContainer2.appendChild(errorList);
  errorContainer2.style.display = 'block';
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
  const scoreElement = document.querySelector(`#score-player-${playerId}`);
  if (scoreElement) {
    const player = gameState.players.find(p => p.id === playerId);
    const totalScore = player.scores.reduce((sum, score) => sum + score, 0);
    scoreElement.textContent = totalScore;
  }
  
  // Update round score display if exists
  const roundScoreElement = document.querySelector(`#round-score-player-${playerId}`);
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

// Calculate hand count based on round (placeholder logic)
function calculateHandCountForRound(round) {
  // This would depend on the specific game rules
  // Common pattern: start with 10, go down to 1, then back up
  if (round <= 10) {
    return 11 - round;
  } else {
    return round - 10;
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

// Export functions for testing
export {
  handleTrickSubmission,
  extractFormData,
  updatePlayerScores,
  displayValidationErrors,
  advanceToNextRound,
  endGame
};