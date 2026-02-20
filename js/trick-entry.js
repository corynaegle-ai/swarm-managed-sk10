/**
 * Trick and Bonus Entry Module
 * Handles collection of actual tricks taken and bonus points after each round
 */

class TrickEntryManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentRound = null;
        this.playerScores = new Map();
    }

    /**
     * Initialize trick entry for current round
     */
    initializeTrickEntry(roundData) {
        this.currentRound = roundData;
        this.playerScores.clear();
        
        // Initialize player scores with bid information
        roundData.players.forEach(player => {
            this.playerScores.set(player.id, {
                playerId: player.id,
                playerName: player.name,
                bid: player.bid || 0,
                actualTricks: null,
                bonusPoints: 0,
                bidMet: false
            });
        });
    }

    /**
     * Set actual tricks taken by a player
     * @param {string} playerId - Player ID
     * @param {number} tricks - Number of tricks taken (0 to hand count)
     */
    setPlayerTricks(playerId, tricks) {
        if (!this.validateTrickCount(tricks)) {
            throw new Error(`Invalid trick count: ${tricks}. Must be between 0 and ${this.currentRound.handCount}`);
        }

        const playerScore = this.playerScores.get(playerId);
        if (!playerScore) {
            throw new Error(`Player ${playerId} not found in current round`);
        }

        playerScore.actualTricks = tricks;
        playerScore.bidMet = (tricks === playerScore.bid);
        
        // Reset bonus if bid not met
        if (!playerScore.bidMet) {
            playerScore.bonusPoints = 0;
        }

        this.validateTotalTricks();
    }

    /**
     * Set bonus points for a player
     * @param {string} playerId - Player ID
     * @param {number} bonus - Bonus points
     */
    setPlayerBonus(playerId, bonus) {
        const playerScore = this.playerScores.get(playerId);
        if (!playerScore) {
            throw new Error(`Player ${playerId} not found in current round`);
        }

        // Bonus points only count if bid was met exactly
        if (!playerScore.bidMet) {
            console.warn(`Player ${playerScore.playerName} did not meet bid exactly. Bonus points will not be applied.`);
            playerScore.bonusPoints = 0;
            return;
        }

        playerScore.bonusPoints = Math.max(0, bonus); // Ensure non-negative
    }

    /**
     * Validate trick count is within bounds
     * @param {number} tricks - Number of tricks
     * @returns {boolean} True if valid
     */
    validateTrickCount(tricks) {
        return Number.isInteger(tricks) && 
               tricks >= 0 && 
               tricks <= this.currentRound.handCount;
    }

    /**
     * Validate total tricks equals hand count
     */
    validateTotalTricks() {
        const totalTricks = Array.from(this.playerScores.values())
            .filter(score => score.actualTricks !== null)
            .reduce((sum, score) => sum + score.actualTricks, 0);

        const allTricksEntered = Array.from(this.playerScores.values())
            .every(score => score.actualTricks !== null);

        if (allTricksEntered && totalTricks !== this.currentRound.handCount) {
            throw new Error(`Total tricks (${totalTricks}) must equal hand count (${this.currentRound.handCount})`);
        }
    }

    /**
     * Get current player scores
     * @returns {Array} Array of player score objects
     */
    getPlayerScores() {
        return Array.from(this.playerScores.values());
    }

    /**
     * Check if all tricks and bonuses are entered
     * @returns {boolean} True if complete
     */
    isEntryComplete() {
        return Array.from(this.playerScores.values())
            .every(score => score.actualTricks !== null);
    }

    /**
     * Update PlayerRoundScore objects with entered data
     */
    updatePlayerRoundScores() {
        if (!this.isEntryComplete()) {
            throw new Error('Cannot update scores - trick entry not complete');
        }

        this.validateTotalTricks();

        const updates = [];
        this.playerScores.forEach((score, playerId) => {
            const roundScore = {
                playerId: playerId,
                round: this.currentRound.roundNumber,
                bid: score.bid,
                actualTricks: score.actualTricks,
                bonusPoints: score.bidMet ? score.bonusPoints : 0,
                bidMet: score.bidMet,
                baseScore: this.calculateBaseScore(score),
                totalScore: this.calculateTotalScore(score)
            };
            updates.push(roundScore);
        });

        return updates;
    }

    /**
     * Calculate base score for player
     * @param {Object} score - Player score object
     * @returns {number} Base score
     */
    calculateBaseScore(score) {
        if (score.bidMet) {
            return 10 + score.bid;
        } else {
            return Math.abs(score.bid - score.actualTricks) * -1;
        }
    }

    /**
     * Calculate total score including bonus
     * @param {Object} score - Player score object
     * @returns {number} Total score
     */
    calculateTotalScore(score) {
        const baseScore = this.calculateBaseScore(score);
        return baseScore + (score.bidMet ? score.bonusPoints : 0);
    }
}

// Export for use in other modules
window.TrickEntryManager = TrickEntryManager;