import { on } from "../util/dom.js";

function displayedBand(row, overrides) {
  return overrides[row.encounter.encounter_id]?.band ??
    row.assessment.band ?? row.assessment.provisionalBand;
}

export function applyOverrideOrder(board, overrides = {}) {
  const ordered = [...board];
  const applied = Object.values(overrides).sort((left, right) =>
    left.sequence - right.sequence
  );
  for (const override of applied) {
    const index = ordered.findIndex(({ encounter }) =>
      encounter.encounter_id === override.encounterId
    );
    if (index === -1) continue;
    const [row] = ordered.splice(index, 1);
    const pinnedCount = ordered.filter(({ assessment }) =>
      assessment.modelLockedOut
    ).length;
    const rank = row.assessment.modelLockedOut
      ? 0
      : Math.max(pinnedCount, Math.min(override.targetRank, ordered.length));
    ordered.splice(rank, 0, row);
  }
  return ordered;
}

export function overrideForMove(
  board,
  overrides,
  encounterId,
  targetRank,
  at
) {
  const ordered = applyOverrideOrder(board, overrides);
  const source = ordered.find(({ encounter }) =>
    encounter.encounter_id === encounterId
  );
  if (!source) return null;
  const sourceRank = ordered.indexOf(source);
  if (source.assessment.modelLockedOut && targetRank > sourceRank) return null;
  const pinnedCount = ordered.filter(({ assessment }) =>
    assessment.modelLockedOut
  ).length;
  const requestedTarget = ordered[
    Math.max(0, Math.min(targetRank, ordered.length - 1))
  ];
  const safeRank = source.assessment.modelLockedOut
    ? 0
    : Math.max(pinnedCount, Math.min(targetRank, ordered.length - 1));
  const engineBand = source.assessment.band ?? source.assessment.provisionalBand;
  const nurseBand = displayedBand(requestedTarget, overrides);
  if (safeRank === sourceRank && nurseBand === displayedBand(source, overrides)) {
    return null;
  }
  return {
    encounterId,
    band: nurseBand,
    engineBand,
    nurseBand,
    engineConfidence: source.assessment.confidence,
    engineIndex: source.assessment.priorityIndex,
    targetRank: safeRank,
    direction: Number(nurseBand.slice(1)) < Number(engineBand.slice(1))
      ? "upgrade"
      : Number(nurseBand.slice(1)) > Number(engineBand.slice(1))
        ? "downgrade"
        : "lateral",
    at,
    sequence: Object.keys(overrides).length + 1
  };
}

export function bindOverrideInteractions(tableBody, handlers) {
  let pointerDraft = null;
  let keyboardDraft = null;

  function rows() {
    return [...tableBody.querySelectorAll("tr[data-encounter-id]")];
  }

  function clearPreview() {
    for (const row of rows()) row.classList.remove("override-target");
  }

  function preview(rank) {
    clearPreview();
    rows()[rank]?.classList.add("override-target");
  }

  on(tableBody, "pointerdown", event => {
    const row = event.target.closest("tr[data-encounter-id]");
    if (!row || event.target.closest(".vital-cell")) return;
    const begin = () => {
      pointerDraft = { encounterId: row.dataset.encounterId };
      row.setPointerCapture(event.pointerId);
    };
    if (event.pointerType === "touch") {
      pointerDraft = { timer: setTimeout(begin, 450) };
    } else {
      begin();
    }
  });

  on(tableBody, "pointermove", event => {
    if (!pointerDraft?.encounterId) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)
      ?.closest("tr[data-encounter-id]");
    if (!target) return;
    pointerDraft.targetRank = rows().indexOf(target);
    preview(pointerDraft.targetRank);
  });

  on(tableBody, "pointerup", event => {
    if (pointerDraft?.timer) clearTimeout(pointerDraft.timer);
    if (pointerDraft?.encounterId && pointerDraft.targetRank !== undefined) {
      handlers.onCommit(pointerDraft.encounterId, pointerDraft.targetRank);
    }
    pointerDraft = null;
    clearPreview();
    event.target.releasePointerCapture?.(event.pointerId);
  });

  on(tableBody, "pointercancel", () => {
    if (pointerDraft?.timer) clearTimeout(pointerDraft.timer);
    pointerDraft = null;
    clearPreview();
  });

  on(tableBody, "keydown", event => {
    const currentRows = rows();
    const selected = currentRows.findIndex(row =>
      row.dataset.encounterId === handlers.selectedEncounterId()
    );
    if (["ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      const direction = event.key === "ArrowUp" ? -1 : 1;
      if (event.shiftKey && selected !== -1) {
        const origin = keyboardDraft?.encounterId ===
          currentRows[selected].dataset.encounterId
          ? keyboardDraft.targetRank
          : selected;
        const targetRank = Math.max(
          0,
          Math.min(currentRows.length - 1, origin + direction)
        );
        keyboardDraft = {
          encounterId: currentRows[selected].dataset.encounterId,
          targetRank
        };
        preview(targetRank);
      } else {
        keyboardDraft = null;
        clearPreview();
        const next = Math.max(
          0,
          Math.min(currentRows.length - 1,
            (selected === -1 ? 0 : selected) + direction)
        );
        handlers.onSelect(currentRows[next].dataset.encounterId);
        currentRows[next].focus();
      }
    } else if (event.key === "Enter" && keyboardDraft) {
      event.preventDefault();
      handlers.onCommit(keyboardDraft.encounterId, keyboardDraft.targetRank);
      keyboardDraft = null;
      clearPreview();
    }
  });
}
