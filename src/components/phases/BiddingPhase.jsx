import React, { useState, useEffect } from 'react';
import { useGame } from '../../hooks/useGame';

const BiddingPhase = ({ round, onComplete }) => {
  const { gameState } = useGame();
  const [bids, setBids] = useState({});
  const [currentBidder, setCurrentBidder] = useState(0);
  const [allBidsComplete, setAllBidsComplete] = useState(false);

  const players = gameState?.players || [];

  // Safety check: if no players in game state, we can't proceed
  if (players.length === 0) {
    return (
      <div className="bidding-phase">
        <h2>Error: No players configured</h2>
        <p>Please return to setup and configure players.</p>
      </div>
    );
  }

  useEffect(() => {
    const completedBids = Object.keys(bids).length;
    if (completedBids === players.length) {
      setAllBidsComplete(true);
    }
  }, [bids, players.length]);

  const handleBid = (playerId, bidAmount) => {
    setBids(prev => ({
      ...prev,
      [playerId]: parseInt(bidAmount)
    }));
    
    // Move to next player
    setCurrentBidder(prev => (prev + 1) % players.length);
  };

  const handleContinue = () => {
    if (allBidsComplete) {
      onComplete();
    }
  };

  const totalBids = Object.values(bids).reduce((sum, bid) => sum + bid, 0);
  const maxTricks = 13; // Standard spades tricks per round

  return (
    <div className="bidding-phase">
      <h2>Bidding Phase - Round {round}</h2>
      
      <div className="bidding-status">
        <div className="round-info">
          <span>Total Bids: {totalBids}/{maxTricks} tricks</span>
        </div>
      </div>

      <div className="players-bidding">
        {players.map((player, index) => (
          <div 
            key={player.id} 
            className={`player-bid-area ${index === currentBidder && !bids[player.id] ? 'active' : ''} ${bids[player.id] !== undefined ? 'completed' : ''}`}
          >
            <h3>{player.name}</h3>
            {bids[player.id] !== undefined ? (
              <div className="bid-complete">
                <strong>Bid: {bids[player.id]} tricks</strong>
              </div>
            ) : index === currentBidder ? (
              <div className="bid-input">
                <label>Enter your bid (0-13 tricks):</label>
                <div className="bid-buttons">
                  {Array.from({ length: 14 }, (_, i) => (
                    <button 
                      key={i}
                      onClick={() => handleBid(player.id, i)}
                      className="bid-button"
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="waiting">Waiting to bid...</div>
            )}
          </div>
        ))}
      </div>

      {allBidsComplete && (
        <div className="bidding-complete">
          <h3>All Bids Complete</h3>
          <div className="bid-summary">
            {players.map(player => (
              <div key={player.id} className="player-bid-summary">
                {player.name}: {bids[player.id]} tricks
              </div>
            ))}
          </div>
          <button 
            className="continue-btn"
            onClick={handleContinue}
          >
            Start Playing Tricks
          </button>
        </div>
      )}
    </div>
  );
};

export default BiddingPhase;