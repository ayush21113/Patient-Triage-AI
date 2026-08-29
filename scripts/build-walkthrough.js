// Builds docs/PatientTriage-ai_UI-Walkthrough.docx from the survey captures.
// Run: node scripts/build-walkthrough.js   (from the repository root)
//
// Dev tooling only. Not part of the deployed surface.

const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType, PageBreak,
  TableOfContents, PositionalTab, PositionalTabAlignment, PositionalTabLeader
} = require("docx");

const SHOTS = path.join(__dirname, "..", "docs", "ui-survey");
const OUT = path.join(__dirname, "..", "docs", "PatientTriage-ai_UI-Walkthrough.docx");

const INK = "16150F", INK2 = "55524A", INK3 = "8A8578";
const RULE = "CFCABA", ALARM = "9B1C11", ESC = "A3590A", ABSTAIN = "1F5673";
const SANS = "Segoe UI", MONO = "Consolas", SERIF = "Georgia";

const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "auto" };
const hair = c => ({ style: BorderStyle.SINGLE, size: 2, color: c });

const p = (text, o = {}) => new Paragraph({
  spacing: { after: o.after ?? 100, before: o.before ?? 0 },
  alignment: o.align,
  children: [new TextRun({
    text, font: o.font ?? SANS, size: o.size ?? 19,
    color: o.color ?? INK, bold: o.bold, italics: o.italics,
    allCaps: o.caps, characterSpacing: o.caps ? 24 : undefined
  })]
});

const h1 = t => new Paragraph({
  heading: HeadingLevel.HEADING_1, spacing: { before: 260, after: 130 },
  children: [new TextRun({ text: t, font: SERIF, size: 30, bold: true, color: INK })]
});
const h2 = t => new Paragraph({
  heading: HeadingLevel.HEADING_2, spacing: { before: 210, after: 90 },
  children: [new TextRun({ text: t, font: SERIF, size: 23, bold: true, color: INK })]
});
const micro = t => p(t, { caps: true, size: 15, color: INK2, font: SANS, after: 70 });

const rule = () => new Paragraph({
  spacing: { before: 60, after: 130 },
  border: { bottom: hair(RULE) }, children: []
});

function shot(file, caption) {
  const img = fs.readFileSync(path.join(SHOTS, file));
  return [
    new Paragraph({
      spacing: { before: 80, after: 50 },
      children: [new ImageRun({
        data: img, type: "png",
        transformation: { width: 624, height: 390 }
      })]
    }),
    p(caption, { size: 15, color: INK3, italics: true, font: SANS, after: 170 })
  ];
}

// two-column element table: what you are looking at
function elements(rows) {
  const cell = (text, opts = {}) => new TableCell({
    width: { size: opts.w, type: WidthType.DXA },
    margins: { top: 70, bottom: 70, left: 0, right: 130 },
    borders: { top: NO_BORDER, left: NO_BORDER, right: NO_BORDER, bottom: hair(RULE) },
    children: [p(text, {
      size: opts.head ? 15 : 18,
      caps: opts.head, bold: opts.head,
      color: opts.head ? INK : (opts.mono ? INK : INK2),
      font: opts.mono ? MONO : SANS, after: 0
    })]
  });
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2400, 6960],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [cell("Element", { w: 2400, head: true }),
                   cell("What it means", { w: 6960, head: true })]
      }),
      ...rows.map(([a, b]) => new TableRow({
        children: [cell(a, { w: 2400, mono: true }), cell(b, { w: 6960 })]
      }))
    ]
  });
}

