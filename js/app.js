import { PlayerManager } from './player-manager.js';
import { UIComponents } from './ui-components.js';

/**
 * Main Application Controller
 * Coordinates between player management and game flow
 */
class App {
  constructor() {
    // Animation timing constants - synchronized with CSS
    this.TIMING = {
      BUTTON_LOADING: 400, // matches CSS transition duration
      SMOOTH_TRANSITION: 400, // matches CSS .smooth-transition
      FADE_ANIMATION: 400 // matches CSS .fade-in animation
    };
    
    this.playerManager = new PlayerManager();
    this.ui = new UIComponents();
    this.isInitialized = false;
    
    // Bind methods to maintain context
    this.handlePlayerAdd = this.handlePlayerAdd.bind(this);
    this.handlePlayerRemove = this.handlePlayerRemove.bind(this);
    this.handleGameStart = this.handleGameStart.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      await this.setupEventListeners();
      await this.initializePlayerSetup();
      this.isInitialized = true;
      console.log('App initialized successfully');
    } catch (error) {
      this.showUserError('Failed to initialize application. Please refresh the page.', error);
    }
  }

  /**
   * Show error message to user and log technical details
   */
  showUserError(userMessage, technicalError = null) {
    if (technicalError) {
      console.error('Technical error:', technicalError);
    }
    
    // Show user-friendly error message
    const errorContainer = document.getElementById('error-container') || this.createErrorContainer();
    errorContainer.innerHTML = `
      <div class="error-message">
        ${userMessage}
      </div>
    `;
  }

  /**
   * Create error container if it doesn't exist
   */
  createErrorContainer() {
    const container = document.createElement('div');
    container.id = 'error-container';
    container.className = 'fade-in';
    
    const mainContainer = document.querySelector('.container');
    if (mainContainer) {
      mainContainer.insertBefore(container, mainContainer.firstChild);
    } else {
      document.body.appendChild(container);
    }
    
    return container;
  }

  /**
   * Setup event listeners for the application
   */
  async setupEventListeners() {
    const elements = {
      addPlayerBtn: document.getElementById('add-player-btn'),
      startGameBtn: document.getElementById('start-game-btn'),
      playerForm: document.getElementById('player-form')
    };

    // Check for missing elements and provide user feedback
    const missingElements = Object.entries(elements)
      .filter(([key, element]) => !element)
      .map(([key]) => key);

    if (missingElements.length > 0) {
      throw new Error(`Missing required UI elements: ${missingElements.join(', ')}. Please check your HTML structure.`);
    }

    // Setup event listeners
    elements.addPlayerBtn.addEventListener('click', this.handlePlayerAdd);
    elements.startGameBtn.addEventListener('click', this.handleGameStart);
    elements.playerForm.addEventListener('submit', this.handleFormSubmit);

    // Setup input validation
    const nameInput = document.getElementById('player-name');
    if (nameInput) {
      nameInput.addEventListener('input', this.handleInputValidation.bind(this));
      nameInput.addEventListener('blur', this.handleInputValidation.bind(this));
    }
  }

  /**
   * Handle form submission
   */
  handleFormSubmit(event) {
    event.preventDefault();
    this.handlePlayerAdd();
  }

  /**
   * Handle input validation with visual feedback
   */
  handleInputValidation(event) {
    const input = event.target;
    const value = input.value.trim();
    
    // Remove existing error classes
    input.classList.remove('error');
    
    // Clear any existing error messages for this input
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    // Validate on blur or if there's content
    if (event.type === 'blur' || value) {
      const validation = this.playerManager.validatePlayerName(value);
      if (!validation.isValid) {
        input.classList.add('error');
        this.showInputError(input, validation.error);
      }
    }
  }

  /**
   * Show error message for specific input
   */
  showInputError(input, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.marginTop = '5px';
    
    input.parentNode.appendChild(errorDiv);
  }

  /**
   * Initialize the player setup interface
   */
  async initializePlayerSetup() {
    await this.updatePlayerList();
    await this.updateGameControls();
    
    // Show player setup section with animation
    const setupSection = document.querySelector('.player-setup');
    if (setupSection) {
      setupSection.classList.add('fade-in');
    }
  }

  /**
   * Handle adding a player with proper loading state
   */
  async handlePlayerAdd() {
    const nameInput = document.getElementById('player-name');
    const addBtn = document.getElementById('add-player-btn');
    
    if (!nameInput || !addBtn) {
      this.showUserError('Player form elements not found. Please refresh the page.');
      return;
    }

    const name = nameInput.value.trim();
    
    // Clear any existing errors
    this.clearErrors();
    nameInput.classList.remove('error');
    
    // Show loading state - properly prevent multiple clicks
    addBtn.classList.add('loading');
    addBtn.disabled = true;
    
    try {
      const result = await this.playerManager.addPlayer(name);
      
      if (result.success) {
        nameInput.value = '';
        nameInput.classList.remove('error');
        await this.updatePlayerList();
        await this.updateGameControls();
        
        // Show success feedback
        this.showSuccessMessage(`Player "${result.player.name}" added successfully!`);
        
        // Focus back to input for better UX
        nameInput.focus();
      } else {
        nameInput.classList.add('error');
        this.showInputError(nameInput, result.error);
      }
    } catch (error) {
      this.showUserError('Failed to add player. Please try again.', error);
      nameInput.classList.add('error');
    } finally {
      // Remove loading state after synchronized delay
      setTimeout(() => {
        addBtn.classList.remove('loading');
        addBtn.disabled = false;
      }, this.TIMING.BUTTON_LOADING);
    }
  }

  /**
   * Show success message to user
   */
  showSuccessMessage(message) {
    const container = document.getElementById('success-container') || this.createSuccessContainer();
    container.innerHTML = `
      <div class="success-message">
        ${message}
      </div>
    `;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      container.innerHTML = '';
    }, 3000);
  }

  /**
   * Create success message container
   */
  createSuccessContainer() {
    const container = document.createElement('div');
    container.id = 'success-container';
    container.className = 'fade-in';
    
    const playerSetup = document.querySelector('.player-setup');
    if (playerSetup) {
      playerSetup.appendChild(container);
    }
    
    return container;
  }

  /**
   * Clear all error messages
   */
  clearErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => error.remove());
  }

  /**
   * Handle removing a player
   */
  async handlePlayerRemove(playerId) {
    try {
      const result = await this.playerManager.removePlayer(playerId);
      
      if (result.success) {
        await this.updatePlayerList();
        await this.updateGameControls();
        this.showSuccessMessage('Player removed successfully!');
      } else {
        this.showUserError(`Failed to remove player: ${result.error}`);
      }
    } catch (error) {
      this.showUserError('Failed to remove player. Please try again.', error);
    }
  }

  /**
   * Update the player list display
   */
  async updatePlayerList() {
    const playerListContainer = document.getElementById('player-list');
    if (!playerListContainer) {
      console.warn('Player list container not found');
      return;
    }

    const players = this.playerManager.getPlayers();
    const html = await this.ui.renderPlayerList(players, this.handlePlayerRemove);
    
    playerListContainer.innerHTML = html;
    playerListContainer.classList.add('fade-in');
  }

  /**
   * Update game control states
   */
  async updateGameControls() {
    const startBtn = document.getElementById('start-game-btn');
    const playerCount = document.getElementById('player-count');
    
    if (!startBtn) {
      console.warn('Start game button not found');
      return;
    }

    const players = this.playerManager.getPlayers();
    const canStart = players.length >= 2;
    
    // Update button state
    startBtn.disabled = !canStart;
    if (canStart) {
      startBtn.classList.remove('disabled');
    } else {
      startBtn.classList.add('disabled');
    }
    
    // Update player count display
    if (playerCount) {
      playerCount.textContent = `${players.length} player${players.length !== 1 ? 's' : ''} ready`;
    }
  }

  /**
   * Handle game start with smooth transition
   */
  async handleGameStart() {
    const startBtn = document.getElementById('start-game-btn');
    
    if (!startBtn || startBtn.disabled) {
      return;
    }

    const players = this.playerManager.getPlayers();
    if (players.length < 2) {
      this.showUserError('At least 2 players are required to start the game.');
      return;
    }

    // Show loading state
    startBtn.classList.add('loading');
    startBtn.disabled = true;

    try {
      // Smooth transition from player setup to game
      await this.transitionToGame();
      
      // Here you would initialize the actual game
      console.log('Starting game with players:', players);
      
      // Example: Dispatch custom event for game initialization
      const gameStartEvent = new CustomEvent('gameStart', {
        detail: { players }
      });
      document.dispatchEvent(gameStartEvent);
      
    } catch (error) {
      this.showUserError('Failed to start game. Please try again.', error);
    } finally {
      startBtn.classList.remove('loading');
      startBtn.disabled = false;
    }
  }

  /**
   * Smooth transition from player setup to game interface
   */
  async transitionToGame() {
    const setupSection = document.querySelector('.player-setup');
    const listSection = document.querySelector('.player-list');
    
    if (setupSection && listSection) {
      // Add exit animation classes
      setupSection.classList.add('section-exit');
      listSection.classList.add('section-exit');
      
      // Wait for exit animation to complete (synchronized with CSS timing)
      await new Promise(resolve => {
        setTimeout(() => {
          setupSection.classList.add('section-exit-active');
          listSection.classList.add('section-exit-active');
          resolve();
        }, this.TIMING.SMOOTH_TRANSITION);
      });
      
      // Hide sections after transition
      setTimeout(() => {
        setupSection.classList.add('hidden');
        listSection.classList.add('hidden');
      }, this.TIMING.SMOOTH_TRANSITION);
    }
  }

  /**
   * Get current application state
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      players: this.playerManager.getPlayers(),
      canStartGame: this.playerManager.getPlayers().length >= 2
    };
  }

  /**
   * Reset the application to initial state
   */
  async reset() {
    this.playerManager.clearPlayers();
    await this.updatePlayerList();
    await this.updateGameControls();
    this.clearErrors();
    
    // Clear input
    const nameInput = document.getElementById('player-name');
    if (nameInput) {
      nameInput.value = '';
      nameInput.classList.remove('error');
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const app = new App();
    await app.init();
    
    // Make app globally available for testing and debugging
    window.app = app;
  } catch (error) {
    console.error('Failed to initialize app:', error);
    document.body.innerHTML = `
      <div class="container">
        <div class="error-message">
          Failed to initialize application. Please refresh the page.
        </div>
      </div>
    `;
  }
});

// Export for testing and module usage
export { App };
export default App;