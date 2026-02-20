/**
 * Round model for managing game rounds
 * Each round has a number and corresponding hand count
 */
class Round {
  constructor(number) {
    if (number < 1 || number > 10) {
      throw new Error('Round number must be between 1 and 10');
    }
    
    this.number = number;
    this.handCount = number; // hands equal to round number
    this.isCompleted = false;
    this.scores = [];
  }

  /**
   * Mark this round as completed
   * @param {Array} scores - Array of player scores for this round
   */
  complete(scores = []) {
    this.isCompleted = true;
    this.scores = scores;
  }

  /**
   * Check if round is completed
   * @returns {boolean}
   */
  isComplete() {
    return this.isCompleted;
  }

  /**
   * Get round information
   * @returns {Object}
   */
  getInfo() {
    return {
      number: this.number,
      handCount: this.handCount,
      isCompleted: this.isCompleted,
      scores: this.scores
    };
  }
}

module.exports = Round;