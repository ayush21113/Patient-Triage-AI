import { el, on } from "../util/dom.js";

export function renderModeStrip(strip, modeDetail, board = []) {
  if (!modeDetail || modeDetail.toMode === "NORMAL") {
    strip.hidden = true;
    return;
  }
  const time = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata"
  }).format(modeDetail.at);
  const surge = modeDetail.toMode.includes("SURGE")
    ? `SURGE · ${modeDetail.trigger.arrivalRatePerHour.toFixed(0)} arrivals/hour · ${
      modeDetail.trigger.multiplier.toFixed(1)
    }× baseline`
    : "";
  const degraded = modeDetail.toMode.includes("DEGRADED")
    ? `DEGRADED — no monitors · ${board.filter(({ assessment }) =>
      assessment.band === null
    ).length} of ${board.length} cannot be discriminated`
    : "";
  strip.hidden = false;
  strip.textContent = `${[surge, degraded].filter(Boolean).join(" + ")} · entered ${time}`;
}

function valueAtPath(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

function conditionLeaves(condition) {
  if (condition.all) return condition.all.flatMap(conditionLeaves);
  if (condition.any) return condition.any.flatMap(conditionLeaves);
  return [condition];
}

function alertMeasurement(encounter, rule, protocol) {
  const definition = protocol.rules.find(({ id }) => id === rule.ruleId);
  const observation = encounter.observations.at(-1);
  const context = { ...encounter, ...observation };
  const leaf = conditionLeaves(definition.condition).find(condition =>
    valueAtPath(context, condition.field) !== undefined
  );
  const value = valueAtPath(context, leaf.field);
  return `${leaf.field.replace("visual.", "").replaceAll("_", " ").toUpperCase()} = ${
    typeof value === "boolean" ? String(value).toUpperCase() : value
  }`;
}

export function renderEmergencyAlert(
  alert,
  board,
  protocol,
  acknowledgedAlerts,
  onAcknowledge
) {
  const pinned = board.filter(({ assessment }) => assessment.modelLockedOut);
  const row = pinned.find(({ encounter }) =>
    !acknowledgedAlerts[encounter.encounter_id]
  ) ?? pinned[0];
  if (!row) {
    alert.hidden = true;
    return;
  }
  const rule = row.assessment.rulesFired.find(({ action }) =>
    action === "PIN_P1"
  );
  const acknowledged = acknowledgedAlerts[row.encounter.encounter_id];
  const message = el("span");
  message.textContent = `${row.encounter.encounter_id} · ${rule.ruleId} · ${
    alertMeasurement(row.encounter, rule, protocol)
  } · ${rule.label}`;
  const button = el("button", { type: "button" });
  button.textContent = acknowledged ? "Acknowledged" : "Acknowledge";
  button.disabled = Boolean(acknowledged);
  if (!acknowledged) {
    on(button, "click", () => onAcknowledge(row, rule));
  }
  alert.hidden = false;
  alert.replaceChildren(message, button);
}
