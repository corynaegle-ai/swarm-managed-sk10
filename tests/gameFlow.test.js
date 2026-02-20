/**
 * Unit tests for gameFlow.js
 */

// Mock DOM elements
const mockDOM = () => {
  global.document = {
    getElementById: jest.fn(),
    createElement: jest.fn(),
    addEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
    body: {
      appendChild: jest.fn(),
      insertBefore: jest.fn(),
      firstChild: null
    },
    readyState: 'complete',
    querySelectorAll: jest.fn(() => [])
  };
  
  global.CustomEvent = jest.fn();
};

// Mock gameFlow module
let gameFlow;

beforeEach(() => {
  mockDOM();
  jest.resetModules();
  gameFlow = require('../js/gameFlow.js');
});

describe('GameFlow Phase Management', () => {
  test('should initialize with setup phase', () => {
    expect(gameFlow.getCurrentPhase()).toBe('setup');
  });
  
  test('should transition between phases correctly', () => {
    gameFlow.handlePhaseTransition('bidding');
    expect(gameFlow.getCurrentPhase()).toBe('bidding');
    
    gameFlow.handlePhaseTransition('scoring');
    expect(gameFlow.getCurrentPhase()).toBe('scoring');
    
    gameFlow.handlePhaseTransition('completed');
    expect(gameFlow.getCurrentPhase()).toBe('completed');
  });
  
  test('should render appropriate UI for each phase', () => {
    const mockElement = {
      classList: {
        add: jest.fn(),
        remove: jest.fn()
      }
    };
    
    document.getElementById.mockReturnValue(mockElement);
    
    gameFlow.renderPhaseUI('bidding');
    expect(document.getElementById).toHaveBeenCalledWith('bidding-container');
  });
});