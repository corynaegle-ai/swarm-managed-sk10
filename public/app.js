/**
 * Main application entry point
 * Initializes the game and UI components
 */

// Global variables
let gameState;
let playerSetup;

/**
 * Initialize the application
 */
function initApp() {
    try {
        // Initialize game state
        gameState = new GameState();
        
        // Initialize player setup UI
        playerSetup = new PlayerSetupUI(gameState);
        
        // Initialize the UI
        playerSetup.init();
        
        console.log('SK10 Scorekeeper initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
        
        // Show error message to user
        const messagesContainer = document.getElementById('messages');
        if (messagesContainer) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'message message-error';
            errorDiv.textContent = 'Failed to initialize application. Please refresh the page.';
            messagesContainer.appendChild(errorDiv);
        }
    }
}

/**
 * Wait for DOM to be fully loaded before initializing
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

/**
 * Global error handler
 */
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    const messagesContainer = document.getElementById('messages');
    if (messagesContainer) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message message-error';
        errorDiv.textContent = 'An unexpected error occurred. Please check the console for details.';
        messagesContainer.appendChild(errorDiv);
    }
});

/**
 * Expose gameState for debugging in development
 */
if (typeof window !== 'undefined') {
    window.gameState = gameState;
    window.playerSetup = playerSetup;
}