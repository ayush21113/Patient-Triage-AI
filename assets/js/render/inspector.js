import { el } from "../util/dom.js";
import { confidenceMark } from "../util/glyph.js";
import {
 confidenceBand,
 bandDistributionDonut,
 derivationContributionBar,
 sparkline
} from "./charts.js";
import { applyOverrideOrder } from "./override.js";

const MILLISECONDS_PER_MINUTE = 60_000;
const ageUnits = {
 days: "d",
 months: "mo",
 years: "y"
};
const parameterLabels = {
 rr: ["RR", "/min"],
 spo2: ["SpO₂", "%"],
 sbp: ["SBP", "mmHg"],
 hr: ["HR", "bpm"],
 onOxygen: ["Supplemental O₂", ""],
 acvpu: ["ACVPU", ""],
 temp_c: ["Temp", "°C"]
};
const fieldLabels = {
 rr: "RR",
 spo2: "SpO₂",
 spo2_on_oxygen: "Supplemental O₂",
 sbp: "SBP",
 hr: "HR",
 temp_c: "Temp"
};

function number(value, digits = 1) {
 return Number(value.toFixed(digits)).toString();
}

function displayDriftDetail(value) {
 return value?.replace(/\d+\.\d{2,}/g, source =>
  String(Math.round(Number(source) * 10) / 10)
 );
}

function clockTime(value) {
 return new Intl.DateTimeFormat("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Kolkata"
 }).format(value);
}

function renderOrganBar() {
  const bar = el("div", { class: "organ-systems-bar" });
  const item = el("div", { class: "organ-pill organ-pill-active" });
  item.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> <span>Vitals Overview</span>`;
  bar.append(item);
  return bar;
}

function renderVitalsInfographic(encounter) {
  const obs = encounter.observations.at(-1) ?? {};
  const grid = el("div", { class: "vitals-infographic-grid" });

  const sbp = obs.sbp ?? 120;
  const hr = obs.hr ?? 72;
  const spo2 = obs.spo2 ?? 98;
  const temp = obs.temp_c ?? 36.6;

  const vitals = [
    {
      title: "Blood Pressure",
      val: obs.sbp ? `${obs.sbp}/${obs.sbp > 110 ? obs.sbp - 40 : 70}` : "118/75",
      unit: "mmHg",
      status: sbp > 140 ? "High" : sbp < 90 ? "Low" : "Normal",
      badgeClass: sbp > 140 || sbp < 90 ? "badge-warn" : "badge-good",
      iconBg: "#FEF2F2",
      iconColor: "#EF4444",
      iconSvg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
    },
    {
      title: "Heart Rate",
      val: `${hr}`,
      unit: "bpm",
      status: hr > 100 ? "Elevated" : hr < 60 ? "Bradycardia" : "Normal",
      badgeClass: hr > 100 || hr < 60 ? "badge-warn" : "badge-good",
      iconBg: "#E6F5F5",
      iconColor: "#269898",
      iconSvg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`
    },
    {
      title: "Respiratory Rate",
      val: obs.rr ? `${obs.rr}` : "16",
      unit: "/min",
      status: (obs.rr ?? 16) > 20 ? "Tachypnea" : (obs.rr ?? 16) < 10 ? "Low" : "Normal",
      badgeClass: (obs.rr ?? 16) > 20 || (obs.rr ?? 16) < 10 ? "badge-warn" : "badge-good",
      iconBg: "#F0F9FF",
      iconColor: "#0284C7",
      iconSvg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18M6 9l6-6 6 6M6 15l6 6 6-6"/></svg>`
    },
    {
      title: "SpO₂ Saturation",
      val: `${spo2}%`,
      unit: obs.onOxygen ? "Supp. O₂" : "Room Air",
      status: spo2 < 95 ? "Hypoxic" : "Optimal",
      badgeClass: spo2 < 95 ? "badge-warn" : "badge-good",
      iconBg: "#EFF6FF",
      iconColor: "#3B82F6",
      iconSvg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>`
    },
    {
      title: "Body Temperature",
      val: `${temp}`,
      unit: "°C",
      status: temp > 37.8 ? "Fever" : "Afebrile",
      badgeClass: temp > 37.8 ? "badge-warn" : "badge-good",
      iconBg: "#FFFBEB",
      iconColor: "#F59E0B",
      iconSvg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>`
    }
  ];

  for (const v of vitals) {
    const card = el("div", { class: "infographic-vital-tile" });
    card.innerHTML = `
      <div class="vital-tile-icon" style="background: ${v.iconBg}; color: ${v.iconColor}">
        ${v.iconSvg}
      </div>
      <div class="vital-tile-content">
        <div class="vital-tile-header">
          <span class="vital-tile-title">${v.title}</span>
          <span class="vital-tile-badge ${v.badgeClass}">${v.status}</span>
        </div>
        <div class="vital-tile-value numeric">${v.val} <span class="vital-tile-unit">${v.unit}</span></div>
      </div>
    `;
    grid.append(card);
  }
  return grid;
}

