# Clearance Readback Trainer + Speed Test (static / GitHub Pages)

Two pages, sharing one set of reference data and one keyboard mapping:

- **`index.html`** — the readback trainer. Random clearance prompt, graded
  4-line readback in a black/green terminal box.
- **`speedtest.html`** — a 60-second typing speed test: an aircraft name
  flashes, you type its designator and press Enter, next one appears.
  Score is aircraft-per-minute (since the round is fixed at 60s, the
  correct-answer count *is* the per-minute rate).

No backend, no build step. A small nav bar at the top of each page links
to the other, so it behaves like two tabs of one app.

## Files

- `data.js` — **shared** reference data (`DEFAULT_LOCATIONS`,
  `DEFAULT_AIRCRAFT`, `DEFAULT_CALLSIGNS`), the keyboard mapping default
  and its `localStorage` persistence, and the pure grading/prompt logic.
  Loaded by both pages before their own script — this is the one place
  aircraft/location/callsign data lives, so the two games can never drift
  out of sync.
- `script.js` — readback trainer page logic only (assumes `data.js` is
  already loaded).
- `speedtest.js` — speed test page logic only (also assumes `data.js`).
- `style.css` — shared styling for both pages.
- `test_logic.js` — Node-runnable tests for the pure logic in `data.js`.
- `simulate_pages.js` — optional: loads both HTML pages in a real DOM
  (via `jsdom`) and clicks through the key flows, to catch runtime errors
  before you ship. Requires `npm install` first (see below).

## Deploy to GitHub Pages

1. Create a new repo on GitHub (public or private both work for Pages on
   a personal account).
2. Push these files to the root of the repo (`main` branch):
   ```bash
   cd atc-trainer-static
   git init
   git add index.html speedtest.html style.css data.js script.js speedtest.js test_logic.js simulate_pages.js package.json README.md
   git commit -m "Clearance readback trainer + speed test"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo-name>.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages** → under "Build and deployment," set
   **Source** to "Deploy from a branch," branch `main`, folder `/ (root)`.
   Save.
4. GitHub gives you a URL like `https://<you>.github.io/<repo-name>/`
   within a minute or two.

Every future change is: edit a file, `git commit`, `git push`.

## Changing reference data

`DEFAULT_LOCATIONS`, `DEFAULT_AIRCRAFT`, `DEFAULT_CALLSIGNS` live as plain
arrays at the top of `data.js` — edit directly, `git commit`, `git push`.
No in-app editor for these; both pages pick up whatever's there. The
speed test only uses `DEFAULT_AIRCRAFT`.

## Keyboard mapping

`DEFAULT_KEYMAP` in `data.js` is the shipped starting point: physical key
(`KeyboardEvent.code`) → the character that key should type — the
physical position, not the printed letter, since that's what matters once
you've moved stickers around.

Editable from the readback trainer page: expand **Keyboard mapping** to
see a grid shaped like a physical keyboard (plus a numpad section). Each
box is one physical key; changes save automatically to `localStorage` and
take effect immediately. **Reset to shipped default** restores
`DEFAULT_KEYMAP` exactly as defined in code.

**The speed test uses the same saved mapping** — it's the same physical
keyboard, so there's one shared mapping rather than a separate one per
page. There's no keymap editor on the speed test page itself; edit it
from the trainer page and it applies everywhere.

Space and Enter aren't remappable on either page — they're reserved for
line-advance/submit (trainer) or just ignored/submit (speed test).

If `DEFAULT_KEYMAP` gains new keys later, anyone with existing
customizations in `localStorage` keeps them — only untouched keys pick up
the new default.

## Callsign grading: the "N" is optional

On the trainer's callsign line specifically, a leading `N` is stripped
from both your input and the correct answer before comparing — `874GV`
passes just as well as `N874GV`. Only applies to that one field.

## Speed test details

- Round is a fixed 60 seconds; hit **Start** to begin.
- Designator matching is an exact, case-insensitive match — no
  leniency (unlike the trainer's callsign field).
- The same aircraft never appears twice in a row.
- Score shown at the end: correct count (= aircraft/min), total
  attempted, and accuracy %. Nothing is saved anywhere — refresh and it's
  gone, by design.
- If you'd rather it *not* advance to the next aircraft on a wrong
  answer (forcing you to correct it before moving on), that's a
  reasonable alternative design — just ask and I can change it.

## Running tests

```bash
node test_logic.js
```
Exercises grading, prompt-building, and the keymap merge logic — no
dependencies needed. Re-run after editing any pure function in `data.js`.

Optional, more thorough check — actually loads both HTML pages in a real
DOM and clicks through Start/Show/typing flows:
```bash
npm install
npm run test:pages
```

## Local testing before you push

Just open `index.html` or `speedtest.html` directly in a browser — no
server needed. One caveat: Firefox restricts `localStorage` on pages
opened directly as a local file (`file://...`), so keymap edits and the
RWY28/10 choice won't persist there specifically (everything still
*works*, it just won't remember your choices between visits). This
doesn't affect GitHub Pages or Chromium browsers. If you want full
persistence while testing locally in Firefox, serve it instead:
```bash
python3 -m http.server 8000
```
then visit `http://127.0.0.1:8000`.
