// Scoring logic for Trickster card game

/**
 * Validates trick entry data
 * @param {Array} playerTricks - Array of player trick data
 * @param {number} handCount - Expected total tricks for the round
 * @returns {Object} Validation result with isValid flag and error message
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
 * @param {number} playerId - Player identifier
 * @param {number} actualTricks - Number of tricks actually taken
 * @param {boolean} bonusEarned - Whether player earned bonus
 * @returns {number} The calculated round score
 */
function updatePlayerRoundScore(playerId, actualTricks, bonusEarned) {
  // This function would typically update game state
  // For now, return the calculated score
  return calculateRoundScore(playerId, actualTricks, bonusEarned);
}

/**
 * Calculates round score for a player
 * @param {number} predicted - Predicted tricks
 * @param {number} actual - Actual tricks taken
 * @param {boolean} bonusEarned - Whether bonus was earned
 * @returns {number} The calculated score
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

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateTrickEntry,
    updatePlayerRoundScore,
    calculateRoundScore
  };
} else {
  // Browser global scope
  window.validateTrickEntry = validateTrickEntry;
  window.updatePlayerRoundScore = updatePlayerRoundScore;
  window.calculateRoundScore = calculateRoundScore;
}