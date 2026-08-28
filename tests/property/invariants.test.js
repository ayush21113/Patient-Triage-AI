import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { score } from "../../assets/js/engine/index.js";

const protocol = JSON.parse(await readFile(
  new URL("../../assets/data/protocol.v1.json", import.meta.url),
  "utf8"
));
const complaintClasses = Object.keys(protocol.presentation.classes);
const qualifiers = [
  "thunderclap",
  "neck_stiffness",
  "neurovascular_compromise",
  "radiating",
  "exertional",
  "sudden_onset",
  "reported_change_from_baseline"
];
const bands = ["P2", "P3", "P4", "P5"];
const minute = 60_000;

function randomGenerator(seed) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 2 ** 32;
  };
}

function integer(random, minimum, maximum) {
  return Math.floor(random() * (maximum - minimum + 1)) + minimum;
}

function randomEncounter(random, iteration) {
  const now = integer(random, 0, 180) * minute;
  const arrivedAt = now - integer(random, 0, 180) * minute;
  const observedAt = now - integer(random, 0, 30) * minute;
  const ageValue = integer(random, 0, 95);
  const sex = ["M", "F", "X"][integer(random, 0, 2)];
  const observation = {
    observed_at: observedAt,
    hr: integer(random, 25, 210),
    sbp: integer(random, 55, 230),
    dbp: integer(random, 35, 130),
    rr: integer(random, 5, 65),
    spo2: integer(random, 75, 100),
    spo2_on_oxygen: random() < 0.2,
    temp_c: integer(random, 330, 415) / 10,
    acvpu: ["A", "C", "V", "P", "U"][integer(random, 0, 4)],
    pain_score: integer(random, 0, 10),
    cap_refill_s: integer(random, 10, 60) / 10,
    visual: {
      pale: random() < 0.2,
      diaphoretic: random() < 0.2,
      drowsy: random() < 0.2,
      distressed: random() < 0.2,
      cyanosed: random() < 0.1,
      active_major_bleeding: random() < 0.02,
      cannot_speak_full_sentences: random() < 0.1,
      airway_compromise: random() < 0.02,
      seizure_active: random() < 0.02,
      heavy_vaginal_bleeding: random() < 0.02
    },
    unobtainable: []
  };
  const previous = {
    ...observation,
    observed_at: observedAt - 30 * minute,
    hr: integer(random, 25, 210),
    sbp: integer(random, 55, 230),
    rr: integer(random, 5, 65),
    spo2: integer(random, 75, 100),
    temp_c: integer(random, 330, 415) / 10
  };
  return {
    now,
    encounter: {
      encounter_id: `PT-RANDOM-${iteration}`,
      arrived_at: arrivedAt,
      age_value: ageValue,
      age_unit: "years",
      age_estimated: false,
      sex,
      pregnancy_status: sex === "F" && random() < 0.1
        ? "pregnant"
        : "not_pregnant",
      complaint_class: complaintClasses[integer(
        random,
        0,
        complaintClasses.length - 1
      )],
      complaint_qualifiers: qualifiers.filter(() => random() < 0.1),
      preexisting_flags: random() < 0.1 ? ["diabetic"] : [],
      current_band: bands[integer(random, 0, bands.length - 1)],
      observations: random() < 0.5
        ? [observation]
        : [previous, observation]
    }
  };
}

test("10,000 random encounters preserve every engine invariant", () => {
  const random = randomGenerator(0x50415449);
  for (let iteration = 0; iteration < 10_000; iteration += 1) {
    const input = randomEncounter(random, iteration);
    const result = score(input.encounter, protocol, input.now);
    const repeat = score(input.encounter, protocol, input.now);
    assert.ok(result.confidence);
    assert.ok(result.interval[0] <= result.priorityIndex);
    assert.ok(result.priorityIndex <= result.interval[1]);
    assert.equal(JSON.stringify(result), JSON.stringify(repeat));
    if (result.rulesFired.some(({ action }) => action === "PIN_P1")) {
      assert.equal(result.band, "P1");
      assert.equal(result.provisionalBand, "P1");
      assert.equal(result.modelLockedOut, true);
    }
  }
});
