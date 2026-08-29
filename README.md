# PatientTriage.ai

PatientTriage.ai is a static, offline-capable decision-support prototype for an emergency-department waiting room. It scores sparse front-door observations, continuously recomputes priority as patients wait, explains every score, abstains at safety-relevant boundaries, and keeps the clinician in control.

It is not an autonomous triage system, a diagnostic device, an order-entry system, or a replacement for clinical judgement. It does not assign a legal triage category, move patients, or order treatment.

**Team Mayhem** · Ayush Kumar (lead) · Md Waqar Moid · Harshit Agarwal · IIT Kanpur  
**Accenture Innovation Challenge 2026** · Problem Track 2 · Round 2

> **Synthetic data only. Not for clinical use.** Every encounter in this repository is fabricated for demonstration.

## Demo

- **Live prototype:** [https://patient-triage-ai-three.vercel.app/](https://patient-triage-ai-three.vercel.app/)

## Implementation Approach

The prototype uses a deterministic rules-and-scoring engine rather than a trained black-box model. That choice is deliberate for an emergency triage surface: every output must be reproducible, inspectable, and auditable.

The engine combines:

1. **Hard safety rules** for non-negotiable escalation, such as airway compromise, unresponsiveness, severe hypoxia, paediatric bradypnoea, seizure, major bleeding, and obstetric emergencies.
2. **Layered priority scoring** across physiology, presentation risk, time hazard, and uncertainty.
3. **Age- and population-specific thresholds** for adult, paediatric, and obstetric patients.
4. **Explicit confidence states** on every assessment: `ESTABLISHED`, `PROBABLE`, `UNRESOLVED`, `UNRESOLVABLE`, and `INSUFFICIENT`.
5. **Clinician override** as a first-class workflow. Override never requires a dialog or justification field, but every override is written to a hash-chained audit log.

The system is conservative by design. Under-triage is treated as eight times more costly than over-triage, ties break upward, missing evidence widens the interval, and the board abstains rather than presenting false certainty at safety-relevant boundaries.

## Solution Architecture

PatientTriage.ai is a vanilla web application. There is no framework, no bundler, no server runtime, and no runtime package dependency.

```text
index.html
sw.js
manifest.webmanifest
vercel.json
assets/
  css/board.css
  data/cohort.json
  data/protocol.v1.json
  js/
    engine/      pure scoring functions
    render/      DOM rendering and interaction surfaces
    sim/         cohort and surge simulation
    util/        formatting, DOM, glyph and storage helpers
tests/
  unit/          node:test coverage
  property/      invariant/property checks
  golden/        cohort regression snapshots
  e2e/           Playwright layout, accessibility and demo tests
docs/
  01-PRD.md
  02-TRD.md
  03-APP-FLOW.md
  04-UIUX-BRIEF.md
  05-BACKEND-SCHEMA.md
  06-IMPLEMENTATION-PLAN.md
  07-DECISION-LOG.md
  08-BRIEF-COVERAGE.md
```

The deployed application fetches only `index.html`, `sw.js`, `manifest.webmanifest`, `vercel.json`, and `assets/`. Documentation, tests, and scripts are repository evidence only and are not required by the running product.

## Prototype Scope

The repository includes:

- 20 simulated waiting-room encounters.
- Ambiguous, paediatric, geriatric, obstetric, trauma, respiratory, cardiac, fever, pain, and zero-history cases.
- A simulated 3x surge state.
- A degraded mode where monitors are unavailable.
- Reassessment and deterioration over simulated time.
- A fairness monitor that names the worst-served subgroup.
- One-gesture clinician override with hash-chained audit evidence.
- Offline reload after the first HTTP(S) load through the service worker.

The assumed primary regulatory jurisdiction is **India under the DPDP Act 2023**. The data-minimisation and audit design is also structured to be compatible with HIPAA and GDPR health-data obligations. See [docs/05-BACKEND-SCHEMA.md](docs/05-BACKEND-SCHEMA.md).

## Dependencies

### Runtime

None.

The production app uses only browser-native HTML, CSS, JavaScript modules, `fetch`, `Date`, `Intl`, IndexedDB, and the Service Worker API.

### Development and Verification

Development tooling is isolated under `tests/` and is not part of the deploy path.

- Node.js for `node:test`
- `@playwright/test` for browser, layout, accessibility, and demo rehearsal tests
- `axe-core` for accessibility checks

Install test tooling only when you want to run the full test suite:

```bash
cd tests
npm install
cd ..
```

## Run Locally

Serve the repository root so native ES modules and the service worker are available:

```bash
python -m http.server 8000
```

Open:

```text
http://localhost:8000
```

After one successful HTTP(S) load, the service worker supports offline reloads. A bare `file://` load is not supported by browsers because ES modules and service workers need an HTTP(S) origin.

## Test

From the repository root:

```bash
node --test tests/unit/*.test.js tests/property/*.test.js tests/golden/*.test.js
```

For browser tests:

```bash
cd tests
npx playwright test tests/e2e/board.spec.js tests/e2e/performance.spec.js tests/e2e/layout-integrity.spec.js tests/e2e/demo-rehearsal.spec.js
cd ..
```

The latest verification run passed:

- 151/151 core unit, property, and golden tests.
- 92/92 browser layout, accessibility, and performance tests.
- 3/3 timed demo rehearsals.

## Five-Minute Demo

1. Load the board at `t=0` with 20 synthetic patients.
2. Select **PT-0004** to show a geriatric atypical presentation reaching P2 with unremarkable vitals.
3. Select **PT-0011** to show paediatric age-band scoring.
4. Select **PT-0007** to show abstention and its single resolving question.
5. Set **60x** and run about 45 simulated minutes; PT-0002 rises on measured drift.
6. Move **PT-0020** upward and open **Audit** to show one-gesture nurse override and chained evidence.
7. Press **Surge x3** to inject 18 arrivals/hour and retain the top five full rows.
8. Press **Lose monitors** to enter degraded mode while the queue continues ordering.
9. Open **Fairness** to see the worst-served subgroup named in a sentence and drill into its encounters.
10. Disconnect the network and reload to demonstrate the offline shell.

## Deploy

Import this public GitHub repository into Vercel:

- Framework preset: **Other**
- Build command: leave empty
- Install command: leave empty
- Output directory: `.`
- Root directory: `.`

`vercel.json` supplies the static headers. No server-side runtime is used.

After deployment, verify:

1. The production URL loads in under 2 seconds.
2. The service worker registers over HTTPS.
3. Offline reload works after one successful load.
4. Security headers from `vercel.json` are present.
5. Pull requests produce preview URLs.

## Documentation

| Document | Purpose |
|---|---|
| [Overview](docs/00-README.md) | Index, reading paths, evidence base |
| [Product requirements](docs/01-PRD.md) | Product purpose and functional requirements |
| [Technical requirements](docs/02-TRD.md) | Architecture and scoring-engine contract |
| [Application flow](docs/03-APP-FLOW.md) | Screens, states, triggers, and demo path |
| [UI/UX brief](docs/04-UIUX-BRIEF.md) | Binding visual and interaction contract |
| [Backend schema](docs/05-BACKEND-SCHEMA.md) | Data models, constraints, and retention |
| [Implementation plan](docs/06-IMPLEMENTATION-PLAN.md) | 36 ordered build steps and exit tests |
| [Decision log](docs/07-DECISION-LOG.md) | Decisions not made by the specifications |
| [Brief coverage](docs/08-BRIEF-COVERAGE.md) | Where the Round 2 brief is addressed |
| [Decision protocol](docs/DECISION-PROTOCOL.md) | Decide, log, and proceed policy |
| [Agent constraints](docs/AGENTS.md) | Safety invariants and banned dependencies |
