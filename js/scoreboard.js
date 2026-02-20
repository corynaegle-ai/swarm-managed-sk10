// js/scoreboard.js - Scoreboard display logic using vanilla DOM APIs

// Function to render the scoreboard displaying all player total scores from gameState
function renderScoreboard(gameState) {
  const scoreboardEl = document.querySelector('#scoreboard');
  if (!scoreboardEl) {
    console.error('Scoreboard element not found');
    return;
  }
  scoreboardEl.innerHTML = '<h2>Scoreboard</h2>';
  const scoresList = document.createElement('ul');
  gameState.players.forEach(player => {
    const li = document.createElement('li');
    li.textContent = `${player.name}: ${player.score}`;
    li.id = `player-${player.id}`;
    scoresList.appendChild(li);
  });
  scoreboardEl.appendChild(scoresList);
  highlightLeader(gameState.players);
}

// Function to update player scores (utility, assumes renderScoreboard is called after)
function updatePlayerScores(players) {
  players.forEach(player => {
    const li = document.querySelector(`#player-${player.id}`);
    if (li) {
      li.textContent = `${player.name}: ${player.score}`;
    }
  });
  highlightLeader(players);
}

// Function to display round-by-round score history
function displayRoundBreakdown(rounds) {
  const breakdownEl = document.querySelector('#round-breakdown');
  if (!breakdownEl) {
    console.error('Round breakdown element not found');
    return;
  }
  breakdownEl.innerHTML = '<h3>Round Breakdown</h3>';
  const table = document.createElement('table');
  const header = document.createElement('tr');
  header.innerHTML = '<th>Round</th><th>Player Scores</th>';
  table.appendChild(header);
  rounds.forEach((round, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>Round ${index + 1}</td><td>${round.scores.map(s => `${s.player}: ${s.score}`).join(', ')}</td>`;
    table.appendChild(row);
  });
  breakdownEl.appendChild(table);
}

// Function to highlight the current leader by applying CSS class
function highlightLeader(players) {
  const maxScore = Math.max(...players.map(p => p.score));
  players.forEach(player => {
    const li = document.querySelector(`#player-${player.id}`);
    if (li) {
      if (player.score === maxScore) {
        li.classList.add('leader');
      } else {
        li.classList.remove('leader');
      }
    }
  });
}

// Function to display final rankings when game ends
function showFinalResults(gameState) {
  const resultsEl = document.querySelector('#final-results');
  if (!resultsEl) {
    console.error('Final results element not found');
    return;
  }
  resultsEl.innerHTML = '<h2>Final Results</h2>';
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
  const list = document.createElement('ol');
  sortedPlayers.forEach(player => {
    const li = document.createElement('li');
    li.textContent = `${player.name}: ${player.score}`;
    list.appendChild(li);
  });
  resultsEl.appendChild(list);
}

// Export functions for use in main.js
export { renderScoreboard, updatePlayerScores, displayRoundBreakdown, highlightLeader, showFinalResults };