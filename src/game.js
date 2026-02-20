import { PlayerRoundScore } from './models/PlayerRoundScore.js';

class Game {
  constructor(players) {
    this.players = players;
    this.roundNumber = 1;
    this.roundScores = [];
    this.handCount = 0;
  }

  collectBids(bids, handCount) {
    this.handCount = handCount;
    this.roundScores = this.players.map(player => 
      new PlayerRoundScore(player.id, player.name, bids[player.id], handCount)
    );
  }

  startRound() {
    // Logic to start the round after bids are collected
    console.log('Round started with bids:', this.roundScores);
  }
}

export default Game;
