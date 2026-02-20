const Round = require('../models/Round');

/**
 * Manages the progression through 10 rounds of the game
 */
class RoundManager {
  constructor() {
    this.rounds = [];
    this.currentRoundIndex = 0;
    this.gameCompleted = false;
    
    // Initialize all 10 rounds
    for (let i = 1; i <= 10; i++) {
      this.rounds.push(new Round(i));
    }
  }

  /**
   * Get the current round number (1-10)
   * @returns {number}
   */
  getCurrentRoundNumber() {
    if (this.gameCompleted) {
      return 10; // Stay at round 10 when game is complete
    }
    return this.rounds[this.currentRoundIndex].number;
  }

  /**
   * Get the number of hands for the current round
   * @returns {number}
   */
  getCurrentHandCount() {
    if (this.gameCompleted) {
      return this.rounds[9].handCount; // Return round 10's hand count
    }
    return this.rounds[this.currentRoundIndex].handCount;
  }

  /**
   * Get the current round object
   * @returns {Round}
   */
  getCurrentRound() {
    if (this.gameCompleted) {
      return this.rounds[9]; // Return round 10
    }
    return this.rounds[this.currentRoundIndex];
  }

  /**
   * Complete the current round and progress to the next
   * @param {Array} scores - Optional array of scores for the round
   * @returns {boolean} - True if progressed to next round, false if game ended
   */
  completeCurrentRound(scores = []) {
    if (this.gameCompleted) {
      return false;
    }

    // Mark current round as completed
    this.rounds[this.currentRoundIndex].complete(scores);

    // Check if this was the last round
    if (this.currentRoundIndex === 9) { // Round 10 (index 9)
      this.gameCompleted = true;
      return false;
    }

    // Progress to next round
    this.currentRoundIndex++;
    return true;
  }

  /**
   * Check if the game is completed (after round 10)
   * @returns {boolean}
   */
  isGameCompleted() {
    return this.gameCompleted;
  }

  /**
   * Get game progress information
   * @returns {Object}
   */
  getGameStatus() {
    return {
      currentRound: this.getCurrentRoundNumber(),
      currentHandCount: this.getCurrentHandCount(),
      totalRounds: 10,
      roundsCompleted: this.currentRoundIndex + (this.gameCompleted ? 1 : 0),
      gameCompleted: this.gameCompleted,
      rounds: this.rounds.map(round => round.getInfo())
    };
  }

  /**
   * Reset the round manager to start over
   */
  reset() {
    this.rounds = [];
    this.currentRoundIndex = 0;
    this.gameCompleted = false;
    
    // Reinitialize all 10 rounds
    for (let i = 1; i <= 10; i++) {
      this.rounds.push(new Round(i));
    }
  }
}

module.exports = RoundManager;