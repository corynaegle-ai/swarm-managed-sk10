import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { App } from '../js/app.js';

// Mock the dependencies
vi.mock('../js/player-manager.js', () => ({
  PlayerManager: vi.fn().mockImplementation(() => ({
    addPlayer: vi.fn().mockResolvedValue({ success: true, player: { id: '1', name: 'Test Player' } }),
    removePlayer: vi.fn().mockResolvedValue({ success: true }),
    getPlayers: vi.fn().mockReturnValue([]),
    validatePlayerName: vi.fn().mockReturnValue({ isValid: true }),
    clearPlayers: vi.fn()
  }))
}));

vi.mock('../js/ui-components.js', () => ({
  UIComponents: vi.fn().mockImplementation(() => ({
    renderPlayerList: vi.fn().mockResolvedValue('<div>Player list</div>')
  }))
}));

describe('App', () => {
  let app;
  let mockDOM;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div class="container">
        <div class="player-setup">
          <form id="player-form">
            <input id="player-name" type="text" />
            <button id="add-player-btn" type="submit">Add Player</button>
          </form>
        </div>
        <div id="player-list"></div>
        <button id="start-game-btn">Start Game</button>
        <div id="player-count"></div>
      </div>
    `;
    
    app = new App();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully with proper DOM elements', async () => {
      await app.init();
      expect(app.isInitialized).toBe(true);
    });

    it('should show user error for missing DOM elements', async () => {
      document.getElementById('add-player-btn').remove();
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await expect(app.init()).rejects.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Player Management', () => {
    beforeEach(async () => {
      await app.init();
    });

    it('should handle player addition with loading state', async () => {
      const nameInput = document.getElementById('player-name');
      const addBtn = document.getElementById('add-player-btn');
      
      nameInput.value = 'Test Player';
      
      const addPromise = app.handlePlayerAdd();
      
      // Check loading state is applied
      expect(addBtn.classList.contains('loading')).toBe(true);
      expect(addBtn.disabled).toBe(true);
      
      await addPromise;
      
      // Check input is cleared
      expect(nameInput.value).toBe('');
    });

    it('should handle player removal', async () => {
      await app.handlePlayerRemove('test-id');
      expect(app.playerManager.removePlayer).toHaveBeenCalledWith('test-id');
    });

    it('should validate player names on input', () => {
      const nameInput = document.getElementById('player-name');
      nameInput.value = 'Test';
      
      const event = new Event('input', { bubbles: true });
      Object.defineProperty(event, 'target', { value: nameInput });
      
      app.handleInputValidation(event);
      expect(app.playerManager.validatePlayerName).toHaveBeenCalledWith('Test');
    });
  });

  describe('Game Control', () => {
    beforeEach(async () => {
      await app.init();
    });

    it('should update game controls based on player count', async () => {
      app.playerManager.getPlayers.mockReturnValue([
        { id: '1', name: 'Player 1' },
        { id: '2', name: 'Player 2' }
      ]);
      
      await app.updateGameControls();
      
      const startBtn = document.getElementById('start-game-btn');
      expect(startBtn.disabled).toBe(false);
    });

    it('should prevent game start with insufficient players', async () => {
      app.playerManager.getPlayers.mockReturnValue([{ id: '1', name: 'Player 1' }]);
      
      await app.handleGameStart();
      
      const errorContainer = document.getElementById('error-container');
      expect(errorContainer).toBeTruthy();
    });
  });

  describe('Transitions and Animations', () => {
    beforeEach(async () => {
      await app.init();
    });

    it('should have synchronized timing constants', () => {
      expect(app.TIMING.BUTTON_LOADING).toBe(400);
      expect(app.TIMING.SMOOTH_TRANSITION).toBe(400);
      expect(app.TIMING.FADE_ANIMATION).toBe(400);
    });

    it('should perform smooth transition to game', async () => {
      const setupSection = document.querySelector('.player-setup');
      
      await app.transitionToGame();
      
      expect(setupSection.classList.contains('section-exit')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should show user-friendly error messages', () => {
      app.showUserError('Test error message');
      
      const errorContainer = document.getElementById('error-container');
      expect(errorContainer).toBeTruthy();
      expect(errorContainer.innerHTML).toContain('Test error message');
    });

    it('should show success messages', () => {
      app.showSuccessMessage('Test success');
      
      const successContainer = document.getElementById('success-container');
      expect(successContainer).toBeTruthy();
      expect(successContainer.innerHTML).toContain('Test success');
    });
  });

  describe('State Management', () => {
    beforeEach(async () => {
      await app.init();
    });

    it('should return current state', () => {
      const state = app.getState();
      
      expect(state).toHaveProperty('isInitialized');
      expect(state).toHaveProperty('players');
      expect(state).toHaveProperty('canStartGame');
    });

    it('should reset application state', async () => {
      await app.reset();
      
      expect(app.playerManager.clearPlayers).toHaveBeenCalled();
      
      const nameInput = document.getElementById('player-name');
      expect(nameInput.value).toBe('');
    });
  });
});