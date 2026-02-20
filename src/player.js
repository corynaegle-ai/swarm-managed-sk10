/**
 * Player class to represent individual players in the game
 */
class Player {
  constructor(name) {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('Player name is required and must be a non-empty string');
    }
    
    this.name = name.trim();
    this.runningTotal = 0;
    this.id = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add points to the player's running total
   * @param {number} points - Points to add (can be negative)
   */
  addPoints(points) {
    if (typeof points !== 'number' || isNaN(points)) {
      throw new Error('Points must be a valid number');
    }
    this.runningTotal += points;
  }

  /**
   * Get player's current score
   * @returns {number} Current running total
   */
  getScore() {
    return this.runningTotal;
  }

  /**
   * Reset player's score to zero
   */
  resetScore() {
    this.runningTotal = 0;
  }

  /**
   * Get player info as object
   * @returns {Object} Player information
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      runningTotal: this.runningTotal
    };
  }
}

module.exports = Player;