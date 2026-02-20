// Main application controller
class App {
    constructor() {
        this.gameState = null;
        this.gameFlow = null;
        this.initialized = false;
        this.currentPhase = 'setup';
    }

    async initialize() {
        try {
            // Initialize game modules
            this.gameState = new GameState();
            this.gameFlow = new GameFlow(this.gameState);
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize UI based on current phase
            this.updateUI();
            
            // Start main game loop
            this.startGameLoop();
            
            this.initialized = true;
            console.log('App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize application');
        }
    }

    setupEventListeners() {
        // Start game button
        const startGameBtn = document.getElementById('start-game-btn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => this.startGame());
        }

        // Next round button
        const nextRoundBtn = document.getElementById('next-round-btn');
        if (nextRoundBtn) {
            nextRoundBtn.addEventListener('click', () => this.nextRound());
        }

        // End game button
        const endGameBtn = document.getElementById('end-game-btn');
        if (endGameBtn) {
            endGameBtn.addEventListener('click', () => this.endGame());
        }

        // New game button
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.newGame());
        }

        // Export results button
        const exportResultsBtn = document.getElementById('export-results-btn');
        if (exportResultsBtn) {
            exportResultsBtn.addEventListener('click', () => this.exportResults());
        }

        // Listen for game state changes
        document.addEventListener('gameStateChanged', (event) => {
            this.handleGameStateChange(event.detail);
        });

        // Listen for phase changes
        document.addEventListener('phaseChanged', (event) => {
            this.handlePhaseChange(event.detail);
        });
    }

    startGameLoop() {
        // Main game loop - runs every frame to check for updates
        const loop = () => {
            if (this.initialized) {
                this.updateGameState();
                this.checkPhaseTransitions();
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    updateGameState() {
        if (!this.gameState || !this.gameFlow) return;
        
        // Update game flow
        this.gameFlow.update();
        
        // Check for completion after round 10
        if (this.gameState.getCurrentRound() > 10 && this.currentPhase === 'gameplay') {
            this.transitionToCompletion();
        }
    }

    checkPhaseTransitions() {
        const newPhase = this.gameFlow.getCurrentPhase();
        if (newPhase !== this.currentPhase) {
            this.transitionToPhase(newPhase);
        }
    }

    transitionToPhase(phase) {
        console.log(`Transitioning from ${this.currentPhase} to ${phase}`);
        
        // Hide current phase
        this.hidePhase(this.currentPhase);
        
        // Show new phase
        this.showPhase(phase);
        
        // Update current phase
        this.currentPhase = phase;
        
        // Update UI controls
        this.updatePhaseControls();
        
        // Emit phase change event
        document.dispatchEvent(new CustomEvent('phaseChanged', {
            detail: { from: this.currentPhase, to: phase }
        }));
    }

    hidePhase(phase) {
        const phaseElement = document.getElementById(`${phase}-phase`);
        if (phaseElement) {
            phaseElement.classList.add('hidden');
            phaseElement.classList.remove('active');
        }
    }

    showPhase(phase) {
        const phaseElement = document.getElementById(`${phase}-phase`);
        if (phaseElement) {
            phaseElement.classList.remove('hidden');
            phaseElement.classList.add('active');
        }
    }

    updatePhaseControls() {
        const startGameBtn = document.getElementById('start-game-btn');
        const nextRoundBtn = document.getElementById('next-round-btn');
        const endGameBtn = document.getElementById('end-game-btn');
        const newGameBtn = document.getElementById('new-game-btn');
        const exportResultsBtn = document.getElementById('export-results-btn');

        // Disable all controls initially
        [startGameBtn, nextRoundBtn, endGameBtn, newGameBtn, exportResultsBtn].forEach(btn => {
            if (btn) btn.disabled = true;
        });

        // Enable controls based on current phase
        switch (this.currentPhase) {
            case 'setup':
                if (startGameBtn && this.canStartGame()) {
                    startGameBtn.disabled = false;
                }
                break;
            case 'gameplay':
                if (nextRoundBtn) nextRoundBtn.disabled = false;
                if (endGameBtn) endGameBtn.disabled = false;
                break;
            case 'completion':
                if (newGameBtn) newGameBtn.disabled = false;
                if (exportResultsBtn) exportResultsBtn.disabled = false;
                break;
        }
    }

    canStartGame() {
        // Check if minimum players are available
        return this.gameState && this.gameState.getPlayers().length >= 2;
    }

    startGame() {
        try {
            if (!this.canStartGame()) {
                this.showError('Need at least 2 players to start the game');
                return;
            }

            this.gameFlow.startGame();
            this.transitionToPhase('gameplay');
            
            // Show scoreboard
            const scoreboard = document.getElementById('scoreboard');
            if (scoreboard) {
                scoreboard.classList.remove('hidden');
            }
            
            console.log('Game started');
        } catch (error) {
            console.error('Failed to start game:', error);
            this.showError('Failed to start game');
        }
    }

    nextRound() {
        try {
            this.gameFlow.nextRound();
            
            // Check if game should end after round 10
            if (this.gameState.getCurrentRound() > 10) {
                this.transitionToCompletion();
            }
            
            this.updateUI();
        } catch (error) {
            console.error('Failed to advance round:', error);
            this.showError('Failed to advance to next round');
        }
    }

    endGame() {
        try {
            this.gameFlow.endGame();
            this.transitionToCompletion();
        } catch (error) {
            console.error('Failed to end game:', error);
            this.showError('Failed to end game');
        }
    }

    transitionToCompletion() {
        this.gameFlow.completeGame();
        this.transitionToPhase('completion');
        
        // Show final results
        const finalResults = document.getElementById('final-results');
        if (finalResults) {
            finalResults.classList.remove('hidden');
        }
        
        console.log('Game completed');
    }

    newGame() {
        try {
            // Reset game state
            this.gameState.reset();
            this.gameFlow.reset();
            
            // Hide scoreboard and final results
            const scoreboard = document.getElementById('scoreboard');
            const finalResults = document.getElementById('final-results');
            
            if (scoreboard) scoreboard.classList.add('hidden');
            if (finalResults) finalResults.classList.add('hidden');
            
            // Return to setup phase
            this.transitionToPhase('setup');
            
            console.log('New game started');
        } catch (error) {
            console.error('Failed to start new game:', error);
            this.showError('Failed to start new game');
        }
    }

    exportResults() {
        try {
            const results = this.gameState.exportResults();
            const blob = new Blob([JSON.stringify(results, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `game-results-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            console.log('Results exported');
        } catch (error) {
            console.error('Failed to export results:', error);
            this.showError('Failed to export results');
        }
    }

    handleGameStateChange(detail) {
        console.log('Game state changed:', detail);
        this.updateUI();
    }

    handlePhaseChange(detail) {
        console.log('Phase changed:', detail);
        this.updateUI();
    }

    updateUI() {
        // Update scoreboard if visible
        const scoreboard = document.getElementById('scoreboard');
        if (scoreboard && !scoreboard.classList.contains('hidden')) {
            this.updateScoreboard();
        }
        
        // Update phase controls
        this.updatePhaseControls();
    }

    updateScoreboard() {
        if (!this.gameState) return;
        
        // Update current round display
        const currentRound = document.querySelector('.current-round');
        if (currentRound) {
            currentRound.textContent = `Round ${this.gameState.getCurrentRound()}`;
        }
        
        // Update game phase display
        const gamePhaseDisplay = document.querySelector('.game-phase');
        if (gamePhaseDisplay) {
            const phaseText = this.currentPhase === 'completion' ? 'Completed' : 'In Progress';
            gamePhaseDisplay.textContent = phaseText;
        }
    }

    showError(message) {
        // Simple error display - can be enhanced with a proper modal
        console.error(message);
        alert(message);
    }
}

// Global app instance
let app = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
    app.initialize();
    
    // Also initialize player UI
    if (typeof initializePlayerUI === 'function') {
        initializePlayerUI();
    }
});

// Export for global access
window.app = app;