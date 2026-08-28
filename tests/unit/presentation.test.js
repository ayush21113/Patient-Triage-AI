import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { scorePresentation } from "../../assets/js/engine/presentation.js";

const protocol = JSON.parse(await readFile(
  new URL("../../assets/data/protocol.v1.json", import.meta.url),
  "utf8"
));

const visual = {
  pale: false,
  diaphoretic: false,
  drowsy: false,
  distressed: false,
  cyanosed: false,
  active_major_bleeding: false,
  cannot_speak_full_sentences: false,
  airway_compromise: false,
  seizure_active: false,
  heavy_vaginal_bleeding: false
};

const observation = {
  hr: 80,
  sbp: 120,
  dbp: 75,
  rr: 16,
  spo2: 98,
  temp_c: 37,
  acvpu: "A",
  unobtainable: [],
  visual
};

const encounter = {
  age_value: 30,
  age_unit: "years",
  pregnancy_status: "not_pregnant",
  sex: "M",
  complaint_class: "minor_illness",
  complaint_qualifiers: [],
  preexisting_flags: []
};

test("PT-0007 fires PM-AB-01 on radiating pain without diaphoresis", () => {
  const result = scorePresentation({
    ...encounter,
    age_value: 61,
    complaint_class: "abdominal_pain",
    complaint_qualifiers: ["radiating"]
  }, observation, protocol);

  assert.equal(result.base, 6);
  assert.equal(result.score, 13);
  assert.equal(result.clamped, false);
  assert.deepEqual(result.modifiers, [{
    label: "Age 55 or over with diaphoresis or radiating pain — atypical ACS pattern",
    points: 7
  }]);
});

test("PM-AB-01 also fires on diaphoresis and requires age 55", () => {
  const abdominalPain = {
    ...encounter,
    age_value: 61,
    complaint_class: "abdominal_pain"
  };
  const diaphoretic = scorePresentation(abdominalPain, {
    ...observation,
    visual: { ...visual, diaphoretic: true }
  }, protocol);
  assert.equal(diaphoretic.score, 13);

  const younger = scorePresentation({
    ...abdominalPain,
    age_value: 54,
    complaint_qualifiers: ["radiating"]
  }, observation, protocol);
  assert.equal(younger.score, 6);
});

test("unknown complaint class retains base risk 8", () => {
  const result = scorePresentation({
    ...encounter,
    complaint_class: "unknown"
  }, observation, protocol);
  assert.deepEqual(result, {
    class: "unknown",
    base: 8,
    modifiers: [],
    score: 8,
    clamped: false
  });
});

test("clamps chest pain at 20 without hiding any modifier", () => {
  const result = scorePresentation({
    ...encounter,
    age_value: 65,
    sex: "F",
    complaint_class: "chest_pain",
    complaint_qualifiers: ["exertional"],
    preexisting_flags: ["diabetic"]
  }, {
    ...observation,
    visual: { ...visual, diaphoretic: true }
  }, protocol);

  assert.equal(result.base, 12);
  assert.equal(result.score, 20);
  assert.equal(result.clamped, true);
  assert.equal(result.modifiers.length, 4);
  assert.equal(
    result.modifiers.reduce((sum, modifier) => sum + modifier.points, 0),
    14
  );
});

test("thunderclap headache reaches the P2 presentation floor", () => {
  const result = scorePresentation({
    ...encounter,
    complaint_class: "headache",
    complaint_qualifiers: ["thunderclap"]
  }, observation, protocol);
  assert.equal(result.score, 15);
});

test("anticoagulated minor trauma reaches the P3 presentation floor", () => {
  const result = scorePresentation({
    ...encounter,
    complaint_class: "trauma_minor",
    preexisting_flags: ["anticoagulated"]
  }, observation, protocol);
  assert.equal(result.score, 10);
});

test("the geriatric fever modifier begins at age 65", () => {
  const result = scorePresentation({
    ...encounter,
    age_value: 65,
    complaint_class: "fever"
  }, observation, protocol);
  assert.equal(result.score, 9);
});

test("pregnancy adds the pre-eclampsia headache modifier", () => {
  const result = scorePresentation({
    ...encounter,
    pregnancy_status: "pregnant",
    complaint_class: "headache"
  }, observation, protocol);
  assert.equal(result.score, 13);
});

test("every qualifier chip is referenced by a presentation modifier", () => {
  const qualifiers = new Set([
    "thunderclap",
    "neck_stiffness",
    "neurovascular_compromise",
    "radiating",
    "exertional",
    "sudden_onset",
    "reported_change_from_baseline"
  ]);
  const referenced = new Set();

  function collect(condition) {
    if (condition.all || condition.any) {
      (condition.all || condition.any).forEach(collect);
      return;
    }
    if (condition.field === "complaint_qualifiers" &&
        condition.op === "contains") {
      referenced.add(condition.value);
    }
  }

  for (const definition of Object.values(protocol.presentation.classes)) {
    definition.modifiers.forEach(({ when }) => collect(when));
  }
  assert.deepEqual(referenced, qualifiers);
});
