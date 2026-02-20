import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import SetupPhase from './phases/SetupPhase';
import BiddingPhase from './phases/BiddingPhase';
import ScoringPhase from './phases/ScoringPhase';
import GameComplete from './phases/GameComplete';

const GAME_PHASES = {
  SETUP: 'setup',
  BIDDING: 'bidding', 
  SCORING: 'scoring',
  COMPLETE: 'complete'
};

const GameFlow = () => {
  const { gameState, updateGameState } = useGame();
  const [currentPhase, setCurrentPhase] = useState(GAME_PHASES.SETUP);
  const [currentRound, setCurrentRound] = useState(1);

  // Initialize game phase from state or default to setup
  useEffect(() => {
    if (gameState?.gamePhase) {
      setCurrentPhase(gameState.gamePhase);
    }
    if (gameState?.currentRound) {
      setCurrentRound(gameState.currentRound);
    }
  }, [gameState]);

  const transitionToPhase = (nextPhase) => {
    // Validate phase transitions
    const validTransitions = {
      [GAME_PHASES.SETUP]: [GAME_PHASES.BIDDING],
      [GAME_PHASES.BIDDING]: [GAME_PHASES.SCORING],
      [GAME_PHASES.SCORING]: [GAME_PHASES.BIDDING, GAME_PHASES.COMPLETE],
      [GAME_PHASES.COMPLETE]: [] // No transitions from complete
    };

    if (!validTransitions[currentPhase].includes(nextPhase)) {
      console.warn(`Invalid transition from ${currentPhase} to ${nextPhase}`);
      return;
    }

    setCurrentPhase(nextPhase);
    updateGameState({ 
      gamePhase: nextPhase,
      currentRound: nextPhase === GAME_PHASES.BIDDING && currentPhase === GAME_PHASES.SCORING ? currentRound + 1 : currentRound
    });
  };

  const handleSetupComplete = () => {
    transitionToPhase(GAME_PHASES.BIDDING);
  };

  const handleBiddingComplete = () => {
    transitionToPhase(GAME_PHASES.SCORING);
  };

  const handleScoringComplete = () => {
    if (currentRound >= 10) {
      transitionToPhase(GAME_PHASES.COMPLETE);
    } else {
      setCurrentRound(prev => prev + 1);
      transitionToPhase(GAME_PHASES.BIDDING);
    }
  };

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case GAME_PHASES.SETUP:
        return <SetupPhase onComplete={handleSetupComplete} />;
      case GAME_PHASES.BIDDING:
        return (
          <BiddingPhase 
            round={currentRound}
            onComplete={handleBiddingComplete}
          />
        );
      case GAME_PHASES.SCORING:
        return (
          <ScoringPhase 
            round={currentRound}
            onComplete={handleScoringComplete}
          />
        );
      case GAME_PHASES.COMPLETE:
        return <GameComplete />;
      default:
        return <div>Invalid game phase</div>;
    }
  };

  return (
    <div className="game-flow">
      <div className="game-header">
        <h1>Spades Game</h1>
        <div className="phase-indicator">
          <span className="current-phase">Phase: {currentPhase.toUpperCase()}</span>
          {currentPhase !== GAME_PHASES.COMPLETE && (
            <span className="round-indicator">Round: {currentRound}/10</span>
          )}
        </div>
      </div>
      <div className="phase-content">
        {renderCurrentPhase()}
      </div>
    </div>
  );
};

export default GameFlow;
export { GAME_PHASES };