import { el, on } from "../util/dom.js";
import { confidenceMark } from "../util/glyph.js";
import { applyOverrideOrder } from "./override.js";

const MILLISECONDS_PER_MINUTE = 60_000;
const rowsByTable = new WeakMap();
const actionsByTable = new WeakMap();
const ageUnits = {
 days: "d",
 months: "mo",
 years: "y"
};
const bandGlyphs = {
 P1: "●",
 P2: "▲",
 P3: "—",
 P4: "○",
 P5: "○"
};

export function reassessmentPrompt(assessment, latestObservedAt, now) {
 if (now <= assessment.reassessDueAt) {
  return { overdue: false, level: 0, overdueMinutes: 0 };
 }
 const overdueMilliseconds = now - assessment.reassessDueAt;
 const intervalMilliseconds = assessment.reassessDueAt - latestObservedAt;
 const level = intervalMilliseconds <= 0
  ? 3
  : Math.min(3, 1 + Math.floor(
   overdueMilliseconds / intervalMilliseconds
  ));
 return {
  overdue: true,
  level,
  overdueMinutes: Math.ceil(overdueMilliseconds / MILLISECONDS_PER_MINUTE)
 };
}

function cell(className) {
 return el("td", { class: className });
}

function createRow(encounterId) {
 const row = el("tr", {
  class: "queue-row",
  "data-encounter-id": encounterId,
  tabindex: "-1"
 });
 const band = el("span", { class: "band-chip" });
 const bandCell = cell("band-cell");
 bandCell.append(band);
 const complaint = cell("complaint-cell");
 const complaintLayout = el("div", { class: "complaint-layout" });
 const complaintText = el("span", { class: "complaint-text", "data-ellipsis": "ok" });
 const detail = el("span", { class: "row-detail" });
 complaintLayout.append(complaintText, detail);
 complaint.append(complaintLayout);
 const wait = cell("wait-cell numeric");
 const waitMain = el("span", { class: "wait-main" });
 const waitToken = el("span", { class: "wait-token" });
 wait.append(waitMain, waitToken);
 const collapsed = cell("collapsed-cell");
 collapsed.setAttribute("colspan", "11");
 const collapsedBand = el("span", { class: "collapsed-band" });
 const collapsedId = el("span", { class: "collapsed-id numeric" });
 const collapsedComplaint = el("span", { class: "collapsed-complaint" });
 const collapsedWait = el("span", { class: "collapsed-wait numeric" });
 collapsed.append(
  collapsedBand,
  collapsedId,
  collapsedComplaint,
  collapsedWait
 );
 const cells = {
  band,
  bandCell,
  id: cell("id-cell numeric"),
  ageSex: cell("age-sex-cell numeric"),
  complaint,
  complaintText,
  detail,
  hr: cell("vital-cell numeric"),
  bp: cell("vital-cell numeric"),
  rr: cell("vital-cell numeric"),
  spo2: cell("vital-cell numeric"),
  temp: cell("vital-cell numeric"),
  wait,
  waitMain,
  waitToken,
  confidence: cell("confidence-cell"),
  collapsedBand,
  collapsedId,
  collapsedComplaint,
  collapsedWait
 };
 row.append(
  bandCell,
  cells.id,
  cells.ageSex,
  cells.complaint,
  cells.hr,
  cells.bp,
  cells.rr,
  cells.spo2,
  cells.temp,
  cells.wait,
  cells.confidence,
  collapsed
 );
 return { row, cells };
}

function formatAgeSex(encounter) {
 const age = encounter.age_value === null
  ? "?"
  : `${encounter.age_estimated ? "~" : ""}${encounter.age_value} ${
   ageUnits[encounter.age_unit]
  }`;
 const sex = [null, "unknown"].includes(encounter.sex)
  ? "?"
  : encounter.sex;
 return `${age} ${sex}`;
}

function vitalText(observation, fields) {
 if (fields.some(field => observation.unobtainable.includes(field))) {
  return "——";
 }
 const values = fields.map(field => observation[field]);
 return values.some(value => value === null) ? "—" : values.join("/");
}

