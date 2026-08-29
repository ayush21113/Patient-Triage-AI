# 04 · UI/UX Brief
### The visual system — a clinical instrument, not a dashboard

| | |
|---|---|
| **Purpose** | Every colour, size, weight, spacing value and interaction rule. An implementing agent picks nothing; it looks it up here. |
| **Depends on** | `01-PRD.md`, `03-APP-FLOW.md` |
| **Revision** | 1.0 |

---

## 1. The position

> **This is a board in an emergency department, read standing, at arm's length, by someone who is being interrupted. It is a clinical document that updates itself. It is not a product page, not a SaaS dashboard, and not a data-visualisation showcase.**

Everything below follows from that sentence. When a decision is unclear, the test is: *would this element exist on a well-designed paper form that a hospital had been refining for thirty years?* If not, it does not go on the screen.

### 1.1 References we are actually designing from

| Reference | What we take |
|---|---|
| The paper ED triage form and the physical whiteboard | Running header with department, date, shift, revision. Ruled rows. Fixed columns. A colophon at the foot. |
| Laboratory and test-equipment panels (oscilloscopes, blood-gas analysers, ventilators) | Monospaced tabular numerals as the primary content. Units set smaller than values. Colour reserved for alarm states. Legibility over elegance. |
| Swiss clinical and transport documentation — Otl Aicher's hospital and airport systems | Hairline rules doing the work that boxes and shadows usually do. Uppercase letterspaced micro-labels. Asymmetric field division. |
| Airline load sheets, ships' logs, anaesthetic charts | Documents where a number has a consequence, so nothing is decorative and nothing is hidden behind an interaction. |

### 1.2 What we are explicitly not designing from
Stripe's marketing site. Linear's app chrome. Any Tailwind starter. Any dribbble "healthcare dashboard concept". Any interface whose primary visual event is a card with a soft shadow.

---

## 2. The anti-generic contract

