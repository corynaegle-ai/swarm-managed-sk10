/**
 * Service for handling trick and bonus entry operations
 */
export class TrickBonusService {
  /**
   * Validates trick and bonus data before submission
   * @param {Array} submissionData - Array of player trick/bonus data
   * @param {number} handCount - Expected total tricks for the hand
   * @returns {Object} - Validation result with isValid flag and errors
   */
  static validateSubmissionData(submissionData, handCount) {
    const errors = [];
    let totalTricks = 0;
    
    // Validate each player's data
    submissionData.forEach((playerData, index) => {
      const { playerId, actualTricks, bonusPoints } = playerData;
      
      // Validate player ID
      if (!playerId) {
        errors.push(`Player ${index + 1}: Missing player ID`);
      }
      
      // Validate actual tricks
      if (typeof actualTricks !== 'number' || isNaN(actualTricks)) {
        errors.push(`Player ${playerId}: Invalid tricks count`);
      } else if (actualTricks < 0) {
        errors.push(`Player ${playerId}: Tricks cannot be negative`);
      } else if (actualTricks > handCount) {
        errors.push(`Player ${playerId}: Tricks cannot exceed hand count (${handCount})`);
      } else {
        totalTricks += actualTricks;
      }
      
      // Validate bonus points
      if (typeof bonusPoints !== 'number' || isNaN(bonusPoints)) {
        errors.push(`Player ${playerId}: Invalid bonus points`);
      }
    });
    
    // Validate total tricks
    if (totalTricks !== handCount && errors.length === 0) {
      errors.push(`Total tricks (${totalTricks}) must equal hand count (${handCount})`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      totalTricks
    };
  }
  
  /**
   * Updates PlayerRoundScore objects with trick and bonus data
   * @param {Array} playerRoundScores - Existing PlayerRoundScore objects
   * @param {Array} submissionData - Validated trick/bonus data
   * @returns {Array} - Updated PlayerRoundScore objects
   */
  static updatePlayerRoundScores(playerRoundScores, submissionData) {
    const updatedScores = [...playerRoundScores];
    
    submissionData.forEach(({ playerId, actualTricks, bonusPoints, bidMet }) => {
      const scoreIndex = updatedScores.findIndex(score => score.playerId === playerId);
      
      if (scoreIndex !== -1) {
        const score = { ...updatedScores[scoreIndex] };
        
        // Update actual tricks
        score.actualTricks = actualTricks;
        
        // Update bonus points (only if bid was met exactly)
        score.bonusPoints = bidMet ? bonusPoints : 0;
        
        // Calculate round score based on bid vs actual
        score.roundScore = this.calculateRoundScore(
          score.bid, 
          actualTricks, 
          score.bonusPoints
        );
        
        // Update bid met status
        score.bidMet = bidMet;
        
        updatedScores[scoreIndex] = score;
      }
    });
    
    return updatedScores;
  }
  
  /**
   * Calculates the round score based on bid, actual tricks, and bonus
   * @param {number} bid - Player's bid
   * @param {number} actualTricks - Actual tricks taken
   * @param {number} bonusPoints - Bonus points (only if bid met)
   * @returns {number} - Calculated round score
   */
  static calculateRoundScore(bid, actualTricks, bonusPoints) {
    const bidMet = bid === actualTricks;
    
    if (bidMet) {
      // Bid met exactly: 20 + 10 * tricks + bonus
      return 20 + (10 * actualTricks) + bonusPoints;
    } else {
      // Bid missed: -10 * difference, no bonus
      const difference = Math.abs(bid - actualTricks);
      return -10 * difference;
    }
  }
  
  /**
   * Checks if all required trick data is complete
   * @param {Array} players - Array of players
   * @param {Object} trickData - Object with playerId as keys and trick counts as values
   * @returns {boolean} - True if all players have trick data
   */
  static isDataComplete(players, trickData) {
    return players.every(player => {
      const tricks = trickData[player.id];
      return tricks !== undefined && tricks !== '' && !isNaN(parseInt(tricks, 10));
    });
  }
  
  /**
   * Formats submission data for API calls or storage
   * @param {Array} submissionData - Raw submission data
   * @returns {Object} - Formatted data for submission
   */
  static formatForSubmission(submissionData) {
    return {
      timestamp: new Date().toISOString(),
      playerUpdates: submissionData.map(({ playerId, actualTricks, bonusPoints, bidMet }) => ({
        playerId,
        actualTricks,
        bonusPoints,
        bidMet,
        updatedAt: new Date().toISOString()
      }))
    };
  }
}

export default TrickBonusService;