function flash(node, direction) {
 node.classList.remove("value-changed", "value-up", "value-down");
 void node.offsetWidth;
 node.classList.add("value-changed", `value-${direction}`);
}

function setVital(cellNode, value, unit, direction) {
 let mark = cellNode.querySelector(".drift-mark");
 let valueNode = cellNode.querySelector(".vital-value");
 let unitNode = cellNode.querySelector(".vital-unit");
 if (!valueNode) {
  mark = el("span", { class: "drift-mark" });
  valueNode = el("span", { class: "vital-value" });
  unitNode = el("span", { class: "vital-unit" });
  cellNode.append(mark, valueNode, unitNode);
 }

 const changed = valueNode.textContent !== "" &&
  valueNode.textContent !== value;
 valueNode.textContent = value;
 unitNode.textContent = unit;
 unitNode.hidden = ["—", "——"].includes(value);
 cellNode.setAttribute("aria-label", value === "——"
  ? unit + " unobtainable"
  : value === "—" ? unit + " not recorded" : value + " " + unit);
 cellNode.classList.toggle("vital-unobtainable", value === "——");
 mark.textContent = direction === "up" ? "▲" : direction === "down" ? "▼" : "";
 mark.className = `drift-mark${direction ? ` drift-${direction}` : ""}`;
 mark.hidden = direction === null;
 if (changed) flash(valueNode, direction ?? "down");
 return changed;
}

function trendDirection(observations, field) {
 if (observations.length < 2) return null;
 const previous = observations.at(-2);
 const current = observations.at(-1);
 if (previous[field] === null || current[field] === null ||
   previous.unobtainable.includes(field) ||
   current.unobtainable.includes(field)) {
  return null;
 }
 const change = current[field] - previous[field];
 return change === 0 ? null : change > 0 ? "up" : "down";
}

function detailToken(className, value) {
 const token = el("span", { class: `row-state-token ${className}` });
 token.textContent = value;
 return token;
}

function displayDriftDetail(value, max = 2) {
 const causes = value?.replace(/\d+\.\d{2,}/g, n =>
  String(Math.round(Number(n) * 10) / 10)
 ).split(" · ");
 if (!causes) return value;
 return causes.length <= max
  ? causes.join(" · ")
  : `${causes.slice(0, max).join(" · ")} +${causes.length - max}`;
}

