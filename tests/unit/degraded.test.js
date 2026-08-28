import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { assessBoard, createBoardSimulation } from "../../assets/js/sim/board.js";
import { instrumentFields } from "../../assets/js/sim/surge.js";

const cohort = JSON.parse(await readFile(
  new URL("../../assets/data/cohort.json", import.meta.url),
  "utf8"
));
const protocol = JSON.parse(await readFile(
  new URL("../../assets/data/protocol.v1.json", import.meta.url),
  "utf8"
));
const now = Date.parse(cohort.boardStartsAt);

function abstentions(board) {
  return board.filter(({ assessment }) => assessment.band === null).length;
}

test("degraded mode widens uncertainty and keeps every patient ordered", () => {
  const normal = assessBoard(cohort, protocol, now);
  const degraded = assessBoard(cohort, protocol, now, true);
  assert.equal(degraded.length, normal.length);
  assert.ok(abstentions(degraded) > abstentions(normal));
  assert.ok(degraded.every(({ encounter, assessment }) => {
    const observation = encounter.observations.at(-1);
    return instrumentFields.every(field =>
      observation.unobtainable.includes(field)
    ) && assessment.confidence;
  }));
  assert.equal(degraded[0].assessment.modelLockedOut, true);
  assert.equal(degraded[0].encounter.encounter_id, "PT-0013");
});

test("degraded and surge modes compose without losing either state", () => {
  const changes = [];
  const simulation = createBoardSimulation(
    structuredClone(cohort),
    protocol,
    () => {},
    change => changes.push(change)
  );
  simulation.enterDegraded();
  assert.equal(changes.at(-1).toMode, "DEGRADED");
  simulation.clock.setSpeed(60, 0);
  simulation.clock.run(0);
  simulation.startSurge();
  simulation.clock.tick(15_000);
  simulation.clock.pause(15_000);
  assert.equal(changes.at(-1).toMode, "SURGE_DEGRADED");
  assert.equal(simulation.board()[0].assessment.modelLockedOut, true);
});
