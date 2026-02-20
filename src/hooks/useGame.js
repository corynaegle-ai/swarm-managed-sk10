import { useState, useEffect } from 'react';

// Mock game state management hook
// In a real implementation, this would connect to a proper state management system
export const useGame = () => {
  const [gameState, setGameState] = useState({
    gamePhase: 'setup',
    currentRound: 1,
    players: [],
    currentBids: {},
    scores: {},
    finalScores: null
  });

  const updateGameState = (updates) => {
    setGameState(prev => ({
      ...prev,
      ...updates
    }));
  };

  const resetGame = () => {
    setGameState({
      gamePhase: 'setup',
      currentRound: 1,
      players: [],
      currentBids: {},
      scores: {},
      finalScores: null
    });
  };

  // Persist game state to localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('spadesGameState');
    if (savedState) {
      try {
        setGameState(JSON.parse(savedState));
      } catch (error) {
        console.warn('Failed to load saved game state:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('spadesGameState', JSON.stringify(gameState));
  }, [gameState]);

  return {
    gameState,
    updateGameState,
    resetGame
  };
};