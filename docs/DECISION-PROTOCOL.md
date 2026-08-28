# Decision Protocol
### When to decide for yourself, and when to stop and ask

| | |
|---|---|
| **Applies to** | Any agent building from `docs/06-IMPLEMENTATION-PLAN.md` |
| **Supersedes** | The instruction in `PROMPT-FOR-CODEX.md` to "stop and ask" on any ambiguity |
| **Revision** | 1.0 |

---

## 1. The default has changed

Earlier instructions told you to stop whenever the documents were ambiguous. That was right while the specification was thin. It is now the wrong default: the docs are dense, the remaining gaps are mostly mechanical, and each stop costs a round trip that is more expensive than the decision it protects.

> **New default: decide, log, and proceed. Stopping is the exception, and it must be earned.**

Calibration from the blockers raised so far: of eight, **three** genuinely needed the clinical owner. The other five — repository structure, `.gitignore` contents, test paths, stale numeric literals, a doc-to-doc conflict with an obvious safe branch — you could have resolved yourself and logged.

---

## 2. The test

Ask one question:

> **Could getting this wrong change which band a patient is assigned — and is there no safe default?**

**Both must be true to stop.** If the answer to either half is no, decide it yourself.

That second clause carries most of the weight. Most clinical ambiguities *do* have a safe default, and §3 tells you what it is.

---

## 3. The safe-default rule

The product already has a principle for deciding under uncertainty. Apply it to specification uncertainty too.

> **When two readings are defensible, take the one that is more conservative for the patient.**

Concretely, prefer the option that:

- assigns the **higher** acuity, never the lower
- makes the interval **wider**, never narrower
- fires a rule **more** often, never less
- makes a patient **more** visible on the board, never less
- writes **more** to the audit log, never less
- **abstains** rather than asserts

This mirrors the 8:1 undertriage cost that governs the engine. An overtriaged specification decision is a nuisance; an undertriaged one is the failure mode the product exists to prevent. Where the safe branch is obvious under this rule, **you do not have a blocker — you have a decision.**

Worked: PM-AB-01 read `AND` in one document and `OR` in another. `OR` fires more often, so `OR` is the safe branch. That was a Tier 2 decision, not a stop.

---

## 4. Three tiers

### Tier 1 — Decide and proceed. Log normally.

No clinical consequence. Do not mention these in your step report beyond the log entry.

- File and directory structure, naming, module boundaries
- `.gitignore`, config files, test layout, fixture organisation
- JSON shape for anything that is not a clinical value
- Stale literals that contradict a formula — **the formula wins**, fix the literal
- Doc-to-doc conflicts where one source is clearly more specific or more recent
- Anything the plan assigns to a later step that you need now — pull it forward
- Obvious typos, broken cross-references, missing plumbing

### Tier 2 — Decide on the safe default, proceed, mark `PROVISIONAL`.

Clinical consequence exists, but §3 gives a defensible branch.

Log the entry with `**Status:** provisional`, add a row to the **Provisional Decisions** table at the top of `07-DECISION-LOG.md`, and keep going. These are reviewed in one batch at Step 33 — nothing is lost, and nothing blocks.

- A threshold specified in one place and contradicted in another
- A formula referenced but not defined, where a standard or a stated principle implies one
- A missing modifier, question, or field the surrounding structure clearly expects
- An enum that needs a new member to represent a real state
- A calibration that produces a documented case landing in the wrong band

For that last one: if a value must be invented, **derive it rather than guess it.** State the derivation in the log ("30% below the lower bound of the age-band normal"), so it can be checked rather than merely accepted.

### Tier 3 — Stop and ask.

Only these. All four conditions of the tier apply: clinical consequence, no safe default, cannot be derived, and the answer is a judgement a clinician owns.

- **A clinical constant with no derivable basis** — a new red-flag threshold, a scoring band, a cost ratio
- **A safety gate that appears to be missing entirely**, where adding one is itself a clinical judgement (the paediatric SpO₂ gate was correctly this)
- **A whole content artefact that does not exist** and cannot be derived from what does (the protocol file, the cohort)
- **An architectural property that makes a stated product claim unreachable** (the presentation-floor arithmetic)
- **Anything where the conservative branch is also plausibly unsafe** — for example, a rule that would fire so often it would cause alert fatigue and degrade the response to real alarms

If you are unsure which tier applies: it is Tier 2. Tier 3 is a short list, and it is short on purpose.

---

