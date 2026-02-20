/**
 * Trick Entry UI Components
 * Provides user interface for entering actual tricks and bonus points
 */

class TrickEntryUI {
    constructor(container, trickEntryManager) {
        this.container = container;
        this.trickManager = trickEntryManager;
        this.isVisible = false;
    }

    /**
     * Show trick entry interface
     * @param {Object} roundData - Current round data
     */
    show(roundData) {
        this.trickManager.initializeTrickEntry(roundData);
        this.render();
        this.isVisible = true;
    }

    /**
     * Hide trick entry interface
     */
    hide() {
        this.container.innerHTML = '';
        this.isVisible = false;
    }

    /**
     * Render the trick entry interface
     */
    render() {
        const playerScores = this.trickManager.getPlayerScores();
        const handCount = this.trickManager.currentRound.handCount;

        this.container.innerHTML = `
            <div class="trick-entry-panel">
                <h3>Enter Actual Tricks and Bonus Points</h3>
                <div class="round-info">
                    <span>Round ${this.trickManager.currentRound.roundNumber}</span>
                    <span>Hand Count: ${handCount}</span>
                </div>
                
                <div class="player-entries">
                    ${playerScores.map(player => this.renderPlayerEntry(player, handCount)).join('')}
                </div>
                
                <div class="entry-controls">
                    <button id="validate-tricks" class="btn btn-secondary">Validate Tricks</button>
                    <button id="complete-entry" class="btn btn-primary" disabled>Complete Entry</button>
                    <button id="cancel-entry" class="btn btn-outline">Cancel</button>
                </div>
                
                <div id="entry-messages" class="messages"></div>
            </div>
        `;

        this.attachEventListeners();
        this.updateValidationState();
    }

    /**
     * Render individual player entry row
     * @param {Object} player - Player score data
     * @param {number} handCount - Maximum tricks possible
     * @returns {string} HTML string
     */
    renderPlayerEntry(player, handCount) {
        const tricksOptions = Array.from({length: handCount + 1}, (_, i) => 
            `<option value="${i}" ${player.actualTricks === i ? 'selected' : ''}>${i}</option>`
        ).join('');

        return `
            <div class="player-entry" data-player-id="${player.playerId}">
                <div class="player-info">
                    <span class="player-name">${player.playerName}</span>
                    <span class="player-bid">Bid: ${player.bid}</span>
                </div>
                
                <div class="tricks-entry">
                    <label>Actual Tricks:</label>
                    <select class="tricks-select" data-player-id="${player.playerId}">
                        <option value="">Select...</option>
                        ${tricksOptions}
                    </select>
                </div>
                
                <div class="bonus-entry">
                    <label>Bonus Points:</label>
                    <input type="number" 
                           class="bonus-input" 
                           data-player-id="${player.playerId}"
                           value="${player.bonusPoints}"
                           min="0"
                           ${!player.bidMet ? 'disabled title="Only available when bid is met exactly"' : ''} />
                </div>
                
                <div class="bid-status ${player.bidMet ? 'bid-met' : 'bid-not-met'}">
                    ${player.actualTricks !== null ? 
                        (player.bidMet ? '✓ Bid Met' : '✗ Bid Not Met') : 
                        ''}
                </div>
            </div>
        `;
    }

