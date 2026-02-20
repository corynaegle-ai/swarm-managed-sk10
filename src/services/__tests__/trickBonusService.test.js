import { TrickBonusService } from '../trickBonusService';

describe('TrickBonusService', () => {
  describe('validateSubmissionData', () => {
    test('validates correct submission data', () => {
      const submissionData = [
        { playerId: '1', actualTricks: 2, bonusPoints: 5 },
        { playerId: '2', actualTricks: 1, bonusPoints: 0 },
        { playerId: '3', actualTricks: 0, bonusPoints: 0 }
      ];
      
      const result = TrickBonusService.validateSubmissionData(submissionData, 3);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.totalTricks).toBe(3);
    });

    test('rejects negative trick counts', () => {
      const submissionData = [
        { playerId: '1', actualTricks: -1, bonusPoints: 0 }
      ];
      
      const result = TrickBonusService.validateSubmissionData(submissionData, 3);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Player 1: Tricks cannot be negative');
    });

    test('rejects tricks exceeding hand count', () => {
      const submissionData = [
        { playerId: '1', actualTricks: 5, bonusPoints: 0 }
      ];
      
      const result = TrickBonusService.validateSubmissionData(submissionData, 3);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Player 1: Tricks cannot exceed hand count (3)');
    });

    test('rejects when total tricks do not equal hand count', () => {
      const submissionData = [
        { playerId: '1', actualTricks: 1, bonusPoints: 0 },
        { playerId: '2', actualTricks: 1, bonusPoints: 0 }
      ];
      
      const result = TrickBonusService.validateSubmissionData(submissionData, 3);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Total tricks (2) must equal hand count (3)');
    });

    test('rejects missing player IDs', () => {
      const submissionData = [
        { playerId: '', actualTricks: 1, bonusPoints: 0 }
      ];
      
      const result = TrickBonusService.validateSubmissionData(submissionData, 1);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Player 1: Missing player ID');
    });

    test('rejects invalid trick counts', () => {
      const submissionData = [
        { playerId: '1', actualTricks: 'invalid', bonusPoints: 0 }
      ];
      
      const result = TrickBonusService.validateSubmissionData(submissionData, 1);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Player 1: Invalid tricks count');
    });

    test('rejects invalid bonus points', () => {
      const submissionData = [
        { playerId: '1', actualTricks: 1, bonusPoints: 'invalid' }
      ];
      
      const result = TrickBonusService.validateSubmissionData(submissionData, 1);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Player 1: Invalid bonus points');
    });
  });

  describe('updatePlayerRoundScores', () => {
    test('updates player round scores with trick and bonus data', () => {
      const playerRoundScores = [
        { playerId: '1', bid: 2, actualTricks: null, bonusPoints: 0, roundScore: 0 },
        { playerId: '2', bid: 1, actualTricks: null, bonusPoints: 0, roundScore: 0 }
      ];
      
      const submissionData = [
        { playerId: '1', actualTricks: 2, bonusPoints: 10, bidMet: true },
        { playerId: '2', actualTricks: 0, bonusPoints: 5, bidMet: false }
      ];
      
      const result = TrickBonusService.updatePlayerRoundScores(playerRoundScores, submissionData);
      
      expect(result[0].actualTricks).toBe(2);
      expect(result[0].bonusPoints).toBe(10); // Bonus applied because bid met
      expect(result[0].bidMet).toBe(true);
      expect(result[0].roundScore).toBe(50); // 20 + (10 * 2) + 10
      
      expect(result[1].actualTricks).toBe(0);
      expect(result[1].bonusPoints).toBe(0); // Bonus not applied because bid not met
      expect(result[1].bidMet).toBe(false);
      expect(result[1].roundScore).toBe(-10); // -10 * |1 - 0|
    });

    test('does not mutate original array', () => {
      const playerRoundScores = [
        { playerId: '1', bid: 2, actualTricks: null, bonusPoints: 0 }
      ];
      
      const submissionData = [
        { playerId: '1', actualTricks: 2, bonusPoints: 5, bidMet: true }
      ];
      
      const result = TrickBonusService.updatePlayerRoundScores(playerRoundScores, submissionData);
      
      expect(result).not.toBe(playerRoundScores);
      expect(playerRoundScores[0].actualTricks).toBe(null); // Original unchanged
    });
  });

  describe('calculateRoundScore', () => {
    test('calculates score when bid is met exactly', () => {
      const score = TrickBonusService.calculateRoundScore(2, 2, 10);
      expect(score).toBe(50); // 20 + (10 * 2) + 10
    });

    test('calculates score when bid is missed', () => {
      const score = TrickBonusService.calculateRoundScore(2, 0, 10);
      expect(score).toBe(-20); // -10 * |2 - 0|, bonus ignored
    });

    test('calculates score for zero bid met exactly', () => {
      const score = TrickBonusService.calculateRoundScore(0, 0, 5);
      expect(score).toBe(25); // 20 + (10 * 0) + 5
    });

    test('calculates penalty for overbid', () => {
      const score = TrickBonusService.calculateRoundScore(1, 3, 0);
      expect(score).toBe(-20); // -10 * |1 - 3|
    });

    test('calculates penalty for underbid', () => {
      const score = TrickBonusService.calculateRoundScore(3, 1, 0);
      expect(score).toBe(-20); // -10 * |3 - 1|
    });
  });

  describe('isDataComplete', () => {
    const players = [
      { id: '1', name: 'Player 1' },
      { id: '2', name: 'Player 2' }
    ];

    test('returns true when all players have valid trick data', () => {
      const trickData = { '1': '2', '2': '1' };
      const result = TrickBonusService.isDataComplete(players, trickData);
      expect(result).toBe(true);
    });

    test('returns false when some players missing trick data', () => {
      const trickData = { '1': '2' }; // Missing player 2
      const result = TrickBonusService.isDataComplete(players, trickData);
      expect(result).toBe(false);
    });

    test('returns false when trick data is empty string', () => {
      const trickData = { '1': '2', '2': '' };
      const result = TrickBonusService.isDataComplete(players, trickData);
      expect(result).toBe(false);
    });

    test('returns false when trick data is not a number', () => {
      const trickData = { '1': '2', '2': 'invalid' };
      const result = TrickBonusService.isDataComplete(players, trickData);
      expect(result).toBe(false);
    });
  });

  describe('formatForSubmission', () => {
    test('formats submission data with timestamp and metadata', () => {
      const submissionData = [
        { playerId: '1', actualTricks: 2, bonusPoints: 5, bidMet: true }
      ];
      
      const result = TrickBonusService.formatForSubmission(submissionData);
      
      expect(result).toHaveProperty('timestamp');
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(result.playerUpdates).toHaveLength(1);
      expect(result.playerUpdates[0]).toEqual({
        playerId: '1',
        actualTricks: 2,
        bonusPoints: 5,
        bidMet: true,
        updatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      });
    });
  });
});