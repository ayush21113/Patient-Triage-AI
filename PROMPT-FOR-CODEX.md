# Prompt for Codex

---

You are building **PatientTriage.ai** — a decision-support layer over an emergency-department waiting room. This repository currently contains **documentation only**. No application code exists yet. You are writing all of it.

## Step 1 — Read everything before writing anything

Read every `.md` file in this repo **in full, in this order**, before you write a single line of code:

```
docs/AGENTS.md                 ← read first. Hard constraints, invariants, banned libraries.
docs/00-README.md              ← index and reading paths
docs/01-PRD.md                 ← what is being built and why; functional requirements FR-*
docs/02-TRD.md                 ← stack, repo layout, the complete scoring-engine spec
docs/03-APP-FLOW.md            ← every screen, state, and interaction trigger
docs/04-UIUX-BRIEF.md          ← every colour, size, weight, spacing value; binding design contract
docs/05-BACKEND-SCHEMA.md      ← data models, constraints, retention
docs/06-IMPLEMENTATION-PLAN.md ← 36 ordered build steps, each with an exit test
README.md                      ← repo overview, deploy instructions
```

These documents are exhaustive on purpose. **Every value you need is specified.** If you are about to pick a library, a hex code, a font, a threshold, a file path or a folder name, it is already decided somewhere above — go and look it up. Do not improvise, and do not guess. If something genuinely is not specified, say so and stop; do not invent it.

## Step 2 — Build in order

Follow `docs/06-IMPLEMENTATION-PLAN.md` **one step at a time, from Step 1 to Step 36**. Each step names its deliverable and its exit test. Run the exit test and confirm it passes before starting the next step. Do not batch steps. Do not jump ahead to the visible parts — the scoring engine (Phase 1) is built and fully tested before anything renders, and this is deliberate.

The target file tree is specified exactly in `docs/02-TRD.md` §3. Create it as written.

## Step 3 — The three constraints that override your defaults

1. **No build step, no framework, no runtime dependency.** Vanilla HTML, one hand-written CSS file, native ES modules. No Vite, React, Next, Tailwind, shadcn, Chart.js, D3, Lucide, or any npm package in the deploy path. The files in the repo are the files that are served. Offline operation comes from the service worker after one HTTPS load, or a packaged WebView — see TRD §1.
2. **`assets/js/engine/` is pure.** No DOM, no storage, no `Date.now()`. `now` is always a parameter.
3. **The design contract in `docs/04-UIUX-BRIEF.md` §2 is binding.** No purple or indigo, no gradients, no `box-shadow`, no `border-radius` above 2px, no Inter, no icon library, no emoji, no cards.

## Step 4 — How to write the code

**Before every line, ask: is this line necessary?** If the answer is no, or "it might be useful later", delete it. Write the smallest correct thing that satisfies the specified requirement, and nothing beyond it.

Specifically, do not produce:

- Defensive checks for conditions that cannot occur given the specified inputs
- Abstractions with one caller — inline it
- Configuration options nobody asked for, or "flexibility" for hypothetical futures
- Wrapper functions that only forward arguments
- Comments restating what the code plainly does — comment only *why*, when the why is not obvious
- Placeholder, stub, or `TODO` code, unless the plan explicitly defers that step
- Dead branches, unused parameters, unused imports, unreachable code
- Console logging left in beyond what a step's exit test requires

Clean-code principles, applied concretely here:

- **One module, one responsibility.** The file map in the TRD already assigns them. `main.js` wires modules together and contains no logic.
- **Pure functions where the spec says pure.** Same inputs → identical output, always.
- **Name things after what they mean in the domain**, using the vocabulary table in `docs/AGENTS.md` — `provisionalBand`, `evidenceCompleteness`, `timeHazard`, not `val`, `tmp`, `data2`.
- **No magic numbers.** Every clinical threshold comes from `assets/data/protocol.v1.json`, never a literal in code.
- **Functions do one thing** and are short enough to read without scrolling.
- **Fail loudly at the boundary.** The engine throws on a contract violation (TRD §4.7) rather than returning a degraded object.
- **Delete rather than comment out.** Git has the history.

## Step 5 — Keep a decision log

Create `docs/07-DECISION-LOG.md` in your first commit and **append to it as you build**. Every time you make a choice the documents did not make for you, record it there before moving on.

One entry per decision, in this format:

```md
### D-007 · Row reuse keyed by encounter ID
**Step:** 15 · **Date:** 2026-08-24 · **Status:** accepted

**Decision.** Reuse existing `<tr>` nodes keyed by encounter ID instead of
rebuilding the tbody each tick.

**Why.** TRD §2 permits a full re-render at n=60, but a rebuilt row loses
focus and restarts the value-flash animation, which breaks UIUX §7 — the
flash is what tells the nurse a number changed.

**Alternatives rejected.** Full tbody rebuild (loses focus and animation
state). Virtual DOM diffing (needs a library; banned by TRD §2.1).

**Consequences.** Row nodes must be explicitly removed on discharge or they
leak. Covered by the Step 15 exit test.
```

Log a decision whenever you:

- Choose between two approaches the docs left open
- Interpret an ambiguous or under-specified requirement (say what you assumed)
- Find a genuine gap, conflict or error in the documents — record what you found and what you did about it
- Depart from a documented instruction for a reason you can defend (state the reason; if you cannot defend it, do not depart)
- Fix a non-obvious bug where the *cause* is worth remembering
- Deliberately leave something out of scope

Do **not** log routine work. "Created `engine/rules.js` as specified in TRD §3" is not a decision — the doc already decided it. The log records only what *you* decided, and why.

Keep entries short. Numbered `D-001` upward, newest at the bottom, with a one-line index table at the top of the file. When a later decision reverses an earlier one, mark the old entry `superseded by D-0xx` rather than deleting it.

## Step 6 — Safety invariants

Eight clinical invariants are listed in `docs/AGENTS.md`. They are enforced in code, not by convention. The most important:

- No assessment is ever returned without a `confidence` value — the engine throws otherwise.
- A fired `PIN_P1` hard rule always yields band `P1` with `modelLockedOut = true`, and the engine may not emit any recommendation containing a wait.
- Age band is computed **before** any threshold table is selected. Never look up an adult table and correct for age afterwards.
- Override never requires a dialog or a justification field.

## Working style

Work step by step. After each step, state briefly which step you completed, which exit test you ran, its result, and any decision-log entries you added. Then continue.

**On ambiguity, read `docs/DECISION-PROTOCOL.md` — it governs.** The short version: decide, log, and proceed. Stop only when a wrong choice could change which band a patient is assigned **and** there is no safe default. The safe default is always the more conservative option for the patient — higher acuity, wider interval, more visible, more logged, abstain over assert. Run the overthinking check in §5 before escalating, and batch what you do escalate to the phase boundary.

Begin by reading the documents. Report back with a one-paragraph confirmation of what you understood before you start Step 1.