function renderBodySilhouette(encounter = {}) {
  const isFemale = (encounter.sex ?? "").toUpperCase() === "F";
  const complaint = (encounter.complaint_text ?? "").toLowerCase();

  const dots = [];
  
  if (complaint.includes("head") || complaint.includes("dizzy") || complaint.includes("headache") || complaint.includes("confus") || complaint.includes("syncope")) {
    dots.push({ cx: 70, cy: 32, label: "Head / CNS", color: "#EF4444" });
  }
  if (complaint.includes("chest") || complaint.includes("breath") || complaint.includes("palpitat") || complaint.includes("sob") || complaint.includes("cough")) {
    dots.push({ cx: 64, cy: 78, label: "Thoracic / Cardiac", color: "#EF4444" });
  }
  if (complaint.includes("stomach") || complaint.includes("abdom") || complaint.includes("nausea") || complaint.includes("vomit") || complaint.includes("flank")) {
    dots.push({ cx: 70, cy: 120, label: "Abdominal / Gastro", color: "#F59E0B" });
  }
  if (complaint.includes("ankle") || complaint.includes("foot") || complaint.includes("leg") || complaint.includes("limb") || complaint.includes("twist") || complaint.includes("fractur")) {
    dots.push({ cx: 82, cy: 230, label: "Lower Extremity", color: "#269898" });
  }
  if (complaint.includes("arm") || complaint.includes("shoulder") || complaint.includes("wrist") || complaint.includes("hand")) {
    dots.push({ cx: 38, cy: 110, label: "Upper Extremity", color: "#269898" });
  }

  if (dots.length === 0) {
    dots.push(
      { cx: 70, cy: 32, label: "Cranial", color: "#269898" },
      { cx: 70, cy: 78, label: "Thoracic", color: "#EF4444" },
      { cx: 62, cy: 125, label: "Abdominal", color: "#F59E0B" },
      { cx: 82, cy: 230, label: "Lower Limb", color: "#269898" }
    );
  }

  const malePath = `M70,14 C61,14 54,21 54,30 C54,37 58,43 64,46 C46,52 36,66 32,88 C28,110 24,140 20,165 C18,178 23,178 26,165 C30,148 35,112 37,98 L37,175 L50,175 L50,270 C50,278 58,278 58,270 L60,185 L80,185 L82,270 C82,278 90,278 90,270 L90,175 L103,175 L103,98 C105,112 110,148 114,165 C117,178 122,178 120,165 C116,140 112,110 108,88 C104,66 94,52 76,46 C82,43 86,37 86,30 C86,21 79,14 70,14 Z`;

  const femalePath = `M70,14 C62,14 55,21 55,30 C55,37 59,43 64,46 C50,52 42,66 40,86 C38,102 36,116 38,126 C38,136 34,148 24,166 C21,178 26,178 28,166 C34,152 42,138 42,126 C42,116 43,100 44,92 L44,175 L52,175 L52,270 C52,278 60,278 60,270 L62,185 L78,185 L80,270 C80,278 88,278 88,270 L88,175 L96,175 L96,92 C97,100 98,116 98,126 C98,138 106,152 112,166 C114,178 119,178 116,166 C106,148 100,136 102,126 C104,116 102,102 100,86 C98,66 90,52 76,46 C81,43 85,37 85,30 C85,21 78,14 70,14 Z`;

  const dotsSvgHtml = dots.map(d => `
    <g class="symptom-dot-group">
      <circle cx="${d.cx}" cy="${d.cy}" r="10" stroke="${d.color}" stroke-width="1.5" fill="none" class="body-ring-anim" opacity="0.6"/>
      <circle cx="${d.cx}" cy="${d.cy}" r="4.5" fill="${d.color}" class="body-dot-anim"/>
    </g>
  `).join("");

  const container = el("div", { class: "body-silhouette-card" });
  container.innerHTML = `
    <div class="silhouette-header-bar">
      <span class="gender-pill">${isFemale ? "Female" : "Male"}</span>
      <span class="symptom-pill">${encounter.complaint_text ?? "General Triage"}</span>
    </div>
    <div class="silhouette-box">
      <svg viewBox="0 0 140 285" class="human-body-svg">
        <path fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1.5" d="${isFemale ? femalePath : malePath}"/>
        ${dotsSvgHtml}
      </svg>
    </div>
  `;
  return container;
}

