// Run with: node test_logic.js
// Exercises the pure logic in script.js (grading, prompt building, the
// N-optional callsign rule) without needing a browser. Re-run after any
// edits to the logic functions at the top of script.js.

const assert = require("assert");
const {
  gradeAttempt, buildPrompt, norm, normCallsign,
  DEFAULT_KEYMAP, DEFAULT_LOCATIONS, DEFAULT_AIRCRAFT, DEFAULT_CALLSIGNS,
} = require("./script.js");

// --- prompt building ---
const prompt = buildPrompt(DEFAULT_LOCATIONS, DEFAULT_AIRCRAFT, DEFAULT_CALLSIGNS);
assert.ok(prompt.prompt_text.includes(prompt.callsign.callsign));
assert.ok(prompt.prompt_text.includes(prompt.aircraft.display_name));
assert.ok(prompt.prompt_text.includes(prompt.location.display_name));
console.log("buildPrompt: OK ->", prompt.prompt_text);

const gardenValley = DEFAULT_LOCATIONS.find((l) => l.display_name === "Garden Valley");
const aztec = DEFAULT_AIRCRAFT.find((a) => a.designator === "PA23");
const cs = DEFAULT_CALLSIGNS[0]; // N874GV

// --- config-dependent letter grading ---
const r1 = gradeAttempt(cs, gardenValley, aztec, "10", [cs.callsign, "NE4", "PA23", "G"]);
assert.strictEqual(r1.all_pass, true, "config 10 should pass with letter G");
console.log("grade config10 all-correct: OK");

const r2 = gradeAttempt(cs, gardenValley, aztec, "28", [cs.callsign, "NE4", "PA23", "G"]);
assert.strictEqual(r2.all_pass, false, "config 28 should fail with letter G (should be A)");
assert.strictEqual(r2.results[3].pass, false);
assert.strictEqual(r2.results[3].correct, "A");
console.log("grade config28 letter-mismatch: OK");

// --- case-insensitivity on non-callsign fields ---
const r3 = gradeAttempt(cs, gardenValley, aztec, "10", [cs.callsign.toLowerCase(), "ne4", "pa23", "g"]);
assert.strictEqual(r3.all_pass, true, "grading should be case-insensitive");
console.log("grade case-insensitive: OK");

// --- N-optional callsign grading ---
assert.strictEqual(normCallsign("N874GV"), "874GV");
assert.strictEqual(normCallsign("874GV"), "874GV");
assert.strictEqual(normCallsign("n874gv"), "874GV");
console.log("normCallsign: OK");

const r4 = gradeAttempt(cs, gardenValley, aztec, "10", ["874GV", "NE4", "PA23", "G"]);
assert.strictEqual(r4.results[0].pass, true, "callsign without leading N should still pass");
assert.strictEqual(r4.all_pass, true);
console.log("grade callsign without N: OK");

const r5 = gradeAttempt(cs, gardenValley, aztec, "10", ["N874GV", "NE4", "PA23", "G"]);
assert.strictEqual(r5.results[0].pass, true, "callsign with leading N should still pass");
console.log("grade callsign with N: OK");

const r6 = gradeAttempt(cs, gardenValley, aztec, "10", ["874GB", "NE4", "PA23", "G"]);
assert.strictEqual(r6.results[0].pass, false, "a genuinely wrong callsign must still fail");
console.log("grade wrong callsign still fails: OK");

// --- DEFAULT_KEYMAP matches the custom layout provided ---
assert.strictEqual(DEFAULT_KEYMAP.Numpad1, "7");
assert.strictEqual(DEFAULT_KEYMAP.Numpad7, "1");
assert.strictEqual(DEFAULT_KEYMAP.Minus, "g");
assert.strictEqual(DEFAULT_KEYMAP.KeyR, "h");
assert.strictEqual(DEFAULT_KEYMAP.Digit5, "a");
assert.strictEqual(DEFAULT_KEYMAP.Space, " ");
console.log("DEFAULT_KEYMAP custom layout: OK");

// --- norm ---
assert.strictEqual(norm("  n874gv  "), "N874GV");
console.log("norm: OK");

console.log("\nAll logic tests passed.");
