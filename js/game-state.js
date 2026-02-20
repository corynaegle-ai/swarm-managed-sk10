/**
 * Game State Management
 * Manages PlayerRoundScore objects and bid storage for card game rounds
 */

// Game state storage
const gameState = {
  currentRound: 0,
  rounds: [] // Array of rounds, each containing PlayerRoundScore objects
};

/**
 * PlayerRoundScore data structure
 * @typedef {Object} PlayerRoundScore
 * @property {string} playerId - Unique identifier for the player
 * @property {string} playerName - Display name of the player
 * @property {number} bid - Number of tricks the player bid
 * @property {number} tricksWon - Number of tricks actually won (initially 0)
 * @property {number} score - Calculated score for the round (initially 0)
 */

/**
 * Creates a PlayerRoundScore object with initial values
 * @param {string} playerId - Unique identifier for the player
 * @param {string} playerName - Display name of the player
 * @param {number} bid - Number of tricks the player bid
 * @returns {PlayerRoundScore} PlayerRoundScore object
 * @throws {Error} If required parameters are missing or invalid
 */
function createPlayerRoundScore(playerId, playerName, bid) {
  // Validate required parameters
  if (!playerId || typeof playerId !== 'string') {
    throw new Error('playerId is required and must be a string');
  }
  
  if (!playerName || typeof playerName !== 'string') {
    throw new Error('playerName is required and must be a string');
  }
  
  if (typeof bid !== 'number' || bid < 0) {
    throw new Error('bid is required and must be a non-negative number');
  }
  
  return {
    playerId: playerId,
    playerName: playerName,
    bid: bid,
    tricksWon: 0,
    score: 0
  };
}

/**
 * Stores bids for all players in the current round
 * @param {Array<{playerId: string, playerName: string, bid: number}>} playerBids - Array of player bid objects
 * @throws {Error} If playerBids is not an array or contains invalid data
 */
function storeBids(playerBids) {
  // Validate input
  if (!Array.isArray(playerBids)) {
    throw new Error('playerBids must be an array');
  }
  
  if (playerBids.length === 0) {
    throw new Error('playerBids array cannot be empty');
  }
  
  // Create PlayerRoundScore objects for each player
  const roundScores = [];
  
  for (const playerBid of playerBids) {
    try {
      const playerRoundScore = createPlayerRoundScore(
        playerBid.playerId,
        playerBid.playerName,
        playerBid.bid
      );
      roundScores.push(playerRoundScore);
    } catch (error) {
      throw new Error(`Invalid player bid data: ${error.message}`);
    }
  }
  
  // Ensure we have a round array for the current round
  if (!gameState.rounds[gameState.currentRound]) {
    gameState.rounds[gameState.currentRound] = [];
  }
  
  // Store the PlayerRoundScore objects
  gameState.rounds[gameState.currentRound] = roundScores;
}

/**
 * Retrieves all PlayerRoundScore objects for the current round
 * @returns {Array<PlayerRoundScore>} Array of PlayerRoundScore objects for the active round
 */
function getCurrentRoundScores() {
  // Return empty array if no round data exists
  if (!gameState.rounds[gameState.currentRound]) {
    return [];
  }
  
  // Return a copy of the current round scores to prevent external modification
  return [...gameState.rounds[gameState.currentRound]];
}

/**
 * Updates the number of tricks won for a specific player in the current round
 * @param {string} playerId - The player's unique identifier
 * @param {number} tricksWon - Number of tricks won
 * @throws {Error} If player not found or invalid parameters
 */
function updatePlayerTricksWon(playerId, tricksWon) {
  if (typeof tricksWon !== 'number' || tricksWon < 0) {
    throw new Error('tricksWon must be a non-negative number');
  }
  
  const currentRoundScores = gameState.rounds[gameState.currentRound];
  if (!currentRoundScores) {
    throw new Error('No current round data available');
  }
  
  const player = currentRoundScores.find(p => p.playerId === playerId);
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found in current round`);
  }
  
  player.tricksWon = tricksWon;
}

/**
 * Calculates and updates the score for a specific player based on bid vs tricks won
 * @param {string} playerId - The player's unique identifier
 * @throws {Error} If player not found
 */
function calculatePlayerScore(playerId) {
  const currentRoundScores = gameState.rounds[gameState.currentRound];
  if (!currentRoundScores) {
    throw new Error('No current round data available');
  }
  
  const player = currentRoundScores.find(p => p.playerId === playerId);
  if (!player) {
    throw new Error(`Player with ID ${playerId} not found in current round`);
  }
  
  // Basic scoring: if bid equals tricks won, score = bid + 10, otherwise score = tricks won
  if (player.bid === player.tricksWon) {
    player.score = player.bid + 10;
  } else {
    player.score = player.tricksWon;
  }
}

/**
 * Advances to the next round
 */
function nextRound() {
  gameState.currentRound++;
}

/**
 * Resets the game state
 */
function resetGame() {
  gameState.currentRound = 0;
  gameState.rounds = [];
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    createPlayerRoundScore,
    storeBids,
    getCurrentRoundScores,
    updatePlayerTricksWon,
    calculatePlayerScore,
    nextRound,
    resetGame
  };
} else {
  // Browser environment - attach to window object
  window.GameState = {
    createPlayerRoundScore,
    storeBids,
    getCurrentRoundScores,
    updatePlayerTricksWon,
    calculatePlayerScore,
    nextRound,
    resetGame
  };
}