function heading(value) {
 const node = el("h3", { class: "inspector-heading" });
 node.textContent = value;
 return node;
}

function derivationLine(label, detail, contribution = "") {
 const line = el("div", { class: "derivation-line" });
 const labelNode = el("span", { class: "derivation-label" });
 const detailNode = el("span", { class: "derivation-detail" });
 const contributionNode = el("span", {
  class: "derivation-contribution numeric"
 });
 labelNode.textContent = label;
 detailNode.textContent = detail;
 contributionNode.textContent = contribution;
 line.append(labelNode, detailNode, contributionNode);
 return line;
}

export function renderBoardSummaryCard(container, board = [], now, viewState = {}) {
  const safeBoard = board ?? [];
  const elapsed = at => at ? Math.floor((now - at) / MILLISECONDS_PER_MINUTE) : 0;
  const counts = Object.fromEntries(
    ["P1", "P2", "P3", "P4", "P5"].map(band => [band, 0])
  );
  const degraded = (viewState?.mode ?? "NORMAL").includes("DEGRADED");
  const boundaries = {};
  let abstaining = 0;
  for (const { assessment } of safeBoard) {
    if (!assessment) continue;
    const bandKey = assessment.provisionalBand ?? "P5";
    if (counts[bandKey] !== undefined) counts[bandKey] += 1;
    if (assessment.band !== null) continue;
    abstaining += 1;
    if (degraded && assessment.candidateBands) {
      const bands = assessment.candidateBands.join(" / ");
      boundaries[bands] = (boundaries[bands] ?? 0) + 1;
    }
  }
  const waits = safeBoard.map(({ encounter, assessment }) => ({
    id: encounter?.encounter_id ?? "?",
    band: assessment?.band ?? assessment?.provisionalBand ?? "P5",
    minutes: elapsed(encounter?.arrived_at)
  })).sort((left, right) => right.minutes - left.minutes);
  const overrides = Object.values(viewState?.overrides ?? {});
  const lastOverride = overrides.sort((left, right) => right.at - left.at)[0];
  const title = el("h2", { id: "board-summary-heading", class: "summary-card-title" });
  title.textContent = "Board summary";
  const summary = el("dl", { class: "board-summary" });
  const items = [
    ["Waiting", safeBoard.length],
    ...Object.entries(counts),
    ["Abstaining", abstaining],
    ["Mode", viewState?.mode ?? "NORMAL"],
    ["Overrides this shift", overrides.length],
    ["Last override", lastOverride
      ? `${lastOverride.encounterId} · ${elapsed(lastOverride.at)} min ago`
      : "None this shift"],
    ["Three longest waits · by band", ""],
    ...waits.slice(0, 3).map(({ band, id, minutes }) => [
      band,
      `${id} · ${minutes} min`
    ]),
    ...Object.keys(boundaries).length
      ? [["Cannot discriminate · by boundary", ""],
        ...Object.entries(boundaries)]
      : []
  ];
  for (const [term, value] of items) {
    const dt = el("dt");
    const dd = el("dd", { class: "numeric" });
    dt.textContent = term;
    dd.textContent = value;
    summary.append(dt, dd);
  }
  const summaryWrapper = el("div", { class: "board-summary-inner" });
  summaryWrapper.append(
    bandDistributionDonut(safeBoard, viewState?.overrides ?? {}),
    summary
  );
  container.replaceChildren(
    title,
    summaryWrapper
  );
}

function surgeSummary(inspector, board) {
 const title = el("h2", { id: "inspector-heading" });
 title.textContent = "Surge watch · top five";
 const stack = el("ol", { class: "surge-stack" });
 for (const { encounter, assessment } of board.slice(0, 5)) {
  const item = el("li");
  const band = assessment.band ?? assessment.provisionalBand;
  const headingNode = el("strong", { class: "numeric" });
  headingNode.textContent = `${band} · ${encounter.encounter_id}`;
  const complaint = el("span", { "data-ellipsis": "ok" });
  complaint.textContent = encounter.complaint_text ??
   "Complaint not obtained";
  const confidence = el("span");
  confidence.append(
   confidenceMark(assessment.confidence),
   document.createTextNode(` ${assessment.confidence}`)
  );
  item.append(headingNode, complaint, confidence);
  stack.append(item);
 }
 inspector.replaceChildren(title, stack);
}

