import assert from "node:assert/strict";
import test from "node:test";
import { createStore } from "../../assets/js/state.js";

test("every explicit row state is reachable through dispatch", () => {
  const store = createStore();
  let notifications = 0;
  store.subscribe(() => {
    notifications += 1;
  });

  store.dispatch({ type: "SELECT_ENCOUNTER", encounterId: "PT-0001" });
  store.dispatch({ type: "OPEN_ARRIVAL" });
  store.dispatch({ type: "CLOSE_SHEET" });
  store.dispatch({ type: "OPEN_REASSESS", encounterId: "PT-0001" });
  store.dispatch({ type: "OPEN_AUDIT" });
  store.dispatch({ type: "CLOSE_AUDIT" });
  store.dispatch({ type: "OPEN_FAIRNESS" });
  store.dispatch({ type: "CLOSE_FAIRNESS" });
  store.dispatch({
    type: "SET_MODE",
    mode: "SURGE",
    detail: { toMode: "SURGE" }
  });
  store.dispatch({
    type: "ACK_ALERT",
    encounterId: "PT-0013",
    at: 1000
  });
  store.dispatch({
    type: "SET_MOVEMENT",
    encounterId: "PT-0002",
    movement: { direction: "up", positions: 3, cause: "HR ↑12" }
  });
  store.dispatch({
    type: "SET_OVERRIDE",
    encounterId: "PT-0020",
    override: { band: "P1" }
  });
  store.dispatch({ type: "SET_COLLAPSED", encounterIds: ["PT-0003"] });

  assert.deepEqual(store.getState(), {
    selectedEncounterId: "PT-0001",
    sheet: { type: "reassess", encounterId: "PT-0001" },
    auditOpen: false,
    fairnessOpen: false,
    mode: "SURGE",
    modeDetail: { toMode: "SURGE" },
    acknowledgedAlerts: { "PT-0013": 1000 },
    movements: {
      "PT-0002": { direction: "up", positions: 3, cause: "HR ↑12" }
    },
    overrides: { "PT-0020": { band: "P1" } },
    collapsedEncounterIds: ["PT-0003"]
  });
  assert.equal(notifications, 13);
});

test("unknown state actions fail loudly", () => {
  const store = createStore();
  assert.throws(() => store.dispatch({ type: "UNKNOWN" }), /Unknown state action/);
});