## 5. Before you stop: the overthinking check

Run this before raising any Tier 3. If your tooling supports a subagent, spawn one with the prompt in §6 and give it a fresh read; if not, work the checklist yourself against the documents rather than from memory.

1. **Is it actually absent, or is it somewhere else?** Search `protocol.v1.json`, `cohort.json`, and all of `docs/` for the term and its synonyms before concluding it is missing. Several past blockers were answered in a file that had not been re-read since it changed.
2. **Does §3 resolve it?** If one branch is conservative and the other is not, you are done.
3. **Can it be derived?** From a cited standard, from an existing pattern in the same file, from arithmetic on values that do exist.
4. **Does it block *this step*, or a later one?** If later, note it and carry on. A missing value at Step 24 is not a Step 18 blocker.
5. **Would a wrong choice be caught downstream?** If a test at Step 11 or the design audit at Step 35 would catch it, take the safe branch now and let the test do its job.
6. **Would a competent engineer with clinical supervision ship a decision here without asking?** If yes, so should you.

If all six clear and it is still Tier 3, stop — and stop well (§7).

---

## 6. Reviewer subagent prompt

Hand this to a fresh subagent, along with the specific question and the relevant file excerpts. It has no stake in the answer and no memory of how long you have been staring at it.

```
You are reviewing whether a build agent's blocker is real or whether it is
overthinking. You are not solving the problem.

Context: PatientTriage.ai, an emergency-department triage decision-support
prototype. The build agent works from a complete specification set in docs/
plus two clinical data files, protocol.v1.json and cohort.json. Its standing
instruction is: decide and proceed unless a wrong choice could change which
triage band a patient is assigned AND there is no safe default. The safe
default, always, is the more conservative option for the patient — higher
acuity, wider uncertainty interval, more visible, more logged, abstain over
assert.

The agent proposes to stop and escalate. Assess:

1. Is the information genuinely absent from the provided files, or did the
   agent miss it? Search the excerpts before answering.
2. Does the conservative default resolve it? If one branch is safer for the
   patient, say so and name it.
3. Can the value be derived from a cited standard, an existing pattern in the
   same file, or arithmetic on values that do exist? If so, show the derivation.
4. Does it block the CURRENT step, or a later one?
5. Would a competent engineer under clinical supervision ship a decision here
   without asking?

Return exactly one verdict:
  PROCEED — with the specific decision to take and its one-line justification
  PROVISIONAL — with the safe branch to take and what to flag for later review
  ESCALATE — with the single sharpest question to ask, in one sentence

Bias toward PROCEED. The cost of a logged, reversible, conservative decision is
much lower than the cost of a stalled build. Reserve ESCALATE for a clinical
constant with no derivable basis, a missing safety gate, an absent content
artefact, or an architectural property that makes a stated product claim
unreachable.
```

---

## 7. How to stop, when you do stop

- **Batch.** Do not stop at the first Tier 3 in a phase. Continue on everything not downstream of it, collect the rest, and raise them together at the phase boundary. One message with four questions beats four messages.
- **Lead with what you already did.** State the steps completed and tests passing before the question.
- **Ask the sharpest version.** Not "how should paediatric SpO₂ be handled" but "paediatric SpO₂, supplemental oxygen and ACVPU have no defined Layer-1 contribution, and RULE-RESP-01 is adult-only, so a hypoxic child has no hard-rule gate."
- **Propose an answer.** Give the branch you would take under §3 and say you will proceed on it if there is no reply. Being wrong in a named direction is far more useful than being blocked in no direction.
- **Never idle.** Say what you are continuing with in the meantime.

---

## 8. What has not changed

The safe-default rule licenses decisions about the *specification*. It licenses nothing about the code.

- The eight clinical invariants in `AGENTS.md` are absolute. Never relax one to unblock yourself — model the case honestly instead, as `UNRESOLVABLE` did.
- The design contract in `04-UIUX-BRIEF.md` §2 is absolute.
- No build step, no framework, no runtime dependency.
- Clinical thresholds live in `protocol.v1.json`. A Tier 2 decision that needs a new constant **adds it to the protocol file**; it never hard-codes it.
- **Never edit a fixture, an `expect` block, or a golden file to make a test pass.** If one fails, the fixture and the code are competing claims about the same thing, and which is wrong is a decision — report it.
- Every decision is logged, whatever the tier. The log is the audit trail for the build, and it is the same argument the product makes about itself.
