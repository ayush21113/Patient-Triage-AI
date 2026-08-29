# UI Survey Brief
### Capture every screen, prove nothing overlaps, and write the walkthrough

Addendum to `UI-REWORK-BRIEF.md`. Do **Part D** first — it produces the evidence that tells you what to fix. Do **Part E** last, after the fixes, so the document ships the corrected UI.

**No engine, protocol, or cohort changes.** Tooling dependencies live in `scripts/` or `tests/` and never in the deploy path.

---

## Part D — See the whole picture, and prove it geometrically

You have been auditing regions. The defects are between regions and under overlays, which is why a region-by-region check missed them.

### D1 · Capture the complete state matrix

Full-page screenshots, Playwright, **`fullPage: true`** — not viewport crops. Write to `docs/ui-survey/`.

| Axis | Values |
|---|---|
| Screen | S0 header · S1 queue · S2 inspector (empty state) · S2 inspector (PT-0004 selected) · S2 inspector (PT-0007, abstaining) · S3 arrival capture · S4 reassessment · S5 audit drawer · S6 fairness · S7 surge banner · S8 emergency alert · S9 sim console |
| Mode | NORMAL · SURGE · DEGRADED · SURGE+DEGRADED |
| Viewport | 1280×800 · 1024×768 |
| Theme | light · dark |

Not every combination is meaningful — capture the ones that are, and **NORMAL / 1280×800 / light is the primary set**. Name files `S<n>-<screen>-<mode>-<viewport>-<theme>.png`.

Some states need driving to reach: select a row for S2, open the sheets for S3/S4, press `SURGE ×3` and advance the clock 15 simulated minutes for S7, `LOSE MONITORS` for degraded, load the cohort for S8 (PT-0013 fires on load). Script each one; do not capture by hand.

### D2 · Detect overlap and clipping programmatically

**This is the part that matters.** "It looks fine" is not evidence, and it is what let three violations through. Add `tests/e2e/layout-integrity.spec.js`:

```js
// In-page, for each captured state:
// 1. Collect every element that owns a direct non-empty text node.
// 2. For each pair that is NOT in an ancestor/descendant relationship,
//    intersect their bounding rects. Any intersection wider than 1px AND
//    taller than 1px is a FAILURE — report both selectors and the rect.
// 3. Clipping: el.scrollWidth > el.clientWidth + 1  → FAILURE (text cut off).
// 4. Containment: a child rect extending outside its nearest positioned
//    ancestor's rect → FAILURE (this is what the calc(100% + 452px) hack does).
// 5. Viewport: any element whose right edge exceeds the viewport width → FAILURE.
```

Run it across **every** state in D1. Report a table: state, rule violated, both selectors, the offending rectangles.

Expect it to fail loudly on first run — that is the point. Known offenders from the screenshot: the reassess/movement line over the complaint text; `INSUFFICIENT` truncating to `INS`; the band chip's provisional sub-label under the `⊘`; the complaint column running under `HR`.

Keep this test in the suite permanently. Layout regressions are invisible to unit tests and expensive to find by eye.

### D3 · Look at the full-page captures yourself

After D2 is green, open every image in the primary set and answer, per screen, in one sentence: **what is this screen for, and what would make a nurse hesitate?** Anything that makes you hesitate is a defect — log it and fix it before Part E.

---

## Part E — The screen-by-screen walkthrough (.docx)

Deliverable: **`docs/PatientTriage-ai_UI-Walkthrough.docx`**, built with `python-docx` from a script in `scripts/build-walkthrough.py`. Screenshots are the corrected NORMAL/1280×800/light set, plus the mode variants where the mode is the point.

The reader is someone who has never seen the product — a judge, a clinician, a teammate — and who needs to know what each window is for without watching a demo.

### Structure

**Title page.** Product name, one-sentence description, team, challenge and round, revision and date, and the synthetic-data notice.

**Contents.**

**One page (or two) per screen**, in the order a user meets them — S0, S1, S2, S3, S4, S7, S8, S5, S6, S9. Each section:

| Heading | Content |
|---|---|
| **Screenshot** | Full width, with a caption naming the state it was captured in |
| **What this is** | One or two sentences. Plain language, no jargon. |
| **When it appears** | Always visible / on demand / automatic, and what triggers it |
| **What you are looking at** | A numbered table of every element on screen: its label, what it means, and where the value comes from. This is the part the reader will actually use. |
| **What the user does here** | The actions available and what each one causes |
| **Why it exists** | One sentence tying it to the clinical problem — the reason this screen is on the board at all |

**Then three short sections:**

- **Reading a queue row** — one annotated row blown up, every zone labelled: band chip, ID, age/sex, complaint, the five vitals, wait, confidence, meta line. Include the full glyph and token legend: `P1`–`P5`, `⊘`, `●` `◑` `◐` `○`, `‡`, `——`, `▲` `▼`, and every text token (`LOCKED`, `REASSESS`, `NURSE`, `ESCALATE`, `ESTABLISHED`, `PROBABLE`, `UNRESOLVED`, `UNRESOLVABLE`, `INSUFFICIENT`).
- **The four modes** — NORMAL, SURGE, DEGRADED, SURGE+DEGRADED. Screenshot each, say what triggers it, what changes on screen, and what the nurse should do differently.
- **The five-minute demo path** — the ten steps from the README, each with the screenshot of the state it lands on, so the document doubles as a rehearsal script.

### Rules

- **Every claim in the document must match the shipped build.** If the document and the UI disagree, the UI is right and the document is a defect. Do not describe intended behaviour.
- Plain language in the prose; exact tokens in the tables. A clinician reads the prose, a judge checks the tables.
- No screenshot may show a state with a known layout defect. Fix first, then capture.
- Do not restate the PRD or the TRD. This document answers *what am I looking at*, nothing else.
- Keep it under 25 pages. If a screen needs more than two pages, the screen is too complicated.

---

## Order of work

1. **D1** — capture the full state matrix.
2. **D2** — write and run the layout-integrity test. Expect failures.
3. Fix everything D2 reports, plus Parts A and B of `UI-REWORK-BRIEF.md`.
4. Re-run D1 and D2. Both clean, full suite green.
5. **D3** — look at the images and fix what makes you hesitate.
6. **E** — build the .docx from the corrected captures.

Report at the end: the D2 failure table before and after, the final screenshot set, the .docx path, and full suite status. Log the rework as its own decision entries.
