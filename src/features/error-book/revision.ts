import { addDays, DateKey } from '../../utils/dates';

export const BASE_INTERVALS_DAYS = [1, 3, 7, 14] as const;
export const MAX_INTERVAL_DAYS = 45;

export type RevisionQuality = 'correct' | 'hesitant' | 'wrong';

export interface RevisionState {
  /** Index into the interval ladder of the *next* review (0 = first revisit). */
  stage: number;
  intervalDays: number;
  consecutiveWrong: number;
  dueOn: DateKey;
}

export interface RevisionUpdate extends RevisionState {
  /** Student keeps failing: send them back to the underlying concept, not the same explanation. */
  reviewConcept: boolean;
  /** Suggest generating/finding a comparable practice problem. */
  needsComparableProblem: boolean;
}

/** Schedule the first revisit when a mistake is first saved. */
export function initialRevision(today: DateKey): RevisionState {
  return { stage: 0, intervalDays: BASE_INTERVALS_DAYS[0], consecutiveWrong: 0, dueOn: addDays(today, BASE_INTERVALS_DAYS[0]) };
}

function intervalForStage(stage: number, prevInterval: number): number {
  if (stage < BASE_INTERVALS_DAYS.length) return BASE_INTERVALS_DAYS[stage];
  return Math.min(MAX_INTERVAL_DAYS, Math.round(prevInterval * 2));
}

/** Update the schedule after a review. Wrong answers shorten the interval; repeated failures flag the concept. */
export function recordRevision(state: RevisionState, quality: RevisionQuality, today: DateKey): RevisionUpdate {
  let stage = state.stage;
  let consecutiveWrong = state.consecutiveWrong;
  let intervalDays: number;

  if (quality === 'correct') {
    consecutiveWrong = 0;
    stage = state.stage + 1;
    intervalDays = intervalForStage(stage, state.intervalDays);
  } else if (quality === 'hesitant') {
    consecutiveWrong = 0;
    // Repeat roughly the same gap rather than advancing.
    intervalDays = Math.max(1, Math.round(state.intervalDays * 0.75));
  } else {
    consecutiveWrong += 1;
    stage = Math.max(0, state.stage - 1);
    intervalDays = 1; // a wrong answer is re-tested the next day
  }

  return {
    stage,
    intervalDays,
    consecutiveWrong,
    dueOn: addDays(today, intervalDays),
    reviewConcept: consecutiveWrong >= 2,
    needsComparableProblem: consecutiveWrong >= 1,
  };
}

export interface DueItem {
  id: string;
  dueOn: DateKey;
}

export function isOverdue(item: DueItem, today: DateKey): boolean {
  return item.dueOn < today;
}
export function isDue(item: DueItem, today: DateKey): boolean {
  return item.dueOn <= today;
}
