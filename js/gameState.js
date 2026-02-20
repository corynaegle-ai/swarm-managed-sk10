/**
 * Game State Management Module
 * Manages core game state including phases and rounds
 */

// Game state object
const gameState = {
  currentRound: 1,
  gamePhase: 'setup',
  maxRounds: 10
};

/**
 * Validates if a phase transition is allowed
 * @param {string} fromPhase - Current phase
 * @param {string} toPhase - Target phase
 * @returns {boolean} - Whether transition is valid
 */
function isValidTransition(fromPhase, toPhase) {
  const validTransitions = {
    'setup': ['bidding'],
    'bidding': ['scoring'],
    'scoring': ['bidding', 'completed'],
    'completed': [] // No transitions from completed
  };
  
  return validTransitions[fromPhase]?.includes(toPhase) || false;
}

/**
 * Transitions to bidding phase
 * Can be called from 'setup' or from 'scoring' (for new round)
 * @throws {Error} If invalid transition
 */
function startBidding() {
  if (!isValidTransition(gameState.gamePhase, 'bidding')) {
    throw new Error(`Cannot transition from ${gameState.gamePhase} to bidding`);
  }
  
  gameState.gamePhase = 'bidding';
}

/**
 * Transitions to scoring phase
 * Can only be called from 'bidding' phase
 * @throws {Error} If invalid transition
 */
function startScoring() {
  if (!isValidTransition(gameState.gamePhase, 'scoring')) {
    throw new Error(`Cannot transition from ${gameState.gamePhase} to scoring`);
  }
  
  gameState.gamePhase = 'scoring';
}

/**
 * Advances to next round or ends game
 * Can only be called from 'scoring' phase
 * Automatically moves to 'completed' after round 10
 * @throws {Error} If invalid transition or game already completed
 */
function nextRound() {
  if (gameState.gamePhase !== 'scoring') {
    throw new Error(`Cannot advance round from ${gameState.gamePhase} phase`);
  }
  
  if (gameState.currentRound >= gameState.maxRounds) {
    gameState.gamePhase = 'completed';
    return;
  }
  
  gameState.currentRound++;
  gameState.gamePhase = 'bidding';
}

/**
 * Explicitly ends the game
 * Can be called from any phase except 'completed'
 * @throws {Error} If game already completed
 */
function endGame() {
  if (gameState.gamePhase === 'completed') {
    throw new Error('Game is already completed');
  }
  
  gameState.gamePhase = 'completed';
}

/**
 * Gets current game state (read-only copy)
 * @returns {Object} Current game state
 */
function getGameState() {
  return {
    currentRound: gameState.currentRound,
    gamePhase: gameState.gamePhase,
    maxRounds: gameState.maxRounds
  };
}

/**
 * Resets game state to initial values
 * Useful for starting a new game
 */
function resetGame() {
  gameState.currentRound = 1;
  gameState.gamePhase = 'setup';
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    startBidding,
    startScoring,
    nextRound,
    endGame,
    getGameState,
    resetGame
  };
} else {
  // Browser environment
  window.GameState = {
    startBidding,
    startScoring,
    nextRound,
    endGame,
    getGameState,
    resetGame
  };
}