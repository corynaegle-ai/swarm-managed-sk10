/**
 * Calculate the base score for a round based on bid and actual tricks
 * @param {number} bid - The number of tricks bid by the player
 * @param {number} actualTricks - The actual number of tricks won
 * @param {number} handCount - The current hand/round number
 * @returns {number} The calculated score for the round
 */
export function calculateRoundScore(bid, actualTricks, handCount) {
    // Input validation
    if (typeof bid !== 'number' || typeof actualTricks !== 'number' || typeof handCount !== 'number') {
        throw new Error('All parameters must be numbers');
    }
    
    if (bid < 0 || actualTricks < 0 || handCount < 1) {
        throw new Error('Invalid parameter values: bid and actualTricks must be >= 0, handCount must be >= 1');
    }
    
    if (!Number.isInteger(bid) || !Number.isInteger(actualTricks) || !Number.isInteger(handCount)) {
        throw new Error('All parameters must be integers');
    }
    
    // Zero bid scoring
    if (bid === 0) {
        if (actualTricks === 0) {
            // Zero bid correct: +10 × hand count
            return 10 * handCount;
        } else {
            // Zero bid incorrect: -10 × hand count
            return -10 * handCount;
        }
    }
    
    // Non-zero bid scoring
    if (bid === actualTricks) {
        // Correct bid 1+: +20 per trick
        return 20 * actualTricks;
    } else {
        // Incorrect bid 1+: -10 per trick difference
        const difference = Math.abs(bid - actualTricks);
        return -10 * difference;
    }
}

/**
 * Calculate bonus points for special cards/combinations
 * Bonus points are only awarded when the bid was correct
 * @param {Array} cards - Array of card objects played during the round
 * @param {number} bid - The number of tricks bid by the player
 * @param {number} actualTricks - The actual number of tricks won
 * @returns {number} The bonus points earned (0 if bid was incorrect)
 */
export function calculateBonusPoints(cards, bid, actualTricks) {
    // Input validation
    if (!Array.isArray(cards)) {
        throw new Error('cards must be an array');
    }
    
    if (typeof bid !== 'number' || typeof actualTricks !== 'number') {
        throw new Error('bid and actualTricks must be numbers');
    }
    
    // Bonus points only awarded when bid was correct
    if (bid !== actualTricks) {
        return 0;
    }
    
    let bonusPoints = 0;
    
    // Calculate bonuses based on cards played
    // This is a placeholder for future bonus logic implementation
    // Common Skull King bonuses include:
    // - Capturing pirates with the Skull King
    // - Capturing the Skull King with a mermaid
    // - Playing 14s (Tigress cards)
    // The specific bonus rules would be implemented here
    
    for (const card of cards) {
        if (card && typeof card === 'object') {
            // Bonus logic would go here based on card properties
            // Example structure (not implemented as rules not specified in ticket):
            // if (card.type === 'skullKing' && card.capturedPirate) bonusPoints += 30;
            // if (card.type === 'mermaid' && card.capturedSkullKing) bonusPoints += 50;
        }
    }
    
    return bonusPoints;
}
/**
 * Skull King Scoring Engine
 * Implements core scoring logic for the Skull King card game
 */

/**
 * Calculate the base score for a round based on bid vs actual tricks
 * @param {number} bid - The number of tricks bid (0 or positive integer)
 * @param {number} actualTricks - The actual number of tricks taken (0 or positive integer)
 * @param {number} handCount - The current hand/round number (1-10, used for zero bid scoring)
 * @returns {number} The calculated round score
 */
function calculateRoundScore(bid, actualTricks, handCount) {
  // Input validation
  if (typeof bid !== 'number' || bid < 0 || !Number.isInteger(bid)) {
    throw new Error('Bid must be a non-negative integer');
  }
  if (typeof actualTricks !== 'number' || actualTricks < 0 || !Number.isInteger(actualTricks)) {
    throw new Error('Actual tricks must be a non-negative integer');
  }
  if (typeof handCount !== 'number' || handCount < 1 || handCount > 10 || !Number.isInteger(handCount)) {
    throw new Error('Hand count must be an integer between 1 and 10');
  }

  // Zero bid scoring
  if (bid === 0) {
    if (actualTricks === 0) {
      // Correct zero bid: +10 × hand count
      return 10 * handCount;
    } else {
      // Incorrect zero bid: -10 × hand count
      return -10 * handCount;
    }
  }

  // Non-zero bid scoring
  if (bid === actualTricks) {
    // Correct bid: +20 points per trick
    return 20 * actualTricks;
  } else {
    // Incorrect bid: -10 points per trick difference
    const difference = Math.abs(bid - actualTricks);
    return -10 * difference;
  }
}

/**
 * Calculate bonus points for special cards and combinations
 * Bonuses are only awarded when the bid was correct
 * @param {Array} cards - Array of card objects played by the player
 * @param {number} bid - The number of tricks bid
 * @param {number} actualTricks - The actual number of tricks taken
 * @returns {number} The calculated bonus points (0 if bid was incorrect)
 */
function calculateBonusPoints(cards, bid, actualTricks) {
  // Input validation
  if (!Array.isArray(cards)) {
    throw new Error('Cards must be an array');
  }
  if (typeof bid !== 'number' || bid < 0 || !Number.isInteger(bid)) {
    throw new Error('Bid must be a non-negative integer');
  }
  if (typeof actualTricks !== 'number' || actualTricks < 0 || !Number.isInteger(actualTricks)) {
    throw new Error('Actual tricks must be a non-negative integer');
  }

  // Only award bonuses if bid was correct
  const bidCorrect = (bid === 0 && actualTricks === 0) || (bid > 0 && bid === actualTricks);
  if (!bidCorrect) {
    return 0;
  }

  let bonusPoints = 0;

  // Count special cards for bonuses
  const specialCards = {
    skullKing: 0,
    pirates: 0,
    mermaids: 0
  };

  cards.forEach(card => {
    if (!card || typeof card !== 'object') {
      return; // Skip invalid cards
    }

    // Count Skull King cards
    if (card.type === 'skull_king' || card.name === 'Skull King') {
      specialCards.skullKing++;
    }
    // Count Pirate cards
    else if (card.type === 'pirate' || card.suit === 'pirates') {
      specialCards.pirates++;
    }
    // Count Mermaid cards
    else if (card.type === 'mermaid' || card.suit === 'mermaids') {
      specialCards.mermaids++;
    }
  });

  // Skull King bonuses: +30 points each
  bonusPoints += specialCards.skullKing * 30;

  // Pirate bonuses: +20 points each
  bonusPoints += specialCards.pirates * 20;

  // Mermaid bonuses: +20 points each
  bonusPoints += specialCards.mermaids * 20;

  return bonusPoints;
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    calculateRoundScore,
    calculateBonusPoints
  };
} else if (typeof window !== 'undefined') {
  // Browser environment
  window.SkullKingScoring = {
    calculateRoundScore,
    calculateBonusPoints
  };
}