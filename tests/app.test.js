import { handleTrickSubmission, extractFormData, updatePlayerScores, displayValidationErrors } from '../js/app.js';

// Mock DOM elements for testing
global.document = {
  getElementById: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(),
  createElement: jest.fn(),
  addEventListener: jest.fn()
};

// Mock scoring functions
jest.mock('../js/scoring.js', () => ({
  validateTrickEntry: jest.fn(),
  updatePlayerRoundScore: jest.fn()
}));

describe('App.js Main Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('form submission prevents default behavior', () => {
    const mockEvent = {
      preventDefault: jest.fn()
    };
    
    // Mock required DOM elements
    document.getElementById.mockReturnValue({ innerHTML: '', style: { display: 'none' } });
    document.querySelectorAll.mockReturnValue([]);
    
    handleTrickSubmission(mockEvent);
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  test('validation errors are displayed to user', () => {
    const mockErrorContainer = {
      innerHTML: '',
      style: { display: 'none' },
      appendChild: jest.fn()
    };
    
    document.getElementById.mockReturnValue(mockErrorContainer);
    document.createElement.mockReturnValue({
      className: '',
      textContent: '',
      appendChild: jest.fn()
    });
    
    const errors = ['Error 1', 'Error 2'];
    displayValidationErrors(errors);
    
    expect(mockErrorContainer.style.display).toBe('block');
  });

  test('form data extraction works correctly', () => {
    // Mock player inputs
    const mockInputs = [
      { value: '3' },
      { value: '2' }
    ];
    const mockCheckboxes = [
      { checked: true },
      { checked: false }
    ];
    
    document.querySelector.mockImplementation((selector) => {
      if (selector.includes('tricks-player')) {
        return mockInputs[0];
      }
      if (selector.includes('bonus-player')) {
        return mockCheckboxes[0];
      }
      return null;
    });
    
    // Mock game state
    const formData = extractFormData();
    
    expect(formData).toHaveProperty('round');
    expect(formData).toHaveProperty('players');
  });
});