function updateRow(entry, boardRow, now, viewState) {
 const { encounter, assessment } = boardRow;
 const observation = encounter.observations.at(-1);
 const { cells } = entry;
 const id = encounter.encounter_id;
 const movement = viewState.movements?.[id] ?? entry.movement;
 const override = assessment.modelLockedOut
  ? null
  : viewState.overrides?.[id];
 const band = override?.band ?? assessment.band ?? assessment.provisionalBand;
 const abstaining = assessment.band === null && !override;
 const selected = viewState.selectedEncounterId === id;
 const reassessment = reassessmentPrompt(
  assessment,
  observation.observed_at,
  now
 );
 const overdue = reassessment.overdue;
 const pinned = assessment.modelLockedOut;
 const collapsed = viewState.collapsedEncounterIds?.includes(id) ?? false;
 const states = [
  selected && "selected",
  movement && "moved",
  overdue && "overdue",
  reassessment.level > 1 && `overdue-${reassessment.level}`,
  abstaining && "abstaining",
  pinned && "pinned",
  override && "overridden",
  collapsed && "collapsed"
 ].filter(Boolean);

 entry.row.className = `queue-row${states.map(state =>
  ` row-${state}`
 ).join("")}`;
 entry.row.dataset.states = states.length ? states.join(" ") : "normal";
 entry.row.setAttribute("aria-selected", String(selected));

 cells.band.className = `band-chip band-${band.toLowerCase()}${
  abstaining ? " band-abstaining" : ""
 }`;
 if (abstaining) {
  const mark = el("span", { class: "abstention-mark" });
  mark.textContent = "⊘";
  const provisional = el("span", { class: "provisional-band" });
  provisional.textContent = band;
  cells.band.replaceChildren(mark, provisional);
 } else {
  cells.band.textContent = band;
 }
 if (entry.previousBand && entry.previousBand !== band) {
  flash(
   cells.bandCell,
   Number(band.slice(1)) < Number(entry.previousBand.slice(1))
    ? "up"
    : "down"
  );
 }
 entry.previousBand = band;
 cells.id.textContent = encounter.encounter_id;
 cells.ageSex.textContent = formatAgeSex(encounter);
 const complaint = encounter.complaint_text ?? "Complaint not obtained";
 cells.complaintText.textContent = complaint;
 cells.complaint.title = complaint;
 cells.detail.replaceChildren();
 if (movement) {
  const direction = movement.direction === "up" ? "▲" : "▼";
  cells.detail.append(detailToken(
   `movement-${movement.direction}`,
   `${direction} ${movement.direction.toUpperCase()} ${
    movement.positions
   } · ${displayDriftDetail(movement.cause, 1)}`
  ));
 }
 if (overdue) {
  cells.detail.append(detailToken(
   "reassess-token",
   `REASSESS ${
    reassessment.overdueMinutes
   }m`
  ));
 }
 if (pinned) {
  cells.detail.append(detailToken("locked-token", "● LOCKED"));
 }
 if (override) {
  cells.detail.append(detailToken(
   "nurse-token",
   `▲ NURSE ${override.band}`
  ));
 }
 if (assessment.confidence === "UNRESOLVED") {
  cells.detail.append(detailToken(
   "resolve-token",
   `◐ RESOLVE · ${assessment.resolvingQuestionShortLabel}`
  ));
 } else if (assessment.confidence === "UNRESOLVABLE") {
  cells.detail.append(detailToken(
   "escalate-token",
   `◐ ESCALATE · ${assessment.candidateBands.join("/")}`
  ));
 } else if (assessment.confidence === "INSUFFICIENT") {
  cells.detail.append(detailToken(
   "resolve-token",
   "○ INSUFFICIENT"
  ));
 }
 cells.detail.hidden = cells.detail.childElementCount === 0;
 cells.detail.title = cells.detail.textContent;
 const changed = [
  setVital(
   cells.hr,
   vitalText(observation, ["hr"]),
   "bpm",
   trendDirection(encounter.observations, "hr")
  ),
  setVital(
   cells.bp,
   vitalText(observation, ["sbp", "dbp"]),
   "mmHg",
   trendDirection(encounter.observations, "sbp")
  ),
  setVital(
   cells.rr,
   vitalText(observation, ["rr"]),
   "/min",
   trendDirection(encounter.observations, "rr")
  ),
  setVital(
   cells.spo2,
   vitalText(observation, ["spo2"]),
   "%",
   trendDirection(encounter.observations, "spo2")
  ),
  setVital(
   cells.temp,
   vitalText(observation, ["temp_c"]),
   "°C",
   trendDirection(encounter.observations, "temp_c")
  )
 ].some(Boolean);
 if (changed) entry.valueChangeTicks = 3;
 entry.row.classList.toggle("row-value-changed", entry.valueChangeTicks > 0);
 cells.waitMain.replaceChildren();
 const waitValue = el("span", { class: "wait-value" });
 const waitedMinutes = Math.floor(
  (now - encounter.arrived_at) / MILLISECONDS_PER_MINUTE
 );
 waitValue.textContent = String(waitedMinutes) + "m";
 cells.waitMain.append(waitValue);
  cells.waitToken.textContent = overdue ? "DUE" : "";
 cells.waitToken.hidden = !overdue;
 cells.confidence.replaceChildren(
  confidenceMark(assessment.confidence),
  document.createTextNode(` ${assessment.confidence}`)
 );
 cells.confidence.dataset.confidence = assessment.confidence;
 cells.collapsedBand.textContent = `${bandGlyphs[band]} ${band}`;
 cells.collapsedBand.className = `collapsed-band band-text-${
  band.toLowerCase()
 }`;
 cells.collapsedId.textContent = id;
 cells.collapsedComplaint.textContent = complaint;
 cells.collapsedComplaint.title = complaint;
 cells.collapsedWait.textContent = `${overdue
  ? "REASSESS · "
  : ""}${waitedMinutes}m`;
}