const SCREENS = [
  {
    id: "S1", file: "S1-queue-1280x800-light.png",
    title: "S1 · The waiting queue",
    caption: "Normal mode, 20 patients, board time 14:00.",
    what: "The list of everyone currently waiting, ordered by how unsafe it is for them to keep waiting. This list is the product; everything else on screen explains it.",
    when: "Always visible. It occupies the left 62% of the board and never collapses.",
    rows: [
      ["Band chip", "Priority P1–P5, aligned to ESI levels 1–5. P1 is the only filled block in the whole interface, because it is the only state that means now. A ⊘ over a smaller band letter means the system is abstaining and has queued the patient at that provisional band."],
      ["ID", "Encounter identifier, generated on arrival. It carries no meaning outside this device — there is no name, no hospital number, no identity of any kind."],
      ["Age / sex", "A ~ prefix means the age was estimated rather than told to us."],
      ["Complaint", "The presenting complaint in the patient's own words, truncated to the column. The full text is in the inspector."],
      ["Meta line", "Under the complaint: why this row is in this state. Reassessment overdue, movement and its cause, the resolving question, the lock, a nurse override."],
      ["HR BP RR SpO₂ Temp", "The five front-door vitals. A small ▲ or ▼ before a value means it has drifted since the previous observation. —— means the value was attempted and could not be obtained, which is not the same as not recorded."],
      ["Wait", "Minutes since arrival. ▲ DUE appears when the band's reassessment interval has elapsed."],
      ["Confidence", "How sure the engine is, as a drawn mark plus a word. No score is ever shown without one."]
    ],
    does: "Tap a row to load it in the inspector. Tap the vitals to record a new observation. Drag a row, or Shift+↑ then Enter, to override — one gesture, no dialog, no justification field.",
    why: "A triage category assigned once at the door and never revisited is the hazard this product exists to remove. The order of this list is recomputed every minute."
  },
  {
    id: "S2a", file: "S2-inspector-empty-1280x800-light.png",
    title: "S2 · Inspector — board summary",
    caption: "Nothing selected. The inspector shows the state of the department.",
    what: "The right-hand panel. With no patient selected it answers the charge nurse's question rather than the triage nurse's: how is the department doing?",
    when: "Always visible. Shows this summary whenever no row is selected.",
    rows: [
      ["Waiting", "Total patients in the queue."],
      ["P1 … P5", "Census by band."],
      ["Abstaining", "How many patients the engine has declined to band. A rising number here means the department is losing information, not that the software is failing."],
      ["Mode", "NORMAL, SURGE, DEGRADED, or SURGE+DEGRADED."],
      ["Overrides this shift", "How often the nurse has disagreed with the engine, and when they last did."],
      ["Three longest waits", "By band, so a long wait at P4 is not confused with a long wait at P2."]
    ],
    does: "Read it. Selecting any row replaces it with that patient's derivation.",
    why: "Override rate is a calibration signal. A model that is never overridden is not being read; one that is always overridden is not being believed."
  },
  {
    id: "S2b", file: "S2-inspector-pt0004-1280x800-light.png",
    title: "S2 · Inspector — the derivation",
    caption: "PT-0004 selected: 82 F, brought in by her daughter, unremarkable vitals.",
    what: "The full reasoning behind one patient's band, top to bottom, as an argument rather than a dashboard.",
    when: "Whenever a row is selected.",
    rows: [
      ["Priority index", "The continuous 0–100 score behind the band."],
      ["Interval", "The uncertainty around it, drawn as a band with the point estimate marked. It is a band because that is what it is."],
      ["Confidence", "The state, and in words what it means for this patient."],
      ["Derivation", "Every layer, every rule evaluated, every contribution and its points. L0 hard rules, L1 physiology, L2 presentation, L3 time hazard and drift."],
      ["Missing inputs", "Stated as line items — NOT OBTAINED, interval widened — never silently absent."],
      ["Vital trend", "Direction of travel per parameter across the observation series."],
      ["Reassess due", "When this patient must be looked at again."],
      ["Engine / protocol", "Which engine version and which hospital rule set produced this. A reviewer must be able to say which rules were in force."]
    ],
    does: "Read the reasoning. Answer a resolving question if one is offered.",
    why: "This panel is why the product stays on the non-device side of the FDA CDS line: the clinician can independently review the basis of every recommendation, on the same screen, without leaving the board."
  },
  {
    id: "S2c", file: "S2-inspector-pt0007-1280x800-light.png",
    title: "S2 · Inspector — abstention",
    caption: "PT-0007: 61 M, \"bad stomach ache… goes up into my shoulder\". The system refuses to guess.",
    what: "What the inspector shows when the engine cannot separate two bands. This is the case the whole product is built around.",
    when: "Confidence UNRESOLVED or UNRESOLVABLE.",
    rows: [
      ["⊘ over P2", "No band assigned. The patient is queued at the higher of the two candidates while unresolved — abstention is never a reason to defer care."],
      ["Cannot separate P2 from P3", "Named explicitly. Not \"low confidence\"."],
      ["Tie broken upward", "With the cost ratio stated: undertriage costs eight times overtriage, so an ambiguous case goes up, and the interface says so."],
      ["One question would resolve this", "The single most informative question for this complaint, with Yes / No / Cannot assess. Answering re-scores immediately and writes an audit event."],
      ["Derivation", "As above. Here the atypical-ACS modifier is visible: age ≥55 with radiating pain, +7."]
    ],
    does: "Ask the question and answer it. Or override, if you already know better.",
    why: "A system that cannot say \"I don't know\" is not safe. Asking a nurse three questions in a crowded department is the same as asking none, so exactly one is offered — and only when it would actually change the answer."
  },
  {
    id: "S3", file: "S3-arrival-capture-1280x800-light.png",
    title: "S3 · Arrival capture",
    caption: "The whole capture on one sheet. No steps, no wizard, no pagination.",
    what: "How a patient enters the queue. Everything is visible at once because a nurse cannot hold a form's state in their head across screens.",
    when: "On + ARRIVAL.",
    rows: [
      ["Complaint", "Free text plus one-tap class chips. Optional — an absent complaint scores as unknown, base risk 8. Absence of a complaint is not absence of risk."],
      ["Age / sex", "Both optional. An estimated age is marked as estimated and widens the interval."],
      ["Vitals", "Five fields, each with its own UNOBTAINABLE toggle."],
      ["ACVPU", "The only mandatory field. It is a look, not a measurement, and it drives two hard rules."],
      ["Visual checks", "Pale, diaphoretic, drowsy, distressed, cyanosed, active bleeding, cannot speak in full sentences, airway compromise, seizure now."],
      ["Numeric keypad", "In the sheet, not the operating system's. A nurse standing at a tablet should not be fighting a soft keyboard."]
    ],
    does: "Capture and admit. Target is under 90 seconds; measured at 9 seconds for a full set.",
    why: "A patient with no name, no age, no history and no obtainable vitals still produces a complete, scoreable record. Unknown is the normal case, not a special mode."
  },
  {
    id: "S4", file: "S4-reassessment-1280x800-light.png",
    title: "S4 · Reassessment",
    caption: "Pre-filled with the previous values, so the nurse edits deltas rather than retyping.",
    what: "Recording a new set of observations on a patient already in the queue.",
    when: "On tapping a row's vitals, or from a reassessment prompt.",
    rows: [
      ["Pre-filled vitals", "The previous observation, ready to edit."],
      ["UNOBTAINABLE", "Per field, as at arrival."],
      ["ACVPU", "Re-confirmed each time."],
      ["Commit", "Appends a new observation. Drift is recomputed immediately and the row may move on the next tick."]
    ],
    does: "Edit what changed. Commit.",
    why: "Repeat vitals stop happening in a crowded department at precisely the moment they matter most. Every committed observation extends the series that drives the drift calculation."
  },
  {
    id: "S5", file: "S5-audit-drawer-1280x800-light.png",
    title: "S5 · Audit drawer",
    caption: "Append-only, newest first, hash chain verified.",
    what: "Every decision the system and the nurse have made this shift, in order, tamper-evident.",
    when: "On AUDIT, or the A key.",
    rows: [
      ["Time / encounter", "When, and to whom."],
      ["Event", "ARRIVAL · SCORE · RULE_FIRED · OVERRIDE · REASSESS · QUESTION_ANSWERED · MODE_CHANGE · EXPORT."],
      ["Engine said / nurse did", "Both, side by side. The engine's view is never erased by an override."],
      ["Basis", "The full derivation snapshot at that instant — what the nurse was actually looking at."],
      ["Chain", "Each record's SHA-256 covers its predecessor's. CHAIN VERIFIED means no record has been altered or removed."],
      ["Export JSON / CSV", "Readable by a clinician without this application."]
    ],
    does: "Read, verify, export.",
    why: "This is what makes the override safe, and what a reviewer six months later needs to reconstruct a decision. It is also the reason there is no confirmation dialog on the override: the log, not the dialog, is the control."
  },
  {
    id: "S6", file: "S6-fairness-1280x800-light.png",
    title: "S6 · Fairness monitor",
    caption: "The worst-served subgroup, named in a sentence.",
    what: "A running check on whether the board is treating comparable patients comparably.",
    when: "On FAIRNESS, or the F key.",
    rows: [
      ["Headline", "A specific sentence naming a subgroup and a multiple — not a score."],
      ["Assigned priority by subgroup", "Distribution by sex, age band and language."],
      ["Upgrade after triage", "The observable proxy for undertriage: how often each subgroup's acuity had to be raised after the initial assessment."],
      ["Tolerance and drift", "Each subgroup against its tolerance band over the shift."],
      ["Drill-through", "Every flagged subgroup reaches its encounters."]
    ],
    does: "Read the headline. Follow a flag to the patients behind it.",
    why: "Pain is described differently across cultures and genders, and triage systems absorb that difference as bias. This panel reports the worst-served group and never an average, because an aggregate fairness number is how bias hides."
  },
  {
    id: "S7", file: "S7-surge-1280x800-light.png",
    title: "S7 · Surge mode",
    caption: "Entered automatically on measured arrival rate. The trigger is stated with real numbers.",
    what: "What the board does when the department is overwhelmed.",
    when: "Automatically, when the trailing 15-minute arrival rate reaches three times baseline. Exit requires ten continuous minutes below twice baseline.",
    rows: [
      ["Mode strip", "States the mode, the measured rate, the multiple, and the time it started. Not a generic banner."],
      ["Top five", "The five most critical patients keep their full rows."],
      ["Collapsed rows", "Everything below rank five drops to a single line: band, ID, complaint, wait."],
      ["Inspector", "Switches to a five-patient stack rather than one patient's detail."],
      ["Reassessment", "P2 and P3 intervals compress by a third — crowding is exactly when reassessment lapses, so the system compensates in the opposite direction to the department."]
    ],
    does: "Nothing. The mode changes itself and logs the change with the measured values.",
    why: "When fifty people arrive at once, the question stops being who is next and becomes who are the five. The board answers the question the department actually has."
  },
  {
    id: "S8", file: "S8-degraded-1280x800-light.png",
    title: "S8 · Degraded mode",
    caption: "No monitors available. Scoring falls back to visual assessment and complaint.",
    what: "What happens when the instruments are gone.",
    when: "On LOSE MONITORS, or when vitals are marked unobtainable across the board.",
    rows: [
      ["Mode strip", "Names what has been lost and how many patients can no longer be discriminated, with the band pairs."],
      ["—— everywhere", "Instrument-derived vitals show as not obtained, in a lighter weight, so the absence reads as a state rather than as a broken render."],
      ["Wider intervals", "Evidence completeness falls, so more patients abstain — 19 of 20 here."],
      ["Queue still ordered", "Abstaining patients are ordered by provisional band. The board still answers who to see next."]
    ],
    does: "Keep working. Record what you can see.",
    why: "Degraded is not a stop condition. A district hospital that has run out of working monitors is exactly the department that needs the queue to keep moving, and the honest answer is a wider interval, not a refusal."
  },
  {
    id: "S9", file: "S9-surge-degraded-1280x800-light.png",
    title: "S9 · Surge and degraded together",
    caption: "Both modes at once — the worst case the board is designed for.",
    what: "The compound state: too many patients, and no instruments.",
    when: "Both conditions hold.",
    rows: [
      ["Both strips", "Each mode states its own trigger."],
      ["Top five retained", "Ranked on the reduced evidence available."],
      ["Widest intervals", "The system is at its least certain, and says so on every row."]
    ],
    does: "The same as either mode alone.",
    why: "The two failure modes are correlated in reality — the night the department floods is the night the equipment runs short. The board is specified to hold in the compound case, not only in each one separately."
  }
];

