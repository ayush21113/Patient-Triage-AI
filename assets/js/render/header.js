export function renderHeader(header, board, now, overrides = {}) {
  const format = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata"
  });
  const bands = board.map(row => overrides[row.encounter.encounter_id]?.band ??
    row.assessment.band ?? row.assessment.provisionalBand);
  const recomputeAge = Math.max(...board.map(row =>
    Math.floor((now - row.lastRecomputedAt) / 1_000)
  ));
  header.querySelector("#board-clock").textContent = format.format(now);
  header.querySelector("#waiting-count").textContent = `Waiting ${board.length}`;
  header.querySelector("#p1-count").textContent = `P1 ${
    bands.filter(band => band === "P1").length
  }`;
  header.querySelector("#p2-count").textContent = `P2 ${
    bands.filter(band => band === "P2").length
  }`;
  const age = header.querySelector("#recompute-age");
  age.textContent = `Recompute ${recomputeAge}s`;
  age.classList.toggle("recompute-stale", recomputeAge > 90);
}
