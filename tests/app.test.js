/**
 * Basic tests for App functionality
 */
import App from '../js/app.js';

describe('App', () => {
  let app;
  
  beforeEach(() => {
    // Mock DOM elements
    document.body.innerHTML = `
      <div id="player-setup">
        <form id="player-form">
          <input id="player-name" type="text">
          <button id="add-player-btn" type="submit">Add Player</button>
        </form>
        <div id="error-container"></div>
      </div>
      <div id="player-list">
        <div id="players-grid"></div>
        <div id="player-count">Players: 0</div>
        <button id="start-game-btn" disabled>Start Game</button>
      </div>
      <div id="game-interface" class="hidden">
        <button id="back-to-setup-btn">Back to Setup</button>
      </div>
    `;
    
    app = new App();
  });
  
  test('should initialize successfully', () => {
    expect(app).toBeDefined();
    expect(app.playerManager).toBeDefined();
    expect(app.ui).toBeDefined();
  });
  
  test('should add player successfully', () => {
    const playerNameInput = document.getElementById('player-name');
    playerNameInput.value = 'Test Player';
    
    const form = document.getElementById('player-form');
    const submitEvent = new Event('submit');
    form.dispatchEvent(submitEvent);
    
    expect(app.playerManager.getPlayerCount()).toBe(1);
  });
  
  test('should enable start game button with 2+ players', () => {
    // Add two players
    app.playerManager.addPlayer('Player 1');
    app.playerManager.addPlayer('Player 2');
    
    const startGameBtn = document.getElementById('start-game-btn');
    expect(startGameBtn.disabled).toBe(false);
  });
});