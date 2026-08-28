# PatientTriage.ai — Project Documentation

**Team Mayhem** · Ayush Kumar (lead), Md Waqar Moid, Harshit Agarwal · IIT Kanpur

**Accenture Innovation Challenge 2026** · Problem Track 2 · Round 2

---

## What this is

A decision-support layer over the emergency waiting room. It works from sparse arrival data — chief complaint, five vitals, age, sex and a nurse's visual check — recomputes risk as minutes pass, escalates on hard rules the hospital owns, refuses to guess when it cannot discriminate, and hands every final call back to the human.

**It is not** a diagnosis engine, an autonomous decision-maker, an EHR replacement, or a wait-time predictor.

---

## The six documents

Read in order. Each one assumes the ones before it.

| # | Document | Answers |
|---|---|---|
| 1 | [Product Requirements](01-PRD.md) | What we are building and why. Users, principles, functional requirements, metrics, rollout, risks. |
| 2 | [Technical Requirements](02-TRD.md) | The stack, the architecture, and the complete scoring-engine specification. Every prohibition an AI agent needs. |
| 3 | [App Flow](03-APP-FLOW.md) | Every screen, every navigation path, every interaction trigger. The five-minute demo path. |
| 4 | [UI/UX Brief](04-UIUX-BRIEF.md) | The visual system. Colour tokens, type scale, spacing, components, motion, and the binding anti-generic contract. |
| 5 | [Backend Schema](05-BACKEND-SCHEMA.md) | Data models, relations, constraints, authorisation, retention, and the privacy frame. |
| 6 | [Implementation Plan](06-IMPLEMENTATION-PLAN.md) | 36 ordered build steps, each with an exit test. Definition of done. |

Plus [`AGENTS.md`](AGENTS.md) — the short context file to load into Cursor, Claude Code, Windsurf or Lovable before generating any code — and [`DECISION-PROTOCOL.md`](DECISION-PROTOCOL.md), which governs what a build agent decides for itself and what it escalates.

---

## The three claims the documents are built to support

1. **A frozen triage category is the hazard.** Priority here is a trajectory, not a verdict. `ENCOUNTER` has no `band` column; the current band is always the latest assessment.
2. **A system that cannot say "I don't know" is not safe.** Abstention is a first-class engine output with a schema constraint behind it, not a UI treatment on a low score.
3. **Stage 1 must work on one tablet, offline, in a district hospital at 2 a.m.** Every architectural decision — no build step, no framework, no server, no identity — follows from that.

---

## Reading paths

| If you are | Read |
|---|---|
| A judge with ten minutes | PRD §1, §2, §8 · App Flow §13 (the demo path) |
| An AI coding agent | `AGENTS.md` first, then TRD and UI/UX Brief in full, then Implementation Plan step by step |
| A clinician | PRD §4 (principles) · TRD §4 (the scoring engine) · Backend Schema §6 (privacy and retention) |
| A designer | UI/UX Brief in full · App Flow §4, §5 |

---

## Evidence base

- Sax DR, Warton EM, Mark DG, et al. *Evaluation of the Emergency Severity Index in US Emergency Departments for the Rate of Mistriage.* JAMA Network Open, 2023. 5,315,176 encounters, 21 hospitals: 65.9% correct identification; 3.3% undertriage; 28.9% overtriage.
- *Emergency Severity Index Handbook*, 5th edition, 2023. Decision points A–D; high-risk vital thresholds; paediatric fever criteria.
- Royal College of Physicians. *National Early Warning Score 2 (NEWS2)*. Adult physiologic scoring tables.
- PALS / Maine EMS paediatric vital-sign reference ranges by age band.
- US FDA. *Clinical Decision Support Software: Guidance for Industry and FDA Staff*, revised January 2026. Basis for the recommend-not-decide boundary and the independent-review requirement.
- Academic College of Emergency Experts in India & WHO Collaborating Centre for Emergency and Trauma, South-East Asia. *Strategies to Combat Overcrowding at Emergency Departments across India.*

---

*Documentation revision 1.0 · 23 August 2026*
