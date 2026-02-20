class PlayerRoundScore {
  constructor(playerId, playerName, bid) {
    this.playerId = playerId;
    this.playerName = playerName;
    this.bid = bid;
    this.tricksWon = 0;
  }

  setTricksWon(tricks) {
    this.tricksWon = tricks;
  }

  static validateBidLimit(bid, handCount) {
    return bid >= 0 && bid <= handCount;
  }

  getScore() {
    if (this.tricksWon === this.bid) {
      return 10 + this.bid;
    } else {
      return Math.abs(this.tricksWon - this.bid) * -1;
    }
  }
}

export { PlayerRoundScore };
