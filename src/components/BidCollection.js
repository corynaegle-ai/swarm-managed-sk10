import React, { useState, useEffect } from 'react';
import './BidCollection.css';

const BidCollection = ({ players, handCount, onBidsCollected }) => {
  const [bids, setBids] = useState({});
  const [errors, setErrors] = useState({});
  const [allBidsCollected, setAllBidsCollected] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleBidChange = (playerId, bid) => {
    const numBid = parseInt(bid, 10) || 0;
    if (numBid < 0 || numBid > handCount) {
      setErrors(prev => ({ ...prev, [playerId]: `Bid must be between 0 and ${handCount}` }));
    } else {
      setErrors(prev => ({ ...prev, [playerId]: null }));
    }
    setBids(prev => ({ ...prev, [playerId]: numBid }));
  };

  useEffect(() => {
    const allBidsPresent = players.every(player => {
      const bid = bids[player.id];
      return bid !== undefined && bid !== '' && bid >= 0 && bid <= handCount;
    });
    const noErrors = Object.values(errors).every(err => !err);
    setAllBidsCollected(allBidsPresent && noErrors);
  }, [bids, errors, players, handCount]);

  const handleConfirm = () => {
    if (allBidsCollected) {
      setConfirmed(true);
    }
  };

  const handleSubmit = () => {
    if (confirmed) {
      onBidsCollected(bids);
    }
  };

  return (
    <div className="bid-collection">
      <h2>Collect Bids</h2>
      {players.map(player => (
        <div key={player.id} className="bid-input">
          <label>{player.name}: </label>
          <input
            type="number"
            min="0"
            max={handCount}
            value={bids[player.id] || ''}
            onChange={(e) => handleBidChange(player.id, e.target.value)}
          />
          {errors[player.id] && <span className="error">{errors[player.id]}</span>}
        </div>
      ))}
      {allBidsCollected && !confirmed && (
        <div className="confirmation">
          <h3>Bid Confirmation</h3>
          <ul>
            {players.map(player => (
              <li key={player.id}>{player.name}: {bids[player.id]}</li>
            ))}
          </ul>
          <button onClick={handleConfirm}>
            Confirm Bids
          </button>
        </div>
      )}
      {confirmed && (
        <div className="confirmation">
          <h3>Bids Confirmed</h3>
          <ul>
            {players.map(player => (
              <li key={player.id}>{player.name}: {bids[player.id]}</li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={handleSubmit} disabled={!confirmed}>
        Proceed to Round
      </button>
    </div>
  );
};

export default BidCollection;
