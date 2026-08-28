import { verifyAuditChain } from "../../assets/js/audit.js";
import { openAuditStore } from "../../assets/js/util/storage.js";

const store = await openAuditStore();
const records = await store.all();
const last = records.at(-1);
document.querySelector("#result").textContent = JSON.stringify({
  persistent: store.persistent,
  count: records.length,
  valid: await verifyAuditChain(records),
  types: Object.fromEntries([...new Set(records.map(record => record.type))]
    .map(type => [type, records.filter(record => record.type === type).length])),
  first: records[0] && {
    eventId: records[0].eventId,
    sequence: records[0].sequence,
    prevHashLength: records[0].prevHash.length,
    hashLength: records[0].hash.length
  },
  last: last && {
    type: last.type,
    encounterId: last.encounterId,
    actor: last.actor,
    engineBand: last.payload.engineBand,
    engineConfidence: last.payload.engineConfidence,
    engineInterval: last.payload.engineInterval,
    nurseBand: last.payload.nurseBand,
    reasonChip: last.payload.reasonChip,
    hasInputs: Boolean(last.payload.inputsSnapshot),
    hasDerivation: Boolean(last.payload.derivationSnapshot)
  }
}, null, 2);
