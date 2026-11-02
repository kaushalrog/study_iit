import { addDays, DateKey, diffDays } from '../../utils/dates';

export type PhaseKey =
  | 'foundation'
  | 'strengthening'
  | 'advanced'
  | 'revision'
  | 'mock'
  | 'exam'
  | 'post_exam';

export interface PhaseDef {
  key: PhaseKey;
  label: string;
  /** Inclusive, 1-based cycle days. */
  fromDay: number;
  toDay: number;
  focus: string;
  /** Question difficulty emphasised in this phase. */
  practiceLevel: 'foundation' | 'main' | 'advanced' | 'mixed' | 'mock';
}

/** Default 28-day cycle from the ORBIT brief. Replaceable per coaching calendar. */
export const DEFAULT_CYCLE: PhaseDef[] = [
  { key: 'foundation', label: 'Foundation & concepts', fromDay: 1, toDay: 7, focus: 'Understand each concept from the beginning.', practiceLevel: 'foundation' },
  { key: 'strengthening', label: 'Strengthening', fromDay: 8, toDay: 14, focus: 'Topic-wise practice at standard level.', practiceLevel: 'main' },
  { key: 'advanced', label: 'Advanced problem solving', fromDay: 15, toDay: 21, focus: 'Multi-step and unfamiliar questions.', practiceLevel: 'advanced' },
  { key: 'revision', label: 'Revision & mixed practice', fromDay: 22, toDay: 25, focus: 'Revise weak topics; mix subjects.', practiceLevel: 'mixed' },
  { key: 'mock', label: 'Mock tests & final revision', fromDay: 26, toDay: 27, focus: 'Timed mocks and light final revision.', practiceLevel: 'mock' },
  { key: 'exam', label: 'Exam day', fromDay: 28, toDay: 28, focus: 'Sit the exam, then record your result.', practiceLevel: 'mock' },
];

export interface CycleInfo {
  phase: PhaseDef | null;
  phaseKey: PhaseKey;
  /** 1-based day number inside the cycle (clamped to 1..length for display); null if outside. */
  day: number | null;
  daysToExam: number;
  length: number;
  startDate: DateKey;
}

/**
 * Locate `today` within a cycle whose final day (default day 28) is the first exam date.
 * `length` and `phases` are configurable for the real coaching calendar.
 */
export function cycleInfo(
  today: DateKey,
  examDate: DateKey,
  phases: PhaseDef[] = DEFAULT_CYCLE,
  length = 28,
): CycleInfo {
  const startDate = addDays(examDate, -(length - 1));
  const daysToExam = diffDays(today, examDate);
  const rawDay = diffDays(startDate, today) + 1;

  if (daysToExam < 0) {
    return { phase: null, phaseKey: 'post_exam', day: null, daysToExam, length, startDate };
  }
  // Before the cycle starts we treat the student as being on day 1 (foundation) rather than idle.
  const day = Math.max(1, rawDay);
  const phase = phases.find((p) => day >= p.fromDay && day <= p.toDay) ?? null;
  return { phase, phaseKey: phase?.key ?? 'foundation', day, daysToExam, length, startDate };
}
