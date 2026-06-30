const scoreValue = document.getElementById('scoreValue');
const timerValue = document.getElementById('timerValue');
const resetButton = document.getElementById('resetButton');
const playground = document.getElementById('playground');
const gameMessage = document.getElementById('gameMessage');
const dropTemplate = document.getElementById('dropTemplate');
const hazardTemplate = document.getElementById('hazardTemplate');

let score = 0;
let timeLeft = 60;
let timerInterval = null;
const gameTarget = 15;
const dropCount = 6;
const hazardCount = 2;

function updateStats() {
  scoreValue.textContent = score;
  timerValue.textContent = timeLeft;
}

function randomPosition() {
  const areaRect = playground.getBoundingClientRect();
  const margin = 90;
  const x = Math.random() * (areaRect.width - margin);
  const y = Math.random() * (areaRect.height - margin) + 20;
  return { x, y };
}

function clearGameBoard() {
  const nodes = playground.querySelectorAll('.drop');
  nodes.forEach(node => node.remove());
}

function createDrop(type) {
  const template = type === 'hazard' ? hazardTemplate : dropTemplate;
  const element = template.content.firstElementChild.cloneNode(true);
  const position = randomPosition();
  element.style.left = `${position.x}px`;
  element.style.top = `${position.y}px`;
  element.addEventListener('click', handleDropClick);
  playground.appendChild(element);
}

function populateGameBoard() {
  clearGameBoard();
  for (let i = 0; i < dropCount; i += 1) {
    createDrop('target');
  }
  for (let i = 0; i < hazardCount; i += 1) {
    createDrop('hazard');
  }
}

function showMessage(text, variant = 'info') {
  gameMessage.textContent = text;
  gameMessage.style.background = variant === 'win'
    ? 'rgba(0, 167, 225, 0.95)'
    : variant === 'warn'
      ? 'rgba(255, 199, 44, 0.98)'
      : 'rgba(255, 199, 44, 0.98)';
  gameMessage.style.color = variant === 'win' ? '#ffffff' : '#102a43';
}

function endGame(won) {
  clearInterval(timerInterval);
  timerInterval = null;
  playground.querySelectorAll('button').forEach(button => button.disabled = true);
  if (won) {
    showMessage('Well done! The village well is full. 🌊', 'win');
    launchConfetti();
  } else {
    showMessage('Time is up — keep practicing and try again!', 'warn');
  }
}

function handleDropClick(event) {
  const value = Number(event.currentTarget.dataset.value);
  if (value > 0) {
    score += value;
    showMessage('Great job! More water is saved.', 'info');
  } else {
    score = Math.max(0, score + value);
    showMessage('Oops! That was a dry rock. Lose 2 points.', 'warn');
  }

  updateStats();
  populateGameBoard();

  if (score >= gameTarget) {
    endGame(true);
  }
}

function tickTimer() {
  if (timeLeft <= 0) {
    endGame(score >= gameTarget);
    return;
  }
  timeLeft -= 1;
  updateStats();
}

function startTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  timerInterval = setInterval(tickTimer, 1000);
}

function resetGame() {
  score = 0;
  timeLeft = 60;
  updateStats();
  populateGameBoard();
  showMessage('Tap water drops to fill the well. Avoid the rocks!', 'info');
  startTimer();
  playground.querySelectorAll('button').forEach(button => button.disabled = false);
}

function launchConfetti() {
  const confettiGroup = document.createElement('div');
  confettiGroup.className = 'confetti-group';
  for (let i = 0; i < 30; i += 1) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = Math.random() > 0.5 ? '#ffc72c' : '#00a7e1';
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    confettiGroup.appendChild(piece);
  }
  playground.appendChild(confettiGroup);
  setTimeout(() => confettiGroup.remove(), 1800);
}

resetButton.addEventListener('click', resetGame);

window.addEventListener('load', () => {
  resetGame();
});
