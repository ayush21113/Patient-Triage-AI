import assert from "node:assert/strict";
import test from "node:test";
import {
  applyOverrideOrder,
  overrideForMove
} from "../../assets/js/render/override.js";

function row(id, band, modelLockedOut = false) {
  return {
    encounter: { encounter_id: id },
    assessment: {
      band,
      provisionalBand: band,
      confidence: "ESTABLISHED",
      priorityIndex: 50,
      modelLockedOut
    }
  };
}

test("an override moves once and preserves rule-pinned precedence", () => {
  const board = [
    row("PT-0001", "P1", true),
    row("PT-0002", "P2"),
    row("PT-0003", "P3"),
    row("PT-0004", "P4")
  ];
  const override = overrideForMove(board, {}, "PT-0004", 0, 1000);
  assert.equal(override.nurseBand, "P1");
  assert.equal(override.direction, "upgrade");
  assert.equal(override.targetRank, 1);
  assert.deepEqual(
    applyOverrideOrder(board, { "PT-0004": override })
      .map(({ encounter }) => encounter.encounter_id),
    ["PT-0001", "PT-0004", "PT-0002", "PT-0003"]
  );
  assert.equal(overrideForMove(board, {}, "PT-0001", 3, 1000), null);
});
