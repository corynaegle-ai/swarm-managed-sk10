import React, { useState, useEffect } from 'react';
import './BidCollection.css';

const BidCollection = ({ players, currentHandCount, onBidsSubmitted }) => {
  const [bids, setBids] = useState({});
  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    // Initialize bids object for all players
    const initialBids = {};
    players.forEach(player => {
      initialBids[player.id] = '';
    });
    setBids(initialBids);
  }, [players]);

  const validateBid = (playerId, bidValue) => {
    const bid = parseInt(bidValue);
    
    if (isNaN(bid) || bid < 0) {
      return 'Bid must be a number between 0 and ' + currentHandCount;
    }
    
    if (bid > currentHandCount) {
      return 'Bid cannot exceed ' + currentHandCount + ' hands';
    }
    
    return null;
  };

  const handleBidChange = (playerId, value) => {
    const newBids = { ...bids, [playerId]: value };
    setBids(newBids);
    
    // Clear error for this player if valid
    const error = validateBid(playerId, value);
    const newErrors = { ...errors };
    if (error) {
      newErrors[playerId] = error;
    } else {
      delete newErrors[playerId];
    }
    setErrors(newErrors);
  };

  const areAllBidsValid = () => {
    return players.every(player => {
      const bid = bids[player.id];
      return bid !== '' && validateBid(player.id, bid) === null;
    });
  };

  const handleSubmitBids = () => {
    if (areAllBidsValid()) {
      setShowConfirmation(true);
    }
  };

  const confirmBids = () => {
    const playerRoundScores = players.map(player => ({
      playerId: player.id,
      playerName: player.name,
      bid: parseInt(bids[player.id]),
      tricks: 0,
      score: 0
    }));
    
    onBidsSubmitted(playerRoundScores);
  };

  const cancelConfirmation = () => {
    setShowConfirmation(false);
  };

  if (showConfirmation) {
    return (
      <div className="bid-confirmation">
        <h3>Confirm Bids</h3>
        <div className="bid-summary">
          {players.map(player => (
            <div key={player.id} className="bid-summary-row">
              <span className="player-name">{player.name}:</span>
              <span className="bid-value">{bids[player.id]} tricks</span>
            </div>
          ))}
        </div>
        <div className="confirmation-buttons">
          <button onClick={confirmBids} className="confirm-btn">Confirm Bids</button>
          <button onClick={cancelConfirmation} className="cancel-btn">Back to Bidding</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bid-collection">
      <h3>Place Your Bids</h3>
      <p>Current hand has {currentHandCount} tricks available</p>
      
      <div className="bid-inputs">
        {players.map(player => (
          <div key={player.id} className="bid-input-row">
            <label className="player-label">{player.name}:</label>
            <input
              type="number"
              min="0"
              max={currentHandCount}
              value={bids[player.id]}
              onChange={(e) => handleBidChange(player.id, e.target.value)}
              className={errors[player.id] ? 'error' : ''}
              placeholder="Enter bid (0-" + currentHandCount + ")"
            />
            {errors[player.id] && (
              <span className="error-message">{errors[player.id]}</span>
            )}
          </div>
        ))}
      </div>
      
      <button 
        onClick={handleSubmitBids}
        disabled={!areAllBidsValid()}
        className="submit-bids-btn"
      >
        Submit All Bids
      </button>
    </div>
  );
};

export default BidCollection;