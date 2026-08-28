# 02 · Technical Requirements Document
### PatientTriage.ai — stack, architecture, scoring engine specification

| | |
|---|---|
| **Governs** | Every technical decision. If an AI coding agent is about to guess a library, framework, file location or algorithm, the answer is here. |
| **Depends on** | `01-PRD.md` |
| **Revision** | 1.0 |

---

## 1. The one hard constraint

> **No build step. No bundler. No framework. No `node_modules` in the deploy path.**

The files that live in the repository are the files that are served. Nothing is compiled, transpiled, bundled or generated. The identical tree deploys to Vercel by pointing Vercel at the GitHub repository with zero configuration, and runs on a tablet with no internet.

**What "runs offline" means precisely.** Browsers block ES modules and service workers on the `file://` scheme, so a bare double-click of `index.html` is *not* the supported path. Offline operation is delivered two ways, and both are first-class:

1. **Service-worker cache.** The application is loaded once over HTTPS — from Vercel, or from any local server on the hospital network — after which `sw.js` serves every asset from cache. The device can then be offline indefinitely, across reloads and reboots. This is the Stage-1 deployment.
2. **Packaged WebView.** The same unmodified files wrapped in an Android WebView, where the `file://` restriction does not apply. This is the route for a tablet that will never see a network at all.

The distinction that matters for the product claim is **no build step and no server-side runtime**, not the `file://` scheme specifically. A developer inspecting the tree locally uses `python3 -m http.server 8000` (§10).

This is not a shortcut. It is the Stage-1 product requirement (PRD NFR-4, FR-7 assumption "front-door data only, one tablet") expressed as an architecture. A build step is a dependency on a laptop, a Node version and a network — three things a district hospital at 2 a.m. does not have.

Consequences, accepted deliberately:
- Native ES modules (`<script type="module">`), served over HTTP(S) or `file://` with a documented local-server fallback.
- No JSX, no TypeScript compilation, no PostCSS, no Tailwind.
- No npm runtime dependencies. Dev dependencies exist only for testing and are never shipped.

---

## 2. Stack — decided, not to be re-litigated

| Layer | Decision | Why this and not the obvious alternative |
|---|---|---|
| **Markup** | Hand-written semantic HTML5, one page | A framework would add 40 kB and a build step to render a table |
| **Styling** | One hand-written CSS file. Custom properties for the token layer. CSS Grid + Flexbox. | **Explicitly not Tailwind.** Tailwind's defaults are the single largest source of the generic AI-generated look (see `04-UIUX-BRIEF.md` §2). A hand-written sheet forces every value to be chosen. |
| **Behaviour** | Vanilla ES2022 modules. No React, Vue, Svelte, Alpine, htmx, jQuery. | The whole application is one list, one detail panel and a timer. A framework here is cost without benefit, and it would put a build step between us and the tablet. |
| **State** | A single observable store module (`state.js`) with an explicit reducer-style `dispatch`. No proxies, no magic. | Auditable state transitions matter for a clinical audit log. Magic reactivity does not. |
| **Rendering** | Targeted DOM patching in `render.js`. Full re-render of the board is permitted (60 rows in <16 ms); rows are keyed by encounter ID and reused. | Virtual DOM is unnecessary at n=60. Measure before optimising. |
| **Persistence** | `localStorage` for session state, `IndexedDB` for the append-only audit log. Both wrapped in `storage.js`, both fully optional — the app runs with storage unavailable. | Stage 1 is device-local by design; nothing needs a server. |
| **Offline** | A service worker (`sw.js`) with a cache-first strategy over a precache manifest. | This *is* the "keeps working when the internet goes down" claim, made real. |
| **Charts** | Hand-authored inline SVG generated in JS. **No Chart.js, D3, Plotly, Recharts.** | Two charts (bias bars, trend sparklines). A charting library would be 60 kB to draw thirty rectangles, and would import its own visual defaults. |
| **Fonts** | IBM Plex Sans, IBM Plex Mono, IBM Plex Serif via Google Fonts, self-cached by the service worker, with a full system fallback stack. | Deliberate non-default type. Never Inter, Roboto, Poppins, Montserrat or Space Grotesk. |
| **Icons** | Inline SVG, 1 px stroke, hand-drawn, five glyphs total. **No Lucide, Feather, Heroicons, Font Awesome, or emoji.** | Icon libraries carry the visual fingerprint we are avoiding. |
| **Testing** | Node's built-in `node:test` runner for the engine. Playwright for the board smoke test. Both dev-only. | Zero runtime dependency; the engine is pure functions and trivially testable. |
| **Hosting** | Vercel, static, from GitHub `main`. `vercel.json` sets headers only. | Zero-config static deploy is the point. |
| **Runtime deps** | **None.** | |

### 2.1 Explicit prohibitions for any coding agent working on this repo

Do not introduce, suggest, or scaffold: React · Next.js · Vite · Tailwind CSS · shadcn/ui · Bootstrap · Chart.js · D3 · Lucide/Feather/Heroicons · Google Material · any CSS-in-JS · any state library · any date library (use `Intl` and `Date`) · any HTTP client (use `fetch`) · any polyfill for a feature supported in Chrome/Safari/Firefox since 2022.

If a task appears to require one of these, the task has been misread. Re-read this document.

---

## 3. Repository layout

**This is the required application tree, not an exclusion list.** Files that support the project without being served — documentation, the decision log, tests, `.gitignore` — belong in the repository and are shown below. Nothing here may be deleted to "match the tree"; anything not listed and not obviously supporting needs a decision-log entry before it is added.

The **deployed surface** is exactly: `index.html`, `sw.js`, `manifest.webmanifest`, `vercel.json`, and `assets/`. `docs/` and `tests/` ship in the repository but are never fetched by the application.

