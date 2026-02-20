class PlayerRoundScore {
    constructor(playerId, bid = 0) {
        this.playerId = playerId;
        this.bid = bid;
        this.actualTricks = 0;
        this.bonusPoints = 0;
        this.score = 0;
        this.bidMet = false;
    }
    
    updateTricksAndBonus(actualTricks, bonusPoints) {
        this.actualTricks = actualTricks;
        this.bonusPoints = bonusPoints;
        this.bidMet = (this.actualTricks === this.bid);
        this.calculateScore();
    }
    
    calculateScore() {
        if (this.bidMet) {
            // Bid met exactly: 10 points per bid + bonus points
            this.score = (this.bid * 10) + this.bonusPoints;
        } else {
            // Bid not met: lose 10 points per bid, no bonus
            this.score = -(this.bid * 10);
        }
    }
}

class GameState {
    constructor() {
        this.players = [];
        this.currentRound = 1;
        this.currentHandCount = 13;
        this.roundScores = new Map(); // roundNumber -> Map(playerId -> PlayerRoundScore)
        this.gamePhase = 'setup'; // setup, bidding, playing, trick_entry, round_complete
    }
    
    addPlayer(playerId, name) {
        this.players.push({ id: playerId, name: name });
    }
    
    startNewRound() {
        this.roundScores.set(this.currentRound, new Map());
        this.players.forEach(player => {
            this.roundScores.get(this.currentRound).set(
                player.id, 
                new PlayerRoundScore(player.id)
            );
        });
        this.gamePhase = 'bidding';
    }
    
    updatePlayerBid(playerId, bid) {
        const currentRoundScores = this.roundScores.get(this.currentRound);
        if (currentRoundScores && currentRoundScores.has(playerId)) {
            currentRoundScores.get(playerId).bid = bid;
        }
    }
    
    updatePlayerTricksAndBonus(playerId, actualTricks, bonusPoints) {
        const currentRoundScores = this.roundScores.get(this.currentRound);
        if (currentRoundScores && currentRoundScores.has(playerId)) {
            const playerScore = currentRoundScores.get(playerId);
            playerScore.updateTricksAndBonus(actualTricks, bonusPoints);
            return true;
        }
        return false;
    }
    
    validateTrickEntry(playerId, actualTricks, bonusPoints) {
        const errors = [];
        
        // Validate trick count
        if (actualTricks < 0) {
            errors.push(`${this.getPlayerName(playerId)}: Tricks cannot be negative`);
        }
        if (actualTricks > this.currentHandCount) {
            errors.push(`${this.getPlayerName(playerId)}: Tricks cannot exceed hand count (${this.currentHandCount})`);
        }
        if (!Number.isInteger(actualTricks)) {
            errors.push(`${this.getPlayerName(playerId)}: Tricks must be a whole number`);
        }
        
        // Validate bonus points
        if (!Number.isInteger(bonusPoints)) {
            errors.push(`${this.getPlayerName(playerId)}: Bonus points must be a whole number`);
        }
        
        return errors;
    }
    
    validateAllTrickEntries(trickEntries) {
        const errors = [];
        let totalTricks = 0;
        
        // Validate individual entries
        for (const [playerId, entry] of trickEntries) {
            const playerErrors = this.validateTrickEntry(playerId, entry.actualTricks, entry.bonusPoints);
            errors.push(...playerErrors);
            
            if (playerErrors.length === 0) {
                totalTricks += entry.actualTricks;
            }
        }
        
        // Validate total tricks equals hand count
        if (errors.length === 0 && totalTricks !== this.currentHandCount) {
            errors.push(`Total tricks (${totalTricks}) must equal hand count (${this.currentHandCount})`);
        }
        
        return errors;
    }
    
    submitAllTrickEntries(trickEntries) {
        const validationErrors = this.validateAllTrickEntries(trickEntries);
        
        if (validationErrors.length > 0) {
            return { success: false, errors: validationErrors };
        }
        
        // Update all player scores
        for (const [playerId, entry] of trickEntries) {
            this.updatePlayerTricksAndBonus(playerId, entry.actualTricks, entry.bonusPoints);
        }
        
        this.gamePhase = 'round_complete';
        return { success: true };
    }
    
    getCurrentRoundScores() {
        return this.roundScores.get(this.currentRound) || new Map();
    }
    
    getPlayerName(playerId) {
        const player = this.players.find(p => p.id === playerId);
        return player ? player.name : `Player ${playerId}`;
    }
    
    getTotalScoreForPlayer(playerId) {
        let totalScore = 0;
        for (const roundScores of this.roundScores.values()) {
            if (roundScores.has(playerId)) {
                totalScore += roundScores.get(playerId).score;
            }
        }
        return totalScore;
    }
    
    nextRound() {
        this.currentRound++;
        // Adjust hand count based on game rules (example: decrease by 1 each round)
        this.currentHandCount = Math.max(1, this.currentHandCount - 1);
        this.startNewRound();
    }
    
    setGamePhase(phase) {
        this.gamePhase = phase;
    }
    
    getGamePhase() {
        return this.gamePhase;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameState, PlayerRoundScore };
}