import { createBoardSimulation } from "./sim/board.js";
import { buildAuditExport, createAuditLog } from "./audit.js";
import { openAuditStore } from "./util/storage.js";
import { loadCohort } from "./sim/cohort.js";
import { renderBoard } from "./render/board.js";
import { renderInspector } from "./render/inspector.js";
import { renderCaptureSheet } from "./render/sheets.js";
import { renderAuditDrawer } from "./render/audit-drawer.js";
import { renderEmergencyAlert, renderModeStrip } from "./render/modes.js";
import { renderFairness } from "./render/fairness.js";
import { bindSimulationConsole } from "./render/console.js";
import { renderHeader } from "./render/header.js";
import {
  bindOverrideInteractions,
  overrideForMove
} from "./render/override.js";
import { createStore } from "./state.js";
import { on } from "./util/dom.js";

const cohort = await loadCohort();
if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");
const protocol = await fetch("assets/data/protocol.v1.json")
  .then(response => response.json());
const auditStore = await openAuditStore();
let audit;
try {
  audit = await createAuditLog(auditStore, {
    shiftId: "SH-20260823-A",
    actor: "STAFF-04"
  });
} catch {
  audit = null;
}
const tableBody = document.querySelector("#queue-body");
const inspector = document.querySelector("#inspector");
const sheetBackdrop = document.querySelector("#sheet-backdrop");
const captureSheet = document.querySelector("#capture-sheet");
const openArrival = document.querySelector("#open-arrival");
const simulationConsole = document.querySelector(".simulation-console");
const boardHeader = document.querySelector(".board-header");
const persistenceStatus = document.querySelector("#persistence-status");
const auditDrawer = document.querySelector("#audit-drawer");
const modeStrip = document.querySelector("#mode-strip");
const emergencyAlert = document.querySelector("#emergency-alert");
const boardRegion = document.querySelector("#board-region");
const fairnessMonitor = document.querySelector("#fairness-monitor");
const openFairness = document.querySelector("#open-fairness");
const openAudit = document.querySelector("#open-audit");
persistenceStatus.hidden = auditStore.persistent && audit !== null;
if (audit === null) persistenceStatus.textContent = "AUDIT CHAIN BROKEN";
const store = createStore();
let simulation;
function render(board = simulation.board(), now = simulation.clock.now()) {
  audit?.recordScores(board, now).catch(() => {
    persistenceStatus.hidden = false;
    persistenceStatus.textContent = "AUDIT CHAIN BROKEN";
  });
  renderBoard(
    tableBody,
    board,
    now,
    store.getState(),
    encounterId => store.dispatch({ type: "SELECT_ENCOUNTER", encounterId }),
    encounterId => store.dispatch({ type: "OPEN_REASSESS", encounterId })
  );
  renderHeader(boardHeader, board, now, store.getState().overrides);
  renderInspector(inspector, board, now, store.getState(), protocol, {
    onQuestionAnswer: (row, answer) => {
      const question = protocol.resolvingQuestions.find(({ id }) =>
        id === row.assessment.resolvingQuestionId
      );
      audit?.recordQuestionAnswered(row, question, answer, now).catch(() => {
        persistenceStatus.hidden = false;
        persistenceStatus.textContent = "AUDIT CHAIN BROKEN";
      });
      simulation.answerQuestion(
        row.encounter.encounter_id,
        question.id,
        answer
      );
    }
  });
  renderModeStrip(modeStrip, store.getState().modeDetail, board);
  renderEmergencyAlert(
    emergencyAlert,
    board,
    protocol,
    store.getState().acknowledgedAlerts,
    (row, rule) => {
      const at = simulation.clock.now();
      store.dispatch({
        type: "ACK_ALERT",
        encounterId: row.encounter.encounter_id,
        at
      });
      audit?.recordAlertAcknowledgement(row, rule, at).catch(() => {
        persistenceStatus.hidden = false;
        persistenceStatus.textContent = "AUDIT CHAIN BROKEN";
      });
    }
  );
  renderFairness(
    fairnessMonitor,
    boardRegion,
    store.getState().fairnessOpen,
    board,
    protocol,
    store.getState().overrides,
    {
      onClose: () => store.dispatch({ type: "CLOSE_FAIRNESS" }),
      onEncounter: encounterId => {
        store.dispatch({ type: "CLOSE_FAIRNESS" });
        store.dispatch({ type: "SELECT_ENCOUNTER", encounterId });
      }
    }
  );
  renderCaptureSheet(
    sheetBackdrop,
    captureSheet,
    store.getState().sheet,
    board,
    protocol,
    {
      onClose: () => store.dispatch({ type: "CLOSE_SHEET" }),
      onAdmit: encounter => {
        simulation.admitEncounter(encounter);
        store.dispatch({ type: "CLOSE_SHEET" });
      },
      onReassess: (encounterId, frame) => {
        simulation.reassessEncounter(encounterId, frame);
        store.dispatch({ type: "CLOSE_SHEET" });
      }
    }
  );
  renderAuditDrawer(
    auditDrawer,
    store.getState().auditOpen,
    audit,
    {
      onClose: () => store.dispatch({ type: "CLOSE_AUDIT" }),
      onExport: async format => {
        await audit.recordExport(format, simulation.clock.now());
        const file = await buildAuditExport(
          await audit.records(),
          format,
          simulation.clock.now()
        );
        render();
        return file;
      }
    }
  );
}
simulation = createBoardSimulation(cohort, protocol, render, change => {
  store.dispatch({
    type: "SET_MODE",
    mode: change.toMode,
    detail: change
  });
  audit?.recordModeChange(change).catch(() => {
    persistenceStatus.hidden = false;
    persistenceStatus.textContent = "AUDIT CHAIN BROKEN";
  });
});
store.subscribe(() => render());
on(openArrival, "click", () => store.dispatch({ type: "OPEN_ARRIVAL" }));
on(openFairness, "click", () => store.dispatch({ type: "OPEN_FAIRNESS" }));
on(openAudit, "click", () => store.dispatch({ type: "OPEN_AUDIT" }));
bindOverrideInteractions(tableBody, {
  selectedEncounterId: () => store.getState().selectedEncounterId,
  onSelect: encounterId => store.dispatch({
    type: "SELECT_ENCOUNTER",
    encounterId
  }),
  onCommit: (encounterId, targetRank) => {
    const board = simulation.board();
    const override = overrideForMove(
      board,
      store.getState().overrides,
      encounterId,
      targetRank,
      simulation.clock.now()
    );
    if (!override) return;
    store.dispatch({ type: "SET_OVERRIDE", encounterId, override });
    const row = board.find(({ encounter }) =>
      encounter.encounter_id === encounterId
    );
    audit?.recordOverride(row, override).catch(() => {
      persistenceStatus.hidden = false;
      persistenceStatus.textContent = "AUDIT CHAIN BROKEN";
    });
  }
});
on(document, "keydown", event => {
  const state = store.getState();
  if (event.key.toLowerCase() === "a" &&
      !["INPUT", "TEXTAREA"].includes(event.target.tagName)) {
    store.dispatch({ type: "OPEN_AUDIT" });
  } else if (event.key.toLowerCase() === "f" &&
      !["INPUT", "TEXTAREA"].includes(event.target.tagName)) {
    store.dispatch({ type: "OPEN_FAIRNESS" });
  } else if (event.key === "Escape" && state.sheet) {
    store.dispatch({ type: "CLOSE_SHEET" });
  } else if (event.key === "Escape" && state.fairnessOpen) {
    store.dispatch({ type: "CLOSE_FAIRNESS" });
  } else if (event.key === "Escape" && state.auditOpen) {
    store.dispatch({ type: "CLOSE_AUDIT" });
  } else if (event.key === "Escape" && state.selectedEncounterId) {
    store.dispatch({ type: "SELECT_ENCOUNTER", encounterId: null });
  }
});
render();
simulation.clock.run();
bindSimulationConsole(simulationConsole, simulation);
