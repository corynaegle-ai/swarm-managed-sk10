// game.js
// Main game logic

export const players = [
  { id: 1, name: 'Player 1' },
  { id: 2, name: 'Player 2' },
  { id: 3, name: 'Player 3' },
  { id: 4, name: 'Player 4' }
];

export class Game {
  constructor() {
    this.currentRound = 1;
    this.currentHandCount = 1;
    this.playerRoundScores = [];
  }

  startRound() {
    // Logic to start a round, perhaps initialize scores
    this.playerRoundScores = [];
  }

  collectBids(bids) {
    // Create PlayerRoundScore objects
    this.playerRoundScores = players.map(player => new PlayerRoundScore(player, bids[player.id], 0));
  }

  // Other game logic methods can be added here
}

import { PlayerRoundScore } from './models/PlayerRoundScore.js';