```
patienttriage-ai/
├── index.html                  Board. The only HTML entry point.
├── sw.js                       Service worker. Precache + cache-first.
├── vercel.json                 Headers + clean URLs. No build config.
├── manifest.webmanifest        Installable on a tablet home screen.
├── .gitignore                  Test and tooling artefacts only (§3.1).
├── README.md
├── PROMPT-FOR-CODEX.md         Build brief. Not served.
├── docs/
│   ├── 00-README.md            Index and reading paths
│   ├── 01-PRD.md
│   ├── 02-TRD.md               (this file)
│   ├── 03-APP-FLOW.md
│   ├── 04-UIUX-BRIEF.md
│   ├── 05-BACKEND-SCHEMA.md
│   ├── 06-IMPLEMENTATION-PLAN.md
│   ├── 07-DECISION-LOG.md      Appended to as the build proceeds
│   ├── AGENTS.md               Context file for coding agents
│   └── PatientTriage-ai_Project-Documentation.pdf
├── tests/
│   ├── unit/                   node:test — one file per engine module
│   │   ├── physiology.test.js  NEWS2 tables, paediatric bands
│   │   ├── rules.test.js       Every hard rule, positive and negative
│   │   ├── presentation.test.js
│   │   ├── hazard.test.js
│   │   ├── uncertainty.test.js
│   │   └── bands.test.js
│   ├── property/
│   │   └── invariants.test.js  10,000 random encounters (§9)
│   ├── golden/
│   │   ├── cohort.test.js      Snapshot runner
│   │   └── snapshots/          Committed golden files, t=0/30/60 min
│   ├── e2e/
│   │   └── board.spec.js       Playwright
│   ├── fixtures/
│   │   └── news2-chart.json    The published chart, transcribed
│   └── package.json            devDependencies ONLY. Never deployed.
└── assets/
    ├── css/
    │   └── board.css           Single stylesheet. Tokens at the top.
    ├── data/
    │   ├── protocol.v1.json    HOSPITAL-OWNED. Hard rules + thresholds.
    │   └── cohort.json         20 synthetic encounters + trajectories.
    └── js/
        ├── main.js             Entry. Wires everything. No logic.
        ├── state.js            Store, dispatch, subscribe.
        ├── clock.js            Simulation clock, tick loop, speed control.
        ├── engine/
        │   ├── index.js        score(encounter, protocol, now) → Assessment
        │   ├── rules.js        Layer 0 — hard-rule gate
        │   ├── physiology.js   Layer 1 — age-banded derangement score
        │   ├── presentation.js Layer 2 — complaint × age × sex risk
        │   ├── hazard.js       Layer 3 — waiting-time + vital drift
        │   ├── uncertainty.js  Confidence interval, abstention, resolving question
        │   └── bands.js        Index → band mapping, asymmetric tie-break
        ├── sim/
        │   ├── cohort.js       Loads cohort, advances trajectories
        │   └── surge.js        3× arrival injection, disaster mode
        ├── audit.js            Append-only log, IndexedDB, export
        ├── fairness.js         Subgroup undertriage proxy + worst-served
        ├── render/
        │   ├── board.js        Queue rail
        │   ├── inspector.js    Right-hand derivation panel
        │   ├── modes.js        Surge / degraded banners
        │   └── charts.js       Inline SVG: sparkline, bias bars, confidence band
        └── util/
            ├── dom.js          el(), on(), text() — 30 lines, no library
            ├── fmt.js          Time, deltas, tabular numbers
            └── storage.js      localStorage + IndexedDB wrappers
```

### 3.1 `.gitignore`

Test and tooling artefacts only. The application has no build output, so there is nothing else to ignore — an inherited Node `.gitignore` template here would be noise.

```gitignore
node_modules/
tests/e2e/.playwright/
tests/e2e/test-results/
tests/e2e/playwright-report/
coverage/
.DS_Store
Thumbs.db
.vercel/
```

`tests/package.json` and its lockfile **are** committed — the test toolchain must be reproducible. Only `node_modules/` is ignored, and it lives under `tests/`, never at the repository root, so that no tooling mistakes this for a Node application.

**Rule for agents:** one module, one responsibility. `engine/` is pure — no DOM access, no `Date.now()`, no storage. `now` is always passed in. This is what makes the engine deterministic (PRD NFR-8) and testable.

---

## 4. Scoring engine specification

The engine is **four layers evaluated in a fixed order**. It is deliberately not one opaque model. A nurse must be able to read the derivation in three seconds, and a regulator must be able to read it at all.

```
        ┌─────────────────────────────────────────────┐
input → │ L0  HARD-RULE GATE      hospital-owned      │──fires──► P1, LOCKED
        └─────────────────┬───────────────────────────┘
                          │ no rule fired
        ┌─────────────────▼───────────────────────────┐
        │ L1  PHYSIOLOGIC DERANGEMENT   0–20          │
        │ L2  PRESENTATION RISK         0–20          │
        │ L3  TIME HAZARD + DRIFT       0–20          │
        └─────────────────┬───────────────────────────┘
                          │
        ┌─────────────────▼───────────────────────────┐
        │ COMBINE → Priority Index 0–100              │
        │ UNCERTAINTY → interval + confidence         │
        │ BAND with asymmetric tie-break              │
        │ ABSTAIN if interval crosses a safety edge   │
        └─────────────────────────────────────────────┘
```

### 4.1 Layer 0 — Hard-rule gate (`engine/rules.js`)

Deterministic, hospital-owned, evaluated first, **cannot be outvoted by any model output**.

Each rule is a data object in `protocol.v1.json`:

```jsonc
{
  "id": "RULE-RESP-01",
  "label": "Critical hypoxaemia",
  "population": "adult",          // adult | paediatric | obstetric | all
  "condition": { "field": "spo2", "op": "<", "value": 85 },
  "action": "PIN_P1",             // PIN_P1 | FLOOR_P2 | FLAG
  "alert": "immediate",
  "rationale": "NEWS2 SpO2 score 3 with additional margin; airway/oxygenation emergency.",
  "source": "RCP NEWS2 2017; local protocol v1"
}
```

Baseline rule set shipped in the prototype (a deploying hospital replaces it):

| ID | Population | Condition | Action |
|---|---|---|---|
| RULE-AIRWAY-01 | all | `visual.airway_compromise = true` | PIN_P1 |
| RULE-CONSC-01 | all | `acvpu ∈ {P, U}` | PIN_P1 |
| RULE-CONSC-02 | all | `acvpu ∈ {C, V}` | FLOOR_P2 |
| RULE-BLEED-01 | all | `visual.active_major_bleeding = true` | PIN_P1 |
| RULE-RESP-01 | adult | `spo2 < 85` | PIN_P1 |
| RULE-RESP-02 | adult | `rr ≥ 30 or rr ≤ 8` | PIN_P1 |
| RULE-CIRC-01 | adult | `sbp < 90 and (hr > 120 or visual.pale)` | PIN_P1 |
| RULE-CIRC-02 | adult | `hr ≥ 131 or hr ≤ 30` | FLOOR_P2 |
| RULE-PAED-01 | paediatric | `age_days < 90 and (temp ≥ 38.0 or temp < 36.0)` | FLOOR_P2 |
| RULE-PAED-02 | paediatric | `sbp < 70 + 2 × age_years` (age 1–10) | PIN_P1 |
| RULE-PAED-03 | paediatric | `hr` or `rr` above the age-band ceiling in §4.2.2 | FLOOR_P2 |
| RULE-PAED-04 | paediatric | `spo2 < 90` | PIN_P1 |
| RULE-PAED-05 | paediatric | `rr` at or below the age-band bradypnoea floor | PIN_P1 |
| RULE-OBS-01 | obstetric | `pregnant and (sbp < 90 or sbp > 150)` | FLOOR_P2 |
| RULE-OBS-02 | obstetric | `pregnant and heavy_vaginal_bleeding` | PIN_P1 |
| RULE-SEIZ-01 | all | `visual.seizure_active = true` | PIN_P1 |

