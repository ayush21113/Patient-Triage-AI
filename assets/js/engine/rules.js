import { ageBand, ageValues } from "./physiology.js";

function valueAtPath(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

function paediatricFloor(context, protocol) {
  const floor = protocol.physiology.paediatricHypotensionFloor[context.age_band];
  if (floor.type === "absolute") return floor.value;

  const match = floor.expression.match(
    /^(-?\d+(?:\.\d+)?) \+ (-?\d+(?:\.\d+)?) \* ageYears$/
  );
  if (!match) throw new Error("Unsupported paediatric floor expression");
  return Number(match[1]) + Number(match[2]) * context.age_years;
}

export function conditionContext(encounter, observation, protocol) {
  const { ageBand: band } = ageBand(
    encounter.age_value,
    encounter.age_unit,
    protocol
  );
  const { ageDays, ageYears } = ageValues(
    encounter.age_value,
    encounter.age_unit
  );
  const population = protocol.ageBands.find(({ band: name }) => name === band)
    .population;
  const pregnancyStatus = encounter.pregnancy_status;

  return {
    ...encounter,
    ...observation,
    age_days: ageDays,
    age_years: ageYears,
    age_band: band,
    population: population === "adult" &&
      ["pregnant", "postpartum"].includes(pregnancyStatus)
      ? "obstetric"
      : population
  };
}

export function evaluateCondition(condition, context, protocol) {
  if (condition.all) {
    const results = condition.all.map(child =>
      evaluateCondition(child, context, protocol)
    );
    return results.every(Boolean);
  }
  if (condition.any) {
    const results = condition.any.map(child =>
      evaluateCondition(child, context, protocol)
    );
    return results.some(Boolean);
  }

  const value = valueAtPath(context, condition.field);
  if (value === null || value === undefined ||
      context.unobtainable.includes(condition.field)) {
    return false;
  }

  switch (condition.op) {
    case "<": return value < condition.value;
    case "<=": return value <= condition.value;
    case ">": return value > condition.value;
    case ">=": return value >= condition.value;
    case "=": return value === condition.value;
    case "!=": return value !== condition.value;
    case "in": return condition.value.includes(value);
    case "contains": return value.includes(condition.value);
    case "isTrue": return value === true;
    case "belowPaediatricHypotensionFloor":
      return value < paediatricFloor(context, protocol);
    case "belowPaediatricBradypnoeaFloor":
      return value <= protocol.physiology.paediatricBradypnoeaFloor[
        context.age_band
      ];
    case "aboveAgeBandCeiling":
      return value > valueAtPath(protocol.physiology, condition.table)[
        context.age_band
      ];
    default: throw new Error(`Unsupported condition operator: ${condition.op}`);
  }
}

export function evaluateRules(encounter, observation, protocol) {
  const context = conditionContext(encounter, observation, protocol);
  return protocol.rules
    .filter(rule => rule.population === "all" ||
      rule.population === context.population)
    .map(rule => ({
      rule,
      fired: evaluateCondition(rule.condition, context, protocol)
    }))
    .filter(({ fired }) => fired)
    .map(({ rule }) => ({
      ruleId: rule.id,
      label: rule.label,
      action: rule.action,
      alert: rule.alert,
      rationale: rule.rationale,
      source: rule.source,
      modelLockedOut: rule.action === "PIN_P1"
    }));
}
