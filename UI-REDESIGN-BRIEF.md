# UI Redesign Brief — v2 visual system
### Modern healthcare dashboard: navy rail, white cards, real infographics

| | |
|---|---|
| **Supersedes** | `docs/04-UIUX-BRIEF.md` §3 (colour), §4 (type), §5 (space and structure), §6 (components), §8 (iconography) |
| **Keeps** | §7 (motion), §9 (accessibility), §10 (colophon), and the parts of §2 not reversed below |
| **Do not** | commit, push, or deploy. Build it, run it locally, hand back before/after screenshots, and wait. |

---

## 0. What changes, and the one thing that must not

The previous system was a deliberate "clinical instrument" direction — warm paper, hairline rules, no cards, no shadows. It is being **replaced on the product owner's instruction** with a modern healthcare-dashboard look, matched to a set of supplied references.

**Reversed.** The bans on `box-shadow`, on `border-radius` above 2px, and on cards. The warm ground. Hairline-only structure.

**Still binding.** No purple or violet. No gradient backgrounds or gradient buttons (gradient *fills inside charts* are fine). No emoji. No three-across marketing card grid. Colour never the sole carrier of a state. Tabular numerals. Nothing overlaps, nothing clips.

**The constraint that governs everything.** The supplied references are patient portals and admin dashboards — low density, lots of air, a dozen data points per screen. **This is a real-time triage board.** Its job is to let a standing, interrupted nurse answer *who do I see next* in one glance, across twenty patients. Take the visual language from the references; do not take their information density.

> **Hard requirement: at 1280×800, at least 12 queue rows visible without scrolling.** Measure it and report the number. If a design choice costs rows, the design choice loses.

---

## 1. Reference DNA — what to take

All six references share the same skeleton. Adopt it.

| Element | What the references do | Apply it here |
|---|---|---|
| **Dark navigation rail** | Deep navy or teal sidebar, ~220px, product mark at top, icon+label nav, user block at the bottom | Left rail: Board · Fairness · Audit, plus a live mode indicator and the protocol/engine version at the foot. This is the single biggest change and the one that makes it read as a product. |
| **Tinted page, white cards** | Page `#F4F7FB`-ish, cards pure white, generous radius, soft diffuse shadow, minimal borders | Exactly this |
| **KPI tile row** | 3–5 tiles across the top; each with a **tinted circular icon badge**, a small uppercase caption, a large number, and a delta or status line | Five tiles: Waiting · P1 · P2 · Abstaining · Longest wait |
| **Status pills** | Tinted-background pills — "Checked in", "Normal", "High" — in green/amber/red/blue | Band chips and confidence tokens become pills |
| **Charts carry weight** | Donuts, area charts with gradient fill, grouped bars, progress bars with values | §5 — each mapped to a real clinical question |
| **Card header pattern** | Title left, "View all ›" or a filter control right, thin divider under | Every card |

**Three things from the references to refuse, and why.**

1. **No patient photos or avatars.** Every reference uses them. This product holds no identity — no name, no photograph, no hospital number — and that is a design decision defended in the schema. Adding avatars would contradict the product's own privacy claim.
2. **No greeting header.** "Welcome back, Kate" / "Hello, Ada! 👋" is the wrong register. A triage board opens with the department, the clock, and the census.
3. **No emoji anywhere**, including in nav labels and headings.

---

## 2. Palette

```css
/* rail */
--rail:        #111C33;   /* deep navy sidebar */
--rail-2:      #1B2942;   /* hover / raised within rail */
--rail-ink:    #E8EDF6;
--rail-ink-2:  #93A2BF;
--rail-active: #4FA37C;   /* active nav item bar + tint (lighter than --accent: must clear 3:1 on the navy rail) */

/* page and surfaces */
--bg:            #F4F7FB;
--surface:       #FFFFFF;
--surface-sunk:  #F8FAFC;
--border:        #E6EBF2;
--border-strong: #CFD8E5;

/* ink */
--ink:   #0F1A2E;
--ink-2: #4A5A75;
--ink-3: #8695AD;

/* accent — deep clinical green, never indigo or violet */
--accent:    #0F4130;
--accent-bg: #E8F0EC;

/* clinical signal — pill fill + text pairs */
--p1: #C4271C;  --p1-bg: #FDECEA;
--p2: #B45905;  --p2-bg: #FEF4E6;
--p3: #4A5A75;  --p3-bg: #F1F4F9;   /* achromatic on purpose */
--p45: #7C8BA3; --p45-bg: #F5F7FA;
--abstain: #1257B0;  --abstain-bg: #EAF2FE;
--nurse:   #0A6B49;  --nurse-bg: #E9F7F1;
```

**P3 stays grey.** Most triage boards colour the middle band yellow, which trains the eye to read three-quarters of the list as a warning and destroys the alarm signal. Colour appears only where something is actually wrong or actually uncertain.

