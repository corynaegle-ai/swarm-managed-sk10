import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GameFlow, { GAME_PHASES } from '../components/GameFlow';
import { useGame } from '../hooks/useGame';

// Mock the useGame hook
jest.mock('../hooks/useGame');

// Mock the phase components
jest.mock('../components/phases/SetupPhase', () => {
  return function MockSetupPhase({ onComplete }) {
    return (
      <div data-testid="setup-phase">
        <button onClick={onComplete}>Complete Setup</button>
      </div>
    );
  };
});

jest.mock('../components/phases/BiddingPhase', () => {
  return function MockBiddingPhase({ onComplete, round }) {
    return (
      <div data-testid="bidding-phase">
        <span>Round {round}</span>
        <button onClick={onComplete}>Complete Bidding</button>
      </div>
    );
  };
});

jest.mock('../components/phases/ScoringPhase', () => {
  return function MockScoringPhase({ onComplete, round }) {
    return (
      <div data-testid="scoring-phase">
        <span>Round {round}</span>
        <button onClick={onComplete}>Complete Scoring</button>
      </div>
    );
  };
});

jest.mock('../components/phases/GameComplete', () => {
  return function MockGameComplete() {
    return <div data-testid="game-complete">Game Complete</div>;
  };
});

describe('GameFlow', () => {
  const mockUpdateGameState = jest.fn();

  beforeEach(() => {
    useGame.mockReturnValue({
      gameState: { gamePhase: 'setup', currentRound: 1 },
      updateGameState: mockUpdateGameState
    });
    mockUpdateGameState.mockClear();
  });

  test('renders setup phase initially', () => {
    render(<GameFlow />);
    expect(screen.getByTestId('setup-phase')).toBeInTheDocument();
    expect(screen.getByText('Phase: SETUP')).toBeInTheDocument();
  });

  test('transitions from setup to bidding phase', () => {
    render(<GameFlow />);
    
    fireEvent.click(screen.getByText('Complete Setup'));
    
    expect(mockUpdateGameState).toHaveBeenCalledWith({
      gamePhase: 'bidding',
      currentRound: 1
    });
  });

  test('transitions from bidding to scoring phase', () => {
    useGame.mockReturnValue({
      gameState: { gamePhase: 'bidding', currentRound: 1 },
      updateGameState: mockUpdateGameState
    });

    render(<GameFlow />);
    
    fireEvent.click(screen.getByText('Complete Bidding'));
    
    expect(mockUpdateGameState).toHaveBeenCalledWith({
      gamePhase: 'scoring',
      currentRound: 1
    });
  });

  test('transitions from scoring to next round bidding', () => {
    useGame.mockReturnValue({
      gameState: { gamePhase: 'scoring', currentRound: 5 },
      updateGameState: mockUpdateGameState
    });

    render(<GameFlow />);
    
    fireEvent.click(screen.getByText('Complete Scoring'));
    
    expect(mockUpdateGameState).toHaveBeenCalledWith({
      gamePhase: 'bidding',
      currentRound: 6
    });
  });

  test('transitions to game complete after round 10', () => {
    useGame.mockReturnValue({
      gameState: { gamePhase: 'scoring', currentRound: 10 },
      updateGameState: mockUpdateGameState
    });

    render(<GameFlow />);
    
    fireEvent.click(screen.getByText('Complete Scoring'));
    
    expect(mockUpdateGameState).toHaveBeenCalledWith({
      gamePhase: 'complete',
      currentRound: 10
    });
  });

  test('displays current round correctly', () => {
    useGame.mockReturnValue({
      gameState: { gamePhase: 'bidding', currentRound: 7 },
      updateGameState: mockUpdateGameState
    });

    render(<GameFlow />);
    
    expect(screen.getByText('Round: 7/10')).toBeInTheDocument();
  });

  test('does not show round indicator on complete phase', () => {
    useGame.mockReturnValue({
      gameState: { gamePhase: 'complete', currentRound: 10 },
      updateGameState: mockUpdateGameState
    });

    render(<GameFlow />);
    
    expect(screen.queryByText('Round: 10/10')).not.toBeInTheDocument();
    expect(screen.getByText('Phase: COMPLETE')).toBeInTheDocument();
  });
});