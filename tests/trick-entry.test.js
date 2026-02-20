// Test suite for trick and bonus entry functionality

function runTests() {
    console.log('Running Trick Entry Tests...');
    
    // Test GameState validation
    testTrickValidation();
    testBonusPointLogic();
    testTotalTrickValidation();
    testPlayerRoundScoreCalculation();
    
    console.log('All tests completed!');
}

function testTrickValidation() {
    console.log('Testing trick validation...');
    
    const gameState = new GameState();
    gameState.addPlayer('p1', 'Alice');
    gameState.currentHandCount = 10;
    gameState.startNewRound();
    
    // Test valid tricks
    let errors = gameState.validateTrickEntry('p1', 5, 0);
    console.assert(errors.length === 0, 'Valid trick count should pass validation');
    
    // Test negative tricks
    errors = gameState.validateTrickEntry('p1', -1, 0);
    console.assert(errors.length > 0, 'Negative tricks should fail validation');
    
    // Test tricks exceeding hand count
    errors = gameState.validateTrickEntry('p1', 15, 0);
    console.assert(errors.length > 0, 'Tricks exceeding hand count should fail validation');
    
    // Test non-integer tricks
    errors = gameState.validateTrickEntry('p1', 5.5, 0);
    console.assert(errors.length > 0, 'Non-integer tricks should fail validation');
    
    console.log('✓ Trick validation tests passed');
}

function testBonusPointLogic() {
    console.log('Testing bonus point logic...');
    
    const playerScore = new PlayerRoundScore('p1', 4);
    
    // Test bid met exactly - bonus should count
    playerScore.updateTricksAndBonus(4, 10);
    console.assert(playerScore.bidMet === true, 'Bid should be marked as met when tricks equal bid');
    console.assert(playerScore.score === 50, 'Score should include bonus when bid is met (4*10 + 10 = 50)');
    
    // Test bid not met - bonus should not count
    playerScore.updateTricksAndBonus(3, 10);
    console.assert(playerScore.bidMet === false, 'Bid should be marked as not met when tricks differ from bid');
    console.assert(playerScore.score === -40, 'Score should be negative with no bonus when bid not met (-4*10 = -40)');
    
    // Test overbid - bonus should not count
    playerScore.updateTricksAndBonus(5, 10);
    console.assert(playerScore.bidMet === false, 'Overbid should be marked as bid not met');
    console.assert(playerScore.score === -40, 'Overbid should result in negative score with no bonus');
    
    console.log('✓ Bonus point logic tests passed');
}

function testTotalTrickValidation() {
    console.log('Testing total trick validation...');
    
    const gameState = new GameState();
    gameState.addPlayer('p1', 'Alice');
    gameState.addPlayer('p2', 'Bob');
    gameState.currentHandCount = 10;
    gameState.startNewRound();
    
    // Test valid total (tricks sum to hand count)
    const validEntries = new Map([
        ['p1', { actualTricks: 6, bonusPoints: 0 }],
        ['p2', { actualTricks: 4, bonusPoints: 0 }]
    ]);
    
    let errors = gameState.validateAllTrickEntries(validEntries);
    console.assert(errors.length === 0, 'Valid total tricks should pass validation');
    
    // Test invalid total (tricks don't sum to hand count)
    const invalidEntries = new Map([
        ['p1', { actualTricks: 6, bonusPoints: 0 }],
        ['p2', { actualTricks: 5, bonusPoints: 0 }]
    ]);
    
    errors = gameState.validateAllTrickEntries(invalidEntries);
    console.assert(errors.length > 0, 'Invalid total tricks should fail validation');
    console.assert(errors.some(e => e.includes('Total tricks')), 'Error should mention total tricks');
    
    console.log('✓ Total trick validation tests passed');
}

function testPlayerRoundScoreCalculation() {
    console.log('Testing PlayerRoundScore calculation...');
    
    // Test various scoring scenarios
    const scenarios = [
        { bid: 3, tricks: 3, bonus: 5, expectedScore: 35, expectedBidMet: true },
        { bid: 4, tricks: 2, bonus: 10, expectedScore: -40, expectedBidMet: false },
        { bid: 0, tricks: 0, bonus: 2, expectedScore: 2, expectedBidMet: true },
        { bid: 5, tricks: 6, bonus: 15, expectedScore: -50, expectedBidMet: false }
    ];
    
    scenarios.forEach((scenario, index) => {
        const playerScore = new PlayerRoundScore('p1', scenario.bid);
        playerScore.updateTricksAndBonus(scenario.tricks, scenario.bonus);
        
        console.assert(
            playerScore.score === scenario.expectedScore,
            `Scenario ${index + 1}: Expected score ${scenario.expectedScore}, got ${playerScore.score}`
        );
        
        console.assert(
            playerScore.bidMet === scenario.expectedBidMet,
            `Scenario ${index + 1}: Expected bidMet ${scenario.expectedBidMet}, got ${playerScore.bidMet}`
        );
    });
    
    console.log('✓ PlayerRoundScore calculation tests passed');
}

// Auto-run tests when this file is loaded in browser
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', runTests);
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runTests };
}