function confidenceCopy(assessment) {
 if (assessment.confidence === "ESTABLISHED") {
  return `Interval sits inside ${assessment.provisionalBand}.`;
 }
 if (assessment.confidence === "PROBABLE") {
  return `Interval crosses ${assessment.candidateBands.join("/")}; the higher band remains probable.`;
 }
 if (assessment.confidence === "UNRESOLVED") {
  return `Cannot separate ${assessment.candidateBands.join(" from ")}.`;
 }
 if (assessment.confidence === "UNRESOLVABLE") {
  return `Cannot separate ${assessment.candidateBands.join(" from ")}; questioning will not resolve it.`;
 }
 return `Evidence cannot discriminate ${assessment.candidateBands.join(" from ")}.`;
}

function renderQuestion(assessment, onAnswer) {
 if (assessment.confidence !== "UNRESOLVED") return null;
 const section = el("section", { class: "inspector-section question-section" });
 section.append(heading("One question would resolve this"));
 const question = el("blockquote");
 question.textContent = `“${assessment.resolvingQuestion}”`;
 const actions = el("div", { class: "question-actions" });
 for (const [label, value] of [
  ["Yes", "yes"],
  ["No", "no"],
  ["Cannot assess", "cannot_assess"]
 ]) {
  const button = el("button", { type: "button" });
  button.textContent = label;
  if (onAnswer) button.addEventListener("click", () => onAnswer(value));
  actions.append(button);
 }
 section.append(question, actions);
 return section;
}

function renderDerivation(assessment, protocol) {
  const section = el("section", { class: "inspector-section derivation" });
  section.append(heading("Derivation Breakdown"));
  section.append(derivationContributionBar(assessment, protocol));
  
  if (assessment.rulesFired.length === 0) {
    section.append(derivationLine("L0 Hard rules", "None fired", "—"));
  } else {
    for (const rule of assessment.rulesFired) {
      section.append(derivationLine("L0 Hard rule", `${rule.ruleId} · ${rule.label}`, rule.action));
    }
  }

  const physiology = assessment.derivation.physiology;
  section.append(derivationLine("L1 Physiology", "Parameter sum", `+${number(physiology.score)}`));

  const presentation = assessment.derivation.presentation;
  section.append(derivationLine("L2 Presentation", presentation.class ?? "Standard", `+${number(presentation.score)}`));

  const hazard = assessment.derivation.hazard;
  section.append(derivationLine("L3 Hazard", `${number(hazard.waitedMinutes)}m wait + drift`, `+${number(hazard.score, 1)}`));

  return section;
}

function renderTrends(encounter) {
  const section = el("section", { class: "inspector-section vital-trends" });
  const observations = encounter.observations;
  const span = Math.round((observations.at(-1).observed_at - observations[0].observed_at) / MILLISECONDS_PER_MINUTE);
  section.append(heading(`Vital Trend (${span} min)`));
  const trends = [
    ["HR", "hr", "bpm"],
    ["SBP", "sbp", "mmHg"],
    ["RR", "rr", "/min"],
    ["SpO₂", "spo2", "%"],
    ["Temp", "temp_c", "°C"]
  ];
  for (const [label, field, unit] of trends) {
    const values = observations.filter(o => o[field] !== null && !o.unobtainable.includes(field)).map(o => o[field]);
    if (values.length === 0) continue;
    const direction = values.at(-1) === values[0] ? "—" : values.at(-1) > values[0] ? "↑" : "↓";
    const line = derivationLine(label, `${values[0]}${unit} → ${values.at(-1)}${unit} (${direction})`, `${values.length} obs`);
    const chart = sparkline(values);
    if (chart) line.querySelector(".derivation-detail")?.append(chart);
    section.append(line);
  }
  return section;
}

function renderOverride(override) {
  if (!override) return null;
  const section = el("section", { class: "inspector-section override-summary" });
  section.append(heading("Nurse override"));
  const engine = el("p");
  const engineBand = el("s");
  engineBand.textContent = override.engineBand;
  engine.append("RECOMMENDED ", engineBand, ` ‡ ASSIGNED ${override.nurseBand}`);
  section.append(engine);
  return section;
}

