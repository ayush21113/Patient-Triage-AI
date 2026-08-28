const EMPTY_HASH = "0".repeat(64);
const encoder = new TextEncoder();

export function canonicalJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    return `{${Object.keys(value).sort().map(key =>
      `${JSON.stringify(key)}:${canonicalJson(value[key])}`
    ).join(",")}}`;
  }
  return JSON.stringify(value);
}

async function sha256(value, cryptoApi) {
  const digest = await cryptoApi.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(digest)].map(byte =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

async function eventHash(record, cryptoApi) {
  return sha256(
    `${record.sequence}${record.at}${record.type}${
      canonicalJson(record.payload)
    }${record.prevHash}`,
    cryptoApi
  );
}

export async function verifyAuditChain(
  records,
  cryptoApi = globalThis.crypto
) {
  let prevHash = EMPTY_HASH;
  for (const [index, record] of records.entries()) {
    if (record.sequence !== index + 1 || record.prevHash !== prevHash) {
      return false;
    }
    if (record.hash !== await eventHash(record, cryptoApi)) return false;
    prevHash = record.hash;
  }
  return true;
}

export function scoreFingerprint(assessment) {
  return `${assessment.band ?? assessment.provisionalBand}|${
    assessment.confidence
  }`;
}

function scorePayload(row) {
  const { assessment } = row;
  return {
    band: assessment.band,
    provisionalBand: assessment.provisionalBand,
    bandSetBy: assessment.bandSetBy,
    confidence: assessment.confidence,
    priorityIndex: assessment.priorityIndex,
    interval: assessment.interval,
    rulesFired: assessment.rulesFired,
    evidenceCompleteness: assessment.evidenceCompleteness,
    candidateBands: assessment.candidateBands,
    derivationSnapshot: assessment.derivation
  };
}

function overridePayload(row, override, actor) {
  const observation = row.encounter.observations.at(-1);
  return {
    engineBand: override.engineBand,
    engineConfidence: row.assessment.confidence,
    engineIndex: row.assessment.priorityIndex,
    engineInterval: row.assessment.interval,
    rulesFired: row.assessment.rulesFired,
    inputsSnapshot: {
      encounter: {
        arrivalMode: row.encounter.arrival_mode,
        ageValue: row.encounter.age_value,
        ageUnit: row.encounter.age_unit,
        ageEstimated: row.encounter.age_estimated,
        sex: row.encounter.sex,
        pregnancyStatus: row.encounter.pregnancy_status,
        gestationWeeks: row.encounter.gestation_weeks,
        complaintClass: row.encounter.complaint_class,
        complaintQualifiers: row.encounter.complaint_qualifiers,
        preexistingFlags: row.encounter.preexisting_flags
      },
      observation
    },
    derivationSnapshot: row.assessment.derivation,
    nurseBand: override.nurseBand,
    nurseId: actor,
    reasonChip: null
  };
}

export async function createAuditLog(store, {
  shiftId,
  actor,
  cryptoApi = globalThis.crypto
}) {
  const existing = await store.all();
  if (!await verifyAuditChain(existing, cryptoApi)) {
    throw new Error("Audit chain verification failed");
  }
  const lastScores = new Map();
  for (const record of existing) {
    if (record.type === "SCORE") {
      lastScores.set(
        record.encounterId,
        `${record.payload.band ?? record.payload.provisionalBand}|${
          record.payload.confidence
        }`
      );
    }
  }
  let writes = Promise.resolve();

  function append(type, encounterId, payload, at, eventActor) {
    const operation = writes.then(async () => {
      const records = await store.all();
      if (!await verifyAuditChain(records, cryptoApi)) {
        throw new Error("Audit chain verification failed");
      }
      const sequence = records.length + 1;
      const record = {
        eventId: `EV-${String(sequence).padStart(6, "0")}`,
        sequence,
        shiftId,
        at: new Date(at).toISOString(),
        type,
        encounterId,
        actor: eventActor,
        payload,
        prevHash: records.at(-1)?.hash ?? EMPTY_HASH
      };
      record.hash = await eventHash(record, cryptoApi);
      await store.add(record);
      return record;
    });
    writes = operation.catch(() => {});
    return operation;
  }

  return {
    recordScores(board, at) {
      const pending = [];
      for (const row of board) {
        const id = row.encounter.encounter_id;
        const fingerprint = scoreFingerprint(row.assessment);
        if (lastScores.get(id) === fingerprint) continue;
        lastScores.set(id, fingerprint);
        pending.push(append("SCORE", id, scorePayload(row), at, "SYSTEM"));
      }
      return Promise.all(pending);
    },
    recordOverride(row, override) {
      return append(
        "OVERRIDE",
        row.encounter.encounter_id,
        overridePayload(row, override, actor),
        override.at,
        actor
      );
    },
    recordExport(format, at) {
      return append("EXPORT", null, { format }, at, actor);
    },
    recordModeChange(change) {
      return append(
        "MODE_CHANGE",
        null,
        {
          fromMode: change.fromMode,
          toMode: change.toMode,
          trigger: change.trigger,
          auto: change.auto
        },
        change.at,
        "SYSTEM"
      );
    },
    recordAlertAcknowledgement(row, rule, at) {
      return append(
        "ALERT_ACK",
        row.encounter.encounter_id,
        {
          ruleId: rule.ruleId,
          ruleLabel: rule.label,
          band: "P1",
          modelLockedOut: row.assessment.modelLockedOut
        },
        at,
        actor
      );
    },
    recordQuestionAnswered(row, question, answer, at) {
      return append(
        "QUESTION_ANSWERED",
        row.encounter.encounter_id,
        {
          questionId: question.id,
          question: question.question,
          answer,
          appliedShift: answer === "yes"
            ? question.expectedShiftIfYes
            : answer === "no" ? question.expectedShiftIfNo : 0,
          engineBandBefore: row.assessment.band,
          provisionalBandBefore: row.assessment.provisionalBand,
          confidenceBefore: row.assessment.confidence,
          priorityIndexBefore: row.assessment.priorityIndex,
          intervalBefore: row.assessment.interval,
          derivationSnapshot: row.assessment.derivation
        },
        at,
        actor
      );
    },
    records: () => store.all(),
    verify: async () => verifyAuditChain(await store.all(), cryptoApi)
  };
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function buildAuditExport(records, format, at) {
  if (!await verifyAuditChain(records)) {
    throw new Error("Audit chain verification failed");
  }
  const exportedAt = new Date(at).toISOString();
  const shiftId = records[0]?.shiftId ?? "shift";
  const filenameTime = exportedAt.replaceAll(":", "-");
  if (format === "json") {
    return {
      filename: `patienttriage-audit-${shiftId}-${filenameTime}.json`,
      type: "application/json",
      content: JSON.stringify({
        exportedAt,
        chainVerified: true,
        records
      }, null, 2)
    };
  }
  const fields = [
    "sequence",
    "eventId",
    "shiftId",
    "at",
    "type",
    "encounterId",
    "actor",
    "payload",
    "prevHash",
    "hash"
  ];
  return {
    filename: `patienttriage-audit-${shiftId}-${filenameTime}.csv`,
    type: "text/csv",
    content: [
      fields.map(csvCell).join(","),
      ...records.map(record => fields.map(field => csvCell(
        field === "payload" ? canonicalJson(record.payload) : record[field]
      )).join(","))
    ].join("\r\n")
  };
}
