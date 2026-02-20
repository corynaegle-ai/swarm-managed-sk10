import { PlayerManager } from './playerManager.js';
import { UIManager } from './uiManager.js';

/**
 * Main application controller
 * Coordinates player management and game flow with smooth transitions
 */
class App {
  constructor() {
    this.playerManager = new PlayerManager();
    this.uiManager = new UIManager();
    this.currentSection = 'player-setup';
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.showSection('player-setup');
  }

  setupEventListeners() {
    // Player form submission
    const playerForm = document.getElementById('player-form');
    if (playerForm) {
      playerForm.addEventListener('submit', (e) => this.handleAddPlayer(e));
    }

    // Start game button
    const startGameBtn = document.getElementById('start-game-btn');
    if (startGameBtn) {
      startGameBtn.addEventListener('click', () => this.handleStartGame());
    }

    // Listen for player manager events
    document.addEventListener('playerAdded', () => this.updateUI());
    document.addEventListener('playerRemoved', () => this.updateUI());
  }

  handleAddPlayer(e) {
    e.preventDefault();
    const nameInput = document.getElementById('player-name');
    const name = nameInput.value.trim();

    if (!name) {
      this.uiManager.showError('Please enter a player name');
      return;
    }

    try {
      this.playerManager.addPlayer(name);
      nameInput.value = '';
      nameInput.focus();
      this.uiManager.showSuccess(`${name} added successfully!`);
      this.updateUI();
    } catch (error) {
      this.uiManager.showError(error.message);
    }
  }

  handleStartGame() {
    const players = this.playerManager.getPlayers();
    
    if (players.length < 2) {
      this.uiManager.showError('At least 2 players are required to start the game');
      return;
    }

    // Smooth transition from player setup to game
    this.transitionToGame();
  }

  transitionToGame() {
    const playerSetupSection = document.getElementById('player-setup-section');
    const gameSection = document.getElementById('game-section');

    if (!playerSetupSection || !gameSection) {
      console.error('Required sections not found');
      return;
    }

    // Apply exit animation to player setup
    playerSetupSection.classList.add('section-exit-active');
    
    // Wait for exit animation to complete
    setTimeout(() => {
      playerSetupSection.classList.add('hidden');
      playerSetupSection.classList.remove('section-exit-active');
      
      // Show game section with enter animation
      gameSection.classList.remove('hidden');
      gameSection.classList.add('section-enter');
      
      // Trigger reflow to ensure animation plays
      gameSection.offsetHeight;
      
      gameSection.classList.add('section-enter-active');
      gameSection.classList.remove('section-enter');
      
      this.currentSection = 'game';
      this.initializeGame();
      
      // Clean up animation classes after transition
      setTimeout(() => {
        gameSection.classList.remove('section-enter-active');
      }, 400);
    }, 300);
  }

  showSection(sectionName) {
    const sections = document.querySelectorAll('[id$="-section"]');
    sections.forEach(section => {
      if (section.id === `${sectionName}-section`) {
        section.classList.remove('hidden');
        section.classList.add('fade-in');
      } else {
        section.classList.add('hidden');
      }
    });
    this.currentSection = sectionName;
  }

  updateUI() {
    const players = this.playerManager.getPlayers();
    this.uiManager.renderPlayerList(players, (playerId) => {
      this.playerManager.removePlayer(playerId);
      this.updateUI();
    });
    this.uiManager.updateStartButton(players.length >= 2);
  }

  initializeGame() {
    const players = this.playerManager.getPlayers();
    console.log('Starting game with players:', players);
    // Game initialization logic will be added in future tickets
    // This is where the actual game flow begins
  }

  // Public method to get current players (for game logic)
  getPlayers() {
    return this.playerManager.getPlayers();
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
  });
} else {
  window.app = new App();
}

export default App;
/**
 * Main Application Controller
 * Coordinates player management and game flow
 */
import { PlayerManager } from './playermanager.js';
import { UIComponents } from './uicomponents.js';

class App {
    constructor() {
        this.playerManager = new PlayerManager();
        this.ui = new UIComponents();
        this.isTransitioning = false;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        try {
            this.setupEventListeners();
            this.setupPlayerManagerEvents();
            this.focusPlayerNameInput();
            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.ui.showError('Application failed to initialize. Please refresh the page.');
        }
    }

