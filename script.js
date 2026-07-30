// ============================================================
// Readback trainer — page-specific DOM wiring only. Reference
// data, keymap defaults/persistence, and grading logic all live
// in data.js, loaded before this file (see index.html).
// ============================================================

const CONFIG_STORAGE_KEY = "atc_trainer_active_config";

function loadActiveConfig() {
  try {
    return localStorage.getItem(CONFIG_STORAGE_KEY) || "28";
  } catch (e) {
    return "28"; // localStorage unavailable (e.g. Firefox on a file:// page)
  }
}

const FIELD_LABELS = ["Callsign", "Location code", "Aircraft designator", "Runway letter"];
const MAX_LINES = 4;

let activeConfig = loadActiveConfig();
let currentPrompt = null; // { prompt_text, callsign, location, aircraft }
let keymap = loadKeymap(); // from data.js

const answerBox = document.getElementById("answerBox");
const promptTextEl = document.getElementById("promptText");
const resultBox = document.getElementById("resultBox");
const submitBtn = document.getElementById("submitBtn");
const nextBtn = document.getElementById("nextBtn");
const answerForm = document.getElementById("answerForm");

// ---------- Config toggle ----------

const cfg28Btn = document.getElementById("cfg28");
const cfg10Btn = document.getElementById("cfg10");

function renderConfigButtons() {
  cfg28Btn.classList.toggle("active", activeConfig === "28");
  cfg10Btn.classList.toggle("active", activeConfig === "10");
}

function setConfig(value) {
  activeConfig = value;
  try { localStorage.setItem(CONFIG_STORAGE_KEY, value); } catch (e) { /* ignore */ }
  renderConfigButtons();
}

cfg28Btn.addEventListener("click", () => setConfig("28"));
cfg10Btn.addEventListener("click", () => setConfig("10"));

// ---------- Prompt flow ----------

function loadPrompt() {
  resultBox.innerHTML = "";
  submitBtn.style.display = "inline-block";
  nextBtn.style.display = "none";
  answerBox.value = "";
  answerBox.disabled = false;

  currentPrompt = buildPrompt(DEFAULT_LOCATIONS, DEFAULT_AIRCRAFT, DEFAULT_CALLSIGNS);
  promptTextEl.textContent = currentPrompt.prompt_text;
  answerBox.focus();
}

function doSubmit() {
  if (!currentPrompt) return;

  const lines = answerBox.value.split("\n");
  while (lines.length < MAX_LINES) lines.push("");

  const { results, all_pass } = gradeAttempt(
    currentPrompt.callsign, currentPrompt.location, currentPrompt.aircraft,
    activeConfig, lines
  );

  renderResults({ results, all_pass });
  answerBox.disabled = true;
  submitBtn.style.display = "none";
  nextBtn.style.display = "inline-block";
  nextBtn.focus();
}

answerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  doSubmit();
});

function renderResults(data) {
  const banner = document.createElement("div");
  banner.className = "overall-banner " + (data.all_pass ? "pass" : "fail");
  banner.textContent = data.all_pass ? "All correct" : "Not quite — see below";

  resultBox.innerHTML = "";
  resultBox.appendChild(banner);

  data.results.forEach((r, i) => {
    const row = document.createElement("div");
    row.className = "result-line " + (r.pass ? "pass" : "fail");
    row.innerHTML = `
      <span>${FIELD_LABELS[i]}: "${r.input || "(blank)"}"</span>
      <span class="status">${r.pass ? "PASS" : "should be: " + r.correct}</span>
    `;
    resultBox.appendChild(row);
  });
}

nextBtn.addEventListener("click", loadPrompt);

// ---------- Keyboard remapping + single terminal box ----------

function currentLineCount(value) {
  return value.split("\n").length;
}

