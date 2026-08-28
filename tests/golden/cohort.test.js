import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { score } from "../../assets/js/engine/index.js";
import { projectEncounter } from "../../assets/js/sim/cohort.js";

const protocol = JSON.parse(await readFile(
  new URL("../../assets/data/protocol.v1.json", import.meta.url),
  "utf8"
));
const cohort = JSON.parse(await readFile(
  new URL("../../assets/data/cohort.json", import.meta.url),
  "utf8"
));
const boardStartsAt = Date.parse(cohort.boardStartsAt);
const minute = 60_000;

function expectedOutput(assessment, now) {
  return {
    band: assessment.band,
    provisionalBand: assessment.provisionalBand,
    bandSetBy: assessment.bandSetBy,
    confidence: assessment.confidence,
    rulesFired: assessment.rulesFired.map(({ ruleId }) => ruleId),
    modelLockedOut: assessment.modelLockedOut,
    alert: assessment.alert,
    candidateBands: assessment.candidateBands,
    tieBrokenUpward: assessment.tieBrokenUpward,
    overdueReassessment: now > assessment.reassessDueAt
  };
}

function snapshotAt(atMinute) {
  const now = boardStartsAt + atMinute * minute;
  return cohort.encounters.map(source => ({
    encounterId: source.encounterId,
    assessment: score(
      projectEncounter(source, boardStartsAt, atMinute),
      protocol,
      now
    )
  }));
}

for (const atMinute of [0, 30, 60]) {
  test(`full cohort assessment matches the t=${atMinute} golden`, async () => {
    const golden = JSON.parse(await readFile(
      new URL(`./snapshots/cohort-t${atMinute}.json`, import.meta.url),
      "utf8"
    ));
    assert.deepEqual(snapshotAt(atMinute), golden);
  });
}

test("the shipped cohort contains 20 unique complete encounters", () => {
  assert.equal(cohort.encounters.length, 20);
  assert.equal(new Set(cohort.encounters.map(({ encounterId }) =>
    encounterId
  )).size, 20);
  assert.ok(cohort.encounters.every(({ trajectory, expect }) =>
    trajectory.length > 0 && expect
  ));
});

for (const source of cohort.encounters) {
  const expectations = Array.isArray(source.expect)
    ? source.expect
    : [source.expect];
  for (const expected of expectations) {
    test(`${source.encounterId} matches clinical intent at minute ${expected.at}`, () => {
      const now = boardStartsAt + expected.at * minute;
      const actual = expectedOutput(
        score(
          projectEncounter(source, boardStartsAt, expected.at),
          protocol,
          now
        ),
        now
      );
      const assertedFields = Object.keys(expected).filter(field =>
        Object.hasOwn(actual, field)
      );
      assert.deepEqual(
        Object.fromEntries(assertedFields.map(field => [field, actual[field]])),
        Object.fromEntries(assertedFields.map(field => [field, expected[field]]))
      );
      if (expected.bandIn) {
        assert.ok(expected.bandIn.includes(actual.band));
      }
      if (expected.confidenceIn) {
        assert.ok(expected.confidenceIn.includes(actual.confidence));
      }
    });
  }
}