    /**
     * Setup DOM event listeners
     */
    setupEventListeners() {
        // Player form submission
        const playerForm = this.ui.getElement('player-form');
        if (playerForm) {
            playerForm.addEventListener('submit', (e) => this.handlePlayerFormSubmit(e));
        }

        // Start game button
        const startGameBtn = this.ui.getElement('start-game-btn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => this.handleStartGame());
        }

        // Back to setup button
        const backToSetupBtn = this.ui.getElement('back-to-setup-btn');
        if (backToSetupBtn) {
            backToSetupBtn.addEventListener('click', () => this.handleBackToSetup());
        }

        // Player removal (event delegation)
        const playersGrid = this.ui.getElement('players-grid');
        if (playersGrid) {
            playersGrid.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-player-btn')) {
                    const playerId = e.target.dataset.playerId;
                    this.handleRemovePlayer(playerId);
                }
            });
        }

        // Enter key support for player name input
        const playerNameInput = this.ui.getElement('player-name');
        if (playerNameInput) {
            playerNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handlePlayerFormSubmit(e);
                }
            });
        }
    }

    /**
     * Setup PlayerManager event listeners
     */
    setupPlayerManagerEvents() {
        this.playerManager.on('playerAdded', (player) => {
            this.ui.updatePlayerList(this.playerManager.getAllPlayers());
            this.ui.clearPlayerNameInput();
            this.ui.showSuccess(`${player.name} added successfully!`);
        });

        this.playerManager.on('playerRemoved', (player) => {
            this.ui.updatePlayerList(this.playerManager.getAllPlayers());
            this.ui.showSuccess(`${player.name} removed successfully!`);
        });

        this.playerManager.on('playersCleared', () => {
            this.ui.updatePlayerList([]);
        });
    }

    /**
     * Handle player form submission
     * @param {Event} e - Form submit event
     */
    handlePlayerFormSubmit(e) {
        e.preventDefault();
        
        const playerNameInput = this.ui.getElement('player-name');
        const addPlayerBtn = this.ui.getElement('add-player-btn');
        
        if (!playerNameInput) {
            this.ui.showError('Player name input not found');
            return;
        }

        const playerName = playerNameInput.value.trim();
        
        if (!playerName) {
            this.ui.showError('Please enter a player name');
            this.ui.focusElement('player-name');
            return;
        }

        // Set loading state
        this.ui.setButtonLoading(addPlayerBtn, true);
        this.ui.clearError();

        // Add player with small delay to show loading state
        setTimeout(() => {
            const result = this.playerManager.addPlayer(playerName);
            
            this.ui.setButtonLoading(addPlayerBtn, false);
            
            if (!result.success) {
                this.ui.showError(result.error);
                this.ui.focusElement('player-name');
            }
        }, 100);
    }

    /**
     * Handle remove player
     * @param {string} playerId - Player ID to remove
     */
    handleRemovePlayer(playerId) {
        if (!playerId) {
            this.ui.showError('Invalid player ID');
            return;
        }

        const success = this.playerManager.removePlayer(playerId);
        if (!success) {
            this.ui.showError('Failed to remove player');
        }
    }

    /**
     * Handle start game transition
     */
    handleStartGame() {
        if (this.isTransitioning) return;
        
        const playerCount = this.playerManager.getPlayerCount();
        if (playerCount < 2) {
            this.ui.showError('At least 2 players are required to start the game');
            return;
        }

        this.isTransitioning = true;
        this.ui.clearError();
        
        // Smooth transition to game interface
        this.transitionToGameInterface();
    }

    /**
     * Handle back to setup transition
     */
    handleBackToSetup() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Smooth transition back to player setup
        this.transitionToPlayerSetup();
    }

    /**
     * Smooth transition to game interface
     */
    transitionToGameInterface() {
        this.ui.showGameInterface();
        
        // Reset transitioning flag after animation completes
        setTimeout(() => {
            this.isTransitioning = false;
        }, 400);
    }

    /**
     * Smooth transition to player setup
     */
    transitionToPlayerSetup() {
        this.ui.showPlayerSetup();
        
        // Reset transitioning flag and focus input after animation completes
        setTimeout(() => {
            this.isTransitioning = false;
            this.focusPlayerNameInput();
        }, 400);
    }

    /**
     * Focus player name input for better UX
     */
    focusPlayerNameInput() {
        setTimeout(() => {
            this.ui.focusElement('player-name');
        }, 100);
    }

    /**
     * Get current application state
     * @returns {Object} Application state
     */
    getState() {
        return {
            playerCount: this.playerManager.getPlayerCount(),
            players: this.playerManager.getAllPlayers(),
            isTransitioning: this.isTransitioning
        };
    }
}

// Initialize application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new App();
    });
} else {
    window.app = new App();
}

// Export for module usage
export default App;