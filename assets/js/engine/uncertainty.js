import { conditionContext, evaluateCondition } from "./rules.js";

const MILLISECONDS_PER_MINUTE = 60_000;

function timestamp(value) {
 return typeof value === "number" ? value : Date.parse(value);
}

function available(field, encounter, observation) {
 const source = field === "complaint_class" ? encounter : observation;
 return source[field] !== null && source[field] !== undefined &&
  !observation.unobtainable.includes(field);
}

export function evidenceCompleteness(encounter, observation, protocol) {
 const weights = protocol.uncertainty.inputWeights;
 const totalWeight = Object.values(weights).reduce((sum, weight) =>
  sum + weight, 0
 );
 const availableWeight = Object.entries(weights).reduce(
  (sum, [field, weight]) =>
   sum + (available(field, encounter, observation) ? weight : 0),
  0
 );
 return availableWeight / totalWeight;
}

export function monotonicFraction(observations, protocol) {
 if (observations.length < 3) return 0;

 let weightedAgreement = 0;
 let totalWeight = 0;
 for (const [parameter, sensitivity] of Object.entries(
  protocol.hazard.driftSensitivities
 )) {
  const first = observations[0];
  const last = observations.at(-1);
  if (!available(parameter, {}, first) ||
    !available(parameter, {}, last)) {
   continue;
  }

  const overallChange = last[parameter] - first[parameter];
  const weight = Math.abs(overallChange * sensitivity);
  if (weight === 0) continue;

  let matchingSteps = 0;
  let observedSteps = 0;
  for (let index = 1; index < observations.length; index += 1) {
   const previous = observations[index - 1];
   const current = observations[index];
   if (!available(parameter, {}, previous) ||
     !available(parameter, {}, current)) {
    continue;
   }
   observedSteps += 1;
   if (Math.sign(current[parameter] - previous[parameter]) ===
     Math.sign(overallChange)) {
    matchingSteps += 1;
   }
  }
  if (observedSteps === 0) continue;

  weightedAgreement += matchingSteps / observedSteps * weight;
  totalWeight += weight;
 }
 return totalWeight === 0 ? 0 : weightedAgreement / totalWeight;
}

export function driftUncertaintyValue(
 driftContribution,
 nObservations,
 observedSpanMinutes,
 trajectoryMonotonicFraction,
 protocol
) {
 if (nObservations < protocol.hazard.driftRequiresObservations) return 0;

 const definition = protocol.uncertainty.driftUncertainty;
 const sparsityFactor = 2 / (nObservations - 1);
 const coverageFactor = Math.min(
  2,
  Math.max(
   1,
   protocol.hazard.driftWindowMinutes / observedSpanMinutes
  )
 );
 const [minimumConsistency, maximumConsistency] =
  definition.consistencyFactorRange;
 const consistencyFactor = maximumConsistency -
  (maximumConsistency - minimumConsistency) *
   trajectoryMonotonicFraction;
 return Math.min(
  definition.maximum,
  definition.slopeCoefficient * Math.abs(driftContribution) *
   sparsityFactor * coverageFactor * consistencyFactor
 );
}

export function driftUncertainty(
 driftContribution,
 observations,
 protocol
) {
 if (observations.length < protocol.hazard.driftRequiresObservations) return 0;

 const spanMinutes = (
  timestamp(observations.at(-1).observed_at) -
  timestamp(observations[0].observed_at)
 ) / MILLISECONDS_PER_MINUTE;
 return driftUncertaintyValue(
  driftContribution,
  observations.length,
  spanMinutes,
  monotonicFraction(observations, protocol),
  protocol
 );
}

function higherBoundary(candidateBands, protocol) {
 return Math.max(...candidateBands
  .map(band => protocol.bandThresholds[band])
  .filter(Number.isFinite));
}

