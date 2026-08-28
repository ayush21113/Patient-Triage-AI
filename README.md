# PatientTriage.ai

PatientTriage.ai is an offline decision-support layer for an emergency-department waiting room. It scores sparse front-door observations, recomputes as patients wait, exposes every derivation, abstains at safety-relevant boundaries, and keeps the nurse in control.

It is not an autonomous triage system, a diagnostic device, an order-entry system, or a replacement for clinical judgement. It does not move patients or order treatment.

**Team Mayhem** · Ayush Kumar (lead) · Md Waqar Moid · Harshit Agarwal · IIT Kanpur  
**Accenture Innovation Challenge 2026** · Problem Track 2 · Round 2

> **Synthetic data only. Not for clinical use.** Every encounter in this repository is fabricated for demonstration.

## Run locally

There is no build or install step. Serve the repository root so native ES modules and the service worker are available:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`. After one successful HTTP(S) load, the service worker supports offline reloads. A bare `file://` load is not supported by browsers.

Tests are development-only:

```bash
node --test tests/unit/*.test.js tests/property/*.test.js tests/golden/*.test.js
```

## Five-minute demo

1. Load the board at t=0 with 20 synthetic patients.
2. Select **PT-0004** to show a geriatric atypical presentation reaching P2 with unremarkable vitals.
3. Select **PT-0011** to show paediatric age-band scoring.
4. Select **PT-0007** to show abstention and its single resolving question.
5. Set **60×** and run about 45 simulated minutes; PT-0002 rises on measured drift.
6. Move **PT-0020** upward and open **Audit** to show the one-gesture nurse override and chained record.
7. Press **Surge ×3** to inject 18 arrivals/hour and retain the top five full rows.
8. Press **Lose monitors** to enter degraded mode while the queue continues ordering.
9. Open **Fairness** to see the worst-served subgroup named in a sentence and drill into its encounters.
10. Disconnect the network and reload to demonstrate the offline shell.

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
| [Decision protocol](docs/DECISION-PROTOCOL.md) | Decide, log, and proceed policy |
| [Agent constraints](docs/AGENTS.md) | Safety invariants and banned dependencies |

## Deploy

Import the repository into Vercel with Framework Preset **Other**, an empty build command, and output directory `.`. `vercel.json` supplies the required cache and security headers. No server-side runtime is used.
