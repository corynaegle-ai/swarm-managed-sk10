/**
 * Test suite for Round class
 */

// Import the Round class
let Round;
if (typeof require !== 'undefined') {
  Round = require('../js/round.js');
} else {
  // For ES modules in browser
  import RoundClass from '../js/round.js';
  Round = RoundClass;
}

// Test utilities
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
  console.log(`✓ ${message}`);
}

function assertTrue(condition, message) {
  if (!condition) {
    throw new Error(`${message}: expected true, got ${condition}`);
  }
  console.log(`✓ ${message}`);
}

function assertFalse(condition, message) {
  if (condition) {
    throw new Error(`${message}: expected false, got ${condition}`);
  }
  console.log(`✓ ${message}`);
}

// Run tests
function runTests() {
  console.log('Running Round class tests...');

  // Test 1: Round class tracks current round number (1-10)
  const round1 = new Round();
  assertEqual(round1.getCurrentRound(), 1, 'Default round should be 1');
  
  const round5 = new Round(5);
  assertEqual(round5.getCurrentRound(), 5, 'Custom starting round should work');

  // Test 2: handsInRound property equals current round number
  assertEqual(round1.handsInRound, 1, 'Hands in round 1 should be 1');
  assertEqual(round5.handsInRound, 5, 'Hands in round 5 should be 5');
  assertEqual(round1.getHandsInCurrentRound(), 1, 'getHandsInCurrentRound() should return 1 for round 1');

  // Test 3: advanceToNextRound() progresses to next round
  assertTrue(round1.advanceToNextRound(), 'Should advance from round 1');
  assertEqual(round1.getCurrentRound(), 2, 'Should be round 2 after advance');
  assertEqual(round1.handsInRound, 2, 'Hands should be 2 in round 2');

  // Test 4: isGameComplete() returns true after round 10
  const round10 = new Round(10);
  assertFalse(round10.isGameComplete(), 'Game should not be complete at round 10');
  assertFalse(round10.advanceToNextRound(), 'Should not be able to advance beyond round 10');
  
  // Force game to completion state
  round10.currentRound = 11;
  assertTrue(round10.isGameComplete(), 'Game should be complete after round 10');

  // Test 5: getCurrentRound() and getHandsInCurrentRound() return current values
  const testRound = new Round(3);
  assertEqual(testRound.getCurrentRound(), 3, 'getCurrentRound() should return 3');
  assertEqual(testRound.getHandsInCurrentRound(), 3, 'getHandsInCurrentRound() should return 3');

  // Test edge cases
  try {
    new Round(0);
    throw new Error('Should throw error for round 0');
  } catch (e) {
    console.log('✓ Constructor throws error for invalid round 0');
  }

  try {
    new Round(11);
    throw new Error('Should throw error for round 11');
  } catch (e) {
    console.log('✓ Constructor throws error for invalid round 11');
  }

  console.log('All tests passed!');
}

// Run tests if this file is executed directly
if (typeof window === 'undefined' && typeof require !== 'undefined') {
  runTests();
}

// Export for browser usage
if (typeof window !== 'undefined') {
  window.runRoundTests = runTests;
}