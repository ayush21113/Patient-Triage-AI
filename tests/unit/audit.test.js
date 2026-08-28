import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  buildAuditExport,
  canonicalJson,
  createAuditLog,
  scoreFingerprint,
  verifyAuditChain
} from "../../assets/js/audit.js";
import { assessBoard } from "../../assets/js/sim/board.js";
import { createMemoryAuditStore } from "../../assets/js/util/storage.js";

const cohort = JSON.parse(await readFile(
  new URL("../../assets/data/cohort.json", import.meta.url),
  "utf8"
));
const protocol = JSON.parse(await readFile(
  new URL("../../assets/data/protocol.v1.json", import.meta.url),
  "utf8"
));

test("canonical JSON ignores object insertion order", () => {
  assert.equal(
    canonicalJson({ z: 1, a: { d: 2, c: 3 } }),
    canonicalJson({ a: { c: 3, d: 2 }, z: 1 })
  );
});

test("each append verifies and extends the hash chain", async () => {
  const records = [];
  const audit = await createAuditLog(createMemoryAuditStore(records), {
    shiftId: "SH-TEST",
    actor: "STAFF-04"
  });
  const now = Date.parse(cohort.boardStartsAt);
  const board = assessBoard(cohort, protocol, now);
  await audit.recordScores(board.slice(0, 1), now);
  await audit.recordOverride(board[0], {
    engineBand: "P1",
    nurseBand: "P1",
    at: now
  });
  await audit.recordModeChange({
    fromMode: "NORMAL",
    toMode: "SURGE",
    at: now,
    trigger: {
      arrivalRatePerHour: 20,
      multiplier: 20 / 6,
      baselineArrivalsPerHour: 6,
      trailingWindowMinutes: 15
    },
    auto: true
  });
  assert.equal(records.length, 3);
  assert.equal(records[1].prevHash, records[0].hash);
  assert.equal(records[2].type, "MODE_CHANGE");
  assert.equal(records[2].payload.trigger.arrivalRatePerHour, 20);
  assert.equal(await audit.verify(), true);
  records[0].payload.priorityIndex = 0;
  assert.equal(await verifyAuditChain(records), false);
  await assert.rejects(
    audit.recordScores(board.slice(1, 2), now),
    /Audit chain verification failed/
  );
});

test("SCORE changes remain under 500 across an eight-hour shift", () => {
  const startedAt = Date.parse(cohort.boardStartsAt);
  const previous = new Map();
  let events = 0;
  for (let minute = 0; minute <= 480; minute += 1) {
    for (const { encounter, assessment } of assessBoard(
      cohort,
      protocol,
      startedAt + minute * 60_000
    )) {
      const id = encounter.encounter_id;
      const fingerprint = scoreFingerprint(assessment);
      if (previous.get(id) !== fingerprint) {
        previous.set(id, fingerprint);
        events += 1;
      }
    }
  }
  assert.ok(events < 500, `${events} SCORE events`);
});

test("JSON and CSV exports are complete and chain-verified", async () => {
  const records = [];
  const audit = await createAuditLog(createMemoryAuditStore(records), {
    shiftId: "SH-TEST",
    actor: "STAFF-04"
  });
  const now = Date.parse(cohort.boardStartsAt);
  await audit.recordScores(assessBoard(cohort, protocol, now).slice(0, 2), now);
  const json = await buildAuditExport(records, "json", now);
  const parsed = JSON.parse(json.content);
  assert.equal(parsed.chainVerified, true);
  assert.deepEqual(parsed.records, records);
  const csv = await buildAuditExport(records, "csv", now);
  assert.match(csv.content, /"sequence","eventId","shiftId"/);
  for (const record of records) {
    assert.match(csv.content, new RegExp(record.hash));
    assert.match(csv.content, new RegExp(record.eventId));
  }
});
