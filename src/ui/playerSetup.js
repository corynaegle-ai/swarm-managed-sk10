/**
 * UI component for player setup phase
 */
class PlayerSetupUI {
  constructor(gameState) {
    this.gameState = gameState;
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for player management
   */
  setupEventListeners() {
    // Add player form submission
    const addPlayerForm = document.getElementById('add-player-form');
    if (addPlayerForm) {
      addPlayerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddPlayer();
      });
    }

    // Start game button
    const startGameBtn = document.getElementById('start-game-btn');
    if (startGameBtn) {
      startGameBtn.addEventListener('click', () => {
        this.handleStartGame();
      });
    }
  }

  /**
   * Handle adding a new player
   */
  handleAddPlayer() {
    const nameInput = document.getElementById('player-name-input');
    if (!nameInput) return;

    const name = nameInput.value.trim();
    if (!name) {
      this.showError('Please enter a player name');
      return;
    }

    const result = this.gameState.addPlayer(name);
    
    if (result.success) {
      nameInput.value = '';
      this.updatePlayersList();
      this.updateValidationStatus(result.validationStatus);
      this.showSuccess(`Player "${result.player.name}" added successfully`);
    } else {
      this.showError(result.error);
    }
  }

  /**
   * Handle starting the game
   */
  handleStartGame() {
    const result = this.gameState.startGame();
    
    if (result.success) {
      this.showGameStarted();
    } else {
      this.showError(result.error);
    }
  }

  /**
   * Update the players list display
   */
  updatePlayersList() {
    const playersContainer = document.getElementById('players-list');
    if (!playersContainer) return;

    const players = this.gameState.getPlayersForDisplay();
    
    if (players.length === 0) {
      playersContainer.innerHTML = '<p class="no-players">No players added yet</p>';
      return;
    }

    const playersHTML = players.map(player => `
      <div class="player-item" data-player-id="${this.escapeHtml(player.id)}">
        <span class="player-name">${this.escapeHtml(player.name)}</span>
        <span class="player-score">Score: ${player.score}</span>
        <button class="remove-player-btn" data-player-id="${this.escapeHtml(player.id)}">
          Remove
        </button>
      </div>
    `).join('');

    playersContainer.innerHTML = `
      <h3>Players (${players.length}):</h3>
      <div class="players-grid">
        ${playersHTML}
      </div>
    `;

    // Add event listeners to remove buttons
    const removeButtons = playersContainer.querySelectorAll('.remove-player-btn');
    removeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const playerId = e.target.getAttribute('data-player-id');
        this.removePlayer(playerId);
      });
    });
  }

  /**
   * Remove a player
   * @param {string} playerId - Player ID to remove
   */
  removePlayer(playerId) {
    const result = this.gameState.removePlayer(playerId);
    
    if (result.success) {
      this.updatePlayersList();
      this.updateValidationStatus(result.validationStatus);
      this.showSuccess('Player removed successfully');
    } else {
      this.showError(result.error);
    }
  }

  /**
   * Update validation status display
   * @param {Object} status - Validation status
   */
  updateValidationStatus(status) {
    const statusContainer = document.getElementById('validation-status');
    if (!statusContainer) return;

    const canStart = status.canStartGame;
    const statusClass = canStart ? 'status-ready' : 'status-waiting';
    
    statusContainer.innerHTML = `
      <div class="validation-message ${statusClass}">
        <p>${status.message}</p>
        <p class="player-count">Players: ${status.playerCount}/${status.maxPlayers}</p>
      </div>
    `;

    // Update start game button
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
      startBtn.disabled = !canStart;
      startBtn.textContent = canStart ? 'Start Game' : `Need ${status.minPlayers - status.playerCount} More Players`;
    }
  }

  /**
   * Show game started state
   */
  showGameStarted() {
    const setupContainer = document.getElementById('player-setup-container');
    const gameContainer = document.getElementById('game-container');
    
    if (setupContainer) setupContainer.style.display = 'none';
    if (gameContainer) gameContainer.style.display = 'block';
    
    this.showSuccess('Game started! Good luck!');
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    this.showMessage(message, 'error');
  }

  /**
   * Show success message
   * @param {string} message - Success message
   */
  showSuccess(message) {
    this.showMessage(message, 'success');
  }

  /**
   * Show message with type
   * @param {string} message - Message text
   * @param {string} type - Message type (error, success, info)
   */
  showMessage(message, type = 'info') {
    const messagesContainer = document.getElementById('messages');
    if (!messagesContainer) {
      console.log(`${type.toUpperCase()}: ${message}`);
      return;
    }

    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    
    messagesContainer.appendChild(messageEl);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 5000);
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
   * Initialize the UI
   */
  init() {
    this.updatePlayersList();
    this.updateValidationStatus(this.gameState.playerManager.getValidationStatus());
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlayerSetupUI;
}