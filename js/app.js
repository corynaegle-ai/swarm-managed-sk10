import { PlayerManager } from './playermanager.js';
import { UIComponents } from './uicomponents.js';

class App {
    constructor() {
        this.playerManager = new PlayerManager();
        this.uiComponents = new UIComponents();
        this.elements = {};
        this.currentSection = 'player-setup';
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.updatePlayerList();
        this.updateGameControls();
    }
    
    cacheElements() {
        const elementIds = [
            'player-form',
            'player-name',
            'add-player-btn',
            'error-container',
            'players-container',
            'players-grid',
            'no-players',
            'player-count',
            'start-game-btn',
            'player-setup-section',
            'player-list-section',
            'game-interface-section',
            'back-to-setup-btn'
        ];
        
        elementIds.forEach(id => {
            this.elements[id] = document.getElementById(id);
            if (!this.elements[id]) {
                console.error(`Element with id '${id}' not found`);
            }
        });
    }
    
    bindEvents() {
        // Player form submission
        if (this.elements['player-form']) {
            this.elements['player-form'].addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddPlayer();
            });
        }
        
        // Start game button
        if (this.elements['start-game-btn']) {
            this.elements['start-game-btn'].addEventListener('click', () => {
                this.handleStartGame();
            });
        }
        
        // Back to setup button
        if (this.elements['back-to-setup-btn']) {
            this.elements['back-to-setup-btn'].addEventListener('click', () => {
                this.handleBackToSetup();
            });
        }
        
        // Player name input - clear errors on input
        if (this.elements['player-name']) {
            this.elements['player-name'].addEventListener('input', () => {
                this.clearInputError();
            });
        }
    }
    
    handleAddPlayer() {
        const nameInput = this.elements['player-name'];
        const errorContainer = this.elements['error-container'];
        const addButton = this.elements['add-player-btn'];
        
        if (!nameInput || !errorContainer || !addButton) {
            console.error('Required elements not found for adding player');
            return;
        }
        
        const playerName = nameInput.value.trim();
        
        if (!playerName) {
            this.showInputError('Please enter a player name');
            return;
        }
        
        // Show loading state
        this.uiComponents.setButtonLoading(addButton, true);
        
        try {
            const player = this.playerManager.addPlayer(playerName);
            
            // Clear form
            nameInput.value = '';
            this.clearInputError();
            
            // Show success
            this.uiComponents.showSuccess(errorContainer, `Player "${player.name}" added successfully!`);
            
            // Update UI
            this.updatePlayerList();
            this.updateGameControls();
            
        } catch (error) {
            this.showInputError(error.message);
        } finally {
            // Remove loading state
            setTimeout(() => {
                this.uiComponents.setButtonLoading(addButton, false);
            }, 300);
        }
    }
    
    handleRemovePlayer(playerId) {
        const errorContainer = this.elements['error-container'];
        
        try {
            const removedPlayer = this.playerManager.removePlayer(playerId);
            
            if (errorContainer) {
                this.uiComponents.showSuccess(errorContainer, `Player "${removedPlayer.name}" removed`);
            }
            
            this.updatePlayerList();
            this.updateGameControls();
            
        } catch (error) {
            if (errorContainer) {
                this.uiComponents.showError(errorContainer, error.message);
            }
        }
    }
    
    handleStartGame() {
        if (!this.playerManager.canStartGame()) {
            const errorContainer = this.elements['error-container'];
            if (errorContainer) {
                this.uiComponents.showError(errorContainer, 'At least 2 players are required to start the game');
            }
            return;
        }
        
        // Smooth transition to game interface
        const currentSection = this.elements['player-setup-section'];
        const gameSection = this.elements['game-interface-section'];
        
        if (currentSection && gameSection) {
            this.currentSection = 'game';
            this.uiComponents.smoothTransition(currentSection, gameSection, () => {
                console.log('Game started with players:', this.playerManager.getPlayers());
            });
        }
    }
    
    handleBackToSetup() {
        const currentSection = this.elements['game-interface-section'];
        const setupSection = this.elements['player-setup-section'];
        
        if (currentSection && setupSection) {
            this.currentSection = 'player-setup';
            this.uiComponents.smoothTransition(currentSection, setupSection, () => {
                console.log('Back to player setup');
            });
        }
    }
    
    updatePlayerList() {
        const playersGrid = this.elements['players-grid'];
        const noPlayersDiv = this.elements['no-players'];
        const playerCountSpan = this.elements['player-count'];
        
        if (!playersGrid || !noPlayersDiv || !playerCountSpan) {
            console.error('Player list elements not found');
            return;
        }
        
        const players = this.playerManager.getPlayers();
        const playerCount = players.length;
        
        // Update player count
        playerCountSpan.textContent = `${playerCount} player${playerCount !== 1 ? 's' : ''}`;
        
        // Clear existing players
        playersGrid.innerHTML = '';
        
        if (playerCount === 0) {
            noPlayersDiv.classList.remove('hidden');
            playersGrid.classList.add('hidden');
        } else {
            noPlayersDiv.classList.add('hidden');
            playersGrid.classList.remove('hidden');
            
            // Add player items
            players.forEach(player => {
                const playerItem = this.uiComponents.createPlayerItem(player, (playerId) => {
                    this.handleRemovePlayer(playerId);
                });
                playersGrid.appendChild(playerItem);
            });
        }
    }
    
    updateGameControls() {
        const startButton = this.elements['start-game-btn'];
        
        if (!startButton) {
            console.error('Start game button not found');
            return;
        }
        
        const canStart = this.playerManager.canStartGame();
        const playerCount = this.playerManager.getPlayerCount();
        
        this.uiComponents.updateButtonState(
            startButton,
            canStart,
            canStart ? `Start Game (${playerCount} players)` : `Need ${2 - playerCount} more player${2 - playerCount !== 1 ? 's' : ''}`
        );
    }
    
    showInputError(message) {
        const nameInput = this.elements['player-name'];
        const errorContainer = this.elements['error-container'];
        
        if (nameInput) {
            nameInput.classList.add('error');
        }
        
        if (errorContainer) {
            this.uiComponents.showError(errorContainer, message);
        }
    }
    
    clearInputError() {
        const nameInput = this.elements['player-name'];
        
        if (nameInput) {
            nameInput.classList.remove('error');
        }
    }
    
    showPlayerSetup() {
        const setupSection = this.elements['player-setup-section'];
        const gameSection = this.elements['game-interface-section'];
        
        if (setupSection && gameSection) {
            setupSection.classList.remove('hidden');
            gameSection.classList.add('hidden');
            this.currentSection = 'player-setup';
        }
    }
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new App();
    });
} else {
    new App();
}