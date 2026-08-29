import { fairnessSnapshot } from "../fairness.js";
import { el } from "../util/dom.js";
import { fairnessBars, priorityDistributionBars } from "./charts.js";

function heading(text) {
  const node = el("h3", { class: "fairness-panel-heading" });
  node.textContent = text;
  return node;
}

function dimensionSection(dimension, groups) {
  const section = el("section", { class: "fairness-dimension" });
  section.append(heading(dimension), priorityDistributionBars(groups));
  return section;
}

export function renderFairness(
  target,
  boardRegion,
  open,
  board,
  protocol,
  overrides,
  actions
) {
  target.hidden = !open;
  boardRegion.hidden = open;
  if (!open) return;
  const snapshot = fairnessSnapshot(board, protocol, overrides);
  target.replaceChildren();
  const header = el("header", { class: "fairness-header" });
  const title = el("h2", { id: "fairness-heading" });
  title.textContent = "Fairness monitor";
  const close = el("button", { type: "button" });
  close.textContent = "Close";
  close.addEventListener("click", actions.onClose);
  header.append(title, close);
  const headline = el("p", { class: "fairness-headline" });
  headline.textContent = snapshot.headline;

  const assigned = el("section", { class: "fairness-panel" });
  assigned.append(heading("Assigned priority by subgroup"));
  for (const dimension of ["sex", "age band", "language"]) {
    assigned.append(dimensionSection(
      dimension,
      snapshot.subgroups.filter(group => group.dimension === dimension)
    ));
  }

  const proxy = el("section", { class: "fairness-panel" });
  proxy.append(
    heading("Undertriage proxy · acuity upgrade after triage"),
    fairnessBars(snapshot.subgroups.map(group => ({
      label: `${group.dimension}: ${group.subgroup}`,
      value: Number((group.upgradeAfterTriageRate * 100).toFixed(1)),
      worstServed: group === snapshot.worstServed
    })))
  );

  const drift = el("section", { class: "fairness-panel" });
  drift.append(heading("Drift against tolerance"));
  const flagged = snapshot.subgroups.filter(group => group.flagged);
  if (flagged.length === 0) {
    const status = el("p", { class: "fairness-status" });
    status.textContent = "No subgroup is beyond tolerance.";
    drift.append(status);
  }
  for (const group of flagged) {
    const item = el("div", { class: "fairness-flag" });
    const status = el("p");
    status.textContent = `${group.label} · ${group.boardRateMultiple.toFixed(1)}× · FLAG`;
    const encounters = el("div", { class: "fairness-encounters" });
    for (const encounterId of group.encounterIds) {
      const button = el("button", { type: "button" });
      button.textContent = encounterId;
      button.addEventListener("click", () => actions.onEncounter(encounterId));
      encounters.append(button);
    }
    item.append(status, encounters);
    drift.append(item);
  }
  target.append(header, headline, assigned, proxy, drift);
}
