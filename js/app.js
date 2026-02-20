class SpadesApp {
    constructor() {
        this.gameState = new GameState();
        this.initializeApp();
        this.setupEventListeners();
        this.initializeTestData();
    }
    
    initializeApp() {
        this.trickEntryScreen = document.getElementById('trick-entry-screen');
        this.gameBoardScreen = document.getElementById('game-board');
        this.playerEntriesContainer = document.getElementById('player-entries');
        this.currentRoundSpan = document.getElementById('current-round');
        this.handCountSpan = document.getElementById('hand-count');
        this.submitButton = document.getElementById('submit-tricks');
        this.cancelButton = document.getElementById('cancel-entry');
        this.errorContainer = document.getElementById('entry-errors');
        this.showTrickEntryButton = document.getElementById('show-trick-entry');
    }
    
    setupEventListeners() {
        this.submitButton.addEventListener('click', () => this.handleSubmitTricks());
        this.cancelButton.addEventListener('click', () => this.handleCancelEntry());
        this.showTrickEntryButton.addEventListener('click', () => this.showTrickEntryScreen());
    }
    
    initializeTestData() {
        // Initialize with test players and start a round
        this.gameState.addPlayer('p1', 'Alice');
        this.gameState.addPlayer('p2', 'Bob');
        this.gameState.addPlayer('p3', 'Charlie');
        this.gameState.addPlayer('p4', 'Diana');
        
        this.gameState.startNewRound();
        
        // Set some example bids
        this.gameState.updatePlayerBid('p1', 3);
        this.gameState.updatePlayerBid('p2', 4);
        this.gameState.updatePlayerBid('p3', 2);
        this.gameState.updatePlayerBid('p4', 4);
        
        this.gameState.setGamePhase('trick_entry');
    }
    
    showTrickEntryScreen() {
        this.gameState.setGamePhase('trick_entry');
        this.renderTrickEntryScreen();
        this.gameBoardScreen.classList.add('hidden');
        this.trickEntryScreen.classList.remove('hidden');
    }
    
    renderTrickEntryScreen() {
        // Update round info
        this.currentRoundSpan.textContent = this.gameState.currentRound;
        this.handCountSpan.textContent = this.gameState.currentHandCount;
        
        // Clear previous entries
        this.playerEntriesContainer.innerHTML = '';
        
        // Create entries for each player
        this.gameState.players.forEach(player => {
            const playerEntry = this.createPlayerEntry(player);
            this.playerEntriesContainer.appendChild(playerEntry);
        });
        
        // Clear any previous errors
        this.hideErrors();
    }
    
    createPlayerEntry(player) {
        const currentRoundScores = this.gameState.getCurrentRoundScores();
        const playerScore = currentRoundScores.get(player.id);
        const bid = playerScore ? playerScore.bid : 0;
        
        const entryDiv = document.createElement('div');
        entryDiv.className = 'player-entry';
        entryDiv.innerHTML = `
            <h4>${player.name}</h4>
            <div class="bid-info">
                Bid: ${bid} tricks
            </div>
            <div class="input-group">
                <div class="input-field">
                    <label for="tricks-${player.id}">Actual Tricks:</label>
                    <input type="number" 
                           id="tricks-${player.id}" 
                           min="0" 
                           max="${this.gameState.currentHandCount}" 
                           placeholder="0" 
                           data-player-id="${player.id}">
                </div>
                <div class="input-field">
                    <label for="bonus-${player.id}">Bonus Points:</label>
                    <input type="number" 
                           id="bonus-${player.id}" 
                           min="0" 
                           placeholder="0" 
                           data-player-id="${player.id}">
                    <small style="color: rgba(255,255,255,0.7); font-size: 0.8em; display: block; margin-top: 0.25rem;">
                        Only counts if bid is met exactly
                    </small>
                </div>
            </div>
        `;
        
        return entryDiv;
    }
    
    collectTrickEntries() {
        const entries = new Map();
        
        this.gameState.players.forEach(player => {
            const tricksInput = document.getElementById(`tricks-${player.id}`);
            const bonusInput = document.getElementById(`bonus-${player.id}`);
            
            const actualTricks = parseInt(tricksInput.value) || 0;
            const bonusPoints = parseInt(bonusInput.value) || 0;
            
            entries.set(player.id, {
                actualTricks: actualTricks,
                bonusPoints: bonusPoints
            });
        });
        
        return entries;
    }
    
    handleSubmitTricks() {
        const trickEntries = this.collectTrickEntries();
        const result = this.gameState.submitAllTrickEntries(trickEntries);
        
        if (result.success) {
            this.showSuccessAndReturnToGame();
        } else {
            this.showErrors(result.errors);
        }
    }
    
    showSuccessAndReturnToGame() {
        // Hide trick entry screen
        this.trickEntryScreen.classList.add('hidden');
        this.gameBoardScreen.classList.remove('hidden');
        
        // Update game board with results (simple implementation)
        this.updateGameBoardWithResults();
        
        // Could emit event or call callback for further game logic
        console.log('Tricks and bonuses submitted successfully!');
        this.logCurrentRoundResults();
    }
    
    updateGameBoardWithResults() {
        const currentRoundScores = this.gameState.getCurrentRoundScores();
        let resultsHTML = '<h3>Round Results</h3><div class="results-grid">';
        
        this.gameState.players.forEach(player => {
            const playerScore = currentRoundScores.get(player.id);
            if (playerScore) {
                resultsHTML += `
                    <div class="result-card">
                        <h4>${player.name}</h4>
                        <p>Bid: ${playerScore.bid} | Actual: ${playerScore.actualTricks}</p>
                        <p>Bonus: ${playerScore.bonusPoints} | Score: ${playerScore.score}</p>
                        <p class="${playerScore.bidMet ? 'bid-met' : 'bid-missed'}">
                            ${playerScore.bidMet ? '✓ Bid Met' : '✗ Bid Missed'}
                        </p>
                    </div>
                `;
            }
        });
        
        resultsHTML += '</div><button id="next-round-btn" class="btn btn-primary">Next Round</button>';
        resultsHTML += '<button id="show-trick-entry" class="btn btn-secondary">Re-enter Tricks</button>';
        
        this.gameBoardScreen.innerHTML = resultsHTML;
        
        // Re-attach event listener
        document.getElementById('show-trick-entry').addEventListener('click', () => this.showTrickEntryScreen());
    }
    
    logCurrentRoundResults() {
        const currentRoundScores = this.gameState.getCurrentRoundScores();
        console.log(`=== Round ${this.gameState.currentRound} Results ===`);
        
        this.gameState.players.forEach(player => {
            const playerScore = currentRoundScores.get(player.id);
            if (playerScore) {
                console.log(`${player.name}: Bid ${playerScore.bid}, Made ${playerScore.actualTricks}, Bonus ${playerScore.bonusPoints}, Score ${playerScore.score}`);
            }
        });
    }
    
    handleCancelEntry() {
        this.trickEntryScreen.classList.add('hidden');
        this.gameBoardScreen.classList.remove('hidden');
    }
    
    showErrors(errors) {
        this.errorContainer.innerHTML = `
            <ul>
                ${errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
        `;
        this.errorContainer.classList.add('show');
        
        // Scroll to errors
        this.errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    hideErrors() {
        this.errorContainer.classList.remove('show');
        this.errorContainer.innerHTML = '';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new SpadesApp();
    
    // Make app globally accessible for debugging
    window.spadesApp = app;
});