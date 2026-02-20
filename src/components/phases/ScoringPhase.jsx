import React, { useState, useEffect } from 'react';
import { useGame } from '../../hooks/useGame';

const ScoringPhase = ({ round, onComplete }) => {
  const { gameState } = useGame();
  const [actualTricks, setActualTricks] = useState({});
  const [scores, setScores] = useState({});
  const [scoringComplete, setScoringComplete] = useState(false);

  const players = gameState?.players || [
    { id: 1, name: 'Player 1' },
    { id: 2, name: 'Player 2' },
    { id: 3, name: 'Player 3' },
    { id: 4, name: 'Player 4' }
  ];

  // Mock bids for demonstration (in real game, these would come from bidding phase)
  const bids = gameState?.currentBids || {
    1: 3, 2: 4, 3: 2, 4: 4
  };

  const calculateScore = (bid, actual) => {
    if (actual === bid) {
      // Made exact bid: 10 points per trick bid + 10 bonus
      return (bid * 10) + 10;
    } else if (actual > bid) {
      // Overtricks: bid * 10 + overtricks - penalty
      const overtricks = actual - bid;
      return (bid * 10) + overtricks;
    } else {
      // Underbid: -10 points per trick bid
      return -(bid * 10);
    }
  };

  useEffect(() => {
    const newScores = {};
    players.forEach(player => {
      if (actualTricks[player.id] !== undefined) {
        newScores[player.id] = calculateScore(
          bids[player.id] || 0, 
          actualTricks[player.id]
        );
      }
    });
    setScores(newScores);

    const allScored = players.every(player => actualTricks[player.id] !== undefined);
    setScoringComplete(allScored);
  }, [actualTricks, players, bids]);

  const handleTricksInput = (playerId, tricks) => {
    setActualTricks(prev => ({
      ...prev,
      [playerId]: parseInt(tricks)
    }));
  };

  const handleContinue = () => {
    if (scoringComplete) {
      onComplete();
    }
  };

  const totalTricksRecorded = Object.values(actualTricks).reduce((sum, tricks) => sum + (tricks || 0), 0);
  const expectedTotal = 13; // Standard spades tricks per round

  return (
    <div className="scoring-phase">
      <h2>Scoring Phase - Round {round}</h2>
      
      <div className="scoring-status">
        <div className="trick-count">
          <span>Tricks Recorded: {totalTricksRecorded}/{expectedTotal}</span>
          {totalTricksRecorded === expectedTotal && (
            <span className="valid">✓ Valid</span>
          )}
          {totalTricksRecorded > 0 && totalTricksRecorded !== expectedTotal && (
            <span className="invalid">! Total must equal 13</span>
          )}
        </div>
      </div>

      <div className="players-scoring">
        {players.map(player => (
          <div key={player.id} className="player-score-area">
            <h3>{player.name}</h3>
            <div className="score-details">
              <div className="bid-info">
                <span>Bid: {bids[player.id] || 0} tricks</span>
              </div>
              
              <div className="actual-input">
                <label>Actual tricks won:</label>
                <input
                  type="number"
                  min="0"
                  max="13"
                  value={actualTricks[player.id] || ''}
                  onChange={(e) => handleTricksInput(player.id, e.target.value)}
                  className="tricks-input"
                />
              </div>

              {scores[player.id] !== undefined && (
                <div className="score-result">
                  <strong>Round Score: {scores[player.id]} points</strong>
                  <div className="score-breakdown">
                    {actualTricks[player.id] === bids[player.id] ? (
                      <span className="made-bid">✓ Made exact bid!</span>
                    ) : actualTricks[player.id] > bids[player.id] ? (
                      <span className="overtricks">Overtricks: +{actualTricks[player.id] - bids[player.id]}</span>
                    ) : (
                      <span className="underbid">Failed bid: -{bids[player.id] - actualTricks[player.id]} short</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {scoringComplete && totalTricksRecorded === expectedTotal && (
        <div className="scoring-complete">
          <h3>Round {round} Complete</h3>
          <div className="round-summary">
            <h4>Round Scores:</h4>
            {players.map(player => (
              <div key={player.id} className="player-round-score">
                {player.name}: {scores[player.id]} points
              </div>
            ))}
          </div>
          <button 
            className="continue-btn"
            onClick={handleContinue}
          >
            {round >= 10 ? 'Finish Game' : 'Next Round'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ScoringPhase;