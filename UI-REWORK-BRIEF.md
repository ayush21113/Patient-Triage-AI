# UI Rework Brief
### Step 35 signed off on a board that cannot be read. Reopen it.

Steps 1–36 are otherwise complete and the engine is sound. This is a render-layer brief. **No engine, protocol, or cohort file changes.** All 151 core tests must stay green.

---

## Part A — Four contract violations and a bug

These are not preferences. Three of them break `04-UIUX-BRIEF.md`, which is binding.

### A1 · The complaint text is being overwritten *(blocking)*

`board.css` puts the reassess/movement line at `position: absolute; top: 25px` with `width: calc(100% + 452px - var(--s3))` inside a 42px row. It paints **on top of** the complaint and spills across the vitals columns. On screen: `Complaint not obtained` with `▲▲▲ REASSESS · 27m OVERDUE` printed through it.

**Fix.** Remove the absolute positioning and the `calc()` spill entirely. Make the complaint cell a two-row grid: complaint on line 1, meta line on line 2, both clipped to the column. Raise row height to **52 px** normal / 20 px collapsed.

**Assert:** no element in the queue table uses `position: absolute`. No rendered text box overlaps another — check by bounding-box comparison in the browser test, not by eye.

### A2 · The wait cell is a second filled block *(blocking)*

`.row-overdue > .wait-cell { background: var(--sig-escalate) }` fills the cell. **UIUX §6.1: exactly one element in the system is a filled block, and it is the P1 chip.**

It is worse in practice than in principle. Reassessment intervals are 15/30/60 min and the cohort starts with waits of 22–118 min, so nearly every row trips it simultaneously and the board grows a solid orange column down its middle. That is colour used as a surface, which §3.2 forbids, and it flattens the alarm hierarchy: when most of the screen is a signal colour, none of it signals.

**Fix.** Overdue = the `REASSESS` text token + a 2 px left rule in `--sig-escalate` + the existing `▲` glyph. No background fill.

**Assert:** add to `design-contract.test.js` — the stylesheet contains **exactly one** rule setting a signal hue as `background`, and it targets the P1 chip.

### A3 · Confidence tokens are clipped *(blocking)*

`INSUFFICIENT` renders as `II`, `INS`, `INSUFI` at different widths. A truncated safety token is worse than no token: `INS` is not a word, and the reader cannot tell whether it was truncated or is a state they do not know.

**Fix.** Widen the column to fit the longest token (`UNRESOLVABLE`) at `--t-micro`, or commit to fixed four-letter forms. Either way, nothing truncates. Same audit for the band chip's provisional sub-label, currently unreadable under the `⊘`.

### A4 · The degraded banner is a paragraph

Three "cannot discriminate" clauses wrapping to two lines, above the queue, in a state where the nurse most needs the queue.

**Fix.** One line, one number: `DEGRADED — no monitors · 19 of 20 cannot be discriminated · entered 14:01`. The per-band breakdown moves to the inspector, where there is room for it.

### A5 · Re-shoot every audit screenshot in NORMAL mode

Step 35's evidence was captured in degraded mode with everything overdue — the single worst state the board can be in, and the state that hid A1–A3. Re-run the audit in normal mode with vitals present, then again in degraded as a secondary case.

---

## Part B — Make it usable

The board currently reads as software nobody has sat in front of. That is the real "AI-generated" tell here — not gradients or the wrong typeface, which the design system already avoids, but the absence of use. Every symptom below comes from rendering being checked against a spec instead of against a person trying to read it at arm's length.

**B1 · Give rows room.** 52 px, `--s2` vertical padding, meta line at `--t-meta` in `--ink-2`. Two lines of content in a 42 px row is why everything collides.

**B2 · Vary weight so the eye has somewhere to go.** Every row currently shouts equally. The complaint is the thing a nurse reads first — set it at `--t-row` in `--ink`. The meta line is secondary — `--ink-2`, one size down. Age/sex and ID are reference data — `--ink-3`. Right now they are all competing.

**B3 · `——` should not read as broken.** Ten columns of em-dashes looks like a failed render. Set unobtainable values in `--ink-3` at reduced size with a single `unobt.` column-header note while in degraded mode, so the absence is legible as a *state* rather than as damage.

**B4 · Fill the inspector's empty state.** Two-thirds of that panel is blank below "Overrides this shift". Add the things a charge nurse actually wants at a glance: the three longest waits by band, count of patients currently abstaining, and time since the last override. Do not add decoration — add information.

**B5 · Make the abstention chip readable.** The `P2` under the `⊘` is smaller than its own border. Either stack it legibly at `--t-micro` with real spacing, or put the provisional band beside the glyph rather than beneath it.

**B6 · Reconsider what degraded mode shows.** With no monitors, 19 of 20 patients abstain — technically correct, practically a board that says "I don't know" nineteen times, which communicates nothing. Keep the honest scoring, but **sort abstaining patients by provisional band and show the provisional band prominently**, so the board still answers "who do I see next?" — the question it exists to answer. Abstention should change the confidence display, not erase the ordering.

**B7 · Sit with it for ten minutes before you call this done.** Load the board in normal mode. Answer, out loud, without scrolling or clicking: *who do I see next, and why?* Then switch to degraded and answer it again. Anything that makes you hesitate is a defect — record it and fix it. This is the check that Steps 15–20 were missing.

---

## Part C — Why this got through, and what changes

Steps 15–20 were audited by the agent that wrote them, against screenshots that agent chose, using a checklist that agent was reading while implementing. Three contract violations passed a review designed to catch exactly those three.

For this rework:

- **Assert overlap geometrically, not visually.** Bounding-box comparison in the browser test. "It looks fine" is not evidence.
- **Assert the filled-block rule in code**, per A2. A design rule that only lives in a document is a rule that gets broken.
- **Capture normal mode first.** Degraded and surge are secondary states; auditing in them hides defects in the primary one.
- **Use the reviewer subagent from `DECISION-PROTOCOL.md` §6** on the finished board, with a fresh read and one question: *would a nurse be able to read this at arm's length while being interrupted?*

Log the rework as its own decision entries. When finished, report: the five A-items with evidence, the B-items you changed, the full suite green, and fresh normal-mode screenshots at 1280×800 and 1024×768.
