import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Scoreboard from './Scoreboard';

describe('Scoreboard Component', () => {
  const mockPlayers = [
    { id: 'player1', name: 'Alice' },
    { id: 'player2', name: 'Bob' },
    { id: 'player3', name: 'Charlie' }
  ];

  const mockGameState = {
    status: 'in-progress',
    rounds: [
      {
        scores: {
          'player1': 10,
          'player2': 8,
          'player3': 12
        }
      },
      {
        scores: {
          'player1': 15,
          'player2': 20,
          'player3': 5
        }
      }
    ]
  };

  it('renders loading state when no data provided', () => {
    render(<Scoreboard />);
    expect(screen.getByText('Loading scoreboard...')).toBeInTheDocument();
  });

  it('displays player names and total scores', () => {
    render(<Scoreboard gameState={mockGameState} players={mockPlayers} />);
    
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    
    // Check total scores (Alice: 10+15=25, Bob: 8+20=28, Charlie: 12+5=17)
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('28')).toBeInTheDocument();
    expect(screen.getByText('17')).toBeInTheDocument();
  });

  it('displays round-by-round scores', () => {
    render(<Scoreboard gameState={mockGameState} players={mockPlayers} />);
    
    // Check round labels
    expect(screen.getAllByText(/R1:/)).toHaveLength(3);
    expect(screen.getAllByText(/R2:/)).toHaveLength(3);
    
    // Check specific round scores
    expect(screen.getByText('10')).toBeInTheDocument(); // Alice R1
    expect(screen.getByText('20')).toBeInTheDocument(); // Bob R2
    expect(screen.getByText('12')).toBeInTheDocument(); // Charlie R1
  });

  it('highlights the current leader', () => {
    render(<Scoreboard gameState={mockGameState} players={mockPlayers} />);
    
    // Bob has highest total (28), should be highlighted as leader
    const bobRow = screen.getByText('Bob').closest('.player-row');
    expect(bobRow).toHaveClass('leader');
    
    // Check for leader badge
    expect(screen.getByText('👑')).toBeInTheDocument();
  });

  it('shows final results when game is completed', () => {
    const completedGameState = {
      ...mockGameState,
      status: 'completed'
    };
    
    render(<Scoreboard gameState={completedGameState} players={mockPlayers} />);
    
    expect(screen.getByText('🎉 Final Results 🎉')).toBeInTheDocument();
    expect(screen.getByText('Winner: Bob')).toBeInTheDocument();
    
    // Check that final class is applied
    const playerRows = document.querySelectorAll('.player-row');
    playerRows.forEach(row => {
      expect(row).toHaveClass('final');
    });
  });

  it('handles empty rounds gracefully', () => {
    const emptyGameState = {
      status: 'in-progress',
      rounds: []
    };
    
    render(<Scoreboard gameState={emptyGameState} players={mockPlayers} />);
    
    expect(screen.getAllByText('No rounds played')).toHaveLength(3);
    expect(screen.getAllByText('0')).toHaveLength(3); // Total scores should be 0
  });

  it('displays game status correctly', () => {
    render(<Scoreboard gameState={mockGameState} players={mockPlayers} />);
    expect(screen.getByText('Status: in-progress')).toBeInTheDocument();
    
    const completedGameState = { ...mockGameState, status: 'completed' };
    render(<Scoreboard gameState={completedGameState} players={mockPlayers} />);
    expect(screen.getByText('Status: completed')).toBeInTheDocument();
  });
});