import React from 'react';
import { useGame } from '../../hooks/useGame';

const GameComplete = () => {
  const { gameState, updateGameState } = useGame();
  
  // Get final scores from game state, or calculate from current scores if not set
  const finalScores = gameState?.finalScores || 
    (gameState?.scores ? 
      Object.entries(gameState.scores).reduce((acc, [playerId, score]) => {
        const player = gameState.players?.find(p => p.id === parseInt(playerId));
        acc[playerId] = {
          name: player?.name || `Player ${playerId}`,
          score: score
        };
        return acc;
      }, {}) 
      : null);

  // If no scores available, show error state
  if (!finalScores || Object.keys(finalScores).length === 0) {
    return (
      <div className="game-complete">
        <h1>Game Complete</h1>
        <p className="error-message">Error: No final scores available</p>
        <button className="new-game-btn primary" onClick={handleNewGame}>
          New Game
        </button>
      </div>
    );
  }

  // Sort players by score (descending)
  const sortedPlayers = Object.entries(finalScores)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.score - a.score);

  const winner = sortedPlayers[0];

  const handleNewGame = () => {
    // Reset game state and return to setup
    updateGameState({
      gamePhase: 'setup',
      players: [],
      currentRound: 1,
      currentTrick: [],
      scores: {},
      bids: {},
      tricksWon: {},
      finalScores: null
    });
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