export function expectedInformationGain(
 question,
 priorityIndex,
 halfWidth,
 candidateBands,
 protocol
) {
 const boundary = higherBoundary(candidateBands, protocol);
 const yesIndex = priorityIndex + question.expectedShiftIfYes;
 const noIndex = priorityIndex + question.expectedShiftIfNo;
 const separates = (yesIndex >= boundary) !== (noIndex >= boundary);
 const margin = Math.min(
  Math.abs(yesIndex - boundary),
  Math.abs(noIndex - boundary)
 );
 const weights = protocol.uncertainty.informationGain;

 return weights.separationWeight * (separates ? 1 : 0) +
  weights.marginWeight * Math.min(margin / halfWidth, 1) +
  weights.spanWeight * Math.min(
   Math.abs(yesIndex - noIndex) / (2 * halfWidth),
   1
  );
}

export function questionAnswerEvidence(encounter, protocol) {
 return (encounter.question_answers ?? []).map(answer => {
  const question = protocol.resolvingQuestions.find(({ id }) =>
   id === answer.question_id
  );
  if (!question) throw new Error(`Unknown resolving question: ${answer.question_id}`);
  if (!["yes", "no", "cannot_assess"].includes(answer.answer)) {
   throw new Error(`Unknown resolving answer: ${answer.answer}`);
  }
  const shift = answer.answer === "yes"
   ? question.expectedShiftIfYes
   : answer.answer === "no" ? question.expectedShiftIfNo : 0;
  return {
   questionId: question.id,
   question: question.question,
   answer: answer.answer,
   answeredAt: answer.answered_at,
   shift
  };
 });
}

function sameBands(left, right) {
 return left.length === right.length &&
  left.every((band, index) => band === right[index]);
}

export function selectResolvingQuestion(
 encounter,
 observation,
 priorityIndex,
 halfWidth,
 candidateBands,
 protocol
) {
 const questions = protocol.resolvingQuestions
  .map((question, order) => ({ question, order }))
  .filter(({ question }) =>
   question.complaintClass === encounter.complaint_class
  );
 if (questions.length === 0) {
  return {
   resolvingQuestion: null,
   resolvingQuestionId: null,
   expectedInformationGain: null,
   noQuestionReason: "no_questions_defined_for_class"
  };
 }

 const context = conditionContext(encounter, observation, protocol);
 const answeredIds = new Set(
  (encounter.question_answers ?? []).map(({ question_id }) => question_id)
 );
 const unanswered = questions.filter(({ question }) =>
  !answeredIds.has(question.id) && (
   !question.alreadyAnsweredWhen ||
   !evaluateCondition(question.alreadyAnsweredWhen, context, protocol)
  )
 );
 if (unanswered.length === 0) {
  return {
   resolvingQuestion: null,
   resolvingQuestionId: null,
   expectedInformationGain: null,
   noQuestionReason: "all_questions_already_answered"
  };
 }

 const ranked = unanswered.map(({ question, order }) => ({
  question,
  order,
  exactBands: sameBands(question.discriminatesBetween, candidateBands),
  informationGain: expectedInformationGain(
   question,
   priorityIndex,
   halfWidth,
   candidateBands,
   protocol
  )
 })).sort((left, right) =>
  right.informationGain - left.informationGain ||
  Number(right.exactBands) - Number(left.exactBands) ||
  left.order - right.order
 );
 const best = ranked[0];
 if (best.informationGain <
   protocol.uncertainty.informationGain.minimumInformationGain) {
  return {
   resolvingQuestion: null,
   resolvingQuestionId: null,
   expectedInformationGain: null,
   noQuestionReason: "no_question_above_information_threshold"
  };
 }

 return {
  resolvingQuestion: best.question.question,
  resolvingQuestionId: best.question.id,
  expectedInformationGain: Math.round(best.informationGain * 100) / 100,
  noQuestionReason: null
 };
}

export function assertUncertaintyContract(result) {
 const abstains = ["UNRESOLVED", "UNRESOLVABLE", "INSUFFICIENT"]
  .includes(result.confidence);
 if (abstains && result.candidateBands.length < 2) {
  throw new Error("Abstention requires at least two candidate bands");
 }
 if (result.confidence === "UNRESOLVED" &&
   (result.resolvingQuestionId === null ||
    result.resolvingQuestion === null)) {
  throw new Error("UNRESOLVED requires exactly one resolving question");
 }
 if (result.confidence === "UNRESOLVABLE" &&
   (result.noQuestionReason === null ||
    result.resolvingQuestionId !== null)) {
  throw new Error("UNRESOLVABLE requires a reason and no question");
 }
 if (result.confidence !== "UNRESOLVABLE" &&
   result.noQuestionReason !== null) {
  throw new Error("Only UNRESOLVABLE may carry a no-question reason");
 }
}

