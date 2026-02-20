import { SkullKingApp } from '../js/app.js';
import { PlayerManager } from '../js/playerManager.js';
import { UIComponents } from '../js/uiComponents.js';

// Mock dependencies
jest.mock('../js/playerManager.js');
jest.mock('../js/uiComponents.js');

describe('SkullKingApp', () => {
  let app;
  let mockPlayerManager;
  let mockUIComponents;
  
  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = `
      <div class="container">
        <form id="player-form">
          <input id="player-name" type="text" />
          <button id="add-player-btn" type="submit">Add Player</button>
        </form>
        <div id="players-list"></div>
        <button id="start-game-btn">Start Game</button>
        <div id="player-count">0 players ready</div>
      </div>
    `;
    
    // Mock implementations
    mockPlayerManager = {
      addPlayer: jest.fn(),
      removePlayer: jest.fn(),
      getPlayers: jest.fn(() => []),
      getPlayerCount: jest.fn(() => 0),
      findPlayerByName: jest.fn(),
      clearPlayers: jest.fn()
    };
    
    mockUIComponents = {
      renderPlayerList: jest.fn(() => '<div>Mock player list</div>')
    };
    
    PlayerManager.mockImplementation(() => mockPlayerManager);
    UIComponents.mockImplementation(() => mockUIComponents);
    
    app = new SkullKingApp();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });
  
  describe('Initialization', () => {
    test('should initialize with correct default state', () => {
      expect(app.gameStarted).toBe(false);
      expect(app.currentView).toBe('player-setup');
      expect(app.playerManager).toBeDefined();
      expect(app.uiComponents).toBeDefined();
    });
    
    test('should set up event listeners', () => {
      const form = document.getElementById('player-form');
      const startBtn = document.getElementById('start-game-btn');
      
      expect(form).toBeDefined();
      expect(startBtn).toBeDefined();
    });
  });
  
  describe('Player Management', () => {
    test('should add player with valid name', async () => {
      const mockPlayer = { id: '1', name: 'Alice' };
      mockPlayerManager.addPlayer.mockResolvedValue(mockPlayer);
      mockPlayerManager.findPlayerByName.mockReturnValue(null);
      
      const nameInput = document.getElementById('player-name');
      nameInput.value = 'Alice';
      
      const event = new Event('submit');
      await app.handleAddPlayer(event);
      
      expect(mockPlayerManager.addPlayer).toHaveBeenCalledWith('Alice');
      expect(nameInput.value).toBe('');
    });
    
    test('should reject invalid player names', async () => {
      const nameInput = document.getElementById('player-name');
      nameInput.value = 'A'; // Too short
      
      const event = new Event('submit');
      await app.handleAddPlayer(event);
      
      expect(mockPlayerManager.addPlayer).not.toHaveBeenCalled();
    });
    
    test('should reject duplicate player names', async () => {
      mockPlayerManager.findPlayerByName.mockReturnValue({ id: '1', name: 'Alice' });
      
      const nameInput = document.getElementById('player-name');
      nameInput.value = 'Alice';
      
      const event = new Event('submit');
      await app.handleAddPlayer(event);
      
      expect(mockPlayerManager.addPlayer).not.toHaveBeenCalled();
    });
    
    test('should remove player by ID', async () => {
      const mockPlayer = { id: '1', name: 'Alice' };
      mockPlayerManager.removePlayer.mockResolvedValue(mockPlayer);
      
      await app.handleRemovePlayer('1');
      
      expect(mockPlayerManager.removePlayer).toHaveBeenCalledWith('1');
    });
  });
  
  describe('Game Start', () => {
    test('should start game with valid player count', async () => {
      mockPlayerManager.getPlayers.mockReturnValue([
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' }
      ]);
      
      await app.handleStartGame();
      
      expect(app.gameStarted).toBe(true);
      expect(app.currentView).toBe('game');
    });
    
    test('should reject game start with insufficient players', async () => {
      mockPlayerManager.getPlayers.mockReturnValue([{ id: '1', name: 'Alice' }]);
      
      await app.handleStartGame();
      
      expect(app.gameStarted).toBe(false);
      expect(app.currentView).toBe('player-setup');
    });
    
    test('should reject game start with too many players', async () => {
      const players = Array.from({ length: 9 }, (_, i) => ({ id: `${i + 1}`, name: `Player${i + 1}` }));
      mockPlayerManager.getPlayers.mockReturnValue(players);
      
      await app.handleStartGame();
      
      expect(app.gameStarted).toBe(false);
      expect(app.currentView).toBe('player-setup');
    });
  });
  
  describe('UI Updates', () => {
    test('should update player list display', () => {
      const players = [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' }
      ];
      mockPlayerManager.getPlayers.mockReturnValue(players);
      
      app.updatePlayerList();
      
      expect(mockUIComponents.renderPlayerList).toHaveBeenCalledWith(players);
    });
    
    test('should update game controls based on player count', () => {
      mockPlayerManager.getPlayerCount.mockReturnValue(2);
      
      app.updateGameControls();
      
      const startBtn = document.getElementById('start-game-btn');
      expect(startBtn.disabled).toBe(false);
    });
    
    test('should disable start button with insufficient players', () => {
      mockPlayerManager.getPlayerCount.mockReturnValue(1);
      
      app.updateGameControls();
      
      const startBtn = document.getElementById('start-game-btn');
      expect(startBtn.disabled).toBe(true);
    });
  });
  
  describe('Input Validation', () => {
    test('should validate player names correctly', () => {
      expect(app.validatePlayerName('')).toBe(false);
      expect(app.validatePlayerName('A')).toBe(false);
      expect(app.validatePlayerName('A'.repeat(21))).toBe(false);
      
      mockPlayerManager.findPlayerByName.mockReturnValue(null);
      expect(app.validatePlayerName('Alice')).toBe(true);
    });
    
    test('should update add button state based on input', () => {
      const nameInput = document.getElementById('player-name');
      const addBtn = document.getElementById('add-player-btn');
      
      mockPlayerManager.findPlayerByName.mockReturnValue(null);
      
      nameInput.value = 'Al';
      app.validatePlayerInput();
      expect(addBtn.disabled).toBe(false);
      
      nameInput.value = 'A';
      app.validatePlayerInput();
      expect(addBtn.disabled).toBe(true);
    });
  });
  
  describe('Error Handling', () => {
    test('should display error messages', () => {
      app.showError('Test error message');
      
      const messageContainer = document.getElementById('message-container');
      expect(messageContainer.innerHTML).toContain('Test error message');
      expect(messageContainer.innerHTML).toContain('error-message');
    });
    
    test('should display success messages', () => {
      app.showSuccess('Test success message');
      
      const messageContainer = document.getElementById('message-container');
      expect(messageContainer.innerHTML).toContain('Test success message');
      expect(messageContainer.innerHTML).toContain('success-message');
    });
  });
  
  describe('Application State', () => {
    test('should return current state', () => {
      const mockPlayers = [{ id: '1', name: 'Alice' }];
      mockPlayerManager.getPlayers.mockReturnValue(mockPlayers);
      
      const state = app.getState();
      
      expect(state.players).toEqual(mockPlayers);
      expect(state.gameStarted).toBe(false);
      expect(state.currentView).toBe('player-setup');
    });
    
    test('should reset application state', () => {
      app.gameStarted = true;
      app.currentView = 'game';
      
      app.reset();
      
      expect(mockPlayerManager.clearPlayers).toHaveBeenCalled();
      expect(app.gameStarted).toBe(false);
      expect(app.currentView).toBe('player-setup');
    });
  });
});