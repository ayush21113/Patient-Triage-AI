const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
export const instrumentFields = [
  "hr",
  "sbp",
  "dbp",
  "rr",
  "spo2",
  "temp_c"
];

export function createSurgeController(config, handlers = {}) {
  const arrivals = [];
  const interval = MILLISECONDS_PER_HOUR /
    (config.baselineArrivalsPerHour * config.multiplier);
  let injectionActive = false;
  let nextArrivalAt = null;
  let mode = "NORMAL";
  let enteredAt = null;
  let belowExitSince = null;
  let arrivalRatePerHour = 0;

  function changeMode(nextMode, at) {
    const previousMode = mode;
    mode = nextMode;
    if (mode === "SURGE") enteredAt = at;
    handlers.onModeChange?.({
      fromMode: previousMode,
      toMode: mode,
      at,
      trigger: {
        arrivalRatePerHour,
        multiplier: arrivalRatePerHour / config.baselineArrivalsPerHour,
        baselineArrivalsPerHour: config.baselineArrivalsPerHour,
        trailingWindowMinutes: config.trailingWindowMinutes
      },
      auto: true
    });
  }

  function advance(now) {
    while (injectionActive && nextArrivalAt <= now) {
      arrivals.push(nextArrivalAt);
      handlers.onArrival?.(nextArrivalAt);
      nextArrivalAt += interval;
    }
    const windowStart = now -
      config.trailingWindowMinutes * MILLISECONDS_PER_MINUTE;
    while (arrivals[0] < windowStart) arrivals.shift();
    arrivalRatePerHour = arrivals.length * 60 /
      config.trailingWindowMinutes;
    if (mode === "NORMAL" && arrivalRatePerHour >=
        config.baselineArrivalsPerHour * config.multiplier) {
      changeMode("SURGE", now);
      belowExitSince = null;
    } else if (mode === "SURGE") {
      const belowExit = arrivalRatePerHour <
        config.baselineArrivalsPerHour * config.exitMultiplier;
      if (!belowExit) {
        belowExitSince = null;
      } else if (belowExitSince === null) {
        belowExitSince = now;
      } else if (now - belowExitSince >=
          config.exitSustainedMinutes * MILLISECONDS_PER_MINUTE) {
        changeMode("NORMAL", now);
        enteredAt = null;
        belowExitSince = null;
      }
    }
  }

  return {
    start(now) {
      injectionActive = true;
      nextArrivalAt ??= now;
      advance(now);
    },
    stop() {
      injectionActive = false;
      nextArrivalAt = null;
    },
    advance,
    state: () => ({
      mode,
      enteredAt,
      arrivalRatePerHour,
      multiplier: arrivalRatePerHour / config.baselineArrivalsPerHour,
      injectionActive
    })
  };
}

export function surgeEncounter(template, encounterId, atMinute) {
  const encounter = structuredClone(template);
  delete encounter.expect;
  encounter.encounterId = encounterId;
  encounter.trajectory = encounter.trajectory.map(frame => ({
      ...frame,
      atMinute: atMinute + frame.atMinute - encounter.arrivedAtMinute
    }));
  encounter.arrivedAtMinute = atMinute;
  return encounter;
}

export function applySurgeReassessment(board, protocol, active) {
  if (!active) return board;
  const factor = 1 - protocol.surge.reassessCompressionPct / 100;
  return board.map(row => {
    const band = row.assessment.band ?? row.assessment.provisionalBand;
    if (!["P2", "P3"].includes(band)) return row;
    return {
      ...row,
      assessment: {
        ...row.assessment,
        reassessDueAt: row.encounter.observations.at(-1).observed_at +
          protocol.reassessMinutes[band] * factor * MILLISECONDS_PER_MINUTE
      }
    };
  });
}

export function degradeEncounter(encounter) {
  const observations = encounter.observations.map((observation, index) =>
    index === encounter.observations.length - 1
      ? {
        ...observation,
        unobtainable: [...new Set([
          ...observation.unobtainable,
          ...instrumentFields
        ])]
      }
      : observation
  );
  return { ...encounter, observations };
}
