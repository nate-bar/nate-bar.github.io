// ============================================================
// Reference data — static. Edit these arrays directly and push
// to change what the app quizzes you on. Not editable from the
// UI, not stored anywhere — just plain constants.
// ============================================================

const DEFAULT_LOCATIONS = [
  { display_name: "Buhl", code: "SE4", letter_rwy28: "G", letter_rwy10: "G" },
  { display_name: "Garden Valley", code: "NE4", letter_rwy28: "A", letter_rwy10: "G" },
];

const DEFAULT_AIRCRAFT = [
  { display_name: "Aztec", designator: "PA23" },
  { display_name: "Cessna 172", designator: "C172" },
  { display_name: "Cherokee", designator: "PA28" },
];

const DEFAULT_CALLSIGNS = [
  { callsign: "N874GV" },
  { callsign: "N123AB" },
  { callsign: "N55PT" },
];

// Keyboard mapping — also static, also not editable from the UI.
// Keyed by KeyboardEvent.code (physical key position), not by the
// character normally printed on that key.
const DEFAULT_KEYMAP = {
  Numpad1: "7", Numpad2: "8", Numpad3: "9", Numpad4: "4", Numpad5: "5",
  Numpad6: "6", Numpad7: "1", Numpad8: "2", Numpad9: "3", Numpad0: "0",
  Minus: "g", Equal: "=",
  KeyQ: "q", KeyW: "w", KeyE: "e", KeyR: "h", KeyT: "i",
  KeyY: "j", KeyU: "k", KeyI: "l", KeyO: "m", KeyP: "n",
  BracketLeft: "[", BracketRight: "]",
  KeyA: "a", KeyS: "s", KeyD: "d", KeyF: "o", KeyG: "p",
  KeyH: "q", KeyJ: "r", KeyK: "s", KeyL: "t",
  Semicolon: "u", Quote: "'",
  KeyZ: "z", KeyX: "x", KeyC: "v", KeyV: "w", KeyB: "x",
  KeyN: "y", KeyM: "z", Comma: ",", Period: ".", Slash: "/",
  Space: " ",
  Digit1: "1", Digit2: "2", Digit3: "3", Digit4: "4", Digit5: "a",
  Digit6: "b", Digit7: "c", Digit8: "d", Digit9: "e", Digit0: "f",
};

const CONFIG_STORAGE_KEY = "atc_trainer_active_config";

// ============================================================
// Core game logic — pure functions, no DOM access, so these can
// be unit tested directly under Node (see test_logic.js).
// ============================================================

function norm(s) {
  return (s || "").trim().toUpperCase();
}

// Callsign-specific comparison: a leading "N" is optional on input,
// and is stripped from the correct value too, so "874GV" matches
// "N874GV" and so does "N874GV" itself.
function normCallsign(s) {
  const v = norm(s);
  return v.startsWith("N") ? v.slice(1) : v;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildPrompt(locations, aircraft, callsigns) {
  const callsign = pickRandom(callsigns);
  const location = pickRandom(locations);
  const plane = pickRandom(aircraft);
  const prompt_text = `${callsign.callsign} we are a ${plane.display_name} requesting clearance to ${location.display_name}`;
  return { prompt_text, callsign, location, aircraft: plane };
}

function gradeAttempt(callsign, location, aircraft, config, lines) {
  const letterCol = config === "28" ? "letter_rwy28" : "letter_rwy10";
  const correct = [callsign.callsign, location.code, aircraft.designator, location[letterCol]];
  const results = correct.map((c, i) => {
    const pass = i === 0
      ? normCallsign(lines[i]) === normCallsign(c) // callsign: leading N optional
      : norm(lines[i]) === norm(c);
    return { line: i + 1, input: lines[i], correct: c, pass };
  });
  const all_pass = results.every((r) => r.pass);
  return { results, all_pass };
}

// ============================================================
// Export for Node-based testing (harmless in the browser — module is undefined there)
// ============================================================
if (typeof module !== "undefined") {
  module.exports = {
    gradeAttempt, buildPrompt, norm, normCallsign,
    DEFAULT_KEYMAP, DEFAULT_LOCATIONS, DEFAULT_AIRCRAFT, DEFAULT_CALLSIGNS,
  };
}

// ============================================================
// DOM wiring (browser only)
// ============================================================

if (typeof window !== "undefined" && typeof document !== "undefined") {

const FIELD_LABELS = ["Callsign", "Location code", "Aircraft designator", "Runway letter"];
const MAX_LINES = 4;

let activeConfig = localStorage.getItem(CONFIG_STORAGE_KEY) || "28";
let currentPrompt = null; // { prompt_text, callsign, location, aircraft }

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

// Keys that should always behave normally (navigation/editing), never remapped.
const PASSTHROUGH_CODES = new Set([
  "Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
  "Home", "End", "Tab",
  "ShiftLeft", "ShiftRight", "ControlLeft", "ControlRight",
  "AltLeft", "AltRight", "MetaLeft", "MetaRight", "CapsLock", "Escape", "NumLock",
]);

function insertAtCursor(el, str) {
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  const val = el.value;
  el.value = val.slice(0, start) + str + val.slice(end);
  const pos = start + str.length;
  el.setSelectionRange(pos, pos);
}

function currentLineCount(value) {
  return value.split("\n").length;
}

answerBox.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return; // allow shortcuts through
  if (PASSTHROUGH_CODES.has(e.code)) return; // navigation/editing keys untouched

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
  const mapped = DEFAULT_KEYMAP[e.code];
  if (mapped === undefined || mapped === "") return;
  insertAtCursor(answerBox, mapped);
});

// ---------- Init ----------

renderConfigButtons();
loadPrompt();

} // end browser-only block
