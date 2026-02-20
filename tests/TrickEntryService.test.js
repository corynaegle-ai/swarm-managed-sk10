const TrickEntryService = require('../src/services/TrickEntryService');
const TrickEntry = require('../src/models/TrickEntry');
const PlayerRoundScore = require('../src/models/PlayerRoundScore');

describe('TrickEntryService', () => {
  let service;

  beforeEach(() => {
    service = new TrickEntryService();
  });

  describe('enterTricksAndBonus', () => {
    it('should enter valid tricks and bonus points', () => {
      const entry = service.enterTricksAndBonus('round1', 'player1', 3, 10, 10);
      
      expect(entry.playerId).toBe('player1');
      expect(entry.actualTricks).toBe(3);
      expect(entry.bonusPoints).toBe(10);
    });

    it('should validate trick count within bounds (0 to hand count)', () => {
      expect(() => {
        service.enterTricksAndBonus('round1', 'player1', -1, 0, 10);
      }).toThrow('Actual tricks must be between 0 and 10');

      expect(() => {
        service.enterTricksAndBonus('round1', 'player1', 11, 0, 10);
      }).toThrow('Actual tricks must be between 0 and 10');
    });

    it('should accept tricks at boundary values', () => {
      expect(() => {
        service.enterTricksAndBonus('round1', 'player1', 0, 0, 10);
      }).not.toThrow();

      expect(() => {
        service.enterTricksAndBonus('round1', 'player2', 10, 0, 10);
      }).not.toThrow();
    });

    it('should validate bonus points are numeric', () => {
      expect(() => {
        service.enterTricksAndBonus('round1', 'player1', 3, 'invalid', 10);
      }).toThrow('Bonus points must be a number');
    });
  });

  describe('updatePlayerRoundScore', () => {
    it('should update PlayerRoundScore with actual tricks and bonus when bid met', () => {
      const mockPlayerRoundScore = {
        playerId: 'player1',
        bid: 3,
        actualTricks: 0,
        bonusPoints: 0,
        calculateScore: jest.fn()
      };

      const result = service.updatePlayerRoundScore(mockPlayerRoundScore, 3, 15, true);

      expect(result.actualTricks).toBe(3);
      expect(result.bonusPoints).toBe(15);
      expect(mockPlayerRoundScore.calculateScore).toHaveBeenCalled();
    });

    it('should set bonus points to 0 when bid not met exactly', () => {
      const mockPlayerRoundScore = {
        playerId: 'player1',
        bid: 3,
        actualTricks: 0,
        bonusPoints: 0,
        calculateScore: jest.fn()
      };

      const result = service.updatePlayerRoundScore(mockPlayerRoundScore, 2, 15, false);

      expect(result.actualTricks).toBe(2);
      expect(result.bonusPoints).toBe(0); // Bonus points only count if bid was met exactly
      expect(mockPlayerRoundScore.calculateScore).toHaveBeenCalled();
    });

    it('should throw error if PlayerRoundScore is null', () => {
      expect(() => {
        service.updatePlayerRoundScore(null, 3, 10, true);
      }).toThrow('PlayerRoundScore is required');
    });
  });

  describe('processRoundEntries', () => {
    it('should process all player entries for a round', () => {
      // Setup entries
      service.enterTricksAndBonus('round1', 'player1', 3, 10, 10);
      service.enterTricksAndBonus('round1', 'player2', 2, 5, 10);

      const mockPlayerRoundScores = [
        {
          playerId: 'player1',
          bid: 3,
          actualTricks: 0,
          bonusPoints: 0,
          calculateScore: jest.fn()
        },
        {
          playerId: 'player2',
          bid: 3,
          actualTricks: 0,
          bonusPoints: 0,
          calculateScore: jest.fn()
        }
      ];

      const results = service.processRoundEntries('round1', mockPlayerRoundScores, 10);

      expect(results).toHaveLength(2);
      expect(results[0].actualTricks).toBe(3);
      expect(results[0].bonusPoints).toBe(10); // Bid met exactly
      expect(results[1].actualTricks).toBe(2);
      expect(results[1].bonusPoints).toBe(0); // Bid not met exactly
    });

    it('should throw error if entry not found for player', () => {
      const mockPlayerRoundScores = [
        {
          playerId: 'player1',
          bid: 3
        }
      ];

      expect(() => {
        service.processRoundEntries('round1', mockPlayerRoundScores, 10);
      }).toThrow('No entry found for player player1 in round round1');
    });
  });

  describe('getTrickEntry', () => {
    it('should retrieve trick entry for player', () => {
      service.enterTricksAndBonus('round1', 'player1', 3, 10, 10);
      
      const entry = service.getTrickEntry('round1', 'player1');
      
      expect(entry.playerId).toBe('player1');
      expect(entry.actualTricks).toBe(3);
      expect(entry.bonusPoints).toBe(10);
    });

    it('should return undefined for non-existent entry', () => {
      const entry = service.getTrickEntry('round1', 'player1');
      expect(entry).toBeUndefined();
    });
  });

  describe('clearRoundEntries', () => {
    it('should clear all entries for a specific round', () => {
      service.enterTricksAndBonus('round1', 'player1', 3, 10, 10);
      service.enterTricksAndBonus('round1', 'player2', 2, 5, 10);
      service.enterTricksAndBonus('round2', 'player1', 4, 8, 10);

      service.clearRoundEntries('round1');

      expect(service.getTrickEntry('round1', 'player1')).toBeUndefined();
      expect(service.getTrickEntry('round1', 'player2')).toBeUndefined();
      expect(service.getTrickEntry('round2', 'player1')).toBeDefined();
    });
  });
});