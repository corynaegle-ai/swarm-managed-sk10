// Main application entry point
import { PlayerManager } from './playerManager.js';
import { UIComponents } from './uiComponents.js';

class SkullKingApp {
  constructor() {
    this.playerManager = null;
    this.uiComponents = null;
    this.gameStarted = false;
    this.currentView = 'player-setup';
    
    this.init();
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      // Initialize managers
      this.playerManager = new PlayerManager();
      this.uiComponents = new UIComponents();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize player setup UI
      this.initializePlayerSetup();
      
      console.log('Skull King app initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('Failed to initialize application. Please refresh the page.');
    }
  }

  /**
   * Set up all event listeners
   */
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

    // Player removal (delegated event)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-player-btn')) {
        const playerId = e.target.dataset.playerId;
        this.handleRemovePlayer(playerId);
      }
    });

    // Input validation
    const playerNameInput = document.getElementById('player-name');
    if (playerNameInput) {
      playerNameInput.addEventListener('input', () => this.validatePlayerInput());
      playerNameInput.addEventListener('blur', () => this.validatePlayerInput());
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
  }

  /**
   * Initialize player setup flow
   */
  initializePlayerSetup() {
    this.showPlayerSetup();
    this.updateUI();
    
    // Focus on name input
    const nameInput = document.getElementById('player-name');
    if (nameInput) {
      nameInput.focus();
    }
  }

  /**
   * Handle adding a new player
   */
  async handleAddPlayer(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('player-name');
    const playerName = nameInput.value.trim();
    
    if (!this.validatePlayerName(playerName)) {
      return;
    }

    try {
      const player = await this.playerManager.addPlayer(playerName);
      
      if (player) {
        // Clear input and show success
        nameInput.value = '';
        this.showSuccess(`Added ${player.name} to the game!`);
        
        // Update UI
        this.updateUI();
        
        // Focus back to input for next player
        nameInput.focus();
      }
    } catch (error) {
      console.error('Error adding player:', error);
      this.showError(error.message || 'Failed to add player');
    }
  }

  /**
   * Handle removing a player
   */
  async handleRemovePlayer(playerId) {
    try {
      const removed = await this.playerManager.removePlayer(playerId);
      
      if (removed) {
        this.showSuccess(`Removed ${removed.name} from the game`);
        this.updateUI();
      }
    } catch (error) {
      console.error('Error removing player:', error);
      this.showError('Failed to remove player');
    }
  }

  /**
   * Handle starting the game
   */
  async handleStartGame() {
    try {
      const players = this.playerManager.getPlayers();
      
      if (players.length < 2) {
        this.showError('At least 2 players are required to start the game');
        return;
      }
      
      if (players.length > 8) {
        this.showError('Maximum 8 players allowed');
        return;
      }

      // Transition to game view
      await this.transitionToGame();
      
    } catch (error) {
      console.error('Error starting game:', error);
      this.showError('Failed to start game');
    }
  }

  /**
   * Validate player name input
   */
  validatePlayerName(name) {
    if (!name) {
      this.showError('Player name is required');
      return false;
    }
    
    if (name.length < 2) {
      this.showError('Player name must be at least 2 characters long');
      return false;
    }
    
    if (name.length > 20) {
      this.showError('Player name must be 20 characters or less');
      return false;
    }
    
    // Check for duplicate names
    const existingPlayer = this.playerManager.findPlayerByName(name);
    if (existingPlayer) {
      this.showError('A player with that name already exists');
      return false;
    }
    
    return true;
  }

  /**
   * Validate player input in real-time
   */
  validatePlayerInput() {
    const nameInput = document.getElementById('player-name');
    const addBtn = document.getElementById('add-player-btn');
    
    if (!nameInput || !addBtn) return;
    
    const name = nameInput.value.trim();
    const isValid = name.length >= 2 && name.length <= 20 && 
                   !this.playerManager.findPlayerByName(name);
    
    addBtn.disabled = !isValid;
    
    // Remove error styling when user starts typing
    if (nameInput.classList.contains('error') && name.length > 0) {
      nameInput.classList.remove('error');
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyboardShortcuts(event) {
    // Enter key in player setup
    if (event.key === 'Enter' && this.currentView === 'player-setup') {
      const nameInput = document.getElementById('player-name');
      if (document.activeElement === nameInput) {
        event.preventDefault();
        const form = document.getElementById('player-form');
        if (form) {
          form.dispatchEvent(new Event('submit'));
        }
      }
    }
    
    // Ctrl/Cmd + Enter to start game
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      if (this.currentView === 'player-setup') {
        this.handleStartGame();
      }
    }
  }

  /**
   * Update the UI based on current state
   */
  updateUI() {
    this.updatePlayerList();
    this.updateGameControls();
    this.updatePlayerCount();
  }

  /**
   * Update the player list display
   */
  updatePlayerList() {
    const playersList = document.getElementById('players-list');
    if (!playersList) return;
    
    const players = this.playerManager.getPlayers();
    
    if (players.length === 0) {
      playersList.innerHTML = '<p class="no-players">No players added yet. Add players to start the game!</p>';
      return;
    }
    
    playersList.innerHTML = this.uiComponents.renderPlayerList(players);
    
    // Add fade-in animation to new items
    const newItems = playersList.querySelectorAll('.player-item');
    newItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('fade-in');
      }, index * 100);
    });
  }

  /**
   * Update game control buttons
   */
  updateGameControls() {
    const startGameBtn = document.getElementById('start-game-btn');
    if (!startGameBtn) return;
    
    const playerCount = this.playerManager.getPlayerCount();
    startGameBtn.disabled = playerCount < 2 || playerCount > 8;
  }

  /**
   * Update player count display
   */
  updatePlayerCount() {
    const countDisplay = document.getElementById('player-count');
    if (!countDisplay) return;
    
    const count = this.playerManager.getPlayerCount();
    countDisplay.textContent = `${count} player${count !== 1 ? 's' : ''} ready`;
  }

  /**
   * Show player setup view
   */
  showPlayerSetup() {
    this.currentView = 'player-setup';
    const setupSection = document.getElementById('player-setup');
    if (setupSection) {
      setupSection.classList.remove('hidden');
      setupSection.classList.add('fade-in');
    }
  }

  /**
   * Transition from player setup to game
   */
  async transitionToGame() {
    return new Promise((resolve) => {
      const setupSection = document.getElementById('player-setup');
      
      if (setupSection) {
        setupSection.classList.add('slide-out');
        
        setTimeout(() => {
          setupSection.classList.add('hidden');
          this.currentView = 'game';
          this.gameStarted = true;
          
          // Initialize game view (placeholder for now)
          this.showGameView();
          resolve();
        }, 300);
      } else {
        this.gameStarted = true;
        this.showGameView();
        resolve();
      }
    });
  }

  /**
   * Show game view (placeholder)
   */
  showGameView() {
    const gameSection = document.getElementById('game-view') || this.createGameView();
    gameSection.classList.remove('hidden');
    gameSection.classList.add('fade-in');
    
    console.log('Game started with players:', this.playerManager.getPlayers());
  }

  /**
   * Create game view element (placeholder)
   */
  createGameView() {
    const gameSection = document.createElement('div');
    gameSection.id = 'game-view';
    gameSection.innerHTML = `
      <div class="game-container">
        <h2>Game Started!</h2>
        <p>Players: ${this.playerManager.getPlayers().map(p => p.name).join(', ')}</p>
        <p class="success-message">Game implementation coming soon...</p>
      </div>
    `;
    
    document.querySelector('.container').appendChild(gameSection);
    return gameSection;
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorContainer = this.getOrCreateMessageContainer();
    errorContainer.innerHTML = `<div class="error-message">${message}</div>`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorContainer.innerHTML = '';
    }, 5000);
    
    // Add error class to input if applicable
    const nameInput = document.getElementById('player-name');
    if (nameInput && message.toLowerCase().includes('name')) {
      nameInput.classList.add('error');
    }
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    const messageContainer = this.getOrCreateMessageContainer();
    messageContainer.innerHTML = `<div class="success-message">${message}</div>`;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      messageContainer.innerHTML = '';
    }, 3000);
  }

  /**
   * Get or create message container
   */
  getOrCreateMessageContainer() {
    let container = document.getElementById('message-container');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'message-container';
      
      const form = document.getElementById('player-form');
      if (form && form.parentNode) {
        form.parentNode.insertBefore(container, form.nextSibling);
      }
    }
    
    return container;
  }

  /**
   * Reset the application to initial state
   */
  reset() {
    this.playerManager.clearPlayers();
    this.gameStarted = false;
    this.currentView = 'player-setup';
    
    // Show player setup
    this.showPlayerSetup();
    this.updateUI();
    
    // Clear messages
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
      messageContainer.innerHTML = '';
    }
    
    // Focus on name input
    const nameInput = document.getElementById('player-name');
    if (nameInput) {
      nameInput.value = '';
      nameInput.classList.remove('error');
      nameInput.focus();
    }
  }

  /**
   * Get current application state
   */
  getState() {
    return {
      players: this.playerManager.getPlayers(),
      gameStarted: this.gameStarted,
      currentView: this.currentView
    };
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.skullKingApp = new SkullKingApp();
});

export { SkullKingApp };