The current generation of AI-assisted frontends converges on one look, and the tells are well documented ([925 Studios](https://www.925studios.co/blog/ai-slop-design-tells), [avoid-ai-design](https://github.com/funboy322/avoid-ai-design), [Superdesign](https://superdesign.dev/blog/why-ai-design-looks-generic)). The convergence has a traceable cause: Tailwind's 2019 `indigo-500` default plus shadcn's untouched `zinc`/`slate` plus Inter.

This project **must not** produce that. The contract below is binding. A pull request violating any line is rejected.

### 2.1 Prohibited — no exceptions

| # | Banned | Why |
|---|---|---|
| 1 | Inter, Roboto, Poppins, Montserrat, Nunito, Space Grotesk, or any system-default-only stack | The single loudest tell. Inter signals no typographic decision was made. |
| 2 | Any purple, violet, indigo or `#6366F1`-adjacent hue, anywhere, at any opacity | The AI-design fingerprint |
| 3 | Any gradient. Including `bg-clip-text` headline gradients and "subtle" background washes. | See above |
| 4 | `box-shadow` of any kind | Elevation here is expressed by a rule and a ground shift, as on paper |
| 5 | `border-radius` above 2 px, and any `rounded-2xl` equivalent | Sharp corners read as instrument; soft corners read as consumer app |
| 6 | Glassmorphism, backdrop-blur, translucent panels | |
| 7 | Three feature cards in a row. Any card-grid layout. | This interface has no cards at all |
| 8 | Lucide, Feather, Heroicons, Font Awesome, Material Icons | Icon libraries carry a visual fingerprint we are avoiding |
| 9 | Emoji, anywhere, including in copy and commit messages | |
| 10 | Centred hero layouts, full-width CTA bands, four-column footers | |
| 11 | `fade-in-up` on load, staggered entrance animation, scroll-triggered reveal | Motion here means one thing: a value changed |
| 12 | Uniform spacing (`gap-4` / `p-6` on everything) | Spatial hierarchy must be deliberate and unequal |
| 13 | Stock photography, illustration, gradient placeholders, avatars | |
| 14 | Copy in the register of "Build faster. Ship smarter." | Every string is clinical and specific |
| 15 | Colour as the sole carrier of any meaning | WCAG 1.4.1, and it is a patient-safety requirement in a department where colour-vision deficiency is unscreened |

### 2.2 The five defining moves

Three to five decisive choices are what separate a designed interface from a defaulted one. Ours:

1. **Warm paper ground, ink rules, zero shadows.** The background is `#F2F0EA`, not white and not `slate-50`. Structure is carried entirely by 1 px hairlines. There is no card, no panel, no elevated surface anywhere in the application.
2. **Type is IBM Plex, used as three distinct voices.** Plex Mono for every number and code. Plex Sans Condensed for uppercase letterspaced micro-labels. Plex Serif — used in exactly one place, the inspector's derivation headings — so that the reasoning panel reads as an argument in prose rather than as a widget.
3. **Colour is a signal, never a surface.** The interface is achromatic. Five hues exist, each bound to one meaning, and each also carries a text token and a glyph. Nothing is coloured because it looks good.
4. **Asymmetric 62/38 split, and a real table.** Not halves, not thirds, not a card grid. The queue is a genuine fixed-column table so that vitals align vertically down twenty rows — the single property that makes a board scannable and that no card layout can provide.
5. **The colophon.** A footed line, set in the serif, stating engine version, protocol version, render timestamp and the recommend-not-decide boundary. It is the element that most clearly marks this as a clinical document rather than a web page, and it is load-bearing legally as well as visually.

---

## 3. Colour tokens

Defined once at the top of `board.css` as custom properties. **No colour literal appears anywhere else in the stylesheet.**

### 3.1 Ground and ink — light (canonical)

| Token | Value | Use |
|---|---|---|
| `--ground` | `#F2F0EA` | Page. Warm paper, not white. |
| `--ground-raised` | `#FAF9F5` | Overlay sheets, inspector — a shift of ground, never a shadow |
| `--ground-sunk` | `#E7E4DA` | Header strip, footer, table head |
| `--ground-invert` | `#16150F` | Inverted tokens, alarm fills |
| `--ink` | `#16150F` | Primary text |
| `--ink-2` | `#524F48` | Secondary text, units, meta |
| `--ink-3` | `#706B61` | Tertiary, disabled, placeholder |
| `--rule` | `#CFCABA` | Hairlines — the workhorse |
| `--rule-strong` | `#9E9887` | Section divisions, table head underline |
| `--rule-alarm` | `#A81E12` | Rules bracketing a pinned row |

### 3.2 Signal hues — bound to meaning, one each

| Token | Value | Bound meaning | Text token | Glyph |
|---|---|---|---|---|
| `--sig-alarm` | `#9B1C11` | P1 · rule fired · deterioration | `P1` / `LOCKED` | `●` |
| `--sig-escalate` | `#A3590A` | P2 · overdue reassessment | `P2` / `REASSESS` | `▲` |
| `--sig-steady` | `#524F48` | P3 — **deliberately achromatic** | `P3` | `—` |
| `--sig-low` | `#706B61` | P4, P5 | `P4` `P5` | `○` |
| `--sig-abstain` | `#1F5673` | Uncertainty, abstention, resolving question | `UNRESOLVED` | `⊘` |
| `--sig-nurse` | `#2E5A3E` | Human override, nurse-assigned band | `NURSE` | `‡` |

Two additional tokens exist for the single filled element in the system, the P1 band chip (§6.1). They are separate tokens because a hue that is legible *as text on paper* and a hue that is legible *as a background under paper-coloured text* are not the same hue, and conflating them is how filled alarm states end up unreadable.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--sig-alarm-fill` | `#9B1C11` | `#8E1A10` | P1 chip background |
| `--sig-alarm-fill-ink` | `#F2F0EA` | `#EDEAE0` | Text on the P1 chip |

**P3 has no colour.** Most triage boards give the middle band a yellow, which trains the eye to see three-quarters of the list as "warning" and destroys the alarm signal. Here the middle of the distribution is ink, and colour only appears where something is actually wrong or actually uncertain. This is the choice that makes the alarm states work.

### 3.3 Dark variant

Available via `prefers-color-scheme: dark` for night shift. Light is canonical; dark is a faithful inversion, not a redesign. Signal hues are lifted for contrast on dark ground and their meanings are unchanged.

| Token | Dark value |
|---|---|
| `--ground` | `#14130E` |
| `--ground-raised` | `#1C1B15` |
| `--ground-sunk` | `#0E0D09` |
| `--ink` | `#EDEAE0` |
| `--ink-2` | `#A5A093` |
| `--ink-3` | `#837F71` |
| `--rule` | `#33312A` |
| `--rule-strong` | `#4E4B41` |
| `--sig-alarm` | `#EF6F62` |
| `--sig-escalate` | `#DE9333` |
| `--sig-steady` | `#A5A093` |
| `--sig-low` | `#837F71` |
| `--sig-abstain` | `#5C9CBF` |
| `--sig-nurse` | `#6FA57F` |

### 3.4 Contrast requirements — measured, not asserted

Every value in §3.1–§3.3 has been computed against the WCAG 2.1 relative-luminance formula and passes. **These are measurements, not intentions.** Any token change must be re-measured before merge, and the measurement belongs in the pull request.

| Pair | Required | Light | Dark |
|---|---|---|---|
| `--ink` on `--ground` | ≥ 12:1 | **16.05** | **15.45** |
| `--ink-2` on `--ground` | ≥ 7:1 | **7.17** | **7.13** |
| `--ink-3` on `--ground` | ≥ 4.5:1 | **4.65** | **4.64** |
| `--sig-alarm` on `--ground` | ≥ 4.5:1 | **7.18** | **6.31** |
| `--sig-escalate` on `--ground` | ≥ 4.5:1 | **4.62** | **7.37** |
| `--sig-steady` on `--ground` | ≥ 4.5:1 | **7.17** | **7.13** |
| `--sig-low` on `--ground` | ≥ 4.5:1 | **4.65** | **4.64** |
| `--sig-abstain` on `--ground` | ≥ 4.5:1 | **6.99** | **6.17** |
| `--sig-nurse` on `--ground` | ≥ 4.5:1 | **6.96** | **6.52** |
| `--sig-alarm-fill-ink` on `--sig-alarm-fill` | **≥ 7:1** | **7.18** | **7.57** |

**Why 4.5:1 for signal hues and 7:1 only for the P1 fill.** An earlier revision of this brief demanded 7:1 of every signal hue. That requirement is not reachable while the hues remain what they are: amber at 7:1 on warm paper is `#784107`, which reads as brown and stops working as an escalation signal, and a dark-mode red at 7:1 on near-black is `#EA847B`, a washed salmon that is a worse alarm than a saturated red. Demanding a ratio that forces a colour to stop meaning what it means is a specification error, not a safety measure.

The requirement that carries the actual safety weight is on the **one interruptive element** — the filled P1 chip, where paper-coloured text sits on a red ground — and that pair is held to 7:1 in both modes. Everything else is held to WCAG AA for normal text (4.5:1), which is AAA for the ≥18.66 px sizes most of these hues are used at, and is backed by the rule that colour is never the sole carrier of meaning (§3.2, NFR-6).

*Verify with:* `L = 0.2126R + 0.7152G + 0.0722B` on linearised sRGB channels; ratio `(L₁+0.05)/(L₂+0.05)`.

---

## 4. Typography

### 4.1 Families

```css
--font-data:  "IBM Plex Mono", "SFMono-Regular", "Menlo", "Consolas", monospace;
--font-ui:    "IBM Plex Sans", "Helvetica Neue", "Segoe UI", system-ui, sans-serif;
--font-label: "IBM Plex Sans Condensed", "IBM Plex Sans", "Helvetica Neue", sans-serif;
--font-prose: "IBM Plex Serif", "Iowan Old Style", "Georgia", serif;
```

IBM Plex is chosen, not defaulted: it was drawn for an engineering organisation, its mono is a genuine text-grade monospace rather than a code face, and its condensed cut gives us a label voice most UI families do not have. It is also not on anyone's list of AI-default typefaces.

Loaded from Google Fonts and precached by the service worker so the offline claim holds. The fallback stack has matched metrics; layout does not shift when the webfont is absent.

### 4.2 Scale — chosen sizes, not a ratio applied mechanically

| Token | Size / line-height | Family | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `--t-micro` | 10 / 12 | label | 600 | `+0.14em`, uppercase | Field labels, column heads, tokens |
| `--t-meta` | 11 / 15 | ui | 400 | `+0.01em` | Timestamps, versions, footnotes |
| `--t-body` | 13 / 19 | ui | 400 | 0 | Interface prose |
| `--t-row` | 15 / 18 | ui | 400 | 0 | Row complaint text |
| `--t-data` | 17 / 18 | data | 500 | 0 | **Vitals. The most important size in the interface.** |
| `--t-band` | 22 / 22 | data | 600 | `+0.02em` | Band chip |
| `--t-index` | 30 / 30 | data | 400 | `-0.01em` | Priority Index in the inspector |
| `--t-head` | 14 / 20 | prose | 600 | 0 | Inspector derivation headings — the only serif |

### 4.3 Numeral rules

All numeric content uses `font-variant-numeric: tabular-nums lining-nums;`. Non-negotiable: a clock or a heart rate whose digits change width makes the eye re-find the value on every tick, and on a board that ticks every second that is a genuine legibility failure.

Units are set at `--t-meta` in `--ink-3`, immediately after the value with no space: `132ᵇᵖᵐ` renders as `132` + a small `bpm`. The value dominates; the unit is available but never competes.

Unobtainable values render as `——` (two em-dashes) in `--ink-3`, never as `0`, `N/A`, `null`, or an empty cell. An empty cell is indistinguishable from a rendering failure.

### 4.4 Copy register

Terse, clinical, declarative. Sentence case for prose; uppercase only for micro-labels and tokens.

| Write | Never write |
|---|---|
| "Not obtained. Interval widened." | "No data available 😔" |
| "Cannot discriminate P2 from P3." | "Low confidence" |
| "Tie broken upward. Undertriage cost 8:1." | "Erring on the side of caution" |
| "Reassess due 14:47." | "Don't forget to check on this patient!" |
| "Queued at P2 while unresolved." | "Provisional priority assigned" |
| "One question would resolve this." | "Need more info?" |

Every string states a fact and, where relevant, the consequence. No string apologises, encourages, or celebrates.

---

## 5. Space and structure

### 5.1 Spacing scale — deliberately unequal

```css
--s1: 3px;  --s2: 6px;   --s3: 9px;   --s4: 14px;
--s5: 20px; --s6: 30px;  --s7: 48px;
```

A 3 px base with non-linear steps. Uniform `gap-4` everywhere is an explicit tell (§2.1 #12); hierarchy must be visible in the spacing itself. Row internal padding is `--s2` vertical, `--s3` horizontal. Region padding is `--s5`. The gap between the queue and the inspector is a 1 px rule plus `--s5` on each side — not a gutter of empty space.

### 5.2 Radius and elevation

```css
--radius: 0;             /* everything */
--radius-control: 2px;   /* only: inputs, chips, buttons */
```

**There is no `--shadow` token.** Shadows do not exist in this system. A surface that needs to read as raised gets `--ground-raised` and a 1 px `--rule-strong` border. This one rule removes the largest single component of the generic look.

### 5.3 Layout

```
┌──────────────────────────────────────────────────────────────┐
│ S0  HEADER                                              44px │
├──────────────────────────────────────────────────────────────┤
│ S8  ALERT BAR (conditional)                             38px │
├──────────────────────────────────────────────────────────────┤
│ S7  MODE STRIP (conditional)                            26px │
├───────────────────────────────────┬──────────────────────────┤
│                                   │                          │
│  S1  QUEUE RAIL                   │  S2  INSPECTOR           │
│      62%  min 620px               │      38%  min 380px      │
│      fixed-column table           │      scrolls             │
│      scrolls                      │                          │
│                                   │                          │
├───────────────────────────────────┴──────────────────────────┤
│ S9  SIMULATION CONSOLE  (prototype only)                34px │
├──────────────────────────────────────────────────────────────┤
│ COLOPHON                                                22px │
└──────────────────────────────────────────────────────────────┘
```

`grid-template-columns: minmax(620px, 62fr) 1px minmax(380px, 38fr);` — the 1 px middle track is the divider rule itself, not a border on a neighbour, so it stays exactly 1 device pixel at every zoom level.

Below 1024 px the inspector becomes a bottom drawer over the queue. The queue never collapses; it is the product.

### 5.4 The queue table

A real `<table>` with `table-layout: fixed`. Semantics matter for screen readers, and fixed columns are what make twenty rows of vitals scannable.

| Column | Width | Align |
|---|---|---|
| Band | 54 px | centre |
| ID | 84 px | left |
| Age/Sex | 62 px | left |
| Complaint | `1fr` | left |
| HR | 58 px | right |
| BP | 78 px | right |
| RR | 48 px | right |
| SpO₂ | 58 px | right |
| Temp | 58 px | right |
| Wait | 56 px | right |
| Conf | 96 px | left |

Row separation is a 1 px `--rule` under each row. **No zebra striping** — alternating background fills compete with the alarm states, which are also background changes. On a board where a fill means "this patient is critical", decorative fills are a safety problem.

Row height 42 px normal, 20 px collapsed in surge mode. Touch target for the whole row ≥ 44 px including padding.

---

## 6. Component specifications

### 6.1 Band chip
54 × 26 px, `--radius-control`, `--t-band`, mono 600. Normal bands: 1 px border in the signal hue, transparent ground, hue-coloured text. **P1 only:** filled `--sig-alarm-fill`, text `--sig-alarm-fill-ink`. Exactly one band in the system is a filled block, and it is the one that means *now*.

Abstaining: the chip shows `⊘` in `--sig-abstain` with the provisional band beneath it at `--t-micro`.

### 6.2 Confidence indicator
Glyph plus text token, always both. Five states:

| Display | Hue | Meaning |
|---|---|---|
| `● ESTABLISHED` | `--ink` | Interval sits inside one band |
| `◑ PROBABLE` | `--ink` | Crosses one boundary, ≥ 65:35 |
| `◐ UNRESOLVED` | `--sig-abstain` | Abstains. A question is offered. |
| `◐ UNRESOLVABLE` | `--sig-escalate` | Abstains. Questioning cannot help — escalate. |
| `○ INSUFFICIENT` | `--sig-abstain` | Too little was obtained to discriminate |

Set at `--t-micro`. Never a percentage — false precision on an uncertainty measure is worse than no measure.

`UNRESOLVED` and `UNRESOLVABLE` **share the `◐` glyph deliberately**: the glyph encodes *how uncertain*, and these two are equally uncertain. What separates them is what the nurse should do, so the difference is carried by the text token and the hue — amber, because unlike every other abstention state this one asks for an action the nurse cannot take alone. An `UNRESOLVABLE` row also carries an `ESCALATE` token beside the wait cell.

### 6.3 Confidence band (inspector)
A 3 px horizontal rule spanning the interval on a 0–100 track, with band boundaries marked as 1 px ticks and the point estimate as a 7 px filled square. Drawn as inline SVG. It is a *band*, physically, because that is what it represents — not a badge, not a percentage, not a progress bar.

### 6.4 Vital cell
Value in `--t-data`, unit in `--t-meta` `--ink-3`. When drifted since the previous observation, a 9 px `▲`/`▼` in `--sig-alarm` / `--sig-abstain` precedes the value, and the value carries a 140 ms flash on change (§7).

### 6.5 Sparkline
28 × 14 px inline SVG, 1 px stroke `--ink-2`, no fill, no axis, no grid, no dots except a 2 px terminal marker. Six to eight points. It exists to answer "which way" in a glance, not to be read quantitatively — the numbers beside it do that.

### 6.6 Fairness bars
Horizontal, 1 px `--rule-strong` baseline, bars in `--ink-2` at 10 px height, the flagged worst-served subgroup in `--sig-escalate`. Values printed at the bar end in mono. No axis lines, no legend, no gridlines — the label is on the bar.

### 6.7 Buttons
Text set in `--t-micro` uppercase, 1 px `--rule-strong` border, `--radius-control`, `--ground` fill, `--s2`/`--s4` padding. Hover: border to `--ink`. Active: ground to `--ground-sunk`. Focus: 2 px `--sig-abstain` outline, offset 1 px.

There is exactly **one** filled button in the application: `ADMIT TO QUEUE` in the arrival sheet, filled `--ink`. One primary action per screen, and it is the one that puts a person in the queue.

### 6.8 Overlay sheets
`--ground-raised`, 1 px `--rule-strong` border, no shadow, no backdrop blur. The page behind dims via a `--ground-invert` overlay at 22% opacity. No entrance animation — the sheet is present or it is not.

---

## 7. Motion

**Two animations exist. There are no others.**

| # | Animation | Duration | Easing | Trigger |
|---|---|---|---|---|
| 1 | **Value flash** — a changed number's background lifts to a 14% tint of its drift hue and decays | 140 ms in, 500 ms out | `linear` out | A vital, index or band value changes on a tick |
| 2 | **Row translate** — a row that changed rank animates from its old Y to its new one | 180 ms | `cubic-bezier(.2,0,.2,1)` | Rank change on a tick |

Both exist for one reason: on a board that recomputes every sixty seconds, a value that changes without a visible transition is a change the nurse did not see. Motion here is a safety feature with a specific job.

No fade-in on load. No stagger. No scroll reveal. No hover lift. No skeleton shimmer. `prefers-reduced-motion: reduce` disables both and substitutes a 1 px left marker that persists for three ticks.

---

## 8. Iconography

Five typographic marks, no icon library, no emoji:

| Mark | Meaning |
|---|---|
| `▲` `▼` | Drift direction, rank movement |
| `●` `◑` `◐` `○` | Confidence, four levels |
| `⊘` | Abstention |
| `‡` | Nurse override |
| `——` | Not obtained |

Two hand-drawn inline SVGs, 1 px stroke, 14 × 14, currentColor: export, and close. That is the complete icon inventory.

---

## 9. Accessibility

| Requirement | Implementation |
|---|---|
| Colour never sole carrier | Every state has hue + text token + glyph (§3.2) |
| Contrast | §3.4, verified with axe |
| Keyboard | Full operation: `↑`/`↓` select, `Shift+↑`/`Shift+↓` reposition, `Enter` commit override, `A` audit, `F` fairness, `Esc` dismiss. Visible 2 px focus ring on every interactive element. |
| Screen reader | The queue is a real table with `<caption>`, `scope="col"` headers, and `aria-rowindex`. Rank changes announce via `aria-live="polite"`; a fired hard rule announces via `aria-live="assertive"`. |
| Touch targets | ≥ 44 × 44 px |
| Text scaling | Layout holds to 200% browser zoom |
| Reduced motion | §7 |
| Colour-vision deficiency | Alarm red and abstain blue are separable under deuteranopia and protanopia; the achromatic P3 means most of the board is unaffected by any CVD |

---

## 10. The colophon

Fixed at the foot of the page, `--t-meta` in `--font-prose`, `--ink-3`, on `--ground-sunk`:

> *PatientTriage.ai · engine 1.0.0 · protocol v1 · board rendered 14:32:07 IST · This display is decision support. It does not assign a triage category, move a patient, or order treatment. The attending clinician's judgement governs.*

It states the engine and protocol versions a reviewer would need, timestamps the render, and carries the recommend-not-decide boundary that keeps the product on the non-device side of the FDA CDS line. It is also, incidentally, the single element most responsible for the interface reading as a piece of clinical software rather than a web page.

---

## 11. Review checklist

Before any merge:

- [ ] No purple, indigo, violet or gradient anywhere in the diff
- [ ] No `box-shadow`; no `border-radius` above 2 px
- [ ] No Inter / Roboto / Poppins / Space Grotesk
- [ ] No icon library import; no emoji in code, copy or commit message
- [ ] No card component; no three-across grid
- [ ] Every new colour is an existing token — no literals outside the token block
- [ ] Every new state has hue **and** text token **and** glyph
- [ ] Every numeric element uses `tabular-nums`
- [ ] No new animation beyond the two in §7
- [ ] Every new string passes the copy-register table in §4.4
- [ ] Contrast verified on both light and dark
- [ ] Full keyboard path still works

---

*Design-tell sources: [925 Studios — AI slop design tells](https://www.925studios.co/blog/ai-slop-design-tells) · [avoid-ai-design (GitHub)](https://github.com/funboy322/avoid-ai-design) · [Superdesign — why AI design looks generic](https://superdesign.dev/blog/why-ai-design-looks-generic) · [Why every AI-built website looks the same](https://dev.to/alanwest/why-every-ai-built-website-looks-the-same-blame-tailwinds-indigo-500-3h2p) · Clinical UI: [Medical device UX design guide](https://glow.team/blog/medical-device-ux-design)*
