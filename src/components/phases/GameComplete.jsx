import React from 'react';
import { useGame } from '../../hooks/useGame';

const GameComplete = () => {
  const { gameState } = useGame();
  
  // Mock final scores for demonstration
  const finalScores = gameState?.finalScores || {
    1: { name: 'Player 1', score: 420 },
    2: { name: 'Player 2', score: 380 },
    3: { name: 'Player 3', score: 340 },
    4: { name: 'Player 4', score: 290 }
  };

  // Sort players by score (descending)
  const sortedPlayers = Object.entries(finalScores)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.score - a.score);

  const winner = sortedPlayers[0];

  const handleNewGame = () => {
    // Reset game state and return to setup
    window.location.reload(); // Simple reset for now
  };

  const handleExitGame = () => {
    // Exit to main menu or close game
    if (window.confirm('Are you sure you want to exit?')) {
      window.close();
    }
  };

  return (
    <div className="game-complete">
      <h1>Game Complete!</h1>
      
      <div className="winner-announcement">
        <h2>🏆 {winner.name} Wins! 🏆</h2>
        <p className="winning-score">Final Score: {winner.score} points</p>
      </div>

      <div className="final-standings">
        <h3>Final Standings</h3>
        <div className="standings-list">
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id} 
              className={`standing-item ${index === 0 ? 'winner' : ''}`}
            >
              <div className="rank">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
              </div>
              <div className="player-name">{player.name}</div>
              <div className="final-score">{player.score} points</div>
            </div>
          ))}
        </div>
      </div>

      <div className="game-stats">
        <h3>Game Statistics</h3>
        <div className="stats-grid">
          <div className="stat">
            <span className="stat-label">Rounds Played:</span>
            <span className="stat-value">10</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Tricks:</span>
            <span className="stat-value">130</span>
          </div>
          <div className="stat">
            <span className="stat-label">Highest Single Round:</span>
            <span className="stat-value">{Math.max(...sortedPlayers.map(p => p.score))}</span>
          </div>
        </div>
      </div>

      <div className="game-actions">
        <button 
          className="new-game-btn primary"
          onClick={handleNewGame}
        >
          New Game
        </button>
        <button 
          className="exit-game-btn secondary"
          onClick={handleExitGame}
        >
          Exit Game
        </button>
      </div>

      <div className="game-complete-footer">
        <p>Thanks for playing Spades!</p>
      </div>
    </div>
  );
};

export default GameComplete;