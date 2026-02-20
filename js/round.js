/**
 * Round class manages round progression in the game
 * Each round (1-10) has a number of hands equal to the round number
 */
class Round {
  /**
   * Initialize a new Round instance
   * @param {number} startingRound - The round to start from (default: 1)
   */
  constructor(startingRound = 1) {
    if (startingRound < 1 || startingRound > 10) {
      throw new Error('Round number must be between 1 and 10');
    }
    this.currentRound = startingRound;
  }

  /**
   * Get the number of hands in the current round
   * @returns {number} Number of hands (equal to round number)
   */
  get handsInRound() {
    return this.currentRound;
  }

  /**
   * Get the current round number
   * @returns {number} Current round (1-10)
   */
  getCurrentRound() {
    return this.currentRound;
  }

  /**
   * Get the number of hands in the current round
   * @returns {number} Number of hands in current round
   */
  getHandsInCurrentRound() {
    return this.handsInRound;
  }

  /**
   * Advance to the next round
   * @returns {boolean} True if successfully advanced, false if already at final round
   */
  advanceToNextRound() {
    if (this.currentRound >= 10) {
      return false; // Cannot advance beyond round 10
    }
    this.currentRound++;
    return true;
  }

  /**
   * Check if the game is complete (past round 10)
   * @returns {boolean} True if game is complete
   */
  isGameComplete() {
    return this.currentRound > 10;
  }

  /**
   * Reset the round to the beginning
   */
  reset() {
    this.currentRound = 1;
  }
}

// Export the Round class and utility functions
export default Round;
export { Round };

// For CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Round;
  module.exports.Round = Round;
}