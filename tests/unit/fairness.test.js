import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fairnessSnapshot } from "../../assets/js/fairness.js";
import { score } from "../../assets/js/engine/index.js";
import { assessBoard } from "../../assets/js/sim/board.js";

const protocol = JSON.parse(await readFile(new URL(
  "../../assets/data/protocol.v1.json",
  import.meta.url
)));
const cohort = JSON.parse(await readFile(new URL(
  "../../assets/data/cohort.json",
  import.meta.url
)));

test("fairness snapshot covers sex, age band and language", () => {
  const now = Date.parse(cohort.boardStartsAt) + 60 * 60_000;
  const snapshot = fairnessSnapshot(
    assessBoard(cohort, protocol, now),
    protocol
  );
  assert.deepEqual(
    [...new Set(snapshot.subgroups.map(group => group.dimension))].sort(),
    ["age band", "language", "sex"]
  );
  assert.match(snapshot.headline, /\d+\.\d× the board rate\.$/);
  assert.ok(snapshot.worstServed.label.length > 0);
  assert.ok(snapshot.subgroups.every(group => group.n > 0));
  assert.ok(snapshot.subgroups.every(group =>
    Object.values(group.distribution).reduce((sum, count) => sum + count, 0) ===
      group.n
  ));
  assert.ok(snapshot.subgroups.some(group =>
    group.dimension === "sex" && group.subgroup === "—"
  ));
});

test("missing demographic values remain visible as unrecorded", () => {
  const now = Date.parse(cohort.boardStartsAt);
  const board = assessBoard(cohort, protocol, now);
  board[0] = {
    ...board[0],
    encounter: {
      ...board[0].encounter,
      age_value: null,
      sex: "unknown",
      language: null
    }
  };
  const snapshot = fairnessSnapshot(board, protocol);
  for (const dimension of ["age band", "sex", "language"]) {
    assert.ok(snapshot.subgroups.some(group =>
      group.dimension === dimension && group.subgroup === "—"
    ));
  }
});

test("flagged subgroups retain their underlying encounter IDs", () => {
  const now = Date.parse(cohort.boardStartsAt) + 60 * 60_000;
  const snapshot = fairnessSnapshot(
    assessBoard(cohort, protocol, now),
    protocol
  );
  const flagged = snapshot.subgroups.filter(group => group.flagged);
  assert.ok(flagged.length > 0);
  assert.ok(flagged.every(group => group.encounterIds.length === group.n));
  assert.ok(flagged.flatMap(group => group.encounterIds)
    .every(encounterId => encounterId.startsWith("PT-")));
});

test("zero-upgrade boards still name a subgroup and a comparison multiple", () => {
  const now = Date.parse(cohort.boardStartsAt);
  const board = assessBoard(cohort, protocol, now).map(row => {
    const encounter = {
      ...row.encounter,
      observations: [row.encounter.observations[0]]
    };
    return {
      ...row,
      encounter,
      assessment: score(
        encounter,
        protocol,
        encounter.observations[0].observed_at
      )
    };
  });
  const snapshot = fairnessSnapshot(board, protocol);
  assert.match(snapshot.headline, /^Patients .+1\.0× the board rate\.$/);
});
