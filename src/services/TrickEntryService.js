const TrickEntry = require('../models/TrickEntry');
const PlayerRoundScore = require('../models/PlayerRoundScore');

class TrickEntryService {
  constructor() {
    this.entries = new Map();
  }

  enterTricksAndBonus(roundId, playerId, actualTricks, bonusPoints = 0, handCount) {
    // Validate trick count within reasonable bounds
    if (actualTricks < 0 || actualTricks > handCount) {
      throw new Error(`Actual tricks must be between 0 and ${handCount}`);
    }

    if (typeof bonusPoints !== 'number') {
      throw new Error('Bonus points must be a number');
    }

    const entry = new TrickEntry(playerId, actualTricks, bonusPoints);
    entry.validate(handCount);

    const key = `${roundId}-${playerId}`;
    this.entries.set(key, entry);

    return entry;
  }

  updatePlayerRoundScore(playerRoundScore, actualTricks, bonusPoints, bidMet) {
    if (!playerRoundScore) {
      throw new Error('PlayerRoundScore is required');
    }

    // Update actual tricks taken
    playerRoundScore.actualTricks = actualTricks;

    // Bonus points only count if bid was met exactly
    if (bidMet) {
      playerRoundScore.bonusPoints = bonusPoints;
    } else {
      playerRoundScore.bonusPoints = 0;
    }

    // Calculate total score
    playerRoundScore.calculateScore();

    return playerRoundScore;
  }

  processRoundEntries(roundId, playerRoundScores, handCount) {
    const results = [];

    for (const playerRoundScore of playerRoundScores) {
      const key = `${roundId}-${playerRoundScore.playerId}`;
      const entry = this.entries.get(key);

      if (!entry) {
        throw new Error(`No entry found for player ${playerRoundScore.playerId} in round ${roundId}`);
      }

      // Check if bid was met exactly
      const bidMet = playerRoundScore.bid === entry.actualTricks;

      const updatedScore = this.updatePlayerRoundScore(
        playerRoundScore,
        entry.actualTricks,
        entry.bonusPoints,
        bidMet
      );

      results.push(updatedScore);
    }

    return results;
  }

  getTrickEntry(roundId, playerId) {
    const key = `${roundId}-${playerId}`;
    return this.entries.get(key);
  }

  clearRoundEntries(roundId) {
    const keysToDelete = [];
    for (const key of this.entries.keys()) {
      if (key.startsWith(`${roundId}-`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.entries.delete(key));
  }
}

module.exports = TrickEntryService;