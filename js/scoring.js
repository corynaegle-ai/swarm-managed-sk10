/**
 * Scoring logic for Skull King game.
 */

/**
 * Calculates the round score based on bid, actual tricks taken, and hand count.
 * @param {number} bid - The number of tricks bid (must be non-negative integer).
 * @param {number} actualTricks - The number of tricks actually taken (must be non-negative integer).
 * @param {number} handCount - The number of cards in the hand (must be positive integer).
 * @returns {number} The round score.
 */
function calculateRoundScore(bid, actualTricks, handCount) {
  if (!Number.isInteger(bid) || bid < 0) {
    throw new Error('Bid must be a non-negative integer');
  }
  if (!Number.isInteger(actualTricks) || actualTricks < 0) {
    throw new Error('Actual tricks must be a non-negative integer');
  }
  if (!Number.isInteger(handCount) || handCount <= 0) {
    throw new Error('Hand count must be a positive integer');
  }

  if (bid === 0) {
    if (actualTricks === 0) {
      return 10 * handCount;
    } else {
      return -10 * handCount;
    }
  } else {
    if (bid === actualTricks) {
      return 20 * actualTricks;
    } else {
      return -10 * Math.abs(bid - actualTricks);
    }
  }
}

/**
 * Calculates bonus points from special cards, only if the bid was correct.
 * Assumes cards is an array of objects with a 'type' property (e.g., 'skull_king', 'pirate', 'mermaid').
 * Bonuses: Skull King (50), Pirate (30), Mermaid (20).
 * @param {Array} cards - Array of card objects.
 * @param {number} bid - The number of tricks bid.
 * @param {number} actualTricks - The number of tricks actually taken.
 * @returns {number} The bonus points (0 if bid incorrect).
 */
function calculateBonusPoints(cards, bid, actualTricks) {
  if (!Array.isArray(cards)) {
    throw new Error('Cards must be an array');
  }
  if (!Number.isInteger(bid) || bid < 0) {
    throw new Error('Bid must be a non-negative integer');
  }
  if (!Number.isInteger(actualTricks) || actualTricks < 0) {
    throw new Error('Actual tricks must be a non-negative integer');
  }

  if (bid !== actualTricks) {
    return 0;
  }

  let bonus = 0;
  for (let card of cards) {
    if (card && typeof card === 'object' && card.type) {
      switch (card.type) {
        case 'skull_king':
          bonus += 50;
          break;
        case 'pirate':
          bonus += 30;
          break;
        case 'mermaid':
          bonus += 20;
          break;
        default:
          // No bonus for other cards
          break;
      }
    }
  }
  return bonus;
}

// Export the functions
module.exports = {
  calculateRoundScore,
  calculateBonusPoints
};