export function renderBoard(
 tableBody,
 board,
 now,
 viewState = {},
 onSelect = () => {},
 onReassess = () => {}
) {
 board = applyOverrideOrder(board, viewState.overrides);
 const degraded = (viewState.mode ?? "NORMAL").includes("DEGRADED");
 const unobtainableNote = document.querySelector("#unobtainable-note");
 if (unobtainableNote) unobtainableNote.hidden = !degraded;
 if ((viewState.mode ?? "NORMAL").includes("SURGE")) {
  viewState = {
   ...viewState,
   collapsedEncounterIds: board.slice(5).map(({ encounter }) =>
    encounter.encounter_id
   )
  };
 }
 const rows = rowsByTable.get(tableBody) ?? new Map();
 rowsByTable.set(tableBody, rows);
 actionsByTable.set(tableBody, { onSelect, onReassess });
 if (!tableBody.dataset.selectionBound) {
  on(tableBody, "click", event => {
   const row = event.target.closest("tr[data-encounter-id]");
   if (!row) return;
   const actions = actionsByTable.get(tableBody);
   if (event.target.closest(".vital-cell")) {
    actions.onReassess(row.dataset.encounterId);
   } else {
    actions.onSelect(row.dataset.encounterId);
    row.focus();
   }
  });
  tableBody.dataset.selectionBound = "true";
 }
 const present = new Set();
 const rankAnnouncements = [];
 const previousTops = new Map([...rows].map(([id, entry]) => [
  id,
  entry.row.getBoundingClientRect().top
 ]));

 for (const [rank, boardRow] of board.entries()) {
  const id = boardRow.encounter.encounter_id;
  const entry = rows.get(id) ?? createRow(id);
  rows.set(id, entry);
  present.add(id);
  if (entry.rank !== undefined && entry.rank !== rank) {
   const direction = rank < entry.rank ? "up" : "down";
   entry.movement = {
    direction,
    positions: Math.abs(entry.rank - rank),
    cause: direction === "up"
     ? boardRow.assessment.derivation.hazard.driftDetail ??
      "Priority Index increased"
     : "Higher-risk patient moved ahead",
    ticksRemaining: 3
   };
   rankAnnouncements.push(
    `${id} moved ${direction} ${Math.abs(entry.rank - rank)} positions to rank ${rank + 1}.`
   );
  } else if (entry.lastRenderedAt !== undefined &&
    entry.lastRenderedAt !== now && entry.movement) {
   entry.movement.ticksRemaining -= 1;
   if (entry.movement.ticksRemaining === 0) entry.movement = null;
  }
  if (entry.lastRenderedAt !== undefined && entry.lastRenderedAt !== now &&
    entry.valueChangeTicks > 0) {
   entry.valueChangeTicks -= 1;
  }
  entry.rank = rank;
  entry.lastRenderedAt = now;
  updateRow(entry, boardRow, now, viewState);
  entry.row.tabIndex = viewState.selectedEncounterId === id ||
   (viewState.selectedEncounterId === null && rank === 0) ? 0 : -1;
  entry.row.setAttribute("aria-rowindex", String(rank + 2));
  tableBody.append(entry.row);
 }
 for (const [id, entry] of rows) {
  if (!present.has(id)) {
   entry.row.remove();
   rows.delete(id);
  }
 }
 for (const [id, entry] of rows) {
  const previousTop = previousTops.get(id);
  if (previousTop === undefined) continue;
  const distance = previousTop - entry.row.getBoundingClientRect().top;
  if (distance === 0) continue;
  entry.row.style.transform = `translateY(${distance}px)`;
  requestAnimationFrame(() => {
   entry.row.style.transform = "";
  });
 }
 if (rankAnnouncements.length > 0) {
  tableBody.ownerDocument.querySelector("#queue-announcer").textContent =
   rankAnnouncements.join(" ");
 }
}