`PIN_P1` sets `band = P1`, `model_locked_out = true`, `alert = immediate`. **When `model_locked_out` is true the engine may not emit any recommendation containing a wait.** This is asserted in the engine, not the UI (PRD P1).

Rule sources are ESI v5 decision points A and B, and the NEWS2 single-parameter-3 trigger.

### 4.2 Layer 1 — Physiologic derangement (`engine/physiology.js`)

Age-banded. Returns `{ score, perParameter[], missing[] }`.

#### 4.2.1 Adult (≥ 16 y) — NEWS2, unmodified

| Parameter | 3 | 2 | 1 | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|---|---|
| Respiration /min | ≤8 | | 9–11 | 12–20 | | 21–24 | ≥25 |
| SpO₂ % (scale 1) | ≤91 | 92–93 | 94–95 | ≥96 | | | |
| Air or oxygen | | O₂ | | Air | | | |
| Systolic BP mmHg | ≤90 | 91–100 | 101–110 | 111–219 | | | ≥220 |
| Pulse /min | ≤40 | | 41–50 | 51–90 | 91–110 | 111–130 | ≥131 |
| Consciousness | | | | Alert | | | CVPU |
| Temperature °C | ≤35.0 | | 35.1–36.0 | 36.1–38.0 | 38.1–39.0 | ≥39.1 | |

Aggregate bands: 0 routine · 1–4 low · 5–6 medium (urgent) · ≥7 high (emergency). **Any single parameter scoring 3 is itself a trigger**, independent of aggregate — implement this as a separate returned flag, not as an aggregate comparison.

