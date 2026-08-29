const ABSTAINING_CONFIDENCE = [
  "UNRESOLVED",
  "UNRESOLVABLE",
  "INSUFFICIENT"
];

function orderedBands(protocol) {
  return Object.entries(protocol.bandThresholds)
    .sort((left, right) => right[1] - left[1])
    .map(([band]) => band)
    .concat("P5");
}

function rank(band, protocol) {
  return orderedBands(protocol).indexOf(band);
}

function atLeastAsAcute(left, right, protocol) {
  return rank(left, protocol) <= rank(right, protocol);
}

export function priorityIndex(
  physiologyScore,
  presentationScore,
  hazardScore,
  protocol
) {
  const weights = protocol.combination.layerWeights;
  const weighted = weights.physiology * physiologyScore +
    weights.presentation * presentationScore +
    weights.hazard * hazardScore;
  const maximum = Object.values(weights).reduce(
    (sum, weight) => sum + weight * protocol.combination.layerMax,
    0
  );
  return 100 * weighted / maximum;
}

export function bandForIndex(index, protocol) {
  return Object.entries(protocol.bandThresholds)
    .sort((left, right) => right[1] - left[1])
    .find(([, threshold]) => index >= threshold)?.[0] ?? "P5";
}

export function candidateBands(interval, protocol) {
  if (interval[0] === interval[1]) {
    return [bandForIndex(interval[0], protocol)];
  }

  const bands = orderedBands(protocol);
  return bands.filter((band, index) => {
    const lower = protocol.bandThresholds[band] ?? 0;
    const upper = index === 0
      ? 100
      : protocol.bandThresholds[bands[index - 1]];
    return Math.max(interval[0], lower) < Math.min(interval[1], upper);
  });
}

function presentationFloor(score, protocol) {
  return protocol.presentation.bandFloors.thresholds
    .filter(({ minPresentationScore }) => score >= minPresentationScore)
    .map(({ floor }) => floor)
    .sort((left, right) => rank(left, protocol) - rank(right, protocol))[0] ??
    null;
}

function clearQuestion(result) {
  return {
    ...result,
    resolvingQuestion: null,
    resolvingQuestionShortLabel: null,
    resolvingQuestionId: null,
    expectedInformationGain: null,
    noQuestionReason: null
  };
}

export function assignBand(
  index,
  uncertainty,
  rulesFired,
  presentationScore,
  protocol
) {
  const pin = rulesFired.some(({ action }) => action === "PIN_P1");
  const hardFloor = rulesFired.some(({ action }) => action === "FLOOR_P2")
    ? "P2"
    : null;
  const riskFloor = presentationFloor(presentationScore, protocol);
  const modelBand = uncertainty.tieBrokenUpward
    ? uncertainty.candidateBands[0]
    : bandForIndex(index, protocol);
  const abstains = ABSTAINING_CONFIDENCE.includes(uncertainty.confidence);
  let result = {
    ...uncertainty,
    band: abstains ? null : modelBand,
    provisionalBand: abstains
      ? uncertainty.candidateBands[0]
      : modelBand,
    bandSetBy: "model",
    modelLockedOut: false,
    tieBrokenUpward: uncertainty.tieBrokenUpward
  };

  if (pin) {
    return clearQuestion({
      ...result,
      band: "P1",
      provisionalBand: "P1",
      bandSetBy: "hard_rule",
      candidateBands: [],
      confidence: "ESTABLISHED",
      modelLockedOut: true,
      tieBrokenUpward: false
    });
  }

  const floor = [hardFloor, riskFloor]
    .filter(Boolean)
    .sort((left, right) => rank(left, protocol) - rank(right, protocol))[0];
  if (!floor || !atLeastAsAcute(floor, result.provisionalBand, protocol)) {
    return {
      ...result,
      candidateBands: result.band === null ? result.candidateBands : []
    };
  }

  result = {
    ...result,
    provisionalBand: floor,
    bandSetBy: hardFloor ? "hard_rule" : "presentation_floor"
  };
  const outranksEveryCandidate = uncertainty.candidateBands.every(candidate =>
    rank(floor, protocol) < rank(candidate, protocol)
  );
  if (result.band !== null) result.band = floor;
  if (uncertainty.confidence !== "INSUFFICIENT" &&
      outranksEveryCandidate) {
    result = clearQuestion({
      ...result,
      band: floor,
      candidateBands: [],
      confidence: "ESTABLISHED",
      tieBrokenUpward: false
    });
  }

  return {
    ...result,
    candidateBands: result.band === null ? result.candidateBands : []
  };
}
