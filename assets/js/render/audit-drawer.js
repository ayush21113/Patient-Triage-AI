import { el, on } from "../util/dom.js";

const renderedHash = new WeakMap();

function engineSaid(record) {
  const payload = record.payload;
  const band = payload.engineBand ?? payload.band ?? payload.provisionalBand;
  const confidence = payload.engineConfidence ?? payload.confidence;
  return band ? `${band} · ${confidence}` : "—";
}

function download(file) {
  const url = URL.createObjectURL(new Blob([file.content], {
    type: file.type
  }));
  const link = el("a", { href: url, download: file.filename });
  link.click();
  URL.revokeObjectURL(url);
}

function auditTable(records, valid) {
  const table = el("table", { class: "audit-table" });
  const caption = el("caption");
  caption.textContent = "Append-only audit events · newest first";
  const head = el("thead");
  const headingRow = el("tr");
  for (const label of [
    "Time",
    "Encounter",
    "Event",
    "Engine said",
    "Nurse did",
    "Basis",
    "Chain"
  ]) {
    const th = el("th", { scope: "col" });
    th.textContent = label;
    headingRow.append(th);
  }
  head.append(headingRow);
  const body = el("tbody");
  for (const record of [...records].reverse()) {
    const row = el("tr");
    const time = el("td", { class: "numeric" });
    time.textContent = record.at.slice(11, 19);
    const encounter = el("td", { class: "numeric" });
    encounter.textContent = record.encounterId ?? "SHIFT";
    const event = el("td");
    event.textContent = record.type;
    const engine = el("td");
    engine.textContent = engineSaid(record);
    const nurse = el("td");
    nurse.textContent = record.payload.nurseBand ?? "—";
    const basis = el("td");
    const details = el("details");
    const summary = el("summary");
    summary.textContent = "View record";
    const payload = el("pre");
    payload.textContent = JSON.stringify(record.payload, null, 2);
    details.append(summary, payload);
    basis.append(details);
    const chain = el("td", { class: "numeric audit-chain" });
    chain.textContent = `${record.hash.slice(0, 8)}… · ${
      valid ? "VERIFIED" : "BROKEN"
    }`;
    row.append(time, encounter, event, engine, nurse, basis, chain);
    body.append(row);
  }
  table.append(caption, head, body);
  return table;
}

export async function renderAuditDrawer(
  drawer,
  open,
  audit,
  handlers
) {
  if (!open) {
    drawer.hidden = true;
    renderedHash.delete(drawer);
    return;
  }
  drawer.hidden = false;
  if (!audit) {
    drawer.textContent = "AUDIT CHAIN BROKEN — new records are not being written.";
    return;
  }
  const records = await audit.records();
  const valid = await audit.verify();
  const key = `${records.at(-1)?.hash ?? "empty"}:${valid}`;
  if (renderedHash.get(drawer) === key) return;
  renderedHash.set(drawer, key);
  const header = el("header", { class: "audit-header" });
  const title = el("h2", { id: "audit-heading" });
  title.textContent = "Audit trail";
  const status = el("span", {
    class: `audit-status ${valid ? "audit-valid" : "audit-broken"}`
  });
  status.textContent = valid ? "CHAIN VERIFIED" : "CHAIN BROKEN";
  const actions = el("div", { class: "audit-actions" });
  for (const format of ["json", "csv"]) {
    const button = el("button", { type: "button" });
    button.textContent = `Export ${format.toUpperCase()}`;
    on(button, "click", async () => download(await handlers.onExport(format)));
    actions.append(button);
  }
  const close = el("button", { type: "button" });
  close.textContent = "Close";
  on(close, "click", handlers.onClose);
  actions.append(close);
  header.append(title, status, actions);
  drawer.replaceChildren(header, auditTable(records, valid));
}
