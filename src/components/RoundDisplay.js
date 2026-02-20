/**
 * UI component for displaying round information
 */
class RoundDisplay {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container with ID '${containerId}' not found`);
    }
    this.roundManager = null;
  }

  /**
   * Set the round manager instance
   * @param {RoundManager} roundManager
   */
  setRoundManager(roundManager) {
    this.roundManager = roundManager;
    this.render();
  }

  /**
   * Render the round display
   */
  render() {
    if (!this.roundManager) {
      this.container.innerHTML = '<div class="round-display">No round data available</div>';
      return;
    }

    const status = this.roundManager.getGameStatus();
    
    this.container.innerHTML = `
      <div class="round-display">
        <div class="round-header">
          <h2>Round ${status.currentRound} of ${status.totalRounds}</h2>
          ${status.gameCompleted ? '<span class="game-complete">Game Complete!</span>' : ''}
        </div>
        <div class="round-info">
          <div class="hands-info">
            <span class="label">Hands this round:</span>
            <span class="value">${status.currentHandCount}</span>
          </div>
          <div class="progress-info">
            <span class="label">Rounds completed:</span>
            <span class="value">${status.roundsCompleted}/${status.totalRounds}</span>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${(status.roundsCompleted / status.totalRounds) * 100}%"></div>
        </div>
      </div>
    `;
  }

  /**
   * Update the display (call after round changes)
   */
  update() {
    this.render();
  }
}

// Export for both CommonJS and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RoundDisplay;
} else {
  window.RoundDisplay = RoundDisplay;
}