Source: [Royal College of Physicians NEWS2 chart](https://professionals.wrha.mb.ca/files/covid-19-ltc-news2-vital-signs-record.pdf).

#### 4.2.2 Paediatric (< 16 y) — age-band table

NEWS2 is adult-calibrated and dangerous in children. Use age-band normals; score the *deviation from band*, not from an adult constant.

| Age band | HR normal | RR normal | SBP normal | Hypotension floor |
|---|---|---|---|---|
| Neonate < 28 d | 100–205 | 30–60 | 67–84 | < 60 |
| Infant 1 mo–1 y | 100–190 | 30–53 | 72–104 | < 70 |
| Toddler 1–2 y | 98–140 | 22–37 | 86–106 | < 70 + 2×age |
| Preschool 3–5 y | 80–120 | 20–28 | 89–112 | < 70 + 2×age |
| School-age 6–11 y | 75–118 | 18–25 | 97–115 | < 70 + 2×age |
| Adolescent 12–15 y | 60–100 | 12–20 | 110–131 | < 90 |

ESI v5 paediatric high-risk ceilings, used by RULE-PAED-03: HR >190 (<1 mo), >180 (1–12 mo), >140 (1–3 y), >120 (3–12 y), >100 (12–18 y); RR >60, >55, >40, >35, >30, >20 respectively.

Scoring for these three: 0 within band; 1 if within 15% outside; 2 if 15–30% outside; 3 if >30% outside or beyond an ESI ceiling.

**The other four parameters.** Layer 1 scores seven parameters in every population, and all three paths sum to exactly 20 — that is where `layerMax: 20` comes from. HR, RR and SBP use the deviation table above. The remaining four:

| Parameter | Paediatric handling | Max | Why |
|---|---|---|---|
| **SpO₂** | Own table, shifted one notch more sensitive than adult: ≤91 → 3 · 92–94 → 2 · 95–96 → 1 · ≥97 → 0 | 3 | Paediatric room-air normal is ≥97, and a child holds saturation by respiratory effort until that effort fails. The same reading carries more risk than in an adult. |
| **Supplemental oxygen** | Identical to adult: air 0, oxygen 2 | 2 | The oxygen score exists because supplemental O₂ masks the SpO₂ reading. That masking is age-independent, so a separate table would be unjustified precision. |
| **ACVPU** | Numerically identical to adult: A 0, C/V/P/U 3 | 3 | What differs is the *assessment*, not the score. Under 1 year, Alert is judged behaviourally — recognises and fixes on the carer, consolable, normal tone. A quiet, floppy or inconsolable infant is not Alert. RULE-CONSC-01/02 are already `population: all`. |
| **Temperature** | `adultNEWS2.temp_c` unchanged | 3 | The thermoregulatory set point does not vary meaningfully by age. The *urgency* does, and that is carried by RULE-PAED-01 and the fever presentation modifiers, not by the score. |

**Two paediatric hard rules exist because the adult ones are unsafe to reuse.** RULE-RESP-01 (`spo2 < 85`) and RULE-RESP-02 (`rr ≤ 8`) are `population: adult` and must never be applied to a child.

- **RULE-PAED-04** pins at `spo2 < 90` — *above* the adult threshold, not below it, because a desaturating child is closer to arrest than an adult at the same reading.
- **RULE-PAED-05** pins on bradypnoea below an age-band floor (neonate 21 · infant 21 · toddler 15 · preschool 14 · school 13 · adolescent 8, each ~30% below the lower normal bound). A falling respiratory rate in a child is exhaustion, not improvement. Without this rule a 3-year-old at RR 10 — normal range 20–28 — would score as merely deranged rather than peri-arrest, because the adult constant of 8 is meaningless at that age.

**Stated limitation.** A child with known congenital cyanotic heart disease has a documented baseline saturation that the SpO₂ table will overscore. Stage 1 holds no prior record and cannot detect that case. The nurse override is the mitigation, and the limitation is written into the protocol file rather than left implicit.

**Critical implementation note.** A fever of 38.5 °C carries entirely different urgency in a 3-year-old than in a 75-year-old, and a solution applying one adult-calibrated table across all ages introduces a silent safety risk. The age band is selected *before* any table lookup, never after.

Sources: [PALS/Maine EMS paediatric vital signs reference](https://www.maine.gov/ems/sites/maine.gov.ems/files/inline-files/VitalSignsChart3.pdf), [ESI Handbook v5](https://californiaena.org/wp-content/uploads/2023/05/ESI-Handbook-5th-Edition-3-2023.pdf).

#### 4.2.3 Obstetric
Adult table with shifted circulatory thresholds. Systolic follows ACOG rather than the adult table: 141–150 scores 1 (gestational hypertension begins at 141, which the adult table scores 0), 151–160 scores 2, ≥161 scores 3, 90–99 scores 2, ≤89 scores 3. HR > 110 scores 2 (physiological pregnancy tachycardia and lower baseline BP make the adult table both over- and under-sensitive in the wrong directions).

### 4.3 Layer 2 — Presentation risk (`engine/presentation.js`)

This layer exists to catch **presentations that lie**. It maps the chief complaint to a class, then applies age and sex modifiers.

```
presentationRisk = base[complaintClass]
                 + Σ modifiers(age, sex, pregnancy, visual, arrivalMode)
```

| Complaint class | Base | Notable modifiers |
|---|---|---|
| `chest_pain` | 12 | +4 if diabetic or age ≥ 65; +3 if female (atypical ACS under-recognition); +4 if diaphoretic; +3 if exertional onset |
| `abdominal_pain` | 6 | **+7 if age ≥ 55 and (diaphoretic or radiating)** — the "stomach ache" that is an MI; +5 if pregnant |
| `breathlessness` | 11 | +3 if unable to speak full sentences; +3 if age ≥ 70 |
| `altered_behaviour` | 10 | +4 if age ≥ 70 (delirium as sepsis presentation); +4 if age < 5 |
| `headache` | 5 | +10 if sudden/worst-ever (thunderclap) — reaches the P2 floor alone, per ESI decision point B; +5 if with fever and neck stiffness; +8 if pregnant or postpartum (pre-eclampsia until excluded) |
| `fever` | 4 | +9 if age < 90 days; +5 if age ≥ 65 (afebrile/atypical sepsis — ESI uses 65 as the geriatric cutoff) |
| `weakness_nonspecific` | 5 | +6 if age ≥ 75 — the most under-weighted complaint in geriatric ED presentation |
| `trauma_minor` | 3 | +7 if anticoagulated — reaches the P3 floor alone; +5 if age ≥ 75 (falls, occult head injury) |
| `limb_injury` | 2 | +4 if neurovascular compromise reported |
| `minor_illness` | 1 | — |
| `unknown` | 8 | Used for unidentified/non-communicative patients. **Absence of a complaint is not absence of risk.** |

Every modifier that fires is returned in the derivation with its label and points. Nothing contributes invisibly.

**Presentation band floors — and why they exist.**

| Presentation score | Floor |
|---|---|
| ≥ 15 | P2 |
| ≥ 10 | P3 |

This is **ESI v5 decision point B expressed as data**: a high-risk presentation is level 2 *regardless of vital signs*. It is applied exactly like a `FLOOR_P2` rule (§12.4 step 5) — it raises the final band and never lowers it.

It is not a tuning convenience. Without it the continuous weighting makes the product's central claim impossible to deliver, and the arithmetic is worth stating because it is not obvious:

```
weighted sum = 2.2·L1 + 1.6·L2 + 1.0·L3         max 96
P2 requires  PI ≥ 62  →  weighted sum ≥ 59.5

A patient with normal physiology (L1 = 1), maximum presentation risk (L2 = 20)
and maximum accrued hazard (L3 = 20):
   2.2 + 32 + 20 = 54.2   →   PI 56.5   →   P3 at best.
```

**A patient with normal vital signs could never exceed P3, however dangerous the presentation.** That makes silent MI, afebrile sepsis and compensated paediatric shock — the three failure modes named in the PRD as the reason this product exists — architecturally uncatchable. The continuous score is the right instrument for *how deranged is this physiology*; it is the wrong instrument for *is this presentation dangerous*, which is a threshold judgement, and ESI already models it as one.

**`bandSetBy`.** Every assessment records which mechanism decided the band: `model` · `hard_rule` · `presentation_floor` · `nurse_override`. The inspector shows it, because "P2 because a rule fired" and "P2 because the index landed there" are different claims and a clinician reviewing the decision needs to know which one they are reading.

**Clamping.** `score = min(base + Σ firing modifiers, 20)`. Only `chest_pain` can exceed the ceiling (max 26). When the sum is clamped, **the derivation must still list every modifier that fired and mark the result as clamped.** A nurse reading the reasoning must see everything the system saw, not only what fitted inside the ceiling — a hidden contribution is indistinguishable from a contribution that was never made.

**On PM-AB-01.** The atypical-ACS modifier fires on `age ≥ 55 AND (diaphoretic OR radiating)`. Both limbs matter and neither is redundant: radiating pain in an over-55 with an abdominal complaint is the textbook silent-MI presentation, and diaphoresis is the one the patient will not report. Requiring both together would mean a 61-year-old describing pain spreading to the left arm scored no higher than one with simple gastritis, which is exactly the failure this layer exists to prevent.

### 4.4 Layer 3 — Time hazard and drift (`engine/hazard.js`)

This is what makes the queue alive rather than a sorted snapshot.

```
timeHazard = waitedMinutes × hazardRate[currentBand]
drift      = Σ over parameters of  slope(parameter, window) × sensitivity[parameter]
layer3     = clamp(timeHazard + drift, 0, 20)
```

| Band | Hazard rate (index points / min) | Reassessment interval |
|---|---|---|
| P1 | — (already highest) | continuous |
| P2 | 0.22 | 15 min |
| P3 | 0.10 | 30 min |
| P4 | 0.035 | 60 min |
| P5 | 0.012 | 120 min |

Drift sensitivities (per unit change over a 30-minute window): RR +1.4 · SpO₂ −1.8 · HR +0.5 · SBP −0.6 · temperature +0.4. Drift is computed over the observed series only; a single reading yields drift = 0 and *widens the confidence interval* instead of contributing zero silently.

**Worked example (the demo case).** PT-0002, 34 F, breathlessness. Arrival RR 22 → 45 minutes later RR 27, SpO₂ 96 → 93. Drift = (5/30 × 1.4 × 30) + (3/30 × 1.8 × 30) = 7.0 + 5.4 = 12.4 → clamped contribution moves the index across the P3/P2 boundary. The row rises, and the movement cause reads `RR ↑5 · SpO₂ ↓3 over 45 min`.

### 4.5 Combination and banding (`engine/bands.js`)

```
PriorityIndex = 100 × (2.2·L1 + 1.6·L2 + 1.0·L3) / (2.2·20 + 1.6·20 + 1.0·20)
```

Weights encode that measured physiology outranks reported complaint, which outranks elapsed time.

| Band | Index range | ESI equivalent |
|---|---|---|
| P1 | ≥ 82, or any `PIN_P1` rule | ESI 1 |
| P2 | 62 – 81 | ESI 2 |
| P3 | 38 – 61 | ESI 3 |
| P4 | 18 – 37 | ESI 4 |
| P5 | < 18 | ESI 5 |

**Asymmetric tie-break.** With the cost matrix below, the expected-cost-minimising decision at an ambiguous boundary is the *higher* acuity. When the confidence interval straddles a boundary and the mass split is closer than 65:35, the engine takes the higher band and sets `tie_broken_upward = true`, which the interface states in words.

|  | True higher acuity | True lower acuity |
|---|---|---|
| **Assigned higher** | 0 | 1 (overtriage) |
| **Assigned lower** | **8** (undertriage) | 0 |

### 4.6 Uncertainty and abstention (`engine/uncertainty.js`)

**Evidence completeness** `E ∈ [0,1]`:

```
E = Σ weight(available inputs) / Σ weight(all inputs)
```

Weights: HR 0.14 · SBP 0.14 · RR 0.16 · SpO₂ 0.16 · temp 0.08 · ACVPU 0.12 · complaint 0.12 · visual checks 0.08.

**Interval half-width** on the Priority Index:

```
halfWidth = baseWidth × (1 + 2.2 × (1 − E)) + driftUncertainty + singleReadingPenalty
baseWidth = 5.0
singleReadingPenalty = 6.0 when only one observation set exists
```

**`driftUncertainty`.** A slope is only as trustworthy as the number of readings behind it and the span they cover. A large drift measured from two readings six minutes apart, then extrapolated across a thirty-minute window, is a guess; the same drift from five readings spanning the full window is a measurement. The formula says so:

```
driftUncertainty = 0.35 × |layer3DriftContribution|
                        × sparsityFactor × coverageFactor × consistencyFactor

sparsityFactor    = 2 / (nObservations − 1)           n=2 → 2.0 · n=3 → 1.0 · n=5 → 0.5
coverageFactor    = clamp(driftWindowMinutes / observedSpanMinutes, 1.0, 2.0)
consistencyFactor = 1 − 0.65 × monotonicFraction      range [0.35, 1.0]

driftUncertainty = 0 when nObservations < 2      (singleReadingPenalty applies instead)
capped at 8.0
```

`monotonicFraction` is, for each parameter contributing to drift, the fraction of consecutive steps whose direction matches that parameter's overall slope — averaged across contributing parameters, weighted by the size of each contribution. It is **0 when `nObservations < 3`**: two points cannot agree or disagree, so they carry no consistency evidence.

**Why the consistency term exists.** An earlier revision scaled uncertainty with drift magnitude alone, on the reasoning that rapid change makes a point estimate unreliable. That reasoning is half right, and the missing half is damaging: it made the engine **least certain about the patients deteriorating fastest** — the exact cases the product exists to catch. In the reference cohort it pushed PT-0002 and PT-0010, the two most clearly worsening patients, into abstention at the moment they crossed into P2.

Magnitude is not the only signal. Four readings moving the same way across three parameters is an established trajectory, and the system should say so. The same magnitude inferred from two noisy readings is a guess. Consistency is what separates them, and without it the formula punishes exactly the evidence that should increase confidence.

The original intuition survives in the two terms that earned it: **sparsity** and **coverage**. A large drift from few readings over a short span is still wide.

**Confidence** is reported as a label, never as a false-precision percentage. Five states:

| Confidence | Condition | Abstains | Instruction to the nurse |
|---|---|---|---|
| `ESTABLISHED` | Interval lies wholly inside one band | no | — |
| `PROBABLE` | Interval crosses one boundary, split ≥ 65:35 | no | — |
| `UNRESOLVED` | Interval crosses a boundary, split < 65:35, **and a question exists that would resolve it** | yes | Ask the named question |
| `UNRESOLVABLE` | Same ambiguity, but **no question can resolve it** | yes | Questioning will not help. Escalate for clinician review. |
| `INSUFFICIENT` | E < 0.45 | yes | Obtain the missing observations |

**Abstention is reserved for safety-relevant boundaries: P1/P2 and P2/P3.**

Below those, an interval that straddles a boundary tie-breaks upward and reports `PROBABLE`, with no resolving question. Uncertainty about whether a patient needs one resource or none is real, but it changes nothing about their safety, and spending the nurse's single question on it is worse than useless: **abstaining everywhere would make abstention noise, and noise is how a safety signal stops being read.** A board where a third of the rows say "I don't know" has not communicated honesty; it has communicated nothing.

This also explains why almost every patient reads `PROBABLE` at the door. One observation set carries a 6.0 width penalty, so arrival intervals are wide by construction. That is correct — the system genuinely knows less at minute zero — and it is why the queue exists.

`UNRESOLVED` and `UNRESOLVABLE` carry identical uncertainty. They are separate states because they give the human different instructions, and the instruction is the point — a nurse told "ask this" and a nurse told "asking won't help, get a clinician" are being asked to do different things. Collapsing them into one state with a nullable question would hide that difference behind a null check.

`UNRESOLVABLE` is reached when, and only when, one of the three `noQuestionReasons` holds: every question for the class was suppressed by `alreadyAnsweredWhen`, no question clears `minimumInformationGain`, or the class defines no questions. The reason is recorded, not inferred.

**Abstention output.** When `UNRESOLVED` or `INSUFFICIENT`, the engine returns:

```jsonc
{
  "band": null,
  "candidateBands": ["P2", "P3"],
  "confidence": "UNRESOLVED",
  "provisionalBand": "P2",        // the safe upper choice, used for queue position
  "resolvingQuestionId": "RQ-ABDO-02",
  "resolvingQuestion": "Is the abdomen rigid, or is there rebound tenderness?",
  "expectedInformationGain": 0.77,
  "noQuestionReason": null
}
```

The patient is **queued at the provisional (higher) band** while unresolved. Abstention is never a reason to defer care.

**Resolving-question selection.** Per complaint class, `protocol.v1.json` holds a ranked list of discriminating questions with the band-shift each would produce. The engine picks the one with the largest expected shift across the current candidate bands. Exactly one question is shown. Asking a nurse three questions in a crowded department is the same as asking none.

**A question is never asked about something already recorded.** Each question may carry an `alreadyAnsweredWhen` condition, using the same grammar as the rules (§12.2). Where it evaluates true, the finding was captured at arrival and has *already* contributed through a presentation modifier — offering the question would double-count it and would spend the single question the nurse gets on information the system already holds. The engine skips it and offers the next-best question for the class.

Worked case: PT-0007 arrives with the `radiating` qualifier ticked. PM-AB-01 has already fired on it, so RQ-ABDO-01 ("does the pain radiate…") is suppressed and RQ-ABDO-02 ("is the abdomen rigid, or is there rebound tenderness?") is offered instead — a question that actually adds information.

**`expectedInformationGain`.** A question earns its place by landing its two outcomes on opposite sides of the boundary that separates the candidate bands — decisively, and far apart. Scored on 0–1:

```
boundary = bandThresholds[higher candidate band]
yesPI    = priorityIndex + expectedShiftIfYes
noPI     = priorityIndex + expectedShiftIfNo

separates = (yesPI ≥ boundary) XOR (noPI ≥ boundary)
margin    = min(|yesPI − boundary|, |noPI − boundary|)

EIG = 0.5 × (separates ? 1 : 0)
    + 0.3 × min(margin / halfWidth, 1)
    + 0.2 × min(|yesPI − noPI| / (2 × halfWidth), 1)
```

The three terms are, in order: *does the answer actually decide it* · *does it decide it cleanly rather than landing on the line* · *does it move the estimate enough to matter against the current uncertainty*. Separation dominates, because a question whose answers both fall on the same side of the boundary tells the nurse nothing regardless of how large the shift is.

**Worked, on PT-0007.** `priorityIndex` 63.4, interval [55.1, 71.7] so `halfWidth` 8.3, candidates P2/P3 so `boundary` 62.0. RQ-ABDO-01 is suppressed (`radiating` already recorded), leaving RQ-ABDO-02 with shifts +11 / −4:

```
yesPI = 74.4   noPI = 59.4
separates = (74.4 ≥ 62) XOR (59.4 ≥ 62) = true
margin    = min(12.4, 2.6) = 2.6

EIG = 0.5 × 1  +  0.3 × min(2.6 / 8.3, 1)  +  0.2 × min(15.0 / 16.6, 1)
    = 0.5      +  0.3 × 0.3133             +  0.2 × 0.9036
    = 0.7747   →  0.77
```

Note that any separating question scores **at least 0.50** by construction. A value below 0.5 therefore means the question does not decide the case, and such a question should rarely survive ranking — if one does, the candidate set is wrong.

**These numbers are executable.** `protocol.v1.json → workedExamples` carries this case, the unsuppressed RQ-ABDO-01 variant (0.8663), and the `driftUncertainty` table as fixtures. The Step 10 and Step 11 tests assert against them, so a constant that drifts out of step with a formula fails a test rather than waiting to be spotted by eye. Any change to a formula or a weight must update the fixtures and keep them green.

**Ranking is deterministic:** highest EIG, then the question whose `discriminatesBetween` exactly equals `candidateBands`, then order of appearance in the protocol file. Never random, never dependent on object key order.

**The floor.** If the best available question scores below `minimumInformationGain` (0.25), it is not offered. Asking a question that will not change the answer costs the nurse the same twenty seconds as asking a useful one, and spends the credibility that makes them answer the next one. The encounter becomes `UNRESOLVABLE` with reason `no_question_above_information_threshold`.

If every question for the class was suppressed by `alreadyAnsweredWhen`, the reason is `all_questions_already_answered`. The engine never falls back to a question it has already answered, and never manufactures confidence it does not have.

### 4.7 Assessment object (engine output contract)

```jsonc
{
  "encounterId": "PT-0007",
  "engineVersion": "1.0.0",
  "protocolVersion": "v1",
  "computedAt": 1756000000000,
  "priorityIndex": 63.4,
  "interval": [55.1, 71.7],
  "band": null,
  "provisionalBand": "P2",
  "bandSetBy": "model",
  "candidateBands": ["P2", "P3"],
  "confidence": "UNRESOLVED",
  "evidenceCompleteness": 0.78,
  "modelLockedOut": false,
  "tieBrokenUpward": true,
  "rulesFired": [],
  "derivation": {
    "physiology": { "score": 6, "perParameter": [ … ], "missing": ["temp"] },
    "presentation": { "class": "abdominal_pain", "base": 6,
                      "modifiers": [{ "label": "Age ≥55 with diaphoresis", "points": 7 }] },
    "hazard": { "waitedMinutes": 38, "timeHazard": 3.8,
                "drift": 2.1, "driftDetail": "HR ↑12 over 30 min" }
  },
  "resolvingQuestion": "Is the abdomen rigid, or is there rebound tenderness?",
  "resolvingQuestionId": "RQ-ABDO-02",
  "expectedInformationGain": 0.77,
  "noQuestionReason": null,
  "reassessDueAt": 1756000900000
}
```

**Contract assertions, enforced in `engine/index.js`.** The function throws if it is about to return an object where:

- `confidence` is absent
- `band` and `provisionalBand` are both null
- `priorityIndex` falls outside `interval`
- `confidence === 'UNRESOLVED'` and `resolvingQuestionId` is null
- `confidence === 'UNRESOLVABLE'` and `noQuestionReason` is null, or `resolvingQuestionId` is non-null
- `noQuestionReason` is set on any state other than `UNRESOLVABLE`
- `modelLockedOut` is true and `provisionalBand !== 'P1'`

These mirror the database constraints in Backend Schema §3.3 exactly, so the same violation is impossible at both ends. PRD FR-2.10 is a code-level invariant, not a UI convention.

---

## 5. Simulation harness

The prototype wraps the real engine in a synthetic environment. **No simulation code may live inside `engine/`.**

| Component | Behaviour |
|---|---|
| `sim/cohort.js` | Loads 20 encounters from `cohort.json`, each with a scripted trajectory: an array of `{ atMinute, vitals, visual }` keyframes, linearly interpolated. |
| `clock.js` | A simulation clock at 1× / 10× / 60× speed. Emits a tick; every tick advances trajectories and recomputes the whole board. Pausable. `now` is *always* taken from this clock, never `Date.now()`. |
| `sim/surge.js` | Injects arrivals at 3× the 6/hour baseline (18/hour). Sets `mode = SURGE` when the trailing-15-minute arrival rate ≥ 3× baseline. |
| Degraded mode | A control that marks all instrument-derived vitals unobtainable, forcing the visual-only path. |

**Cohort composition (20 encounters), each mapped to a requirement it proves:**

| ID | Patient | Proves |
|---|---|---|
| PT-0001 | 47 M, chest pain, diaphoretic | Baseline P2, established confidence |
| PT-0002 | 34 F, breathlessness, worsening RR | Live drift re-triage (§4.4 worked example) |
| PT-0003 | 29 M, ankle injury | P5 floor, fast-track |
| PT-0004 | **82 F, "just not right", afebrile sepsis** | Geriatric atypical presentation; normal-looking vitals, high presentation risk |
| PT-0005 | 55 M, headache, sudden onset | Thunderclap modifier |
| PT-0006 | 23 F, 32 weeks pregnant, SBP 148 | Obstetric threshold shift |
| PT-0007 | **61 M, "stomach ache", diaphoretic** | **Ambiguous case → abstention + resolving question** |
| PT-0008 | 71 M, fall, on warfarin | Anticoagulation modifier |
| PT-0009 | 40 F, migraine, known | P4 stable |
| PT-0010 | 66 M, cough + fever 38.2 | P3 → drifts to P2 |
| PT-0011 | **3 y, T 38.5, HR 168, cap refill 3 s** | **Paediatric age-band scoring; compensated shock** |
| PT-0012 | 19 M, laceration | P4 |
| PT-0013 | **Unidentified, unresponsive, no history** | **Zero-history path; PIN_P1 via RULE-CONSC-01** |
| PT-0014 | 58 F, palpitations, HR 132 | FLOOR_P2 rule |
| PT-0015 | 6 mo, poor feeding, T 37.8 | Infant band; low absolute numbers, high relative deviation |
| PT-0016 | 45 M, back pain | P4, long waiter — time hazard accrual |
| PT-0017 | 77 F, confusion, new | ACVPU C → FLOOR_P2 |
| PT-0018 | 31 M, hand burn | P4 |
| PT-0019 | 88 M, weakness, no monitor available | **Degraded-instrument mode; INSUFFICIENT confidence** |
| PT-0020 | 52 F, chest pain, anxious, normal vitals | Sex modifier; the case the system must not dismiss |

---

## 6. Data, privacy and security

| Concern | Stage 1 decision |
|---|---|
| Patient identity | **Not required.** Encounter IDs are generated locally, sequential per shift, meaningless outside the device. |
| PHI at rest | Vitals + complaint only. No name, no MRN, no address, no phone. |
| PHI in transit | **None.** Stage 1 makes zero network calls after the initial asset load. |
| Storage | `localStorage` (session) and IndexedDB (audit), both device-local. Cleared on shift close except the audit log. |
| Retention | Encounter records 24 h; audit records 7 years, de-identified at shift close (age band retained, exact age dropped). |
| Regulatory frame | **DPDP Act 2023 (India)** as primary; the minimisation design also satisfies HIPAA §164.312 and GDPR Art. 9(2)(h) without change. |
| Consent | Stage 1 processes no identified personal data, so it operates on the care-provision basis; the consent artefact becomes relevant at Stage 2 (EHR link) and is specified there. |
| Audit integrity | Append-only. Each record carries a SHA-256 hash chained to its predecessor (`prevHash`), making silent modification detectable. Implemented with `crypto.subtle`. |
| Transport | Vercel serves HTTPS only; `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, and a CSP with no `unsafe-inline` script are set in `vercel.json`. |

---

## 7. Performance budget

| Metric | Budget |
|---|---|
| Total transferred (cold, gzipped) | ≤ 120 kB including fonts |
| JS, uncompressed | ≤ 135 kB |
| CSS, uncompressed | ≤ 22 kB |
| Cold load to interactive, mid-range tablet | ≤ 2 s |
| Full board recompute, 60 encounters | ≤ 100 ms |
| Single-patient score | ≤ 10 ms |
| Tick interval | 1 s wall clock |
| Long tasks during a tick | 0 over 50 ms |

---

## 8. Browser and device targets

| | |
|---|---|
| Primary | Chrome/Chromium 110+ on a 10″ Android tablet, landscape, 1280×800 |
| Secondary | Safari 16.4+ (iPad), Firefox 115+, desktop Chrome/Edge |
| Minimum viewport | 1024×768 (below this the inspector becomes a drawer) |
| Input | Touch first; full keyboard operation required for accessibility |
| Not supported | Internet Explorer; any browser without ES modules or `crypto.subtle` |

---

## 9. Testing requirements

| Level | Scope | Tool |
|---|---|---|
| Unit | Every engine function. NEWS2 table exactness against the published chart. Paediatric band boundaries. Hypotension formula at ages 1, 5, 10. | `node:test` |
| Property | For 10,000 random encounters: no output ever lacks `confidence`; `PIN_P1` always yields P1; the interval always contains the point estimate. | `node:test` |
| Regression | Golden-file snapshot of all 20 cohort assessments at t=0, t=30, t=60 min. | `node:test` |
| Integration | Board renders 20 rows; drift moves PT-0002; surge switches mode; override writes an audit record and the hash chain verifies. | Playwright |
| Visual | Screenshots at 1280×800 and 1024×768, light and dark. | Playwright |
| Accessibility | Keyboard-only pass through capture → override → audit export. Contrast audit. | Manual + axe |

Test files live under `tests/` per §3, are written as ES modules importing directly from `assets/js/engine/`, and are never referenced by `index.html`, `sw.js`, or the precache manifest.

```bash
cd tests && npm install          # devDependencies only: @playwright/test
node --test unit/ property/ golden/
npx playwright test e2e/
```

**Deployment gate:** no push to `main` without unit + property tests green.

---

## 10. Deployment

```bash
git init
git add -A
git commit -m "PatientTriage.ai — Round 2 prototype"
git remote add origin git@github.com:<org>/patienttriage-ai.git
git push -u origin main
```

On Vercel: **Add New → Project → import the repo → Framework Preset: `Other` → Build Command: (empty) → Output Directory: `.` → Deploy.** There is no build step to configure. Every push to `main` redeploys; every pull request gets a preview URL.

`vercel.json`:

```json
{
  "cleanUrls": true,
  "headers": [
    { "source": "/sw.js",
      "headers": [{ "key": "Cache-Control", "value": "no-cache" }] },
    { "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "no-referrer" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000" }
      ] }
  ]
}
```

**Local run.** `python3 -m http.server 8000` or `npx serve .` — required only because ES modules and service workers are blocked on `file://`. A packaged tablet build wraps the same files in a WebView, where this restriction does not apply.

