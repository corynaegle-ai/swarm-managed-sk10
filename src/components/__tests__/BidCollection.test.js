// Note: This test assumes @testing-library/jest-dom is installed and configured in package.json or setup files.
// If not, add it via npm install --save-dev @testing-library/jest-dom and import in test setup.
import { render, screen, fireEvent } from '@testing-library/react';
import BidCollection from '../BidCollection';

describe('BidCollection', () => {
  const mockPlayers = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];
  const mockOnBidsCollected = jest.fn();
  const currentHandCount = 3;

  it('renders bid inputs for each player', () => {
    render(<BidCollection players={mockPlayers} currentHandCount={currentHandCount} onBidsCollected={mockOnBidsCollected} />);
    expect(screen.getByLabelText("Alice's Bid (0 to 3):")).toBeInTheDocument();
    expect(screen.getByLabelText("Bob's Bid (0 to 3):")).toBeInTheDocument();
  });

  it('validates bids and shows errors', () => {
    render(<BidCollection players={mockPlayers} currentHandCount={currentHandCount} onBidsCollected={mockOnBidsCollected} />);
    const aliceInput = screen.getByLabelText("Alice's Bid (0 to 3):");
    fireEvent.change(aliceInput, { target: { value: '5' } });
    expect(screen.getByText('Bid must be a number between 0 and 3.')).toBeInTheDocument();
  });

  it('prevents submission if not all bids collected', () => {
    render(<BidCollection players={mockPlayers} currentHandCount={currentHandCount} onBidsCollected={mockOnBidsCollected} />);
    const button = screen.getByText('Confirm Bids');
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Alice's Bid (0 to 3):"), { target: { value: '1' } });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Bob's Bid (0 to 3):"), { target: { value: '2' } });
    expect(button).not.toBeDisabled();
  });

  it('displays confirmation when all bids collected', () => {
    render(<BidCollection players={mockPlayers} currentHandCount={currentHandCount} onBidsCollected={mockOnBidsCollected} />);
    fireEvent.change(screen.getByLabelText("Alice's Bid (0 to 3):"), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText("Bob's Bid (0 to 3):"), { target: { value: '2' } });
    expect(screen.getByText('Alice: 1')).toBeInTheDocument();
    expect(screen.getByText('Bob: 2')).toBeInTheDocument();
  });

  it('calls onBidsCollected on valid submission', () => {
    render(<BidCollection players={mockPlayers} currentHandCount={currentHandCount} onBidsCollected={mockOnBidsCollected} />);
    fireEvent.change(screen.getByLabelText("Alice's Bid (0 to 3):"), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText("Bob's Bid (0 to 3):"), { target: { value: '2' } });
    fireEvent.click(screen.getByText('Confirm Bids'));
    expect(mockOnBidsCollected).toHaveBeenCalledWith({ 1: 1, 2: 2 });
  });
});