export class PlayerRoundScore {
  constructor(player, bid, tricksWon = 0) {
    this.player = player;
    this.bid = bid;
    this.tricksWon = tricksWon;
  }

  // Method to calculate score, e.g., based on bid and tricks won
  calculateScore() {
    // Example logic: score = 10 if bid === tricksWon, else -10 per difference
    if (this.bid === this.tricksWon) {
      return 10;
    }
    return -10 * Math.abs(this.bid - this.tricksWon);
  }

  // Validate bid
  validateBid(maxHands) {
    return this.bid >= 0 && this.bid <= maxHands;
  }
}