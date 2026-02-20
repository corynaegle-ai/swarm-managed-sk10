import { renderHook, act } from '@testing-library/react';
import { useTrickBonusEntry } from '../useTrickBonusEntry';

// Mock the service
jest.mock('../../services/trickBonusService', () => ({
  TrickBonusService: {
    validateSubmissionData: jest.fn(),
    updatePlayerRoundScores: jest.fn(),
    formatForSubmission: jest.fn(),
    isDataComplete: jest.fn(),
    calculateRoundScore: jest.fn()
  }
}));

import { TrickBonusService } from '../../services/trickBonusService';

describe('useTrickBonusEntry', () => {
  const mockPlayers = [
    { id: '1', name: 'Player 1' },
    { id: '2', name: 'Player 2' }
  ];

  const mockPlayerRoundScores = [
    { playerId: '1', bid: 2, actualTricks: null, bonusPoints: 0 },
    { playerId: '2', bid: 1, actualTricks: null, bonusPoints: 0 }
  ];

  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with correct default state', () => {
    const { result } = renderHook(() => 
      useTrickBonusEntry(mockPlayers, mockPlayerRoundScores, 3, mockOnUpdate)
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.errors).toEqual([]);
    expect(result.current.lastSubmission).toBeNull();
  });

  test('successfully submits valid data', async () => {
    const mockSubmissionData = [
      { playerId: '1', actualTricks: 2, bonusPoints: 5, bidMet: true }
    ];

    const mockUpdatedScores = [
      { playerId: '1', bid: 2, actualTricks: 2, bonusPoints: 5, roundScore: 45 }
    ];

    const mockFormattedData = {
      timestamp: '2024-01-01T00:00:00.000Z',
      playerUpdates: mockSubmissionData
    };

    TrickBonusService.validateSubmissionData.mockReturnValue({
      isValid: true,
      errors: []
    });
    TrickBonusService.updatePlayerRoundScores.mockReturnValue(mockUpdatedScores);
    TrickBonusService.formatForSubmission.mockReturnValue(mockFormattedData);
    mockOnUpdate.mockResolvedValue();

    const { result } = renderHook(() => 
      useTrickBonusEntry(mockPlayers, mockPlayerRoundScores, 3, mockOnUpdate)
    );

    let success;
    await act(async () => {
      success = await result.current.submitTrickAndBonus(mockSubmissionData);
    });

    expect(success).toBe(true);
    expect(TrickBonusService.validateSubmissionData).toHaveBeenCalledWith(mockSubmissionData, 3);
    expect(TrickBonusService.updatePlayerRoundScores).toHaveBeenCalledWith(mockPlayerRoundScores, mockSubmissionData);
    expect(mockOnUpdate).toHaveBeenCalledWith(mockUpdatedScores, mockFormattedData);
    expect(result.current.lastSubmission).toEqual(mockFormattedData);
  });

  test('handles validation errors', async () => {
    const mockSubmissionData = [
      { playerId: '1', actualTricks: -1, bonusPoints: 0, bidMet: false }
    ];

    TrickBonusService.validateSubmissionData.mockReturnValue({
      isValid: false,
      errors: ['Player 1: Tricks cannot be negative']
    });

    const { result } = renderHook(() => 
      useTrickBonusEntry(mockPlayers, mockPlayerRoundScores, 3, mockOnUpdate)
    );

    let success;
    await act(async () => {
      success = await result.current.submitTrickAndBonus(mockSubmissionData);
    });

    expect(success).toBe(false);
    expect(result.current.errors).toEqual(['Player 1: Tricks cannot be negative']);
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  test('handles submission errors', async () => {
    const mockSubmissionData = [
      { playerId: '1', actualTricks: 2, bonusPoints: 5, bidMet: true }
    ];

    TrickBonusService.validateSubmissionData.mockReturnValue({
      isValid: true,
      errors: []
    });
    TrickBonusService.updatePlayerRoundScores.mockReturnValue([]);
    TrickBonusService.formatForSubmission.mockReturnValue({});
    mockOnUpdate.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => 
      useTrickBonusEntry(mockPlayers, mockPlayerRoundScores, 3, mockOnUpdate)
    );

    let success;
    await act(async () => {
      success = await result.current.submitTrickAndBonus(mockSubmissionData);
    });

    expect(success).toBe(false);
    expect(result.current.errors).toEqual(['Submission failed: Network error']);
  });

  test('validates trick data correctly', () => {
    TrickBonusService.validateSubmissionData.mockReturnValue({
      isValid: true,
      errors: []
    });

    const { result } = renderHook(() => 
      useTrickBonusEntry(mockPlayers, mockPlayerRoundScores, 3, mockOnUpdate)
    );

    const trickData = { '1': '2', '2': '1' };
    const validation = result.current.validateTrickData(trickData);

    expect(TrickBonusService.validateSubmissionData).toHaveBeenCalled();
    expect(validation.isValid).toBe(true);
  });

  test('gets completion status correctly', () => {
    TrickBonusService.isDataComplete.mockReturnValue(true);

    const { result } = renderHook(() => 
      useTrickBonusEntry(mockPlayers, mockPlayerRoundScores, 3, mockOnUpdate)
    );

    const trickData = { '1': '2', '2': '1' };
    const status = result.current.getCompletionStatus(trickData);

    expect(status.isComplete).toBe(true);
    expect(status.totalTricks).toBe(3);
    expect(status.playersWithData).toBe(2);
    expect(status.totalPlayers).toBe(2);
    expect(status.tricksRemaining).toBe(0);
  });

  test('calculates preview scores correctly', () => {
    TrickBonusService.calculateRoundScore.mockReturnValue(45);

    const { result } = renderHook(() => 
      useTrickBonusEntry(mockPlayers, mockPlayerRoundScores, 3, mockOnUpdate)
    );

    const trickData = { '1': '2', '2': '1' };
    const bonusData = { '1': '5', '2': '0' };
    const previews = result.current.calculatePreviewScores(trickData, bonusData);

    expect(previews).toHaveLength(2);
    expect(previews[0]).toEqual({
      playerId: '1',
      playerName: 'Player 1',
      previewScore: 45,
      bidMet: true,
      actualTricks: 2,
      bonusPoints: 5,
      bid: 2
    });
  });

  test('clears errors correctly', () => {
    const { result } = renderHook(() => 
      useTrickBonusEntry(mockPlayers, mockPlayerRoundScores, 3, mockOnUpdate)
    );

    // Set some errors first
    act(() => {
      result.current.errors.push('Test error');
    });

    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.errors).toEqual([]);
  });

  test('sets loading state during submission', async () => {
    const mockSubmissionData = [
      { playerId: '1', actualTricks: 2, bonusPoints: 5, bidMet: true }
    ];

    TrickBonusService.validateSubmissionData.mockReturnValue({
      isValid: true,
      errors: []
    });
    TrickBonusService.updatePlayerRoundScores.mockReturnValue([]);
    TrickBonusService.formatForSubmission.mockReturnValue({});
    
    // Make onUpdate take some time
    mockOnUpdate.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    const { result } = renderHook(() => 
      useTrickBonusEntry(mockPlayers, mockPlayerRoundScores, 3, mockOnUpdate)
    );

    const submitPromise = act(async () => {
      return result.current.submitTrickAndBonus(mockSubmissionData);
    });

    expect(result.current.isLoading).toBe(true);
    
    await submitPromise;
    
    expect(result.current.isLoading).toBe(false);
  });
});