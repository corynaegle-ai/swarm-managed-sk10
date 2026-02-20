/**
 * Test suite for game-state.js
 */

// Import the game state module
const {
  createPlayerRoundScore,
  storeBids,
  getCurrentRoundScores,
  updatePlayerTricksWon,
  calculatePlayerScore,
  nextRound,
  resetGame
} = require('../js/game-state.js');

// Test helper function
function assertEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// Reset game state before each test
function setup() {
  resetGame();
}

// Test createPlayerRoundScore function
function testCreatePlayerRoundScore() {
  setup();
  
  const playerScore = createPlayerRoundScore('player1', 'Alice', 3);
  
  assertEqual(playerScore.playerId, 'player1', 'Player ID should match');
  assertEqual(playerScore.playerName, 'Alice', 'Player name should match');
  assertEqual(playerScore.bid, 3, 'Bid should match');
  assertEqual(playerScore.tricksWon, 0, 'TricksWon should initialize to 0');
  assertEqual(playerScore.score, 0, 'Score should initialize to 0');
  
  console.log('✓ createPlayerRoundScore test passed');
}

// Test storeBids function
function testStoreBids() {
  setup();
  
  const playerBids = [
    { playerId: 'player1', playerName: 'Alice', bid: 2 },
    { playerId: 'player2', playerName: 'Bob', bid: 1 },
    { playerId: 'player3', playerName: 'Charlie', bid: 3 }
  ];
  
  storeBids(playerBids);
  
  const roundScores = getCurrentRoundScores();
  assertEqual(roundScores.length, 3, 'Should have 3 player scores');
  assertEqual(roundScores[0].playerId, 'player1', 'First player should be player1');
  assertEqual(roundScores[1].bid, 1, 'Second player bid should be 1');
  
  console.log('✓ storeBids test passed');
}

// Test getCurrentRoundScores function
function testGetCurrentRoundScores() {
  setup();
  
  // Test empty case
  let scores = getCurrentRoundScores();
  assertEqual(scores.length, 0, 'Should return empty array when no data');
  
  // Test with data
  const playerBids = [
    { playerId: 'player1', playerName: 'Alice', bid: 2 }
  ];
  
  storeBids(playerBids);
  scores = getCurrentRoundScores();
  assertEqual(scores.length, 1, 'Should return 1 player score');
  assertEqual(scores[0].playerName, 'Alice', 'Player name should match');
  
  console.log('✓ getCurrentRoundScores test passed');
}

// Test PlayerRoundScore object structure
function testPlayerRoundScoreStructure() {
  setup();
  
  const playerBids = [
    { playerId: 'player1', playerName: 'Alice', bid: 2 }
  ];
  
  storeBids(playerBids);
  const scores = getCurrentRoundScores();
  const playerScore = scores[0];
  
  // Check all required properties exist
  if (!playerScore.hasOwnProperty('playerId')) {
    throw new Error('PlayerRoundScore missing playerId property');
  }
  if (!playerScore.hasOwnProperty('playerName')) {
    throw new Error('PlayerRoundScore missing playerName property');
  }
  if (!playerScore.hasOwnProperty('bid')) {
    throw new Error('PlayerRoundScore missing bid property');
  }
  if (!playerScore.hasOwnProperty('tricksWon')) {
    throw new Error('PlayerRoundScore missing tricksWon property');
  }
  if (!playerScore.hasOwnProperty('score')) {
    throw new Error('PlayerRoundScore missing score property');
  }
  
  console.log('✓ PlayerRoundScore structure test passed');
}

// Run all tests
function runTests() {
  try {
    testCreatePlayerRoundScore();
    testStoreBids();
    testGetCurrentRoundScores();
    testPlayerRoundScoreStructure();
    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };