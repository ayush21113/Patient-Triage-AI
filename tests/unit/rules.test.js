import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  conditionContext,
  evaluateCondition,
  evaluateRules
} from "../../assets/js/engine/rules.js";

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

const adult = {
  age_value: 30,
  age_unit: "years",
  pregnancy_status: "not_pregnant",
  sex: "M",
  complaint_class: "minor_illness",
  complaint_qualifiers: [],
  preexisting_flags: []
};

const normal = {
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

const cases = [
  ["RULE-AIRWAY-01", adult, { ...normal, visual: { ...visual, airway_compromise: true } }, adult, normal],
  ["RULE-CONSC-01", adult, { ...normal, acvpu: "U" }, adult, normal],
  ["RULE-CONSC-02", adult, { ...normal, acvpu: "C" }, adult, normal],
  ["RULE-BLEED-01", adult, { ...normal, visual: { ...visual, active_major_bleeding: true } }, adult, normal],
  ["RULE-SEIZ-01", adult, { ...normal, visual: { ...visual, seizure_active: true } }, adult, normal],
  ["RULE-RESP-01", adult, { ...normal, spo2: 84 }, adult, { ...normal, spo2: 85 }],
  ["RULE-RESP-02", adult, { ...normal, rr: 30 }, adult, { ...normal, rr: 29 }],
  ["RULE-CIRC-01", adult, { ...normal, sbp: 89, hr: 121 }, adult, { ...normal, sbp: 89, hr: 120 }],
  ["RULE-CIRC-02", adult, { ...normal, hr: 131 }, adult, { ...normal, hr: 130 }],
  ["RULE-PAED-01", { ...adult, age_value: 89, age_unit: "days" }, { ...normal, temp_c: 38 }, { ...adult, age_value: 90, age_unit: "days" }, { ...normal, temp_c: 38 }],
  ["RULE-PAED-02", { ...adult, age_value: 5, age_unit: "years" }, { ...normal, sbp: 79 }, { ...adult, age_value: 5, age_unit: "years" }, { ...normal, sbp: 80 }],
  ["RULE-PAED-03", { ...adult, age_value: 4, age_unit: "years" }, { ...normal, hr: 121 }, { ...adult, age_value: 4, age_unit: "years" }, { ...normal, hr: 120 }],
  ["RULE-PAED-04", { ...adult, age_value: 3, age_unit: "years" }, { ...normal, spo2: 89 }, { ...adult, age_value: 3, age_unit: "years" }, { ...normal, spo2: 90 }],
  ["RULE-PAED-05", { ...adult, age_value: 3, age_unit: "years" }, { ...normal, rr: 14 }, { ...adult, age_value: 3, age_unit: "years" }, { ...normal, rr: 15 }],
  ["RULE-OBS-01", { ...adult, pregnancy_status: "pregnant" }, { ...normal, sbp: 151 }, { ...adult, pregnancy_status: "pregnant" }, { ...normal, sbp: 150 }],
  ["RULE-OBS-02", { ...adult, pregnancy_status: "pregnant" }, { ...normal, visual: { ...visual, heavy_vaginal_bleeding: true } }, { ...adult, pregnancy_status: "pregnant" }, normal]
];

for (const [ruleId, positiveEncounter, positiveObservation,
  negativeEncounter, negativeObservation] of cases) {
  test(`${ruleId} fires only on its positive case`, () => {
    const positive = evaluateRules(
      positiveEncounter,
      positiveObservation,
      protocol
    ).find(firing => firing.ruleId === ruleId);
    assert.ok(positive);
    if (positive.action === "PIN_P1") {
      assert.equal(positive.modelLockedOut, true);
    }

    const negative = evaluateRules(
      negativeEncounter,
      negativeObservation,
      protocol
    ).find(firing => firing.ruleId === ruleId);
    assert.equal(negative, undefined);
  });
}

test("evaluates every matching rule without stopping at the first firing", () => {
  const firings = evaluateRules(adult, {
    ...normal,
    visual: {
      ...visual,
      airway_compromise: true,
      active_major_bleeding: true,
      seizure_active: true
    }
  }, protocol);
  assert.deepEqual(
    firings.map(({ ruleId }) => ruleId),
    ["RULE-AIRWAY-01", "RULE-BLEED-01", "RULE-SEIZ-01"]
  );
});

test("missing and unobtainable fields never fire a rule", () => {
  assert.equal(evaluateRules(adult, { ...normal, spo2: null }, protocol)
    .some(({ ruleId }) => ruleId === "RULE-RESP-01"), false);
  assert.equal(evaluateRules(adult, {
    ...normal,
    spo2: 80,
    unobtainable: ["spo2"]
  }, protocol).some(({ ruleId }) => ruleId === "RULE-RESP-01"), false);
});

test("paediatric respiratory gates replace the adult-only rules", () => {
  const encounter = { ...adult, age_value: 3, age_unit: "years" };
  const ruleIds = evaluateRules(encounter, {
    ...normal,
    spo2: 87,
    rr: 7
  }, protocol).map(({ ruleId }) => ruleId);

  assert.equal(ruleIds.includes("RULE-RESP-01"), false);
  assert.equal(ruleIds.includes("RULE-RESP-02"), false);
  assert.equal(ruleIds.includes("RULE-PAED-04"), true);
  assert.equal(ruleIds.includes("RULE-PAED-05"), true);
});

test("paediatric hypotension follows the age formula at 1, 5 and 10 years", () => {
  for (const age of [1, 5, 10]) {
    const floor = 70 + 2 * age;
    const encounter = { ...adult, age_value: age, age_unit: "years" };
    assert.equal(evaluateRules(encounter, {
      ...normal,
      sbp: floor - 1
    }, protocol).some(({ ruleId }) => ruleId === "RULE-PAED-02"), true);
    assert.equal(evaluateRules(encounter, {
      ...normal,
      sbp: floor
    }, protocol).some(({ ruleId }) => ruleId === "RULE-PAED-02"), false);
  }
});

test("paediatric bradypnoea floor applies to every age band", () => {
  const ages = [
    [1, "days", "neonate"],
    [6, "months", "infant"],
    [2, "years", "toddler"],
    [4, "years", "preschool"],
    [8, "years", "school"],
    [14, "years", "adolescent"]
  ];

  for (const [ageValue, ageUnit, band] of ages) {
    const floor = protocol.physiology.paediatricBradypnoeaFloor[band];
    const encounter = { ...adult, age_value: ageValue, age_unit: ageUnit };
    assert.equal(evaluateRules(encounter, {
      ...normal,
      rr: floor
    }, protocol).some(({ ruleId }) => ruleId === "RULE-PAED-05"), true);
    assert.equal(evaluateRules(encounter, {
      ...normal,
      rr: floor + 1
    }, protocol).some(({ ruleId }) => ruleId === "RULE-PAED-05"), false);
  }
});

test("supports every leaf operator in the condition grammar", () => {
  const context = conditionContext(adult, normal, protocol);
  const conditions = [
    { field: "hr", op: "<", value: 81 },
    { field: "hr", op: "<=", value: 80 },
    { field: "hr", op: ">", value: 79 },
    { field: "hr", op: ">=", value: 80 },
    { field: "sex", op: "=", value: "M" },
    { field: "sex", op: "!=", value: "F" },
    { field: "sex", op: "in", value: ["M", "F"] },
    { field: "preexisting_flags", op: "contains", value: "diabetic" },
    { field: "visual.pale", op: "isTrue" }
  ];
  const matchingContext = {
    ...context,
    preexisting_flags: ["diabetic"],
    visual: { ...visual, pale: true }
  };
  for (const condition of conditions) {
    assert.equal(evaluateCondition(condition, matchingContext, protocol), true);
  }
});
