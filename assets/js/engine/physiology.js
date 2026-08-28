const DAYS_PER_YEAR = 365.25;
const MONTHS_PER_YEAR = 12;
const PARAMETERS = [
  ["rr", "rr"],
  ["spo2", "spo2"],
  ["onOxygen", "spo2_on_oxygen"],
  ["sbp", "sbp"],
  ["hr", "hr"],
  ["acvpu", "acvpu"],
  ["temp_c", "temp_c"]
];

export function ageValues(ageValue, ageUnit) {
  if (ageValue === null) return { ageDays: null, ageYears: null };

  if (ageUnit === "days") {
    return {
      ageDays: ageValue,
      ageYears: ageValue / DAYS_PER_YEAR
    };
  }

  const ageYears = ageUnit === "months"
    ? ageValue / MONTHS_PER_YEAR
    : ageValue;

  return {
    ageDays: Math.floor(ageYears * DAYS_PER_YEAR),
    ageYears
  };
}

export function ageBand(ageValue, ageUnit, protocol) {
  if (ageValue === null) {
    return {
      ageBand: protocol.ageBandFallback.whenAgeUnknown,
      ageEstimated: protocol.ageBandFallback.setEstimatedFlag
    };
  }

  const { ageDays } = ageValues(ageValue, ageUnit);
  const match = protocol.ageBands.find(({ minDays, maxDays }) =>
    ageDays >= minDays && (maxDays === null || ageDays <= maxDays)
  );

  return { ageBand: match.band, ageEstimated: false };
}

function scoreBands(value, bands) {
  const band = bands.find(({ min, max }) =>
    (min === undefined || value >= min) &&
    (max === undefined || value <= max)
  );
  if (!band) throw new Error(`Scoring table has no band for ${value}`);
  return band.score;
}

function scoreMapped(value, scores) {
  const score = scores[value];
  if (score === undefined) throw new Error(`Scoring table has no value ${value}`);
  return score;
}

function scorePaediatricDeviation(parameter, value, band, physiology) {
  const highRiskCeiling = physiology.paediatricHighRiskCeilings[parameter]?.[
    band
  ];
  if (highRiskCeiling !== undefined && value > highRiskCeiling) {
    return physiology.parameterMaxima[parameter];
  }

  const [low, high] = physiology.paediatricNormals[band][parameter];
  const percentOutside = value < low
    ? 100 * (low - value) / low
    : value > high
      ? 100 * (value - high) / high
      : 0;
  return physiology.paediatricDeviationScoring.find(({ maxPercentOutsideBand }) =>
    maxPercentOutsideBand === null || percentOutside <= maxPercentOutsideBand
  ).score;
}

function scoreParameter(parameter, value, population, band, physiology) {
  if (population === "paediatric") {
    if (["rr", "sbp", "hr"].includes(parameter)) {
      return scorePaediatricDeviation(parameter, value, band, physiology);
    }
    if (parameter === "spo2") {
      return scoreBands(value, physiology.paediatricSpo2.bands);
    }
    if (parameter === "onOxygen") {
      return scoreMapped(
        value ? "oxygen" : "air",
        physiology.paediatricOnOxygen
      );
    }
    if (parameter === "acvpu") {
      return scoreMapped(value, physiology.paediatricAcvpu);
    }
  }

  if (parameter === "onOxygen") {
    return scoreMapped(
      value ? "oxygen" : "air",
      physiology.adultNEWS2.onOxygen
    );
  }
  if (parameter === "acvpu") {
    return scoreMapped(value, physiology.adultNEWS2.acvpu);
  }
  const table = population === "obstetric" &&
    ["sbp", "hr"].includes(parameter)
    ? physiology.obstetricOverrides[parameter]
    : physiology.adultNEWS2[parameter];
  return scoreBands(value, table);
}

export function scorePhysiology(encounter, observation, protocol) {
  const { ageBand: band } = ageBand(
    encounter.age_value,
    encounter.age_unit,
    protocol
  );
  const agePopulation = protocol.ageBands.find(({ band: name }) => name === band)
    .population;
  const population = agePopulation === "adult" &&
    ["pregnant", "postpartum"].includes(encounter.pregnancy_status)
    ? "obstetric"
    : agePopulation;
  const perParameter = [];
  const missing = [];

  for (const [parameter, field] of PARAMETERS) {
    const value = observation[field];
    if (value === null || value === undefined ||
        observation.unobtainable.includes(field)) {
      missing.push(field);
      continue;
    }
    perParameter.push({
      parameter,
      value,
      score: scoreParameter(
        parameter,
        value,
        population,
        band,
        protocol.physiology
      )
    });
  }

  return {
    score: perParameter.reduce((total, item) => total + item.score, 0),
    perParameter,
    missing,
    singleParameterThree: perParameter.some(({ score }) =>
      score === protocol.physiology.adultNEWS2.singleParameterTriggerScore
    )
  };
}
