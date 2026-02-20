/**
 * Tests for Trick Entry functionality
 */

// Mock DOM elements
document.body.innerHTML = `
    <div id="trick-entry-container"></div>
`;

// Test data
const mockRoundData = {
    roundNumber: 3,
    handCount: 5,
    trump: 'hearts',
    players: [
        { id: 'player1', name: 'Alice', bid: 2 },
        { id: 'player2', name: 'Bob', bid: 1 },
        { id: 'player3', name: 'Charlie', bid: 2 }
    ]
};

describe('TrickEntryManager', () => {
    let trickManager;
    let gameState;

    beforeEach(() => {
        gameState = new GameState();
        trickManager = new TrickEntryManager(gameState);
        trickManager.initializeTrickEntry(mockRoundData);
    });

    test('should initialize player scores correctly', () => {
        const playerScores = trickManager.getPlayerScores();
        expect(playerScores).toHaveLength(3);
        expect(playerScores[0].playerId).toBe('player1');
        expect(playerScores[0].bid).toBe(2);
        expect(playerScores[0].actualTricks).toBeNull();
    });

    test('should validate trick count within bounds', () => {
        expect(trickManager.validateTrickCount(0)).toBe(true);
        expect(trickManager.validateTrickCount(5)).toBe(true);
        expect(trickManager.validateTrickCount(-1)).toBe(false);
        expect(trickManager.validateTrickCount(6)).toBe(false);
        expect(trickManager.validateTrickCount(2.5)).toBe(false);
    });

    test('should set player tricks and update bid met status', () => {
        trickManager.setPlayerTricks('player1', 2);
        const playerScore = trickManager.playerScores.get('player1');
        
        expect(playerScore.actualTricks).toBe(2);
        expect(playerScore.bidMet).toBe(true);
    });

    test('should handle bid not met correctly', () => {
        trickManager.setPlayerTricks('player1', 1);
        const playerScore = trickManager.playerScores.get('player1');
        
        expect(playerScore.actualTricks).toBe(1);
        expect(playerScore.bidMet).toBe(false);
        expect(playerScore.bonusPoints).toBe(0);
    });

    test('should only allow bonus points when bid is met exactly', () => {
        // Bid met - bonus should be allowed
        trickManager.setPlayerTricks('player1', 2);
        trickManager.setPlayerBonus('player1', 5);
        expect(trickManager.playerScores.get('player1').bonusPoints).toBe(5);

        // Bid not met - bonus should be reset to 0
        trickManager.setPlayerTricks('player2', 2);
        trickManager.setPlayerBonus('player2', 3);
        expect(trickManager.playerScores.get('player2').bonusPoints).toBe(0);
    });

    test('should validate total tricks equals hand count', () => {
        trickManager.setPlayerTricks('player1', 2);
        trickManager.setPlayerTricks('player2', 1);
        trickManager.setPlayerTricks('player3', 2);

        expect(() => trickManager.validateTotalTricks()).not.toThrow();

        // Test invalid total
        trickManager.setPlayerTricks('player3', 3);
        expect(() => trickManager.validateTotalTricks()).toThrow('Total tricks (6) must equal hand count (5)');
    });

    test('should create proper PlayerRoundScore updates', () => {
        trickManager.setPlayerTricks('player1', 2); // Bid met
        trickManager.setPlayerBonus('player1', 3);
        trickManager.setPlayerTricks('player2', 2); // Bid not met
        trickManager.setPlayerTricks('player3', 1); // Bid not met

        const updates = trickManager.updatePlayerRoundScores();
        
        expect(updates).toHaveLength(3);
        
        const player1Update = updates.find(u => u.playerId === 'player1');
        expect(player1Update.bidMet).toBe(true);
        expect(player1Update.bonusPoints).toBe(3);
        expect(player1Update.baseScore).toBe(12); // 10 + bid of 2
        expect(player1Update.totalScore).toBe(15); // 12 + 3 bonus

        const player2Update = updates.find(u => u.playerId === 'player2');
        expect(player2Update.bidMet).toBe(false);
        expect(player2Update.bonusPoints).toBe(0);
        expect(player2Update.baseScore).toBe(-1); // penalty for missing by 1
    });
});

describe('ScoringUtils', () => {
    test('should calculate base score correctly', () => {
        expect(ScoringUtils.calculateBaseScore(2, 2)).toBe(12); // 10 + bid
        expect(ScoringUtils.calculateBaseScore(3, 1)).toBe(-2); // -|3-1|
        expect(ScoringUtils.calculateBaseScore(0, 1)).toBe(-1); // -|0-1|
    });

    test('should validate bonus application', () => {
        expect(ScoringUtils.validateBonusApplication(2, 2, 5)).toBe(true);
        expect(ScoringUtils.validateBonusApplication(2, 1, 5)).toBe(false);
        expect(ScoringUtils.validateBonusApplication(2, 3, 0)).toBe(true);
    });

    test('should create complete PlayerRoundScore', () => {
        const score = ScoringUtils.createPlayerRoundScore('player1', 1, 2, 2, 3);
        
        expect(score.playerId).toBe('player1');
        expect(score.bidMet).toBe(true);
        expect(score.bonusPoints).toBe(3);
        expect(score.baseScore).toBe(12);
        expect(score.totalScore).toBe(15);
    });

    test('should force bonus to 0 when bid not met', () => {
        const score = ScoringUtils.createPlayerRoundScore('player1', 1, 2, 1, 5);
        
        expect(score.bidMet).toBe(false);
        expect(score.bonusPoints).toBe(0); // Should be forced to 0
        expect(score.totalScore).toBe(-1); // Just the penalty
    });
});