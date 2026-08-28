import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { scoreHazard } from "../../assets/js/engine/hazard.js";

const protocol = JSON.parse(await readFile(
  new URL("../../assets/data/protocol.v1.json", import.meta.url),
  "utf8"
));
const minute = 60_000;
const encounter = { arrived_at: 0 };
const observation = {
  observed_at: 0,
  rr: 22,
  spo2: 96,
  hr: 80,
  sbp: 120,
  temp_c: 37,
  unobtainable: []
};

test("reproduces the documented 12.4 drift example", () => {
  const result = scoreHazard(encounter, [observation, {
    ...observation,
    observed_at: 45 * minute,
    rr: 27,
    spo2: 93
  }], "P1", protocol, 45 * minute);

  assert.equal(result.waitedMinutes, 45);
  assert.equal(result.timeHazard, 0);
  assert.ok(Math.abs(result.drift - 12.4) < Number.EPSILON * 10);
  assert.ok(Math.abs(result.score - 12.4) < Number.EPSILON * 10);
  assert.equal(result.singleReading, false);
  assert.equal(result.driftDetail, "RR ↑5 · SpO₂ ↓3 over 45 min");
});

test("a single observation has zero drift and is flagged", () => {
  const result = scoreHazard(
    encounter,
    [observation],
    "P4",
    protocol,
    60 * minute
  );

  assert.equal(result.timeHazard, 2.1);
  assert.equal(result.drift, 0);
  assert.equal(result.score, 2.1);
  assert.equal(result.driftDetail, null);
  assert.equal(result.singleReading, true);
});

test("normalizes a recent slope to the configured drift window", () => {
  const result = scoreHazard(encounter, [observation, {
    ...observation,
    observed_at: 15 * minute,
    rr: 24
  }], "P1", protocol, 15 * minute);

  assert.equal(result.drift, 5.6);
  assert.equal(result.driftDetail, "RR ↑2 over 15 min");
});

test("uses the nearest observation at or before the window boundary", () => {
  const result = scoreHazard(encounter, [
    observation,
    { ...observation, observed_at: 10 * minute, rr: 23 },
    { ...observation, observed_at: 20 * minute, rr: 30 },
    { ...observation, observed_at: 45 * minute, rr: 25 }
  ], "P1", protocol, 45 * minute);

  assert.equal(result.drift, 2.8);
  assert.equal(result.driftDetail, "RR ↑2 over 35 min");
});

test("clamps combined hazard and drift to the layer range", () => {
  const upper = scoreHazard(
    encounter,
    [observation],
    "P2",
    protocol,
    100 * minute
  );
  assert.equal(upper.timeHazard, 22);
  assert.equal(upper.score, 20);

  const lower = scoreHazard(encounter, [observation, {
    ...observation,
    observed_at: 30 * minute,
    rr: 12
  }], "P1", protocol, 30 * minute);
  assert.ok(Math.abs(lower.drift + 14) < Number.EPSILON * 10);
  assert.equal(lower.score, 0);
});

test("ignores unobtainable parameters in drift", () => {
  const result = scoreHazard(encounter, [observation, {
    ...observation,
    observed_at: 30 * minute,
    rr: 30,
    unobtainable: ["rr"]
  }], "P1", protocol, 30 * minute);

  assert.equal(result.drift, 0);
  assert.equal(result.driftDetail, null);
});