**Dark mode** must keep working: page `#0C1420`, surfaces `#141E2E`, rail unchanged, signal hues lifted for contrast, every meaning identical. Re-measure contrast; do not assume it. Dark accent lifts to `--accent: #72C96E` on `--accent-bg: #123A2A` (9.06:1 on page, 8.20:1 on surface); it is deliberately grassier than the mint `--nurse: #79D4AC` so the interactive accent is never read as the nurse-override signal.

---

## 3. Elevation, radius, spacing

```css
--shadow-sm: 0 1px 3px rgba(15, 26, 46, .06), 0 1px 2px rgba(15, 26, 46, .04);
--shadow-md: 0 8px 24px -6px rgba(15, 26, 46, .12), 0 2px 8px -2px rgba(15, 26, 46, .06);

--r-sm: 8px;    /* pills, buttons, inputs */
--r-md: 12px;   /* cards, tiles */
--r-lg: 16px;   /* overlays, sheets */
--r-badge: 50%; /* icon badge on a KPI tile */

--s1: 4px; --s2: 8px; --s3: 12px; --s4: 16px;
--s5: 20px; --s6: 28px; --s7: 40px;
```

**Two elevation levels, no more.** Cards and tiles get `--shadow-sm` with a 1px `--border`. Overlays get `--shadow-md`. Rows, pills and buttons get none. Hover changes background, never elevation.

---

## 4. Type

**Keep IBM Plex Sans and IBM Plex Mono.** The typeface was never the problem — the layout was — and both are already self-hosted and inside budget. Adding a family costs bytes for nothing.

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `--t-kpi` | 30 / 34 | 600, `-0.02em` | KPI tile values, priority index |
| `--t-h1` | 19 / 25 | 600, `-0.01em` | Card titles |
| `--t-h2` | 15 / 20 | 600 | Sections inside a card |
| `--t-label` | 11 / 14 | 600, `+0.06em`, uppercase | Column heads, tile captions, tokens |
| `--t-body` | 14 / 21 | 400 | Prose |
| `--t-row` | 14.5 / 18 | 450 | Row complaint |
| `--t-data` | 15 / 18 | 500, mono, tabular | Vitals |
| `--t-meta` | 12 / 16 | 400 | Meta line, captions |
| `--t-nav` | 14 / 20 | 500 | Rail items |

`font-variant-numeric: tabular-nums lining-nums` on every numeric element, without exception.

---

## 5. Layout

```
┌────────────┬───────────────────────────────────────────────────────────┐
│            │  HEADER  white, 60px  ·  Emergency Department · Triage    │
│   NAVY     │          board  ·  live clock  ·  census  ·  mode pill    │
│   RAIL     ├───────────────────────────────────────────────────────────┤
│   220px    │  ALERT / MODE cards  (conditional, inline)                │
│            ├───────────────────────────────────────────────────────────┤
│  ◻ Board   │  KPI ROW  ·  5 tiles  ·  ~96px                            │
│  ◻ Fairness├──────────────────────────────────┬────────────────────────┤
│  ◻ Audit   │  WAITING QUEUE card      63%     │  INSPECTOR card   37%  │
│            │  sticky header row               │  scrolls               │
│            │  ≥12 rows visible                │                        │
│  ── mode   │                                  │                        │
│  ── v1     └──────────────────────────────────┴────────────────────────┤
│  ── engine │  SIM CONSOLE  ·  marked as prototype scaffolding          │
└────────────┴───────────────────────────────────────────────────────────┘
```

Content padding `--s5`, gap between cards `--s4`. Two deliberately unequal regions — not a 12-column grid.

**The queue stays a real `<table>`** with fixed columns and a sticky header row. Vitals must align vertically down twenty rows; a card-per-patient layout cannot do that and is the fastest possible way to make this board worse. Row height 44px, hover `--surface-sunk`, selected row `--accent-bg` with a 3px `--accent` left bar.

---

## 6. Infographics

Seven. Each answers a question a nurse or charge nurse would act on. **Anything decorative gets cut.**

### 6.1 KPI tiles — *Waiting · P1 · P2 · Abstaining · Longest wait*
The reference pattern: a 40px tinted circular icon badge, uppercase caption, `--t-kpi` value, and one line of context beneath (`▲ 3 in 15 min`, or a 44×16 sparkline). Badge tint matches the metric — P1 tile uses `--p1-bg` with a `--p1` glyph. The P1 tile gains a 3px `--p1` top border when the count is non-zero.

### 6.2 Band distribution donut — *the shape of the department*
A donut, P1→P5, band colours, **total waiting in the centre**, legend to the right with counts and percentages. This is the reference pattern that fits this product best, and it is the highest-value single addition in the brief.

### 6.3 Queue pressure area chart — *is it getting worse?*
Arrivals versus patients seen over the shift, area chart with a soft gradient fill under the line, in `--accent`. Marks the surge threshold as a dashed horizontal rule. Gradient fills inside a chart are fine; gradient backgrounds are not.

