// Import scoring functions
import { validateTrickEntry, updatePlayerRoundScore, calculateRoundScore } from './scoring.js';

// Main game controller
class TricksterGame {
  constructor() {
    this.players = [];
    this.currentRound = 1;
    this.maxRounds = 10;
    this.gameStarted = false;
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupPlayerNameInputs();
  }

  bindEvents() {
    // Game setup events
    document.getElementById('num-players').addEventListener('change', () => {
      this.setupPlayerNameInputs();
    });
    
    document.getElementById('start-game').addEventListener('click', () => {
      this.startGame();
    });
    
    // Main form submission event listener
    const trickForm = document.getElementById('trick-entry-form');
    if (trickForm) {
      trickForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleTrickSubmission();
      });
    }
    
    document.getElementById('clear-form')?.addEventListener('click', () => {
      this.clearForm();
    });
    
    document.getElementById('new-game')?.addEventListener('click', () => {
      this.resetGame();
    });
  }

  setupPlayerNameInputs() {
    const numPlayers = parseInt(document.getElementById('num-players').value);
    const container = document.getElementById('player-names');
    
    // Clear existing inputs
    container.innerHTML = '';
    
    // Create inputs for selected number of players
    for (let i = 1; i <= numPlayers; i++) {
      const div = document.createElement('div');
      div.className = 'player-name-input';
      div.innerHTML = `
        <label>Player ${i}:</label>
        <input type="text" class="player-name" placeholder="Enter name" required>
      `;
      container.appendChild(div);
    }
  }

  startGame() {
    if (!this.initializePlayersFromForm()) {
      return;
    }
    
    this.gameStarted = true;
    this.currentRound = 1;
    
    // Hide setup, show game
    document.getElementById('game-setup').style.display = 'none';
    document.getElementById('game-play').style.display = 'block';
    
    this.setupGameRound();
  }

  initializePlayersFromForm() {
    const nameInputs = document.querySelectorAll('.player-name');
    const names = [];
    
    // Validate all names are provided
    for (let input of nameInputs) {
      const name = input.value.trim();
      if (!name) {
        this.showError('All player names are required.');
        return false;
      }
      if (names.includes(name)) {
        this.showError('Player names must be unique.');
        return false;
      }
      names.push(name);
    }
    
    // Initialize players
    this.players = names.map((name, index) => ({
      id: index + 1,
      name: name,
      totalScore: 0,
      roundScores: []
    }));
    
    return true;
  }

  setupGameRound() {
    // Update round display
    document.getElementById('current-round').textContent = this.currentRound;
    document.getElementById('round-display').textContent = this.currentRound;
    
    // Calculate hand count for this round
    const handCount = this.calculateHandCountForRound(this.currentRound);
    document.getElementById('hand-count').textContent = handCount;
    
    // Setup player trick inputs
    this.setupPlayerTrickInputs(handCount);
    
    // Update scoreboard
    this.updateScoreboard();
    
    // Clear any previous errors
    this.clearErrors();
  }

  calculateHandCountForRound(round) {
    // Standard Trickster progression: 10, 9, 8, 7, 6, 5, 4, 3, 2, 1
    return Math.max(1, 11 - round);
  }

  setupPlayerTrickInputs(handCount) {
    const container = document.getElementById('player-tricks-container');
    container.innerHTML = '';
    
    this.players.forEach((player) => {
      const playerDiv = document.createElement('div');
      playerDiv.className = 'player-tricks';
      playerDiv.innerHTML = `
        <div class="player-trick-entry">
          <h4>${player.name}</h4>
          <div class="trick-inputs">
            <label>Predicted Tricks:</label>
            <input type="number" 
                   class="predicted-tricks" 
                   data-player-id="${player.id}" 
                   min="0" 
                   max="${handCount}" 
                   required>
            
            <label>Actual Tricks:</label>
            <input type="number" 
                   class="actual-tricks" 
                   data-player-id="${player.id}" 
                   min="0" 
                   max="${handCount}" 
                   required>
            
            <div class="bonus-selection">
              <label>
                <input type="checkbox" 
                       class="bonus-earned" 
                       data-player-id="${player.id}">
                Bonus Earned
              </label>
            </div>
          </div>
        </div>
      `;
      container.appendChild(playerDiv);
    });
  }

  handleTrickSubmission() {
    try {
      // Extract form data
      const formData = this.extractFormData();
      if (!formData) {
        this.showError('Failed to extract form data. Please check all inputs.');
        return;
      }
      
      // Validate trick entries using imported scoring function
      const handCount = this.calculateHandCountForRound(this.currentRound);
      const validation = validateTrickEntry(formData, handCount);
      
      if (!validation.isValid) {
        this.showError(validation.error);
        return;
      }
      
      // Update player scores using scoring functions
      this.updatePlayerScores(formData);
      
      // Advance to next round or end game
      this.advanceGameState();
      
    } catch (error) {
      console.error('Error handling trick submission:', error);
      this.showError('An error occurred processing the submission. Please try again.');
    }
  }

  extractFormData() {
    const playerTricks = [];
    let extractionSuccessful = true;
    let missingInputs = [];
    
    this.players.forEach((player) => {
      // Try multiple selector patterns for robustness
      const predictedInput = document.querySelector(`input.predicted-tricks[data-player-id="${player.id}"]`) ||
                           document.querySelector(`#predicted-${player.id}`) ||
                           document.querySelector(`[data-player="${player.id}"][data-type="predicted"]`);
      
      const actualInput = document.querySelector(`input.actual-tricks[data-player-id="${player.id}"]`) ||
                        document.querySelector(`#actual-${player.id}`) ||
                        document.querySelector(`[data-player="${player.id}"][data-type="actual"]`);
      
      const bonusInput = document.querySelector(`input.bonus-earned[data-player-id="${player.id}"]`) ||
                       document.querySelector(`#bonus-${player.id}`) ||
                       document.querySelector(`[data-player="${player.id}"][data-type="bonus"]`);
      
      // Validate inputs exist and have values
      if (!predictedInput) {
        missingInputs.push(`${player.name} predicted tricks`);
        extractionSuccessful = false;
        return;
      }
      
      if (!actualInput) {
        missingInputs.push(`${player.name} actual tricks`);
        extractionSuccessful = false;
        return;
      }
      
      // Check for empty values
      if (predictedInput.value === '' || actualInput.value === '') {
        missingInputs.push(`${player.name} has empty values`);
        extractionSuccessful = false;
        return;
      }
      
      const predicted = parseInt(predictedInput.value);
      const actual = parseInt(actualInput.value);
      const bonus = bonusInput ? bonusInput.checked : false;
      
      // Validate numeric values
      if (isNaN(predicted) || isNaN(actual)) {
        missingInputs.push(`${player.name} has invalid numeric values`);
        extractionSuccessful = false;
        return;
      }
      
      playerTricks.push({
        playerId: player.id,
        playerName: player.name,
        predicted: predicted,
        actual: actual,
        bonus: bonus
      });
    });
    
    if (!extractionSuccessful && missingInputs.length > 0) {
      this.showError(`Missing or invalid inputs: ${missingInputs.join(', ')}`);
    }
    
    return extractionSuccessful ? playerTricks : null;
  }



  updatePlayerScores(playerTricks) {
    playerTricks.forEach((trickData) => {
      const player = this.players.find(p => p.id === trickData.playerId);
      if (!player) {
        console.error(`Player not found: ${trickData.playerId}`);
        return;
      }
      
      // Calculate score using imported scoring functions
      const roundScore = calculateRoundScore(
        trickData.predicted,
        trickData.actual,
        trickData.bonus
      );
      
      // Update player's round score using imported function
      updatePlayerRoundScore(
        trickData.playerId,
        roundScore
      );
      
      // Update player's scores in our local state
      player.roundScores[this.currentRound - 1] = roundScore;
      player.totalScore = player.roundScores.reduce((sum, score) => sum + (score || 0), 0);
      
      // Update display
      this.updatePlayerScoreDisplay(player);
    });
  }



  updatePlayerScoreDisplay(player) {
    // Try multiple selector patterns for score display
    const scoreElement = document.querySelector(`#score-${player.id}`) ||
                        document.querySelector(`[data-player-id="${player.id}"] .score`) ||
                        document.querySelector(`.player-score[data-player="${player.id}"]`);
    
    if (scoreElement) {
      scoreElement.textContent = player.totalScore;
    } else {
      console.warn(`Score display element not found for player ${player.name}`);
      this.showError(`Failed to update score display for ${player.name}. Score: ${player.totalScore}`);
    }
  }

  updateScoreboard() {
    const container = document.getElementById('scoreboard-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    this.players.forEach((player) => {
      const playerDiv = document.createElement('div');
      playerDiv.className = 'player-score-row';
      playerDiv.innerHTML = `
        <span class="player-name">${player.name}</span>
        <span class="score" id="score-${player.id}">${player.totalScore}</span>
      `;
      container.appendChild(playerDiv);
    });
  }

  advanceGameState() {
    if (this.currentRound >= this.maxRounds) {
      this.endGame();
    } else {
      const advanced = this.advanceToNextRound();
      if (!advanced) {
        console.error('Failed to advance to next round');
      }
    }
  }

  advanceToNextRound() {
    // Validate that all players have valid scores for current round
    const incompletePlayerNames = this.players.filter(player => 
      !player.roundScores[this.currentRound - 1] && player.roundScores[this.currentRound - 1] !== 0
    ).map(player => player.name);
    
    if (incompletePlayerNames.length > 0) {
      this.showError(`Cannot advance round: Missing scores for ${incompletePlayerNames.join(', ')}`);
      return false;
    }
    
    this.currentRound++;
    this.clearForm();
    this.setupGameRound();
    this.showSuccess(`Round ${this.currentRound - 1} completed! Starting Round ${this.currentRound}`);
    return true;
  }

  endGame() {
    // Determine winner
    const winner = this.players.reduce((prev, current) => {
      return (prev.totalScore > current.totalScore) ? prev : current;
    });
    
    // Show final results
    document.getElementById('game-play').style.display = 'none';
    document.getElementById('game-end').style.display = 'block';
    
    this.displayFinalScores(winner);
  }

  displayFinalScores(winner) {
    const container = document.getElementById('final-scores');
    if (!container) return;
    
    // Sort players by score (descending)
    const sortedPlayers = [...this.players].sort((a, b) => b.totalScore - a.totalScore);
    
    // Clear container and build elements safely
    container.innerHTML = '';
    
    const title = document.createElement('h3');
    title.textContent = `🏆 ${winner.name} Wins with ${winner.totalScore} points!`;
    container.appendChild(title);
    
    const scoreboard = document.createElement('div');
    scoreboard.className = 'final-scoreboard';
    
    sortedPlayers.forEach((player, index) => {
      const position = index + 1;
      const row = document.createElement('div');
      row.className = `final-score-row ${player.id === winner.id ? 'winner' : ''}`;
      
      const positionSpan = document.createElement('span');
      positionSpan.className = 'position';
      positionSpan.textContent = `${position}.`;
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'name';
      nameSpan.textContent = player.name;
      
      const scoreSpan = document.createElement('span');
      scoreSpan.className = 'total-score';
      scoreSpan.textContent = player.totalScore;
      
      row.appendChild(positionSpan);
      row.appendChild(nameSpan);
      row.appendChild(scoreSpan);
      scoreboard.appendChild(row);
    });
    
    container.appendChild(scoreboard);
  }

  clearForm() {
    const form = document.getElementById('trick-entry-form');
    if (form) {
      form.reset();
    }
    this.clearErrors();
  }

  showError(message) {
    const errorContainer = this.getOrCreateErrorContainer();
    errorContainer.innerHTML = `<div class="error-message">❌ ${message}</div>`;
    errorContainer.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.clearErrors();
    }, 5000);
  }

  showSuccess(message) {
    const errorContainer = this.getOrCreateErrorContainer();
    errorContainer.innerHTML = `<div class="success-message">✅ ${message}</div>`;
    errorContainer.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.clearErrors();
    }, 3000);
  }

  getOrCreateErrorContainer() {
    let container = document.getElementById('error-container');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'error-container';
      container.className = 'error-container';
      
      // Insert after the form
      const form = document.getElementById('trick-entry-form');
      if (form && form.parentNode) {
        form.parentNode.insertBefore(container, form.nextSibling);
      } else {
        // Fallback: append to body
        document.body.appendChild(container);
      }
    }
    
    return container;
  }

  clearErrors() {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.style.display = 'none';
      errorContainer.innerHTML = '';
    }
  }

  resetGame() {
    this.players = [];
    this.currentRound = 1;
    this.gameStarted = false;
    
    // Reset displays
    document.getElementById('game-end').style.display = 'none';
    document.getElementById('game-play').style.display = 'none';
    document.getElementById('game-setup').style.display = 'block';
    
    // Clear forms
    const setupInputs = document.querySelectorAll('#game-setup input');
    setupInputs.forEach(input => input.value = '');
    
    this.clearErrors();
  }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.tricksterGame = new TricksterGame();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TricksterGame };
}