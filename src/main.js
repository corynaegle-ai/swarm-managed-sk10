import React from 'react';
import ReactDOM from 'react-dom';
import BidCollection from './components/BidCollection.js';
import Game from './game.js';

// Example players and hand count
const players = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
];
const handCount = 5;

const game = new Game(players);

const handleBidsCollected = (bids) => {
  game.collectBids(bids);
  game.startRound();
  alert('Round started!'); // Placeholder for next steps
};

ReactDOM.render(
  <BidCollection players={players} handCount={handCount} onBidsCollected={handleBidsCollected} />,
  document.getElementById('root')
);
