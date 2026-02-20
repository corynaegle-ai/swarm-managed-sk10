import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrickBonusEntry from '../TrickBonusEntry';

// Mock UI components
jest.mock('../ui/card', () => ({
  Card: ({ children, className }) => <div className={className}>{children}</div>,
  CardHeader: ({ children }) => <div>{children}</div>,
  CardTitle: ({ children }) => <h1>{children}</h1>,
  CardContent: ({ children }) => <div>{children}</div>
}));

jest.mock('../ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, className }) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`${variant} ${className}`}
    >
      {children}
    </button>
  )
}));

jest.mock('../ui/input', () => ({
  Input: ({ value, onChange, type, min, max, disabled, className, placeholder, id }) => (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      disabled={disabled}
      className={className}
      placeholder={placeholder}
    />
  )
}));

jest.mock('../ui/label', () => ({
  Label: ({ children, htmlFor }) => <label htmlFor={htmlFor}>{children}</label>
}));

jest.mock('../ui/alert', () => ({
  Alert: ({ children, className }) => <div className={className}>{children}</div>,
  AlertDescription: ({ children, className }) => <div className={className}>{children}</div>
}));

describe('TrickBonusEntry', () => {
  const mockPlayers = [
    { id: '1', name: 'Player 1' },
    { id: '2', name: 'Player 2' },
    { id: '3', name: 'Player 3' }
  ];

  const mockPlayerRoundScores = [
    { playerId: '1', bid: 2, actualTricks: null, bonusPoints: 0 },
    { playerId: '2', bid: 1, actualTricks: null, bonusPoints: 0 },
    { playerId: '3', bid: 0, actualTricks: null, bonusPoints: 0 }
  ];

  const defaultProps = {
    players: mockPlayers,
    handCount: 3,
    playerRoundScores: mockPlayerRoundScores,
    onSubmit: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders trick and bonus entry form', () => {
    render(<TrickBonusEntry {...defaultProps} />);
    
    expect(screen.getByText('Enter Tricks and Bonus Points')).toBeInTheDocument();
    expect(screen.getByText('Hand Count: 3')).toBeInTheDocument();
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();
    expect(screen.getByText('Player 3')).toBeInTheDocument();
  });

  test('accepts valid trick count within bounds', async () => {
    const user = userEvent.setup();
    render(<TrickBonusEntry {...defaultProps} />);
    
    const trickInput = screen.getByDisplayValue('');
    await user.clear(trickInput);
    await user.type(trickInput, '2');
    
    expect(trickInput).toHaveValue('2');
  });

  test('validates trick count is not negative', async () => {
    const user = userEvent.setup();
    render(<TrickBonusEntry {...defaultProps} />);
    
    const trickInput = screen.getAllByPlaceholderText('Enter tricks taken')[0];
    await user.clear(trickInput);
    await user.type(trickInput, '-1');
    
    await waitFor(() => {
      expect(screen.getByText('Tricks taken cannot be negative')).toBeInTheDocument();
    });
  });

  test('validates trick count does not exceed hand count', async () => {
    const user = userEvent.setup();
    render(<TrickBonusEntry {...defaultProps} />);
    
    const trickInput = screen.getAllByPlaceholderText('Enter tricks taken')[0];
    await user.clear(trickInput);
    await user.type(trickInput, '5');
    
    await waitFor(() => {
      expect(screen.getByText('Tricks taken cannot exceed hand count (3)')).toBeInTheDocument();
    });
  });

  test('validates total tricks equals hand count', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    render(<TrickBonusEntry {...defaultProps} onSubmit={mockOnSubmit} />);
    
    // Enter tricks that don't add up to hand count
    const trickInputs = screen.getAllByPlaceholderText('Enter tricks taken');
    await user.clear(trickInputs[0]);
    await user.type(trickInputs[0], '1');
    await user.clear(trickInputs[1]);
    await user.type(trickInputs[1], '1');
    await user.clear(trickInputs[2]);
    await user.type(trickInputs[2], '0');
    
    const submitButton = screen.getByText('Save Tricks & Bonus');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Total tricks taken (2) must equal hand count (3)')).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('accepts bonus points for any player', async () => {
    const user = userEvent.setup();
    render(<TrickBonusEntry {...defaultProps} />);
    
    const bonusInput = screen.getAllByPlaceholderText('Enter bonus points')[0];
    await user.clear(bonusInput);
    await user.type(bonusInput, '5');
    
    expect(bonusInput).toHaveValue('5');
  });

  test('only applies bonus points when bid is met exactly', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    render(<TrickBonusEntry {...defaultProps} onSubmit={mockOnSubmit} />);
    
    // Set up valid trick counts
    const trickInputs = screen.getAllByPlaceholderText('Enter tricks taken');
    await user.clear(trickInputs[0]);
    await user.type(trickInputs[0], '2'); // Matches bid of 2
    await user.clear(trickInputs[1]);
    await user.type(trickInputs[1], '1'); // Matches bid of 1  
    await user.clear(trickInputs[2]);
    await user.type(trickInputs[2], '0'); // Matches bid of 0
    
    // Add bonus points
    const bonusInputs = screen.getAllByPlaceholderText('Enter bonus points');
    await user.clear(bonusInputs[0]);
    await user.type(bonusInputs[0], '10');
    
    const submitButton = screen.getByText('Save Tricks & Bonus');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith([
        { playerId: '1', actualTricks: 2, bonusPoints: 10, bidMet: true },
        { playerId: '2', actualTricks: 1, bonusPoints: 0, bidMet: true },
        { playerId: '3', actualTricks: 0, bonusPoints: 0, bidMet: true }
      ]);
    });
  });

  test('disables bonus points when bid is not met exactly', async () => {
    const user = userEvent.setup();
    render(<TrickBonusEntry {...defaultProps} />);
    
    // Enter trick count that doesn't match bid
    const trickInput = screen.getAllByPlaceholderText('Enter tricks taken')[0];
    await user.clear(trickInput);
    await user.type(trickInput, '1'); // Player 1 bid 2, so this doesn't match
    
    await waitFor(() => {
      expect(screen.getByText('Bid Missed')).toBeInTheDocument();
      expect(screen.getByText('Bonus points disabled - bid not met exactly')).toBeInTheDocument();
    });
    
    const bonusInput = screen.getAllByPlaceholderText('Enter bonus points')[0];
    expect(bonusInput).toBeDisabled();
  });

  test('shows bid met status correctly', async () => {
    const user = userEvent.setup();
    render(<TrickBonusEntry {...defaultProps} />);
    
    // Enter trick count that matches bid
    const trickInput = screen.getAllByPlaceholderText('Enter tricks taken')[0];
    await user.clear(trickInput);
    await user.type(trickInput, '2'); // Matches Player 1's bid of 2
    
    await waitFor(() => {
      expect(screen.getByText('Bid Met')).toBeInTheDocument();
    });
  });

  test('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnCancel = jest.fn();
    render(<TrickBonusEntry {...defaultProps} onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  test('prevents submission with missing trick data', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn();
    render(<TrickBonusEntry {...defaultProps} onSubmit={mockOnSubmit} />);
    
    // Leave one field empty
    const trickInputs = screen.getAllByPlaceholderText('Enter tricks taken');
    await user.clear(trickInputs[0]);
    await user.type(trickInputs[0], '2');
    await user.clear(trickInputs[1]);
    await user.type(trickInputs[1], '1');
    // Leave third input empty
    
    const submitButton = screen.getByText('Save Tricks & Bonus');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Tricks taken is required')).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('handles successful submission with valid data', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = jest.fn().mockResolvedValue();
    render(<TrickBonusEntry {...defaultProps} onSubmit={mockOnSubmit} />);
    
    // Enter valid trick counts that add up to hand count
    const trickInputs = screen.getAllByPlaceholderText('Enter tricks taken');
    await user.clear(trickInputs[0]);
    await user.type(trickInputs[0], '2');
    await user.clear(trickInputs[1]);
    await user.type(trickInputs[1], '1');
    await user.clear(trickInputs[2]);
    await user.type(trickInputs[2], '0');
    
    const submitButton = screen.getByText('Save Tricks & Bonus');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith([
        { playerId: '1', actualTricks: 2, bonusPoints: 0, bidMet: true },
        { playerId: '2', actualTricks: 1, bonusPoints: 0, bidMet: true },
        { playerId: '3', actualTricks: 0, bonusPoints: 0, bidMet: true }
      ]);
    });
  });
});