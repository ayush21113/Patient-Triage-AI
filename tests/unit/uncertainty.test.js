import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  assessUncertainty,
  assertUncertaintyContract,
  driftUncertainty,
  driftUncertaintyValue,
  evidenceCompleteness,
  expectedInformationGain,
  monotonicFraction,
  selectResolvingQuestion
} from "../../assets/js/engine/uncertainty.js";

const protocol = JSON.parse(await readFile(
  new URL("../../assets/data/protocol.v1.json", import.meta.url),
  "utf8"
));
const minute = 60_000;

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

const encounter = {
  age_value: 61,
  age_unit: "years",
  sex: "M",
  pregnancy_status: "not_pregnant",
  complaint_class: "abdominal_pain",
  complaint_qualifiers: [],
  preexisting_flags: []
};

const observation = {
  observed_at: 0,
  hr: 80,
  sbp: 120,
  rr: 16,
  spo2: 98,
  temp_c: 37,
  acvpu: "A",
  visual,
  unobtainable: []
};

const observations = [
  observation,
  { ...observation, observed_at: 30 * minute }
];

function close(actual, expected, tolerance = 1e-10) {
  assert.ok(
    Math.abs(actual - expected) < tolerance,
    `${actual} differs from ${expected}`
  );
}

test("removing each weighted input reduces evidence completeness", () => {
  assert.equal(evidenceCompleteness(encounter, observation, protocol), 1);
  for (const [field, weight] of Object.entries(
    protocol.uncertainty.inputWeights
  )) {
    const changedEncounter = field === "complaint_class"
      ? { ...encounter, [field]: null }
      : encounter;
    const changedObservation = field === "complaint_class"
      ? observation
      : { ...observation, [field]: null };
    close(
      evidenceCompleteness(changedEncounter, changedObservation, protocol),
      1 - weight
    );
  }
});

test("unobtainable evidence is unavailable", () => {
  close(evidenceCompleteness(encounter, {
    ...observation,
    unobtainable: ["spo2"]
  }, protocol), 1 - protocol.uncertainty.inputWeights.spo2);
});

test("asserts every executable drift-uncertainty fixture", () => {
  const fixture = protocol.workedExamples.driftUncertainty;
  for (const {
    nObservations,
    observedSpanMinutes,
    monotonicFraction: expectedMonotonicFraction,
    expect
  } of fixture.cases) {
    const series = Array.from({ length: nObservations }, (_, index) => ({
      ...observation,
      observed_at: nObservations === 1
        ? 0
        : observedSpanMinutes * minute * index / (nObservations - 1)
    }));
    assert.equal(
      monotonicFraction(series, protocol),
      expectedMonotonicFraction
    );
    close(
      driftUncertainty(fixture.driftContribution, series, protocol),
      expect
    );
  }

  for (const consistencyCase of fixture.consistencyCases) {
    close(driftUncertaintyValue(
      consistencyCase.driftContribution,
      consistencyCase.nObservations,
      consistencyCase.observedSpanMinutes,
      consistencyCase.monotonicFraction,
      protocol
    ), consistencyCase.expect, 0.005);
  }
});

test("consistent parameter trajectories produce full monotonic evidence", () => {
  const series = [
    { hr: 80, sbp: 120, rr: 16, spo2: 98, temp_c: 37 },
    { hr: 90, sbp: 115, rr: 18, spo2: 97, temp_c: 37.2 },
    { hr: 100, sbp: 110, rr: 20, spo2: 96, temp_c: 37.4 }
  ].map((values, index) => ({
    ...observation,
    ...values,
    observed_at: index * 15 * minute
  }));
  assert.equal(monotonicFraction(series, protocol), 1);
});

test("asserts both executable question-score fixtures", () => {
  assert.equal(
    protocol.uncertainty.informationGain.separationWeight +
      protocol.uncertainty.informationGain.marginWeight +
      protocol.uncertainty.informationGain.spanWeight,
    1
  );
  const abstention = protocol.workedExamples["PT-0007-abstention"];
  const secondQuestion = protocol.resolvingQuestions.find(({ id }) =>
    id === "RQ-ABDO-02"
  );
  close(expectedInformationGain(
    secondQuestion,
    abstention.given.priorityIndex,
    abstention.derived.halfWidth,
    abstention.given.candidateBands,
    protocol
  ), abstention.questionScores[0].expectedInformationGain, 0.00005);

  const firstFixture = protocol.workedExamples[
    "RQ-ABDO-01-if-not-suppressed"
  ];
  const firstQuestion = protocol.resolvingQuestions.find(({ id }) =>
    id === "RQ-ABDO-01"
  );
  close(expectedInformationGain(
    firstQuestion,
    firstFixture.given.priorityIndex,
    (firstFixture.given.interval[1] - firstFixture.given.interval[0]) / 2,
    ["P2", "P3"],
    protocol
  ), firstFixture.expect.expectedInformationGain, 0.00005);
});

