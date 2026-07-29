// Run with: node test_logic.js
// Exercises the pure logic in script.js (grading, prompt building, the
// N-optional callsign rule, keymap merge) without needing a browser.
// Re-run after any edits to the logic functions at the top of script.js
// OR after editing DEFAULT_LOCATIONS/DEFAULT_AIRCRAFT/DEFAULT_CALLSIGNS —
// this file deliberately does NOT hardcode specific codes/designators, so
// it stays correct even as the reference lists change.

const assert = require("assert");
const {
  gradeAttempt, buildPrompt, norm, normCallsign, mergeKeymapDefaults,
  DEFAULT_KEYMAP, DEFAULT_LOCATIONS, DEFAULT_AIRCRAFT, DEFAULT_CALLSIGNS,
} = require("./script.js");

// --- prompt building ---
const prompt = buildPrompt(DEFAULT_LOCATIONS, DEFAULT_AIRCRAFT, DEFAULT_CALLSIGNS);
assert.ok(prompt.prompt_text.includes(prompt.callsign.callsign));
assert.ok(prompt.prompt_text.includes(prompt.aircraft.display_name));
assert.ok(prompt.prompt_text.includes(prompt.location.display_name));
console.log("buildPrompt: OK ->", prompt.prompt_text);

// Pick two locations whose RWY28/RWY10 letters actually differ, so the
// config-dependent test is meaningful regardless of what's in the list.
const varyingLocation = DEFAULT_LOCATIONS.find((l) => l.letter_rwy28 !== l.letter_rwy10);
assert.ok(varyingLocation, "test setup: need at least one location where the letter differs by config");
const plane = DEFAULT_AIRCRAFT[0];
const cs = DEFAULT_CALLSIGNS[0];

// --- config-dependent letter grading ---
const r1 = gradeAttempt(cs, varyingLocation, plane, "10", [cs.callsign, varyingLocation.code, plane.designator, varyingLocation.letter_rwy10]);
assert.strictEqual(r1.all_pass, true, "correct RWY10 letter should pass under config 10");
console.log("grade config10 all-correct: OK");

const r2 = gradeAttempt(cs, varyingLocation, plane, "28", [cs.callsign, varyingLocation.code, plane.designator, varyingLocation.letter_rwy10]);
assert.strictEqual(r2.all_pass, false, "RWY10's letter should fail under config 28 (they differ for this location)");
assert.strictEqual(r2.results[3].pass, false);
assert.strictEqual(r2.results[3].correct, varyingLocation.letter_rwy28);
console.log("grade config28 letter-mismatch: OK");

// --- case-insensitivity on non-callsign fields ---
const r3 = gradeAttempt(cs, varyingLocation, plane, "10", [
  cs.callsign.toLowerCase(), varyingLocation.code.toLowerCase(),
  plane.designator.toLowerCase(), varyingLocation.letter_rwy10.toLowerCase(),
]);
assert.strictEqual(r3.all_pass, true, "grading should be case-insensitive");
console.log("grade case-insensitive: OK");

// --- N-optional callsign grading ---
assert.strictEqual(normCallsign("N874GV"), "874GV");
assert.strictEqual(normCallsign("874GV"), "874GV");
assert.strictEqual(normCallsign("n874gv"), "874GV");
console.log("normCallsign: OK");

// find a callsign that actually starts with N to test the optional-N behavior
const nCallsign = DEFAULT_CALLSIGNS.find((c) => c.callsign.startsWith("N"));
assert.ok(nCallsign, "test setup: need at least one N-prefixed callsign");
const strippedTail = nCallsign.callsign.slice(1);

const r4 = gradeAttempt(nCallsign, varyingLocation, plane, "10",
  [strippedTail, varyingLocation.code, plane.designator, varyingLocation.letter_rwy10]);
assert.strictEqual(r4.results[0].pass, true, "callsign without leading N should still pass");
console.log("grade callsign without N: OK");

const r5 = gradeAttempt(nCallsign, varyingLocation, plane, "10",
  [nCallsign.callsign, varyingLocation.code, plane.designator, varyingLocation.letter_rwy10]);
assert.strictEqual(r5.results[0].pass, true, "callsign with leading N should still pass");
console.log("grade callsign with N: OK");

const r6 = gradeAttempt(nCallsign, varyingLocation, plane, "10",
  [strippedTail + "X", varyingLocation.code, plane.designator, varyingLocation.letter_rwy10]);
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

// --- mergeKeymapDefaults: user customizations survive, new defaults backfill ---
const savedKeymap = { KeyQ: "Z" }; // simulates a saved keymap missing most keys
const merged = mergeKeymapDefaults(savedKeymap);
assert.strictEqual(merged.KeyQ, "Z", "existing customization must survive merge");
assert.strictEqual(merged.Numpad1, "7", "missing keys must be backfilled from DEFAULT_KEYMAP");
assert.strictEqual(savedKeymap.KeyQ, "Z", "merge must not mutate the input");
assert.strictEqual(savedKeymap.Numpad1, undefined, "merge must not mutate the input");
console.log("mergeKeymapDefaults: OK");

// --- norm ---
assert.strictEqual(norm("  n874gv  "), "N874GV");
console.log("norm: OK");

console.log("\nAll logic tests passed.");
