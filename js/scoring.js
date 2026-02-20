/**
 * Scoring utilities for trick validation and bonus calculation
 */

/**
 * Validates trick entries for all players in a round
 * @param {Object} playerTricks - Object mapping playerId to trick count
 * @param {number} handCount - Expected total number of tricks for the hand
 * @returns {Object} - {isValid: boolean, errors: string[]}
 */
function validateTrickEntry(playerTricks, handCount) {
    const errors = [];
    
    if (!playerTricks || typeof playerTricks !== 'object') {
        errors.push('playerTricks must be a valid object');
        return { isValid: false, errors };
    }
    
    if (!Number.isInteger(handCount) || handCount <= 0) {
        errors.push('handCount must be a positive integer');
        return { isValid: false, errors };
    }
    
    const playerIds = Object.keys(playerTricks);
    if (playerIds.length === 0) {
        errors.push('No player tricks provided');
        return { isValid: false, errors };
    }
    
    let totalTricks = 0;
    
    // Validate individual trick counts and sum total
    for (const playerId of playerIds) {
        const tricks = playerTricks[playerId];
        
        if (!Number.isInteger(tricks)) {
            errors.push(`Player ${playerId}: trick count must be an integer`);
            continue;
        }
        
        if (tricks < 0) {
            errors.push(`Player ${playerId}: trick count cannot be negative`);
            continue;
        }
        
        if (tricks > handCount) {
            errors.push(`Player ${playerId}: trick count (${tricks}) cannot exceed hand count (${handCount})`);
            continue;
        }
        
        totalTricks += tricks;
    }
    
    // Validate total tricks equal hand count
    if (totalTricks !== handCount) {
        errors.push(`Total tricks (${totalTricks}) must equal hand count (${handCount})`);
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Calculates bonus points for a player based on their bid and actual tricks
 * @param {Object} player - Player object with bid property
 * @param {number} actualTricks - Number of tricks actually taken
 * @returns {number} - Bonus points earned (0 if bid not met exactly)
 */
function calculateBonusPoints(player, actualTricks) {
    if (!player || typeof player !== 'object') {
        throw new Error('Player must be a valid object');
    }
    
    if (!Number.isInteger(player.bid)) {
        throw new Error('Player bid must be an integer');
    }
    
    if (!Number.isInteger(actualTricks) || actualTricks < 0) {
        throw new Error('actualTricks must be a non-negative integer');
    }
    
    // Bonus points only awarded if bid was met exactly
    if (player.bid === actualTricks) {
        // Base bonus of 10 points plus 2 points per trick bid
        return 10 + (player.bid * 2);
    }
    
    return 0;
}

/**
 * Updates a PlayerRoundScore object with actual tricks and bonus points
 * @param {string} playerId - ID of the player
 * @param {number} actualTricks - Number of tricks actually taken
 * @param {number} bonusEarned - Bonus points earned this round
 * @returns {Object} - Updated PlayerRoundScore object
 */
function updatePlayerRoundScore(playerId, actualTricks, bonusEarned) {
    if (!playerId || typeof playerId !== 'string') {
        throw new Error('playerId must be a valid string');
    }
    
    if (!Number.isInteger(actualTricks) || actualTricks < 0) {
        throw new Error('actualTricks must be a non-negative integer');
    }
    
    if (!Number.isInteger(bonusEarned) || bonusEarned < 0) {
        throw new Error('bonusEarned must be a non-negative integer');
    }
    
    return {
        playerId: playerId,
        actualTricks: actualTricks,
        bonusPoints: bonusEarned,
        roundScore: bonusEarned, // For now, round score equals bonus points
        timestamp: new Date().toISOString()
    };
}

// Export functions for use in main game logic
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateTrickEntry,
        calculateBonusPoints,
        updatePlayerRoundScore
    };
} else {
    // Browser environment
    window.ScoringUtils = {
        validateTrickEntry,
        calculateBonusPoints,
        updatePlayerRoundScore
    };
}