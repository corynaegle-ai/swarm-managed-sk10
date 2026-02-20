import { useState } from 'react';

const initialGameState = {
  gamePhase: 'setup',
  currentRound: 1,
  players: [],
  bids: {},
  scores: {},
  tricksWon: {},
  currentTrick: [],
  finalScores: null
};

export const useGame = () => {
  const [gameState, setGameState] = useState(initialGameState);

  const updateGameState = (updates) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  return { gameState, updateGameState };
};