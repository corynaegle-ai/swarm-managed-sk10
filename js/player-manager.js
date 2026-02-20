/**
 * Player class representing a single player
 */
class Player {
    constructor(name) {
        this.id = Date.now() + Math.random(); // Simple unique ID
        this.name = name.trim();
        this.score = 0;
    }
}

/**
 * PlayerManager class to handle player operations
 */
class PlayerManager {
    constructor() {
        this.players = [];
        this.minPlayers = 2;
        this.maxPlayers = 8;
    }

    /**
     * Add a player with validation
     * @param {string} name - Player name
     * @returns {object} - {success: boolean, error?: string, player?: Player}
     */
    addPlayer(name) {
        // Validate name
        const trimmedName = name.trim();
        if (!trimmedName) {
            return { success: false, error: 'Player name cannot be empty' };
        }

        // Check for duplicate names (case insensitive)
        if (this.players.some(player => player.name.toLowerCase() === trimmedName.toLowerCase())) {
            return { success: false, error: 'Player name already exists' };
        }

        // Check max players limit
        if (this.players.length >= this.maxPlayers) {
            return { success: false, error: `Maximum ${this.maxPlayers} players allowed` };
        }

        // Create and add player
        const player = new Player(trimmedName);
        this.players.push(player);
        return { success: true, player };
    }

    /**
     * Remove a player by ID
     * @param {number} playerId - Player ID to remove
     * @returns {boolean} - True if player was removed
     */
    removePlayer(playerId) {
        const initialLength = this.players.length;
        this.players = this.players.filter(player => player.id !== playerId);
        return this.players.length < initialLength;
    }

    /**
     * Get all players
     * @returns {Player[]} - Array of players
     */
    getPlayers() {
        return [...this.players];
    }

    /**
     * Check if minimum players requirement is met
     * @returns {boolean} - True if can start game
     */
    canStartGame() {
        return this.players.length >= this.minPlayers;
    }

    /**
     * Get current player count
     * @returns {number} - Number of players
     */
    getPlayerCount() {
        return this.players.length;
    }

    /**
     * Clear all players
     */
    clearAllPlayers() {
        this.players = [];
    }
}