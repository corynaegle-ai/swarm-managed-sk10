import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Jest is automatically available in the test environment
// @testing-library/jest-dom extends Jest matchers
import BidCollection from '../BidCollection';

const mockPlayers = [
  { id: 1, name: 'Player 1' },
  { id: 2, name: 'Player 2' },
  { id: 3, name: 'Player 3' },
  { id: 4, name: 'Player 4' }
];

const mockOnBidsSubmitted = jest.fn();

describe('BidCollection', () => {
  beforeEach(() => {
    mockOnBidsSubmitted.mockClear();
  });

  test('renders bid collection form for all players', () => {
    render(
      <BidCollection 
        players={mockPlayers}
        currentHandCount={10}
        onBidsSubmitted={mockOnBidsSubmitted}
      />
    );

    expect(screen.getByText('Place Your Bids')).toBeInTheDocument();
    expect(screen.getByText('Current hand has 10 tricks available')).toBeInTheDocument();
    
    mockPlayers.forEach(player => {
      expect(screen.getByText(player.name + ':')).toBeInTheDocument();
    });
  });

  test('validates bid cannot exceed number of hands', async () => {
    render(
      <BidCollection 
        players={mockPlayers}
        currentHandCount={5}
        onBidsSubmitted={mockOnBidsSubmitted}
      />
    );

    const firstInput = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(firstInput, { target: { value: '6' } });

    await waitFor(() => {
      expect(screen.getByText('Bid cannot exceed 5 hands')).toBeInTheDocument();
    });
  });

  test('validates bid cannot be negative', async () => {
    render(
      <BidCollection 
        players={mockPlayers}
        currentHandCount={5}
        onBidsSubmitted={mockOnBidsSubmitted}
      />
    );

    const firstInput = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(firstInput, { target: { value: '-1' } });

    await waitFor(() => {
      expect(screen.getByText('Bid must be a number between 0 and 5')).toBeInTheDocument();
    });
  });

  test('prevents proceeding until all bids collected', () => {
    render(
      <BidCollection 
        players={mockPlayers}
        currentHandCount={5}
        onBidsSubmitted={mockOnBidsSubmitted}
      />
    );

    const submitButton = screen.getByText('Submit All Bids');
    expect(submitButton).toBeDisabled();

    // Fill in some but not all bids
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '2' } });
    fireEvent.change(inputs[1], { target: { value: '1' } });
    
    expect(submitButton).toBeDisabled();
  });

  test('enables submit when all valid bids are collected', () => {
    render(
      <BidCollection 
        players={mockPlayers}
        currentHandCount={5}
        onBidsSubmitted={mockOnBidsSubmitted}
      />
    );

    const inputs = screen.getAllByRole('spinbutton');
    const submitButton = screen.getByText('Submit All Bids');
    
    // Fill all bids with valid values
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: String(index + 1) } });
    });

    expect(submitButton).not.toBeDisabled();
  });

  test('displays bid confirmation screen', async () => {
    render(
      <BidCollection 
        players={mockPlayers}
        currentHandCount={5}
        onBidsSubmitted={mockOnBidsSubmitted}
      />
    );

    const inputs = screen.getAllByRole('spinbutton');
    const submitButton = screen.getByText('Submit All Bids');
    
    // Fill all bids
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: String(index + 1) } });
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm Bids')).toBeInTheDocument();
      expect(screen.getByText('Player 1:')).toBeInTheDocument();
      expect(screen.getByText('1 tricks')).toBeInTheDocument();
    });
  });

  test('calls onBidsSubmitted with PlayerRoundScore objects when confirmed', async () => {
    render(
      <BidCollection 
        players={mockPlayers}
        currentHandCount={5}
        onBidsSubmitted={mockOnBidsSubmitted}
      />
    );

    const inputs = screen.getAllByRole('spinbutton');
    
    // Fill all bids
    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: String(index + 1) } });
    });

    fireEvent.click(screen.getByText('Submit All Bids'));

    await waitFor(() => {
      expect(screen.getByText('Confirm Bids')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirm Bids'));

    expect(mockOnBidsSubmitted).toHaveBeenCalledWith([
      { playerId: 1, playerName: 'Player 1', bid: 1, tricks: 0, score: 0 },
      { playerId: 2, playerName: 'Player 2', bid: 2, tricks: 0, score: 0 },
      { playerId: 3, playerName: 'Player 3', bid: 3, tricks: 0, score: 0 },
      { playerId: 4, playerName: 'Player 4', bid: 4, tricks: 0, score: 0 }
    ]);
  });
});