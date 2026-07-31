// ============================================================
// Aircraft designator speed test — page-specific DOM wiring.
// Reference data, keymap persistence, and shared helpers all
// come from data.js, loaded before this file.
// ============================================================

const ROUND_SECONDS = 60;

const startScreen = document.getElementById("startScreen");
const playScreen = document.getElementById("playScreen");
const resultsScreen = document.getElementById("resultsScreen");
const timerDisplay = document.getElementById("timerDisplay");
const aircraftNameEl = document.getElementById("aircraftName");
const input = document.getElementById("designatorInput");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const scoreDisplay = document.getElementById("scoreDisplay");
const resultsDetail = document.getElementById("resultsDetail");

let keymap = loadKeymap(); // from data.js — same mapping as the Readback Trainer tab

let currentAircraft = null;
let previousAircraft = null;
let correctCount = 0;
let totalCount = 0;
let secondsLeft = ROUND_SECONDS;
let timerId = null;
let running = false;

let wrongAttempts = [];

// Avoid showing the same aircraft twice in a row (only matters if the
// list has more than one entry).
function pickNextAircraft() {
  if (DEFAULT_AIRCRAFT.length <= 1) return DEFAULT_AIRCRAFT[0];
  let next;
  do {
    next = pickRandom(DEFAULT_AIRCRAFT);
  } while (previousAircraft && next.designator === previousAircraft.designator);
  return next;
}

function showNextAircraft() {
  previousAircraft = currentAircraft;
  currentAircraft = pickNextAircraft();
  aircraftNameEl.textContent = currentAircraft.display_name;
  input.value = "";
}


function renderWrongList() {
  const wrongListEl = document.getElementById("wrongList");
  if (!wrongAttempts.length) {
    wrongListEl.innerHTML = "";
    return;
  }
  wrongListEl.innerHTML = "<h3 class='wrong-list-title'>Missed</h3>" + wrongAttempts.map((w) => `<div class="wrong-row"><span>${w.name}</span><span class ="wrong-answer">typed "${w.typed || "(blank)"}" - correct: ${w.correct}</span></div>`).join("");
}

function startRound() {
  correctCount = 0;
  totalCount = 0;
  wrongAttempts = [];
  secondsLeft = ROUND_SECONDS;
  running = true;

  startScreen.style.display = "none";
  resultsScreen.style.display = "none";
  playScreen.style.display = "block";
  timerDisplay.textContent = secondsLeft;

  showNextAircraft();
  input.disabled = false;
  input.focus();

  timerId = setInterval(() => {
    secondsLeft -= 1;
    timerDisplay.textContent = secondsLeft;
    if (secondsLeft <= 0) endRound();
  }, 1000);
}

function endRound() {
  running = false;
  clearInterval(timerId);
  input.disabled = true;
  playScreen.style.display = "none";
  resultsScreen.style.display = "block";

  // Round is fixed at 60 seconds, so the correct count in this round
  // IS the aircraft-per-minute rate — no division needed.
  const accuracy = totalCount ? Math.round((1000 * correctCount) / totalCount) / 10 : 0;
  scoreDisplay.textContent = `${correctCount} aircraft/min`;
  resultsDetail.textContent = totalCount
    ? `${correctCount} correct out of ${totalCount} attempted (${accuracy}% accuracy)`
    : "No attempts submitted — try pressing Enter after typing a designator.";
  renderWrongList()
}

function submitAnswer() {
  if (!running || !currentAircraft) return;
  totalCount += 1;
  if (norm(input.value) === norm(currentAircraft.designator)) {
    correctCount += 1;
  }
  else {
    wrongAttempts.push({name: currentAircraft.display_name, typed: input.value, correct: currentAircraft.designator, });
  }
  showNextAircraft();
}

input.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return; // allow shortcuts through
  if (e.code === "Delete") {
    e.preventDefault();
    input.value = "";
    return;
  }
  if (PASSTHROUGH_CODES.has(e.code)) return; // navigation/editing keys untouched

  if (e.code === "Enter" || e.code === "NumpadEnter") {
    e.preventDefault();
    submitAnswer();
    return;
  }

  if (e.code === "Space") {
    e.preventDefault(); // designators don't contain spaces — ignore
    return;
  }

  e.preventDefault();
  const mapped = keymap[e.code];
  if (mapped === undefined || mapped === "") return;
  insertAtCursor(input, mapped.toUpperCase());
});

startBtn.addEventListener("click", startRound);

restartBtn.addEventListener("click", () => {
  resultsScreen.style.display = "none";
  startScreen.style.display = "block";
});
