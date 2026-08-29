# PatientTriage.ai Decision Log

## Provisional Decisions

| ID | Step | Review item |
|---|---:|---|
| — | — | No provisional decisions remain after the Step 36 review |

| ID | Step | Decision | Status |
|---|---:|---|---|
| [D-001](#d-001--required-tree-and-offline-boundary) | 1 | Required tree and offline boundary | accepted |
| [D-002](#d-002--corrected-measured-contrast-contract) | 2 | Corrected measured contrast contract | accepted |
| [D-003](#d-003--typography-tokens-use-css-font-shorthands) | 2 | Typography tokens use CSS font shorthands | superseded in part by D-072 |
| [D-004](#d-004--dom-helpers-have-narrow-composable-signatures) | 3 | DOM helpers have narrow composable signatures | accepted |
| [D-005](#d-005--protocol-is-supplied-by-the-clinical-owner) | 4 | Protocol is supplied by the clinical owner | accepted |
| [D-006](#d-006--qualifiers-and-obstetric-bleeding-are-explicit-inputs) | 4 | Qualifiers and obstetric bleeding are explicit inputs | accepted |
| [D-007](#d-007--paediatric-layer-1-scores-all-seven-parameters) | 7 | Paediatric Layer 1 scores all seven parameters | accepted |
| [D-008](#d-008--paediatric-hard-rules-close-the-adult-only-gate-hole) | 7 | Paediatric hard rules close the adult-only gate hole | accepted |
| [D-009](#d-009--parameter-maxima-make-population-paths-testable) | 7 | Parameter maxima make population paths testable | accepted |
| [D-010](#d-010--age-banding-accepts-the-protocol-and-returns-the-estimation-state) | 5 | Age banding accepts the protocol and returns the estimation state | accepted |
| [D-011](#d-011--calendar-units-convert-with-the-mean-gregorian-year) | 5 | Calendar units convert with the mean Gregorian year | accepted |
| [D-012](#d-012--protocol-formulas-use-a-narrow-data-only-parser) | 6 | Protocol formulas use a narrow data-only parser | accepted |
| [D-013](#d-013--exact-day-inputs-do-not-round-trip-through-years) | 6 | Exact day inputs do not round-trip through years | accepted |
| [D-014](#d-014--protocol-resolves-the-rr-21-plan-conflict) | 7 | Protocol resolves the RR 21 plan conflict | accepted |
| [D-015](#d-015--per-parameter-derivation-is-minimal-and-explicit) | 7 | Per-parameter derivation is minimal and explicit | accepted |
| [D-016](#d-016--paediatric-deviation-is-relative-to-the-nearest-bound) | 7 | Paediatric deviation is relative to the nearest bound | accepted |
| [D-017](#d-017--step-8-paused-for-the-missing-radiating-condition) | 8 | Step 8 paused for the missing radiating condition | superseded by D-018 |
| [D-018](#d-018--pm-ab-01-follows-the-clinically-correct-trd) | 8 | PM-AB-01 follows the clinically correct TRD | accepted |
| [D-019](#d-019--answered-findings-cannot-be-resolving-questions) | 10 | Answered findings cannot be resolving questions | amended by D-027 |
| [D-020](#d-020--every-qualifier-chip-affects-a-modifier) | 8 | Every qualifier chip affects a modifier | accepted |
| [D-021](#d-021--presentation-clamping-preserves-full-derivation) | 8 | Presentation clamping preserves full derivation | accepted |
| [D-022](#d-022--drift-uses-a-window-boundary-anchor) | 9 | Drift uses a window-boundary anchor | accepted |
| [D-023](#d-023--step-10-paused-for-undefined-uncertainty-calculations) | 10 | Step 10 paused for undefined uncertainty calculations | superseded by D-025 and D-026 |
| [D-024](#d-024--null-question-behaviour-conflicts-with-binding-invariants) | 10 | Null-question behaviour conflicts with binding invariants | superseded by D-027 |
| [D-025](#d-025--drift-uncertainty-scales-with-change-sparsity-and-coverage) | 10 | Drift uncertainty scales with change, sparsity and coverage | accepted |
| [D-026](#d-026--question-ranking-uses-deterministic-information-gain) | 10 | Question ranking uses deterministic information gain | accepted |
| [D-027](#d-027--unresolvable-preserves-the-unresolved-question-invariant) | 10 | UNRESOLVABLE preserves the UNRESOLVED question invariant | accepted |
| [D-028](#d-028--step-10-paused-for-a-stale-null-question-protocol-note) | 10 | Step 10 paused for a stale null-question protocol note | resolved by D-030 |
| [D-029](#d-029--worked-assessment-eig-does-not-match-the-new-formula) | 10 | Worked assessment EIG does not match the new formula | resolved by D-030 |
| [D-030](#d-030--all-three-stale-step-10-literals-are-corrected) | 10 | All three stale Step 10 literals are corrected | accepted |
| [D-031](#d-031--worked-examples-are-executable-contract-fixtures) | 10 | Worked examples are executable contract fixtures | accepted |
| [D-032](#d-032--uncertainty-consumes-candidate-bands-without-selecting-them) | 10 | Uncertainty consumes candidate bands without selecting them | accepted |
| [D-033](#d-033--step-11-paused-for-the-cohort-ordering-conflict) | 11 | Step 11 paused for the cohort ordering conflict | resolved by D-034 |
| [D-034](#d-034--cohort-ships-before-its-loader) | 11 | Cohort ships before its loader | accepted |
| [D-035](#d-035--presentation-band-floors-close-the-continuous-score-gap) | 11 | Presentation band floors close the continuous-score gap | accepted |
| [D-036](#d-036--bandsetby-records-the-deciding-mechanism) | 11 | bandSetBy records the deciding mechanism | accepted |
| [D-037](#d-037--collateral-change-from-baseline-is-structured-evidence) | 11 | Collateral change from baseline is structured evidence | accepted |
| [D-038](#d-038--missing-current-band-uses-the-highest-hazard-bearing-rate) | 11 | Missing current band uses the highest hazard-bearing rate | accepted at Step 33 |
| [D-039](#d-039--insufficient-evidence-remains-an-abstention-under-a-floor) | 11 | Insufficient evidence remains an abstention under a floor | accepted at Step 33 |
| [D-040](#d-040--interval-construction-precedes-candidate-band-classification) | 11 | Interval construction precedes candidate-band classification | accepted |
| [D-041](#d-041--playwright-is-exactly-pinned-in-the-test-toolchain) | 11 | Playwright is exactly pinned in the test toolchain | accepted |
| [D-042](#d-042--cohort-expectations-block-golden-acceptance) | 11 | Cohort expectations block golden acceptance | resolved by D-043–D-046 |
| [D-043](#d-043--engine-exposed-five-protocol-defects) | 11 | Engine exposed five protocol defects | accepted |
| [D-044](#d-044--abstention-is-reserved-for-safety-relevant-boundaries) | 11 | Abstention is reserved for safety-relevant boundaries | accepted |
| [D-045](#d-045--six-cohort-expectations-were-corrected-by-the-owner) | 11 | Six cohort expectations were corrected by the owner | accepted |
| [D-046](#d-046--cohort-expectations-can-name-an-acceptable-set) | 11 | Cohort expectations can name an acceptable set | accepted |
| [D-047](#d-047--two-revised-drift-cases-remain-inside-the-abstention-zone) | 11 | Two revised drift cases remain inside the abstention zone | resolved by D-048 and D-049 |
| [D-048](#d-048--trajectory-consistency-reduces-drift-uncertainty) | 11 | Trajectory consistency reduces drift uncertainty | accepted |
| [D-049](#d-049--deteriorating-trajectories-include-falling-sbp) | 11 | Deteriorating trajectories include falling SBP | accepted |
| [D-050](#d-050--clock-advances-by-observed-wall-time) | 13 | Clock advances by observed wall time | accepted |
| [D-051](#d-051--board-simulation-coordination-stays-out-of-main) | 14 | Board simulation coordination stays out of main | accepted |
| [D-052](#d-052--missing-and-unobtainable-vitals-stay-visually-distinct) | 15 | Missing and unobtainable vitals stay visually distinct | accepted |
| [D-053](#d-053--queue-rows-honor-the-touch-target-minimum) | 15 | Queue rows honor the touch-target minimum | accepted |
| [D-054](#d-054--a-missing-complaint-is-stated-not-stringified) | 15 | A missing complaint is stated, not stringified | accepted |
| [D-055](#d-055--queue-confidence-uses-fixed-column-tokens) | 15 | Queue confidence uses fixed-column tokens | accepted |
| [D-056](#d-056--sparklines-never-invent-readings) | 19 | Sparklines never invent readings | accepted |
| [D-057](#d-057--capture-sheets-have-a-dedicated-render-module) | 20 | Capture sheets have a dedicated render module | accepted |
| [D-058](#d-058--override-destination-uses-the-target-rows-band) | 21 | Override destination uses the target row's band | accepted at Step 33 |
| [D-059](#d-059--queue-order-honors-band-before-index) | 21 | Queue order honors band before index | accepted |
| [D-060](#d-060--audit-chain-uses-a-zero-hash-genesis) | 22 | Audit chain uses a zero-hash genesis | accepted |
| [D-061](#d-061--score-events-track-the-effective-queue-band) | 22 | SCORE events track the effective queue band | accepted |
| [D-062](#d-062--the-audit-drawer-has-a-dedicated-renderer) | 23 | The audit drawer has a dedicated renderer | accepted |
| [D-063](#d-063--exports-preserve-the-complete-chain) | 23 | Exports preserve the complete chain | accepted |
| [D-064](#d-064--surge-injection-reuses-governed-cohort-cases) | 24 | Surge injection reuses governed cohort cases | accepted |
| [D-065](#d-065--the-surge-control-arrives-with-the-mode) | 24 | The surge control arrives with the mode | accepted |
| [D-066](#d-066--degraded-mode-preserves-earlier-measurements) | 25 | Degraded mode preserves earlier measurements | accepted at Step 33 |
| [D-067](#d-067--the-monitor-loss-control-arrives-with-the-mode) | 25 | The monitor-loss control arrives with the mode | accepted |
| [D-068](#d-068--fairness-tolerance-flags-any-observed-divergence) | 26 | Fairness tolerance flags any observed divergence | accepted at Step 33 |
| [D-069](#d-069--fairness-computation-and-rendering-stay-separate) | 26 | Fairness computation and rendering stay separate | accepted |
| [D-070](#d-070--reassessment-visibility-rises-on-each-missed-interval) | 27 | Reassessment visibility rises on each missed interval | accepted |
| [D-071](#d-071--reset-reloads-clinical-state-without-erasing-audit-history) | 28 | Reset reloads clinical state without erasing audit history | accepted |
| [D-072](#d-072--four-local-plex-files-replace-the-online-font-request) | 29 | Four local Plex files replace the online font request | accepted |
| [D-073](#d-073--the-install-icon-is-a-minimal-token-only-mark) | 30 | The install icon is a minimal token-only mark | accepted |
| [D-074](#d-074--github-remote-is-not-invented) | 31 | GitHub remote is not invented | accepted |
| [D-075](#d-075--service-worker-install-bypasses-the-immutable-http-cache) | 32 | Service-worker install bypasses the immutable HTTP cache | accepted |
| [D-076](#d-076--production-deployment-awaits-an-owner-supplied-remote) | 32 | Production deployment awaits an owner-supplied remote | accepted |
| [D-077](#d-077--step-33-accepts-all-five-provisional-decisions) | 33 | Step 33 accepts all five provisional decisions | accepted |
| [D-078](#d-078--accessibility-wins-the-colophon-token-conflict) | 33 | Accessibility wins the colophon token conflict | accepted |
| [D-079](#d-079--playwright-consumes-an-explicit-test-server) | 33 | Playwright consumes an explicit test server | accepted |
| [D-080](#d-080--local-fonts-are-subset-to-the-deployed-glyph-surface) | 34 | Local fonts are subset to the deployed glyph surface | amended by D-086 |
| [D-081](#d-081--the-javascript-budget-conflicts-with-the-source-architecture) | 34 | The JavaScript budget conflicts with the source architecture | accepted on continuation |
| [D-082](#d-082--cold-load-is-measured-at-four-times-cpu-throttling) | 34 | Cold load is measured at four-times CPU throttling | accepted |
| [D-083](#d-083--the-inspector-draws-at-the-1024-px-boundary) | 35 | The inspector draws at the 1024 px boundary | accepted |
| [D-084](#d-084--three-person-design-review-awaits-the-deployed-url) | 35 | Three-person design review awaits the deployed URL | pending external review |
| [D-085](#d-085--resolving-answers-apply-protocol-owned-shifts) | 36 | Resolving answers apply protocol-owned shifts | accepted at Step 36 |
| [D-086](#d-086--font-subsets-exclude-non-interface-punctuation) | 36 | Font subsets exclude non-interface punctuation | accepted |
| [D-087](#d-087--the-manual-surge-control-enters-surge-immediately) | 36 | The manual surge control enters surge immediately | superseded by D-088 |
| [D-088](#d-088--surge-rehearsal-preserves-the-trailing-rate-gate) | 36 | Surge rehearsal preserves the trailing-rate gate | accepted |
| [D-089](#d-089--late-provisional-review-accepts-the-answer-flow) | 36 | Late provisional review accepts the answer flow | accepted |
| [D-090](#d-090--row-meta-stays-inside-the-complaint-column) | 35 rework | Row meta stays inside the complaint column | accepted |
| [D-091](#d-091--safety-states-keep-their-full-names) | 35 rework | Safety states keep their full names | accepted |
| [D-092](#d-092--the-empty-inspector-names-the-three-longest-waits) | 35 rework | The empty inspector names the three longest waits | accepted |
| [D-093](#d-093--the-1024-drawer-reserves-queue-space) | 35 rework | The 1024 drawer reserves queue space | accepted |
| [D-094](#d-094--the-layout-integrity-exemption-was-inherited-not-opted-into) | 35 rework | Layout-integrity ellipsis requires explicit opt-in | accepted |
| [D-095](#d-095--confidence-marks-are-drawn-not-typed) | 35 rework | Confidence marks are drawn, not typed | accepted |
| [D-096](#d-096--row-tokens-are-short-because-the-row-is-a-scanning-surface) | 16 rework | Row tokens use governed short forms | accepted |
| [D-097](#d-097--per-asset-budgets-measure-transferred-bytes) | 34 rework | Per-asset budgets measure transferred bytes | accepted |
| [D-098](#d-098--windows-only-path-assumption-in-the-service-worker-test) | 32 rework | Service-worker test paths are portable | accepted |
| [D-099](#d-099--golden-snapshots-regenerated-for-an-additive-field) | 11 rework | Goldens accept an additive display field | accepted |

### D-001 · Required tree and offline boundary
**Step:** 1 · **Date:** 2026-08-23 · **Status:** accepted

**Decision.** Apply TRD §3 as a required tree, not an exclusion list; preserve
all supplied sources and keep tests outside the deployed surface. Treat offline
operation as service-worker-cached HTTP or a packaged WebView, not `file://`.

**Why.** The first revision abbreviated the tree and conflicted with native
module and service-worker browser restrictions. The corrected TRD §1 and §3
now specify both boundaries explicitly, so this is documented architecture
rather than an implementation assumption.

**Alternatives rejected.** Delete supporting files absent from the original
abbreviated tree (discards project sources); claim direct `file://` support
(incompatible with the selected browser primitives).

**Consequences.** Only `index.html`, `sw.js`, `manifest.webmanifest`,
`vercel.json` and `assets/` may be fetched by the application. Step 29 tests
offline reload after one HTTP load.

### D-002 · Corrected measured contrast contract
**Step:** 2 · **Date:** 2026-08-23 · **Status:** superseded in part by D-072

**Decision.** Use the corrected UIUX §3 tokens, including separate P1 fill and
fill-ink tokens. Require 7:1 for that filled alarm pair and 4.5:1 for other
signal hues.

**Why.** Recalculation showed the earlier token values did not meet their stated
ratios. The documents were corrected with measured values; no contrast
exception was taken.

**Alternatives rejected.** Preserve the failing values (breaks the Step 2 exit
test); force every signal to 7:1 (turns escalation amber brown and dark alarm
red salmon, weakening their meanings).

**Consequences.** Every UIUX §3.4 pair is recomputed at Step 2 and after any
later token change; the P1 filled chip uses only the dedicated fill pair.

### D-003 · Typography tokens use CSS font shorthands
**Step:** 2 · **Date:** 2026-08-23 · **Status:** accepted

**Decision.** Encode each `--t-*` token as a CSS `font` shorthand containing
its documented weight, size, line height and family, with a matching tracking
token. Request the documented 400–600 range as one variable font per Plex
family.

**Why.** UIUX §4.2 specifies all five font dimensions but leaves their CSS
encoding and Google Fonts query open. Shorthands keep the dimensions together,
and variable ranges align with Step 29's four-font precache requirement.

**Alternatives rejected.** Size-only `--t-*` tokens (scatter the remaining
documented dimensions); separate static font requests per weight (more than the
four font resources specified for offline caching).

**Consequences.** Components apply `font: var(--t-*)` and the corresponding
tracking token; Step 29 must cache the four resolved variable-font resources.

### D-004 · DOM helpers have narrow composable signatures
**Step:** 3 · **Date:** 2026-08-23 · **Status:** accepted

**Decision.** `el(tagName, attributes)` creates one element and sets ordinary
attributes, `on(target, type, listener)` attaches one listener and returns its
cleanup function, and `text(value)` creates a text node.

**Why.** The implementation plan names the three helpers but not their
contracts. These signatures cover safe DOM construction without embedding a
component system in the utility module.

**Alternatives rejected.** A factory that also interprets children, styles and
events (too much hidden behaviour); HTML-string rendering (creates an injection
surface and bypasses semantic node construction).

**Consequences.** Render modules append children explicitly and use native DOM
methods for behaviour outside these three operations.

### D-005 · Protocol is supplied by the clinical owner
**Step:** 4 · **Date:** 2026-08-24 · **Status:** accepted

**Decision.** Treat `assets/data/protocol.v1.json` as immutable clinical-owner
content and TRD §12 as its engine contract. Step 4 verifies the artefact but
does not author, regenerate or restructure it.

**Why.** Rules, scoring tables, modifiers and resolving questions are
clinically contestable. Their values and representation require clinical
governance rather than implementation judgement.

**Alternatives rejected.** Infer missing clinical content from prose (outside
engineering authority); create an implementation-owned schema (would make code
changes part of protocol governance).

**Consequences.** Where TRD §4 and the protocol differ, the protocol wins. A
verification failure stops the build and is reported as a clinical-content
defect.

### D-006 · Qualifiers and obstetric bleeding are explicit inputs
**Step:** 4 · **Date:** 2026-08-24 · **Status:** accepted

**Decision.** Add `complaint_qualifiers` to the encounter contract and
`visual.heavy_vaginal_bleeding` to the observation contract and capture form.
The engine never derives qualifiers by parsing `complaint_text`.

**Why.** Presentation modifiers and RULE-OBS-02 require observable structured
inputs. Free-text inference in the triage path is non-deterministic and cannot
support a reproducible derivation.

**Alternatives rejected.** Parse complaint prose (unsafe and opaque); omit the
inputs (makes documented modifiers and the obstetric rule unreachable).

**Consequences.** Arrival capture exposes one-tap qualifier chips and shows the
bleeding toggle only for pregnant or postpartum encounters.

### D-007 · Paediatric Layer 1 scores all seven parameters
**Step:** 7 · **Date:** 2026-08-24 · **Status:** accepted

**Decision.** Complete the paediatric path with its own SpO₂ table, the shared
oxygen score, the paediatric ACVPU guidance and the adult temperature table,
alongside age-banded HR, RR and SBP.

**Why.** The earlier protocol specified only three paediatric parameters, so
the path could not reach Layer 1's declared maximum and left important measured
physiology unscored.

**Alternatives rejected.** Apply the entire adult table to children (unsafe age
calibration); omit the four parameters (incomplete physiology path).

**Consequences.** Every population scores the same seven parameters and the
paediatric congenital-cyanotic-heart-disease limitation remains explicit.

### D-008 · Paediatric hard rules close the adult-only gate hole
**Step:** 7 · **Date:** 2026-08-24 · **Status:** accepted

**Decision.** Add the clinical-owner supplied RULE-PAED-04 for critical
hypoxaemia and RULE-PAED-05 for age-banded bradypnoea. Adult respiratory rules
remain excluded from paediatric encounters.

**Why.** An adult-only oxygen gate left a hypoxic child without a replacement,
and an adult RR floor is meaningless against paediatric normal ranges.

**Alternatives rejected.** Reuse adult respiratory thresholds (undertriages
children); rely only on the weighted physiology score (fails the hard-rule
precedence invariant).

**Consequences.** A 3-year-old at SpO₂ 87 and RR 7 fires both paediatric pins
while both adult respiratory rules stay silent.

### D-009 · Parameter maxima make population paths testable
**Step:** 7 · **Date:** 2026-08-24 · **Status:** accepted

**Decision.** Treat `physiology.parameterMaxima` and its `populationPaths` as a
permanent reachability contract for Layer 1.

**Why.** A declared maximum without per-population parameter paths allowed a
missing clinical parameter to remain invisible until manual review.

**Alternatives rejected.** Test only observed cohort scores (cannot prove a
path is complete); retain an undocumented maximum (not auditable).

**Consequences.** Tests fail if any adult, paediatric or obstetric path omits a
parameter or cannot sum to exactly 20.

### D-010 · Age banding accepts the protocol and returns the estimation state
**Step:** 5 · **Date:** 2026-08-24 · **Status:** accepted

**Decision.** `ageBand(ageValue, ageUnit, protocol)` reads all boundaries from
the protocol and returns `{ ageBand, ageEstimated }`.

**Why.** The abbreviated Step 5 signature omitted the protocol even though TRD
§12 assigns `ageBands` and `ageBandFallback` to this function. The fallback's
required estimated flag also cannot be represented by a string-only result.

**Alternatives rejected.** Hard-code boundaries in the module (violates the
protocol ownership rule); return only the band (drops the required fallback
state).

**Consequences.** Every caller supplies the active protocol and persists both
derived fields on the encounter.

### D-011 · Calendar units convert with the mean Gregorian year
**Step:** 5 · **Date:** 2026-08-24 · **Status:** accepted

**Decision.** Convert years to days with 365.25 days per year and months with
one twelfth of that value, flooring to the completed day before protocol lookup.

**Why.** The protocol stores inclusive day boundaries while capture accepts
days, months and years. Its 16-, 65- and 80-year boundaries encode the 365.25-day
mean, and flooring preserves completed-age semantics.

**Alternatives rejected.** Use 365 days (misclassifies the documented 16- and
65-year boundaries); use 30 days per month (misclassifies 12 months).

**Consequences.** The boundary tests cover every capture unit and the adult,
older-adult and elderly transitions.

### D-012 · Protocol formulas use a narrow data-only parser
**Step:** 6 · **Date:** 2026-08-24 · **Status:** accepted

**Decision.** Parse paediatric floor expressions only as
`number + number * ageYears`; never execute the string as JavaScript.

**Why.** The clinical owner supplies the formula as data. `eval` or `Function`
would turn a protocol edit into executable code, violate the production CSP,
and expand the protocol's authority beyond clinical values.

**Alternatives rejected.** Dynamic JavaScript evaluation (unsafe and blocked
by CSP); hard-code the current coefficients (moves clinical values into code).

**Consequences.** An expression outside the documented shipped form throws as
a protocol contract violation.

### D-013 · Exact day inputs do not round-trip through years
**Step:** 6 · **Date:** 2026-08-24 · **Status:** accepted

**Decision.** Compute `ageDays` directly from the captured unit and derive
`ageYears` separately instead of converting days to years and back.

**Why.** Binary floating-point round-tripping changed an exact 27-day input to
26 completed days and crossed the neonate/infant test boundary.

**Alternatives rejected.** Add an epsilon before flooring (hides the cause and
can move genuinely fractional inputs); round every result (changes completed-age
semantics).

**Consequences.** Exact day inputs remain exact, while month and year inputs
retain the documented completed-day flooring rule.

### D-014 · Protocol resolves the RR 21 plan conflict
**Step:** 7 · **Date:** 2026-08-24 · **Status:** accepted

**Decision.** Score adult respiration rate 21 as 2, as specified by
`protocol.v1.json` and the NEWS2 table in TRD §4.2.1.

**Why.** Implementation Plan Step 7 says 21 scores 1, conflicting with both
authoritative sources. TRD §12 makes the shipped protocol the clinical contract.

**Alternatives rejected.** Follow the plan warning (contradicts the protocol
and NEWS2 table); stop despite the explicit precedence rule (unnecessary).

**Consequences.** The independent NEWS2 fixture asserts RR 21–24 as score 2,
and any future mismatch fails the Step 7 test.

### D-015 · Per-parameter derivation is minimal and explicit
**Step:** 7 · **Date:** 2026-08-24 · **Status:** accepted

**Decision.** Each `perParameter` item contains `{ parameter, value, score }`,
and `missing` names the corresponding captured field.

**Why.** TRD §4.2 specifies the arrays but not their item shape. These three
values are the minimum needed to trace every Layer-1 contribution in the
inspector.

**Alternatives rejected.** Return scores without observed values (not
traceable); include table copies or display labels (duplicates protocol/UI
responsibilities).

**Consequences.** `onOxygen` records the captured `spo2_on_oxygen` boolean as
its value, while a missing entry uses the capture-field name.

### D-016 · Paediatric deviation is relative to the nearest bound
**Step:** 7 · **Date:** 2026-08-24 · **Status:** accepted

**Decision.** Calculate percentage distance outside a paediatric normal range
relative to the nearest crossed boundary: `(low-value)/low` below it and
`(value-high)/high` above it.

**Why.** TRD §12.5 says to score percentage distance outside the range but does
not spell out the denominator. The crossed boundary is the only reference
value that measures distance from that range.

**Alternatives rejected.** Divide by range width (measures band width, not
distance relative to the clinical limit); divide by the observation (asymmetric
and unstable near zero).

**Consequences.** Exact 15% and 30% deviations remain in scores 1 and 2 because
the protocol bounds are inclusive; values beyond them score 2 and 3.

### D-017 · Step 8 paused for the missing radiating condition
**Step:** 8 · **Date:** 2026-08-24 · **Status:** superseded by D-018

**Decision.** Do not implement Layer 2 until the clinical owner reconciles
`PM-AB-01` with the documented `radiating` branch.

**Why.** TRD §4.3 requires age 55 or over with diaphoresis or radiating pain,
and App Flow §6 plus Backend Schema §3.2 say the structured qualifier drives
presentation modifiers. The shipped protocol tests diaphoresis only.

**Alternatives rejected.** Add the missing branch in code (hard-codes clinical
content); silently follow the incomplete JSON (makes the structured safety
input ineffective).

**Consequences.** Step 8 remained blocked until the clinical owner supplied the
correction recorded in D-018.

### D-018 · PM-AB-01 follows the clinically correct TRD
**Step:** 8 · **Date:** 2026-08-27 · **Status:** accepted

**Decision.** Use the corrected protocol condition: age 55 or over and either
diaphoresis or the `radiating` qualifier.

**Why.** The clinical owner confirmed the TRD was correct and the former
protocol condition was defective.

**Alternatives rejected.** Preserve the former protocol condition (misses the
documented silent-MI presentation); require both findings (over-restrictive).

**Consequences.** Either structured finding activates PM-AB-01 for an eligible
patient, and PT-0007 exercises the radiating-only path.

### D-019 · Answered findings cannot be resolving questions
**Step:** 10 · **Date:** 2026-08-27 · **Status:** amended by D-027

**Decision.** Suppress a resolving question when its protocol-supplied
`alreadyAnsweredWhen` condition is true.

**Why.** Reasking a captured finding can double-count it and wastes the single
question intended to add information.

**Alternatives rejected.** Offer the highest-shift question regardless of
recorded inputs (double-counts); invent a replacement question (clinical
content does not belong in code).

**Consequences.** Step 10 reuses the shared condition evaluator and selects the
next eligible question. The former `UNRESOLVED` null-question consequence is
superseded by the `UNRESOLVABLE` state in D-027.

### D-020 · Every qualifier chip affects a modifier
**Step:** 8 · **Date:** 2026-08-27 · **Status:** accepted

**Decision.** Treat qualifier coverage as a protocol contract and test all six
capture chips against presentation modifier conditions.

**Why.** The clinical owner added PM-CP-04 for `exertional` and added
`sudden_onset` to PM-HD-01 after finding both inputs had no scoring effect.

**Alternatives rejected.** Leave inert capture fields (misleads the nurse);
interpret free text (explicitly prohibited).

**Consequences.** A future qualifier without a modifier reference fails the
Step 8 exit test.

### D-021 · Presentation clamping preserves full derivation
**Step:** 8 · **Date:** 2026-08-27 · **Status:** accepted

**Decision.** Clamp the presentation score to the protocol maximum after all
modifiers are evaluated, and mark the result `clamped` without dropping any.

**Why.** Chest pain can total 26 against a Layer-2 maximum of 20; omitting
firing modifiers would make the derivation incomplete.

**Alternatives rejected.** Stop evaluating at 20 (hides evidence); truncate
the modifier list (makes a real contribution look unseen).

**Consequences.** The score remains within the layer contract while the full
clinical reasoning stays reviewable.

### D-022 · Drift uses a window-boundary anchor
**Step:** 9 · **Date:** 2026-08-27 · **Status:** accepted

**Decision.** Compare the latest reading with the nearest reading at or before
the 30-minute boundary, falling back to the earliest reading, and cap the slope
divisor at the protocol window.

**Why.** This implements a trailing window while reproducing TRD §4.4, which
uses the arrival reading 45 minutes earlier but divides its change by 30.

**Alternatives rejected.** Divide the worked change by 45 (returns 8.27, not
12.4); discard the only baseline because it predates the window (incorrectly
marks the documented two-reading case as single-reading drift).

**Consequences.** A recent pair is normalized to the configured window; a
sparse pair older than the window retains the full observed change exactly as
the worked case requires.

### D-023 · Step 10 paused for undefined uncertainty calculations
**Step:** 10 · **Date:** 2026-08-27 · **Status:** superseded by D-025 and D-026

**Decision.** Do not implement uncertainty until `driftUncertainty` and
`expectedInformationGain` have defined calculations.

**Why.** Both values affect the Assessment contract, but neither the TRD nor
the protocol defines how to derive them from the available inputs.

**Alternatives rejected.** Treat drift uncertainty as zero or invent an
information-gain formula (both silently change confidence behavior).

**Consequences.** Step 10 remains unwritten until the clinical owner supplies
the missing contract.

### D-024 · Null-question behaviour conflicts with binding invariants
**Step:** 10 · **Date:** 2026-08-27 · **Status:** superseded by D-027

**Decision.** Do not implement the all-suppressed null-question path while it
contradicts AGENTS invariant 6 and the Backend Schema check constraint.

**Why.** The corrected TRD permits `resolvingQuestion: null`, while both older
binding contracts require every unresolved assessment to name one.

**Alternatives rejected.** Reuse an answered question (double-counts); ignore
the hard constraints without their owners correcting them.

**Consequences.** AGENTS and Backend Schema must be reconciled with the new
TRD behavior before Step 10 can pass its exit test.

### D-025 · Drift uncertainty scales with change, sparsity and coverage
**Step:** 10 · **Date:** 2026-08-27 · **Status:** accepted

**Decision.** Calculate drift uncertainty from the protocol coefficient,
absolute drift, observation sparsity and window coverage, capped at 8.

**Why.** The corrected TRD and protocol now define the previously missing
calculation and make greater or less-supported change widen the interval.

**Alternatives rejected.** Treat drift as certain (false precision); reuse the
single-reading penalty when a slope exists (ignores support quality).

**Consequences.** One reading contributes zero drift uncertainty; equal drift
from fewer or more compressed readings yields a wider interval.

### D-026 · Question ranking uses deterministic information gain
**Step:** 10 · **Date:** 2026-08-27 · **Status:** accepted

**Decision.** Rank eligible questions by the protocol EIG formula, then exact
candidate-band match, then protocol-file order, with a 0.25 floor.

**Why.** The corrected contract defines both usefulness and stable tie-breaking
without probabilities or object-key order.

**Alternatives rejected.** Rank by raw shift (can leave both answers on one
side); use iteration order of input objects (not a stable protocol order).

**Consequences.** Questions below the floor produce `UNRESOLVABLE` with the
specified reason rather than consuming nurse attention.

### D-027 · UNRESOLVABLE preserves the UNRESOLVED question invariant
**Step:** 10 · **Date:** 2026-08-27 · **Status:** accepted

**Decision.** Use `UNRESOLVABLE` when no question can help; never emit
`UNRESOLVED` without exactly one resolving question.

**Why.** The two states carry equal uncertainty but require different human
actions. A nullable question would hide that distinction and weaken invariant 6.

**Alternatives rejected.** Null question on `UNRESOLVED` (violates the
invariant); reuse an answered or ineffective question (misdirects the nurse).

**Consequences.** `UNRESOLVABLE` records one of three protocol reasons and
instructs escalation; the engine assertion and database constraint agree.

### D-028 · Step 10 paused for a stale null-question protocol note
**Step:** 10 · **Date:** 2026-08-27 · **Status:** resolved by D-030

**Decision.** Do not implement while `resolvingQuestionRules.note` still
instructs `UNRESOLVED` with a null question.

**Why.** That text directly contradicts invariant 6, TRD §4.6 and the corrected
database constraints, despite shipping in the authoritative protocol.

**Alternatives rejected.** Silently ignore protocol text (conceals an incomplete
clinical-owner correction); implement it (reintroduces the safety defect).

**Consequences.** The clinical owner must correct the stale protocol note.

### D-029 · Worked assessment EIG does not match the new formula
**Step:** 10 · **Date:** 2026-08-27 · **Status:** resolved by D-030

**Decision.** Do not choose between the displayed EIG and the new formula
without a documentation correction.

**Why.** TRD §4.7 reports 0.71 for PT-0007, while §4.6's formula and the same
example inputs produce approximately 0.775.

**Alternatives rejected.** Add undocumented rounding or weighting (changes the
formula); preserve 0.71 as a golden value (fails the specified calculation).

**Consequences.** Step 10 remains unwritten until the example or formula is
corrected explicitly.

### D-030 · All three stale Step 10 literals are corrected
**Step:** 10 · **Date:** 2026-08-27 · **Status:** accepted

**Decision.** Use the corrected PT-0007/RQ-ABDO-02 example and the protocol's
`UNRESOLVABLE` instruction throughout Step 10.

**Why.** The clinical owner reconciled the stale protocol note, the §4.7 EIG,
and the obsolete §4.6 question/value pair against the binding formulas.

**Alternatives rejected.** Preserve any stale illustration (contradicts the
formula or invariant); special-case the examples in code (not clinical logic).

**Consequences.** Both TRD examples now compute to EIG 0.7747 and display 0.77,
and no null-question guidance remains active.

### D-031 · Worked examples are executable contract fixtures
**Step:** 10 · **Date:** 2026-08-27 · **Status:** accepted

**Decision.** Assert formula outputs directly against `workedExamples`; never
rewrite a failing fixture merely to match implementation output.

**Why.** Executable examples make formula/literal drift a visible test failure
instead of a manual prose audit.

**Alternatives rejected.** Duplicate expected values in test code (creates a
second stale copy); auto-update fixtures from results (erases disagreement).

**Consequences.** Any fixture mismatch stops the step for contract review.

### D-032 · Uncertainty consumes candidate bands without selecting them
**Step:** 10 · **Date:** 2026-08-27 · **Status:** accepted

**Decision.** Pass `candidateBands` into uncertainty; keep index-to-band and
candidate selection in `bands.js` at Step 11.

**Why.** Step 10 needs the relevant boundary to classify confidence and rank
questions, while TRD §3 assigns index-to-band mapping to `bands.js`.

**Alternatives rejected.** Reimplement band selection in uncertainty (two
sources of boundary logic); build `bands.js` before its ordered step.

**Consequences.** Step 10 tests provide candidate bands explicitly; Step 11
wires the authoritative banding result into the uncertainty module.

### D-033 · Step 11 paused for the cohort ordering conflict
**Step:** 11 · **Date:** 2026-08-27 · **Status:** resolved by D-034

**Decision.** Do not begin Step 11 until its required 20-case t=0 cohort input
is supplied or the plan explicitly moves cohort authoring before the gate.

**Why.** Step 11 requires a golden snapshot and four named cohort checks, while
`cohort.json` is empty and Step 12 is assigned to author it. TRD §5 supplies
summaries, not complete clinical records from which exact scores can be derived.

**Alternatives rejected.** Invent vitals and histories (authors clinical test
content); execute Step 12 early (violates the mandated order).

**Consequences.** Banding and full engine assembly remain unwritten until the
clinical owner resolves the Step 11/12 dependency.

### D-034 · Cohort ships before its loader
**Step:** 11 · **Date:** 2026-08-27 · **Status:** accepted

**Decision.** Treat the clinical-owner-supplied 20-encounter cohort and its
`expect` blocks as Step 11 inputs; Step 12 builds only the interpolating loader.

**Why.** This removes the circular dependency without renumbering the plan and
keeps clinical fixture authoring outside the implementation role.

**Alternatives rejected.** Invent the cohort in Step 11 (authors clinical
content); move Step 12 ahead of the gate (breaks the prescribed order).

**Consequences.** Step 11 may use a minimal test reader. Expectations define
clinical correctness; generated golden files only detect later drift.

### D-035 · Presentation band floors close the continuous-score gap
**Step:** 11 · **Date:** 2026-08-27 · **Status:** accepted

**Decision.** Apply protocol-defined presentation floors of P2 at a Layer-2
score of at least 15 and P3 at a score of at least 10.

**Why.** The weighted model cannot make a normal-physiology presentation P2:
L1=1, L2=20 and L3=20 produce PI 56.5, still P3. That made the PRD's silent-MI,
afebrile-sepsis and compensated-paediatric-shock cases unreachable.

**Alternatives rejected.** Retune layer weights or thresholds (changes all
patients); preserve continuous-only banding (leaves the safety defect open).

**Consequences.** A floor raises but never lowers the model decision and is
applied with hard-rule floors in TRD §12.4 order.

### D-036 · bandSetBy records the deciding mechanism
**Step:** 11 · **Date:** 2026-08-27 · **Status:** accepted

**Decision.** Populate every assessment's `bandSetBy` with `model`,
`hard_rule`, `presentation_floor`, or `nurse_override` according to the
mechanism that determined the recorded band.

**Why.** A rule, a presentation floor, a continuous score and a human override
make clinically distinct claims that must remain distinguishable in review.

**Alternatives rejected.** Infer the mechanism from derivation later (ambiguous
when several mechanisms apply); omit it (loses audit meaning).

**Consequences.** Hard rule wins attribution when it and a presentation floor
both apply; a floor that overrules every candidate resolves abstention.

### D-037 · Collateral change from baseline is structured evidence
**Step:** 11 · **Date:** 2026-08-27 · **Status:** accepted

**Decision.** Use the supplied `reported_change_from_baseline` qualifier and
PM-WK-02 modifier worth five Layer-2 points.

**Why.** Collateral history is the signal that makes the documented geriatric
atypical presentation reach P2 without changing model weights.

**Alternatives rejected.** Parse free text (explicitly prohibited); tune the
case through physiology or weights (misrepresents the clinical evidence).

**Consequences.** All seven capture qualifiers now feed presentation scoring,
and PT-0004 exercises the new modifier.

### D-038 · Missing current band uses the highest hazard-bearing rate
**Step:** 11 · **Date:** 2026-08-27 · **Status:** accepted at Step 33

**Decision.** Use `encounter.current_band` for Layer 3 when supplied; on an
initial assessment with no current band, use P2, the highest band with a
configured hazard rate.

**Why.** TRD §4.4 requires `hazardRate[currentBand]`, but neither the documented
`score(encounter, protocol, now)` signature nor the cohort supplies an initial
band. P2 is the conservative safe default; P1 has no waiting rate because it is
already the highest possible acuity.

**Alternatives rejected.** Default P5 (minimises visibility); infer a rate from
the model being computed (introduces a circular dependency).

**Consequences.** First assessments may overstate waiting hazard, never
understate it. Step 33 must confirm the intended first-assessment convention.

### D-039 · Insufficient evidence remains an abstention under a floor
**Step:** 11 · **Date:** 2026-08-27 · **Status:** accepted at Step 33

**Decision.** When confidence is `INSUFFICIENT`, a hard or presentation floor
raises `provisionalBand` and queue position but does not convert confidence to
`ESTABLISHED` or populate `band`.

**Why.** A floor resolves uncertainty between model bands, but cannot supply
missing observations. Keeping the abstention is the conservative branch and
matches the authoritative PT-0019 expectation.

**Alternatives rejected.** Apply TRD §12.4 step 7 literally to every abstention
(asserts confidence despite missing evidence); ignore the floor (queues the
patient below the documented safety minimum).

**Consequences.** PT-0019 remains explicitly `INSUFFICIENT` while being queued
at P2. Step 33 must reconcile the blanket wording in §12.4 with this case.

### D-040 · Interval construction precedes candidate-band classification
**Step:** 11 · **Date:** 2026-08-27 · **Status:** accepted

**Decision.** Separate interval construction from confidence classification
inside `uncertainty.js`; `bands.js` maps that interval to candidate bands, then
classification selects confidence and any resolving question.

**Why.** Candidate bands depend on the interval, while Step 10 originally took
candidate bands as input. The split removes that wiring cycle without changing
any uncertainty formula.

**Alternatives rejected.** Compute the interval twice (duplicated work); copy
the interval formula into `bands.js` (two sources of truth).

**Consequences.** `assessUncertainty` remains the composed public operation for
unit tests, while `index.js` can use the two phases exactly once.

### D-041 · Playwright is exactly pinned in the test toolchain
**Step:** 11 · **Date:** 2026-08-27 · **Status:** accepted

**Decision.** Pin the documented dev-only `@playwright/test` dependency to
version 1.62.1 and commit the generated lockfile.

**Why.** The TRD selects Playwright and requires a reproducible test toolchain
but does not name a version; 1.62.1 was the current registry release when the
Step 11 manifest was created.

**Alternatives rejected.** A range or `latest` (non-reproducible); a root-level
manifest (would make tooling mistake the deployable app for a Node project).

**Consequences.** Node tooling remains confined to `tests/` and is never part
of the deployed surface.

### D-042 · Cohort expectations block golden acceptance
**Step:** 11 · **Date:** 2026-08-27 · **Status:** resolved by D-043–D-046

**Decision.** Do not create or accept the t=0/30/60 golden snapshots while 11
authoritative cohort expectation checks disagree with the supplied protocol
and formulas.

**Why.** The failures include incompatible presentation floors (PT-0002,
PT-0005, PT-0008), protocol/case arithmetic (PT-0006, PT-0010, PT-0015), and
confidence outcomes (PT-0002, PT-0009, PT-0012, PT-0018). A golden baseline
cannot be reviewed successfully while those claims conflict.

**Alternatives rejected.** Edit `expect` blocks (forbidden); special-case the
engine to reproduce them (violates protocol ownership); accept unreviewed
goldens (turns known disagreement into the regression baseline).

**Consequences.** Independent Step 11 unit, contract, floor and property gates
can pass, but Phase 1 remains blocked at the cohort gate until the clinical
owner reconciles the source artefacts.

### D-043 · Engine exposed five protocol defects
**Step:** 11 · **Date:** 2026-08-27 · **Status:** accepted

**Decision.** Use the clinical-owner corrections for obstetric SBP bands,
thunderclap headache, anticoagulated head strike, geriatric fever age and
pregnancy-associated headache.

**Why.** Running the cohort showed that the former protocol made five intended
safety paths unreachable or less sensitive than their cited standards.

**Alternatives rejected.** Change cohort expectations alone (preserves real
protocol defects); special-case the encounters in code (bypasses governance).

**Consequences.** The five corrections remain versioned clinical data, and the
generic engine consumes them without new hard-coded thresholds.

### D-044 · Abstention is reserved for safety-relevant boundaries
**Step:** 11 · **Date:** 2026-08-27 · **Status:** accepted

**Decision.** Abstain only across protocol-listed P1/P2 and P2/P3 boundaries.
Across P3/P4 or P4/P5, tie-break upward, report `PROBABLE`, and ask no question.

**Why.** Lower-boundary ambiguity does not change the safety action; repeatedly
abstaining there spends nurse attention and turns a safety signal into noise.

**Alternatives rejected.** Abstain at every crossed boundary (low-value alert
load); hide uncertainty by reporting `ESTABLISHED` (overstates evidence).

**Consequences.** The interval remains visible, while resolving questions are
reserved for ambiguity that can change urgent care.

### D-045 · Six cohort expectations were corrected by the owner
**Step:** 11 · **Date:** 2026-08-27 · **Status:** accepted

**Decision.** Use the revised trajectories, complaint classifications and
expectations for PT-0002, PT-0009, PT-0010 and PT-0015.

**Why.** Those hand-authored expectations predated presentation floors or did
not match the supplied input values when evaluated by the complete engine.

**Alternatives rejected.** Preserve stale expectations (contradicts executable
clinical intent); tune engine formulas to hand guesses (breaks other cases).

**Consequences.** The gradual-drift, arrival-uncertainty, physiology-crossing
and infant-ceiling cases now test the behavior they claim to demonstrate.

### D-046 · Cohort expectations can name an acceptable set
**Step:** 11 · **Date:** 2026-08-27 · **Status:** accepted

**Decision.** Interpret `bandIn` and `confidenceIn` as membership assertions,
alongside exact `band` and `confidence` assertions.

**Why.** Some cases prove a safety property rather than one exact low-acuity
classification; forcing an exact value made those fixtures brittle.

**Alternatives rejected.** Remove the checks entirely (loses intent); preserve
over-specific exact assertions (fails on clinically equivalent outcomes).

**Consequences.** PT-0012 and PT-0018 can accept P4/P5 while still asserting
that the engine does not abstain at a non-safety boundary.

### D-047 · Two revised drift cases remain inside the abstention zone
**Step:** 11 · **Date:** 2026-08-27 · **Status:** resolved by D-048 and D-049

**Decision.** Preserve P2/P3 abstention for PT-0002 at minute 45 and PT-0010 at
minute 60; do not accept golden snapshots while their exact P2 expectations
still fail.

**Why.** Their computed interval splits are 60.9:39.1 and 59.1:40.9,
respectively, below the protocol's 65:35 threshold at a safety-relevant
boundary. Strengthening the keyframes did not move either case far enough.

**Alternatives rejected.** Weaken the split threshold or suppress abstention
(changes every safety-boundary case); edit owner-authored cohort data (forbidden).

**Consequences.** All independent Step 11 gates can pass, but the clinical
owner must strengthen or relax these two expectations before golden acceptance.

### D-048 · Trajectory consistency reduces drift uncertainty
**Step:** 11 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Multiply drift uncertainty by the protocol-defined consistency
factor derived from the contribution-weighted monotonic fraction of each
drifting parameter.

**Why.** Magnitude-only uncertainty made the interval widest for the cohort's
most consistently deteriorating patients. Repeated movement in the same
direction is evidence of an established trajectory, not additional ambiguity.

**Alternatives rejected.** Strengthen only the two cohort trajectories (treats
the symptom); reduce the global uncertainty coefficient (weakens protection
against sparse or inconsistent readings).

**Consequences.** Two points retain no consistency credit, while three or more
readings narrow the interval in proportion to their directional agreement.
The protocol's two consistency fixtures guard both extremes.

### D-049 · Deteriorating trajectories include falling SBP
**Step:** 11 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Use the clinical-owner revision that completes PT-0002 and
PT-0010 with a final systolic blood pressure of 100 mmHg.

**Why.** Falling pressure makes both trajectories clinically coherent with
their worsening respiratory rate and oxygen saturation; it is not a numerical
adjustment made solely to cross a test threshold.

**Alternatives rejected.** Preserve the former 104/122 readings (incomplete
deterioration story); hard-code encounter-specific scoring (breaks protocol
governance and generality).

**Consequences.** Both cases exercise a multi-parameter deterioration path,
and their expectations remain owner-authored clinical intent.

### D-050 · Clock advances by observed wall time
**Step:** 13 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Advance simulated time by elapsed wall time multiplied by the
selected speed, rather than adding a fixed amount per timer callback.

**Why.** Browser timers can be delayed. Elapsed-time accounting preserves the
documented 1×/10×/60× relationship without accumulating timer drift.

**Alternatives rejected.** Add a fixed simulated second on every callback
(loses time when the browser delays a tick).

**Consequences.** `Date.now()` is confined to `clock.js`; tests supply wall
timestamps directly and do not wait for real time.

### D-051 · Board simulation coordination stays out of main
**Step:** 14 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Add `sim/board.js` to coordinate clock ticks, cohort projection,
scoring and queue ordering; keep `main.js` limited to wiring data and output.

**Why.** The required tree is not an exclusion list, and no listed module owns
multi-patient simulation state. Putting the map and safety-aware sort in
`main.js` would violate its documented wiring-only responsibility.

**Alternatives rejected.** Put board logic in `main.js` (mixes orchestration
with domain logic); put it in `engine/index.js` (couples the pure single-patient
engine to the synthetic cohort).

**Consequences.** The headless loop is directly testable and the later queue UI
can consume ordered rows without owning scoring logic.

### D-052 · Missing and unobtainable vitals stay visually distinct
**Step:** 15 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Render a missing, unrecorded vital as `—` and an attempted but
unobtainable vital as the specified `——`.

**Why.** The schema makes those states semantically distinct, while the queue
brief specifies only the unobtainable mark. Rendering both alike would erase
information; leaving missing cells empty would resemble a rendering failure.

**Alternatives rejected.** Use `——` for both (conflates states); leave null
empty (ambiguous failure state); add a long text token inside a fixed vital
column (breaks scan alignment).

**Consequences.** The inspector can later explain the distinction in words,
while the queue preserves it within the fixed-width cells.

### D-053 · Queue rows honor the touch-target minimum
**Step:** 15 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Use a 44 px normal row height.

**Why.** UIUX §5.4 names a 42 px row and, in the same paragraph, requires the
whole-row touch target to be at least 44 px. The larger value is the safe,
testable accessibility constraint.

**Alternatives rejected.** Use 42 px (fails the explicit minimum); add an
invisible overlapping target (creates ambiguous row hit areas).

**Consequences.** Twenty rows require vertical scrolling at 800 px, which the
queue rail already permits by contract.

### D-054 · A missing complaint is stated, not stringified
**Step:** 15 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Display `Complaint not obtained` when `complaint_text` is null.

**Why.** The zero-history path is valid and scoreable, but assigning null to a
DOM text property renders the implementation word `null`. A factual phrase is
visible, terse and does not imply low risk.

**Alternatives rejected.** Render `null` (implementation leakage); leave the
cell empty (resembles a rendering failure); infer text from `complaint_class`
(would present a coded fallback as the patient's complaint).

**Consequences.** PT-0013 remains explicitly zero-history without weakening
its P1 hard-rule state.

### D-055 · Queue confidence uses fixed-column tokens
**Step:** 15 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Use the queue-specific tokens `ESTAB`, `PROB`, `UNRES`,
`UNRESOLV`, and `INSUFF`, while retaining the full state as the cell's
accessible label and title.

**Why.** App Flow §4.1 demonstrates `UNRES` in the row, while UIUX §6.2 spells
out full labels that overflow the binding 96 px confidence column at the
binding micro type size and tracking. The short token preserves both carriers
without clipping.

**Alternatives rejected.** Widen the column (breaks the fixed table contract);
shrink or condense the type beyond its token (breaks typography); clip the
state (removes meaning).

**Consequences.** The inspector can use full confidence prose; the scannable
queue retains a stable fixed column.

### D-056 · Sparklines never invent readings
**Step:** 19 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Draw a sparkline only when six or more obtained readings exist,
and cap it to the latest eight; keep the numeric trend line without a chart for
shorter series.

**Why.** UIUX §6.5 requires six to eight points, while the synthetic cohort has
at most four authored observations. Interpolating or repeating values would
present fabricated samples as measurements.

**Alternatives rejected.** Invent intermediate points (false evidence); repeat
endpoints (visually overstates stability); violate the six-point minimum.

**Consequences.** The chart appears as real observations accumulate; the
prototype's shorter series remain fully readable as sourced text trends.

### D-057 · Capture sheets have a dedicated render module
**Step:** 20 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Add `render/sheets.js` for arrival and reassessment capture.

**Why.** The required tree is not an exclusion list, and none of the listed
render modules owns form construction, keypad state, or capture projection.
Putting that logic in `main.js` would violate its wiring-only responsibility.

**Alternatives rejected.** Build forms in `main.js` (mixed responsibility);
put them in `render/modes.js` (that module owns surge/degraded banners).

**Consequences.** Both sheets share one keypad and field projection path while
remaining outside the scoring engine.

### D-058 · Override destination uses the target row's band
**Step:** 21 · **Date:** 2026-08-28 · **Status:** accepted at Step 33

**Decision.** Assign the nurse band displayed by the destination row. When the
destination is a rule-pinned P1, assign P1 but place the moved row immediately
after every pinned row so no pin can be displaced.

**Why.** The flow defines repositioning but does not separately define how a
drop position becomes `nurseBand`. The destination row is the only visible
band reference in the one-gesture interaction. At a pinned boundary, retaining
P1 is the conservative branch while preserving the hard-rule ordering
invariant.

**Alternatives rejected.** Preserve the source band (the move would not express
a clinical band decision); infer from the next non-pinned row (could downgrade
a patient dropped on P1); allow the moved row above a pin (breaks invariant 1).

**Consequences.** Same-band moves are recorded as lateral overrides. Step 33
must confirm the destination-band convention during the provisional review.

### D-059 · Queue order honors band before index
**Step:** 21 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Sort rule-pinned rows first, then the effective or provisional
band from P1 through P5, then Priority Index within a band.

**Why.** The drag exit test exposed presentation-floor P2 rows below P3 rows
because the headless loop sorted only by the continuous index. Floors and
provisional bands are explicitly assigned to determine clinical queue
position, so index-only ordering discarded their safety effect.

**Alternatives rejected.** Continue sorting only by index (makes presentation
floors cosmetic); overwrite the index when a floor applies (corrupts the
engine's continuous derivation).

**Consequences.** The continuous index still orders peers, while every higher
acuity band precedes every lower one and every hard-rule pin remains above all
other rows.

### D-060 · Audit chain uses a zero-hash genesis
**Step:** 22 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Give the first audit record a 64-character zero `prevHash` and
canonicalise payload objects by recursively sorting keys before applying the
documented SHA-256 concatenation formula.

**Why.** The schema defines every successor hash and canonical JSON but does
not name the genesis value or key-order procedure. A fixed full-length sentinel
keeps the first record structurally identical to later records, and recursive
sorting makes hashes independent of object insertion order.

**Alternatives rejected.** Null or empty genesis (different record shape at
sequence one); native `JSON.stringify` alone (hash depends on construction
order).

**Consequences.** The chain is reproducible offline and verification rejects a
gap, changed payload, changed predecessor or changed hash.

### D-061 · SCORE events track the effective queue band
**Step:** 22 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** For change detection, use `band` when assigned and otherwise
`provisionalBand`, together with confidence.

**Why.** An abstaining assessment has a null `band`, but its provisional band
is the clinical queue position. Ignoring a provisional-band change would omit
a real priority movement from the audit history.

**Alternatives rejected.** Compare nullable `band` only (misses abstention
movement); include the continuously changing index (recreates the prohibited
every-tick event volume).

**Consequences.** SCORE records remain change-only while capturing every
band-level queue decision, including abstentions.

### D-062 · The audit drawer has a dedicated renderer
**Step:** 23 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Add `render/audit-drawer.js` for S5 while keeping hashing,
persistence and export construction in `audit.js`.

**Why.** The required tree is not an exclusion list, and mixing the drawer's
DOM construction into the append-only log would give one module two unrelated
responsibilities.

**Alternatives rejected.** Render S5 inside `audit.js` (couples persistence to
the DOM); place it in `main.js` (violates wiring-only responsibility).

**Consequences.** The drawer can refresh from the log without changing audit
semantics, and audit tests remain runnable without a DOM.

### D-063 · Exports preserve the complete chain
**Step:** 23 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** JSON exports wrap the unchanged records with `exportedAt` and
`chainVerified`; CSV exports one row per record with every envelope field,
canonical payload JSON, `prevHash` and `hash`.

**Why.** The documents require both formats to be readable and reconstructible
without defining their outer representation. Keeping every original field and
hash lets an independent tool rebuild and verify the chain.

**Alternatives rejected.** Export only the visible table columns (not
reconstructible); flatten selected payload fields (drops future event detail).

**Consequences.** Export itself is logged before the file is built, so the
download contains the event that produced it and verifies as a complete chain.

### D-064 · Surge injection reuses governed cohort cases
**Step:** 24 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Inject arrivals at the exact protocol cadence by cycling through
the supplied cohort templates and shifting each template's trajectory to its
new arrival time. Compute the surge rate from runtime-injected arrivals only.

**Why.** No additional clinical arrival profiles are supplied, so reusing the
owner-authored cases avoids inventing clinical content. The initial cohort is
a preloaded waiting room and must not trigger surge before the demo control is
used.

**Alternatives rejected.** Invent new patient profiles (authors clinical
content); count pre-board historical arrivals (starts the documented normal
demo in surge); inject empty records (changes the clinical mix artificially).

**Consequences.** Injection is exactly 18 per hour by cadence. The measured
trailing-window rate and multiplier, including discrete-window effects, are
shown and audited rather than replaced with nominal values.

### D-065 · The surge control arrives with the mode
**Step:** 24 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Add the documented `SURGE ×3` prototype control at Step 24;
Step 28 will complete the rest of S9.

**Why.** Step 24's exit test requires starting the injection path, and the App
Flow already fixes this exact control and label. Pulling it forward exposes the
real mode transition without inventing a temporary trigger.

**Alternatives rejected.** Add a test-only production hook (dead interface);
wait until Step 28 (leaves Step 24's interactive mode unreachable).

**Consequences.** The control disables after activation; reset and the other
prototype controls remain Step 28 work.

### D-066 · Degraded mode preserves earlier measurements
**Step:** 25 · **Date:** 2026-08-28 · **Status:** accepted at Step 33

**Decision.** Mark every instrument field unobtainable on the current
observation while retaining measurements that were successfully recorded
before monitor loss.

**Why.** Degraded mode describes present instrument unavailability. Erasing
earlier readings would rewrite the encounter history and destroy valid drift
evidence; leaving the latest fields obtainable would falsely claim a current
measurement. The current observation therefore becomes visual-only while the
prior series remains auditable.

**Alternatives rejected.** Mark the full historical series unobtainable
(rewrites valid evidence); keep the latest numeric values active (does not
enter the documented visual-only path).

**Consequences.** Current vitals render `——`, evidence completeness falls and
intervals widen, while pre-outage observations remain in the derivation. Step
33 must confirm this temporal interpretation.

### D-067 · The monitor-loss control arrives with the mode
**Step:** 25 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Add the documented `LOSE MONITORS` prototype control at Step 25;
Step 28 will add the remaining S9 controls.

**Why.** The degraded-mode exit test requires an immediate instrument-loss
trigger, and the App Flow already fixes this control and label.

**Alternatives rejected.** Production-only test hook (dead interface); defer
the trigger to Step 28 (leaves the Step 25 mode unreachable in the app).

**Consequences.** The control disables after use; reset and instrument restore
arrive with the completed console.

### D-068 · Fairness tolerance flags any observed divergence
**Step:** 26 · **Date:** 2026-08-28 · **Status:** accepted at Step 33

**Decision.** Add `fairness.upgradeRateMultipleTolerance: 1.0` to the protocol,
so any subgroup upgrade rate above the board rate is flagged.

**Why.** The monitor requires a configured tolerance but none was supplied.
The safe default is zero tolerated divergence: it fires more often and makes
possible inequity more visible without affecting any patient's band.

**Alternatives rejected.** Invent a wider tolerance (can hide drift); hard-code
the value (configuration constants belong in the protocol).

**Consequences.** Small prototype subgroups may flag readily. Step 33 must
confirm the operational tolerance before release.

### D-069 · Fairness computation and rendering stay separate
**Step:** 26 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Keep subgroup calculation in `fairness.js` and add
`render/fairness.js` for S6 DOM construction.

**Why.** The required file owns production fairness logic; rendering is a
separate responsibility and the required tree is not an exclusion list.

**Alternatives rejected.** Put DOM work in `fairness.js` (mixes calculation
with presentation); put calculation in the renderer (not reusable by Stage 2).

**Consequences.** Fairness calculations remain independently unit-testable.

### D-070 · Reassessment visibility rises on each missed interval
**Step:** 27 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Increase the overdue glyph count and row rule at each additional
missed band-specific reassessment interval, capped at three levels.

**Why.** The documents require escalating visibility but leave its cadence
open. Reusing the protocol interval makes escalation proportional to the
patient's assigned acuity without adding a clinical constant.

**Alternatives rejected.** One permanent overdue state (does not escalate);
fixed clock thresholds (ignore the band-specific protocol interval).

**Consequences.** Full and surge-collapsed rows retain an increasingly visible
`REASSESS` instruction and are never removed for being overdue.

### D-071 · Reset reloads clinical state without erasing audit history
**Step:** 28 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Implement `RESET` as a page reload, which re-fetches the supplied
cohort and recreates the simulation at t=0 while retaining IndexedDB audit data.

**Why.** The control is specified to reload the cohort, but audit deletion is
not specified and would make recorded actions unauditable.

**Alternatives rejected.** Clear IndexedDB on reset (destructive and breaks the
append-only claim); mutate the live cohort back in place (risks residual mode
and injected-arrival state).

**Consequences.** Demo state resets completely while prior audit events remain
chain-verifiable until the documented retention boundary.

### D-072 · Four local Plex files replace the online font request
**Step:** 29 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Serve official IBM upstream WOFF2 files locally: variable Roman
files for Sans, Mono and Serif, plus the static semibold Sans Condensed used by
all micro-labels.

**Why.** Step 29 requires exactly four cached font files, but Google Fonts does
not expose variable files for Mono, Serif or Sans Condensed. IBM's upstream
repository supplies three variable families; the condensed face is used only
at its specified 600 weight.

**Alternatives rejected.** Keep the network import (offline typography fails);
cache every static weight (violates the four-file contract); synthesize the
condensed semibold from regular (changes the binding design).

**Consequences.** The app makes no font request at runtime. D-003's claim that
all four families would be variable is superseded for Sans Condensed only.

### D-073 · The install icon is a minimal token-only mark
**Step:** 30 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Use a hand-authored maskable SVG with a `PT` path on the warm
paper ground, using only `--ink` and `--ground` values.

**Why.** The manifest requires a maskable icon but no logo is supplied. A
two-colour typographic mark stays inside the existing design language and the
maskable safe zone without inventing illustration or new brand colours.

**Alternatives rejected.** Add a generated illustration (new visual language);
use a library icon (banned); omit the icon (not installable).

**Consequences.** One resolution-independent asset serves normal and maskable
purposes; it remains legible under Android launcher cropping.

### D-074 · GitHub remote is not invented
**Step:** 31 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Initialise and commit the complete local repository, but do not
add or push a remote until the owner supplies its exact GitHub URL.

**Why.** The implementation plan contains an explicit `<org>` placeholder and
the workspace has no existing remote. Guessing an organisation would publish
to the wrong destination or fail unpredictably.

**Alternatives rejected.** Create a guessed remote (unauthorised destination);
leave the project uncommitted (prevents the clean-clone exit test).

**Consequences.** The repository is cloneable and deployment-ready locally;
one owner-supplied remote URL remains necessary for GitHub publication.

### D-075 · Service-worker install bypasses the immutable HTTP cache
**Step:** 32 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Precache each asset with request cache mode `reload` during
service-worker installation.

**Why.** TRD §10 gives assets one-year immutable HTTP caching while their paths
are not content-hashed. A new cache name alone could otherwise copy a stale
HTTP response into the new service-worker cache.

**Alternatives rejected.** Change the binding Vercel headers (departure from
TRD §10); add build-time content hashes (build step is banned).

**Consequences.** Install fetches the current deployment once; runtime remains
cache-first and fully offline.

### D-076 · Production deployment awaits an owner-supplied remote
**Step:** 32 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Validate and ship the exact Vercel configuration, but do not
claim a production or preview deployment without a GitHub remote and Vercel
project owned by the user.

**Why.** Neither external destination exists in the workspace, and creating
one would require account-specific authority not supplied by the build brief.

**Alternatives rejected.** Invent a remote/project (unauthorised external
state); report an unverified deployment URL (false exit result).

**Consequences.** Static deployment configuration is complete and tested. The
external push/import remains a handoff item rather than a code blocker.

### D-077 · Step 33 accepts all five provisional decisions
**Step:** 33 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Accept D-038, D-039, D-058, D-066 and D-068 without revision.

**Why.** P2 is the highest non-immediate hazard fallback; INSUFFICIENT must not
be erased by a floor; the target row is the visible one-gesture override
reference; prior valid observations must survive monitor loss; and a zero-
divergence fairness tolerance is the most visible prototype default. Each is
the conservative branch and all five preserve the clinical invariants.

**Alternatives rejected.** Lower-risk defaults, inferred confidence, hidden
historical deletion, or a wider ungoverned fairness tolerance.

**Consequences.** The provisional table is empty. Production governance must
still set its own fairness tolerance before deployment beyond the prototype.

### D-078 · Accessibility wins the colophon token conflict
**Step:** 33 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Render the colophon in `--ink-2` on `--ground-sunk`.

**Why.** UIUX §10 specified `--ink-3`, but that pair measures 4.16:1 and fails
the same document's binding 4.5:1 accessibility requirement. `--ink-2` retains
the tertiary hierarchy while clearing the axe contrast audit.

**Alternatives rejected.** Preserve a known contrast failure; change a global
colour token and alter every other surface.

**Consequences.** The footer is slightly darker in light mode and axe reports
zero violations on every primary surface.

### D-079 · Playwright consumes an explicit test server
**Step:** 33 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Keep the Playwright configuration pointed at port 4190 and run
the documented static server separately during the test.

**Why.** Playwright's managed Python web server remains attached on Windows
after the tests complete. An explicit server produces the same HTTP boundary
without leaving an orphaned test process.

**Alternatives rejected.** Keep a test command that never exits; add a new
server package solely for test orchestration.

**Consequences.** Accessibility tests exit cleanly and the test server is
started and stopped explicitly by the runner or reviewer.

### D-080 · Local fonts are subset to the deployed glyph surface
**Step:** 34 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Retain the four local IBM Plex files, restrict variable axes to
the used 400–600 weight range, and retain Basic Latin plus every non-ASCII
glyph present on the deployed surface.

**Why.** The full upstream files contributed 530.92 KiB before HTTP overhead.
Static subsetting is a committed asset transformation, not a runtime build,
and preserves the specified family, weight range and offline behavior.

**Alternatives rejected.** Remote fonts (offline failure); system fonts
(breaks the binding typography); a runtime subsetting step (build forbidden).

**Consequences.** Font payload falls from 530.92 KiB to 52.92 KiB. Unlisted
characters in user-entered complaint text use the documented system fallback.
The service-worker cache advances to v4.

### D-081 · The JavaScript budget conflicts with the source architecture
**Step:** 34 · **Date:** 2026-08-28 · **Status:** accepted on continuation

**Decision.** Preserve readable native modules and set the uncompressed
JavaScript ceiling to 135 kB, the next 5 kB increment above the measured
complete source.

**Why.** Required application JavaScript measures 130.10 KiB uncompressed and
remains about 104 KiB with all whitespace removed. Reaching 60 KiB therefore
requires removing specified behavior, an unsafe rewrite, or generated output;
the latter conflicts with the no-build, readable-source architecture.

**Alternatives rejected.** Delete required functions; rename domain concepts
into opaque identifiers; silently reinterpret “uncompressed” as gzip.

**Consequences.** The source budget becomes reachable without a build step;
the stricter 120 kB cold-transfer ceiling remains unchanged and governing.

### D-082 · Cold load is measured at four-times CPU throttling
**Step:** 34 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Measure the tablet cold-load budget in Chrome with a four-times
CPU slowdown and a fresh browser context.

**Why.** The TRD names a mid-range tablet but no device or throttle profile.
Four-times CPU throttling is reproducible and more demanding than the local
desktop, without inventing a network profile for locally served static files.

**Alternatives rejected.** Report an unthrottled desktop time; invent latency
and bandwidth values not supplied by the contract.

**Consequences.** The 20-row board becomes interactive at 546.3 ms; two live
ticks produce no task over 50 ms.

### D-083 · The inspector draws at the 1024 px boundary
**Step:** 35 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Switch the inspector to its bottom-drawer layout at 1024 px and
below, not only below 1024 px.

**Why.** The specified fixed columns total 652 px before the complaint column,
while the 62/38 layout gives the queue only 634 px at a 1024 px viewport. The
literal boundary compresses or overlaps clinical columns; drawing one pixel
earlier preserves the queue, which UIUX §5.3 calls the product.

**Alternatives rejected.** Compress fixed clinical columns; hide confidence;
allow overlapping headers and values.

**Consequences.** The 1024×768 reference keeps every queue column aligned and
shows the inspector as an opaque bottom drawer over the scrollable queue.

### D-084 · Three-person design review awaits the deployed URL
**Step:** 35 · **Date:** 2026-08-28 · **Status:** pending external review

**Decision.** Complete the mechanical and visual design audit locally, but do
not represent automated reviewers as the three people required by Step 35.

**Why.** The repository has no owner-supplied remote or deployed URL, and the
exit test explicitly asks for human reactions to that URL.

**Alternatives rejected.** Count model agents as people; invent a deployment
URL; claim feedback that did not occur.

**Consequences.** All executable design checks pass. The owner must show the
deployed board to three people and record their unprompted answers.

### D-085 · Resolving answers apply protocol-owned shifts
**Step:** 36 · **Date:** 2026-08-28 · **Status:** accepted at Step 36

**Decision.** Store each structured resolving answer with the encounter and
apply the selected question's protocol-owned yes/no shift before uncertainty
is reclassified. `Cannot assess` applies zero shift, suppresses the exhausted
question, and therefore preserves abstention or escalates to `UNRESOLVABLE`.

**Why.** App Flow requires an immediate re-score and audit information event,
while the protocol already supplies both outcome shifts. It does not specify
the persistence shape or the no-information branch. Zero shift makes no
clinical assertion; suppressing the failed question avoids an endless loop
and takes the conservative escalation path when no other question remains.

**Alternatives rejected.** Hard-code a band from the button (bypasses the
engine); treat `Cannot assess` as No (manufactures evidence); keep offering the
same unanswerable question (cannot complete the workflow).

**Consequences.** Yes/No answers are visible in the derivation and immediately
re-score. Every answer is hash-chain audited as `QUESTION_ANSWERED`; a future
protocol revision continues to own the numeric effect.

### D-086 · Font subsets exclude non-interface punctuation
**Step:** 36 · **Date:** 2026-08-28 · **Status:** superseded by D-088

**Decision.** Amend D-080 by retaining ASCII letters, numbers and every
punctuation mark rendered by clinical, audit and free-text views, while
omitting eleven source-code-only punctuation glyphs from the four fonts.

**Why.** The required question-answer workflow raised source size while the
120 kB cold-transfer ceiling remained binding. Those glyphs never render in
the interface; arbitrary user text already has the specified system fallback.

**Alternatives rejected.** Remove kerning; remove required behavior; raise the
governing transfer budget.

**Consequences.** The four font assets total 46.90 KiB, kerning and all
deployed clinical symbols remain, and both transfer and source budgets pass.

### D-087 · The manual surge control enters surge immediately
**Step:** 36 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Pressing the prototype `SURGE ×3` control enters SURGE at once,
records `auto: false`, and then continues injecting at the configured rate.
Automatic transitions produced by measured arrival rates remain `auto: true`.

**Why.** App Flow §13 requires the button itself to demonstrate disaster mode.
Previously it only started injection, so a paused rehearsal remained NORMAL
until another fifteen simulated minutes elapsed.

**Alternatives rejected.** Hide the delay in the rehearsal; resume the clock
for an undocumented wait; weaken the automatic trailing-window detector.

**Consequences.** The explicit demo control is immediate and auditable, while
the production-shaped automatic threshold and sustained-exit logic are intact.

### D-088 · Surge rehearsal preserves the trailing-rate gate
**Step:** 36 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Reverse D-087. `SURGE ×3` starts configured arrival injection;
SURGE still begins only when the measured trailing-15-minute rate reaches the
protocol threshold. The rehearsal keeps the 60× clock running through entry.

**Why.** TRD §5 explicitly makes the measured rate the mode gate. App Flow's
demo sequence is reachable without bypassing it: fifteen simulated minutes
take fifteen wall seconds at 60× and keep the full pitch under five minutes.

**Alternatives rejected.** Manual mode bypass (contradicts TRD §5); falsify the
trigger numbers; hide an undocumented clock jump in the demo.

**Consequences.** Automatic and demo behavior share one transition path, and
the displayed trigger remains an observed rate rather than a control setting.

### D-089 · Late provisional review accepts the answer flow
**Step:** 36 · **Date:** 2026-08-28 · **Status:** accepted

**Decision.** Accept D-085 after a focused late review against TRD §4.6, App
Flow §§4.3 and 5, the protocol question fixtures, and the eight invariants.

**Why.** The question shifts are protocol-owned, Yes/No re-run the ordinary
engine, and `Cannot assess` contributes zero while retaining the more
conservative abstention path. No clinical constant or gate was introduced.

**Alternatives rejected.** Ship a late provisional unreviewed; treat the
answer as a UI-only band assignment; weaken an uncertainty invariant.

**Consequences.** No provisional decisions remain. The three-button wording
in App Flow is corrected to match its explicitly listed controls.

### D-090 · Row meta stays inside the complaint column
**Step:** 35 rework · **Date:** 2026-08-29 · **Status:** accepted

**Decision.** Render complaint and row-state meta as two clipped grid rows
inside the complaint column; no queue descendant may use absolute positioning.

**Why.** The former absolute meta line widened itself across five vital
columns and painted over the complaint. That was a containment bug, not a
spacing problem.

**Alternatives rejected.** Raise the old overlay (preserves the spill); hide
meta states (removes safety information).

**Consequences.** Browser tests compare rendered bounds and fail on overlap or
column escape.

### D-091 · Safety states keep their full names
**Step:** 35 rework · **Date:** 2026-08-29 · **Status:** accepted

**Decision.** Widen the confidence column and render all five confidence names
in full. Put the provisional band beside the abstention glyph.

**Why.** Fixed abbreviations would add an undocumented vocabulary, while
truncation makes a safety state ambiguous. The full protocol terms already fit
when the fixed column is widened.

**Alternatives rejected.** Four-letter forms (new vocabulary); tooltips only
(not available at arm's length or on touch).

**Consequences.** Tests fail if confidence text clips or the provisional label
drops below the binding micro-label size.

### D-092 · The empty inspector names the three longest waits
**Step:** 35 rework · **Date:** 2026-08-29 · **Status:** accepted

**Decision.** Interpret “three longest waits by band” as the three encounters
with the longest elapsed arrival wait, each labelled with its current or
provisional band.

**Why.** This directly answers which long wait belongs to which acuity without
inventing a per-band aggregation or hiding encounter identity.

**Alternatives rejected.** One aggregate per band (cannot identify a patient);
oldest reassessment only (does not report arrival wait).

**Consequences.** The empty inspector also reports abstentions, last override,
and degraded boundary counts without changing clinical ordering.

### D-093 · The 1024 drawer reserves queue space
**Step:** 35 rework · **Date:** 2026-08-29 · **Status:** accepted

**Decision.** At the 1024 px drawer breakpoint, limit the queue rail to the
upper 60% of the board region and scroll it there; reserve the lower 40% for
the inspector.

**Why.** The former absolute drawer visually covered rows that continued into
the simulation console and colophon. Clipping the rail at the drawer edge
keeps both regions readable without changing the desktop split.

**Alternatives rejected.** Let rows continue behind the drawer (obscured
clinical text); remove the drawer (loses the specified inspector access).

**Consequences.** A browser geometry test fails if any visible row intersects
the inspector, console or colophon at 1024×768.

---

### D-094 · The layout-integrity exemption was inherited, not opted into
**Step:** 35 (reopened) · **Date:** 2026-08-29 · **Status:** accepted

**Decision.** `deliberateEllipsis` in `tests/e2e/layout-integrity.spec.js` now
requires `data-ellipsis="ok"` on the element itself, rather than accepting any
element with `text-overflow: ellipsis` inside a `[title]` ancestor.

**Why.** `board.js` sets `cells.detail.title` on the whole meta line, so the
old condition exempted every state token inside it. That is why `INSUFFICIENT`
rendering as `INS`, and a resolving question truncated to under half its
length, both passed a test written to catch exactly that. A truncated token is
not a word: the reader cannot tell `INS` from a state they do not recognise.
Free text may ellipsis because the full value is in the row title and the
inspector, and `.complaint-text` now says so explicitly.

**Consequences.** 76 layout cases across every state, viewport and theme.

### D-095 · Confidence marks are drawn, not typed
**Step:** 35 (reopened) · **Date:** 2026-08-29 · **Status:** accepted

**Decision.** `assets/js/util/glyph.js` draws the five confidence marks as
inline SVG in `currentColor`. The `confidenceGlyphs` character maps are gone
from `board.js` and `inspector.js`.

**Why.** IBM Plex contains none of U+25CF U+25D1 U+25D0 U+25CB — measured, not
assumed, and the upstream family does not have them either. Every confidence
mark was resolving to whatever the device substituted; on Windows the
half-filled circles rendered as unrelated characters. The mark is one of the
three carriers of confidence (UIUX 3.2) and the one that survives colour-vision
deficiency. A carrier that changes shape per device is not a carrier.

**Alternatives rejected.** Re-subsetting the fonts (the glyphs are not in the
source family). Naming fallback fonts known to have them (still device-dependent).

### D-096 · Row tokens are short because the row is a scanning surface
**Step:** 16 (reopened) · **Date:** 2026-08-29 · **Status:** accepted

**Decision.** Movement causes cap at the largest contributor plus a count;
resolving questions show a `shortLabel` from the protocol; `REASSESS 6m`
replaces `REASSESS · 6m OVERDUE`; `○ INSUFFICIENT` drops its instruction.
Vitals columns were narrowed and the reclaimed width went to the complaint.

**Why.** The tokens were 200–421px wide in a 142px slice. App Flow 4.1 shows
the row form as `resolve: pain radiating?`, not the full sentence — the
implementation had drifted from its own specification. The full question is in
the inspector, where the nurse has already committed attention to one patient.

### D-097 · Per-asset budgets measure transferred bytes
**Step:** 34 (reopened) · **Date:** 2026-08-29 · **Status:** accepted

**Decision.** The JavaScript and CSS ceilings are now gzipped (55 kB and 8 kB)
rather than uncompressed source (135 kB and 22 kB). Total cold transfer stays
at 120 kB and remains the governing budget.

**Why.** An uncompressed-source ceiling measures bytes no device downloads, and
one fitted to the code as written blocks the next legitimate change by a few
hundred bytes. It did: the resolving-question short labels put JavaScript 311
bytes over while total transfer still had 4.9 kB of headroom. Golfing working
code to fit a number that models nothing is the wrong repair. Both per-asset
budgets changed together so the rule is consistent rather than adjusted twice.

**Consequences.** Current: JS 43.2 kB gzipped, CSS 4.9 kB gzipped, total
transfer 115.9 kB.

### D-098 · Windows-only path assumption in the service-worker test
**Step:** 32 (reopened) · **Date:** 2026-08-29 · **Status:** accepted

**Decision.** `filesBelow(assetRoot.pathname.slice(1))` became
`filesBelow(fileURLToPath(assetRoot))`.

**Why.** A `file:` URL pathname is `/C:/Users/...` on Windows, where slicing one
character is correct, and `/root/app/assets` on POSIX, where it is not. The test
passed only on the machine it was written on and would have failed on any Linux
CI runner or container.

### D-099 · Golden snapshots regenerated for an additive field
**Step:** 11 (reopened) · **Date:** 2026-08-29 · **Status:** accepted

**Decision.** All three golden files were regenerated after
`resolvingQuestionShortLabel` was added to the assessment.

**Why.** Regenerating a golden to make a test pass is normally the thing not to
do. It is legitimate here only because it was verified first: every clinical
field — band, provisionalBand, bandSetBy, confidence, priorityIndex, interval,
rulesFired, tieBrokenUpward, noQuestionReason — was compared across all 20
encounters at t=0, t=30 and t=60 before rewriting. Clinical drift: zero. The
single added key was the new display label.
