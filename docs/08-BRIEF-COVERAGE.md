# 08 · Brief coverage map

Where each item in the Round 2 problem statement is answered. Written so a reader can check the submission against the brief without reading all of it.

---

## Minimum prototype expectations

| Expectation | Where | Status |
|---|---|---|
| Triage scoring on 15–20 simulated records | `assets/data/cohort.json` — **20** encounters | Met |
| At least one ambiguous presentation | **PT-0007** · 61 M, "stomach ache… goes up into my shoulder". Abstains across P2/P3, names one resolving question | Met |
| At least one paediatric case | **PT-0011** · 3 y, HR 168 against the preschool ESI ceiling of 120. **PT-0015** · 6 mo, where 184 bpm is 4 above the infant ceiling and unremarkable in a toddler | Met |
| At least one geriatric case | **PT-0004** · 82 F, afebrile sepsis reaching P2 on collateral history with unremarkable vitals | Met |
| At least one zero-history patient | **PT-0013** · unidentified, unresponsive, no name, no age, no complaint — scored and pinned to P1 | Met |
| Behaviour under 3× surge | `sim/surge.js`; entered on measured trailing-15-minute arrival rate, not a button. Top five retained, rest collapse, reassessment intervals compress 33% | Met |
| Uncertainty explicit — no score without a confidence indicator | Five confidence states; `engine/index.js` **throws** if an assessment would return without one; database `CHECK` mirrors it. Property-tested over 10,000 random encounters | Met |
| At least one clinician override, and what is logged | Drag or `Shift+↑`+`Enter`, one gesture, no dialog. Writes an append-only SHA-256-chained record with the engine's band, confidence, index, interval, every input and the full derivation snapshot | Met |

## Real-world complexities

| Complexity | Answer |
|---|---|
| Overlapping / ambiguous symptoms; under-reported pain | Layer 2 presentation risk with age and sex modifiers. PM-AB-01 catches the "stomach ache" that is an MI; PM-CP-02 exists because women's cardiac presentations are under-recognised |
| Age-banded thresholds — 38.5 °C means different things at 3 and 75 | Age band is resolved **before** any threshold table is selected. Separate adult NEWS2, paediatric age-band, and obstetric paths, each scoring all seven parameters to a maximum of 20 — asserted in test, because a path that cannot reach 20 is missing a parameter |
| Data quality varies; half have prior records | PRD §7.1. Zero-history is the default path, not the exception; history arrives at Stage 2 as observations and flags, never as a separate scoring path |
| Explainable in seconds, by an interrupted clinician | Row meta line for the glance; inspector for the full derivation, every layer and contribution, on the same screen |
| Asymmetric under/over-triage cost | Explicit 8:1 cost matrix. Ties break upward and the interface says so. Presentation floors implement ESI decision point B so a dangerous presentation reaches P2 on normal vitals — without them the continuous score cannot exceed P3, which is proven arithmetically in TRD §4.3 |
| Hospitals differ in scale and specialty | PRD §13. Every contestable clinical value is in a hospital-owned protocol file; the surge trigger is a multiple of that department's own baseline |
| Accountability, override, audit, regulation | Recommend-not-decide boundary; append-only hash-chained log; DPDP Act 2023 primary; designed to support HIPAA and GDPR compatibility review subject to site-specific validation |
| Integration is rarely simple | Three stages, each delivering value alone. Stage 1 needs one tablet and no integration |

## Solutioning areas

| Area | Where |
|---|---|
| Data strategy | TRD §4.2–4.4 · uncertainty weights TRD §4.6 · Backend Schema §3 |
| Decision model and its own uncertainty | TRD §4 — four layers, hybrid rules-and-weights, five confidence states, abstention as a first-class output |
| Workflow design | App Flow §4–§10 — surfacing, override capture, surge versus quiet shift |
| Safety-first defaults and deterioration monitoring | PRD §4 (P1–P8) · TRD §4.1, §4.4 · reassessment intervals per band, and drift-driven re-ranking |
| Adoption and change management | **PRD §12** |
| Patient data protection | Backend Schema §6 — minimisation as architecture; Stage 1 collects no direct identifier |
| Scalability | **PRD §13** |

## Stated assumptions

Regulatory jurisdiction **India, DPDP Act 2023**, with a minimisation and audit design intended to support HIPAA §164 and GDPR Art. 9 compatibility review after site-specific legal and security validation. Five-level scale, ESI v5 aligned. Baseline 6 arrivals/hour, surge at 3×. Undertriage:overtriage 8:1. Retention 24 h for encounters, 7 years de-identified for audit. All in PRD §7, all in the protocol file.

## Deliberately not built

The **Overflow Valve** (FR-7.1, FR-7.2) — partner-clinic slots and city-network ambulance redirection. It depends on a live capacity feed that does not exist to integrate against and cannot be honestly simulated. PRD §9 states the reasoning. Also out of scope: EHR/HL7 integration, authentication and roles, trained ML weights, regulatory submission artefacts.
