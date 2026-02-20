/**
 * Skull King Score Calculator
 * Handles complex scoring rules for bid matching and non-matching scenarios
 */

class ScoreCalculator {
  /**
   * Calculate round score for a player
   * @param {number} bid - Player's bid for the round
   * @param {number} tricksWon - Actual tricks won
   * @param {number} handCount - Current hand number (round number)
   * @param {number} bonusPoints - Bonus points earned (only applied if bid correct)
   * @returns {Object} Score calculation result
   */
  static calculateRoundScore(bid, tricksWon, handCount, bonusPoints = 0) {
    if (typeof bid !== 'number' || typeof tricksWon !== 'number' || typeof handCount !== 'number') {
      throw new Error('Invalid input parameters: bid, tricksWon, and handCount must be numbers');
    }

    if (bid < 0 || tricksWon < 0 || handCount < 1) {
      throw new Error('Invalid input values: bid and tricksWon cannot be negative, handCount must be positive');
    }

    let roundScore = 0;
    let bidCorrect = false;
    let calculation = [];

    // Check if bid is correct
    bidCorrect = bid === tricksWon;

    if (bid === 0) {
      // Zero bid scenarios
      if (bidCorrect) {
        // AC3: Zero bid correct: +10 × hand count
        roundScore = 10 * handCount;
        calculation.push(`Zero bid correct: +10 × ${handCount} = +${roundScore}`);
      } else {
        // AC4: Zero bid incorrect: -10 × hand count
        roundScore = -10 * handCount;
        calculation.push(`Zero bid incorrect: -10 × ${handCount} = ${roundScore}`);
      }
    } else {
      // Non-zero bid scenarios
      if (bidCorrect) {
        // AC1: Correct bid (1+): +20 points per trick
        roundScore = 20 * tricksWon;
        calculation.push(`Correct bid: +20 × ${tricksWon} tricks = +${roundScore}`);
      } else {
        // AC2: Incorrect bid (1+): -10 points per trick difference
        const trickDifference = Math.abs(bid - tricksWon);
        roundScore = -10 * trickDifference;
        calculation.push(`Incorrect bid: -10 × ${trickDifference} difference = ${roundScore}`);
      }
    }

    // AC5: Bonus points only added if bid was correct
    let appliedBonusPoints = 0;
    if (bidCorrect && bonusPoints > 0) {
      appliedBonusPoints = bonusPoints;
      roundScore += bonusPoints;
      calculation.push(`Bonus points (bid correct): +${bonusPoints}`);
    } else if (!bidCorrect && bonusPoints > 0) {
      calculation.push(`Bonus points ignored (bid incorrect): ${bonusPoints}`);
    }

    return {
      roundScore,
      bidCorrect,
      appliedBonusPoints,
      calculation: calculation.join(', '),
      details: {
        bid,
        tricksWon,
        handCount,
        bonusPoints,
        trickDifference: Math.abs(bid - tricksWon)
      }
    };
  }

  /**
   * Update player's total score
   * @param {number} currentTotal - Player's current total score
   * @param {number} roundScore - Score from this round
   * @returns {number} New total score
   */
  static updatePlayerTotal(currentTotal, roundScore) {
    if (typeof currentTotal !== 'number' || typeof roundScore !== 'number') {
      throw new Error('Invalid input parameters: currentTotal and roundScore must be numbers');
    }
    
    return currentTotal + roundScore;
  }

  /**
   * Calculate scores for all players in a round
   * @param {Array} players - Array of player objects with bid, tricksWon, currentScore, bonusPoints
   * @param {number} handCount - Current hand number
   * @returns {Array} Updated players with round scores and new totals
   */
  static calculateRoundScores(players, handCount) {
    if (!Array.isArray(players)) {
      throw new Error('Players must be an array');
    }

    return players.map(player => {
      const { bid, tricksWon, currentScore = 0, bonusPoints = 0 } = player;
      
      const scoreResult = this.calculateRoundScore(bid, tricksWon, handCount, bonusPoints);
      const newTotal = this.updatePlayerTotal(currentScore, scoreResult.roundScore);
      
      return {
        ...player,
        roundScore: scoreResult.roundScore,
        totalScore: newTotal,
        bidCorrect: scoreResult.bidCorrect,
        appliedBonusPoints: scoreResult.appliedBonusPoints,
        scoreCalculation: scoreResult.calculation
      };
    });
  }
}

module.exports = ScoreCalculator;