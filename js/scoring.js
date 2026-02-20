/**
 * Scoring Utilities
 * Provides utility functions for score calculations and validation
 */

class ScoringUtils {
    /**
     * Calculate base score for a bid/actual combination
     * @param {number} bid - Player's bid
     * @param {number} actualTricks - Actual tricks taken
     * @returns {number} Base score
     */
    static calculateBaseScore(bid, actualTricks) {
        if (bid === actualTricks) {
            // Bid met exactly - 10 points plus bid
            return 10 + bid;
        } else {
            // Bid not met - negative points equal to difference
            return Math.abs(bid - actualTricks) * -1;
        }
    }

    /**
     * Calculate total score including bonus points
     * @param {number} bid - Player's bid
     * @param {number} actualTricks - Actual tricks taken
     * @param {number} bonusPoints - Bonus points (only applied if bid met)
     * @returns {Object} Score breakdown
     */
    static calculateTotalScore(bid, actualTricks, bonusPoints = 0) {
        const bidMet = (bid === actualTricks);
        const baseScore = this.calculateBaseScore(bid, actualTricks);
        const applicableBonus = bidMet ? bonusPoints : 0;
        const totalScore = baseScore + applicableBonus;

        return {
            bidMet,
            baseScore,
            bonusPoints: applicableBonus,
            totalScore
        };
    }

    /**
     * Validate that bonus points are only applied when bid is met exactly
     * @param {number} bid - Player's bid
     * @param {number} actualTricks - Actual tricks taken
     * @param {number} bonusPoints - Requested bonus points
     * @returns {boolean} True if bonus application is valid
     */
    static validateBonusApplication(bid, actualTricks, bonusPoints) {
        if (bonusPoints <= 0) {
            return true; // No bonus is always valid
        }
        
        return bid === actualTricks; // Bonus only valid if bid met exactly
    }

    /**
     * Validate trick count is within reasonable bounds
     * @param {number} tricks - Number of tricks
     * @param {number} maxTricks - Maximum possible tricks (hand count)
     * @returns {boolean} True if valid
     */
    static validateTrickCount(tricks, maxTricks) {
        return Number.isInteger(tricks) && 
               tricks >= 0 && 
               tricks <= maxTricks;
    }

    /**
     * Validate that total tricks across all players equals hand count
     * @param {Array} playerTricks - Array of {playerId, tricks} objects
     * @param {number} expectedTotal - Expected total (hand count)
     * @returns {Object} Validation result
     */
    static validateTotalTricks(playerTricks, expectedTotal) {
        const actualTotal = playerTricks.reduce((sum, player) => sum + player.tricks, 0);
        
        return {
            valid: actualTotal === expectedTotal,
            actualTotal,
            expectedTotal,
            difference: actualTotal - expectedTotal
        };
    }

    /**
     * Create a PlayerRoundScore object with calculated scores
     * @param {string} playerId - Player ID
     * @param {number} round - Round number
     * @param {number} bid - Player's bid
     * @param {number} actualTricks - Actual tricks taken
     * @param {number} bonusPoints - Bonus points
     * @returns {Object} Complete PlayerRoundScore object
     */
    static createPlayerRoundScore(playerId, round, bid, actualTricks, bonusPoints = 0) {
        if (!this.validateBonusApplication(bid, actualTricks, bonusPoints)) {
            bonusPoints = 0; // Force to 0 if bid not met
        }

        const scoreBreakdown = this.calculateTotalScore(bid, actualTricks, bonusPoints);
        
        return {
            playerId,
            round,
            bid,
            actualTricks,
            bonusPoints: scoreBreakdown.bonusPoints,
            bidMet: scoreBreakdown.bidMet,
            baseScore: scoreBreakdown.baseScore,
            totalScore: scoreBreakdown.totalScore
        };
    }

    /**
     * Format score for display
     * @param {Object} playerRoundScore - PlayerRoundScore object
     * @returns {string} Formatted score string
     */
    static formatScoreDisplay(playerRoundScore) {
        const { bid, actualTricks, baseScore, bonusPoints, totalScore, bidMet } = playerRoundScore;
        
        let display = `Bid: ${bid}, Actual: ${actualTricks}`;
        
        if (bidMet) {
            display += ` ✓ Base: ${baseScore}`;
            if (bonusPoints > 0) {
                display += ` + ${bonusPoints} bonus`;
            }
        } else {
            display += ` ✗ Penalty: ${baseScore}`;
        }
        
        display += ` = ${totalScore}`;
        return display;
    }

    /**
     * Calculate running totals for multiple rounds
     * @param {Array} roundScores - Array of PlayerRoundScore objects
     * @returns {Array} Array with running totals added
     */
    static calculateRunningTotals(roundScores) {
        let runningTotal = 0;
        
        return roundScores.map(score => {
            runningTotal += score.totalScore;
            return {
                ...score,
                runningTotal
            };
        });
    }

    /**
     * Get scoring summary for multiple players across rounds
     * @param {Map} playerRoundScores - Map of playerId -> array of round scores
     * @returns {Object} Comprehensive scoring summary
     */
    static getScoringSummary(playerRoundScores) {
        const summary = {
            players: [],
            roundCount: 0,
            totalScores: new Map()
        };

        // Calculate totals for each player
        playerRoundScores.forEach((roundScores, playerId) => {
            const totalScore = roundScores.reduce((sum, score) => sum + score.totalScore, 0);
            const bidsMetCount = roundScores.filter(score => score.bidMet).length;
            const totalBonusPoints = roundScores.reduce((sum, score) => sum + score.bonusPoints, 0);
            
            summary.players.push({
                playerId,
                totalScore,
                bidsMetCount,
                totalBonusPoints,
                roundsPlayed: roundScores.length,
                averageScore: roundScores.length > 0 ? totalScore / roundScores.length : 0
            });
            
            summary.totalScores.set(playerId, totalScore);
            summary.roundCount = Math.max(summary.roundCount, roundScores.length);
        });

        // Sort players by total score (descending)
        summary.players.sort((a, b) => b.totalScore - a.totalScore);
        
        return summary;
    }
}

// Export for use in other modules
window.ScoringUtils = ScoringUtils;