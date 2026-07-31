// ============================================================
// Shared reference data and logic — loaded by both pages
// (index.html and speedtest.html) before their page-specific
// script. One source of truth for aircraft/locations/callsigns
// and the keyboard mapping, so both games stay in sync and never
// duplicate data.
// ============================================================

const DEFAULT_LOCATIONS = [
  { display_name: "Fairfield", code: "NE4", letter_rwy28: "A", letter_rwy10: "G" },
  { display_name: "Lucky Peak", code: "NE4", letter_rwy28: "A", letter_rwy10: "G" },
  { display_name: "Cascade", code: "NW4", letter_rwy28: "G", letter_rwy10: "A" },
  { display_name: "Horseshoe Bend", code: "NW4", letter_rwy28: "G", letter_rwy10: "A" },
  { display_name: "Ontario, OR", code: "NW4", letter_rwy28: "G", letter_rwy10: "A" },
  { display_name: "Buhl", code: "SE4", letter_rwy28: "G", letter_rwy10: "G" },
  { display_name: "Jackpot, NV", code: "SE4", letter_rwy28: "G", letter_rwy10: "G" },
  { display_name: "Owyhee Res", code: "SW4", letter_rwy28: "G", letter_rwy10: "G" },
  { display_name: "Vale", code: "NW4", letter_rwy28: "G", letter_rwy10: "A" },
  { display_name: "Gooding", code: "SE4", letter_rwy28: "G", letter_rwy10: "G" },
  { display_name: "Weiser", code: "NW4", letter_rwy28: "G", letter_rwy10: "A" },
  { display_name: "Grangeville", code: "NW4", letter_rwy28: "G", letter_rwy10: "A" },
  { display_name: "Stanley", code: "NE4", letter_rwy28: "A", letter_rwy10: "G" },
  { display_name: "Lowman", code: "NE4", letter_rwy28: "A", letter_rwy10: "G" },
  { display_name: "Driggs", code: "NE4", letter_rwy28: "A", letter_rwy10: "G" },
  { display_name: "Atlanta, ID", code: "NE4", letter_rwy28: "A", letter_rwy10: "G" },
  { display_name: "American Falls", code: "NE4", letter_rwy28: "A", letter_rwy10: "G" },
  { display_name: "Blackfoot", code: "NE4", letter_rwy28: "A", letter_rwy10: "G" },
  { display_name: "Pine", code: "NE4", letter_rwy28: "A", letter_rwy10: "G" },
  { display_name: "Council", code: "NW4", letter_rwy28: "G", letter_rwy10: "A" },
  { display_name: "Garden Valley", code: "NN4", letter_rwy28: "A", letter_rwy10: "G" },
  { display_name: "Johnson Creek", code: "NN4", letter_rwy28: "A", letter_rwy10: "G" },
  { display_name: "New Meadows", code: "NW4", letter_rwy28: "G", letter_rwy10: "A" },
  { display_name: "Payette", code: "NW4", letter_rwy28: "G", letter_rwy10: "A" },
  { display_name: "Glenns Ferry", code: "SE4", letter_rwy28: "G", letter_rwy10: "G" },
  { display_name: "Jerome", code: "SE4", letter_rwy28: "G", letter_rwy10: "G" },
  { display_name: "Parma", code: "WW4", letter_rwy28: "G", letter_rwy10: "G" },
  { display_name: "Arco", code: "NE4", letter_rwy28: "A", letter_rwy10: "G" },
  { display_name: "Smiley Creek", code: "NE4", letter_rwy28: "A", letter_rwy10: "G" },
];

const DEFAULT_AIRCRAFT = [
  { display_name: "King Air 200", designator: "BE20" },
  { display_name: "Sundowner, Musketeer", designator: "BE24" },
  { display_name: "Debonair", designator: "BE33" },
  { display_name: "Bonanza", designator: "BE36" },
  { display_name: "Baron", designator: "BE55" },
  { display_name: "Duke", designator: "BE60" },
  { display_name: "Airliner", designator: "BE99" },
  { display_name: "King Air", designator: "BE9L" },
  { display_name: "Beech 1900 (C12J)", designator: "B190" },
  { display_name: "Super King Air", designator: "B350" },
  { display_name: "Beechjet", designator: "BE40" },
  { display_name: "Premier", designator: "PRM1" },
  { display_name: "Scout", designator: "BL8" },
  { display_name: "Champ/Citabria", designator: "CH7A" },
  { display_name: "Skyhawk", designator: "C172" },
  { display_name: "Cardinal", designator: "C177" },
  { display_name: "180 Skywagon", designator: "C180" },
  { display_name: "Skylane", designator: "C182" },
  { display_name: "Skywagon", designator: "C185" },
  { display_name: "Stationair", designator: "C206" },
  { display_name: "Pressurized Centurion", designator: "P210" },
  { display_name: "Cessna 310", designator: "C310" },
  { display_name: "Skymaster", designator: "C337" },
  { display_name: "CorvalisTT, Columbia 400", designator: "COL4" },
  { display_name: "Chancellor", designator: "C414" },
  { display_name: "Golden Eagle", designator: "C421" },
  { display_name: "Conquest", designator: "C425" },
  { display_name: "Conquest II", designator: "C441" },
  { display_name: "SR-20", designator: "SR20" },
  { display_name: "SR-22", designator: "SR22" },
  { display_name: "Vision Jet", designator: "SF50" },
  { display_name: "Alpha Jet", designator: "AJET" },
  { display_name: "Falcon 10", designator: "FA10" },
  { display_name: "Falcon 900", designator: "F900" },
  { display_name: "Beaver", designator: "DHC2" },
  { display_name: "Twin Otter", designator: "DHC6" },
  { display_name: "Katana", designator: "DV20" },
  { display_name: "Diamond Star", designator: "DA40" },
  { display_name: "Twin Star", designator: "DA42" },
  { display_name: "A-10", designator: "A10" },
  { display_name: "Merlin 3", designator: "SW3" },
  { display_name: "Metro", designator: "SW4" },
  { display_name: "PC-12, Eagle", designator: "PC12" },
  { display_name: "Pilatus Jet", designator: "PC24" },
  { display_name: "Aerostar", designator: "AEST" },
  { display_name: "Super Cub", designator: "PA18" },
];

