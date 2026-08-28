import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createBoardSimulation } from "../../assets/js/sim/board.js";
import { createSurgeController } from "../../assets/js/sim/surge.js";

const cohort = JSON.parse(await readFile(
  new URL("../../assets/data/cohort.json", import.meta.url),
  "utf8"
));
const protocol = JSON.parse(await readFile(
  new URL("../../assets/data/protocol.v1.json", import.meta.url),
  "utf8"
));

test("18 arrivals per hour enters surge within 15 minutes", () => {
  const arrivals = [];
  const changes = [];
  const controller = createSurgeController(protocol.surge, {
    onArrival: at => arrivals.push(at),
    onModeChange: change => changes.push(change)
  });
  controller.start(0);
  controller.advance(15 * 60_000);
  assert.equal(arrivals.length, 5);
  assert.equal(controller.state().mode, "SURGE");
  assert.equal(controller.state().arrivalRatePerHour, 20);
  assert.equal(changes[0].trigger.multiplier, 20 / 6);
  assert.ok(changes[0].at <= 15 * 60_000);
});

test("surge exits only after ten continuous minutes below 2x", () => {
  const controller = createSurgeController(protocol.surge);
  controller.start(0);
  controller.advance(15 * 60_000);
  controller.stop();
  let firstBelow = null;
  for (let minute = 16; minute <= 40; minute += 1) {
    controller.advance(minute * 60_000);
    if (controller.state().arrivalRatePerHour < 12 && firstBelow === null) {
      firstBelow = minute;
    }
    if (firstBelow !== null && minute < firstBelow + 10) {
      assert.equal(controller.state().mode, "SURGE");
    }
  }
  assert.equal(controller.state().mode, "NORMAL");
});

test("board injection retains five full rows and compresses P2/P3 reassessment", () => {
  const simulation = createBoardSimulation(structuredClone(cohort), protocol);
  simulation.clock.setSpeed(60, 0);
  simulation.clock.run(0);
  simulation.startSurge();
  simulation.clock.tick(15_000);
  simulation.clock.pause(15_000);
  assert.equal(simulation.board().length, 25);
  assert.equal(simulation.surge.state().mode, "SURGE");
  const row = simulation.board().find(({ assessment }) =>
    ["P2", "P3"].includes(assessment.band ?? assessment.provisionalBand)
  );
  const band = row.assessment.band ?? row.assessment.provisionalBand;
  const dueMinutes = (row.assessment.reassessDueAt -
    row.encounter.observations.at(-1).observed_at) / 60_000;
  assert.ok(Math.abs(dueMinutes - protocol.reassessMinutes[band] *
    (1 - protocol.surge.reassessCompressionPct / 100)) < 1e-9);
});