### 6.4 Wait vs safe interval — *who is overdue, and by how much*
Horizontal progress bars per band: current longest wait against that band's reassessment interval, with the interval as a tick on the track and the value at the bar end. Over-interval bars fill `--p2`.

### 6.5 Confidence gauge — *how sure is it*
A 0–100 track with band boundaries as ticks, the interval as a filled capsule in the band colour, the point estimate as a 3px rule, boundary values labelled beneath.

### 6.6 Vital trend charts — *see the deterioration*
Per parameter in the inspector: 130×40 line chart with a shaded normal-range band behind it, first and last values labelled, drift arrow. Six to eight points. This is where a nurse sees deterioration rather than reading it.

### 6.7 Derivation contribution bar — *why is this patient here*
A stacked horizontal bar: L1 physiology / L2 presentation / L3 hazard as proportions of the priority index, each segment labelled with its points. **It turns the derivation from a table into a picture**, and it is the one a judge will remember.

Plus **fairness** (§6.8): grouped horizontal bars per subgroup with a reference line for the board rate, flagged subgroup in `--p2`, values at the bar end. The headline sentence stays above — the sentence is the finding, the chart is the evidence.

**Chart rules.** Hand-authored inline SVG — **no charting library**, that ban stands. No gridlines unless a value must be read off the chart. Direct labels instead of legends wherever one fits. No axis line that carries no information. Legible on a tablet at arm's length.

---

## 7. Components

| Component | Spec |
|---|---|
| **Nav rail item** | 40px, `--r-sm`, `--t-nav`, `--rail-ink-2`; active gets `--rail-2` fill, `--rail-ink` text and a 3px `--rail-active` left bar |
| **Band chip** | Pill, `--r-sm`, tinted `--pN-bg` with `--pN` text and a 1px border. **P1 only:** solid `--p1` fill, white text. Exactly one filled chip in the system. |
| **Status pill** | Same construction, for confidence tokens and mode |
| **KPI tile** | White, `--r-md`, `--shadow-sm`, 1px `--border`, `--s4` padding, 40px circular icon badge |
| **Card** | White, `--r-md`, `--shadow-sm`, 1px `--border`. Header: `--t-h1` title left, action right, 1px bottom divider. |
| **Alert / mode card** | Inline, `--r-md`, tinted by severity, 3px left border in the signal colour |
| **Buttons** | `--r-sm`, 36px. Primary `--accent` fill, white text. Secondary white with `--border-strong`. Focus 2px `--accent` ring, 2px offset. |
| **Confidence mark** | **Unchanged — keep `assets/js/util/glyph.js`.** The marks are drawn SVG because IBM Plex contains none of those characters and a text glyph resolves differently on every device. Do not turn them back into characters. |
| **Overlays** | `--r-lg`, `--shadow-md`, page dimmed `rgba(15,26,46,.34)` |

**Icons.** A small hand-drawn 1px-stroke inline SVG set is now permitted: the rail items, KPI badges, export, close, chevron, drag handle. **No icon library. No emoji.** An icon inside a tinted circular badge is correct on a KPI tile — nowhere else.

---

## 8. What must not regress

- [ ] **≥12 queue rows visible at 1280×800 without scrolling** — measure and report
- [ ] `layout-integrity.spec.js` passes across every state, viewport and theme. **Do not weaken it**, and do not widen the `data-ellipsis="ok"` exemption beyond free text
- [ ] Every state carries hue **and** text token **and** glyph
- [ ] Contrast re-measured both themes; P1 filled chip ≥7:1
- [ ] Motion still limited to the two animations in UIUX §7 — value flash and row translate. A redesign is not a licence to add entrance animations.
- [ ] All 151 unit/property/golden tests green. **No engine, protocol or cohort changes whatsoever.**
- [ ] Full keyboard path, axe clean, 200% zoom, offline reload
- [ ] No build step, no framework, no runtime dependency

**Two tests fail by design. Update them deliberately, do not delete them.**

1. `tests/unit/design-contract.test.js` bans `box-shadow` and radii above 2px. Rewrite to the new contract: **exactly two** shadow values and no others; radii only from the four tokens; still zero gradient *backgrounds*, zero purple/violet, zero emoji, zero icon-library imports; still exactly one filled band chip; still no patient photograph or avatar element anywhere.
2. Budgets grow. CSS gzip may rise to **14 kB**, JS gzip to **60 kB**. **Total cold transfer stays ≤120 kB and remains governing** — if that breaks, the design is too heavy and loses weight rather than gaining a bigger number.

---

## 9. Deliverables

Local only. **No commit, no push, no deploy.**

1. Build it and run it locally.
2. Regenerate the survey captures for all 11 states at 1280×800 light, plus one dark.
3. Report: **before/after screenshots side by side** for the queue, the inspector with a patient selected, and the fairness panel; the visible-row count; full test status; and the three budget numbers.
4. Log the redesign in `docs/07-DECISION-LOG.md`, including both test rewrites and what the old contract said.

Then stop. The product owner reviews it running locally before anything is committed.