test("PT-0007 suppresses RQ-ABDO-01 and selects RQ-ABDO-02", () => {
  const fixture = protocol.workedExamples["PT-0007-abstention"];
  const result = selectResolvingQuestion({
    ...encounter,
    complaint_qualifiers: fixture.given.complaintQualifiers
  }, {
    ...observation,
    visual: { ...visual, diaphoretic: fixture.given.diaphoretic }
  }, fixture.given.priorityIndex, fixture.derived.halfWidth,
  fixture.given.candidateBands, protocol);

  assert.equal(result.resolvingQuestionId, fixture.expect.resolvingQuestionId);
  assert.equal(
    result.expectedInformationGain,
    fixture.expect.expectedInformationGainRounded
  );
  assert.equal(result.noQuestionReason, fixture.expect.noQuestionReason);
});

test("RQ-ABDO-01 ranks first when it is not suppressed", () => {
  const fixture = protocol.workedExamples[
    "RQ-ABDO-01-if-not-suppressed"
  ];
  const result = selectResolvingQuestion(
    encounter,
    observation,
    fixture.given.priorityIndex,
    (fixture.given.interval[1] - fixture.given.interval[0]) / 2,
    ["P2", "P3"],
    protocol
  );
  assert.equal(result.resolvingQuestionId, "RQ-ABDO-01");
  assert.equal(result.expectedInformationGain, 0.87);
});

test("a 60:40 boundary split is unresolved with exactly one question", () => {
  const result = assessUncertainty(
    encounter,
    observations,
    63,
    ["P2", "P3"],
    0,
    protocol
  );
  assert.deepEqual(result.interval, [58, 68]);
  assert.equal(result.confidence, "UNRESOLVED");
  assert.equal(result.resolvingQuestionId, "RQ-ABDO-01");
  assert.equal(typeof result.resolvingQuestion, "string");
});

test("reports established and probable confidence", () => {
  const established = assessUncertainty(
    encounter,
    observations,
    70,
    ["P2"],
    0,
    protocol
  );
  assert.equal(established.confidence, "ESTABLISHED");

  const probable = assessUncertainty(
    encounter,
    observations,
    63.5,
    ["P2", "P3"],
    0,
    protocol
  );
  assert.deepEqual(probable.interval, [58.5, 68.5]);
  assert.equal(probable.confidence, "PROBABLE");
});

test("evidence below 0.45 is insufficient", () => {
  const sparse = {
    ...observation,
    hr: null,
    sbp: null,
    rr: null,
    spo2: null,
    temp_c: null
  };
  const result = assessUncertainty(
    encounter,
    [sparse, { ...sparse, observed_at: 30 * minute }],
    63,
    ["P2", "P3"],
    0,
    protocol
  );
  assert.equal(result.evidenceCompleteness, 0.32);
  assert.equal(result.confidence, "INSUFFICIENT");
});

test("all answered questions make ambiguity unresolvable", () => {
  const chestPain = {
    ...encounter,
    complaint_class: "chest_pain",
    complaint_qualifiers: ["exertional"]
  };
  const diaphoretic = {
    ...observation,
    visual: { ...visual, diaphoretic: true }
  };
  const result = assessUncertainty(
    chestPain,
    [diaphoretic, { ...diaphoretic, observed_at: 30 * minute }],
    63,
    ["P2", "P3"],
    0,
    protocol
  );
  assert.equal(result.confidence, "UNRESOLVABLE");
  assert.equal(result.resolvingQuestionId, null);
  assert.equal(result.noQuestionReason, "all_questions_already_answered");
});

test("records the information-floor reason", () => {
  const wideProtocol = structuredClone(protocol);
  wideProtocol.uncertainty.baseWidth = 100;
  const minor = { ...encounter, complaint_class: "minor_illness" };
  const result = assessUncertainty(
    minor,
    observations,
    80,
    ["P2", "P3"],
    0,
    wideProtocol
  );
  assert.equal(result.confidence, "UNRESOLVABLE");
  assert.equal(
    result.noQuestionReason,
    "no_question_above_information_threshold"
  );
});

