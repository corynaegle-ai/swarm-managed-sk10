/**
 * Tests for bid-collection.js
 */

import { showBidCollection, confirmAllBids, getCurrentBids, clearBidCollection, validateBid } from '../js/bid-collection.js';

describe('Bid Collection', () => {
    let mockPlayers;
    
    beforeEach(() => {
        document.body.innerHTML = '';
        mockPlayers = [
            { id: 'player1', name: 'Alice' },
            { id: 'player2', name: 'Bob' },
            { id: 'player3', name: 'Charlie' }
        ];
    });
    
    afterEach(() => {
        clearBidCollection();
    });
    
    describe('showBidCollection', () => {
        test('renders bid input UI for all players', () => {
            showBidCollection(mockPlayers, 5);
            
            const container = document.getElementById('bid-collection-container');
            expect(container).toBeTruthy();
            
            // Check title
            const title = container.querySelector('h2');
            expect(title.textContent).toBe('Enter Bids (0 to 5)');
            
            // Check player inputs
            mockPlayers.forEach(player => {
                const input = document.getElementById(`bid-input-${player.id}`);
                expect(input).toBeTruthy();
                expect(input.min).toBe('0');
                expect(input.max).toBe('5');
                
                const label = container.querySelector(`label`);
                expect(label).toBeTruthy();
            });
            
            // Check confirm button exists and is disabled
            const confirmButton = document.getElementById('confirm-bids-button');
            expect(confirmButton).toBeTruthy();
            expect(confirmButton.disabled).toBe(true);
        });
        
        test('focuses first player input', () => {
            showBidCollection(mockPlayers, 3);
            const firstInput = document.getElementById(`bid-input-${mockPlayers[0].id}`);
            expect(document.activeElement).toBe(firstInput);
        });
        
        test('clears existing UI before creating new one', () => {
            showBidCollection(mockPlayers, 3);
            const firstContainer = document.getElementById('bid-collection-container');
            
            showBidCollection(mockPlayers, 4);
            const containers = document.querySelectorAll('#bid-collection-container');
            expect(containers.length).toBe(1);
            expect(containers[0]).not.toBe(firstContainer);
        });
    });
    
    describe('validateBid', () => {
        beforeEach(() => {
            showBidCollection(mockPlayers, 5);
        });
        
        test('validates bid is between 0 and hand count', () => {
            expect(validateBid('player1', '0')).toBe(true);
            expect(validateBid('player1', '5')).toBe(true);
            expect(validateBid('player1', '3')).toBe(true);
            
            expect(validateBid('player1', '-1')).toBe(false);
            expect(validateBid('player1', '6')).toBe(false);
        });
        
        test('shows error for invalid bids', () => {
            validateBid('player1', '10');
            const errorDiv = document.getElementById('bid-error-player1');
            expect(errorDiv.textContent).toBe('Bid must be between 0 and 5');
            
            const input = document.getElementById('bid-input-player1');
            expect(input.classList.contains('invalid')).toBe(true);
        });
        
        test('clears error for valid bids', () => {
            // First set invalid
            validateBid('player1', '10');
            const errorDiv = document.getElementById('bid-error-player1');
            const input = document.getElementById('bid-input-player1');
            expect(errorDiv.textContent).toBeTruthy();
            expect(input.classList.contains('invalid')).toBe(true);
            
            // Then set valid
            validateBid('player1', '3');
            expect(errorDiv.textContent).toBe('');
            expect(input.classList.contains('invalid')).toBe(false);
        });
        
        test('handles non-numeric input', () => {
            expect(validateBid('player1', 'abc')).toBe(false);
            const errorDiv = document.getElementById('bid-error-player1');
            expect(errorDiv.textContent).toBe('Please enter a valid number');
        });
        
        test('handles empty input', () => {
            expect(validateBid('player1', '')).toBe(false);
            const errorDiv = document.getElementById('bid-error-player1');
            expect(errorDiv.textContent).toBe('');
        });
    });
    
    describe('confirmAllBids', () => {
        beforeEach(() => {
            showBidCollection(mockPlayers, 5);
        });
        
        test('prevents proceeding until all players have valid bids', () => {
            const confirmButton = document.getElementById('confirm-bids-button');
            expect(confirmButton.disabled).toBe(true);
            
            // Set valid bids for all players
            validateBid('player1', '2');
            validateBid('player2', '3');
            expect(confirmButton.disabled).toBe(true); // Still missing player3
            
            validateBid('player3', '1');
            expect(confirmButton.disabled).toBe(false); // Now all have bids
        });
        
        test('shows summary of all player bids', () => {
            // Set up valid bids
            validateBid('player1', '2');
            validateBid('player2', '3');
            validateBid('player3', '1');
            
            confirmAllBids();
            
            const modal = document.getElementById('bid-confirmation-modal');
            expect(modal).toBeTruthy();
            
            const summaryItems = modal.querySelectorAll('.bid-summary-item');
            expect(summaryItems.length).toBe(3);
            expect(summaryItems[0].textContent).toBe('Alice: 2');
            expect(summaryItems[1].textContent).toBe('Bob: 3');
            expect(summaryItems[2].textContent).toBe('Charlie: 1');
        });
        
        test('dispatches bidsConfirmed event when confirmed', (done) => {
            // Set up valid bids
            validateBid('player1', '2');
            validateBid('player2', '3');
            validateBid('player3', '1');
            
            document.addEventListener('bidsConfirmed', (event) => {
                expect(event.detail.bids).toEqual({
                    'player1': 2,
                    'player2': 3,
                    'player3': 1
                });
                done();
            });
            
            confirmAllBids();
            const modal = document.getElementById('bid-confirmation-modal');
            const confirmButton = modal.querySelector('.confirm-button');
            confirmButton.click();
        });
        
        test('allows canceling confirmation', () => {
            // Set up valid bids
            validateBid('player1', '2');
            validateBid('player2', '3');
            validateBid('player3', '1');
            
            confirmAllBids();
            const modal = document.getElementById('bid-confirmation-modal');
            const cancelButton = modal.querySelector('.cancel-button');
            cancelButton.click();
            
            expect(document.getElementById('bid-confirmation-modal')).toBeFalsy();
        });
    });
    
    describe('getCurrentBids', () => {
        test('returns current bid state', () => {
            showBidCollection(mockPlayers, 5);
            
            validateBid('player1', '2');
            validateBid('player2', '3');
            
            const bids = getCurrentBids();
            expect(bids).toEqual({
                'player1': 2,
                'player2': 3
            });
        });
    });
    
    describe('clearBidCollection', () => {
        test('removes UI elements and resets state', () => {
            showBidCollection(mockPlayers, 5);
            validateBid('player1', '2');
            
            clearBidCollection();
            
            expect(document.getElementById('bid-collection-container')).toBeFalsy();
            expect(getCurrentBids()).toEqual({});
        });
    });
});