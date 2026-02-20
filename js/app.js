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
      
      // Validate trick entries
      const handCount = this.calculateHandCountForRound(this.currentRound);
      const validation = this.validateTrickEntry(formData, handCount);
      
      if (!validation.isValid) {
        this.showError(validation.error);
        return;
      }
      
      // Update player scores
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
      if (!predictedInput || !actualInput) {
        console.error(`Missing inputs for player ${player.name}`);
        extractionSuccessful = false;
        return;
      }
      
      const predicted = parseInt(predictedInput.value);
      const actual = parseInt(actualInput.value);
      const bonus = bonusInput ? bonusInput.checked : false;
      
      // Validate numeric values
      if (isNaN(predicted) || isNaN(actual)) {
        console.error(`Invalid numeric values for player ${player.name}`);
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
    
    return extractionSuccessful ? playerTricks : null;
  }

  validateTrickEntry(playerTricks, handCount) {
    // Validate total actual tricks equals hand count
    const totalActualTricks = playerTricks.reduce((sum, p) => sum + p.actual, 0);
    
    if (totalActualTricks !== handCount) {
      return {
        isValid: false,
        error: `Total actual tricks (${totalActualTricks}) must equal hand count (${handCount})`
      };
    }
    
    // Validate individual player entries
    for (let player of playerTricks) {
      if (player.predicted < 0 || player.predicted > handCount) {
        return {
          isValid: false,
          error: `${player.playerName}'s predicted tricks must be between 0 and ${handCount}`
        };
      }
      
      if (player.actual < 0 || player.actual > handCount) {
        return {
          isValid: false,
          error: `${player.playerName}'s actual tricks must be between 0 and ${handCount}`
        };
      }
    }
    
    return { isValid: true };
  }

  updatePlayerScores(playerTricks) {
    playerTricks.forEach((trickData) => {
      const player = this.players.find(p => p.id === trickData.playerId);
      if (!player) {
        console.error(`Player not found: ${trickData.playerId}`);
        return;
      }
      
      // Calculate score using scoring.js function
      const roundScore = this.calculatePlayerScore(
        trickData.predicted,
        trickData.actual,
        trickData.bonus
      );
      
      // Update player's scores
      player.roundScores[this.currentRound - 1] = roundScore;
      player.totalScore = player.roundScores.reduce((sum, score) => sum + (score || 0), 0);
      
      // Update display
      this.updatePlayerScoreDisplay(player);
    });
  }

  calculatePlayerScore(predicted, actual, bonusEarned) {
    // Use scoring logic from scoring.js if available, otherwise fallback
    if (typeof window.calculateRoundScore === 'function') {
      return window.calculateRoundScore(predicted, actual, bonusEarned);
    }
    
    // Fallback scoring logic
    let score = 0;
    
    if (predicted === actual) {
      // Correct prediction: 10 points + actual tricks
      score = 10 + actual;
      
      if (bonusEarned) {
        score += 5; // Bonus points
      }
    } else {
      // Incorrect prediction: negative points for difference
      score = -(Math.abs(predicted - actual));
    }
    
    return score;
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
      this.advanceToNextRound();
    }
  }

  advanceToNextRound() {
    this.currentRound++;
    this.clearForm();
    this.setupGameRound();
    this.showSuccess(`Round ${this.currentRound - 1} completed! Starting Round ${this.currentRound}`);
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
    
    let html = `<h3>🏆 ${winner.name} Wins with ${winner.totalScore} points!</h3><div class="final-scoreboard">`;
    
    sortedPlayers.forEach((player, index) => {
      const position = index + 1;
      html += `
        <div class="final-score-row ${player.id === winner.id ? 'winner' : ''}">
          <span class="position">${position}.</span>
          <span class="name">${player.name}</span>
          <span class="total-score">${player.totalScore}</span>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
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