/**
 * Test suite for Skull King scoring engine
 * Uses console.assert for testing
 */

// Import the scoring functions
import { calculateRoundScore, calculateBonusPoints } from '../js/scoring.js';

console.log('Running Skull King Scoring Engine Tests...');

// Helper function for testing
function assertEqual(actual, expected, message) {
  console.assert(actual === expected, `${message}: expected ${expected}, got ${actual}`);
}

function assertThrows(fn, message) {
  try {
    fn();
    console.assert(false, `${message}: expected function to throw`);
  } catch (e) {
    console.assert(true, message);
  }
}

// Test calculateRoundScore
console.log('\nTesting calculateRoundScore...');

// Test zero bid scenarios
console.log('Testing correct zero bid scenarios...');
assertEqual(calculateRoundScore(0, 0, 1), 10, 'Correct zero bid with hand count 1');
assertEqual(calculateRoundScore(0, 0, 5), 50, 'Correct zero bid with hand count 5');
assertEqual(calculateRoundScore(0, 0, 10), 100, 'Correct zero bid with hand count 10');

console.log('Testing incorrect zero bid scenarios...');
assertEqual(calculateRoundScore(0, 1, 1), -10, 'Incorrect zero bid with 1 trick taken, hand count 1');
assertEqual(calculateRoundScore(0, 2, 5), -50, 'Incorrect zero bid with 2 tricks taken, hand count 5');
assertEqual(calculateRoundScore(0, 1, 10), -100, 'Incorrect zero bid with 1 trick taken, hand count 10');

// Test correct non-zero bids
console.log('Testing correct non-zero bid scenarios...');
assertEqual(calculateRoundScore(1, 1, 5), 20, 'Correct bid of 1 trick');
assertEqual(calculateRoundScore(3, 3, 5), 60, 'Correct bid of 3 tricks');
assertEqual(calculateRoundScore(5, 5, 10), 100, 'Correct bid of 5 tricks');

// Test incorrect non-zero bids
console.log('Testing incorrect non-zero bid scenarios...');
assertEqual(calculateRoundScore(2, 1, 5), -10, 'Bid 2, took 1 (difference of 1)');
assertEqual(calculateRoundScore(1, 3, 5), -20, 'Bid 1, took 3 (difference of 2)');
assertEqual(calculateRoundScore(5, 2, 10), -30, 'Bid 5, took 2 (difference of 3)');

// Test input validation
console.log('Testing input validation...');
assertThrows(() => calculateRoundScore(-1, 0, 5), 'Should throw for negative bid');
assertThrows(() => calculateRoundScore(1.5, 0, 5), 'Should throw for non-integer bid');
assertThrows(() => calculateRoundScore(1, -1, 5), 'Should throw for negative actual tricks');
assertThrows(() => calculateRoundScore(1, 0, 0), 'Should throw for hand count 0');
assertThrows(() => calculateRoundScore(1, 0, 11), 'Should throw for hand count > 10');

// Test calculateBonusPoints
console.log('\nTesting calculateBonusPoints...');

// Test that bonuses only apply when bid is correct
console.log('Testing bonuses only apply when bid is correct...');
const cards = [{ type: 'skull_king' }];
assertEqual(calculateBonusPoints(cards, 1, 2), 0, 'No bonus when bid is incorrect (1 vs 2)');
assertEqual(calculateBonusPoints(cards, 0, 1), 0, 'No bonus when zero bid is incorrect');

console.log('Testing bonus calculation when bid is correct...');
const skullKingCard = [{ type: 'skull_king' }];
const pirateCard = [{ type: 'pirate' }];
const mermaidCard = [{ type: 'mermaid' }];

assertEqual(calculateBonusPoints(skullKingCard, 1, 1), 30, 'Skull King bonus with correct bid');
assertEqual(calculateBonusPoints(pirateCard, 1, 1), 20, 'Pirate bonus with correct bid');
assertEqual(calculateBonusPoints(mermaidCard, 1, 1), 20, 'Mermaid bonus with correct bid');
assertEqual(calculateBonusPoints(skullKingCard, 0, 0), 30, 'Skull King bonus with correct zero bid');

console.log('Testing multiple special cards...');
const multipleCards = [
  { type: 'skull_king' },
  { type: 'pirate' },
  { type: 'mermaid' },
  { type: 'skull_king' }
];
assertEqual(calculateBonusPoints(multipleCards, 2, 2), 100, 'Multiple special cards: 2 skull kings + 1 pirate + 1 mermaid');

console.log('Testing alternative card formats...');
const altFormatCards = [
  { name: 'Skull King' },
  { suit: 'pirates' },
  { suit: 'mermaids' }
];
assertEqual(calculateBonusPoints(altFormatCards, 1, 1), 70, 'Alternative card format: name and suit properties');

console.log('Testing invalid cards handling...');
const mixedCards = [
  null,
  { type: 'skull_king' },
  'invalid',
  { type: 'pirate' }
];
assertEqual(calculateBonusPoints(mixedCards, 1, 1), 50, 'Mixed valid and invalid cards');

console.log('Testing bonus points input validation...');
assertThrows(() => calculateBonusPoints('not array', 1, 1), 'Should throw for non-array cards');
assertThrows(() => calculateBonusPoints([], -1, 1), 'Should throw for negative bid');
assertThrows(() => calculateBonusPoints([], 1, -1), 'Should throw for negative actual tricks');

console.log('\n✓ All tests completed!');