const DEFAULT_CALLSIGNS = [
  { callsign: "N72BZ" },
  { callsign: "N6993N" },
  { callsign: "N524N" },
  { callsign: "STT68" },
  { callsign: "MKL42" },
  { callsign: "N634MA" },
  { callsign: "N6321Y" },
  { callsign: "N55SV" },
  { callsign: "N252KQ" },
  { callsign: "N10C" },
  { callsign: "N61557" },
  { callsign: "N206GV" },
  { callsign: "N208EF" },
  { callsign: "N2863E" },
  { callsign: "N239VA" },
  { callsign: "N521TM" },
  { callsign: "N54829" },
  { callsign: "N89721" },
];

// Keyboard mapping — keyed by KeyboardEvent.code (physical key position),
// not by the character normally printed on that key. This is the shipped
// starting point; the practice page's in-app editor can override
// individual keys, persisted to localStorage under KEYMAP_STORAGE_KEY.
const DEFAULT_KEYMAP = {
  Numpad1: "1", Numpad2: "2", Numpad3: "3", Numpad4: "4", Numpad5: "5",
  Numpad6: "6", Numpad7: "7", Numpad8: "8", Numpad9: "9", Numpad0: "0",
  Minus: "g", Equal: "=",
  KeyQ: "q", KeyW: "w", KeyE: "e", KeyR: "r", KeyT: "t",
  KeyY: "y", KeyU: "u", KeyI: "i", KeyO: "o", KeyP: "p",
  BracketLeft: "[", BracketRight: "]",
  KeyA: "a", KeyS: "s", KeyD: "d", KeyF: "f", KeyG: "g",
  KeyH: "h", KeyJ: "j", KeyK: "k", KeyL: "l",
  Semicolon: "u", Quote: "'",
  KeyZ: "z", KeyX: "x", KeyC: "c", KeyV: "v", KeyB: "b",
  KeyN: "n", KeyM: "m", Comma: ",", Period: ".", Slash: "/",
  Space: " ",
  Digit1: "1", Digit2: "2", Digit3: "3", Digit4: "4", Digit5: "5",
  Digit6: "6", Digit7: "7", Digit8: "8", Digit9: "9", Digit0: "0",
};

const KEYMAP_STORAGE_KEY = "atc_trainer_keymap";

// Keys that should always behave normally (navigation/editing), never
// remapped. Shared by every page that intercepts keydown for remapping.
const PASSTHROUGH_CODES = new Set([
  "Backspace", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
  "Home", "End", "Tab",
  "ShiftLeft", "ShiftRight", "ControlLeft", "ControlRight",
  "AltLeft", "AltRight", "MetaLeft", "MetaRight", "CapsLock", "Escape", "NumLock",
]);

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
  const prompt_text = `${callsign.callsign} we are a ${plane.display_name} VFR to ${location.display_name}`;
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

// Backfills any DEFAULT_KEYMAP entries missing from a saved keymap (e.g.
// after DEFAULT_KEYMAP gains a new key) without touching the user's
// existing customizations. Returns a new object; does not mutate saved.
function mergeKeymapDefaults(saved) {
  return Object.assign({}, DEFAULT_KEYMAP, saved || {});
}

// ---------- Keymap persistence (shared by every page) ----------

function loadKeymap() {
  let raw;
  try {
    raw = localStorage.getItem(KEYMAP_STORAGE_KEY);
  } catch (e) {
    raw = null; // localStorage unavailable (e.g. Firefox on a file:// page)
  }
  if (!raw) return Object.assign({}, DEFAULT_KEYMAP);
  try {
    return mergeKeymapDefaults(JSON.parse(raw));
  } catch (e) {
    return Object.assign({}, DEFAULT_KEYMAP);
  }
}

function saveKeymap(km) {
  try {
    localStorage.setItem(KEYMAP_STORAGE_KEY, JSON.stringify(km));
  } catch (e) {
    console.error("Could not save keymap:", e);
  }
}

// Inserts a string at the current cursor position of a text input/textarea.
function insertAtCursor(el, str) {
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? el.value.length;
  const val = el.value;
  el.value = val.slice(0, start) + str + val.slice(end);
  const pos = start + str.length;
  el.setSelectionRange(pos, pos);
}

// ============================================================
// Export for Node-based testing (harmless in the browser — module is undefined there)
// ============================================================
if (typeof module !== "undefined") {
  module.exports = {
    gradeAttempt, buildPrompt, norm, normCallsign, mergeKeymapDefaults,
    pickRandom, insertAtCursor,
    DEFAULT_KEYMAP, DEFAULT_LOCATIONS, DEFAULT_AIRCRAFT, DEFAULT_CALLSIGNS,
    KEYMAP_STORAGE_KEY, PASSTHROUGH_CODES,
  };
}
