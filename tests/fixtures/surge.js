import { createBoardSimulation } from "../../assets/js/sim/board.js";
import { loadCohort } from "../../assets/js/sim/cohort.js";
import { renderBoard } from "../../assets/js/render/board.js";
import { renderInspector } from "../../assets/js/render/inspector.js";
import { renderModeStrip } from "../../assets/js/render/modes.js";

const cohort = await loadCohort();
const protocol = await fetch("../../assets/data/protocol.v1.json")
  .then(response => response.json());
const state = {
  mode: "NORMAL",
  modeDetail: null,
  overrides: {},
  selectedEncounterId: null
};
const body = document.querySelector("#queue-body");
const inspector = document.querySelector("#inspector");
const strip = document.querySelector("#mode-strip");
let simulation;

function render(board, now) {
  renderBoard(body, board, now, state);
  renderInspector(inspector, board, now, state, protocol);
  renderModeStrip(strip, state.modeDetail);
}

simulation = createBoardSimulation(cohort, protocol, render, change => {
  state.mode = change.toMode;
  state.modeDetail = change;
});
simulation.clock.setSpeed(60, 0);
simulation.clock.run(0);
simulation.startSurge();
simulation.clock.tick(15_000);
simulation.clock.pause(15_000);
render(simulation.board(), simulation.clock.now());
document.body.dataset.ready = "true";
