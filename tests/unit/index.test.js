import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  assertAssessmentContract,
  score
} from "../../assets/js/engine/index.js";

const protocol = JSON.parse(await readFile(
  new URL("../../assets/data/protocol.v1.json", import.meta.url),
  "utf8"
));

const observation = {
  observed_at: 0,
  hr: 80,
  sbp: 120,
  dbp: 75,
  rr: 16,
  spo2: 98,
  spo2_on_oxygen: false,
  temp_c: 37,
  acvpu: "A",
  pain_score: 0,
  cap_refill_s: null,
  visual: {},
  unobtainable: []
};

const encounter = {
  encounter_id: "PT-TEST",
  arrived_at: 0,
  age_value: 30,
  age_unit: "years",
  sex: "M",
  pregnancy_status: "not_pregnant",
  complaint_class: "minor_illness",
  complaint_qualifiers: [],
  preexisting_flags: [],
  observations: [observation]
};

const valid = {
  confidence: "ESTABLISHED",
  band: "P4",
  provisionalBand: "P4",
  priorityIndex: 25,
  interval: [20, 30],
  resolvingQuestionId: null,
  noQuestionReason: null,
  modelLockedOut: false
};

test("enforces all seven Assessment contract violations", () => {
  assert.throws(() => assertAssessmentContract({
    ...valid,
    confidence: undefined
  }), /requires confidence/);
  assert.throws(() => assertAssessmentContract({
    ...valid,
    band: null,
    provisionalBand: null
  }), /band or provisional/);
  assert.throws(() => assertAssessmentContract({
    ...valid,
    priorityIndex: 31
  }), /inside its interval/);
  assert.throws(() => assertAssessmentContract({
    ...valid,
    confidence: "UNRESOLVED",
    band: null
  }), /requires a resolving question/);
  assert.throws(() => assertAssessmentContract({
    ...valid,
    confidence: "UNRESOLVABLE",
    band: null,
    noQuestionReason: null
  }), /requires a reason and no question/);
  assert.throws(() => assertAssessmentContract({
    ...valid,
    noQuestionReason: "no_questions_defined_for_class"
  }), /Only UNRESOLVABLE/);
  assert.throws(() => assertAssessmentContract({
    ...valid,
    modelLockedOut: true
  }), /provisional P1/);
});

test("the full engine is deterministic and schedules from the latest reading", () => {
  const first = score(encounter, protocol, 30 * 60_000);
  const second = score(structuredClone(encounter), protocol, 30 * 60_000);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
  assert.equal(first.reassessDueAt, 60 * 60_000);
  assert.ok(first.interval[0] <= first.priorityIndex);
  assert.ok(first.interval[1] >= first.priorityIndex);
});

test("a PIN_P1 assessment is locked, immediate, and contains no wait advice", () => {
  const result = score({
    ...encounter,
    observations: [{
      ...observation,
      acvpu: "U"
    }]
  }, protocol, 0);
  assert.equal(result.band, "P1");
  assert.equal(result.provisionalBand, "P1");
  assert.equal(result.confidence, "ESTABLISHED");
  assert.equal(result.modelLockedOut, true);
  assert.equal(result.alert, "immediate");
  assert.equal(result.recommendation, undefined);
});
