# 01 · Product Requirements Document
### PatientTriage.ai — a decision-support layer over the emergency waiting room

| | |
|---|---|
| **Team** | Mayhem — Ayush Kumar (lead), Md Waqar Moid, Harshit Agarwal · IIT Kanpur |
| **Programme** | Accenture Innovation Challenge 2026 · Problem Track 2 · Round 2 |
| **Document** | PRD — authoritative source for *what* is built and *why*. Supersedes any conflicting statement elsewhere. |
| **Status** | Baselined for the Round 2 prototype |
| **Revision** | 1.0 |

---

## 1. The problem, stated precisely

In an overwhelmed emergency department one nurse sequences every arriving patient in under two minutes each, with no labs, no imaging, and often no history. **That judgement is then frozen.** A patient's position in the queue reflects how sick they looked on arrival, not how unsafe it has become for them to keep waiting.

The queue itself becomes the hazard.

Five mechanisms produce this failure, and the product must answer each one:

| # | Mechanism | Consequence |
|---|---|---|
| M1 | **Snapshot assessment** — acuity assigned once at the door, never recomputed | The patient who decompensates at minute 40 holds a minute-0 position |
| M2 | **Information poverty** — the first five minutes contain vitals and a sentence, nothing that confirms or excludes | Decisions are made at the point of least evidence |
| M3 | **Presentations that lie** — silent MI, afebrile sepsis, compensated paediatric shock | Look stable until they are not |
| M4 | **Crowding degrades reassessment** — repeat vitals stop happening exactly when they matter | The safety net fails under the load that creates the need for it |
| M5 | **Single point of cognitive load** — one nurse, continuous interruption, no memory of who is quietly worsening | Deterioration is discovered at collapse |

