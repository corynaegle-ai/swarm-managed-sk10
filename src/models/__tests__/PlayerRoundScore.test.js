import PlayerRoundScore from '../PlayerRoundScore';

describe('PlayerRoundScore', () => {
  test('creates PlayerRoundScore with valid bid', () => {
    const playerScore = new PlayerRoundScore(1, 'Test Player', 5);
    
    expect(playerScore.playerId).toBe(1);
    expect(playerScore.playerName).toBe('Test Player');
    expect(playerScore.bid).toBe(5);
    expect(playerScore.tricks).toBe(0);
    expect(playerScore.score).toBe(0);
  });

  test('throws error for negative bid', () => {
    expect(() => {
      new PlayerRoundScore(1, 'Test Player', -1);
    }).toThrow('Bid must be a non-negative integer');
  });

  test('throws error for non-numeric bid', () => {
    expect(() => {
      new PlayerRoundScore(1, 'Test Player', 'invalid');
    }).toThrow('Bid must be a non-negative integer');
  });

  test('validates bid limit correctly', () => {
    const playerScore = new PlayerRoundScore(1, 'Test Player', 8);
    
    expect(() => {
      playerScore.validateBidLimit(5);
    }).toThrow('Bid 8 cannot exceed 5 hands');

    expect(() => {
      playerScore.validateBidLimit(10);
    }).not.toThrow();
  });

  test('calculates score correctly when bid is made exactly', () => {
    const playerScore = new PlayerRoundScore(1, 'Test Player', 5);
    playerScore.setTricks(5);
    
    expect(playerScore.score).toBe(50); // 10 * 5
    expect(playerScore.madeBid()).toBe(true);
  });

  test('calculates score correctly when bid is exceeded', () => {
    const playerScore = new PlayerRoundScore(1, 'Test Player', 3);
    playerScore.setTricks(5);
    
    expect(playerScore.score).toBe(32); // 10 * 3 + 2
    expect(playerScore.madeBid()).toBe(true);
  });

  test('calculates score correctly when bid is missed', () => {
    const playerScore = new PlayerRoundScore(1, 'Test Player', 5);
    playerScore.setTricks(3);
    
    expect(playerScore.score).toBe(-50); // -(10 * 5)
    expect(playerScore.madeBid()).toBe(false);
  });

  test('validates all bids against hand limit', () => {
    const playerScores = [
      new PlayerRoundScore(1, 'Player 1', 3),
      new PlayerRoundScore(2, 'Player 2', 2),
      new PlayerRoundScore(3, 'Player 3', 7) // This exceeds limit
    ];

    expect(() => {
      PlayerRoundScore.validateAllBids(playerScores, 5);
    }).toThrow('Bid 7 cannot exceed 5 hands');
  });

  test('creates PlayerRoundScore from object', () => {
    const data = {
      playerId: 1,
      playerName: 'Test Player',
      bid: 4,
      tricks: 3,
      score: -40
    };

    const playerScore = PlayerRoundScore.fromObject(data);
    
    expect(playerScore.playerId).toBe(1);
    expect(playerScore.playerName).toBe('Test Player');
    expect(playerScore.bid).toBe(4);
    expect(playerScore.tricks).toBe(3);
  });

  test('returns correct summary', () => {
    const playerScore = new PlayerRoundScore(1, 'Test Player', 3);
    playerScore.setTricks(4);
    
    const summary = playerScore.getSummary();
    
    expect(summary).toEqual({
      playerId: 1,
      playerName: 'Test Player',
      bid: 3,
      tricks: 4,
      score: 31,
      madeBid: true,
      difference: 1
    });
  });
});