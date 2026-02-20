/**
 * UI Management for Score Display and Calculation
 */

class UIManager {
    constructor() {
        this.scoreboardBody = document.getElementById('scoreboard-body');
        this.roundResultsModal = document.getElementById('round-results-modal');
        this.roundScoresBreakdown = document.getElementById('round-scores-breakdown');
        this.calculateScoreBtn = document.getElementById('calculate-score-btn');
        this.closeResultsBtn = document.getElementById('close-results-btn');
        this.modalClose = document.querySelector('.modal-close');
        this.scoreSection = document.getElementById('score-section');
        
        this.autoCalculationEnabled = true;
        this.gameState = null;
        
        this.initializeEventListeners();
        this.setupAutomaticScoreCalculation();
    }
    
    initializeEventListeners() {
        if (this.calculateScoreBtn) {
            this.calculateScoreBtn.addEventListener('click', () => this.handleScoreCalculation());
        }
        
        if (this.closeResultsBtn) {
            this.closeResultsBtn.addEventListener('click', () => this.hideRoundResults());
        }
        
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => this.hideRoundResults());
        }
        
        // Close modal when clicking outside
        if (this.roundResultsModal) {
            this.roundResultsModal.addEventListener('click', (e) => {
                if (e.target === this.roundResultsModal) {
                    this.hideRoundResults();
                }
            });
        }
        
        // Listen for game state changes
        document.addEventListener('gameStateChanged', (e) => {
            this.handleGameStateChange(e.detail);
        });
        
        document.addEventListener('roundEnded', (e) => {
            this.handleRoundEnd(e.detail);
        });
        
        document.addEventListener('scoreUpdated', (e) => {
            this.handleScoreUpdate(e.detail);
        });
    }
    
    setupAutomaticScoreCalculation() {
        // Poll for game state changes if events aren't available
        setInterval(() => {
            this.checkForGameUpdates();
        }, 1000);
    }
    
    checkForGameUpdates() {
        try {
            let currentGameState = null;
            
            // Try different ways to get game state
            if (typeof window.getGameState === 'function') {
                currentGameState = window.getGameState();
            } else if (window.gameManager && typeof window.gameManager.getGameState === 'function') {
                currentGameState = window.gameManager.getGameState();
            }
            
            if (currentGameState && JSON.stringify(currentGameState) !== JSON.stringify(this.gameState)) {
                this.gameState = currentGameState;
                this.handleGameStateChange(currentGameState);
            }
        } catch (error) {
            console.warn('Unable to check game updates:', error.message);
        }
    }
    
    handleGameStateChange(gameState) {
        if (!gameState) return;
        
        // Show score section when game starts
        if (gameState.players && gameState.players.length > 0) {
            this.showScoreSection();
            this.displayScoreboard(gameState.players);
        }
        
        // Auto-calculate if round ended
        if (gameState.roundEnded && this.autoCalculationEnabled) {
            this.handleScoreCalculation();
        }
    }
    
    handleRoundEnd(roundData) {
        if (this.autoCalculationEnabled) {
            setTimeout(() => {
                this.handleScoreCalculation();
            }, 100);
        }
    }
    
    handleScoreUpdate(scoreData) {
        if (scoreData && scoreData.players) {
            this.displayScoreboard(scoreData.players);
        } else {
            this.refreshScoreboard();
        }
    }
    
    showScoreSection() {
        if (this.scoreSection) {
            this.scoreSection.classList.remove('hidden');
            this.scoreSection.classList.add('active');
        }
    }
    
    /**
     * Display current scores in the scoreboard table
     * @param {Array} players - Array of player objects with name and score properties
     */
    displayScoreboard(players) {
        if (!this.scoreboardBody) {
            console.error('Scoreboard body element not found');
            return;
        }
        
        try {
            // Clear existing content
            this.scoreboardBody.innerHTML = '';
            
            if (!players || players.length === 0) {
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = '<td colspan="2" class="empty-state">No players added yet</td>';
                this.scoreboardBody.appendChild(emptyRow);
                this.hideScoreSection();
                return;
            }
            
            // Show score section when there are players
            this.showScoreSection();
            
            // Sort players by score (highest first)
            const sortedPlayers = [...players].sort((a, b) => (b.score || b.totalScore || 0) - (a.score || a.totalScore || 0));
            
            sortedPlayers.forEach((player, index) => {
                const row = document.createElement('tr');
                row.className = index === 0 ? 'leading-player' : '';
                row.classList.add('score-updated');
                
                const score = player.score || player.totalScore || 0;
                
                row.innerHTML = `
                    <td class="player-name">${this.escapeHtml(player.name || 'Unknown Player')}</td>
                    <td class="player-score">${score}</td>
                `;
                
                this.scoreboardBody.appendChild(row);
            });
            
            // Remove animation class after animation completes
            setTimeout(() => {
                const rows = this.scoreboardBody.querySelectorAll('tr');
                rows.forEach(row => row.classList.remove('score-updated'));
            }, 1000);
            
        } catch (error) {
            console.error('Error displaying scoreboard:', error);
        }
    }
    
    hideScoreSection() {
        if (this.scoreSection) {
            this.scoreSection.classList.add('hidden');
            this.scoreSection.classList.remove('active');
        }
    }
    
    /**
     * Show round results modal with scoring breakdown
     * @param {Object|Array} roundScores - Round scoring data
     */
    showRoundResults(roundScores) {
        if (!this.roundResultsModal || !this.roundScoresBreakdown) {
            console.error('Round results modal elements not found');
            return;
        }
        
        try {
            // Clear existing content
            this.roundScoresBreakdown.innerHTML = '';
            
            if (!this.validateRoundScores(roundScores)) {
                this.roundScoresBreakdown.innerHTML = '<p class="no-results">No valid round results to display</p>';
            } else {
                // Create breakdown table
                const table = document.createElement('table');
                table.className = 'round-results-table';
                
                const thead = document.createElement('thead');
                thead.innerHTML = `
                    <tr>
                        <th>Player</th>
                        <th>Round Score</th>
                        <th>Details</th>
                    </tr>
                `;
                table.appendChild(thead);
                
                const tbody = document.createElement('tbody');
                
                // Handle both object and array formats
                if (Array.isArray(roundScores)) {
                    roundScores.forEach(playerData => {
                        const row = document.createElement('tr');
                        const name = playerData.name || playerData.playerName || 'Unknown Player';
                        const score = playerData.roundScore || playerData.score || 0;
                        const details = playerData.details || playerData.breakdown || 'No details available';
                        
                        row.innerHTML = `
                            <td class="player-name">${this.escapeHtml(name)}</td>
                            <td class="round-score">${score}</td>
                            <td class="score-details">${this.escapeHtml(details)}</td>
                        `;
                        
                        tbody.appendChild(row);
                    });
                } else {
                    Object.entries(roundScores).forEach(([playerName, scoreData]) => {
                        const row = document.createElement('tr');
                        const details = scoreData.details || scoreData.breakdown || 'No details available';
                        const score = scoreData.score || scoreData.roundScore || scoreData || 0;
                        
                        row.innerHTML = `
                            <td class="player-name">${this.escapeHtml(playerName)}</td>
                            <td class="round-score">${score}</td>
                            <td class="score-details">${this.escapeHtml(details)}</td>
                        `;
                        
                        tbody.appendChild(row);
                    });
                }
                
                table.appendChild(tbody);
                this.roundScoresBreakdown.appendChild(table);
            }
            
            // Show modal
            this.roundResultsModal.classList.remove('hidden');
            
        } catch (error) {
            console.error('Error showing round results:', error);
        }
    }
    
    /**
     * Hide the round results modal
     */
    hideRoundResults() {
        if (this.roundResultsModal) {
            this.roundResultsModal.classList.add('hidden');
        }
    }
    
    /**
     * Handle score calculation trigger
     */
    handleScoreCalculation() {
        try {
            let roundScores = null;
            
            // Check if game.js functions are available
            if (typeof window.calculateRoundScores === 'function') {
                roundScores = window.calculateRoundScores();
            } else if (typeof window.gameManager !== 'undefined' && typeof window.gameManager.calculateRoundScores === 'function') {
                roundScores = window.gameManager.calculateRoundScores();
            } else {
                console.error('Score calculation function not available. Cannot calculate scores.');
                this.showError('Score calculation is not available. Please ensure the game is properly initialized.');
                return;
            }
            
            if (roundScores) {
                this.showRoundResults(roundScores);
                // Update scoreboard after calculation
                this.refreshScoreboard();
            } else {
                this.showError('No round scores available to calculate.');
            }
            
        } catch (error) {
            console.error('Error handling score calculation:', error);
            this.showError('Error calculating scores: ' + error.message);
        }
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        // Insert error message temporarily
        const scoreSection = this.scoreSection;
        if (scoreSection) {
            scoreSection.insertBefore(errorDiv, scoreSection.firstChild);
            
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 5000);
        }
    }
    
    /**
     * Refresh scoreboard with latest data
     */
    refreshScoreboard() {
        try {
            // Try to get updated player data
            let players = [];
            
            if (typeof window.getPlayers === 'function') {
                players = window.getPlayers();
            } else if (typeof window.gameManager !== 'undefined' && typeof window.gameManager.getPlayers === 'function') {
                players = window.gameManager.getPlayers();
            } else {
                console.warn('No player data source available');
                return;
            }
            
            this.displayScoreboard(players);
            
        } catch (error) {
            console.error('Error refreshing scoreboard:', error);
        }
    }
    
    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Validate round scores structure
     * @param {*} roundScores - Round scores data to validate
     * @returns {boolean} True if valid structure
     */
    validateRoundScores(roundScores) {
        if (!roundScores || typeof roundScores !== 'object') {
            return false;
        }
        
        // Check if it's an array of player objects
        if (Array.isArray(roundScores)) {
            return roundScores.every(item => 
                item && typeof item === 'object' && 
                (item.name || item.playerName) &&
                (typeof item.score === 'number' || typeof item.roundScore === 'number')
            );
        }
        
        // Check if it's an object with player names as keys
        return Object.keys(roundScores).length > 0;
    }
}

// Initialize UI Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uiManager = new UIManager();
    
    // Check for existing game data and update UI
    setTimeout(() => {
        if (window.uiManager) {
            window.uiManager.refreshScoreboard();
        }
    }, 100);
});

// Export functions for global access
window.displayScoreboard = (players) => {
    if (window.uiManager) {
        window.uiManager.displayScoreboard(players);
    }
};

window.showRoundResults = (roundScores) => {
    if (window.uiManager) {
        window.uiManager.showRoundResults(roundScores);
    }
};

window.handleScoreCalculation = () => {
    if (window.uiManager) {
        window.uiManager.handleScoreCalculation();
    }
};