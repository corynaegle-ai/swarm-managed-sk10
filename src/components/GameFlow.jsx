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

  const transitionToPhase = (nextPhase) => {
    // Validate phase transitions
    const validTransitions = {
      [GAME_PHASES.SETUP]: [GAME_PHASES.BIDDING],
      [GAME_PHASES.BIDDING]: [GAME_PHASES.SCORING],
      [GAME_PHASES.SCORING]: [GAME_PHASES.BIDDING, GAME_PHASES.COMPLETE],
      [GAME_PHASES.COMPLETE]: [] // No transitions from complete
    };

    if (!validTransitions[gameState.gamePhase].includes(nextPhase)) {
      console.warn(`Invalid transition from ${gameState.gamePhase} to ${nextPhase}`);
      return;
    }

    const newRound = nextPhase === GAME_PHASES.BIDDING && gameState.gamePhase === GAME_PHASES.SCORING ? gameState.currentRound + 1 : gameState.currentRound;
    updateGameState({ 
      gamePhase: nextPhase,
      currentRound: newRound
    });
  };

  const handleSetupComplete = () => {
    transitionToPhase(GAME_PHASES.BIDDING);
  };

  const handleBiddingComplete = () => {
    transitionToPhase(GAME_PHASES.SCORING);
  };

  const handleScoringComplete = () => {
    if (gameState.currentRound >= 10) {
      transitionToPhase(GAME_PHASES.COMPLETE);
    } else {
      transitionToPhase(GAME_PHASES.BIDDING);
    }
  };

  const renderCurrentPhase = () => {
    switch (gameState.gamePhase) {
      case GAME_PHASES.SETUP:
        return <SetupPhase onComplete={handleSetupComplete} />;
      case GAME_PHASES.BIDDING:
        return (
          <BiddingPhase 
            round={gameState.currentRound}
            onComplete={handleBiddingComplete}
          />
        );
      case GAME_PHASES.SCORING:
        return (
          <ScoringPhase 
            round={gameState.currentRound}
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
          <span className="current-phase">Phase: {gameState.gamePhase.toUpperCase()}</span>
          {gameState.gamePhase !== GAME_PHASES.COMPLETE && (
            <span className="round-indicator">Round: {gameState.currentRound}/10</span>
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