import { score } from "../../assets/js/engine/index.js";
import { projectCohort } from "../../assets/js/sim/cohort.js";
import { degradeEncounter } from "../../assets/js/sim/surge.js?degraded-fixture";
import { renderBoard } from "../../assets/js/render/board.js";
import { renderInspector } from "../../assets/js/render/inspector.js";
import {
  renderEmergencyAlert,
  renderModeStrip
} from "../../assets/js/render/modes.js";

const [cohort, protocol] = await Promise.all([
  fetch("../../assets/data/cohort.json").then(response => response.json()),
  fetch("../../assets/data/protocol.v1.json").then(response => response.json())
]);
const now = Date.parse(cohort.boardStartsAt);
function assess(degraded) {
  return projectCohort(cohort, 0).map(encounter =>
    degraded ? degradeEncounter(encounter) : encounter
  ).map(encounter => ({
    encounter,
    assessment: score(encounter, protocol, now),
    lastRecomputedAt: now
  })).sort((left, right) => {
    const leftBand = left.assessment.band ?? left.assessment.provisionalBand;
    const rightBand = right.assessment.band ?? right.assessment.provisionalBand;
    return Number(right.assessment.modelLockedOut) -
        Number(left.assessment.modelLockedOut) ||
      Number(leftBand.slice(1)) - Number(rightBand.slice(1)) ||
      right.assessment.priorityIndex - left.assessment.priorityIndex;
  });
}
const normal = assess(false);
const board = assess(true);
const state = {
  mode: "DEGRADED",
  modeDetail: {
    toMode: "DEGRADED",
    at: now,
    trigger: {}
  },
  overrides: {},
  selectedEncounterId: null,
  acknowledgedAlerts: {}
};
renderBoard(document.querySelector("#queue-body"), board, now, state);
renderInspector(document.querySelector("#inspector"), board, now, state, protocol);
renderModeStrip(document.querySelector("#mode-strip"), state.modeDetail, board);
renderEmergencyAlert(
  document.querySelector("#emergency-alert"),
  board,
  protocol,
  state.acknowledgedAlerts,
  () => {}
);
document.body.dataset.normalAbstentions = normal.filter(({ assessment }) =>
  assessment.band === null
).length;
document.body.dataset.ready = "true";
