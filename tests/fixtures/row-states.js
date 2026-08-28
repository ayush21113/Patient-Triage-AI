import { renderBoard } from "/assets/js/render/board.js";
import { assessBoard } from "/assets/js/sim/board.js";

const [cohort, protocol] = await Promise.all([
  fetch("/assets/data/cohort.json").then(response => response.json()),
  fetch("/assets/data/protocol.v1.json").then(response => response.json())
]);
const now = Date.parse(cohort.boardStartsAt);
const board = assessBoard(cohort, protocol, now);
const cases = [
  ["normal", "PT-0015"],
  ["selected", "PT-0004"],
  ["moved", "PT-0002"],
  ["overdue", "PT-0016"],
  ["abstaining", "PT-0007"],
  ["rule-pinned", "PT-0013"],
  ["overridden", "PT-0020"],
  ["collapsed", "PT-0003"]
];
const rows = cases.map(([state, id]) => {
  const source = board.find(({ encounter }) => encounter.encounter_id === id);
  return {
    ...source,
    encounter: {
      ...source.encounter,
      complaint_text: `${state.toUpperCase()} · ${
        source.encounter.complaint_text ?? "Complaint not obtained"
      }`
    },
    assessment: {
      ...source.assessment,
      reassessDueAt: state === "overdue" ? now - 1 : now + 60_000
    }
  };
});

renderBoard(document.querySelector("#queue-body"), rows, now, {
  selectedEncounterId: "PT-0004",
  movements: {
    "PT-0002": {
      direction: "up",
      positions: 3,
      cause: "HR ↑12 over 30 min"
    }
  },
  overrides: { "PT-0020": { band: "P1" } },
  collapsedEncounterIds: ["PT-0003"]
});
