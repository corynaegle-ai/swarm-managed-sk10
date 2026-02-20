const PlayerManager = require('./playerManager');

/**
 * GameState class to manage overall game state
 */
class GameState {
  constructor() {
    this.playerManager = new PlayerManager();
    this.gameStarted = false;
    this.currentRound = 0;
  }

  /**
   * Add player to the game
   * @param {string} name - Player name
   * @returns {Object} Result with success status and data
   */
  addPlayer(name) {
    try {
      if (this.gameStarted) {
        return {
          success: false,
          error: 'Cannot add players after game has started'
        };
      }

      const player = this.playerManager.addPlayer(name);
      return {
        success: true,
        player: player.toJSON(),
        validationStatus: this.playerManager.getValidationStatus()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Remove player from the game
   * @param {string} playerId - Player ID
   * @returns {Object} Result with success status
   */
  removePlayer(playerId) {
    if (this.gameStarted) {
      return {
        success: false,
        error: 'Cannot remove players after game has started'
      };
    }

    const removed = this.playerManager.removePlayer(playerId);
    return {
      success: removed,
      validationStatus: this.playerManager.getValidationStatus()
    };
  }

  /**
   * Start the game
   * @returns {Object} Result with success status
   */
  startGame() {
    if (this.gameStarted) {
      return {
        success: false,
        error: 'Game has already started'
      };
    }

    if (!this.playerManager.canStartGame()) {
      return {
        success: false,
        error: this.playerManager.getValidationMessage()
      };
    }

    this.gameStarted = true;
    this.currentRound = 1;
    
    return {
      success: true,
      message: 'Game started successfully',
      players: this.playerManager.toJSON()
    };
  }

  /**
   * Get current game state
   * @returns {Object} Current state
   */
  getState() {
    return {
      gameStarted: this.gameStarted,
      currentRound: this.currentRound,
      players: this.playerManager.toJSON(),
      validationStatus: this.playerManager.getValidationStatus()
    };
  }

  /**
   * Reset the game
   */
  reset() {
    this.playerManager.clearPlayers();
    this.gameStarted = false;
    this.currentRound = 0;
  }

  /**
   * Get players list for display
   * @returns {Object[]} Array of player display objects
   */
  getPlayersForDisplay() {
    return this.playerManager.getPlayers().map((player, index) => ({
      id: player.id,
      name: player.name,
      score: player.runningTotal,
      position: index + 1
    }));
  }
}

module.exports = GameState;