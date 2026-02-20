// Scoring logic for Trickster card game

/**
 * Validates trick entry data
 * @param {Array} playerTricks - Array of player trick data
 * @param {number} handCount - Number of cards in hand for this round
 * @returns {Object} Validation result with isValid boolean and error message
 */
function validateTrickEntry(playerTricks, handCount) {
  // Validate total actual tricks equals hand count
  const totalActualTricks = playerTricks.reduce((sum, p) => sum + p.actual, 0);
  
  if (totalActualTricks !== handCount) {
    return {
      isValid: false,
      error: `Total actual tricks (${totalActualTricks}) must equal hand count (${handCount})`
    };
  }
  
  // Validate individual player entries
  for (let player of playerTricks) {
    if (player.predicted < 0 || player.predicted > handCount) {
      return {
        isValid: false,
        error: `${player.playerName}'s predicted tricks must be between 0 and ${handCount}`
      };
    }
    
    if (player.actual < 0 || player.actual > handCount) {
      return {
        isValid: false,
        error: `${player.playerName}'s actual tricks must be between 0 and ${handCount}`
      };
    }
  }
  
  return { isValid: true };
}

/**
 * Updates a player's round score
 * @param {string} playerId - Player identifier
 * @param {number} actualTricks - Number of tricks actually taken
 * @param {boolean} bonusEarned - Whether bonus was earned
 * @returns {number} Calculated score for the round
 */
function updatePlayerRoundScore(playerId, actualTricks, bonusEarned) {
  // This function would normally update game state
  // For now, it calculates and returns the score
  return calculateRoundScore(actualTricks, actualTricks, bonusEarned);
}

/**
 * Calculates score for a single round
 * @param {number} predicted - Number of tricks predicted
 * @param {number} actual - Number of tricks actually taken
 * @param {boolean} bonusEarned - Whether bonus was earned
 * @returns {number} Score for this round
 */
function calculateRoundScore(predicted, actual, bonusEarned) {
  let score = 0;
  
  if (predicted === actual) {
    // Correct prediction: 10 points + actual tricks
    score = 10 + actual;
    
    if (bonusEarned) {
      score += 5; // Bonus points
    }
  } else {
    // Incorrect prediction: negative points for difference
    score = -(Math.abs(predicted - actual));
  }
  
  return score;
}

/**
 * Calculates total game score for a player
 * @param {Array} roundScores - Array of round scores
 * @returns {number} Total score
 */
function calculateTotalScore(roundScores) {
  return roundScores.reduce((total, score) => total + (score || 0), 0);
}

// Export functions for use in other modules
if (typeof window !== 'undefined') {
  // Browser environment - attach to window
  window.validateTrickEntry = validateTrickEntry;
  window.updatePlayerRoundScore = updatePlayerRoundScore;
  window.calculateRoundScore = calculateRoundScore;
  window.calculateTotalScore = calculateTotalScore;
}

if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment - export as module
  module.exports = {
    validateTrickEntry,
    updatePlayerRoundScore,
    calculateRoundScore,
    calculateTotalScore
  };
}