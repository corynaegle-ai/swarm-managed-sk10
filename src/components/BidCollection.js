import React, { useState, useEffect } from 'react';

const BidCollection = ({ players, currentHandCount, onBidsCollected }) => {
  const [bids, setBids] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Initialize bids object with null for each player
    const initialBids = {};
    const initialErrors = {};
    players.forEach(player => {
      initialBids[player.id] = null;
      initialErrors[player.id] = '';
    });
    setBids(initialBids);
    setErrors(initialErrors);
  }, [players]);

  const validateBid = (playerId, bid) => {
    if (bid === null || bid === undefined || bid === '') {
      return 'Bid is required.';
    }
    if (isNaN(bid) || bid < 0 || bid > currentHandCount) {
      return `Bid must be a number between 0 and ${currentHandCount}.`;
    }
    return '';
  };

  const handleBidChange = (playerId, value) => {
    const bid = value === '' ? null : parseInt(value, 10);
    const error = validateBid(playerId, bid);
    setBids(prev => ({ ...prev, [playerId]: bid }));
    setErrors(prev => ({ ...prev, [playerId]: error }));
  };

  const areAllBidsValid = () => {
    return players.every(player => {
      const bid = bids[player.id];
      const error = validateBid(player.id, bid);
      return bid !== null && bid !== undefined && bid !== '' && !error;
    });
  };

  const areAllBidsCollected = () => {
    return players.every(player => bids[player.id] !== null && bids[player.id] !== undefined);
  };

  const handleSubmit = () => {
    if (!areAllBidsCollected()) {
      alert('All players must submit bids before proceeding.');
      return;
    }
    if (!areAllBidsValid()) {
      alert('Please correct the errors before proceeding.');
      return;
    }
    onBidsCollected(bids);
  };

  return (
    <div>
      <h2>Collect Bids</h2>
      {players.map(player => (
        <div key={player.id}>
          <label>{player.name}'s Bid (0 to {currentHandCount}): </label>
          <input
            type="number"
            min="0"
            max={currentHandCount}
            value={bids[player.id] ?? ''}
            onChange={(e) => handleBidChange(player.id, e.target.value)}
          />
          {errors[player.id] && <span style={{ color: 'red' }}>{errors[player.id]}</span>}
        </div>
      ))}
      <button onClick={handleSubmit} disabled={!areAllBidsCollected() || !areAllBidsValid()}>
        Confirm Bids
      </button>
      {areAllBidsCollected() && (
        <div>
          <h3>Bid Confirmation</h3>
          <ul>
            {players.map(player => (
              <li key={player.id}>{player.name}: {bids[player.id]}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BidCollection;