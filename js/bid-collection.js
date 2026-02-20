/**
 * Bid Collection Module
 * Handles the bid collection phase of the game
 */

let currentPlayers = [];
let currentHandCount = 0;
let collectedBids = {};

/**
 * Shows the bid collection UI for all players
 * @param {Array} players - Array of player objects
 * @param {number} handCount - Current hand count (maximum bid allowed)
 */
function showBidCollection(players, handCount) {
    currentPlayers = players;
    currentHandCount = handCount;
    collectedBids = {};
    
    // Clear any existing bid collection UI
    const existingContainer = document.getElementById('bid-collection-container');
    if (existingContainer) {
        existingContainer.remove();
    }
    
    // Create main container
    const container = document.createElement('div');
    container.id = 'bid-collection-container';
    container.className = 'bid-collection-container';
    
    // Add title
    const title = document.createElement('h2');
    title.textContent = `Enter Bids (0 to ${handCount})`;
    container.appendChild(title);
    
    // Create bid inputs for each player
    const playersContainer = document.createElement('div');
    playersContainer.className = 'players-bid-container';
    
    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-bid-section';
        
        const label = document.createElement('label');
        label.textContent = `${player.name}:`;
        label.className = 'player-bid-label';
        
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.max = handCount.toString();
        input.id = `bid-input-${player.id}`;
        input.className = 'bid-input';
        input.placeholder = '0';
        
        // Add real-time validation
        input.addEventListener('input', () => validateBid(player.id, input.value));
        input.addEventListener('blur', () => validateBid(player.id, input.value));
        
        const errorDiv = document.createElement('div');
        errorDiv.id = `bid-error-${player.id}`;
        errorDiv.className = 'bid-error';
        
        playerDiv.appendChild(label);
        playerDiv.appendChild(input);
        playerDiv.appendChild(errorDiv);
        
        playersContainer.appendChild(playerDiv);
    });
    
    container.appendChild(playersContainer);
    
    // Add confirm button
    const confirmButton = document.createElement('button');
    confirmButton.id = 'confirm-bids-button';
    confirmButton.textContent = 'Confirm All Bids';
    confirmButton.className = 'confirm-bids-button';
    confirmButton.disabled = true;
    confirmButton.addEventListener('click', confirmAllBids);
    
    container.appendChild(confirmButton);
    
    // Add to page
    document.body.appendChild(container);
    
    // Focus first input
    if (players.length > 0) {
        document.getElementById(`bid-input-${players[0].id}`).focus();
    }
}

/**
 * Validates a single player's bid
 * @param {string} playerId - Player ID
 * @param {string} bidValue - Bid value as string
 * @returns {boolean} - Whether the bid is valid
 */
function validateBid(playerId, bidValue) {
    const errorDiv = document.getElementById(`bid-error-${playerId}`);
    const input = document.getElementById(`bid-input-${playerId}`);
    
    // Clear previous error
    errorDiv.textContent = '';
    input.classList.remove('invalid');
    
    // Check if empty
    if (bidValue === '' || bidValue === null || bidValue === undefined) {
        delete collectedBids[playerId];
        updateConfirmButton();
        return false;
    }
    
    const bid = parseInt(bidValue, 10);
    
    // Check if valid number
    if (isNaN(bid)) {
        errorDiv.textContent = 'Please enter a valid number';
        input.classList.add('invalid');
        delete collectedBids[playerId];
        updateConfirmButton();
        return false;
    }
    
    // Check range
    if (bid < 0 || bid > currentHandCount) {
        errorDiv.textContent = `Bid must be between 0 and ${currentHandCount}`;
        input.classList.add('invalid');
        delete collectedBids[playerId];
        updateConfirmButton();
        return false;
    }
    
    // Valid bid
    collectedBids[playerId] = bid;
    updateConfirmButton();
    return true;
}

/**
 * Updates the confirm button state based on whether all bids are valid
 */
function updateConfirmButton() {
    const confirmButton = document.getElementById('confirm-bids-button');
    if (!confirmButton) return;
    
    const allBidsValid = currentPlayers.every(player => {
        return collectedBids.hasOwnProperty(player.id) && 
               typeof collectedBids[player.id] === 'number';
    });
    
    confirmButton.disabled = !allBidsValid;
}

/**
 * Shows confirmation dialog with all collected bids
 * @returns {Object} - Object containing all player bids
 */
function confirmAllBids() {
    // Validate all bids one more time
    const allValid = currentPlayers.every(player => {
        const input = document.getElementById(`bid-input-${player.id}`);
        return validateBid(player.id, input.value);
    });
    
    if (!allValid) {
        alert('Please ensure all bids are valid before confirming.');
        return null;
    }
    
    // Create confirmation modal
    const modal = document.createElement('div');
    modal.className = 'bid-confirmation-modal';
    modal.id = 'bid-confirmation-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'bid-confirmation-content';
    
    const title = document.createElement('h3');
    title.textContent = 'Confirm All Bids';
    modalContent.appendChild(title);
    
    // Show all bids
    const bidsList = document.createElement('div');
    bidsList.className = 'bids-summary';
    
    currentPlayers.forEach(player => {
        const bidItem = document.createElement('div');
        bidItem.className = 'bid-summary-item';
        bidItem.textContent = `${player.name}: ${collectedBids[player.id]}`;
        bidsList.appendChild(bidItem);
    });
    
    modalContent.appendChild(bidsList);
    
    // Add buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'bid-confirmation-buttons';
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.className = 'cancel-button';
    cancelButton.addEventListener('click', () => {
        modal.remove();
    });
    
    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirm';
    confirmButton.className = 'confirm-button';
    confirmButton.addEventListener('click', () => {
        modal.remove();
        // Dispatch custom event with bid data
        const event = new CustomEvent('bidsConfirmed', {
            detail: { bids: { ...collectedBids } }
        });
        document.dispatchEvent(event);
    });
    
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    modalContent.appendChild(buttonContainer);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    return { ...collectedBids };
}

/**
 * Gets the currently collected bids
 * @returns {Object} - Object containing player IDs as keys and bids as values
 */
function getCurrentBids() {
    return { ...collectedBids };
}

/**
 * Clears the bid collection UI
 */
function clearBidCollection() {
    const container = document.getElementById('bid-collection-container');
    if (container) {
        container.remove();
    }
    
    const modal = document.getElementById('bid-confirmation-modal');
    if (modal) {
        modal.remove();
    }
    
    collectedBids = {};
    currentPlayers = [];
    currentHandCount = 0;
}

// Export functions for use in main game flow
export {
    showBidCollection,
    confirmAllBids,
    getCurrentBids,
    clearBidCollection,
    validateBid
};