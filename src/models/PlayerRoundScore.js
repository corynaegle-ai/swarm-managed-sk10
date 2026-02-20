/**
 * PlayerRoundScore model for tracking individual player performance in a round
 */
class PlayerRoundScore {
  constructor(playerId, playerName, bid = 0, tricks = 0, score = 0) {
    this.playerId = playerId;
    this.playerName = playerName;
    this.bid = this.validateBid(bid);
    this.tricks = tricks;
    this.score = score;
  }

  /**
   * Validates that the bid is a non-negative integer
   * @param {number} bid - The bid value to validate
   * @returns {number} - The validated bid
   * @throws {Error} - If bid is invalid
   */
  validateBid(bid) {
    const bidNumber = parseInt(bid);
    if (isNaN(bidNumber) || bidNumber < 0) {
      throw new Error('Bid must be a non-negative integer');
    }
    return bidNumber;
  }

  /**
   * Validates that the bid doesn't exceed the maximum allowed
   * @param {number} maxHands - Maximum number of hands in the round
   * @throws {Error} - If bid exceeds maximum
   */
  validateBidLimit(maxHands) {
    if (this.bid > maxHands) {
      throw new Error(`Bid ${this.bid} cannot exceed ${maxHands} hands`);
    }
  }

  /**
   * Updates the number of tricks taken
   * @param {number} tricks - Number of tricks taken
   */
  setTricks(tricks) {
    this.tricks = parseInt(tricks) || 0;
    this.calculateScore();
  }

  /**
   * Calculates the score based on bid vs tricks taken
   * Standard Spades scoring: 
   * - Make bid exactly: 10 * bid + tricks over bid
   * - Miss bid: -(10 * bid)
   */
  calculateScore() {
    if (this.tricks === this.bid) {
      this.score = 10 * this.bid;
    } else if (this.tricks > this.bid) {
      this.score = 10 * this.bid + (this.tricks - this.bid);
    } else {
      this.score = -(10 * this.bid);
    }
  }

  /**
   * Returns whether the player made their bid
   * @returns {boolean}
   */
  madeBid() {
    return this.tricks >= this.bid;
  }

  /**
   * Returns the difference between bid and tricks taken
   * @returns {number} - Positive if over bid, negative if under
   */
  getBidDifference() {
    return this.tricks - this.bid;
  }

  /**
   * Returns a summary object for display
   * @returns {Object}
   */
  getSummary() {
    return {
      playerId: this.playerId,
      playerName: this.playerName,
      bid: this.bid,
      tricks: this.tricks,
      score: this.score,
      madeBid: this.madeBid(),
      difference: this.getBidDifference()
    };
  }

  /**
   * Creates a PlayerRoundScore from a plain object
   * @param {Object} data - Plain object with player round data
   * @returns {PlayerRoundScore}
   */
  static fromObject(data) {
    return new PlayerRoundScore(
      data.playerId,
      data.playerName,
      data.bid,
      data.tricks,
      data.score
    );
  }

  /**
   * Validates multiple PlayerRoundScore objects for bid limits
   * @param {Array<PlayerRoundScore>} playerScores - Array of player scores
   * @param {number} maxHands - Maximum hands allowed
   * @throws {Error} - If any bid exceeds limit
   */
  static validateAllBids(playerScores, maxHands) {
    playerScores.forEach(playerScore => {
      playerScore.validateBidLimit(maxHands);
    });
  }
}

export default PlayerRoundScore;