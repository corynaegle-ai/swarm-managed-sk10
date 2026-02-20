import React, { useState, useEffect } from 'react';
import GameState from './GameState';

function App() {
  const [gameState, setGameState] = useState(new GameState());
  const [newPlayerName, setNewPlayerName] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [currentPlayerId, setCurrentPlayerId] = useState(1);

  const advancePhase = () => {
    try {
      const newState = { ...gameState }; // Shallow copy for simplicity; in real app, use immutable updates
      newState.advancePhase();
      setGameState(newState);
    } catch (error) {
      alert(error.message);
    }
  };

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      const newState = { ...gameState };
      newState.addPlayer(newPlayerName.trim());
      setGameState(newState);
      setNewPlayerName('');
    }
  };

  const submitBid = () => {
    const bid = parseInt(bidAmount);
    if (!isNaN(bid)) {
      try {
        const newState = { ...gameState };
        newState.submitBid(currentPlayerId, bid);
        setGameState(newState);
        setBidAmount('');
      } catch (error) {
        alert(error.message);
      }
    }
  };

  return (
    <div className="App">
      <h1>Game Flow Control</h1>
      <p>Current Phase: {gameState.gamePhase}</p>
      <p>Current Round: {gameState.currentRound}</p>
      {gameState.gamePhase === 'setup' && (
        <div>
          <h2>Setup Phase</h2>
          <input
            type="text"
            placeholder="Player Name"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
          />
          <button onClick={addPlayer}>Add Player</button>
          <ul>
            {gameState.players.map(player => (
              <li key={player.id}>{player.name} (Score: {player.score})</li>
            ))}
          </ul>
          <button onClick={advancePhase}>Start Bidding</button>
        </div>
      )}
      {gameState.gamePhase === 'bidding' && (
        <div>
          <h2>Bidding Phase</h2>
          <p>Players: {gameState.players.map(p => p.name).join(', ')}</p>
          <select onChange={(e) => setCurrentPlayerId(parseInt(e.target.value))}>
            {gameState.players.map(player => (
              <option key={player.id} value={player.id}>{player.name}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Bid Amount"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
          />
          <button onClick={submitBid}>Submit Bid</button>
          <p>Bids: {JSON.stringify(gameState.bids)}</p>
          <button onClick={advancePhase}>Proceed to Scoring</button>
        </div>
      )}
      {gameState.gamePhase === 'scoring' && (
        <div>
          <h2>Scoring Phase</h2>
          <p>Round {gameState.currentRound} bids: {JSON.stringify(gameState.bids)}</p>
          {/* In a real app, implement scoring logic here */}
          <button onClick={advancePhase}>Finish Scoring</button>
        </div>
      )}
      {gameState.gamePhase === 'completion' && (
        <div>
          <h2>Game Complete</h2>
          <p>All rounds finished. Final scores: {JSON.stringify(gameState.players)}</p>
        </div>
      )}
    </div>
  );
}

export default App;