const LEGEND = [
  ["P1 – P5", "Priority band, aligned to ESI 1–5. P1 is the only filled chip."],
  ["⊘", "Abstention. The smaller letter beneath is the provisional band used for queue position."],
  ["●  ESTABLISHED", "The interval sits inside one band."],
  ["◑  PROBABLE", "Crosses one boundary, at least 65:35."],
  ["◐  UNRESOLVED", "Abstains. A resolving question is offered."],
  ["◐  UNRESOLVABLE", "Abstains. No question can resolve it — escalate for clinician review."],
  ["○  INSUFFICIENT", "Too little was obtained to discriminate."],
  ["▲ / ▼", "Drift direction on a vital, or rank movement on a row."],
  ["▲ DUE", "The band's reassessment interval has elapsed."],
  ["● LOCKED", "A hard rule fired. The model cannot recommend any wait for this patient."],
  ["‡ NURSE", "A nurse override is in force. The engine's band is shown struck through in the inspector."],
  ["——", "Attempted and could not be obtained. Distinct from not recorded."]
];

const DEMO = [
  ["1", "Board loads at t=0 with 20 synthetic patients.", "S1-queue-1280x800-light.png"],
  ["2", "PT-0004 — geriatric atypical presentation reaching P2 on unremarkable vitals.", "S2-inspector-pt0004-1280x800-light.png"],
  ["3", "PT-0011 — paediatric age-band scoring; the same numbers score differently in an adult.", null],
  ["4", "PT-0007 — abstention, and the single question that would resolve it.", "S2-inspector-pt0007-1280x800-light.png"],
  ["5", "60× for ~45 simulated minutes — PT-0002 rises on measured drift.", null],
  ["6", "Drag PT-0020 to the top, then open Audit — one gesture, complete record.", "S5-audit-drawer-1280x800-light.png"],
  ["7", "SURGE ×3 — disaster mode, top five retained, trigger stated.", "S7-surge-1280x800-light.png"],
  ["8", "LOSE MONITORS — degraded mode, queue keeps ordering.", "S8-degraded-1280x800-light.png"],
  ["9", "Fairness — the worst-served subgroup named in a sentence.", "S6-fairness-1280x800-light.png"],
  ["10", "Disconnect the network and reload. It still works.", null]
];

