import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BidCollection from '../BidCollection';

const players = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];
const handCount = 3;

const mockOnBidsCollected = jest.fn();

describe('BidCollection', () => {
  test('renders bid inputs for each player', () => {
    render(<BidCollection players={players} handCount={handCount} onBidsCollected={mockOnBidsCollected} />);
    expect(screen.getByLabelText('Alice:')).toBeInTheDocument();
    expect(screen.getByLabelText('Bob:')).toBeInTheDocument();
  });

  test('validates bids within range', () => {
    render(<BidCollection players={players} handCount={handCount} onBidsCollected={mockOnBidsCollected} />);
    const input = screen.getByLabelText('Alice:');
    fireEvent.change(input, { target: { value: '4' } });
    expect(screen.getByText('Bid must be between 0 and 3')).toBeInTheDocument();
  });

  test('displays confirmation when all bids are valid', () => {
    render(<BidCollection players={players} handCount={handCount} onBidsCollected={mockOnBidsCollected} />);
    fireEvent.change(screen.getByLabelText('Alice:'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Bob:'), { target: { value: '1' } });
    expect(screen.getByText('Bid Confirmation')).toBeInTheDocument();
    expect(screen.getByText('Alice: 2')).toBeInTheDocument();
    expect(screen.getByText('Bob: 1')).toBeInTheDocument();
  });

  test('button is disabled until all bids collected', () => {
    render(<BidCollection players={players} handCount={handCount} onBidsCollected={mockOnBidsCollected} />);
    const button = screen.getByText('Proceed to Round');
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Alice:'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Bob:'), { target: { value: '1' } });
    expect(button).not.toBeDisabled();
  });

  test('calls onBidsCollected with bids on submit', () => {
    render(<BidCollection players={players} handCount={handCount} onBidsCollected={mockOnBidsCollected} />);
    fireEvent.change(screen.getByLabelText('Alice:'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Bob:'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('Proceed to Round'));
    expect(mockOnBidsCollected).toHaveBeenCalledWith({ 1: 2, 2: 1 });
  });
});