export function renderInspector(
  inspector,
  board,
  now,
  viewState,
  protocol,
  { onQuestionAnswer, onOpenReassess } = {}
) {
  if ((viewState.mode ?? "NORMAL").includes("SURGE")) {
    surgeSummary(inspector, applyOverrideOrder(board, viewState.overrides));
    return;
  }
  const selected = board.find(({ encounter }) => encounter.encounter_id === viewState.selectedEncounterId);
  if (!selected) {
    const prompt = el("div", { class: "inspector-prompt-card" });
    prompt.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 8px; color: var(--accent);"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg> <span>Select any patient from the waiting queue above to inspect their Health Overview Infographics.</span>`;
    inspector.replaceChildren(prompt);
    return;
  }

  const { encounter, assessment } = selected;
  const override = viewState.overrides?.[encounter.encounter_id];
  const title = el("h2", { id: "inspector-heading" });
  const age = encounter.age_value === null ? "?" : `${encounter.age_estimated ? "~" : ""}${encounter.age_value} ${ageUnits[encounter.age_unit]}`;
  title.textContent = `${encounter.encounter_id} · ${age} ${[null, "unknown"].includes(encounter.sex) ? "?" : encounter.sex}`;
  const complaint = el("p", { class: "inspector-complaint" });
  complaint.textContent = encounter.complaint_text ?? "Complaint not obtained";
  const arrival = el("p", { class: "inspector-meta numeric" });
  arrival.textContent = `${encounter.arrival_mode.replace("_", "-")} · arrived ${clockTime(encounter.arrived_at)} · waited ${Math.floor((now - encounter.arrived_at) / MILLISECONDS_PER_MINUTE)} min`;

  const index = el("section", { class: "index-summary" });
  const indexLabel = el("span", { class: "micro-label" });
  indexLabel.textContent = "Priority Index";
  const indexValue = el("strong", { class: "priority-index numeric" });
  indexValue.textContent = number(assessment.priorityIndex);
  const interval = el("div", {
    class: "confidence-track numeric",
    "data-low": number(assessment.interval[0]),
    "data-point": number(assessment.priorityIndex),
    "data-high": number(assessment.interval[1])
  });
  interval.append(confidenceBand(assessment.priorityIndex, assessment.interval, protocol.bandThresholds));
  index.append(indexLabel, indexValue, interval);

  const confidence = el("section", { class: "confidence-statement" });
  const confidenceTitle = el("p", {
    class: `confidence-title confidence-${assessment.confidence.toLowerCase()}`
  });
  confidenceTitle.append(
    document.createTextNode("CONFIDENCE "),
    confidenceMark(assessment.confidence),
    document.createTextNode(` ${assessment.confidence}`)
  );
  confidence.append(confidenceTitle);

  const question = renderQuestion(assessment, onQuestionAnswer && (answer => onQuestionAnswer(selected, answer)));
  const overrideSummary = renderOverride(override);
  const reassessment = el("section", { class: "inspector-section reassessment numeric" });
  const dueDelta = Math.ceil((assessment.reassessDueAt - now) / MILLISECONDS_PER_MINUTE);
  reassessment.append(heading("Reassess Due"));
  reassessment.append(`${clockTime(assessment.reassessDueAt)} · ${dueDelta >= 0 ? `in ${dueDelta} min` : `${Math.abs(dueDelta)} min overdue`}`);

  const footer = el("p", { class: "inspector-footer numeric" });
  footer.textContent = `ENGINE ${assessment.engineVersion} · PROTOCOL ${assessment.protocolVersion} · COMPUTED ${clockTime(assessment.computedAt)}`;

  const headerCard = el("div", { class: "inspector-header-card" });
  headerCard.append(title, complaint, arrival);

  const organBar = renderOrganBar();

  const mainLayout = el("div", { class: "health-overview-2col-grid" });

  const leftCard = el("div", { class: "vitals-panel-card" });
  const leftHeadingRow = el("div", { class: "vitals-header-row" });
  const leftHeading = el("h3", { class: "infographic-section-title" });
  leftHeading.textContent = "Physiological Vitals & Body Map";

  const updateVitalsBtn = el("button", { type: "button", class: "update-vitals-btn" });
  updateVitalsBtn.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: middle; margin-right: 4px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Update Vitals`;
  if (onOpenReassess) {
    updateVitalsBtn.addEventListener("click", () => onOpenReassess(encounter.encounter_id));
  }
  leftHeadingRow.append(leftHeading, updateVitalsBtn);

  leftCard.append(
    leftHeadingRow,
    renderBodySilhouette(encounter),
    renderVitalsInfographic(encounter),
    reassessment
  );

  const rightCard = el("div", { class: "clinical-panel-card" });
  const rightHeading = el("h3", { class: "infographic-section-title" });
  rightHeading.textContent = "Clinical Decision Support & Score Derivation";
  rightCard.append(
    rightHeading,
    index,
    confidence,
    ...(overrideSummary ? [overrideSummary] : []),
    ...(question ? [question] : []),
    renderDerivation(assessment, protocol)
  );

  mainLayout.append(leftCard, rightCard);

  inspector.replaceChildren(headerCard, organBar, mainLayout, footer);
}
