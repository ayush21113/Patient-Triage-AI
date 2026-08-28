import assert from "node:assert/strict";
import test from "node:test";
import { reassessmentPrompt } from "../../assets/js/render/board.js";

const MINUTE = 60_000;
const assessment = { reassessDueAt: 30 * MINUTE };

test("a P3 becomes overdue after 31 minutes", () => {
  assert.deepEqual(reassessmentPrompt(assessment, 0, 31 * MINUTE), {
    overdue: true,
    level: 1,
    overdueMinutes: 1
  });
});

test("each missed reassessment interval increases visibility", () => {
  assert.equal(reassessmentPrompt(assessment, 0, 30 * MINUTE).level, 0);
  assert.equal(reassessmentPrompt(assessment, 0, 31 * MINUTE).level, 1);
  assert.equal(reassessmentPrompt(assessment, 0, 61 * MINUTE).level, 2);
  assert.equal(reassessmentPrompt(assessment, 0, 91 * MINUTE).level, 3);
  assert.equal(reassessmentPrompt(assessment, 0, 181 * MINUTE).level, 3);
});

test("an immediate P1 interval receives maximum visibility", () => {
  assert.equal(reassessmentPrompt({ reassessDueAt: 0 }, 0, 1).level, 3);
});
