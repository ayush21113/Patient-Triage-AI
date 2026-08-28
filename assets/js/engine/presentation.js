import { conditionContext, evaluateCondition } from "./rules.js";

export function scorePresentation(encounter, observation, protocol) {
  const context = conditionContext(encounter, observation, protocol);
  const presentationClass = encounter.complaint_class;
  const definition = protocol.presentation.classes[presentationClass];
  const modifiers = definition.modifiers
    .filter(({ when }) => evaluateCondition(when, context, protocol))
    .map(({ label, points }) => ({ label, points }));
  const rawScore = modifiers.reduce(
    (score, modifier) => score + modifier.points,
    definition.base
  );

  return {
    class: presentationClass,
    base: definition.base,
    modifiers,
    score: Math.min(rawScore, protocol.presentation.maxScore),
    clamped: rawScore > protocol.presentation.maxScore
  };
}
