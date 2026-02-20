import React, { useState } from 'react';

const SetupPhase = ({ onComplete }) => {
  const [players, setPlayers] = useState([
    { id: 1, name: 'Player 1', isHuman: true },
    { id: 2, name: 'Player 2', isHuman: false },
    { id: 3, name: 'Player 3', isHuman: false },
    { id: 4, name: 'Player 4', isHuman: false }
  ]);
  const [isReady, setIsReady] = useState(false);

  const handlePlayerNameChange = (playerId, newName) => {
    setPlayers(prev => 
      prev.map(player => 
        player.id === playerId 
          ? { ...player, name: newName }
          : player
      )
    );
  };

  const handlePlayerTypeToggle = (playerId) => {
    setPlayers(prev => 
      prev.map(player => 
        player.id === playerId 
          ? { ...player, isHuman: !player.isHuman }
          : player
      )
    );
  };

  const handleStartGame = () => {
    if (players.every(p => p.name.trim())) {
      setIsReady(true);
      onComplete();
    }
  };

  const canStart = players.every(p => p.name.trim());

  return (
    <div className="setup-phase">
      <h2>Game Setup</h2>
      <div className="player-setup">
        <h3>Configure Players</h3>
        {players.map(player => (
          <div key={player.id} className="player-config">
            <input
              type="text"
              value={player.name}
              onChange={(e) => handlePlayerNameChange(player.id, e.target.value)}
              placeholder={`Player ${player.id} name`}
              className="player-name-input"
            />
            <label className="player-type">
              <input
                type="checkbox"
                checked={player.isHuman}
                onChange={() => handlePlayerTypeToggle(player.id)}
              />
              Human Player
            </label>
          </div>
        ))}
      </div>
      <div className="game-rules">
        <h3>Game Rules</h3>
        <ul>
          <li>10 rounds of Spades</li>
          <li>Each player bids on tricks they expect to win</li>
          <li>Score points for making bids exactly</li>
          <li>Penalty for over/under bidding</li>
        </ul>
      </div>
      <button 
        className="start-game-btn"
        onClick={handleStartGame}
        disabled={!canStart}
      >
        Start Game
      </button>
    </div>
  );
};

export default SetupPhase;