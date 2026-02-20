/**
 * UI Components for player management
 */

// Global player manager instance
const playerManager = new PlayerManager();

/**
 * Render the player setup form
 * @param {HTMLElement} container - Container element to render into
 */
function renderPlayerSetupForm(container) {
    container.innerHTML = `
        <div class="player-setup">
            <h2>Setup Players</h2>
            <div class="player-form">
                <input type="text" id="player-name-input" placeholder="Enter player name" maxlength="50">
                <button type="button" id="add-player-btn">Add Player</button>
            </div>
            <div id="error-message" class="error-message" style="display: none;"></div>
            <div id="player-count" class="player-count">Players: 0/8</div>
        </div>
    `;

    // Setup event listeners
    setupFormEventListeners();
}

/**
 * Render the player list
 * @param {HTMLElement} container - Container element to render into
 */
function renderPlayerList(container) {
    const players = playerManager.getPlayers();
    
    if (players.length === 0) {
        container.innerHTML = '<div class="no-players">No players added yet</div>';
        return;
    }

    const playerListHTML = players.map(player => `
        <div class="player-item" data-player-id="${player.id}">
            <span class="player-name">${escapeHtml(player.name)}</span>
            <button type="button" class="remove-player-btn" data-player-id="${player.id}">Remove</button>
        </div>
    `).join('');

    container.innerHTML = `<div class="player-list">${playerListHTML}</div>`;

    // Add event listeners for remove buttons
    container.querySelectorAll('.remove-player-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const playerId = parseInt(e.target.dataset.playerId);
            removePlayer(playerId);
        });
    });
}

/**
 * Update the start game button state
 */
function updateStartGameButton() {
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        const canStart = playerManager.canStartGame();
        startBtn.disabled = !canStart;
        startBtn.textContent = canStart ? 'Start Game' : `Need ${playerManager.minPlayers - playerManager.getPlayerCount()} more players`;
    }
}

/**
 * Update player count display
 */
function updatePlayerCount() {
    const countElement = document.getElementById('player-count');
    if (countElement) {
        const count = playerManager.getPlayerCount();
        countElement.textContent = `Players: ${count}/${playerManager.maxPlayers}`;
    }
}

/**
 * Setup event listeners for the form
 */
function setupFormEventListeners() {
    const nameInput = document.getElementById('player-name-input');
    const addBtn = document.getElementById('add-player-btn');

    if (nameInput && addBtn) {
        // Add player button click
        addBtn.addEventListener('click', () => {
            addPlayer(nameInput.value);
        });

        // Enter key on input
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addPlayer(nameInput.value);
            }
        });

        // Clear error message when typing
        nameInput.addEventListener('input', () => {
            hideErrorMessage();
        });
    }
}

/**
 * Add a player with UI updates
 * @param {string} name - Player name
 */
function addPlayer(name) {
    const result = playerManager.addPlayer(name);
    
    if (result.success) {
        // Clear input
        const nameInput = document.getElementById('player-name-input');
        if (nameInput) nameInput.value = '';
        
        // Hide error message
        hideErrorMessage();
        
        // Update UI
        updatePlayerListDisplay();
        updatePlayerCount();
        updateStartGameButton();
    } else {
        // Show error message
        showErrorMessage(result.error);
    }
}

/**
 * Remove a player with UI updates
 * @param {number} playerId - Player ID to remove
 */
function removePlayer(playerId) {
    const removed = playerManager.removePlayer(playerId);
    
    if (removed) {
        // Update UI
        updatePlayerListDisplay();
        updatePlayerCount();
        updateStartGameButton();
        hideErrorMessage();
    }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showErrorMessage(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

/**
 * Hide error message
 */
function hideErrorMessage() {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

/**
 * Update the player list display
 */
function updatePlayerListDisplay() {
    const listContainer = document.getElementById('player-list-container');
    if (listContainer) {
        renderPlayerList(listContainer);
    }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initialize the player management UI
 */
function initializePlayerUI() {
    const setupContainer = document.getElementById('player-setup-container');
    const listContainer = document.getElementById('player-list-container');
    
    if (setupContainer) {
        renderPlayerSetupForm(setupContainer);
    }
    
    if (listContainer) {
        renderPlayerList(listContainer);
    }
    
    updateStartGameButton();
    updatePlayerCount();
}