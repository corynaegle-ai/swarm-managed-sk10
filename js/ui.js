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
        
        this.initializeEventListeners();
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
                return;
            }
            
            // Sort players by score (highest first)
            const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
            
            sortedPlayers.forEach((player, index) => {
                const row = document.createElement('tr');
                row.className = index === 0 ? 'leading-player' : '';
                
                row.innerHTML = `
                    <td class="player-name">${this.escapeHtml(player.name || 'Unknown Player')}</td>
                    <td class="player-score">${player.score || 0}</td>
                `;
                
                this.scoreboardBody.appendChild(row);
            });
            
            // Update scoreboard visibility
            const scoreSection = document.getElementById('score-section');
            if (scoreSection) {
                scoreSection.classList.add('active');
            }
            
        } catch (error) {
            console.error('Error displaying scoreboard:', error);
        }
    }
    
    /**
     * Show round results modal with scoring breakdown
     * @param {Object} roundScores - Object containing round scoring data
     */
    showRoundResults(roundScores) {
        if (!this.roundResultsModal || !this.roundScoresBreakdown) {
            console.error('Round results modal elements not found');
            return;
        }
        
        try {
            // Clear existing content
            this.roundScoresBreakdown.innerHTML = '';
            
            if (!roundScores || Object.keys(roundScores).length === 0) {
                this.roundScoresBreakdown.innerHTML = '<p class="no-results">No round results to display</p>';
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
                
                Object.entries(roundScores).forEach(([playerName, scoreData]) => {
                    const row = document.createElement('tr');
                    const details = scoreData.details || 'No details available';
                    const score = scoreData.score || scoreData || 0;
                    
                    row.innerHTML = `
                        <td class="player-name">${this.escapeHtml(playerName)}</td>
                        <td class="round-score">${score}</td>
                        <td class="score-details">${this.escapeHtml(details)}</td>
                    `;
                    
                    tbody.appendChild(row);
                });
                
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
            // Check if game.js functions are available
            if (typeof window.calculateRoundScores === 'function') {
                const roundScores = window.calculateRoundScores();
                this.showRoundResults(roundScores);
            } else if (typeof window.gameManager !== 'undefined' && typeof window.gameManager.calculateRoundScores === 'function') {
                const roundScores = window.gameManager.calculateRoundScores();
                this.showRoundResults(roundScores);
            } else {
                console.warn('Score calculation function not found. Showing mock results.');
                // Mock data for demonstration
                const mockScores = {
                    'Player 1': { score: 15, details: 'Base score: 10, Bonus: 5' },
                    'Player 2': { score: 12, details: 'Base score: 8, Bonus: 4' },
                    'Player 3': { score: 8, details: 'Base score: 8, No bonus' }
                };
                this.showRoundResults(mockScores);
            }
            
            // Update scoreboard after calculation
            this.refreshScoreboard();
            
        } catch (error) {
            console.error('Error handling score calculation:', error);
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
                // Mock data for demonstration
                players = [
                    { name: 'Player 1', score: 15 },
                    { name: 'Player 2', score: 12 },
                    { name: 'Player 3', score: 8 }
                ];
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
     * Initialize scoreboard with demo data
     */
    initializeDemoData() {
        const demoPlayers = [
            { name: 'Player 1', score: 0 },
            { name: 'Player 2', score: 0 },
            { name: 'Player 3', score: 0 }
        ];
        this.displayScoreboard(demoPlayers);
    }
}

// Initialize UI Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.uiManager = new UIManager();
    
    // Initialize with demo data if no game data available
    setTimeout(() => {
        if (!window.gameManager && !window.getPlayers) {
            window.uiManager.initializeDemoData();
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