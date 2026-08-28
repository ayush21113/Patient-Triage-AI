const MILLISECONDS_PER_MINUTE = 60_000;
const FIELD_PRECISION = {
  hr: 0,
  sbp: 0,
  dbp: 0,
  rr: 0,
  spo2: 0,
  tempC: 1,
  capRefillS: 1,
  painScore: 0
};
const ENGINE_FIELD_NAMES = {
  tempC: "temp_c",
  capRefillS: "cap_refill_s",
  spo2OnOxygen: "spo2_on_oxygen"
};

export async function loadCohort() {
  const response = await fetch(new URL(
    "../../data/cohort.json",
    import.meta.url
  ));
  if (!response.ok) throw new Error("Unable to load the simulation cohort");
  return response.json();
}

function interpolateValue(first, second, factor, field) {
  if (typeof first !== "number" || typeof second !== "number") {
    return first ?? null;
  }
  return Number((first + (second - first) * factor).toFixed(
    FIELD_PRECISION[field]
  ));
}

export function frameAt(encounter, atMinute) {
  const first = encounter.trajectory.filter(frame =>
    frame.atMinute <= atMinute
  ).at(-1) ?? encounter.trajectory[0];
  const second = encounter.trajectory.find(frame =>
    frame.atMinute > atMinute
  );
  if (!second || first.atMinute === atMinute) return first;

  const factor = (atMinute - first.atMinute) /
    (second.atMinute - first.atMinute);
  const vitalFields = new Set([
    ...Object.keys(first.vitals),
    ...Object.keys(second.vitals)
  ]);
  return {
    atMinute,
    acvpu: first.acvpu,
    painScore: interpolateValue(
      first.painScore,
      second.painScore,
      factor,
      "painScore"
    ),
    vitals: Object.fromEntries([...vitalFields].map(field => [
      field,
      interpolateValue(
        first.vitals[field],
        second.vitals[field],
        factor,
        field
      )
    ])),
    visual: first.visual,
    unobtainable: first.unobtainable ?? []
  };
}

function observationFrom(frame, boardStartsAt) {
  return {
    observed_at: boardStartsAt + frame.atMinute * MILLISECONDS_PER_MINUTE,
    hr: frame.vitals.hr ?? null,
    sbp: frame.vitals.sbp ?? null,
    dbp: frame.vitals.dbp ?? null,
    rr: frame.vitals.rr ?? null,
    spo2: frame.vitals.spo2 ?? null,
    spo2_on_oxygen: frame.vitals.spo2OnOxygen ?? null,
    temp_c: frame.vitals.tempC ?? null,
    acvpu: frame.acvpu,
    pain_score: frame.painScore ?? null,
    cap_refill_s: frame.vitals.capRefillS ?? null,
    visual: frame.visual ?? {},
    unobtainable: (frame.unobtainable ?? []).map(field =>
      ENGINE_FIELD_NAMES[field] ?? field
    )
  };
}

export function projectEncounter(source, boardStartsAt, atMinute) {
  const boardStart = typeof boardStartsAt === "number"
    ? boardStartsAt
    : Date.parse(boardStartsAt);
  const frames = source.trajectory.filter(frame =>
    frame.atMinute <= atMinute
  );
  if (frames.length === 0) frames.push(source.trajectory[0]);
  if (frames.at(-1).atMinute !== atMinute &&
      source.trajectory.some(frame => frame.atMinute > atMinute)) {
    frames.push(frameAt(source, atMinute));
  }

  return {
    encounter_id: source.encounterId,
    arrived_at: boardStart +
      source.arrivedAtMinute * MILLISECONDS_PER_MINUTE,
    arrival_mode: source.arrivalMode,
    age_value: source.ageValue,
    age_unit: source.ageUnit,
    age_estimated: source.ageEstimated ?? false,
    sex: source.sex,
    pregnancy_status: source.pregnancyStatus ?? "not_pregnant",
    gestation_weeks: source.gestationWeeks ?? null,
    complaint_text: source.complaintText,
    complaint_class: source.complaintClass,
    complaint_qualifiers: source.complaintQualifiers ?? [],
    language: source.language ?? null,
    preexisting_flags: source.preexistingFlags ?? [],
    question_answers: (source.questionAnswers ?? []).map(answer => ({
      question_id: answer.questionId,
      answer: answer.answer,
      answered_at: answer.answeredAt
    })),
    observations: frames.map(frame => observationFrom(frame, boardStart))
  };
}

export function projectCohort(cohort, atMinute) {
  return cohort.encounters.map(encounter =>
    projectEncounter(encounter, cohort.boardStartsAt, atMinute)
  );
}
