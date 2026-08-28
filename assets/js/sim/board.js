import { createClock } from "../clock.js";
import { score } from "../engine/index.js";
import { projectCohort } from "./cohort.js";
import {
  applySurgeReassessment,
  createSurgeController,
  degradeEncounter,
  instrumentFields,
  surgeEncounter
} from "./surge.js";

const MILLISECONDS_PER_MINUTE = 60_000;

export function assessBoard(cohort, protocol, now, degraded = false) {
  const boardStartsAt = Date.parse(cohort.boardStartsAt);
  const atMinute = (now - boardStartsAt) / MILLISECONDS_PER_MINUTE;
  return projectCohort(cohort, atMinute).map(encounter =>
    degraded ? degradeEncounter(encounter) : encounter
  ).map(encounter => ({
    encounter,
    assessment: score(encounter, protocol, now),
    lastRecomputedAt: now
  })).sort((left, right) => {
    const leftBand = left.assessment.band ?? left.assessment.provisionalBand;
    const rightBand = right.assessment.band ?? right.assessment.provisionalBand;
    return Number(right.assessment.modelLockedOut) -
        Number(left.assessment.modelLockedOut) ||
      Number(leftBand.slice(1)) - Number(rightBand.slice(1)) ||
      right.assessment.priorityIndex - left.assessment.priorityIndex;
  });
}

export function createBoardSimulation(
  cohort,
  protocol,
  onTick = () => {},
  onModeChange = () => {}
) {
  const surgeTemplates = structuredClone(cohort.encounters);
  let surgeTemplateIndex = 0;
  let degraded = false;
  let board = assessBoard(
    cohort,
    protocol,
    Date.parse(cohort.boardStartsAt)
  );
  let surge;
  function mode(surgeMode = surge.state().mode) {
    if (surgeMode === "SURGE" && degraded) return "SURGE_DEGRADED";
    if (surgeMode === "SURGE") return "SURGE";
    return degraded ? "DEGRADED" : "NORMAL";
  }
  const clock = createClock(cohort.boardStartsAt, now => {
    surge.advance(now);
    board = applySurgeReassessment(
      assessBoard(cohort, protocol, now, degraded),
      protocol,
      surge.state().mode === "SURGE"
    );
    onTick(board, now);
  });
  surge = createSurgeController(protocol.surge, {
    onArrival(at) {
      const atMinute = (at - Date.parse(cohort.boardStartsAt)) /
        MILLISECONDS_PER_MINUTE;
      cohort.encounters.push(surgeEncounter(
        surgeTemplates[surgeTemplateIndex % surgeTemplates.length],
        nextEncounterId(),
        atMinute
      ));
      surgeTemplateIndex += 1;
    },
    onModeChange(change) {
      onModeChange({
        ...change,
        fromMode: mode(change.fromMode),
        toMode: mode(change.toMode)
      });
    }
  });
  function recompute() {
    board = applySurgeReassessment(
      assessBoard(cohort, protocol, clock.now(), degraded),
      protocol,
      surge.state().mode === "SURGE"
    );
    onTick(board, clock.now());
  }
  function nextEncounterId() {
    const number = Math.max(...cohort.encounters.map(({ encounterId }) =>
      Number(encounterId.slice(3))
    )) + 1;
    return `PT-${String(number).padStart(4, "0")}`;
  }
  return {
    board: () => board,
    clock,
    surge,
    startSurge() {
      surge.start(clock.now());
      recompute();
    },
    stopSurge() {
      surge.stop();
    },
    enterDegraded() {
      if (degraded) return;
      const fromMode = mode();
      degraded = true;
      const surgeState = surge.state();
      onModeChange({
        fromMode,
        toMode: mode(),
        at: clock.now(),
        trigger: {
          unavailableFields: instrumentFields,
          arrivalRatePerHour: surgeState.arrivalRatePerHour,
          multiplier: surgeState.multiplier,
          baselineArrivalsPerHour: protocol.surge.baselineArrivalsPerHour
        },
        auto: false
      });
      recompute();
    },
    exitDegraded() {
      if (!degraded) return;
      const fromMode = mode();
      degraded = false;
      const surgeState = surge.state();
      onModeChange({
        fromMode,
        toMode: mode(),
        at: clock.now(),
        trigger: {
          restoredFields: instrumentFields,
          arrivalRatePerHour: surgeState.arrivalRatePerHour,
          multiplier: surgeState.multiplier,
          baselineArrivalsPerHour: protocol.surge.baselineArrivalsPerHour
        },
        auto: false
      });
      recompute();
    },
    isDegraded: () => degraded,
    admitEncounter(encounter) {
      const encounterId = nextEncounterId();
      const { frame, ...fields } = encounter;
      const atMinute = (clock.now() - Date.parse(cohort.boardStartsAt)) /
        MILLISECONDS_PER_MINUTE;
      cohort.encounters.push({
        ...fields,
        encounterId,
        arrivedAtMinute: atMinute,
        trajectory: [{ ...frame, atMinute }]
      });
      recompute();
      return encounterId;
    },
    reassessEncounter(encounterId, frame) {
      const encounter = cohort.encounters.find(source =>
        source.encounterId === encounterId
      );
      encounter.trajectory.push({
        ...frame,
        atMinute: (clock.now() - Date.parse(cohort.boardStartsAt)) /
          MILLISECONDS_PER_MINUTE
      });
      encounter.trajectory.sort((left, right) =>
        left.atMinute - right.atMinute
      );
      recompute();
    }
  };
}