// ------------------------------------------------------------------ assemble
const body = [];

body.push(new Paragraph({ spacing: { before: 1400, after: 0 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: INK } }, children: [] }));
body.push(p("PatientTriage.ai", { font: SERIF, size: 62, bold: true, before: 260, after: 90 }));
body.push(p("Screen-by-screen walkthrough of the working prototype", { font: SERIF, size: 26, italics: true, color: INK2, after: 460 }));
body.push(p("Team Mayhem · Ayush Kumar (lead) · Md Waqar Moid · Harshit Agarwal · IIT Kanpur", { size: 19, color: INK2 }));
body.push(p("Accenture Innovation Challenge 2026 · Problem Track 2 · Round 2", { size: 19, color: INK2, after: 260 }));
body.push(p("Every screenshot in this document was captured from the running build and verified free of overlapping or clipped text by an automated layout check.", { size: 18, color: INK2, italics: true, after: 130 }));
body.push(p("Synthetic data only. Every encounter shown is fabricated. Not for clinical use.", { size: 18, color: ALARM, bold: true }));
body.push(new Paragraph({ spacing: { before: 200 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: INK } }, children: [] }));
body.push(new Paragraph({ children: [new PageBreak()] }));

body.push(h1("Contents"));
body.push(new TableOfContents("Contents", { hyperlink: true, headingStyleRange: "1-2" }));
body.push(new Paragraph({ children: [new PageBreak()] }));

