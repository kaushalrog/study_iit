import { addDays, DateKey, isWeekend } from '../../utils/dates';
import { SubjectKey } from '../exam-engine/types';
import { cycleInfo, CycleInfo, PhaseDef, DEFAULT_CYCLE } from './cycle';

export interface RoutineSlot {
  key: 'homework' | 'concept' | 'break' | 'practice' | 'recall' | 'extra';
  label: string;
  start: string; // HH:MM 24h
  end: string;
  minutes: number;
  /** Homework is the school's, not ORBIT content. */
  external?: boolean;
}

const m = (start: string, end: string) => {
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  return h2 * 60 + m2 - (h1 * 60 + m1);
};
const slot = (key: RoutineSlot['key'], label: string, start: string, end: string, external = false): RoutineSlot => ({
  key, label, start, end, minutes: m(start, end), external: external || undefined,
});

/** Weekday routine from the student profile. The 30 min homework is inside the 2 h study capacity. */
export const WEEKDAY_ROUTINE: RoutineSlot[] = [
  slot('homework', 'School homework', '18:30', '19:00', true),
  slot('concept', 'Concept learning', '19:00', '19:40'),
  slot('break', 'Break', '19:40', '19:50'),
  slot('practice', 'Question practice', '19:50', '20:20'),
  slot('recall', 'Recall & mistake review', '20:20', '20:30'),
];
/** Optional extra hour on holidays/weekends. */
export const HOLIDAY_EXTRA: RoutineSlot = slot('extra', 'Extra study (holiday)', '10:00', '11:00');

export interface PlanUnit {
  id: string;
  subject: SubjectKey;
  chapterId: string;
  chapterTitle: string;
  topicId?: string | null;
  title: string;
  /** null = not assessed */
  masteryScore: number | null;
  status: 'not_started' | 'learning' | 'learning_completed' | 'practising' | 'needs_revision' | 'mastered';
  /** Is there any approved lesson content for this unit? */
  hasContent: boolean;
}

export const BASE_ALLOCATION: Record<SubjectKey, number> = { physics: 0.4, chemistry: 0.35, math: 0.25 };
export const MIN_SHARE: Partial<Record<SubjectKey, number>> = { math: 0.15 };

/**
 * Recalculate subject shares: start from the base split, boost subjects whose units are weakest,
 * drop subjects with nothing in the syllabus, and never let Mathematics fall below its floor.
 */
export function subjectAllocation(units: PlanUnit[], base = BASE_ALLOCATION): Record<SubjectKey, number> {
  const subjects = Object.keys(base) as SubjectKey[];
  const raw = {} as Record<SubjectKey, number>;
  for (const s of subjects) {
    const mine = units.filter((u) => u.subject === s && u.status !== 'mastered');
    if (mine.length === 0) { raw[s] = 0; continue; }
    // Unassessed units count as mid-gap (0.5) so lack of evidence neither inflates nor hides need.
    const gap = mine.reduce((a, u) => a + (1 - (u.masteryScore ?? 50) / 100), 0) / mine.length;
    raw[s] = base[s] * (0.75 + gap);
  }
  let total = subjects.reduce((a, s) => a + raw[s], 0);
  if (total === 0) return { ...base };
  const out = {} as Record<SubjectKey, number>;
  for (const s of subjects) out[s] = raw[s] / total;
  // Floors.
  for (const s of subjects) {
    const floor = MIN_SHARE[s];
    if (floor !== undefined && raw[s] > 0 && out[s] < floor) {
      const deficit = floor - out[s];
      const others = subjects.filter((o) => o !== s && out[o] > 0);
      const otherTotal = others.reduce((a, o) => a + out[o], 0);
      for (const o of others) out[o] -= (deficit * out[o]) / otherTotal;
      out[s] = floor;
    }
  }
  total = subjects.reduce((a, s) => a + out[s], 0);
  for (const s of subjects) out[s] = Math.round((out[s] / total) * 1000) / 1000;
  return out;
}

/** Subject whose actual recent share lags furthest behind its target. Deterministic. */
export function pickSubject(
  allocation: Record<SubjectKey, number>,
  recentMinutes: Partial<Record<SubjectKey, number>>,
): SubjectKey {
  const subjects = (Object.keys(allocation) as SubjectKey[]).filter((s) => allocation[s] > 0);
  const total = subjects.reduce((a, s) => a + (recentMinutes[s] ?? 0), 0);
  let best = subjects[0];
  let bestGap = -Infinity;
  for (const s of subjects) {
    const actual = total > 0 ? (recentMinutes[s] ?? 0) / total : 0;
    const gap = allocation[s] - actual;
    if (gap > bestGap + 1e-9) { best = s; bestGap = gap; }
  }
  return best;
}

export interface PlannedTask {
  slot: RoutineSlot['key'];
  start: string;
  end: string;
  minutes: number;
  subject?: SubjectKey;
  unitId?: string;
  title: string;
  detail?: string;
  difficulty?: 'foundation' | 'main' | 'advanced' | 'mixed' | 'mock';
  /** If set, the UI should send the student to set up content instead of pretending to teach. */
  needsSetup?: 'content';
  external?: boolean;
}

export interface DailyPlan {
  date: DateKey;
  cycle: CycleInfo;
  holiday: boolean;
  subject: SubjectKey | null;
  allocation: Record<SubjectKey, number>;
  tasks: PlannedTask[];
  totalMinutes: number;
}

export interface PlanInput {
  today: DateKey;
  examDate: DateKey;
  units: PlanUnit[];
  recentMinutes?: Partial<Record<SubjectKey, number>>;
  overdueRevisions?: number;
  /** Units whose task was moved from yesterday, by slot. They take the same slot today instead of adding extra work. */
  carryOver?: Partial<Record<'concept' | 'practice', string>>;
  isHoliday?: boolean;
  phases?: PhaseDef[];
}

function pickUnit(units: PlanUnit[], subject: SubjectKey, mode: 'learn' | 'practice'): PlanUnit | undefined {
  const mine = units.filter((u) => u.subject === subject && u.status !== 'mastered');
  if (mine.length === 0) return undefined;
  const rank = (u: PlanUnit) => {
    if (mode === 'learn') {
      const order = { not_started: 0, learning: 1, needs_revision: 2, learning_completed: 3, practising: 4, mastered: 5 } as const;
      return order[u.status] * 1000 + (u.masteryScore ?? 50);
    }
    // Practice the weakest unit that has already been studied; else fall back to any.
    const studied = u.status === 'not_started' ? 1000 : 0;
    return studied + (u.masteryScore ?? 50);
  };
  return [...mine].sort((a, b) => rank(a) - rank(b) || a.title.localeCompare(b.title))[0];
}

/** Build one day's plan. Missed days never add catch-up minutes: the routine is fixed. */
export function generateDailyPlan(input: PlanInput): DailyPlan {
  const { today, examDate, units, recentMinutes = {}, overdueRevisions = 0 } = input;
  const holiday = input.isHoliday ?? isWeekend(today);
  const cycle = cycleInfo(today, examDate, input.phases ?? DEFAULT_CYCLE);
  const allocation = subjectAllocation(units);
  const subject = units.length ? pickSubject(allocation, recentMinutes) : null;

  const tasks: PlannedTask[] = [];
  const level = cycle.phase?.practiceLevel ?? 'main';

  for (const r of WEEKDAY_ROUTINE) {
    if (r.key === 'break') { tasks.push({ slot: r.key, start: r.start, end: r.end, minutes: r.minutes, title: r.label }); continue; }
    if (r.key === 'homework') { tasks.push({ slot: r.key, start: r.start, end: r.end, minutes: r.minutes, title: r.label, external: true }); continue; }

    if (r.key === 'recall') {
      tasks.push({
        slot: r.key, start: r.start, end: r.end, minutes: r.minutes,
        title: overdueRevisions > 0 ? `Review ${Math.min(overdueRevisions, 5)} overdue mistake${overdueRevisions === 1 ? '' : 's'}` : 'Quick recall of today\'s topic',
        detail: overdueRevisions > 5 ? `${overdueRevisions} are overdue. Do five now; the rest can wait. No need to catch up all at once.` : undefined,
      });
      continue;
    }

    if (!subject) {
      tasks.push({ slot: r.key, start: r.start, end: r.end, minutes: r.minutes, title: r.label, needsSetup: 'content', detail: 'Add your syllabus to get a plan.' });
      continue;
    }
    const carried = input.carryOver?.[r.key as 'concept' | 'practice'];
    const carriedUnit = carried ? units.find((u) => u.id === carried && u.status !== 'mastered') : undefined;
    const unit = carriedUnit ?? pickUnit(units, subject, r.key === 'concept' ? 'learn' : 'practice');
    if (!unit) { tasks.push({ slot: r.key, start: r.start, end: r.end, minutes: r.minutes, subject, title: `${r.label}: all ${subject} units mastered`, detail: 'Use mixed practice.' }); continue; }

    if (r.key === 'concept') {
      const noteOnly = cycle.phaseKey === 'mock' || cycle.phaseKey === 'exam';
      tasks.push({
        slot: r.key, start: r.start, end: r.end, minutes: r.minutes, subject: unit.subject, unitId: unit.id,
        title: noteOnly ? `Light revision: ${unit.title}` : `Learn: ${unit.title}`,
        detail: unit.hasContent ? cycle.phase?.focus : 'No lesson content imported yet.',
        needsSetup: unit.hasContent ? undefined : 'content',
      });
    } else {
      tasks.push({
        slot: r.key, start: r.start, end: r.end, minutes: r.minutes, subject: unit.subject, unitId: unit.id,
        title: level === 'mock' ? 'Timed mixed practice' : `Practise: ${unit.title}`,
        difficulty: level,
        detail: cycle.phase?.focus,
      });
    }
  }

  if (holiday) {
    tasks.push({ slot: 'extra', start: HOLIDAY_EXTRA.start, end: HOLIDAY_EXTRA.end, minutes: HOLIDAY_EXTRA.minutes, title: 'Optional extra hour', detail: 'Only if you feel fresh. Skipping is fine.' });
  }

  const totalMinutes = tasks.filter((t) => !t.external && t.slot !== 'break').reduce((a, t) => a + t.minutes, 0);
  return { date: today, cycle, holiday, subject, allocation, tasks, totalMinutes };
}

/** Move unfinished tasks to the next day without stacking them on top of that day's own plan. */
export function reschedule(taskDate: DateKey): DateKey {
  return addDays(taskDate, 1);
}
