// js/game.js - Game state management with integrated scoring system

import { calculateRoundScore, addBonuses } from './scoring.js';

// Game state structure
let gameState = {
  players: [], // Array of { id, name, totalScore, roundHistory: [] }
  currentRound: 0,
  // Other game state properties as needed
};

// Function to update a player's score after a round
function updatePlayerScore(playerId, bid, actualTricks, cards, handCount) {
  try {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error(`Player with ID ${playerId} not found`);
    }

    // Calculate round score using imported function
    const roundScore = calculateRoundScore(bid, actualTricks, cards);
    
    // Add bonuses if applicable
    const bonusScore = addBonuses(bid, actualTricks, handCount);
    const totalRoundScore = roundScore + bonusScore;

    // Update player's total score atomically
    player.totalScore += totalRoundScore;

    // Add to round history
    player.roundHistory.push({
      round: gameState.currentRound,
      bid,
      actualTricks,
      roundScore,
      bonusScore,
      totalRoundScore
    });
  } catch (error) {
    console.error('Error updating player score:', error.message);
    throw error;
  }
}

// Function to get current scores for all players
function getCurrentScores() {
  return gameState.players.map(player => ({
    id: player.id,
    name: player.name,
    totalScore: player.totalScore,
    roundHistory: player.roundHistory
  }));
}

// Example function to initialize players (for demonstration)
function initializePlayers(playerList) {
  gameState.players = playerList.map(p => ({
    id: p.id,
    name: p.name,
    totalScore: 0,
    roundHistory: []
  }));
}

// Example function to advance round
function advanceRound() {
  gameState.currentRound += 1;
}

// Export necessary functions and state
export { gameState, updatePlayerScore, getCurrentScores, initializePlayers, advanceRound };
