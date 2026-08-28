import {
  assignBand,
  candidateBands,
  priorityIndex
} from "./bands.js";
import { scoreHazard } from "./hazard.js";
import { scorePhysiology } from "./physiology.js";
import { scorePresentation } from "./presentation.js";
import { evaluateRules } from "./rules.js";
import {
  classifyUncertainty,
  questionAnswerEvidence,
  uncertaintyInterval
} from "./uncertainty.js";

const ENGINE_VERSION = "1.0.0";
const MILLISECONDS_PER_MINUTE = 60_000;

function timestamp(value) {
  return typeof value === "number" ? value : Date.parse(value);
}

export function assertAssessmentContract(assessment) {
  if (assessment.confidence === null ||
      assessment.confidence === undefined) {
    throw new Error("Assessment requires confidence");
  }
  if (assessment.band === null && assessment.provisionalBand === null) {
    throw new Error("Assessment requires a band or provisional band");
  }
  if (assessment.priorityIndex < assessment.interval[0] ||
      assessment.priorityIndex > assessment.interval[1]) {
    throw new Error("Priority index must fall inside its interval");
  }
  if (assessment.confidence === "UNRESOLVED" &&
      assessment.resolvingQuestionId === null) {
    throw new Error("UNRESOLVED requires a resolving question");
  }
  if (assessment.confidence === "UNRESOLVABLE" &&
      (assessment.noQuestionReason === null ||
        assessment.resolvingQuestionId !== null)) {
    throw new Error("UNRESOLVABLE requires a reason and no question");
  }
  if (assessment.confidence !== "UNRESOLVABLE" &&
      assessment.noQuestionReason !== null) {
    throw new Error("Only UNRESOLVABLE may carry a no-question reason");
  }
  if (assessment.modelLockedOut && assessment.provisionalBand !== "P1") {
    throw new Error("A locked assessment must be provisional P1");
  }
}

export function score(encounter, protocol, now) {
  const observations = encounter.observations;
  const observation = observations.at(-1);
  const rulesFired = evaluateRules(encounter, observation, protocol);
  const physiology = scorePhysiology(encounter, observation, protocol);
  const presentation = scorePresentation(encounter, observation, protocol);
  const hazard = scoreHazard(
    encounter,
    observations,
    encounter.current_band ?? Object.entries(protocol.hazard.hazardRates)
      .sort((left, right) => right[1] - left[1])[0][0],
    protocol,
    now
  );
  const modelIndex = priorityIndex(
    physiology.score,
    presentation.score,
    hazard.score,
    protocol
  );
  const information = questionAnswerEvidence(encounter, protocol);
  const index = Math.min(100, Math.max(0, modelIndex + information.reduce(
    (sum, answer) => sum + answer.shift,
    0
  )));
  const intervalResult = uncertaintyInterval(
    encounter,
    observations,
    index,
    hazard.drift,
    protocol
  );
  const uncertainty = classifyUncertainty(
    encounter,
    observation,
    index,
    candidateBands(intervalResult.interval, protocol),
    intervalResult,
    protocol
  );
  const banding = assignBand(
    index,
    uncertainty,
    rulesFired,
    presentation.score,
    protocol
  );
  const reassessDueAt = timestamp(observation.observed_at) +
    protocol.reassessMinutes[banding.provisionalBand] *
      MILLISECONDS_PER_MINUTE;
  const assessment = {
    encounterId: encounter.encounter_id,
    engineVersion: ENGINE_VERSION,
    protocolVersion: protocol.protocolVersion,
    computedAt: now,
    priorityIndex: index,
    interval: banding.interval,
    band: banding.band,
    provisionalBand: banding.provisionalBand,
    bandSetBy: banding.bandSetBy,
    candidateBands: banding.candidateBands,
    confidence: banding.confidence,
    evidenceCompleteness: banding.evidenceCompleteness,
    modelLockedOut: banding.modelLockedOut,
    alert: banding.modelLockedOut ? "immediate" : null,
    tieBrokenUpward: banding.tieBrokenUpward,
    rulesFired,
    derivation: {
      physiology,
      presentation,
      hazard,
      ...(information.length > 0 ? { modelIndex, information } : {})
    },
    resolvingQuestion: banding.resolvingQuestion,
    resolvingQuestionId: banding.resolvingQuestionId,
    expectedInformationGain: banding.expectedInformationGain,
    noQuestionReason: banding.noQuestionReason,
    reassessDueAt
  };
  assertAssessmentContract(assessment);
  return assessment;
}
