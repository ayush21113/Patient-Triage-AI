# AGENTS.md
### Context file for AI coding agents — load this before generating any code

Works as `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or a Lovable knowledge entry. Copy it in verbatim.

---

## Project

**PatientTriage.ai** — a decision-support layer over an emergency-department waiting room. It scores triage priority from sparse arrival data, recomputes continuously, abstains when it cannot discriminate, and hands every final call to the nurse.

Full specification lives in `docs/01-PRD.md` through `docs/06-IMPLEMENTATION-PLAN.md`. **This file is a summary, not a substitute.** Read `02-TRD.md` and `04-UIUX-BRIEF.md` in full before writing code.

---

## Hard constraints — violating any of these is a rejected change

### Architecture

1. **No build step.** No Vite, Webpack, Rollup, Parcel, esbuild, or npm script in the deploy path. The files in the repo are the files that are served — nothing is compiled or generated. Offline operation comes from the service worker after one HTTPS load, or from a packaged WebView; `file://` is not the supported path (TRD §1).
2. **No framework.** No React, Next.js, Vue, Svelte, Angular, Alpine, htmx, jQuery.
3. **No runtime dependencies.** Zero. Native ES modules only.
4. **No Tailwind, no shadcn/ui, no Bootstrap, no CSS-in-JS.** One hand-written stylesheet with a custom-property token block at the top.
5. **No charting library.** No Chart.js, D3, Plotly, Recharts. Charts are hand-authored inline SVG.
6. **No icon library and no emoji.** No Lucide, Feather, Heroicons, Font Awesome, Material Icons. Five typographic marks plus two hand-drawn SVGs.
7. **No date library, no HTTP client, no state library, no polyfills.** `Intl`, `Date`, `fetch`.

If a task appears to need one of these, the task has been misread. Re-read `docs/02-TRD.md`.

### Engine purity

`assets/js/engine/` contains pure functions only.

- No DOM access.
- No storage access.
- **No `Date.now()`.** `now` is always a parameter.
- Same inputs → byte-identical output, always.

This is what makes the scores deterministic, reproducible, and testable, and it is a stated non-functional requirement, not a style preference.

### Clinical safety invariants

These are enforced in code, not by convention. `engine/index.js` throws if any is violated.

| # | Invariant |
|---|---|
| 1 | **No assessment is ever returned without a `confidence` value.** |
| 2 | **A fired `PIN_P1` hard rule always yields band `P1` and `modelLockedOut = true`, and the engine may not emit any recommendation containing a wait.** |
| 3 | **`interval_low ≤ priorityIndex ≤ interval_high`, always.** |
| 4 | **Ties break upward.** Undertriage costs 8× overtriage. |
| 5 | **Age band is computed before any threshold table is selected.** Never look up an adult table and correct for age afterwards. |
| 6 | **Abstention is a real output state**, with `band = null`, at least two `candidateBands`, and a `provisionalBand`. `UNRESOLVED` **always** carries exactly one resolving question — no exceptions, no null. Where no question can resolve the ambiguity the state is `UNRESOLVABLE`, which carries a `noQuestionReason` instead and instructs escalation. Never emit `UNRESOLVED` with a null question. |
| 7 | **Override never requires a dialog or a justification field.** `reason_chip` is nullable by design. |
| 8 | **The audit log is append-only and hash-chained.** No `UPDATE`, no `DELETE`. |

---

## Design contract — binding

Full detail in `docs/04-UIUX-BRIEF.md` §2. The short version:

### Never
Inter · Roboto · Poppins · Montserrat · Space Grotesk · purple/indigo/violet in any form · any gradient · any `box-shadow` · `border-radius` above 2 px · glassmorphism or backdrop-blur · cards · three-across feature grids · icon libraries · emoji · `fade-in-up` or any entrance animation · uniform `gap-4` spacing · stock imagery · marketing copy register.

### Always
- **Type:** IBM Plex Mono (all numbers), IBM Plex Sans (prose), IBM Plex Sans Condensed (uppercase micro-labels), IBM Plex Serif (inspector derivation headings only).
- **Ground:** `#F2F0EA` warm paper. Structure carried by 1 px hairlines. Zero shadows anywhere.
- **Colour is a signal, never a surface.** Five hues, each bound to one meaning. P3 — the middle band — is **achromatic on purpose**.
- **Every state carries hue + text token + glyph.** Colour is never the sole carrier of meaning.
- **`font-variant-numeric: tabular-nums`** on every numeric element.
- **Two animations only:** a 140 ms value flash and a 180 ms row translate. Nothing else moves.
- **Unobtainable values render as `——`**, never `0`, `N/A`, `null`, or an empty cell.