    /**
     * Attach event listeners to UI elements
     */
    attachEventListeners() {
        // Tricks selection
        this.container.querySelectorAll('.tricks-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const playerId = e.target.dataset.playerId;
                const tricks = e.target.value === '' ? null : parseInt(e.target.value);
                
                if (tricks !== null) {
                    try {
                        this.trickManager.setPlayerTricks(playerId, tricks);
                        this.updatePlayerRow(playerId);
                        this.updateValidationState();
                        this.clearMessages();
                    } catch (error) {
                        this.showError(error.message);
                        e.target.value = ''; // Reset invalid selection
                    }
                }
            });
        });

        // Bonus points input
        this.container.querySelectorAll('.bonus-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const playerId = e.target.dataset.playerId;
                const bonus = Math.max(0, parseInt(e.target.value) || 0);
                
                try {
                    this.trickManager.setPlayerBonus(playerId, bonus);
                    e.target.value = bonus; // Ensure display matches stored value
                    this.clearMessages();
                } catch (error) {
                    this.showError(error.message);
                }
            });
        });

        // Control buttons
        document.getElementById('validate-tricks').addEventListener('click', () => {
            this.validateAndShowSummary();
        });

        document.getElementById('complete-entry').addEventListener('click', () => {
            this.completeEntry();
        });

        document.getElementById('cancel-entry').addEventListener('click', () => {
            if (confirm('Are you sure you want to cancel trick entry? All entered data will be lost.')) {
                this.hide();
            }
        });
    }

    /**
     * Update a specific player row after data change
     * @param {string} playerId - Player ID
     */
    updatePlayerRow(playerId) {
        const playerScore = this.trickManager.playerScores.get(playerId);
        const playerRow = this.container.querySelector(`[data-player-id="${playerId}"]`);
        
        // Update bid status
        const statusElement = playerRow.querySelector('.bid-status');
        statusElement.className = `bid-status ${playerScore.bidMet ? 'bid-met' : 'bid-not-met'}`;
        statusElement.textContent = playerScore.actualTricks !== null ? 
            (playerScore.bidMet ? '✓ Bid Met' : '✗ Bid Not Met') : '';
        
        // Update bonus input state
        const bonusInput = playerRow.querySelector('.bonus-input');
        bonusInput.disabled = !playerScore.bidMet;
        bonusInput.title = playerScore.bidMet ? '' : 'Only available when bid is met exactly';
        
        if (!playerScore.bidMet) {
            bonusInput.value = 0;
        }
    }

    /**
     * Update validation state and enable/disable complete button
     */
    updateValidationState() {
        const completeButton = document.getElementById('complete-entry');
        const isComplete = this.trickManager.isEntryComplete();
        
        completeButton.disabled = !isComplete;
        
        if (isComplete) {
            try {
                this.trickManager.validateTotalTricks();
                this.showSuccess('All tricks entered and validated successfully!');
            } catch (error) {
                this.showError(error.message);
                completeButton.disabled = true;
            }
        }
    }

    /**
     * Validate tricks and show summary
     */
    validateAndShowSummary() {
        try {
            if (!this.trickManager.isEntryComplete()) {
                this.showError('Please enter actual tricks for all players.');
                return;
            }

            this.trickManager.validateTotalTricks();
            
            const playerScores = this.trickManager.getPlayerScores();
            const summary = playerScores.map(player => 
                `${player.playerName}: ${player.actualTricks} tricks (bid: ${player.bid}) ${player.bidMet ? '+ ' + player.bonusPoints + ' bonus' : ''}`
            ).join('\n');
            
            this.showInfo(`Validation successful!\n\n${summary}`);
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * Complete the trick entry process
     */
    completeEntry() {
        try {
            const updates = this.trickManager.updatePlayerRoundScores();
            
            // Trigger custom event for game state update
            const event = new CustomEvent('tricksEntered', {
                detail: {
                    roundNumber: this.trickManager.currentRound.roundNumber,
                    playerScores: updates
                }
            });
            
            document.dispatchEvent(event);
            this.showSuccess('Trick entry completed successfully!');
            
            // Hide after short delay
            setTimeout(() => this.hide(), 1500);
        } catch (error) {
            this.showError(error.message);
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        const messagesEl = document.getElementById('entry-messages');
        messagesEl.innerHTML = `<div class="message error">${message}</div>`;
    }

    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccess(message) {
        const messagesEl = document.getElementById('entry-messages');
        messagesEl.innerHTML = `<div class="message success">${message}</div>`;
    }

    /**
     * Show info message
     * @param {string} message - Info message
     */
    showInfo(message) {
        const messagesEl = document.getElementById('entry-messages');
        messagesEl.innerHTML = `<div class="message info">${message.replace(/\n/g, '<br>')}</div>`;
    }

    /**
     * Clear messages
     */
    clearMessages() {
        const messagesEl = document.getElementById('entry-messages');
        if (messagesEl) {
            messagesEl.innerHTML = '';
        }
    }
}

// Export for use in other modules
window.TrickEntryUI = TrickEntryUI;