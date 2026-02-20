class TrickEntry {
  constructor(playerId, actualTricks, bonusPoints = 0) {
    this.playerId = playerId;
    this.actualTricks = actualTricks;
    this.bonusPoints = bonusPoints;
  }

  validate(handCount) {
    if (this.actualTricks < 0 || this.actualTricks > handCount) {
      throw new Error(`Actual tricks must be between 0 and ${handCount}`);
    }
    if (typeof this.bonusPoints !== 'number') {
      throw new Error('Bonus points must be a number');
    }
  }
}

module.exports = TrickEntry;