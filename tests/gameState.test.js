/**
 * Test suite for gameState.js
 * Tests all phase transitions and validation
 */

// Import or require the module based on environment
let GameState;
if (typeof require !== 'undefined') {
  GameState = require('../js/gameState.js');
} else {
  GameState = window.GameState;
}

// Test helper to reset state before each test
function resetGameState() {
  GameState.resetGame();
}

// Test 1: Initial state
console.log('Test 1: Initial state');
resetGameState();
const initialState = GameState.getGameState();
console.assert(initialState.currentRound === 1, 'Initial round should be 1');
console.assert(initialState.gamePhase === 'setup', 'Initial phase should be setup');
console.log('✓ Initial state test passed');

// Test 2: Valid phase transitions
console.log('\nTest 2: Valid phase transitions');
resetGameState();
GameState.startBidding(); // setup → bidding
console.assert(GameState.getGameState().gamePhase === 'bidding', 'Should transition to bidding');
GameState.startScoring(); // bidding → scoring
console.assert(GameState.getGameState().gamePhase === 'scoring', 'Should transition to scoring');
console.log('✓ Valid transitions test passed');

// Test 3: Invalid transitions throw errors
console.log('\nTest 3: Invalid transitions');
resetGameState();
try {
  GameState.startScoring(); // Invalid: setup → scoring
  console.assert(false, 'Should have thrown error');
} catch (e) {
  console.assert(e.message.includes('Cannot transition'), 'Should throw transition error');
}
console.log('✓ Invalid transitions test passed');

// Test 4: Round progression
console.log('\nTest 4: Round progression');
resetGameState();
GameState.startBidding();
GameState.startScoring();
GameState.nextRound();
const state = GameState.getGameState();
console.assert(state.currentRound === 2, 'Round should increment to 2');
console.assert(state.gamePhase === 'bidding', 'Phase should return to bidding');
console.log('✓ Round progression test passed');

// Test 5: Game completion after round 10
console.log('\nTest 5: Game completion');
resetGameState();
GameState.startBidding();
GameState.startScoring();
// Advance to round 10
for (let i = 1; i < 10; i++) {
  GameState.nextRound();
  GameState.startScoring();
}
// Try to advance past round 10
GameState.nextRound();
const finalState = GameState.getGameState();
console.assert(finalState.gamePhase === 'completed', 'Game should be completed after round 10');
console.log('✓ Game completion test passed');

console.log('\n✅ All tests passed!');