function ambiguousConfidence(
 interval,
 candidateBands,
 protocol
) {
 const safetyRelevant = candidateBands.slice(0, -1).some((band, index) =>
  protocol.uncertainty.safetyRelevantBoundaries.boundaries.includes(
   `${band}/${candidateBands[index + 1]}`
  )
 );
 if (!safetyRelevant) {
  return { confidence: "PROBABLE", tieBrokenUpward: true };
 }

 const boundary = higherBoundary(candidateBands, protocol);
 const intervalWidth = interval[1] - interval[0];
 const split = Math.max(
  interval[1] - boundary,
  boundary - interval[0]
 ) / intervalWidth;
 return split >= protocol.uncertainty.probableSplitThreshold
  ? { confidence: "PROBABLE", tieBrokenUpward: false }
  : { confidence: "AMBIGUOUS", tieBrokenUpward: true };
}

export function uncertaintyInterval(
 encounter,
 observations,
 priorityIndex,
 driftContribution,
 protocol
) {
 const observation = observations.at(-1);
 const completeness = evidenceCompleteness(encounter, observation, protocol);
 const driftWidth = driftUncertainty(
  driftContribution,
  observations,
  protocol
 );
 const singleReadingPenalty = observations.length <
  protocol.hazard.driftRequiresObservations
  ? protocol.uncertainty.singleReadingPenalty
  : 0;
 const halfWidth = protocol.uncertainty.baseWidth * (
  1 + protocol.uncertainty.incompletenessMultiplier * (1 - completeness)
 ) + driftWidth + singleReadingPenalty +
  (encounter.age_value === null ? protocol.uncertainty.unknownAgePenalty : 0) +
  ([null, "unknown"].includes(encounter.sex)
   ? protocol.uncertainty.unknownSexPenalty
   : 0);
 const interval = [
  Math.max(0, priorityIndex - halfWidth),
  Math.min(100, priorityIndex + halfWidth)
 ];

 return {
  evidenceCompleteness: completeness,
  interval,
  halfWidth,
  driftUncertainty: driftWidth
 };
}

export function classifyUncertainty(
 encounter,
 observation,
 priorityIndex,
 candidateBands,
 intervalResult,
 protocol
) {
 const classification = intervalResult.evidenceCompleteness <
  protocol.uncertainty.insufficientCompletenessThreshold
  ? { confidence: "INSUFFICIENT", tieBrokenUpward: false }
  : candidateBands.length === 1
   ? { confidence: "ESTABLISHED", tieBrokenUpward: false }
   : ambiguousConfidence(
    intervalResult.interval,
    candidateBands,
    protocol
   );
 let { confidence } = classification;
 let questionResult = {
  resolvingQuestion: null,
  resolvingQuestionId: null,
  expectedInformationGain: null,
  noQuestionReason: null
 };

 if (confidence === "AMBIGUOUS") {
  questionResult = selectResolvingQuestion(
   encounter,
   observation,
   priorityIndex,
   intervalResult.halfWidth,
   candidateBands,
   protocol
  );
  confidence = questionResult.resolvingQuestionId === null
   ? "UNRESOLVABLE"
   : "UNRESOLVED";
 }

 const result = {
  ...intervalResult,
  candidateBands,
  confidence,
  tieBrokenUpward: classification.tieBrokenUpward,
  ...questionResult
 };
 assertUncertaintyContract(result);
 return result;
}

export function assessUncertainty(
 encounter,
 observations,
 priorityIndex,
 candidateBands,
 driftContribution,
 protocol
) {
 return classifyUncertainty(
  encounter,
  observations.at(-1),
  priorityIndex,
  candidateBands,
  uncertaintyInterval(
   encounter,
   observations,
   priorityIndex,
   driftContribution,
   protocol
  ),
  protocol
 );
}
