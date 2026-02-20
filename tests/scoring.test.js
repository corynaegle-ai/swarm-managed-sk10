/**
 * Tests for scoring.js functions
 */

// Mock module loading for browser environment
if (typeof require === 'undefined') {
    var { validateTrickEntry, calculateBonusPoints, updatePlayerRoundScore } = window.ScoringUtils;
} else {
    var { validateTrickEntry, calculateBonusPoints, updatePlayerRoundScore } = require('../js/scoring.js');
}

// Test validateTrickEntry
console.log('Testing validateTrickEntry...');

// Test valid input
const validTricks = { 'player1': 2, 'player2': 1, 'player3': 0 };
const result1 = validateTrickEntry(validTricks, 3);
console.assert(result1.isValid === true, 'Valid tricks should pass validation');
console.assert(result1.errors.length === 0, 'Valid tricks should have no errors');

// Test invalid total
const invalidTotal = { 'player1': 2, 'player2': 2 };
const result2 = validateTrickEntry(invalidTotal, 3);
console.assert(result2.isValid === false, 'Invalid total should fail validation');
console.assert(result2.errors.some(e => e.includes('Total tricks')), 'Should report total mismatch');

// Test out of bounds
const outOfBounds = { 'player1': 5 };
const result3 = validateTrickEntry(outOfBounds, 3);
console.assert(result3.isValid === false, 'Out of bounds should fail validation');
console.assert(result3.errors.some(e => e.includes('cannot exceed')), 'Should report bounds error');

// Test calculateBonusPoints
console.log('Testing calculateBonusPoints...');

const player1 = { bid: 2 };
const bonus1 = calculateBonusPoints(player1, 2);
console.assert(bonus1 === 14, 'Exact bid match should earn bonus (10 + 2*2 = 14)');

const bonus2 = calculateBonusPoints(player1, 1);
console.assert(bonus2 === 0, 'Bid mismatch should earn no bonus');

// Test updatePlayerRoundScore
console.log('Testing updatePlayerRoundScore...');

const roundScore = updatePlayerRoundScore('player1', 3, 16);
console.assert(roundScore.playerId === 'player1', 'Should set correct player ID');
console.assert(roundScore.actualTricks === 3, 'Should set correct actual tricks');
console.assert(roundScore.bonusPoints === 16, 'Should set correct bonus points');
console.assert(roundScore.timestamp, 'Should include timestamp');

console.log('All tests passed!');