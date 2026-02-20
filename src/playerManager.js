const Player = require('./player');

/**
 * PlayerManager class to handle player collection and validation
 */
class PlayerManager {
  constructor() {
    this.players = [];
    this.minPlayers = 2;
    this.maxPlayers = 8;
  }

  /**
   * Add a player to the game
   * @param {string} name - Player name
   * @returns {Player} The created player
   * @throws {Error} If validation fails
   */
  addPlayer(name) {
    // Validate player count
    if (this.players.length >= this.maxPlayers) {
      throw new Error(`Cannot add more than ${this.maxPlayers} players`);
    }

    // Validate unique name
    if (this.isNameTaken(name)) {
      throw new Error('Player name must be unique');
    }

    // Create and add player
    const player = new Player(name);
    this.players.push(player);
    return player;
  }

  /**
   * Check if a name is already taken
   * @param {string} name - Name to check
   * @returns {boolean} True if name is taken
   */
  isNameTaken(name) {
    if (!name || typeof name !== 'string') {
      return false;
    }
    
    const trimmedName = name.trim().toLowerCase();
    return this.players.some(player => 
      player.name.toLowerCase() === trimmedName
    );
  }

  /**
   * Remove a player by ID
   * @param {string} playerId - Player ID to remove
   * @returns {boolean} True if player was removed
   */
  removePlayer(playerId) {
    const initialLength = this.players.length;
    this.players = this.players.filter(player => player.id !== playerId);
    return this.players.length < initialLength;
  }

  /**
   * Get all players
   * @returns {Player[]} Array of players
   */
  getPlayers() {
    return [...this.players];
  }

  /**
   * Get player by ID
   * @param {string} playerId - Player ID
   * @returns {Player|null} Player or null if not found
   */
  getPlayer(playerId) {
    return this.players.find(player => player.id === playerId) || null;
  }

  /**
   * Get current player count
   * @returns {number} Number of players
   */
  getPlayerCount() {
    return this.players.length;
  }

  /**
   * Validate if game can start
   * @returns {boolean} True if valid player count for game start
   */
  canStartGame() {
    return this.players.length >= this.minPlayers && this.players.length <= this.maxPlayers;
  }

  /**
   * Get validation status
   * @returns {Object} Validation details
   */
  getValidationStatus() {
    const count = this.players.length;
    return {
      playerCount: count,
      minPlayers: this.minPlayers,
      maxPlayers: this.maxPlayers,
      canStartGame: this.canStartGame(),
      needsMorePlayers: count < this.minPlayers,
      tooManyPlayers: count > this.maxPlayers,
      message: this.getValidationMessage()
    };
  }

  /**
   * Get validation message
   * @returns {string} Status message
   */
  getValidationMessage() {
    const count = this.players.length;
    
    if (count < this.minPlayers) {
      const needed = this.minPlayers - count;
      return `Need ${needed} more player${needed > 1 ? 's' : ''} to start (minimum ${this.minPlayers})`;
    }
    
    if (count > this.maxPlayers) {
      return `Too many players (maximum ${this.maxPlayers})`;
    }
    
    return `Ready to start with ${count} players`;
  }

  /**
   * Clear all players
   */
  clearPlayers() {
    this.players = [];
  }

  /**
   * Get players as JSON
   * @returns {Object[]} Array of player objects
   */
  toJSON() {
    return this.players.map(player => player.toJSON());
  }
}

module.exports = PlayerManager;