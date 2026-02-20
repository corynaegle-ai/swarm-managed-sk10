export class PlayerManager {
    constructor() {
        this.players = [];
        this.nextId = 1;
    }
    
    addPlayer(name) {
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            throw new Error('Player name is required and must be a non-empty string');
        }
        
        const trimmedName = name.trim();
        
        // Check for duplicate names
        if (this.players.some(player => player.name.toLowerCase() === trimmedName.toLowerCase())) {
            throw new Error('A player with this name already exists');
        }
        
        const player = {
            id: `player-${this.nextId++}`,
            name: trimmedName,
            addedAt: new Date().toISOString()
        };
        
        this.players.push(player);
        return player;
    }
    
    removePlayer(playerId) {
        const index = this.players.findIndex(player => player.id === playerId);
        if (index === -1) {
            throw new Error('Player not found');
        }
        
        const removedPlayer = this.players.splice(index, 1)[0];
        return removedPlayer;
    }
    
    getPlayers() {
        return [...this.players];
    }
    
    getPlayerCount() {
        return this.players.length;
    }
    
    clear() {
        this.players = [];
        this.nextId = 1;
    }
    
    canStartGame() {
        return this.players.length >= 2;
    }
}