const MILLISECONDS_PER_MINUTE = 60_000;
const PARAMETER_LABELS = {
  rr: "RR",
  spo2: "SpO₂",
  hr: "HR",
  sbp: "SBP",
  temp_c: "Temp"
};

function timestamp(value) {
  return typeof value === "number" ? value : Date.parse(value);
}

function driftFrom(observations, hazard) {
  if (observations.length < hazard.driftRequiresObservations) {
    return { drift: 0, driftDetail: null, singleReading: true };
  }

  const latest = observations.at(-1);
  const latestAt = timestamp(latest.observed_at);
  const cutoff = latestAt -
    hazard.driftWindowMinutes * MILLISECONDS_PER_MINUTE;
  let baseline = observations[0];
  for (const observation of observations) {
    if (timestamp(observation.observed_at) > cutoff) break;
    baseline = observation;
  }

  const elapsedMinutes = (latestAt - timestamp(baseline.observed_at)) /
    MILLISECONDS_PER_MINUTE;
  const slopeMinutes = Math.min(elapsedMinutes, hazard.driftWindowMinutes);
  const details = [];
  let drift = 0;

  for (const [parameter, sensitivity] of Object.entries(
    hazard.driftSensitivities
  )) {
    if (baseline[parameter] === null || latest[parameter] === null ||
        baseline.unobtainable.includes(parameter) ||
        latest.unobtainable.includes(parameter)) {
      continue;
    }
    const change = latest[parameter] - baseline[parameter];
    drift += change / slopeMinutes * sensitivity * hazard.driftWindowMinutes;
    if (change !== 0) {
      details.push(
        `${PARAMETER_LABELS[parameter]} ${change > 0 ? "↑" : "↓"}${Math.abs(change)}`
      );
    }
  }

  return {
    drift,
    driftDetail: details.length
      ? `${details.join(" · ")} over ${elapsedMinutes} min`
      : null,
    singleReading: false
  };
}

export function scoreHazard(
  encounter,
  observations,
  currentBand,
  protocol,
  now
) {
  const waitedMinutes = (now - timestamp(encounter.arrived_at)) /
    MILLISECONDS_PER_MINUTE;
  const timeHazard = waitedMinutes *
    (protocol.hazard.hazardRates[currentBand] ?? 0);
  const driftResult = driftFrom(observations, protocol.hazard);

  return {
    score: Math.min(
      protocol.hazard.maxScore,
      Math.max(0, timeHazard + driftResult.drift)
    ),
    waitedMinutes,
    timeHazard,
    ...driftResult
  };
}
