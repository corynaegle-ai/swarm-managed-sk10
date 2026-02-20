/**
 * Game Logic and Score Management
 */

class GameManager {
    constructor() {
        this.players = [];
        this.currentRound = 1;
        this.gameStarted = false;
        this.roundScores = {};
        this.gameHistory = [];
        
        this.initializeGame();
    }
    
    initializeGame() {
        // Initialize with some default players for testing
        this.players = [
            { name: 'Player 1', score: 0, totalScore: 0 },
            { name: 'Player 2', score: 0, totalScore: 0 },
            { name: 'Player 3', score: 0, totalScore: 0 }
        ];
        
        this.gameStarted = true;
        this.dispatchGameEvent('gameInitialized', { players: this.players });
    }
    
    /**
     * Add a new player to the game
     * @param {string} playerName - Name of the player to add
     */
    addPlayer(playerName) {
        if (!playerName || typeof playerName !== 'string') {
            throw new Error('Player name must be a valid string');
        }
        
        // Check if player already exists
        const existingPlayer = this.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
        if (existingPlayer) {
            throw new Error('Player with this name already exists');
        }
        
        const newPlayer = {
            name: playerName.trim(),
            score: 0,
            totalScore: 0,
            roundScores: []
        };
        
        this.players.push(newPlayer);
        this.dispatchGameEvent('playerAdded', { player: newPlayer, players: this.players });
        
        return newPlayer;
    }
    
    /**
     * Remove a player from the game
     * @param {string} playerName - Name of the player to remove
     */
    removePlayer(playerName) {
        const playerIndex = this.players.findIndex(p => p.name.toLowerCase() === playerName.toLowerCase());
        if (playerIndex === -1) {
            throw new Error('Player not found');
        }
        
        const removedPlayer = this.players.splice(playerIndex, 1)[0];
        this.dispatchGameEvent('playerRemoved', { player: removedPlayer, players: this.players });
        
        return removedPlayer;
    }
    
    /**
     * Get all players
     * @returns {Array} Array of player objects
     */
    getPlayers() {
        return [...this.players];
    }
    
    /**
     * Get current game state
     * @returns {Object} Current game state
     */
    getGameState() {
        return {
            players: this.getPlayers(),
            currentRound: this.currentRound,
            gameStarted: this.gameStarted,
            roundScores: { ...this.roundScores }
        };
    }
    
    /**
     * Calculate scores for the current round
     * @returns {Array} Array of round score objects
     */
    calculateRoundScores() {
        if (!this.gameStarted || this.players.length === 0) {
            console.warn('Cannot calculate scores: Game not started or no players');
            return [];
        }
        
        const roundScores = [];
        
        this.players.forEach(player => {
            // Simulate score calculation (in a real game, this would be based on game logic)
            const baseScore = Math.floor(Math.random() * 100) + 50; // Random score between 50-149
            const bonusScore = Math.floor(Math.random() * 20); // Bonus 0-19
            const roundScore = baseScore + bonusScore;
            
            // Update player's total score
            player.score = (player.score || 0) + roundScore;
            player.totalScore = player.score;
            
            if (!player.roundScores) {
                player.roundScores = [];
            }
            player.roundScores.push(roundScore);
            
            roundScores.push({
                name: player.name,
                playerName: player.name,
                roundScore: roundScore,
                score: roundScore,
                totalScore: player.totalScore,
                details: `Base: ${baseScore}, Bonus: ${bonusScore}`,
                breakdown: `Base score: ${baseScore} points, Bonus: ${bonusScore} points`
            });
        });
        
        // Store round scores
        this.roundScores[`round_${this.currentRound}`] = roundScores;
        
        // Dispatch events
        this.dispatchGameEvent('roundScoresCalculated', { 
            roundScores: roundScores, 
            round: this.currentRound,
            players: this.getPlayers()
        });
        
        this.dispatchGameEvent('scoreUpdated', { players: this.getPlayers() });
        
        // Increment round
        this.currentRound++;
        
        return roundScores;
    }
    
    /**
     * Manually set a player's score
     * @param {string} playerName - Name of the player
     * @param {number} score - New total score
     */
    setPlayerScore(playerName, score) {
        const player = this.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
        if (!player) {
            throw new Error('Player not found');
        }
        
        if (typeof score !== 'number' || score < 0) {
            throw new Error('Score must be a non-negative number');
        }
        
        player.score = score;
        player.totalScore = score;
        
        this.dispatchGameEvent('scoreUpdated', { players: this.getPlayers() });
    }
    
    /**
     * Reset all scores
     */
    resetScores() {
        this.players.forEach(player => {
            player.score = 0;
            player.totalScore = 0;
            player.roundScores = [];
        });
        
        this.roundScores = {};
        this.currentRound = 1;
        
        this.dispatchGameEvent('scoresReset', { players: this.getPlayers() });
        this.dispatchGameEvent('scoreUpdated', { players: this.getPlayers() });
    }
    
    /**
     * Start a new game
     */
    startNewGame() {
        this.resetScores();
        this.gameStarted = true;
        this.dispatchGameEvent('gameStarted', { players: this.getPlayers() });
    }
    
    /**
     * End the current round
     */
    endRound() {
        this.dispatchGameEvent('roundEnded', { 
            round: this.currentRound,
            players: this.getPlayers()
        });
    }
    
    /**
     * Dispatch custom game events
     * @param {string} eventType - Type of event
     * @param {Object} data - Event data
     */
    dispatchGameEvent(eventType, data = {}) {
        try {
            const event = new CustomEvent(eventType, {
                detail: data,
                bubbles: true,
                cancelable: true
            });
            
            document.dispatchEvent(event);
            
            // Also dispatch generic gameStateChanged event
            if (eventType !== 'gameStateChanged') {
                const stateEvent = new CustomEvent('gameStateChanged', {
                    detail: this.getGameState(),
                    bubbles: true,
                    cancelable: true
                });
                document.dispatchEvent(stateEvent);
            }
        } catch (error) {
            console.error('Error dispatching game event:', error);
        }
    }
}

// Initialize global game manager
let gameManager = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    gameManager = new GameManager();
    window.gameManager = gameManager;
    
    // Export functions to global scope for UI integration
    window.getPlayers = () => gameManager.getPlayers();
    window.getGameState = () => gameManager.getGameState();
    window.calculateRoundScores = () => gameManager.calculateRoundScores();
    window.addPlayer = (name) => gameManager.addPlayer(name);
    window.removePlayer = (name) => gameManager.removePlayer(name);
    window.setPlayerScore = (name, score) => gameManager.setPlayerScore(name, score);
    window.resetScores = () => gameManager.resetScores();
    window.startNewGame = () => gameManager.startNewGame();
    window.endRound = () => gameManager.endRound();
    
    console.log('Game Manager initialized with', gameManager.getPlayers().length, 'players');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameManager };
}