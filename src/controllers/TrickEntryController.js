const TrickEntryService = require('../services/TrickEntryService');

class TrickEntryController {
  constructor(trickEntryService = new TrickEntryService()) {
    this.trickEntryService = trickEntryService;
  }

  async enterTricks(req, res) {
    try {
      const { roundId, playerId, actualTricks, bonusPoints = 0, handCount } = req.body;

      if (!roundId || !playerId || actualTricks === undefined || !handCount) {
        return res.status(400).json({
          error: 'Missing required fields: roundId, playerId, actualTricks, handCount'
        });
      }

      const entry = this.trickEntryService.enterTricksAndBonus(
        roundId,
        playerId,
        actualTricks,
        bonusPoints,
        handCount
      );

      res.status(201).json({
        message: 'Tricks and bonus entered successfully',
        entry: {
          playerId: entry.playerId,
          actualTricks: entry.actualTricks,
          bonusPoints: entry.bonusPoints
        }
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async processRound(req, res) {
    try {
      const { roundId, playerRoundScores, handCount } = req.body;

      if (!roundId || !playerRoundScores || !handCount) {
        return res.status(400).json({
          error: 'Missing required fields: roundId, playerRoundScores, handCount'
        });
      }

      const results = this.trickEntryService.processRoundEntries(
        roundId,
        playerRoundScores,
        handCount
      );

      res.status(200).json({
        message: 'Round processed successfully',
        playerRoundScores: results
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getTrickEntry(req, res) {
    try {
      const { roundId, playerId } = req.params;

      const entry = this.trickEntryService.getTrickEntry(roundId, playerId);

      if (!entry) {
        return res.status(404).json({
          error: 'Trick entry not found'
        });
      }

      res.status(200).json({
        entry: {
          playerId: entry.playerId,
          actualTricks: entry.actualTricks,
          bonusPoints: entry.bonusPoints
        }
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = TrickEntryController;