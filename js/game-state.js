/**
 * Game State Management
 * Manages overall game state including rounds, players, and scores
 */

class GameState {
    constructor() {
        this.players = [];
        this.currentRound = 0;
        this.rounds = [];
        this.playerRoundScores = new Map(); // Map of playerId -> array of round scores
        this.gamePhase = 'setup'; // setup, bidding, playing, trick_entry, scoring, complete
    }

    /**
     * Add a player to the game
     * @param {Object} player - Player object {id, name}
     */
    addPlayer(player) {
        this.players.push(player);
        this.playerRoundScores.set(player.id, []);
    }

    /**
     * Start a new round
     * @param {number} handCount - Number of cards per player
     * @param {string} trump - Trump suit
     */
    startRound(handCount, trump) {
        this.currentRound++;
        const round = {
            roundNumber: this.currentRound,
            handCount: handCount,
            trump: trump,
            players: this.players.map(player => ({
                id: player.id,
                name: player.name,
                bid: null,
                actualTricks: null,
                bonusPoints: 0
            })),
            phase: 'bidding'
        };
        
        this.rounds.push(round);
        this.gamePhase = 'bidding';
        return round;
    }

    /**
     * Set player bid for current round
     * @param {string} playerId - Player ID
     * @param {number} bid - Bid amount
     */
    setPlayerBid(playerId, bid) {
        const currentRoundData = this.getCurrentRound();
        if (!currentRoundData) {
            throw new Error('No active round');
        }

        const player = currentRoundData.players.find(p => p.id === playerId);
        if (!player) {
            throw new Error(`Player ${playerId} not found in current round`);
        }

        player.bid = bid;
    }

    /**
     * Complete bidding phase and move to playing
     */
    completeBidding() {
        const currentRoundData = this.getCurrentRound();
        if (!currentRoundData) {
            throw new Error('No active round');
        }

        // Verify all players have bid
        const allBidsComplete = currentRoundData.players.every(player => player.bid !== null);
        if (!allBidsComplete) {
            throw new Error('Not all players have placed bids');
        }

        currentRoundData.phase = 'playing';
        this.gamePhase = 'playing';
    }

    /**
     * Complete playing phase and move to trick entry
     */
    completePlaying() {
        const currentRoundData = this.getCurrentRound();
        if (!currentRoundData) {
            throw new Error('No active round');
        }

        currentRoundData.phase = 'trick_entry';
        this.gamePhase = 'trick_entry';
    }

    /**
     * Update player round scores after trick entry
     * @param {Array} playerScores - Array of PlayerRoundScore objects
     */
    updatePlayerRoundScores(playerScores) {
        playerScores.forEach(score => {
            const playerScoreHistory = this.playerRoundScores.get(score.playerId);
            if (playerScoreHistory) {
                // Update existing round score or add new one
                const existingIndex = playerScoreHistory.findIndex(s => s.round === score.round);
                if (existingIndex >= 0) {
                    playerScoreHistory[existingIndex] = score;
                } else {
                    playerScoreHistory.push(score);
                }
            }
        });

        // Update current round data
        const currentRoundData = this.getCurrentRound();
        if (currentRoundData) {
            playerScores.forEach(score => {
                const player = currentRoundData.players.find(p => p.id === score.playerId);
                if (player) {
                    player.actualTricks = score.actualTricks;
                    player.bonusPoints = score.bonusPoints;
                }
            });
            
            currentRoundData.phase = 'scoring';
            this.gamePhase = 'scoring';
        }
    }

    /**
     * Get current round data
     * @returns {Object|null} Current round object or null
     */
    getCurrentRound() {
        return this.rounds[this.currentRound - 1] || null;
    }

    /**
     * Get player scores for a specific round
     * @param {string} playerId - Player ID
     * @param {number} roundNumber - Round number
     * @returns {Object|null} Player round score or null
     */
    getPlayerRoundScore(playerId, roundNumber) {
        const playerScores = this.playerRoundScores.get(playerId);
        if (!playerScores) return null;
        
        return playerScores.find(score => score.round === roundNumber) || null;
    }

    /**
     * Get all scores for a player
     * @param {string} playerId - Player ID
     * @returns {Array} Array of player round scores
     */
    getPlayerScores(playerId) {
        return this.playerRoundScores.get(playerId) || [];
    }

    /**
     * Get cumulative score for a player
     * @param {string} playerId - Player ID
     * @returns {number} Total score across all rounds
     */
    getPlayerTotalScore(playerId) {
        const scores = this.getPlayerScores(playerId);
        return scores.reduce((total, score) => total + score.totalScore, 0);
    }

    /**
     * Get game summary with all player totals
     * @returns {Array} Array of player summaries
     */
    getGameSummary() {
        return this.players.map(player => ({
            id: player.id,
            name: player.name,
            totalScore: this.getPlayerTotalScore(player.id),
            roundScores: this.getPlayerScores(player.id)
        })).sort((a, b) => b.totalScore - a.totalScore); // Sort by score descending
    }

    /**
     * Check if game is complete
     * @returns {boolean} True if all planned rounds are complete
     */
    isGameComplete() {
        // This would depend on your game rules for total number of rounds
        // For now, assume game continues until manually ended
        return this.gamePhase === 'complete';
    }

    /**
     * End the game
     */
    endGame() {
        this.gamePhase = 'complete';
    }

    /**
     * Export game state for saving
     * @returns {Object} Serializable game state
     */
    exportState() {
        return {
            players: this.players,
            currentRound: this.currentRound,
            rounds: this.rounds,
            playerRoundScores: Array.from(this.playerRoundScores.entries()),
            gamePhase: this.gamePhase
        };
    }

    /**
     * Import game state from saved data
     * @param {Object} state - Saved game state
     */
    importState(state) {
        this.players = state.players || [];
        this.currentRound = state.currentRound || 0;
        this.rounds = state.rounds || [];
        this.playerRoundScores = new Map(state.playerRoundScores || []);
        this.gamePhase = state.gamePhase || 'setup';
    }
}

// PlayerRoundScore class for type consistency
class PlayerRoundScore {
    constructor(playerId, round, bid, actualTricks, bonusPoints, bidMet) {
        this.playerId = playerId;
        this.round = round;
        this.bid = bid;
        this.actualTricks = actualTricks;
        this.bonusPoints = bonusPoints;
        this.bidMet = bidMet;
        this.baseScore = this.calculateBaseScore();
        this.totalScore = this.baseScore + (this.bidMet ? this.bonusPoints : 0);
    }

    calculateBaseScore() {
        if (this.bidMet) {
            return 10 + this.bid;
        } else {
            return Math.abs(this.bid - this.actualTricks) * -1;
        }
    }
}

// Export for use in other modules
window.GameState = GameState;
window.PlayerRoundScore = PlayerRoundScore;