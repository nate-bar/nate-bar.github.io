const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

function loadPage(htmlFile) {
  return new Promise((resolve, reject) => {
    const html = fs.readFileSync(path.join(__dirname, htmlFile), "utf8");
    const errors = [];
    const dom = new JSDOM(html, {
      url: `file://${__dirname}/${htmlFile}`,
      runScripts: "dangerously",
      resources: "usable",
      pretendToBeVisual: true,
    });
    dom.window.onerror = (msg) => errors.push(msg);
    dom.window.addEventListener("error", (e) => errors.push(e.error ? e.error.stack : e.message));

    // give scripts (loaded via file resource loader) a tick to execute
    setTimeout(() => {
      resolve({ dom, errors });
    }, 300);
  });
}

async function main() {
  let anyFailure = false;

  for (const file of ["index.html", "speedtest.html"]) {
    console.log(`\n=== ${file} ===`);
    const { dom, errors } = await loadPage(file);
    const { window } = dom;
    const { document } = window;

    if (errors.length) {
      anyFailure = true;
      console.log("Runtime errors during load:");
      errors.forEach((e) => console.log("  ", e));
    } else {
      console.log("No runtime errors during load.");
    }

    if (file === "index.html") {
      // sanity: prompt should have populated (not stuck on "Loading…")
      const promptText = document.getElementById("promptText").textContent;
      console.log("promptText:", JSON.stringify(promptText));
      if (promptText === "Loading…") { anyFailure = true; console.log("  FAIL: prompt never loaded"); }

      // simulate clicking "Show" on the keymap panel
      document.getElementById("toggleKeymap").dispatchEvent(new window.Event("click"));
      const keymapBody = document.getElementById("keymapBody");
      console.log("keymapBody display after click:", keymapBody.style.display);
      if (keymapBody.style.display !== "block") { anyFailure = true; console.log("  FAIL: keymap panel did not open"); }

      const gridInputs = document.querySelectorAll("#keymapGrid input").length;
      const numpadInputs = document.querySelectorAll("#numpadGrid input").length;
      console.log("keymapGrid inputs:", gridInputs, "| numpadGrid inputs:", numpadInputs);
      if (gridInputs === 0 || numpadInputs === 0) { anyFailure = true; console.log("  FAIL: grid(s) did not render"); }

      // simulate typing in the answer box using the remapped keyboard
      const answerBox = document.getElementById("answerBox");
      answerBox.dispatchEvent(new window.KeyboardEvent("keydown", { code: "KeyQ", bubbles: true, cancelable: true }));
      console.log("answerBox value after KeyQ:", JSON.stringify(answerBox.value));
    }

    if (file === "speedtest.html") {
      document.getElementById("startBtn").dispatchEvent(new window.Event("click"));
      const aircraftName = document.getElementById("aircraftName").textContent;
      console.log("aircraftName after start:", JSON.stringify(aircraftName));
      if (!aircraftName || aircraftName === "—") { anyFailure = true; console.log("  FAIL: round did not start"); }

      const playScreenVisible = document.getElementById("playScreen").style.display === "block";
      console.log("playScreen visible:", playScreenVisible);
      if (!playScreenVisible) { anyFailure = true; console.log("  FAIL: play screen not shown"); }

      // simulate typing something and pressing Enter
      const input = document.getElementById("designatorInput");
      input.dispatchEvent(new window.KeyboardEvent("keydown", { code: "KeyC", bubbles: true, cancelable: true }));
      console.log("designatorInput value after KeyC:", JSON.stringify(input.value));
      input.dispatchEvent(new window.KeyboardEvent("keydown", { code: "Enter", bubbles: true, cancelable: true }));
      const nameAfterEnter = document.getElementById("aircraftName").textContent;
      console.log("aircraftName after Enter (should have advanced):", JSON.stringify(nameAfterEnter));
      if (nameAfterEnter === aircraftName) { anyFailure = true; console.log("  FAIL: did not advance to next aircraft"); }
    }

    dom.window.close();
  }

  console.log(anyFailure ? "\nFAILURES DETECTED" : "\nAll page-load simulations passed.");
  process.exit(anyFailure ? 1 : 0);
}

main();