body.push(h1("How to read this document"));
body.push(p("The prototype is one page. There is no navigation and no router — a nurse who has to navigate has already lost the two minutes they had. Everything below is a region of that single board, or an overlay on top of it."));
body.push(p("Each section shows the screen, says what it is and when it appears, lists every element and what it means, says what the user does there, and gives the one clinical reason it exists at all."));
body.push(p("Where this document and the running build disagree, the build is right and this document is the defect.", { italics: true, color: INK2 }));
body.push(new Paragraph({ children: [new PageBreak()] }));

for (const s of SCREENS) {
  body.push(h1(s.title));
  body.push(...shot(s.file, s.caption));
  body.push(micro("What this is"));
  body.push(p(s.what));
  body.push(micro("When it appears"));
  body.push(p(s.when));
  body.push(micro("What you are looking at"));
  body.push(elements(s.rows));
  body.push(micro("What the user does here"), p(s.does));
  body.push(micro("Why it exists"), p(s.why, { italics: true, color: INK2 }));
  body.push(new Paragraph({ children: [new PageBreak()] }));
}

body.push(h1("Reading a queue row"));
body.push(p("One row is one waiting patient. It is designed to be read standing, at arm's length, by someone being interrupted — so every state carries three independent signals: a colour, a word, and a drawn mark. Colour is never the only carrier, because colour-vision deficiency is unscreened in a working department."));
body.push(micro("Marks and tokens"));
body.push(elements(LEGEND));
body.push(p("The confidence marks are drawn as inline SVG rather than typed as characters. IBM Plex contains none of these glyphs, so a text character would resolve to whatever each device happened to substitute — and a safety carrier that changes shape per device is not a carrier.", { before: 130, italics: true, color: INK2 }));
body.push(new Paragraph({ children: [new PageBreak()] }));

