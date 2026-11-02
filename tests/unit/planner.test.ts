import { cycleInfo } from '../../src/features/planner/cycle';
import { generateDailyPlan, PlanUnit, pickSubject, subjectAllocation } from '../../src/features/planner/planner';
import { diffDays, addDays } from '../../src/utils/dates';

const unit = (o: Partial<PlanUnit> & Pick<PlanUnit, 'id' | 'subject'>): PlanUnit => ({
  chapterId: o.id, chapterTitle: o.id, title: o.id, masteryScore: null, status: 'not_started', hasContent: true, ...o,
});
const units: PlanUnit[] = [
  unit({ id: 'inv-trig', subject: 'math', title: 'Inverse Trigonometry' }),
  unit({ id: 'binomial', subject: 'math', title: 'Binomial Theorem' }),
  unit({ id: 'gravitation', subject: 'physics', title: 'Gravitation' }),
  unit({ id: 'kinetics', subject: 'chemistry', title: 'Chemical Kinetics' }),
];

describe('dates', () => {
  it('computes whole-day differences across DST/month boundaries', () => {
    expect(diffDays('2026-11-01', '2026-11-10')).toBe(9);
    expect(diffDays('2026-10-31', '2026-11-01')).toBe(1);
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
  });
});

describe('28-day cycle', () => {
  const exam = '2026-11-10';
  it('puts exam day on day 28 and starts 27 days earlier', () => {
    const c = cycleInfo(exam, exam);
    expect(c).toMatchObject({ day: 28, phaseKey: 'exam', daysToExam: 0, startDate: '2026-10-14' });
  });
  it('maps 1 Nov 2026 to day 19 (advanced problem solving)', () => {
    expect(cycleInfo('2026-11-01', exam)).toMatchObject({ day: 19, phaseKey: 'advanced', daysToExam: 9 });
  });
  it.each([
    ['2026-10-14', 'foundation'], ['2026-10-20', 'foundation'], ['2026-10-21', 'strengthening'],
    ['2026-11-04', 'revision'], ['2026-11-08', 'mock'], ['2026-11-09', 'mock'],
  ])('%s is %s', (d, key) => expect(cycleInfo(d, exam).phaseKey).toBe(key));
  it('treats dates before the cycle as foundation and after the exam as post_exam', () => {
    expect(cycleInfo('2026-09-01', exam).phaseKey).toBe('foundation');
    expect(cycleInfo('2026-11-11', exam).phaseKey).toBe('post_exam');
  });
});

describe('subject allocation', () => {
  it('sums to 1 and keeps Mathematics above its floor', () => {
    const a = subjectAllocation(units.map((u) => (u.subject === 'math' ? { ...u, masteryScore: 95, status: 'practising' as const } : { ...u, masteryScore: 10 })));
    expect(a.math + a.physics + a.chemistry).toBeCloseTo(1, 2);
    expect(a.math).toBeGreaterThanOrEqual(0.15);
  });
  it('leans Physics > Chemistry > Maths when nothing is assessed (initial 40/35/25 prioritisation)', () => {
    const a = subjectAllocation(units);
    expect(a.physics).toBeGreaterThan(a.chemistry);
    expect(a.chemistry).toBeGreaterThan(a.math);
  });
  it('gives zero share to a subject with no units and renormalises', () => {
    const a = subjectAllocation(units.filter((u) => u.subject !== 'chemistry'));
    expect(a.chemistry).toBe(0);
    expect(a.math + a.physics).toBeCloseTo(1, 2);
  });
  it('picks the subject lagging furthest behind its target', () => {
    const a = { physics: 0.4, chemistry: 0.35, math: 0.25 };
    expect(pickSubject(a, {})).toBe('physics');
    expect(pickSubject(a, { physics: 120, chemistry: 0, math: 0 })).toBe('chemistry');
    expect(pickSubject(a, { physics: 80, chemistry: 70, math: 0 })).toBe('math');
  });
});

describe('daily plan', () => {
  const base = { examDate: '2026-11-10', units };
  it('follows the real weekday routine and fits within two hours including homework', () => {
    const p = generateDailyPlan({ ...base, today: '2026-11-02' }); // Monday
    expect(p.holiday).toBe(false);
    expect(p.tasks.map((t) => [t.slot, t.start, t.end])).toEqual([
      ['homework', '18:30', '19:00'], ['concept', '19:00', '19:40'], ['break', '19:40', '19:50'],
      ['practice', '19:50', '20:20'], ['recall', '20:20', '20:30'],
    ]);
    const all = p.tasks.reduce((a, t) => a + t.minutes, 0);
    expect(all).toBeLessThanOrEqual(120);
    expect(p.tasks.find((t) => t.slot === 'homework')?.external).toBe(true);
  });
  it('uses advanced-level practice on cycle day 19', () => {
    const p = generateDailyPlan({ ...base, today: '2026-11-02' });
    expect(p.tasks.find((t) => t.slot === 'practice')?.difficulty).toBe('advanced');
  });
  it('adds an optional extra hour on weekends only', () => {
    expect(generateDailyPlan({ ...base, today: '2026-11-01' }).tasks.some((t) => t.slot === 'extra')).toBe(true); // Sunday
    expect(generateDailyPlan({ ...base, today: '2026-11-03' }).tasks.some((t) => t.slot === 'extra')).toBe(false);
  });
  it('does not stack catch-up work after missed days (same minutes regardless of history)', () => {
    const a = generateDailyPlan({ ...base, today: '2026-11-03', recentMinutes: {} });
    const b = generateDailyPlan({ ...base, today: '2026-11-03', recentMinutes: { physics: 0 }, overdueRevisions: 40 });
    expect(b.totalMinutes).toBe(a.totalMinutes);
    expect(b.tasks.find((t) => t.slot === 'recall')?.title).toBe('Review 5 overdue mistakes');
  });
  it('flags missing lesson content instead of pretending to teach', () => {
    const p = generateDailyPlan({ ...base, today: '2026-11-03', units: units.map((u) => ({ ...u, hasContent: false })) });
    expect(p.tasks.find((t) => t.slot === 'concept')?.needsSetup).toBe('content');
  });
  it('asks for syllabus setup when there are no units at all', () => {
    const p = generateDailyPlan({ ...base, today: '2026-11-03', units: [] });
    expect(p.subject).toBeNull();
    expect(p.tasks.find((t) => t.slot === 'concept')?.needsSetup).toBe('content');
  });
  it('is deterministic', () => {
    expect(generateDailyPlan({ ...base, today: '2026-11-03' })).toEqual(generateDailyPlan({ ...base, today: '2026-11-03' }));
  });
});