answerBox.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return; // allow shortcuts through
  if (PASSTHROUGH_CODES.has(e.code)) return; // navigation/editing keys untouched

  if (e.code === "Delete") {
    e.preventDefault();
    answerBox.value = "";
    return;
  }

  // Enter submits (a plain textarea would otherwise just insert a newline)
  if (e.code === "Enter" || e.code === "NumpadEnter") {
    e.preventDefault();
    if (!answerBox.disabled) doSubmit();
    return;
  }

  // Space advances to the next line instead of typing a space character
  if (e.code === "Space") {
    e.preventDefault();
    if (currentLineCount(answerBox.value) < MAX_LINES) {
      insertAtCursor(answerBox, "\n");
    }
    return;
  }

  e.preventDefault();
  const mapped = keymap[e.code];
  if (mapped === undefined || mapped === "") return;
  insertAtCursor(answerBox, mapped.toUpperCase());
});

// ---------- Keyboard mapping panel ----------

// Layout data purely for display labels in the grid — shows which
// physical key each box corresponds to. Decoupled from DEFAULT_KEYMAP's
// (already-remapped) output values.
const PHYSICAL_KEY_ROWS = [
  [["Digit1","1"],["Digit2","2"],["Digit3","3"],["Digit4","4"],["Digit5","5"],
   ["Digit6","6"],["Digit7","7"],["Digit8","8"],["Digit9","9"],["Digit0","0"],
   ["Minus","-"],["Equal","="]],
  [["KeyQ","Q"],["KeyW","W"],["KeyE","E"],["KeyR","R"],["KeyT","T"],
   ["KeyY","Y"],["KeyU","U"],["KeyI","I"],["KeyO","O"],["KeyP","P"],
   ["BracketLeft","["],["BracketRight","]"]],
  [["KeyA","A"],["KeyS","S"],["KeyD","D"],["KeyF","F"],["KeyG","G"],
   ["KeyH","H"],["KeyJ","J"],["KeyK","K"],["KeyL","L"],
   ["Semicolon",";"],["Quote","'"]],
  [["KeyZ","Z"],["KeyX","X"],["KeyC","C"],["KeyV","V"],["KeyB","B"],
   ["KeyN","N"],["KeyM","M"],["Comma",","],["Period","."],["Slash","/"]],
];

const PHYSICAL_NUMPAD_ROWS = [
  [["Numpad7","7"],["Numpad8","8"],["Numpad9","9"]],
  [["Numpad4","4"],["Numpad5","5"],["Numpad6","6"]],
  [["Numpad1","1"],["Numpad2","2"],["Numpad3","3"]],
  [["Numpad0","0"]],
];

const toggleKeymapBtn = document.getElementById("toggleKeymap");
const keymapBody = document.getElementById("keymapBody");
const keymapGrid = document.getElementById("keymapGrid");
const numpadGrid = document.getElementById("numpadGrid");

toggleKeymapBtn.addEventListener("click", () => {
  const showing = keymapBody.style.display !== "none";
  keymapBody.style.display = showing ? "none" : "block";
  toggleKeymapBtn.textContent = showing ? "Show" : "Hide";
  if (!showing) {
    renderKeyGrid(PHYSICAL_KEY_ROWS, keymapGrid);
    renderKeyGrid(PHYSICAL_NUMPAD_ROWS, numpadGrid);
  }
});

function makeKeyBox(code, label) {
  const keyEl = document.createElement("div");
  keyEl.className = "kb-key";
  const labelEl = document.createElement("div");
  labelEl.className = "kb-label";
  labelEl.textContent = label;
  const input = document.createElement("input");
  input.maxLength = 1;
  input.value = keymap[code] ?? "";
  input.addEventListener("change", (e) => {
    keymap[code] = e.target.value;
    saveKeymap(keymap);
  });
  keyEl.appendChild(labelEl);
  keyEl.appendChild(input);
  return keyEl;
}

function renderKeyGrid(rows, container) {
  container.innerHTML = "";
  rows.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "kb-row";
    row.forEach(([code, label]) => rowEl.appendChild(makeKeyBox(code, label)));
    container.appendChild(rowEl);
  });
}

document.getElementById("resetKeymap").addEventListener("click", () => {
  keymap = Object.assign({}, DEFAULT_KEYMAP);
  saveKeymap(keymap);
  renderKeyGrid(PHYSICAL_KEY_ROWS, keymapGrid);
  renderKeyGrid(PHYSICAL_NUMPAD_ROWS, numpadGrid);
});

// ---------- Init ----------

renderConfigButtons();
loadPrompt();