body.push(h1("The four modes"));
body.push(elements([
  ["NORMAL", "Standing state. Full rows, single-patient inspector."],
  ["SURGE", "Trailing 15-minute arrival rate ≥ 3× baseline. Top five retained in full, everything else collapses, reassessment intervals compress by a third. Exits after ten continuous minutes below 2×."],
  ["DEGRADED", "Instruments unavailable. Scoring falls back to visual assessment and complaint, intervals widen, more patients abstain, the queue keeps ordering."],
  ["SURGE + DEGRADED", "Both. The compound case the board is specified to hold in — the night the department floods is the night the equipment runs short."]
]));
body.push(p("Every mode change writes an audit record carrying the measured values that triggered it, not a generic label.", { before: 130, italics: true, color: INK2 }));
body.push(new Paragraph({ children: [new PageBreak()] }));

body.push(h1("The five-minute demo"));
body.push(p("This is the path the prototype is built to support, in order. Three timed rehearsals ran at 59.8, 59.9 and 60.0 seconds."));
for (const [n, text, file] of DEMO) {
  body.push(p(`${n}.  ${text}`, { before: 130, after: file ? 70 : 100 }));
  if (file) body.push(...shot(file, ""));
}
body.push(p("Step 10 is the one that ends the argument. Everything before it is a claim about software; step 10 is a claim about a district hospital at two in the morning, and it is the one that decides whether this deploys.", { italics: true, color: INK2, before: 130 }));

const doc = new Document({
  creator: "Team Mayhem",
  title: "PatientTriage.ai — UI walkthrough",
  styles: { default: { document: { run: { font: SANS, size: 19, color: INK } } } },
  sections: [{
    properties: { page: { margin: { top: 1000, bottom: 1000, left: 1080, right: 1080 } } },
    children: body
  }]
});

Packer.toBuffer(doc).then(b => { fs.writeFileSync(OUT, b); console.log("wrote", OUT, b.length, "bytes"); });
