import React from 'react';
import './Scoreboard.css';

const Scoreboard = ({ gameState, players }) => {
  if (!gameState || !players) {
    return <div className="scoreboard">Loading scoreboard...</div>;
  }

  const calculateTotalScore = (playerId) => {
    if (!gameState.rounds) return 0;
    return gameState.rounds.reduce((total, round) => {
      const playerScore = round.scores?.[playerId] || 0;
      return total + playerScore;
    }, 0);
  };

  const getLeaderId = () => {
    let maxScore = -Infinity;
    let leaderId = null;
    
    players.forEach(player => {
      const score = calculateTotalScore(player.id);
      if (score > maxScore) {
        maxScore = score;
        leaderId = player.id;
      }
    });
    
    return leaderId;
  };

  const leaderId = getLeaderId();
  const isGameComplete = gameState.status === 'completed';

  return (
    <div className="scoreboard">
      <h2>Scoreboard</h2>
      
      {/* Player totals and round breakdown */}
      <div className="players-section">
        {players.map(player => {
          const totalScore = calculateTotalScore(player.id);
          const isLeader = player.id === leaderId;
          
          return (
            <div 
              key={player.id} 
              className={`player-row ${isLeader ? 'leader' : ''} ${isGameComplete ? 'final' : ''}`}
            >
              <div className="player-info">
                <span className="player-name">
                  {player.name}
                  {isLeader && <span className="leader-badge">👑</span>}
                </span>
                <span className="total-score">{totalScore}</span>
              </div>
              
              {/* Round-by-round scores */}
              <div className="round-scores">
                {gameState.rounds?.map((round, index) => (
                  <div key={index} className="round-score">
                    <span className="round-label">R{index + 1}:</span>
                    <span className="score">{round.scores?.[player.id] || 0}</span>
                  </div>
                )) || <span className="no-rounds">No rounds played</span>}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Game status */}
      <div className="game-status">
        <span>Status: {gameState.status || 'In Progress'}</span>
        {isGameComplete && (
          <div className="final-results">
            <h3>🎉 Final Results 🎉</h3>
            <p>Winner: {players.find(p => p.id === leaderId)?.name || 'Unknown'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scoreboard;