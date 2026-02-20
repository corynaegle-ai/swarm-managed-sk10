class Player {
  constructor(name, hand = []) {
    this.name = name;
    this.hand = hand;
  }

  getHandSize() {
    return this.hand.length;
  }
}

class PlayerRoundScore {
  constructor(player, bid) {
    this.player = player;
    this.bid = bid;
  }

  isValid() {
    return this.bid >= 0 && this.bid <= this.player.getHandSize();
  }
}

class Game {
  constructor(players = []) {
    this.players = players;
    this.roundScores = [];
    this.bidsCollected = false;
  }

  collectBids() {
    // Simulate collecting bids (in real app, this would be interactive)
    this.roundScores = [];
    for (const player of this.players) {
      let bid = prompt(`Enter bid for ${player.name} (0-${player.getHandSize()}):`);
      bid = parseInt(bid, 10);
      const score = new PlayerRoundScore(player, bid);
      if (!score.isValid()) {
        throw new Error(`Invalid bid for ${player.name}: must be between 0 and ${player.getHandSize()}`);
      }
      this.roundScores.push(score);
    }
    this.bidsCollected = true;
    this.displayBids();
  }

  displayBids() {
    if (!this.bidsCollected) {
      throw new Error('Bids not yet collected');
    }
    console.log('Bids for this round:');
    for (const score of this.roundScores) {
      console.log(`${score.player.name}: ${score.bid}`);
    }
    // In a real app, this might update UI for confirmation
  }

  startRound() {
    if (!this.bidsCollected) {
      throw new Error('Cannot start round until all bids are collected');
    }
    // Proceed to round logic here
    console.log('Round started');
  }
}

module.exports = { Game, Player, PlayerRoundScore };