import { el } from "../util/dom.js";
import { confidenceBand, sparkline } from "./charts.js";
import { applyOverrideOrder } from "./override.js";

const MILLISECONDS_PER_MINUTE = 60_000;
const confidenceGlyphs = {
  ESTABLISHED: "●",
  PROBABLE: "◑",
  UNRESOLVED: "◐",
  UNRESOLVABLE: "◐",
  INSUFFICIENT: "○"
};
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

function boardSummary(inspector, board, now, viewState) {
  const counts = Object.fromEntries(
    ["P1", "P2", "P3", "P4", "P5"].map(band => [band, 0])
  );
  for (const { assessment } of board) {
    counts[assessment.provisionalBand] += 1;
  }
  const oldest = board.map(({ encounter }) => ({
    id: encounter.encounter_id,
    minutes: Math.floor((now - encounter.observations.at(-1).observed_at) /
      MILLISECONDS_PER_MINUTE)
  })).sort((left, right) => right.minutes - left.minutes)[0];
  const title = el("h2", { id: "inspector-heading" });
  title.textContent = "Board summary";
  const summary = el("dl", { class: "board-summary" });
  const items = [
    ["Waiting", board.length],
    ...Object.entries(counts),
    ["Oldest un-reassessed", `${oldest.id} · ${oldest.minutes} min`],
    ["Mode", viewState.mode ?? "NORMAL"],
    ["Overrides this shift", Object.keys(viewState.overrides ?? {}).length]
  ];
  for (const [term, value] of items) {
    const dt = el("dt");
    const dd = el("dd", { class: "numeric" });
    dt.textContent = term;
    dd.textContent = value;
    summary.append(dt, dd);
  }
  inspector.replaceChildren(title, summary);
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
    const complaint = el("span");
    complaint.textContent = encounter.complaint_text ??
      "Complaint not obtained";
    const confidence = el("span");
    confidence.textContent = `${confidenceGlyphs[assessment.confidence]} ${
      assessment.confidence
    }`;
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

function renderQuestion(assessment) {
  if (assessment.confidence !== "UNRESOLVED") return null;
  const section = el("section", { class: "inspector-section question-section" });
  section.append(heading("One question would resolve this"));
  const question = el("blockquote");
  question.textContent = `“${assessment.resolvingQuestion}”`;
  const actions = el("div", { class: "question-actions" });
  for (const value of ["Yes", "No", "Cannot assess"]) {
    const button = el("button", { type: "button" });
    button.textContent = value;
    actions.append(button);
  }
  section.append(question, actions);
  return section;
}

function renderDerivation(assessment, protocol) {
  const section = el("section", { class: "inspector-section derivation" });
  section.append(heading("Derivation"));
  if (assessment.rulesFired.length === 0) {
    section.append(derivationLine("L0 Hard rules", "None fired", "—"));
  } else {
    for (const rule of assessment.rulesFired) {
      section.append(derivationLine(
        "L0 Hard rule",
        `${rule.ruleId} · ${rule.label}`,
        rule.action
      ));
    }
  }

  const physiology = assessment.derivation.physiology;
  section.append(derivationLine(
    "L1 Physiology",
    "Age-banded parameter sum",
    `+${number(physiology.score)}`
  ));
  for (const item of physiology.perParameter) {
    const [label, unit] = parameterLabels[item.parameter];
    const value = item.parameter === "onOxygen"
      ? item.value ? "oxygen" : "air"
      : `${item.value}${unit}`;
    section.append(derivationLine(label, value, `+${item.score}`));
  }
  for (const field of physiology.missing) {
    section.append(derivationLine(
      fieldLabels[field],
      "NOT OBTAINED — interval widened"
    ));
  }

  const presentation = assessment.derivation.presentation;
  section.append(derivationLine(
    "L2 Presentation",
    `${presentation.class} · base ${presentation.base}`,
    `+${number(presentation.score)}`
  ));
  for (const modifier of presentation.modifiers) {
    section.append(derivationLine(
      "Modifier",
      modifier.label,
      `+${modifier.points}`
    ));
  }
  if (presentation.clamped) {
    section.append(derivationLine(
      "Clamp",
      `All modifiers retained; layer capped at ${protocol.presentation.maxScore}`
    ));
  }

  const hazard = assessment.derivation.hazard;
  const rate = hazard.waitedMinutes === 0
    ? 0
    : hazard.timeHazard / hazard.waitedMinutes;
  section.append(derivationLine(
    "L3 Hazard",
    `Layer total after clamp`,
    `+${number(hazard.score, 2)}`
  ));
  section.append(derivationLine(
    "Wait",
    `${number(hazard.waitedMinutes)} min × ${number(rate, 2)} rate`,
    `+${number(hazard.timeHazard, 2)}`
  ));
  section.append(derivationLine(
    "Drift",
    displayDriftDetail(hazard.driftDetail) ?? "No measured drift",
    `+${number(hazard.drift, 2)}`
  ));

  const weights = protocol.combination.layerWeights;
  const maximum = Object.values(weights).reduce((sum, weight) =>
    sum + weight * protocol.combination.layerMax, 0
  );
  section.append(derivationLine(
    "Priority Index",
    `100 × (${weights.physiology}×L1 + ${weights.presentation}×L2 + ${weights.hazard}×L3) ÷ ${maximum}`,
    number(assessment.priorityIndex)
  ));
  section.append(derivationLine(
    "Uncertainty",
    `E ${number(assessment.evidenceCompleteness, 2)} · ${
      number(assessment.priorityIndex)
    } −${number(assessment.priorityIndex - assessment.interval[0])} / +${
      number(assessment.interval[1] - assessment.priorityIndex)
    }`,
    `[${number(assessment.interval[0])}, ${
      number(assessment.interval[1])
    }]`
  ));
  return section;
}

function renderTrends(encounter) {
  const section = el("section", { class: "inspector-section vital-trends" });
  const observations = encounter.observations;
  const span = Math.round((
    observations.at(-1).observed_at - observations[0].observed_at
  ) / MILLISECONDS_PER_MINUTE);
  section.append(heading(`Vital trend (${span} min)`));
  const trends = [
    ["HR", "hr", "bpm"],
    ["SBP", "sbp", "mmHg"],
    ["RR", "rr", "/min"],
    ["SpO₂", "spo2", "%"],
    ["Temp", "temp_c", "°C"]
  ];
  for (const [label, field, unit] of trends) {
    const values = observations.filter(observation =>
      observation[field] !== null &&
      !observation.unobtainable.includes(field)
    ).map(observation => observation[field]);
    if (values.length === 0) {
      section.append(derivationLine(
        label,
        "NOT OBTAINED — interval widened"
      ));
      continue;
    }
    const direction = values.at(-1) === values[0]
      ? "— steady"
      : values.at(-1) > values[0]
        ? "↑ rising"
        : "↓ falling";
    const line = derivationLine(
      label,
      `${values[0]}${unit} → ${values.at(-1)}${unit} · ${direction}`,
      `${values.length} reading${values.length === 1 ? "" : "s"}`
    );
    const chart = sparkline(values);
    if (chart) line.querySelector(".derivation-detail").append(chart);
    section.append(line);
  }
  return section;
}

function renderOverride(override) {
  if (!override) return null;
  const section = el("section", {
    class: "inspector-section override-summary"
  });
  const engine = el("p");
  const engineBand = el("s");
  engineBand.textContent = override.engineBand;
  engine.append("ENGINE RECOMMENDED ", engineBand);
  const nurse = el("p");
  nurse.textContent = `‡ NURSE ASSIGNED ${override.nurseBand}`;
  const at = el("p", { class: "inspector-meta numeric" });
  at.textContent = `Override committed ${clockTime(override.at)}`;
  section.append(heading("Nurse override"), engine, nurse, at);
  return section;
}

export function renderInspector(
  inspector,
  board,
  now,
  viewState,
  protocol
) {
  if ((viewState.mode ?? "NORMAL").includes("SURGE")) {
    surgeSummary(inspector, applyOverrideOrder(board, viewState.overrides));
    return;
  }
  const selected = board.find(({ encounter }) =>
    encounter.encounter_id === viewState.selectedEncounterId
  );
  if (!selected) {
    boardSummary(inspector, board, now, viewState);
    return;
  }

  const { encounter, assessment } = selected;
  const override = viewState.overrides?.[encounter.encounter_id];
  const title = el("h2", { id: "inspector-heading" });
  const age = encounter.age_value === null
    ? "?"
    : `${encounter.age_estimated ? "~" : ""}${encounter.age_value} ${
      ageUnits[encounter.age_unit]
    }`;
  title.textContent = `${encounter.encounter_id} · ${age} ${
    [null, "unknown"].includes(encounter.sex) ? "?" : encounter.sex
  }`;
  const complaint = el("p", { class: "inspector-complaint" });
  complaint.textContent = encounter.complaint_text ?? "Complaint not obtained";
  const arrival = el("p", { class: "inspector-meta numeric" });
  arrival.textContent = `${encounter.arrival_mode.replace("_", "-")} · arrived ${
    clockTime(encounter.arrived_at)
  } · waited ${Math.floor((now - encounter.arrived_at) /
    MILLISECONDS_PER_MINUTE)} min`;

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
  interval.append(confidenceBand(
    assessment.priorityIndex,
    assessment.interval,
    protocol.bandThresholds
  ));
  const intervalLabels = el("span", { class: "confidence-track-labels" });
  for (const value of [
    assessment.interval[0],
    assessment.priorityIndex,
    assessment.interval[1]
  ]) {
    const label = el("span");
    label.textContent = number(value);
    intervalLabels.append(label);
  }
  interval.append(intervalLabels);
  index.append(indexLabel, indexValue, interval);

  const confidence = el("section", { class: "confidence-statement" });
  const confidenceTitle = el("p", {
    class: `confidence-title confidence-${assessment.confidence.toLowerCase()}`
  });
  confidenceTitle.textContent = `CONFIDENCE ${
    confidenceGlyphs[assessment.confidence]
  } ${assessment.confidence} — ${confidenceCopy(assessment)}`;
  confidence.append(confidenceTitle);
  if (assessment.tieBrokenUpward) {
    const tie = el("p");
    tie.textContent = `Tie broken upward. Undertriage cost ${
      protocol.costMatrix.undertriage
    }:${protocol.costMatrix.overtriage}.`;
    confidence.append(tie);
  }
  if (assessment.band === null) {
    const queued = el("p");
    queued.textContent = `Queued at ${assessment.provisionalBand} while ${
      assessment.confidence.toLowerCase()
    }.`;
    confidence.append(queued);
  }

  const question = renderQuestion(assessment);
  const overrideSummary = renderOverride(override);
  const reassessment = el("section", {
    class: "inspector-section reassessment numeric"
  });
  const dueDelta = Math.ceil((assessment.reassessDueAt - now) /
    MILLISECONDS_PER_MINUTE);
  reassessment.append(heading("Reassess due"));
  reassessment.append(`${clockTime(assessment.reassessDueAt)} · ${
    dueDelta >= 0 ? `in ${dueDelta} min` : `${Math.abs(dueDelta)} min overdue`
  }`);
  const reassessmentBasis = el("p", { class: "reassessment-basis" });
  reassessmentBasis.textContent = `Latest observation ${
    clockTime(encounter.observations.at(-1).observed_at)
  } + ${assessment.provisionalBand} interval ${
    protocol.reassessMinutes[assessment.provisionalBand]
  } min.`;
  reassessment.append(reassessmentBasis);

  const footer = el("p", { class: "inspector-footer numeric" });
  footer.textContent = `ENGINE ${assessment.engineVersion} · PROTOCOL ${
    assessment.protocolVersion
  } · COMPUTED ${clockTime(assessment.computedAt)} · BAND SET BY ${
    (override ? "nurse_override" : assessment.bandSetBy)
      .replace("_", " ").toUpperCase()
  }`;
  inspector.replaceChildren(
    title,
    complaint,
    arrival,
    index,
    confidence,
    ...(overrideSummary ? [overrideSummary] : []),
    ...(question ? [question] : []),
    renderDerivation(assessment, protocol),
    renderTrends(encounter),
    reassessment,
    footer
  );
}
