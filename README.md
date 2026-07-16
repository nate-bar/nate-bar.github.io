# Clearance Readback Trainer (static / GitHub Pages version)

Random clearance prompt, graded readback, custom keyboard remapping — no
backend, no build step. Plain static site: `index.html`, `style.css`,
`script.js`. Reference data (callsigns/locations/aircraft) and the
keyboard mapping are both plain constants at the top of `script.js` — not
editable from the UI, not stored anywhere. The only thing that persists
between visits is which runway config (28/10) was last active, via
`localStorage`. No attempt history or scoring is recorded anywhere.

## Deploy to GitHub Pages

1. Create a new repo on GitHub (public or private both work for Pages on a
   personal account).
2. Push these files to the root of the repo (`main` branch):
   ```bash
   cd atc-trainer-static
   git init
   git add index.html style.css script.js test_logic.js README.md
   git commit -m "Clearance readback trainer"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo-name>.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages** → under "Build and deployment," set
   **Source** to "Deploy from a branch," branch `main`, folder `/ (root)`.
   Save.
4. GitHub gives you a URL like `https://<you>.github.io/<repo-name>/`
   within a minute or two.

Every future change is: edit a file, `git commit`, `git push`. GitHub
rebuilds automatically.

## Changing reference data or the keyboard mapping

Both live as plain arrays/objects at the top of `script.js`:

- `DEFAULT_LOCATIONS`, `DEFAULT_AIRCRAFT`, `DEFAULT_CALLSIGNS` — the
  lookup tables the prompt generator draws from.
- `DEFAULT_KEYMAP` — physical key (`KeyboardEvent.code`) → the character
  that key should type. Not the printed letter on a standard keycap — the
  physical position, which is what matters once you've moved stickers
  around.

Edit these directly, `git commit`, `git push`. There's no in-app editor
for either — that's intentional, since both are "set once" configuration
rather than something you'd change session to session.

## The answer box

One `<textarea>` styled as a black-background, green-text terminal, in
place of 4 separate fields. Type all 4 values into it in order:

1. Callsign
2. Location code
3. Aircraft designator
4. Runway letter

**Space bar moves to the next line** instead of typing a space character
— so pressing it after the callsign drops you onto line 2, and so on.
**Enter submits** the whole thing for grading. Backspace/Delete/arrows all
behave normally, including merging back across a line break, since it's a
real textarea under the hood.

Every other character key goes through `DEFAULT_KEYMAP` first — so
whatever's remapped to a given physical key is what lands in the box,
regardless of what's printed on the keycap.

## Callsign grading: the "N" is optional

For the callsign line specifically, a leading `N` is stripped from both
your input and the correct answer before comparing — so typing `874GV`
passes just as well as typing `N874GV`. This only applies to line 1; the
other three fields still need an exact (case-insensitive) match.

## Running tests

`test_logic.js` exercises grading (including the N-optional rule and the
config-dependent runway letter) and prompt-building without needing a
browser:

```bash
node test_logic.js
```

Re-run this after editing `gradeAttempt`, `buildPrompt`, or `normCallsign`
at the top of `script.js`.

## Local testing before you push

Just open `index.html` directly in a browser — no server needed, since
there's no backend to talk to. If you'd rather serve it over `http://`:

```bash
python3 -m http.server 8000
```
then visit `http://127.0.0.1:8000`.
