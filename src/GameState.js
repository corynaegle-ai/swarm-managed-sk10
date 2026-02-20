class GameState {
  constructor() {
    this.gamePhase = 'setup'; // Possible phases: 'setup', 'bidding', 'scoring', 'completion'
    this.currentRound = 1;
    this.maxRounds = 10;
    this.players = []; // Array of player objects, e.g., {id: 1, name: 'Player1', score: 0}
    this.bids = {}; // Object to store bids, e.g., {playerId: bidAmount}
    this.roundResults = []; // Array to store results of each round
  }

  // Transition to next phase
  advancePhase() {
    if (this.gamePhase === 'setup') {
      if (this.players.length > 0) {
        this.gamePhase = 'bidding';
      } else {
        throw new Error('Cannot advance to bidding: no players set up.');
      }
    } else if (this.gamePhase === 'bidding') {
      if (Object.keys(this.bids).length === this.players.length) {
        this.gamePhase = 'scoring';
      } else {
        throw new Error('Cannot advance to scoring: not all players have bid.');
      }
    } else if (this.gamePhase === 'scoring') {
      // Assume scoring is done here; in real implementation, calculate scores
      this.roundResults.push({ round: this.currentRound, bids: { ...this.bids } });
      this.bids = {}; // Reset bids for next round
      this.currentRound++;
      if (this.currentRound > this.maxRounds) {
        this.gamePhase = 'completion';
      } else {
        this.gamePhase = 'bidding'; // Loop back to bidding for next round
      }
    } else if (this.gamePhase === 'completion') {
      throw new Error('Game is complete, cannot advance further.');
    }
  }

  // Prevent backward transitions
  cannotGoBack() {
    return true; // Phases only advance forward
  }

  // Add a player during setup
  addPlayer(name) {
    if (this.gamePhase !== 'setup') {
      throw new Error('Players can only be added during setup phase.');
    }
    const id = this.players.length + 1;
    this.players.push({ id, name, score: 0 });
  }

  // Submit a bid during bidding phase
  submitBid(playerId, bid) {
    if (this.gamePhase !== 'bidding') {
      throw new Error('Bids can only be submitted during bidding phase.');
    }
    if (!this.players.find(p => p.id === playerId)) {
      throw new Error('Invalid player ID.');
    }
    this.bids[playerId] = bid;
  }

  // Check if game is complete
  isComplete() {
    return this.gamePhase === 'completion';
  }
}

export default GameState;