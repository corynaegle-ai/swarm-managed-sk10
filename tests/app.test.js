// App integration tests
describe('App Integration', () => {
    let app;
    let mockGameState;
    let mockGameFlow;

    beforeEach(() => {
        // Setup DOM elements
        document.body.innerHTML = `
            <div id="setup-phase" class="game-phase active"></div>
            <div id="gameplay-phase" class="game-phase hidden"></div>
            <div id="completion-phase" class="game-phase hidden"></div>
            <button id="start-game-btn">Start Game</button>
            <button id="next-round-btn">Next Round</button>
            <button id="end-game-btn">End Game</button>
            <button id="new-game-btn">New Game</button>
            <div id="scoreboard" class="hidden"></div>
            <div id="final-results" class="hidden"></div>
            <div class="current-round">Round 1</div>
            <div class="game-phase">Setup</div>
        `;

        // Mock dependencies
        mockGameState = {
            getPlayers: jest.fn(() => ['player1', 'player2']),
            getCurrentRound: jest.fn(() => 1),
            reset: jest.fn(),
            exportResults: jest.fn(() => ({ results: 'test' }))
        };

        mockGameFlow = {
            getCurrentPhase: jest.fn(() => 'setup'),
            startGame: jest.fn(),
            nextRound: jest.fn(),
            endGame: jest.fn(),
            completeGame: jest.fn(),
            reset: jest.fn(),
            update: jest.fn()
        };

        global.GameState = jest.fn(() => mockGameState);
        global.GameFlow = jest.fn(() => mockGameFlow);

        app = new App();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        test('should initialize in setup phase', async () => {
            await app.initialize();
            expect(app.currentPhase).toBe('setup');
            expect(app.initialized).toBe(true);
        });

        test('should setup event listeners', async () => {
            const startBtn = document.getElementById('start-game-btn');
            const clickSpy = jest.spyOn(app, 'startGame');
            
            await app.initialize();
            startBtn.click();
            
            expect(clickSpy).toHaveBeenCalled();
        });
    });

    describe('Phase Transitions', () => {
        beforeEach(async () => {
            await app.initialize();
        });

        test('should transition from setup to gameplay', () => {
            app.transitionToPhase('gameplay');
            
            expect(app.currentPhase).toBe('gameplay');
            expect(document.getElementById('setup-phase').classList.contains('hidden')).toBe(true);
            expect(document.getElementById('gameplay-phase').classList.contains('active')).toBe(true);
        });

        test('should transition to completion after round 10', () => {
            mockGameState.getCurrentRound.mockReturnValue(11);
            app.currentPhase = 'gameplay';
            
            app.updateGameState();
            
            expect(app.currentPhase).toBe('completion');
        });

        test('should show final results on completion', () => {
            app.transitionToCompletion();
            
            expect(document.getElementById('final-results').classList.contains('hidden')).toBe(false);
            expect(mockGameFlow.completeGame).toHaveBeenCalled();
        });
    });

    describe('Game Controls', () => {
        beforeEach(async () => {
            await app.initialize();
        });

        test('should enable start button when players available', () => {
            app.updatePhaseControls();
            expect(document.getElementById('start-game-btn').disabled).toBe(false);
        });

        test('should disable start button with insufficient players', () => {
            mockGameState.getPlayers.mockReturnValue(['player1']);
            app.updatePhaseControls();
            expect(document.getElementById('start-game-btn').disabled).toBe(true);
        });

        test('should enable gameplay controls in gameplay phase', () => {
            app.currentPhase = 'gameplay';
            app.updatePhaseControls();
            
            expect(document.getElementById('next-round-btn').disabled).toBe(false);
            expect(document.getElementById('end-game-btn').disabled).toBe(false);
        });

        test('should enable completion controls in completion phase', () => {
            app.currentPhase = 'completion';
            app.updatePhaseControls();
            
            expect(document.getElementById('new-game-btn').disabled).toBe(false);
        });
    });

    describe('Game Flow', () => {
        beforeEach(async () => {
            await app.initialize();
        });

        test('should start game and show scoreboard', () => {
            app.startGame();
            
            expect(mockGameFlow.startGame).toHaveBeenCalled();
            expect(document.getElementById('scoreboard').classList.contains('hidden')).toBe(false);
        });

        test('should advance rounds', () => {
            app.nextRound();
            expect(mockGameFlow.nextRound).toHaveBeenCalled();
        });

        test('should handle game completion', () => {
            app.endGame();
            expect(mockGameFlow.endGame).toHaveBeenCalled();
        });

        test('should reset for new game', () => {
            app.newGame();
            
            expect(mockGameState.reset).toHaveBeenCalled();
            expect(mockGameFlow.reset).toHaveBeenCalled();
            expect(app.currentPhase).toBe('setup');
        });
    });

    describe('UI Updates', () => {
        beforeEach(async () => {
            await app.initialize();
        });

        test('should update scoreboard display', () => {
            mockGameState.getCurrentRound.mockReturnValue(5);
            app.currentPhase = 'gameplay';
            
            app.updateScoreboard();
            
            expect(document.querySelector('.current-round').textContent).toBe('Round 5');
        });

        test('should update phase display', () => {
            app.currentPhase = 'completion';
            app.updateScoreboard();
            
            expect(document.querySelector('.game-phase').textContent).toBe('Completed');
        });
    });
});