/**
 * Player Management System
 * Handles player creation, validation, and storage
 */
export class PlayerManager {
    constructor() {
        this.players = new Map();
        this.eventListeners = new Map();
    }

    /**
     * Add a new player
     * @param {string} name - Player name
     * @returns {Object} Result object with success status and player data or error
     */
    addPlayer(name) {
        try {
            // Validate input
            if (!name || typeof name !== 'string') {
                return { success: false, error: 'Player name is required' };
            }

            const trimmedName = name.trim();
            if (trimmedName.length === 0) {
                return { success: false, error: 'Player name cannot be empty' };
            }

            if (trimmedName.length > 20) {
                return { success: false, error: 'Player name must be 20 characters or less' };
            }

            // Check for duplicate names
            const existingPlayer = Array.from(this.players.values())
                .find(player => player.name.toLowerCase() === trimmedName.toLowerCase());
            
            if (existingPlayer) {
                return { success: false, error: 'Player name already exists' };
            }

            // Create player
            const player = {
                id: this.generatePlayerId(),
                name: trimmedName,
                createdAt: new Date().toISOString()
            };

            this.players.set(player.id, player);
            this.emit('playerAdded', player);

            return { success: true, player };
        } catch (error) {
            console.error('Error adding player:', error);
            return { success: false, error: 'Failed to add player' };
        }
    }

    /**
     * Remove a player
     * @param {string} playerId - Player ID to remove
     * @returns {boolean} Success status
     */
    removePlayer(playerId) {
        try {
            if (!playerId || !this.players.has(playerId)) {
                return false;
            }

            const player = this.players.get(playerId);
            this.players.delete(playerId);
            this.emit('playerRemoved', player);
            return true;
        } catch (error) {
            console.error('Error removing player:', error);
            return false;
        }
    }

    /**
     * Get all players
     * @returns {Array} Array of player objects
     */
    getAllPlayers() {
        return Array.from(this.players.values());
    }

    /**
     * Get player count
     * @returns {number} Number of players
     */
    getPlayerCount() {
        return this.players.size;
    }

    /**
     * Clear all players
     */
    clearAllPlayers() {
        this.players.clear();
        this.emit('playersCleared');
    }

    /**
     * Generate unique player ID
     * @returns {string} Unique player ID
     */
    generatePlayerId() {
        return `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove
     */
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Emit event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }
}