---

## 11. Third-party services

| Service | Used for | Fallback if unavailable |
|---|---|---|
| Google Fonts | IBM Plex Sans / Mono / Serif | Full system font stack; layout is unaffected because metrics are set on the fallback |
| Vercel | Static hosting, HTTPS, preview deploys | Any static host, or the raw files on a USB stick |

**That is the complete list.** No analytics, no error reporting service, no CDN for scripts, no third-party API. A clinical tool that phones home is a clinical tool that leaks.

---

## 12. Protocol file schema

`assets/data/protocol.v1.json` is shipped complete in this repository. It is the **single source of every clinically contestable value** — thresholds, weights, rules, questions. No such value may appear as a literal in code.

This section documents its shape so the engine can be written against it without reading the whole file. Where §4 above and the JSON disagree, **the JSON wins** — it is the artefact the engine loads.

### 12.1 Top-level keys

| Key | Consumed by | §4 reference |
|---|---|---|
| `ageBands`, `ageBandFallback` | `engine/physiology.js` → `ageBand()` | §4.2 |
| `rules` | `engine/rules.js` | §4.1 |
| `physiology.adultNEWS2` | `engine/physiology.js` | §4.2.1 |
| `physiology.paediatricNormals`, `.paediatricDeviationScoring`, `.paediatricHighRiskCeilings`, `.paediatricHypotensionFloor` | `engine/physiology.js` | §4.2.2 |
| `physiology.obstetricOverrides` | `engine/physiology.js` | §4.2.3 |
| `presentation.classes` | `engine/presentation.js` | §4.3 |
| `hazard` | `engine/hazard.js` | §4.4 |
| `uncertainty` | `engine/uncertainty.js` | §4.6 |
| `combination`, `bandThresholds`, `costMatrix` | `engine/bands.js` | §4.5 |
| `reassessMinutes`, `surge` | `clock.js`, `sim/surge.js` | §4.4, App Flow §10 |
| `resolvingQuestions` | `engine/uncertainty.js` | §4.6 |

