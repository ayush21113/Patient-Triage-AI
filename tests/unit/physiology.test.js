import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  ageBand,
  scorePhysiology
} from "../../assets/js/engine/physiology.js";

const protocol = JSON.parse(await readFile(
  new URL("../../assets/data/protocol.v1.json", import.meta.url),
  "utf8"
));
const news2Chart = JSON.parse(await readFile(
  new URL("../fixtures/news2-chart.json", import.meta.url),
  "utf8"
));

const adult = {
  age_value: 30,
  age_unit: "years",
  pregnancy_status: "not_pregnant"
};

const normalAdultObservation = {
  rr: 16,
  spo2: 98,
  spo2_on_oxygen: false,
  sbp: 120,
  hr: 80,
  acvpu: "A",
  temp_c: 37,
  unobtainable: []
};

const boundaries = [
  [27, "days", "neonate"],
  [28, "days", "infant"],
  [11, "months", "infant"],
  [12, "months", "toddler"],
  [2, "years", "toddler"],
  [3, "years", "preschool"],
  [15, "years", "adolescent"],
  [16, "years", "adult"],
  [64, "years", "adult"],
  [65, "years", "older_adult"],
  [79, "years", "older_adult"],
  [80, "years", "elderly"]
];

test("selects the protocol age band at every boundary", () => {
  for (const [value, unit, expected] of boundaries) {
    assert.deepEqual(ageBand(value, unit, protocol), {
      ageBand: expected,
      ageEstimated: false
    });
  }
});

test("uses the protocol fallback for an unknown age", () => {
  assert.deepEqual(ageBand(null, null, protocol), {
    ageBand: "adult",
    ageEstimated: true
  });
});

test("scores every independently transcribed NEWS2 chart cell", () => {
  for (const [field, cells] of Object.entries(news2Chart)) {
    for (const { values, score } of cells) {
      for (const value of values) {
        const result = scorePhysiology(adult, {
          ...normalAdultObservation,
          [field]: value
        }, protocol);
        const parameter = field === "spo2_on_oxygen" ? "onOxygen" : field;
        assert.equal(
          result.perParameter.find(item => item.parameter === parameter).score,
          score,
          `${field}=${value}`
        );
      }
    }
  }
});

test("single-parameter-3 is independent of the aggregate", () => {
  const aggregateHighWithoutThree = scorePhysiology(adult, {
    ...normalAdultObservation,
    rr: 21,
    spo2: 92,
    spo2_on_oxygen: true,
    hr: 111
  }, protocol);
  assert.equal(aggregateHighWithoutThree.score, 8);
  assert.equal(aggregateHighWithoutThree.singleParameterThree, false);

  const singleThree = scorePhysiology(adult, {
    ...normalAdultObservation,
    rr: 8
  }, protocol);
  assert.equal(singleThree.score, 3);
  assert.equal(singleThree.singleParameterThree, true);
});

test("all population paths score seven parameters and reach exactly 20", () => {
  const cases = {
    adult: [adult, {
      ...normalAdultObservation,
      rr: 8,
      spo2: 91,
      spo2_on_oxygen: true,
      sbp: 90,
      hr: 40,
      acvpu: "U",
      temp_c: 35
    }],
    paediatric: [{
      ...adult,
      age_value: 3
    }, {
      ...normalAdultObservation,
      rr: 7,
      spo2: 91,
      spo2_on_oxygen: true,
      sbp: 50,
      hr: 50,
      acvpu: "U",
      temp_c: 35
    }],
    obstetric: [{
      ...adult,
      pregnancy_status: "pregnant"
    }, {
      ...normalAdultObservation,
      rr: 8,
      spo2: 91,
      spo2_on_oxygen: true,
      sbp: 89,
      hr: 40,
      acvpu: "U",
      temp_c: 35
    }]
  };
  const maxima = protocol.physiology.parameterMaxima;

  assert.equal(
    ["rr", "spo2", "onOxygen", "sbp", "hr", "acvpu", "temp_c"]
      .reduce((total, parameter) => total + maxima[parameter], 0),
    maxima.total
  );
  for (const [population, [encounter, observation]] of Object.entries(cases)) {
    const result = scorePhysiology(encounter, observation, protocol);
    assert.equal(Object.keys(maxima.populationPaths[population]).length, 7);
    assert.equal(result.perParameter.length, 7);
    assert.equal(result.score, maxima.total);
    for (const item of result.perParameter) {
      assert.equal(item.score, maxima[item.parameter]);
    }
  }
});

test("scores paediatric SpO2 at every boundary pair", () => {
  const child = { ...adult, age_value: 3 };
  const expected = [
    [91, 3], [92, 2], [94, 2], [95, 1], [96, 1], [97, 0]
  ];
  for (const [spo2, score] of expected) {
    const result = scorePhysiology(child, {
      ...normalAdultObservation,
      spo2
    }, protocol);
    assert.equal(
      result.perParameter.find(item => item.parameter === "spo2").score,
      score
    );
  }
});

test("scores paediatric deviation and danger-zone ceilings", () => {
  const neonate = { ...adult, age_value: 1, age_unit: "days" };
  for (const [hr, expected] of [[100, 0], [85, 1], [70, 2], [69, 3]]) {
    const result = scorePhysiology(neonate, {
      ...normalAdultObservation,
      hr
    }, protocol);
    assert.equal(
      result.perParameter.find(item => item.parameter === "hr").score,
      expected,
      `hr=${hr}`
    );
  }

  const dangerZone = scorePhysiology(neonate, {
    ...normalAdultObservation,
    hr: 191
  }, protocol);
  assert.equal(
    dangerZone.perParameter.find(item => item.parameter === "hr").score,
    protocol.physiology.parameterMaxima.hr
  );
});

test("uses obstetric circulatory shifts after adult age selection", () => {
  const pregnant = { ...adult, pregnancy_status: "pregnant" };
  for (const [sbp, expected] of [
    [140, 0],
    [141, 1],
    [150, 1],
    [151, 2],
    [160, 2],
    [161, 3]
  ]) {
    const result = scorePhysiology(pregnant, {
      ...normalAdultObservation,
      sbp
    }, protocol);
    assert.equal(
      result.perParameter.find(item => item.parameter === "sbp").score,
      expected
    );
  }

  const shiftedHeartRate = scorePhysiology(pregnant, {
    ...normalAdultObservation,
    hr: 111
  }, protocol);
  assert.equal(
    shiftedHeartRate.perParameter.find(item => item.parameter === "hr").score,
    2
  );
});

test("returns explicit derivation and missing capture fields", () => {
  const result = scorePhysiology(adult, {
    ...normalAdultObservation,
    rr: null,
    spo2: 80,
    unobtainable: ["spo2"]
  }, protocol);
  assert.deepEqual(result.missing, ["rr", "spo2"]);
  assert.equal(result.perParameter.length, 5);
  assert.equal(result.score, 0);
});

test("throws when a scoring table has a gap", () => {
  const brokenProtocol = structuredClone(protocol);
  brokenProtocol.physiology.adultNEWS2.rr = [
    { max: 8, score: 3 },
    { min: 10, score: 0 }
  ];
  assert.throws(() => scorePhysiology(adult, {
    ...normalAdultObservation,
    rr: 9
  }, brokenProtocol), /no band/);
});
