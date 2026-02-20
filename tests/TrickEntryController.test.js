const TrickEntryController = require('../src/controllers/TrickEntryController');
const TrickEntryService = require('../src/services/TrickEntryService');

jest.mock('../src/services/TrickEntryService');

describe('TrickEntryController', () => {
  let controller;
  let mockService;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockService = new TrickEntryService();
    controller = new TrickEntryController(mockService);
    
    mockReq = {
      body: {},
      params: {}
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('enterTricks', () => {
    it('should successfully enter tricks and bonus points', async () => {
      mockReq.body = {
        roundId: 'round1',
        playerId: 'player1',
        actualTricks: 3,
        bonusPoints: 10,
        handCount: 10
      };

      const mockEntry = {
        playerId: 'player1',
        actualTricks: 3,
        bonusPoints: 10
      };

      mockService.enterTricksAndBonus.mockReturnValue(mockEntry);

      await controller.enterTricks(mockReq, mockRes);

      expect(mockService.enterTricksAndBonus).toHaveBeenCalledWith(
        'round1', 'player1', 3, 10, 10
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Tricks and bonus entered successfully',
        entry: mockEntry
      });
    });

    it('should return 400 for missing required fields', async () => {
      mockReq.body = {
        roundId: 'round1'
        // Missing playerId, actualTricks, handCount
      };

      await controller.enterTricks(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required fields: roundId, playerId, actualTricks, handCount'
      });
    });

    it('should handle service errors', async () => {
      mockReq.body = {
        roundId: 'round1',
        playerId: 'player1',
        actualTricks: -1, // Invalid
        handCount: 10
      };

      mockService.enterTricksAndBonus.mockImplementation(() => {
        throw new Error('Actual tricks must be between 0 and 10');
      });

      await controller.enterTricks(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Actual tricks must be between 0 and 10'
      });
    });
  });

  describe('processRound', () => {
    it('should successfully process round entries', async () => {
      const mockPlayerRoundScores = [
        { playerId: 'player1', bid: 3 },
        { playerId: 'player2', bid: 2 }
      ];

      mockReq.body = {
        roundId: 'round1',
        playerRoundScores: mockPlayerRoundScores,
        handCount: 10
      };

      const mockResults = [
        { playerId: 'player1', actualTricks: 3, bonusPoints: 10 },
        { playerId: 'player2', actualTricks: 2, bonusPoints: 0 }
      ];

      mockService.processRoundEntries.mockReturnValue(mockResults);

      await controller.processRound(mockReq, mockRes);

      expect(mockService.processRoundEntries).toHaveBeenCalledWith(
        'round1', mockPlayerRoundScores, 10
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Round processed successfully',
        playerRoundScores: mockResults
      });
    });

    it('should return 400 for missing required fields', async () => {
      mockReq.body = {
        roundId: 'round1'
        // Missing playerRoundScores, handCount
      };

      await controller.processRound(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Missing required fields: roundId, playerRoundScores, handCount'
      });
    });
  });

  describe('getTrickEntry', () => {
    it('should return trick entry when found', async () => {
      mockReq.params = {
        roundId: 'round1',
        playerId: 'player1'
      };

      const mockEntry = {
        playerId: 'player1',
        actualTricks: 3,
        bonusPoints: 10
      };

      mockService.getTrickEntry.mockReturnValue(mockEntry);

      await controller.getTrickEntry(mockReq, mockRes);

      expect(mockService.getTrickEntry).toHaveBeenCalledWith('round1', 'player1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        entry: mockEntry
      });
    });

    it('should return 404 when entry not found', async () => {
      mockReq.params = {
        roundId: 'round1',
        playerId: 'player1'
      };

      mockService.getTrickEntry.mockReturnValue(null);

      await controller.getTrickEntry(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Trick entry not found'
      });
    });
  });
});