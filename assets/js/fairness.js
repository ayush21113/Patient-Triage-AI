import { score } from "./engine/index.js";
import { ageBand } from "./engine/physiology.js";

const BANDS = ["P1", "P2", "P3", "P4", "P5"];
const AGE_GROUPS = {
  neonate: "0–1",
  infant: "0–1",
  toddler: "1–5",
  preschool: "1–5",
  school: "5–16",
  adolescent: "5–16",
  adult: "16–65",
  older_adult: "65–80",
  elderly: "80+"
};
const DIMENSIONS = [
  ["sex", encounter => ["M", "F", "X"].includes(encounter.sex)
    ? encounter.sex
    : "—"],
  ["age band", (encounter, protocol) => encounter.age_value === null
    ? "—"
    : AGE_GROUPS[ageBand(
      encounter.age_value,
      encounter.age_unit,
      protocol
    ).ageBand] ?? "—"],
  ["language", encounter => encounter.language ?? "—"]
];

function currentBand(row, overrides) {
  return overrides[row.encounter.encounter_id]?.band ??
    row.assessment.band ?? row.assessment.provisionalBand;
}

function initialBand(encounter, protocol) {
  const initial = {
    ...encounter,
    observations: [encounter.observations[0]]
  };
  const assessment = score(initial, protocol, initial.observations[0].observed_at);
  return assessment.band ?? assessment.provisionalBand;
}

function subgroupLabel(dimension, subgroup) {
  if (dimension === "sex") {
    if (subgroup === "F") return "Patients recorded as female";
    if (subgroup === "M") return "Patients recorded as male";
    return subgroup === "—" ? "Patients without recorded sex" :
      `Patients recorded as ${subgroup}`;
  }
  if (dimension === "age band") return subgroup === "—"
    ? "Patients without recorded age"
    : `Patients aged ${subgroup}`;
  return subgroup === "—"
    ? "Patients without a recorded language"
    : `Patients with language ${subgroup}`;
}

function snapshotFor(dimension, subgroup, rows, boardRate, tolerance) {
  const upgrades = rows.filter(row => row.upgraded).length;
  const rate = upgrades / rows.length;
  const multiple = boardRate === 0 ? 1 : rate / boardRate;
  const distribution = Object.fromEntries(BANDS.map(band => [
    band,
    rows.filter(row => row.band === band).length
  ]));
  return {
    dimension,
    subgroup,
    label: subgroupLabel(dimension, subgroup),
    n: rows.length,
    distribution,
    meanAssignedBand: rows.reduce((total, row) =>
      total + Number(row.band.slice(1)), 0) / rows.length,
    upgradeAfterTriageRate: rate,
    boardRateMultiple: multiple,
    tolerance,
    flagged: multiple > tolerance,
    encounterIds: rows.map(row => row.encounterId)
  };
}

export function fairnessSnapshot(board, protocol, overrides = {}) {
  const rows = board.map(row => {
    const firstBand = initialBand(row.encounter, protocol);
    const band = currentBand(row, overrides);
    return {
      encounter: row.encounter,
      encounterId: row.encounter.encounter_id,
      band,
      upgraded: Number(band.slice(1)) < Number(firstBand.slice(1))
    };
  });
  const boardRate = rows.filter(row => row.upgraded).length / rows.length;
  const tolerance = protocol.fairness.upgradeRateMultipleTolerance;
  const subgroups = [];
  for (const [dimension, getSubgroup] of DIMENSIONS) {
    const grouped = new Map();
    for (const row of rows) {
      const subgroup = getSubgroup(row.encounter, protocol);
      grouped.set(subgroup, [...(grouped.get(subgroup) ?? []), row]);
    }
    for (const [subgroup, members] of grouped) {
      subgroups.push(snapshotFor(
        dimension,
        subgroup,
        members,
        boardRate,
        tolerance
      ));
    }
  }
  subgroups.sort((left, right) =>
    right.boardRateMultiple - left.boardRateMultiple ||
    right.upgradeAfterTriageRate - left.upgradeAfterTriageRate ||
    right.n - left.n ||
    left.dimension.localeCompare(right.dimension) ||
    left.subgroup.localeCompare(right.subgroup)
  );
  const worstServed = subgroups[0];
  return {
    subgroups,
    worstServed,
    headline: boardRate === 0
      ? `${worstServed.label} have no upgrades after triage, equal to 1.0× the board rate.`
      : `${worstServed.label} are upgraded after triage at ${worstServed.boardRateMultiple.toFixed(1)}× the board rate.`
  };
}
