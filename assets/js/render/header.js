const MILLISECONDS_PER_MINUTE = 60_000;

function bandFor(row, overrides) {
  return overrides[row.encounter.encounter_id]?.band ??
    row.assessment.band ?? row.assessment.provisionalBand;
}

function text(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}

export function renderHeader(header, board, now, viewState = {}) {
  const overrides = viewState.overrides ?? viewState;
  const format = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata"
  });
  const bands = board.map(row => bandFor(row, overrides));
  const recomputeAge = Math.max(...board.map(row =>
    Math.floor((now - row.lastRecomputedAt) / 1_000)
  ));
  const waitedMinutes = board.map(row =>
    Math.floor((now - row.encounter.arrived_at) / MILLISECONDS_PER_MINUTE)
  );
  const longestWait = Math.max(...waitedMinutes);
  const p1 = bands.filter(band => band === "P1").length;
  const p2 = bands.filter(band => band === "P2").length;
  const abstaining = board.filter(row =>
    row.assessment.band === null &&
    !overrides[row.encounter.encounter_id]
  ).length;

  header.querySelector("#board-clock").textContent = format.format(now);
  header.querySelector("#waiting-count").textContent = `Waiting ${board.length}`;
  header.querySelector("#p1-count").textContent = `P1 ${p1}`;
  header.querySelector("#p2-count").textContent = `P2 ${p2}`;
  const age = header.querySelector("#recompute-age");
  age.textContent = `Recompute ${recomputeAge}s`;
  age.classList.toggle("recompute-stale", recomputeAge > 90);
  text("#kpi-waiting", String(board.length));
  text("#kpi-waiting-note", `${bands.filter(band => band === "P3").length} P3 and lower`);
  text("#kpi-p1", String(p1));
  text("#kpi-p1-note", p1 === 0 ? "None immediate" : "Immediate action");
  text("#kpi-p2", String(p2));
  text("#kpi-p2-note", "High-risk queue");
  text("#kpi-abstaining", String(abstaining));
  text("#kpi-abstaining-note", abstaining === 0 ? "All discriminated" : "Needs decision");
  text("#kpi-longest", `${longestWait}m`);
  text("#kpi-longest-note", `Median ${Math.round([...waitedMinutes].sort((a, b) =>
    a - b
  )[Math.floor(waitedMinutes.length / 2)])}m`);
  text("#rail-mode", viewState.mode ?? "NORMAL");
  document.querySelector('[data-kpi="p1"]')?.setAttribute(
    "data-empty",
    String(p1 === 0)
  );
}
