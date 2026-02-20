// Basic test to check functions exist and no syntax errors
describe('app.js functions', () => {
  test('initGameFlow is a function', () => {
    expect(typeof initGameFlow).toBe('function');
  });
  test('transitionPhase is a function', () => {
    expect(typeof transitionPhase).toBe('function');
  });
});