**Evidence base.** Across 5,315,176 US ED encounters, only 65.9% of patients who went on to need a life-stabilising intervention were correctly identified at triage; 3.3% were undertriaged and 28.9% overtriaged under ESI ([Sax et al., *JAMA Netw Open* 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10024207/figure/zoi230137f1)). At ESI decision point B — the high-risk judgement — measured nurse accuracy is approximately 43% ([ESI Handbook v5, 2023](https://californiaena.org/wp-content/uploads/2023/05/ESI-Handbook-5th-Edition-3-2023.pdf)). A high-volume Indian emergency department reported an average consultation delay of 14 hours in 2023.

The gap is not nurse competence. It is that the task — continuous, multi-patient, multi-hour risk surveillance under interruption — is not a task a human can hold in working memory, and no conventional triage system attempts it.

---

## 2. What we are building

**PatientTriage.ai is a decision-support layer over the waiting room, not a replacement for the triage nurse.**

It works from sparse arrival data, recomputes risk as minutes pass, escalates on hard rules the hospital owns, refuses to guess when it cannot discriminate, and hands every final call back to the human.

Three verbs define the loop:

```
SENSE  ──────────►  REASON  ──────────►  RE-TRIAGE
first 3 minutes     or abstain           and route
```

### 2.1 One-sentence product brief
> A tablet-first, offline-capable board that keeps a live, continuously recomputed, explainable priority order for every person sitting in an emergency waiting room, using only chief complaint, five vitals, age, sex and a nurse's visual check — and that says "I don't know" out loud rather than guessing.

### 2.2 What it is not
- Not a diagnosis engine. It never names a disease.
- Not an autonomous decision-maker. It never assigns the final category, moves a patient, or orders treatment.
- Not an EHR replacement, and not dependent on one to deliver Stage-1 value.
- Not a wait-time predictor. Average wait is explicitly *not* an optimisation target.

---

## 3. Users

| User | Context | What they need from us | Failure they fear |
|---|---|---|---|
| **Triage nurse** (primary) | Standing, interrupted every 90 seconds, 2 minutes per patient, no keyboard | Capture in under 90 seconds; a reason they can check in 3 seconds; zero-friction override | Being blamed for a machine's call |
| **Charge nurse / ED physician** | Running the floor, reallocating staff | Who is quietly worsening; who to see next; disaster-mode top five | Discovering a collapse in the chair |
| **Hospital administrator / clinical governance** | Weekly and quarterly review | Undertriage by subgroup; override rate; drift; a defensible audit trail | An inequitable system nobody noticed |
| **The patient** (indirect) | Sitting in a chair, deteriorating, invisible | To not be forgotten | Being sent to the back of the line |

**Design constraint that follows:** the nurse's interaction budget is roughly **90 seconds of capture and 3 seconds of reading** per patient. Anything that costs more than that will not be used, and an unused safety system is worse than none because it produces a false record of vigilance.

---

## 4. Core principles (non-negotiable, and testable)

| P | Principle | Testable form |
|---|---|---|
| **P1** | **Hard rules outrank the model.** On a visible emergency the model is locked out of ever advising "wait". | For every input where a red-flag rule fires, output priority = P1 and `model_locked_out = true`, regardless of model score. |
| **P2** | **The queue is alive.** A priority number is never frozen once set. | For every waiting patient, `last_recompute_age_seconds` ≤ 60. |
| **P3** | **It says "I don't know."** No score is returned without a confidence band; near a safety-relevant boundary it abstains and names the one resolving question. | No API response contains `band` without `confidence` and `interval`. |
| **P4** | **The nurse decides.** Override is one gesture, no dialog, no justification field. Every override is logged. | Override completes in ≤1 interaction and writes an immutable audit record. |
| **P5** | **Undertriage is not symmetric with overtriage.** Ties break upward. | Cost matrix is explicit and displayed; `undertriage_weight / overtriage_weight = 8`. |
| **P6** | **Fairness is a running check, not a launch-day claim.** | Bias monitor recomputes per shift and flags the *worst-served* subgroup, never the average. |
| **P7** | **Front-door data only.** Value is created from chief complaint, five vitals, age, sex and visual assessment alone. | Stage 1 runs with zero external integrations, offline, on one tablet. |
| **P8** | **Local protocol supplies the hard rules.** Red-flag thresholds are governed by the deploying hospital. | Rules live in an editable, versioned protocol file; changing it requires no code change. |

P1 and P3 exist for a regulatory reason as well as a clinical one. The January 2026 FDA guidance on Clinical Decision Support Software keeps non-device status contingent on the clinician being able to **independently review the basis** for a recommendation, and treats time-critical decision support as failing that test ([Covington analysis, Jan 2026](https://www.cov.com/news-and-insights/insights/2026/01/5-key-takeaways-from-fdas-revised-clinical-decision-support-cds-software-guidance)). Our answer is to expose the full derivation of every score on the same screen, and to never present a single unqualified number.

---

## 5. Functional requirements

Priority key: **M** = must for Round 2 prototype · **S** = should · **C** = could (roadmap).

### 5.1 Sense — arrival capture

| ID | Requirement | Pri |
|---|---|---|
| FR-1.1 | Capture chief complaint as free text plus an optional complaint class | M |
| FR-1.2 | Capture age and biological sex; accept "estimated" age for unidentified patients | M |
| FR-1.3 | Capture HR, systolic BP, respiratory rate, SpO₂, temperature; each individually markable **unobtainable** | M |
| FR-1.4 | Capture nurse visual checks as toggles: pale, diaphoretic, drowsy, distressed, cyanosed, active bleeding, unable to speak in full sentences | M |
| FR-1.5 | Capture ACVPU level of consciousness | M |
| FR-1.6 | Accept a patient with **no identity, no history and no name** — an encounter ID is generated and the record is complete without it | M |
| FR-1.7 | Complete a full capture in ≤90 seconds on a tablet with no keyboard | M |
| FR-1.8 | Record arrival mode (walk-in, ambulance, referred, police) | S |
| FR-1.9 | Capture pain score 0–10 where the patient can give one | S |

### 5.2 Reason — scoring and abstention

| ID | Requirement | Pri |
|---|---|---|
| FR-2.1 | Evaluate the **hard-rule gate** before any model computation; a fired rule pins the patient to P1 and locks the model out of any lower recommendation | M |
| FR-2.2 | Compute an age-banded physiologic derangement score (adult NEWS2 tables; paediatric age-band tables; obstetric shifted thresholds) | M |
| FR-2.3 | Compute a presentation-risk contribution from complaint class modified by age and sex — this is where atypical presentation is caught | M |
| FR-2.4 | Emit a continuous **Priority Index 0–100** and a **band P1–P5** aligned to ESI levels 1–5 | M |
| FR-2.5 | Emit a **confidence interval over bands**, widened by every missing or unobtainable input | M |
| FR-2.6 | **Abstain** when the interval spans a safety-relevant boundary: return `UNRESOLVED` with the two candidate bands | M |
| FR-2.7 | On abstention, name the **single most informative question** for that complaint class | M |
| FR-2.8 | Break every tie upward, applying an explicit asymmetric cost matrix, and state on screen that it did so | M |
| FR-2.9 | Produce a complete, human-readable derivation for every score: every rule evaluated, every contribution, every point | M |
| FR-2.10 | Never return a band without a confidence value — enforced at the engine boundary, not the UI | M |
| FR-2.11 | Degrade gracefully to visual-assessment-only scoring when instruments are unavailable, widening the interval and naming the bands it can no longer discriminate | M |

### 5.3 Re-triage — the living queue

| ID | Requirement | Pri |
|---|---|---|
| FR-3.1 | Recompute every waiting patient at least once per minute | M |
| FR-3.2 | Apply a **time-hazard** contribution: minutes waited weighted by current band (a P2 waiting 30 minutes accrues risk far faster than a P4) | M |
| FR-3.3 | Apply a **drift** contribution from the slope of repeated vitals over the observation window | M |
| FR-3.4 | Raise a patient's position automatically when drift or hazard crosses threshold, and mark the row as **movement** with its cause | M |
| FR-3.5 | Trigger mandatory re-assessment prompts when a band-specific reassessment interval elapses (P2 = 15 min, P3 = 30 min, P4 = 60 min, P5 = 120 min) | M |
| FR-3.6 | Never allow a patient to be silently dropped from surveillance — an un-reassessed patient escalates in visibility, not out of it | M |

### 5.4 Nurse authority and audit

| ID | Requirement | Pri |
|---|---|---|
| FR-4.1 | Any row can be moved to any position in one gesture. No dialog. No mandatory justification field. | M |
| FR-4.2 | Every override writes an append-only audit record capturing the full system state at that instant: recommended band, confidence, all inputs, every rule fired, the nurse's resulting band, and timestamp | M |
| FR-4.3 | An optional one-tap reason chip may be attached after the fact; it is never required before the move takes effect | M |
| FR-4.4 | The audit log is exportable and readable by a clinician without the application | M |
| FR-4.5 | Override rate and override direction are computed per shift and surfaced as a model-calibration signal — the model learns from the nurse, never the reverse | S |

### 5.5 Safety modes

| ID | Requirement | Pri |
|---|---|---|
| FR-5.1 | **Surge / disaster mode** activates at ≥3× baseline arrival rate: only the top five critical patients stay highlighted, all other rows collapse to a compact line, and the mode and its trigger are stated on screen | M |
| FR-5.2 | **Degraded-instrument mode** when monitors are unavailable: fall back to visual checks, widen confidence, keep the queue moving | M |
| FR-5.3 | **Absolute emergency override** fires a red alert to clinicians immediately and independently of queue position | M |
| FR-5.4 | Every mode change is logged with its trigger | M |

### 5.6 Fairness monitor

| ID | Requirement | Pri |
|---|---|---|
| FR-6.1 | Track assigned priority and subsequent acuity upgrades by **sex, age band and language** | M |
| FR-6.2 | Report the **worst-served subgroup**, not the aggregate | M |
| FR-6.3 | Flag drift when a subgroup's undertriage proxy diverges beyond a configured tolerance | M |
| FR-6.4 | Present the monitor to administrators in a form they can act on, with the underlying encounters reachable | S |

### 5.7 Overflow valve

| ID | Requirement | Pri |
|---|---|---|
| FR-7.1 | Where the department is at capacity, offer P4/P5 patients a guaranteed slot at a partner clinic | S |
| FR-7.2 | Read live capacity across a city hospital network and recommend ambulance redirection when adding one more patient is itself the hazard | C |

---

## 6. Non-functional requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-1 | Scoring latency, single patient | < 10 ms |
| NFR-2 | Full board recompute, 60 patients | < 100 ms |
| NFR-3 | Cold load on a mid-range tablet | < 2 s |
| NFR-4 | **Offline operation** — full function with no network for an entire shift, after a single initial load (service-worker cache) or from a packaged WebView | Mandatory (Stage 1) |
| NFR-5 | Legibility at 1 m viewing distance, standing | Body ≥ 15 px, vitals ≥ 17 px, tabular figures |
| NFR-6 | Colour is never the sole carrier of meaning | WCAG 1.4.1; every state also has a text token and a glyph |
| NFR-7 | Contrast | ≥ 4.5:1 body, ≥ 7:1 alarm states |
| NFR-8 | Determinism — identical inputs produce an identical, reproducible score with a recorded engine version | Mandatory |
| NFR-9 | No patient identifier is required, transmitted, or stored in Stage 1 | Mandatory |
| NFR-10 | Audit log is append-only and tamper-evident | Mandatory |
| NFR-11 | Touch targets | ≥ 44 × 44 px |

---

## 7. Reference operating parameters

Stated as assumptions, per the Round 2 brief, and adjustable without code change.

| Parameter | Assumed value | Where it is used |
|---|---|---|
| Department volume | 100–500+ patient visits per day | Surge threshold calibration |
| Baseline arrival rate | 6 patients/hour (mid-size ED) | Surge trigger = ≥3× = 18/hour |
| Triage scale | 5-level, ESI v5 aligned (P1–P5 ↔ ESI 1–5) | Band mapping |
| Prior-record availability | ~50% of arrivals have some prior record; the system assumes **none** | Zero-history path is the default path, not the exception (§7.1) |
| Regulatory frame | **DPDP Act 2023 (India)** primary; designed to satisfy HIPAA §164 and GDPR Art. 9 by construction | Retention, consent, minimisation |
| Data retention | Encounter record 24 h on device; audit log 7 years, de-identified | Data policy |
| Undertriage : overtriage cost | 8 : 1 | Tie-breaking, threshold placement |
| Reassessment intervals | P2 15 min · P3 30 min · P4 60 min · P5 120 min | Re-triage prompts |

These are directional, not fixed. Every one is a named constant in a single configuration file so that a deploying hospital changes its own policy without touching the engine.

### 7.1 Designing for the half with no record

The brief assumes roughly half of arrivals have a prior record. We design as though none of them do, and that is a deliberate choice rather than a simplification.

A system that performs well on the half with history and degrades on the half without has optimised for the easier population. The patient with no record is disproportionately the one who is unaccompanied, unable to speak, new to the area, or brought in by a stranger — and disproportionately the one who is undertriaged. Building the zero-history path as the *normal* path means the hard case is the one that is well tested, and the system cannot quietly become worse for the people it is already worst for.

It also makes the deployment claim honest. If value depended on record availability, Stage 1 could not be a single tablet in a department with no integration, and the pilot could not start until the integration did.

**What the other half gets.** History does not go unused; it arrives at Stage 2 as a *source of observations*, not a separate scoring path. An HL7/FHIR feed writes into `OBSERVATION` with `source = monitor_feed`, and prior conditions populate `preexisting_flags`, which existing presentation modifiers already read — anticoagulated, diabetic, cardiac history. The engine does not branch on whether a record exists. A patient with history simply has higher evidence completeness, and therefore a narrower interval, which is exactly the effect it should have.

---

## 8. Success metrics

We deliberately measure three things, and deliberately refuse to measure a fourth.

### 8.1 Catching the quiet crashes *(primary)*
**What we count:** patients sent to the back of the line who then deteriorated while sitting unmonitored.
**Why:** this is the exact failure mode that kills people in a crowded department, and no conventional triage system measures it at all.
**Pilot target:** a measurable fall in unplanned acuity upgrades and waiting-room collapses.

### 8.2 Speed for the sickest
**What we count:** **P95** time-to-clinician for the highest-risk patients only.
**Why:** averages hide the danger. A department can post a healthy mean wait while its sickest patients wait longest.
**Pilot target:** faster first contact for the top-risk group **with the overtriage budget held fixed**, so the gain is real and not bought by upgrading everybody.

### 8.3 Equality of care
**What we count:** undertriage rate broken out by sex, age group and language.
**Why:** pain is described differently across cultures and genders, and triage systems have been shown to absorb that difference as bias.
**Pilot target:** no group with the same symptoms waits longer than another; the **worst-served** group is the optimisation target.

### 8.4 What we refuse to measure
**Average waiting time.** It is the metric that makes a department look good while its sickest patients wait longest. Optimising it directly conflicts with 8.2.

---

## 9. Round 2 prototype scope

The prototype is a **simulation harness around the real engine.** The scoring engine, rule gate, abstention logic, audit log and fairness monitor are production logic. The patients, the clock and the arrivals are synthetic.

**In scope — and demonstrable:**

| # | Round 2 expectation | How the prototype satisfies it |
|---|---|---|
| 1 | Triage scoring on 15–20 simulated records | **20** synthetic encounters with scripted physiological trajectories |
| 2 | At least one ambiguous presentation | **PT-0007** — 61 M, "stomach ache", diaphoretic, atypical ACS pattern |
| 3 | At least one paediatric case | **PT-0011** — 3 y, T 38.5 °C, compensated shock physiology |
| 4 | At least one geriatric case | **PT-0004** — 82 F, afebrile sepsis, normal-looking vitals |
| 5 | At least one zero-history / first-time patient | **PT-0013** — unidentified, unresponsive, brought by passer-by |
| 6 | Behaviour under 3× surge | Surge control injects 18 arrivals/hour; board switches to disaster mode |
| 7 | Uncertainty surfaced on every score | No band renders without a confidence band; abstention is a first-class state |
| 8 | A clinician override, and the log it produces | Drag-to-top on any row; audit drawer shows the full captured state |

**Out of scope for Round 2 (explicitly, and stated in the pitch):**
EHR/HL7 integration · real patient data · authentication and role management · trained ML weights (the model layer is a calibrated rule-and-weight system, not a fitted classifier) · regulatory submission artefacts.

**The Overflow Valve (FR-7.1, FR-7.2) is deliberately not prototyped**, and this is worth stating rather than leaving as an absence. It needs a live capacity feed from partner clinics and a city hospital network — infrastructure that does not exist to integrate against, and that cannot be honestly simulated without inventing the one thing the feature depends on. Prototyping it would have produced a convincing screen backed by nothing.

That is also the argument the staged rollout makes: a hospital gets the whole of Stage 1 — a live, re-triaging, abstaining, auditable queue — before any of that infrastructure exists. A feature that requires the city to cooperate is the right thing to build third, and the wrong thing to demo first.

---

## 10. Rollout

Each stage delivers safety value on its own. A hospital does not need to reach stage three, or own a modern electronic record system, to get the benefit of stage one. Nothing here requires a large infrastructure upgrade to begin.

| Stage | Name | What changes | What it needs |
|---|---|---|---|
| **Day 1** | The Offline Tablet | Runs standalone on one tablet. The nurse types the basic numbers; hidden risk is flagged immediately. Keeps working when the hospital's internet goes down. | One tablet. Nothing else. |
| **Month 3** | The Background Listener | Connects securely to hospital records. The waiting-room list updates itself — the second a new blood pressure or lab result is saved, that patient's place in line adjusts. | Read-only HL7/FHIR feed |
| **Future** | The Traffic Director | Knows which beds and theatres are free. "This person is sick, Room 402 is empty." Or: "we are full, reroute this ambulance." | Bed-management and city-network integration |

---

## 11. Risks and how the design answers them

| Risk | Answer built into the product |
|---|---|
| **Automation bias** — the nurse defers to the machine | The system abstains visibly and often; no unqualified number is ever shown; override is frictionless while agreement is not rewarded |
| **Alert fatigue** | Hard-rule alerts are rare by construction (rules are absolute, not probabilistic) and are the only interruptive element in the interface |
| **Liability** | Recommend-not-decide boundary; complete audit trail; clinician can independently review the basis of every recommendation on the same screen |
| **Model drift** | Fairness monitor plus override-rate calibration report; the engine version is recorded on every score |
| **Workflow rejection** | 90-second capture budget, no mandatory fields at override, works offline, no new hardware |
| **A rule set copied blindly between hospitals** | Rules are a hospital-owned versioned artefact; the protocol version is displayed in the board header at all times |
| **Under-resourced sites cannot deploy** | Stage 1 is one tablet, offline, no integration, no identity requirement |

---

## 12. Adoption — getting a fatigued staff to use it rather than work around it

A triage tool that is not used is worse than no tool, because it produces a record of vigilance that did not happen. The people who will decide whether this survives are at hour nine of a twelve-hour shift, interrupted every ninety seconds, and have been handed software before that made their night worse.

Five decisions in this product exist for adoption rather than for accuracy:

| Decision | What it buys |
|---|---|
| **The override has no dialog and no justification field** | The moment a nurse decides the machine is wrong is the moment a confirmation box becomes an insult. The gesture is one drag. The audit log, not the dialog, is what makes it safe. |
| **The system abstains out loud** | A tool that is confidently wrong once is never trusted again. A tool that says "I cannot separate P2 from P3, ask this" is a colleague. Abstention is the single largest trust investment in the design, and it costs accuracy on paper to buy credibility in use. |
| **Alerts are rare by construction** | Hard rules are absolute physiological criteria, not probabilistic thresholds, so they fire seldom and mean something when they do. The interruptive alert bar is the only interruptive element in the entire interface. |
| **90-second capture, no new hardware, works offline** | The tool asks for no workflow change that the department has to fund, schedule, or train around. It runs on a tablet they already have, in a corridor with no signal. |
| **The nurse is never scored** | Override rate is reported per shift and per cohort as a *model* calibration signal. It is never surfaced as an individual performance metric, and `STAFF` holds a pseudonymous ID with no name. A system that grades its users gets gamed, then abandoned. |

**Rollout as change management.** Stage 1 changes nothing about how the department works: the nurse triages exactly as before, and the board runs alongside as a second opinion that cannot move anyone. The only thing it adds is that patients who are quietly worsening become visible. That is a small enough ask to say yes to, and it is the stage at which trust is either earned or not.

**What we would measure in a pilot.** Override rate and direction in week one versus week six; the proportion of abstentions that get an answer rather than being ignored; and the number of shifts where the board is left closed. The last one is the real adoption metric, and it is the one most pilots do not collect.

---

## 13. Scalability — one assistant across very different hospitals

A workflow built for a large urban trauma centre does not transfer to a small rural department, and a scoring model tuned on one case mix is unsafe on another. The product handles this by making almost nothing about a hospital a property of the software.

**Clinical variation lives in a file, not in code.** `protocol.v1.json` holds every contestable value: red-flag rules and their thresholds, age bands, physiologic tables, presentation classes and modifiers, band thresholds, hazard rates, reassessment intervals, the cost ratio, and the surge trigger. A paediatric hospital ships a protocol whose population paths are weighted differently. An obstetric unit extends the obstetric rules. A rural department with a two-bed resuscitation area raises its own surge threshold, because for them three times baseline is a different number. None of that is a software release, and the protocol version is stamped on every assessment so a decision stays interpretable under the rules that produced it.

**Scale variation is a parameter, not an architecture.** The surge trigger is a multiple of *that department's* measured baseline arrival rate, not an absolute count — so a department seeing 100 visits a day and one seeing 500 both enter surge when they are three times their own normal, which is the only definition of "overwhelmed" that means the same thing in both places.

**Technical-maturity variation is the rollout.** A hospital with no electronic record, no network in the triage corridor, and one spare tablet gets the whole of Stage 1. A hospital with a modern EHR adds the Stage 2 listener and the queue starts updating itself. A hospital with bed management and a regional network reaches Stage 3. Each stage delivers safety value alone, and — the point that matters for adoption — **a hospital never has to reach the next stage to keep the value of the last one.**

**What does not flex, and should not.** The engine, the invariants, the audit contract and the recommend-not-decide boundary are the same everywhere. A hospital may change what counts as a red flag; it may not change whether a fired red flag can be overruled by the model, whether a score can be returned without a confidence value, or whether an override is logged. Those are the properties that make the thing safe, and a deployment that could switch them off would not be the same product.

---

## 14. Open questions

1. Who owns the protocol file clinically — ED clinical lead, or hospital quality committee? Affects the change-control workflow.
2. Should override reason chips be configurable per department, or standardised for cross-site comparability?
3. What is the minimum pilot duration for the fairness monitor to produce a statistically defensible subgroup signal at 200 visits/day?
4. In degraded-instrument mode, is there a floor below which the system should refuse to score at all rather than score wide?

---

*Sources: [Sax DR et al., JAMA Netw Open 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10024207/figure/zoi230137f1) · [ESI Handbook 5th Edition, 2023](https://californiaena.org/wp-content/uploads/2023/05/ESI-Handbook-5th-Edition-3-2023.pdf) · [Royal College of Physicians NEWS2](https://professionals.wrha.mb.ca/files/covid-19-ltc-news2-vital-signs-record.pdf) · [FDA CDS Software guidance, revised Jan 2026](https://www.cov.com/news-and-insights/insights/2026/01/5-key-takeaways-from-fdas-revised-clinical-decision-support-cds-software-guidance)*