test("lower-acuity boundaries tie-break upward without abstaining", () => {
  for (const candidateBands of [["P3", "P4"], ["P4", "P5"]]) {
    const result = assessUncertainty(
      encounter,
      observations,
      protocol.bandThresholds[candidateBands[0]],
      candidateBands,
      0,
      protocol
    );
    assert.equal(result.confidence, "PROBABLE");
    assert.equal(result.tieBrokenUpward, true);
    assert.equal(result.resolvingQuestionId, null);
    assert.equal(result.noQuestionReason, null);
  }
});

test("records when a complaint class defines no questions", () => {
  const withoutQuestions = structuredClone(protocol);
  withoutQuestions.resolvingQuestions = withoutQuestions.resolvingQuestions
    .filter(({ complaintClass }) => complaintClass !== "abdominal_pain");
  const result = assessUncertainty(
    encounter,
    observations,
    63,
    ["P2", "P3"],
    0,
    withoutQuestions
  );
  assert.equal(result.confidence, "UNRESOLVABLE");
  assert.equal(result.noQuestionReason, "no_questions_defined_for_class");
});

test("UNRESOLVED with a null question throws", () => {
  assert.throws(() => assertUncertaintyContract({
    confidence: "UNRESOLVED",
    candidateBands: ["P2", "P3"],
    resolvingQuestion: null,
    resolvingQuestionId: null,
    noQuestionReason: null
  }), /requires exactly one resolving question/);
});

test("the same drift widens more with fewer observations", () => {
  const two = assessUncertainty(
    encounter,
    [observation, { ...observation, observed_at: 30 * minute }],
    70,
    ["P2"],
    12.4,
    protocol
  );
  const five = assessUncertainty(
    encounter,
    Array.from({ length: 5 }, (_, index) => ({
      ...observation,
      observed_at: index * 7.5 * minute
    })),
    70,
    ["P2"],
    12.4,
    protocol
  );
  assert.equal(two.driftUncertainty, 8);
  close(five.driftUncertainty, 2.17);
  assert.ok(two.halfWidth > five.halfWidth);
});

test("single reading and unknown fields add their documented penalties", () => {
  const result = assessUncertainty({
    ...encounter,
    age_value: null,
    age_unit: null,
    sex: "unknown"
  }, [observation], 70, ["P2"], 12.4, protocol);
  assert.equal(result.driftUncertainty, 0);
  assert.equal(result.halfWidth, 16.5);
});

test("question ranking is stable across 100 input-key shuffles", () => {
  function reorder(source, iteration) {
    const entries = Object.entries(source);
    const offset = iteration % entries.length;
    const rotated = entries.slice(offset).concat(entries.slice(0, offset));
    return Object.fromEntries(iteration % 2 ? rotated.reverse() : rotated);
  }

  for (let iteration = 0; iteration < 100; iteration += 1) {
    const result = selectResolvingQuestion(
      reorder(encounter, iteration),
      reorder(observation, iteration),
      63.4,
      8.3,
      ["P2", "P3"],
      protocol
    );
    assert.equal(result.resolvingQuestionId, "RQ-ABDO-01");
  }
});

test("question ties prefer exact candidate bands, then protocol order", () => {
  const tiedProtocol = structuredClone(protocol);
  tiedProtocol.resolvingQuestions = [
    {
      id: "FIRST-NONEXACT",
      complaintClass: "minor_illness",
      question: "First",
      discriminatesBetween: ["P1", "P2"],
      expectedShiftIfYes: 10,
      expectedShiftIfNo: -10
    },
    {
      id: "FIRST-EXACT",
      complaintClass: "minor_illness",
      question: "Second",
      discriminatesBetween: ["P2", "P3"],
      expectedShiftIfYes: 10,
      expectedShiftIfNo: -10
    },
    {
      id: "SECOND-EXACT",
      complaintClass: "minor_illness",
      question: "Third",
      discriminatesBetween: ["P2", "P3"],
      expectedShiftIfYes: 10,
      expectedShiftIfNo: -10
    }
  ];
  const result = selectResolvingQuestion(
    { ...encounter, complaint_class: "minor_illness" },
    observation,
    63,
    5,
    ["P2", "P3"],
    tiedProtocol
  );
  assert.equal(result.resolvingQuestionId, "FIRST-EXACT");
});