### 12.2 Condition grammar

One recursive grammar, used by `rules[].condition`, `presentation.classes.*.modifiers[].when`, and `resolvingQuestions[].alreadyAnsweredWhen`. Implement the evaluator **once**, in `engine/rules.js`, and import it into `engine/presentation.js` and `engine/uncertainty.js`.

```
condition := leaf | { "all": [condition, …] } | { "any": [condition, …] }
leaf      := { "field": <path>, "op": <operator>, "value": <literal>, "table": <path> }
```

`all` and `any` may nest to any depth. An empty `all` is true; an empty `any` is false.

| Operator | Semantics |
|---|---|
| `<` `<=` `>` `>=` `=` `!=` | Numeric or string comparison against `value` |
| `in` | `value` is an array; true when the field is a member |
| `contains` | Field is an array; true when it contains `value` |
| `isTrue` | Boolean field is exactly `true`. No `value` key. |
| `belowPaediatricHypotensionFloor` | Resolves `physiology.paediatricHypotensionFloor` for the encounter's age band, evaluating `expression` where it is a formula. No `value` key. |
| `belowPaediatricBradypnoeaFloor` | Resolves `physiology.paediatricBradypnoeaFloor` for the encounter's age band and compares at-or-below. No `value` key. |
| `aboveAgeBandCeiling` | Looks up `table` (a dotted path under `physiology`) at the encounter's age band and compares strictly greater. |

