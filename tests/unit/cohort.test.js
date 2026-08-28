import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  frameAt,
  loadCohort,
  projectEncounter
} from "../../assets/js/sim/cohort.js";

const cohort = JSON.parse(await readFile(
  new URL("../../assets/data/cohort.json", import.meta.url),
  "utf8"
));
const pt0002 = cohort.encounters.find(({ encounterId }) =>
  encounterId === "PT-0002"
);

test("loads the shipped cohort file", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async url => ({
    ok: String(url).endsWith("/assets/data/cohort.json"),
    json: async () => cohort
  });
  try {
    assert.deepEqual(await loadCohort(), cohort);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("returns a keyframe exactly", () => {
  assert.deepEqual(frameAt(pt0002, 30), pt0002.trajectory[2]);
});

test("interpolates between keyframes at field precision", () => {
  assert.deepEqual(frameAt(pt0002, 22.5), {
    atMinute: 22.5,
    acvpu: "A",
    painScore: null,
    vitals: {
      hr: 108,
      sbp: 114,
      dbp: 71,
      rr: 25,
      spo2: 94,
      tempC: 37.3
    },
    visual: {},
    unobtainable: []
  });
});

test("holds the last keyframe after the trajectory ends", () => {
  assert.deepEqual(frameAt(pt0002, 60), pt0002.trajectory.at(-1));
});

test("PT-0002 at minute 45 reproduces its final keyframe", () => {
  const projected = projectEncounter(
    pt0002,
    cohort.boardStartsAt,
    45
  );
  assert.deepEqual(projected.observations.at(-1), {
    observed_at: Date.parse(cohort.boardStartsAt) + 45 * 60_000,
    hr: 124,
    sbp: 100,
    dbp: 66,
    rr: 29,
    spo2: 90,
    spo2_on_oxygen: null,
    temp_c: 37.4,
    acvpu: "A",
    pain_score: null,
    cap_refill_s: null,
    visual: { cannot_speak_full_sentences: true },
    unobtainable: []
  });
});

test("projects unobtainable separately from null", () => {
  const source = cohort.encounters.find(({ encounterId }) =>
    encounterId === "PT-0007"
  );
  const observation = projectEncounter(
    source,
    cohort.boardStartsAt,
    0
  ).observations.at(-1);
  assert.equal(observation.temp_c, null);
  assert.ok(observation.unobtainable.includes("temp_c"));
});
