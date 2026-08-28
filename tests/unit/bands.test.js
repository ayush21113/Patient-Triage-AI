import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  assignBand,
  bandForIndex,
  candidateBands,
  priorityIndex
} from "../../assets/js/engine/bands.js";

const protocol = JSON.parse(await readFile(
  new URL("../../assets/data/protocol.v1.json", import.meta.url),
  "utf8"
));

function uncertainty(confidence, candidates, interval = [40, 60]) {
  return {
    evidenceCompleteness: 1,
    interval,
    halfWidth: (interval[1] - interval[0]) / 2,
    driftUncertainty: 0,
    candidateBands: candidates,
    confidence,
    tieBrokenUpward: false,
    resolvingQuestion: confidence === "UNRESOLVED" ? "Question?" : null,
    resolvingQuestionId: confidence === "UNRESOLVED" ? "RQ-TEST" : null,
    expectedInformationGain: confidence === "UNRESOLVED" ? 0.8 : null,
    noQuestionReason: confidence === "UNRESOLVABLE"
      ? "no_questions_defined_for_class"
      : null
  };
}

test("maps every index threshold without off-by-one errors", () => {
  assert.equal(bandForIndex(82, protocol), "P1");
  assert.equal(bandForIndex(81.999, protocol), "P2");
  assert.equal(bandForIndex(62, protocol), "P2");
  assert.equal(bandForIndex(38, protocol), "P3");
  assert.equal(bandForIndex(18, protocol), "P4");
  assert.equal(bandForIndex(17.999, protocol), "P5");
});

test("interval candidates include only bands crossed with positive width", () => {
  assert.deepEqual(candidateBands([55, 70], protocol), ["P2", "P3"]);
  assert.deepEqual(candidateBands([38, 62], protocol), ["P3"]);
  assert.deepEqual(candidateBands([0, 100], protocol), [
    "P1", "P2", "P3", "P4", "P5"
  ]);
  assert.deepEqual(candidateBands([62, 62], protocol), ["P2"]);
});

test("the documented floor arithmetic reaches P2 only by presentation", () => {
  const index = priorityIndex(1, 20, 20, protocol);
  assert.equal(Number(index.toFixed(1)), 56.5);
  assert.equal(bandForIndex(index, protocol), "P3");

  const result = assignBand(
    index,
    uncertainty("ESTABLISHED", ["P3"], [50, 60]),
    [],
    20,
    protocol
  );
  assert.equal(result.band, "P2");
  assert.equal(result.provisionalBand, "P2");
  assert.equal(result.bandSetBy, "presentation_floor");
});

test("PIN_P1 overrides the model and clears abstention instructions", () => {
  const result = assignBand(
    45,
    uncertainty("UNRESOLVED", ["P3", "P4"]),
    [{ action: "PIN_P1" }],
    1,
    protocol
  );
  assert.equal(result.band, "P1");
  assert.equal(result.provisionalBand, "P1");
  assert.equal(result.bandSetBy, "hard_rule");
  assert.equal(result.confidence, "ESTABLISHED");
  assert.equal(result.modelLockedOut, true);
  assert.equal(result.resolvingQuestionId, null);
});

test("a floor above every ambiguous candidate resolves that ambiguity", () => {
  const result = assignBand(
    30,
    uncertainty("UNRESOLVED", ["P4", "P5"], [15, 35]),
    [],
    15,
    protocol
  );
  assert.equal(result.band, "P2");
  assert.equal(result.confidence, "ESTABLISHED");
  assert.equal(result.bandSetBy, "presentation_floor");
  assert.equal(result.resolvingQuestionId, null);
});

test("an insufficient assessment keeps abstaining at its floor", () => {
  const result = assignBand(
    30,
    uncertainty("INSUFFICIENT", ["P3", "P4", "P5"], [10, 50]),
    [],
    15,
    protocol
  );
  assert.equal(result.band, null);
  assert.equal(result.provisionalBand, "P2");
  assert.equal(result.confidence, "INSUFFICIENT");
  assert.equal(result.bandSetBy, "presentation_floor");
});

test("a lower-boundary tie selects the higher model band", () => {
  const result = assignBand(15, {
    ...uncertainty("PROBABLE", ["P4", "P5"], [4, 26]),
    tieBrokenUpward: true
  }, [], 1, protocol);
  assert.equal(result.band, "P4");
  assert.equal(result.provisionalBand, "P4");
  assert.equal(result.bandSetBy, "model");
  assert.equal(result.tieBrokenUpward, true);
  assert.equal(result.resolvingQuestionId, null);
});