**A leaf whose field is null, absent, or `unobtainable` evaluates to `false` — never to an error and never to `true`.** A rule cannot fire on data that was not obtained. Missing data widens the interval instead (§4.6); it never manufactures a hard escalation.

### 12.3 Field paths

Resolved against a flat view of the encounter joined to its latest observation.

| Path | Source |
|---|---|
| `hr` `sbp` `dbp` `rr` `spo2` `temp_c` `acvpu` `pain_score` `cap_refill_s` | Latest `OBSERVATION` |
| `visual.*` | `OBSERVATION.visual` |
| `age_days` `age_years` `age_band` `sex` `pregnancy_status` `gestation_weeks` | `ENCOUNTER`, derived before evaluation |
| `preexisting_flags` `complaint_class` `complaint_qualifiers` | `ENCOUNTER` |
| `population` | Derived from `age_band` and `pregnancy_status`; obstetric outranks adult |

`complaint_qualifiers` is a `TEXT[]` on `ENCOUNTER` set by the arrival-capture qualifier chips: `thunderclap` · `neck_stiffness` · `neurovascular_compromise` · `radiating` · `exertional` · `sudden_onset` · `reported_change_from_baseline`. It exists so that a presentation modifier can depend on something the nurse actually observed, rather than on free-text parsing — the engine never reads `complaint_text`.

