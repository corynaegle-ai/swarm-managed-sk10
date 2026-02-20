/**
 * UI Components for Player Management
 * Handles DOM manipulation and user interactions
 */
export class UIComponents {
    constructor() {
        this.elements = {};
        this.initializeElements();
    }

    /**
     * Initialize DOM element references with error checking
     */
    initializeElements() {
        const elementIds = [
            'player-setup',
            'player-form',
            'player-name',
            'add-player-btn',
            'error-container',
            'player-list',
            'players-grid',
            'player-count',
            'start-game-btn',
            'game-interface',
            'back-to-setup-btn'
        ];

        elementIds.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element with ID '${id}' not found`);
            }
            this.elements[id] = element;
        });
    }

    /**
     * Safely get element with error checking
     * @param {string} id - Element ID
     * @returns {Element|null} DOM element or null
     */
    getElement(id) {
        if (!this.elements[id]) {
            console.error(`Element '${id}' not found or not initialized`);
            return null;
        }
        return this.elements[id];
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        const errorContainer = this.getElement('error-container');
        if (!errorContainer) return;

        errorContainer.innerHTML = `
            <div class="error-message fade-in">
                ${this.escapeHtml(message)}
            </div>
        `;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.clearError();
        }, 5000);
    }

    /**
     * Show success message
     * @param {string} message - Success message to display
     */
    showSuccess(message) {
        const errorContainer = this.getElement('error-container');
        if (!errorContainer) return;

        errorContainer.innerHTML = `
            <div class="success-message fade-in">
                ${this.escapeHtml(message)}
            </div>
        `;

        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.clearError();
        }, 3000);
    }

    /**
     * Clear error/success messages
     */
    clearError() {
        const errorContainer = this.getElement('error-container');
        if (!errorContainer) return;

        const messageElement = errorContainer.querySelector('.error-message, .success-message');
        if (messageElement) {
            messageElement.classList.add('slide-out');
            setTimeout(() => {
                errorContainer.innerHTML = '';
            }, 300);
        }
    }

    /**
     * Update player list display
     * @param {Array} players - Array of player objects
     */
    updatePlayerList(players) {
        const playersGrid = this.getElement('players-grid');
        const playerCount = this.getElement('player-count');
        const startGameBtn = this.getElement('start-game-btn');
        
        if (!playersGrid || !playerCount || !startGameBtn) return;

        // Update player count
        playerCount.textContent = `Players: ${players.length}`;

        // Update start game button state
        if (players.length >= 2) {
            startGameBtn.disabled = false;
            startGameBtn.classList.remove('disabled');
        } else {
            startGameBtn.disabled = true;
            startGameBtn.classList.add('disabled');
        }

        // Update players grid
        if (players.length === 0) {
            playersGrid.innerHTML = '<div class="no-players">No players added yet. Add at least 2 players to start the game.</div>';
            return;
        }

        playersGrid.innerHTML = players.map(player => `
            <div class="player-item fade-in" data-player-id="${player.id}">
                <div class="player-info">
                    <div class="player-name">${this.escapeHtml(player.name)}</div>
                    <div class="player-id">${player.id}</div>
                </div>
                <div class="player-actions">
                    <button class="btn btn-danger remove-player-btn" data-player-id="${player.id}">
                        Remove
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Clear player name input
     */
    clearPlayerNameInput() {
        const playerNameInput = this.getElement('player-name');
        if (playerNameInput) {
            playerNameInput.value = '';
            playerNameInput.focus();
        }
    }

    /**
     * Show player setup section
     */
    showPlayerSetup() {
        const playerSetup = this.getElement('player-setup');
        const gameInterface = this.getElement('game-interface');
        
        if (playerSetup) {
            playerSetup.classList.remove('hidden', 'slide-out');
            playerSetup.classList.add('fade-in');
        }
        
        if (gameInterface) {
            gameInterface.classList.add('slide-out');
            setTimeout(() => {
                gameInterface.classList.add('hidden');
                gameInterface.classList.remove('slide-out');
            }, 300);
        }
    }

    /**
     * Show game interface
     */
    showGameInterface() {
        const playerSetup = this.getElement('player-setup');
        const playerList = this.getElement('player-list');
        const gameInterface = this.getElement('game-interface');
        
        if (playerSetup) {
            playerSetup.classList.add('slide-out');
            setTimeout(() => {
                playerSetup.classList.add('hidden');
                playerSetup.classList.remove('slide-out');
            }, 300);
        }
        
        if (playerList) {
            playerList.classList.add('slide-out');
            setTimeout(() => {
                playerList.classList.add('hidden');
                playerList.classList.remove('slide-out');
            }, 300);
        }
        
        if (gameInterface) {
            setTimeout(() => {
                gameInterface.classList.remove('hidden');
                gameInterface.classList.add('fade-in');
            }, 300);
        }
    }

    /**
     * Add smooth transition class
     * @param {Element} element - DOM element
     * @param {string} transitionClass - CSS class for transition
     */
    addTransition(element, transitionClass) {
        if (element) {
            element.classList.add(transitionClass);
        }
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
     * Set loading state for button
     * @param {Element} button - Button element
     * @param {boolean} loading - Loading state
     */
    setButtonLoading(button, loading) {
        if (!button) return;

        if (loading) {
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.textContent = 'Loading...';
            button.classList.add('loading');
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || button.textContent;
            button.classList.remove('loading');
        }
    }

    /**
     * Focus on element with error handling
     * @param {string} elementId - Element ID to focus
     */
    focusElement(elementId) {
        const element = this.getElement(elementId);
        if (element && typeof element.focus === 'function') {
            try {
                element.focus();
            } catch (error) {
                console.warn(`Could not focus element ${elementId}:`, error);
            }
        }
    }
}