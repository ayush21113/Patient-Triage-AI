import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  assessBoard,
  createBoardSimulation
} from "../../assets/js/sim/board.js";

const cohort = JSON.parse(await readFile(
  new URL("../../assets/data/cohort.json", import.meta.url),
  "utf8"
));
const protocol = JSON.parse(await readFile(
  new URL("../../assets/data/protocol.v1.json", import.meta.url),
  "utf8"
));
const boardStartsAt = Date.parse(cohort.boardStartsAt);

test("the headless loop recomputes and reorders 90 simulated minutes", () => {
  const simulation = createBoardSimulation(cohort, protocol);
  const initial = simulation.board();
  assert.ok(
    initial.findIndex(({ encounter }) =>
      encounter.encounter_id === "PT-0002"
    ) > initial.findIndex(({ encounter }) =>
      encounter.encounter_id === "PT-0010"
    )
  );

  simulation.clock.setSpeed(60, 0);
  simulation.clock.run(0);
  let longestRecomputeMilliseconds = 0;
  for (let wallSecond = 1; wallSecond <= 90; wallSecond += 1) {
    const startedAt = performance.now();
    simulation.clock.tick(wallSecond * 1_000);
    longestRecomputeMilliseconds = Math.max(
      longestRecomputeMilliseconds,
      performance.now() - startedAt
    );
    const now = simulation.clock.now();
    assert.ok(simulation.board().every(row =>
      now - row.lastRecomputedAt <= 60_000
    ));
  }
  simulation.clock.pause(90_000);

  const final = simulation.board();
  assert.ok(
    final.findIndex(({ encounter }) =>
      encounter.encounter_id === "PT-0002"
    ) < final.findIndex(({ encounter }) =>
      encounter.encounter_id === "PT-0010"
    )
  );
  assert.ok(longestRecomputeMilliseconds < 100);
});

test("rule-pinned P1 encounters remain above the index sort", () => {
  const board = assessBoard(cohort, protocol, boardStartsAt);
  assert.equal(board[0].assessment.modelLockedOut, true);
  assert.equal(board[0].assessment.band, "P1");
  const bands = board.map(({ assessment }) => Number(
    (assessment.band ?? assessment.provisionalBand).slice(1)
  ));
  assert.ok(bands.every((band, index) =>
    index === 0 || bands[index - 1] <= band
  ));
});

test("arrival and reassessment records recompute through the board", () => {
  const simulation = createBoardSimulation(structuredClone(cohort), protocol);
  const encounterId = simulation.admitEncounter({
    arrivalMode: "unknown",
    ageValue: null,
    ageUnit: null,
    ageEstimated: true,
    sex: "unknown",
    pregnancyStatus: "unknown",
    gestationWeeks: null,
    language: null,
    complaintText: null,
    complaintClass: "unknown",
    complaintQualifiers: [],
    preexistingFlags: [],
    frame: {
      acvpu: "A",
      painScore: null,
      vitals: {
        hr: null,
        sbp: null,
        dbp: null,
        rr: null,
        spo2: null,
        tempC: null
      },
      visual: {},
      unobtainable: ["hr", "sbp", "dbp", "rr", "spo2", "tempC"]
    }
  });
  const admitted = simulation.board().find(({ encounter }) =>
    encounter.encounter_id === encounterId
  );
  assert.equal(encounterId, "PT-0021");
  assert.ok(admitted.assessment.provisionalBand);
  assert.ok(admitted.assessment.confidence);
  assert.deepEqual(admitted.encounter.observations[0].unobtainable, [
    "hr",
    "sbp",
    "dbp",
    "rr",
    "spo2",
    "temp_c"
  ]);

  simulation.reassessEncounter(encounterId, {
    acvpu: "A",
    painScore: null,
    vitals: {
      hr: 80,
      sbp: 120,
      dbp: 80,
      rr: 16,
      spo2: 98,
      tempC: 37
    },
    visual: {},
    unobtainable: []
  });
  const reassessed = simulation.board().find(({ encounter }) =>
    encounter.encounter_id === encounterId
  );
  assert.equal(reassessed.encounter.observations.at(-1).hr, 80);
  assert.ok(reassessed.assessment.confidence);
});

test("a resolving answer persists and immediately re-scores the encounter", () => {
  const simulation = createBoardSimulation(structuredClone(cohort), protocol);
  const before = simulation.board().find(({ encounter }) =>
    encounter.encounter_id === "PT-0007"
  );
  assert.equal(before.assessment.confidence, "UNRESOLVED");

  simulation.answerQuestion("PT-0007", "RQ-ABDO-02", "yes");
  const after = simulation.board().find(({ encounter }) =>
    encounter.encounter_id === "PT-0007"
  );
  assert.equal(after.assessment.confidence, "PROBABLE");
  assert.equal(after.assessment.band, "P2");
  assert.equal(
    after.assessment.priorityIndex,
    before.assessment.priorityIndex + 11
  );
  assert.deepEqual(after.assessment.derivation.information, [{
    questionId: "RQ-ABDO-02",
    question: "Is the abdomen rigid, or is there rebound tenderness?",
    answer: "yes",
    answeredAt: boardStartsAt,
    shift: 11
  }]);
});

test("cannot assess records no clinical shift and escalates exhausted inquiry", () => {
  const simulation = createBoardSimulation(structuredClone(cohort), protocol);
  const before = simulation.board().find(({ encounter }) =>
    encounter.encounter_id === "PT-0007"
  );
  simulation.answerQuestion(
    "PT-0007",
    "RQ-ABDO-02",
    "cannot_assess"
  );
  const after = simulation.board().find(({ encounter }) =>
    encounter.encounter_id === "PT-0007"
  );
  assert.equal(after.assessment.priorityIndex, before.assessment.priorityIndex);
  assert.equal(after.assessment.confidence, "UNRESOLVABLE");
  assert.equal(
    after.assessment.noQuestionReason,
    "all_questions_already_answered"
  );
});