### 12.4 Rule evaluation order

1. Filter `rules` to those whose `population` matches the encounter's population, or is `all`.
2. Evaluate every remaining rule. **Do not short-circuit** — the derivation must list every rule that fired, not the first.
3. Apply the strongest action: `PIN_P1` outranks `FLOOR_P2` outranks `FLAG`.
4. `PIN_P1` sets `band = "P1"`, `modelLockedOut = true`, `alert = "immediate"`, and skips layers 1–3 for banding purposes. Layers are still computed and recorded for the derivation, because a reviewer must be able to see what the model would have said.
5. `FLOOR_P2` computes the model band normally and then raises it to P2 if it came out lower. It never lowers a band.
6. The **presentation floor** (§4.3) is applied at the same stage and by the same logic. Where both a hard rule and a presentation floor apply, the higher band wins and `bandSetBy` records `hard_rule` — a fired rule is the more specific finding and the one a reviewer will want named.
7. A floor that raises the band above every candidate band **resolves an abstention**: the ambiguity was between bands the floor has now overruled. Confidence becomes `ESTABLISHED` with `bandSetBy` naming the floor. The engine does not report uncertainty about a decision it did not make on the model's evidence.

### 12.5 Scoring tables

Band arrays (`adultNEWS2.*`, `obstetricOverrides.*`) are lists of `{ min?, max?, score }` with **inclusive** bounds. A missing `min` means unbounded below, a missing `max` unbounded above. Bands are contiguous and non-overlapping; the evaluator returns the first match and must throw if no band matches, since that means the table has a gap.

`paediatricNormals` gives `[low, high]` per parameter per age band, covering **HR, RR and SBP only**. `paediatricDeviationScoring` maps percentage distance outside that range to a score; `maxPercentOutsideBand: null` is the catch-all. Exceeding a `paediatricHighRiskCeilings` value scores 3 regardless of the percentage.

The other four Layer-1 parameters take their paediatric values from `paediatricSpo2.bands`, `paediatricOnOxygen`, `paediatricAcvpu` and `adultNEWS2.temp_c` (§4.2.2).

`physiology.parameterMaxima` is the contract that makes this checkable: it lists the per-parameter maximum, the total of 20, and — under `populationPaths` — the exact table each population reads for each of the seven parameters. **Assert against it in the Step 7 unit tests.** If a population path cannot reach 20, a parameter is missing from that path, which is precisely the class of gap that leaves a child unscored on something an adult is scored on.

### 12.6 Changing the protocol

A hospital edits this file through its own clinical governance. Increment `protocolVersion`, set `supersedes` to the previous version, and keep the superseded file — an assessment must remain interpretable under the rules in force when it was made (Backend Schema §6). The version renders in the board header at all times and is stamped on every assessment.

---

*Sources: [RCP NEWS2 chart](https://professionals.wrha.mb.ca/files/covid-19-ltc-news2-vital-signs-record.pdf) · [ESI Handbook v5, 2023](https://californiaena.org/wp-content/uploads/2023/05/ESI-Handbook-5th-Edition-3-2023.pdf) · [Maine EMS paediatric vital signs reference](https://www.maine.gov/ems/sites/maine.gov.ems/files/inline-files/VitalSignsChart3.pdf) · [FDA CDS guidance analysis, Jan 2026](https://www.cov.com/news-and-insights/insights/2026/01/5-key-takeaways-from-fdas-revised-clinical-decision-support-cds-software-guidance) · [Vercel builds documentation](https://vercel.com/docs/builds)*