### Copy register
Terse, clinical, declarative. Every string states a fact and, where relevant, its consequence.

Write: *"Not obtained. Interval widened."* · *"Cannot discriminate P2 from P3."* · *"Tie broken upward. Undertriage cost 8:1."*

Never: *"No data available"* · *"Low confidence"* · *"Erring on the side of caution"* · anything with an exclamation mark.

---

## File map

```
index.html · sw.js · vercel.json · manifest.webmanifest · .gitignore
docs/                             incl. 07-DECISION-LOG.md — append as you build
tests/  unit/ property/ golden/ e2e/ fixtures/ package.json   dev only, never served
assets/css/board.css              tokens at top, no literals below
assets/data/protocol.v1.json      hospital-owned rules — NOT code
assets/data/cohort.json           20 synthetic encounters
assets/js/
  main.js state.js clock.js audit.js fairness.js
  engine/  index rules physiology presentation hazard uncertainty bands
  sim/     cohort surge
  render/  board inspector modes charts
  util/    dom fmt storage
```

One module, one responsibility. `main.js` wires; it contains no logic.

---

## Working method

1. Follow `docs/06-IMPLEMENTATION-PLAN.md` **one step at a time, in order.** Do not batch. Do not skip ahead to the visible parts.
2. Run each step's exit test before starting the next.
3. The engine (Phase 1, steps 4–11) is built and fully tested **before anything renders.** This feels wrong and is correct.
4. When a clinical threshold is needed, it comes from `protocol.v1.json` — never a literal in code.
5. When unsure about a value, look it up in the docs. If it genuinely is not specified, **`docs/DECISION-PROTOCOL.md` governs**: decide on the conservative branch, log it, and proceed. Stop only for a clinical constant with no derivable basis, a missing safety gate, an absent content artefact, or an architectural property that makes a stated claim unreachable.

---

## Domain vocabulary

| Term | Meaning here |
|---|---|
| **Band** | Priority level P1–P5, aligned to ESI 1–5 |
| **Priority Index** | Continuous 0–100 score behind the band |
| **Abstention** | The engine declines to assign a band and names two candidates. `UNRESOLVED` asks one question; `UNRESOLVABLE` says questioning cannot help and escalates; `INSUFFICIENT` asks for missing observations. |
| **Information gain** | 0–1 score for how much a question would resolve the current ambiguity. Below 0.25 the question is not worth the nurse's twenty seconds. |
| **Provisional band** | The safe upper band used for queue position while abstaining |
| **Hard rule / L0** | Deterministic hospital-owned criterion that overrides the model entirely |
| **Drift** | Rate of change of vitals across the observation series |
| **Time hazard** | Risk accrued from waiting, weighted by current band |
| **Evidence completeness (E)** | 0–1 measure of how much input was actually obtained |
| **Unobtainable** | Attempted and failed — distinct from "not recorded" |
| **Override** | The nurse repositioning a patient. Always permitted, always logged, never blocked. |
| **Worst-served subgroup** | The fairness reporting unit. Aggregates are never reported. |

---

## Testing

- **Unit:** `node:test`. NEWS2 tables cell-by-cell against the published chart. Paediatric boundaries. Hypotension formula at ages 1, 5, 10.
- **Property:** 10,000 random encounters — every output has a confidence; `PIN_P1` always yields P1; the interval always contains the point estimate.
- **Regression:** golden-file snapshot of all 20 cohort assessments at t=0, t=30, t=60 min.
- **Integration:** Playwright — board renders, drift moves PT-0002, surge switches mode, override writes a chain-verified audit record.

No push to `main` without unit and property tests green.

---

## Deployment

Static, from GitHub `main`, to Vercel. Framework preset `Other`, build command **empty**, output directory `.`. There is nothing to configure because there is nothing to build.

Local: `python3 -m http.server 8000` — needed only because ES modules and service workers are blocked on `file://`.
