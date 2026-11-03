/** @jest-environment node */
import { migrate } from '../../src/database/migrations';
import { MAX_SESSION_MINUTES, plannerRepo, taskId } from '../../src/database/repositories/planner';
import { IDS, seedInitialData } from '../../src/database/seed';
import { generateDailyPlan, PlanUnit } from '../../src/features/planner/planner';
import { summarizeWeek } from '../../src/features/planner/weekly';
import { mergeRemoteRow } from '../../src/services/sync/engine';
import { memoryDb } from '../unit/sqlite-harness';

const units: PlanUnit[] = [
  { id: IDS.chapter.gravitation, subject: 'physics', chapterId: IDS.chapter.gravitation, chapterTitle: 'Gravitation', title: 'Gravitation', masteryScore: null, status: 'not_started', hasContent: true },
  { id: IDS.chapter.kinetics, subject: 'chemistry', chapterId: IDS.chapter.kinetics, chapterTitle: 'Chemical Kinetics', title: 'Chemical Kinetics', masteryScore: null, status: 'not_started', hasContent: true },
  { id: IDS.chapter.binomial, subject: 'math', chapterId: IDS.chapter.binomial, chapterTitle: 'Binomial Theorem', title: 'Binomial Theorem', masteryScore: null, status: 'not_started', hasContent: true },
];
const plan = (date: string, extra: Partial<Parameters<typeof generateDailyPlan>[0]> = {}) => generateDailyPlan({ today: date, examDate: '2026-11-10', units, ...extra });
async function fresh() { const db = memoryDb(); await migrate(db); await seedInitialData(db); return db; }

describe('persistent daily plan', () => {
  it('stores the day once, without breaks, and is idempotent', async () => {
    const db = await fresh();
    const p = plan('2026-11-04'); // Wednesday
    await plannerRepo.ensureDay(db, p);
    await plannerRepo.ensureDay(db, p);
    const t = await plannerRepo.tasks(db, '2026-11-04');
    expect(t.map((x) => x.slot)).toEqual(['homework', 'concept', 'practice', 'recall']);
    expect(t.every((x) => x.status === 'pending' && x.actualMinutes === 0)).toBe(true);
    expect(t.find((x) => x.slot === 'homework')!.external).toBe(true);
    expect(t[1]).toMatchObject({ startTime: '19:00', endTime: '19:40', plannedMinutes: 40 });
  });

  it("keeps the plan steady even when the inputs change later in the day", async () => {
    const db = await fresh();
    await plannerRepo.ensureDay(db, plan('2026-11-04'));
    const before = (await plannerRepo.tasks(db, '2026-11-04')).map((t) => t.title);
    const changed = units.map((u) => ({ ...u, masteryScore: 95, status: 'practising' as const }));
    await plannerRepo.ensureDay(db, plan('2026-11-04', { units: changed, overdueRevisions: 9 }));
    expect((await plannerRepo.tasks(db, '2026-11-04')).map((t) => t.title)).toEqual(before);
  });

  it('ids are the same on every device for the same day and slot', async () => {
    const [a, b] = [await fresh(), await fresh()];
    await plannerRepo.ensureDay(a, plan('2026-11-04'));
    await plannerRepo.ensureDay(b, plan('2026-11-04'));
    expect((await plannerRepo.tasks(a, '2026-11-04')).map((t) => t.id)).toEqual((await plannerRepo.tasks(b, '2026-11-04')).map((t) => t.id));
    expect((await plannerRepo.tasks(a, '2026-11-04'))[0].id).toBe(taskId('2026-11-04', 'homework'));
  });

  it('ticks tasks done and back, stamping the completion time', async () => {
    const db = await fresh();
    await plannerRepo.ensureDay(db, plan('2026-11-04'));
    const [hw] = await plannerRepo.tasks(db, '2026-11-04');
    await plannerRepo.setStatus(db, hw.id, 'done', new Date('2026-11-04T13:30:00Z'));
    expect((await plannerRepo.tasks(db, '2026-11-04'))[0]).toMatchObject({ status: 'done', completedAt: '2026-11-04T13:30:00.000Z' });
    await plannerRepo.setStatus(db, hw.id, 'pending');
    expect((await plannerRepo.tasks(db, '2026-11-04'))[0]).toMatchObject({ status: 'pending', completedAt: null });
  });

  it('queues plan changes for sync', async () => {
    const db = await fresh();
    await plannerRepo.ensureDay(db, plan('2026-11-04'));
    const q = await db.all<{ table_name: string }>("SELECT table_name FROM sync_outbox WHERE table_name = 'study_tasks'");
    expect(q).toHaveLength(4);
  });
});

describe('study timer', () => {
  it('records whole minutes and shows them on the task', async () => {
    const db = await fresh();
    await plannerRepo.ensureDay(db, plan('2026-11-04'));
    const concept = (await plannerRepo.tasks(db, '2026-11-04')).find((t) => t.slot === 'concept')!;
    const t0 = Date.parse('2026-11-04T13:30:00Z');
    await plannerRepo.startTimer(db, concept, t0);
    expect((await plannerRepo.activeTimer(db))!.taskId).toBe(concept.id);
    expect(await plannerRepo.stopTimer(db, t0 + 37 * 60_000 + 20_000)).toBe(37);
    expect(await plannerRepo.activeTimer(db)).toBeNull();
    expect((await plannerRepo.tasks(db, '2026-11-04')).find((t) => t.slot === 'concept')!.actualMinutes).toBe(37);
  });
  it('starting another task stops the first, so time is never counted twice', async () => {
    const db = await fresh();
    await plannerRepo.ensureDay(db, plan('2026-11-04'));
    const [, concept, practice] = await plannerRepo.tasks(db, '2026-11-04');
    const t0 = Date.parse('2026-11-04T13:30:00Z');
    await plannerRepo.startTimer(db, concept, t0);
    await plannerRepo.startTimer(db, practice, t0 + 10 * 60_000);
    await plannerRepo.stopTimer(db, t0 + 25 * 60_000);
    const t = await plannerRepo.tasks(db, '2026-11-04');
    expect([t[1].actualMinutes, t[2].actualMinutes]).toEqual([10, 15]);
  });
  it('caps a forgotten timer and returns null when nothing runs', async () => {
    const db = await fresh();
    expect(await plannerRepo.stopTimer(db)).toBeNull();
    await plannerRepo.ensureDay(db, plan('2026-11-04'));
    const [hw] = await plannerRepo.tasks(db, '2026-11-04');
    await plannerRepo.startTimer(db, hw, 0);
    expect(await plannerRepo.stopTimer(db, 14 * 3_600_000)).toBe(MAX_SESSION_MINUTES);
  });
  it('survives an app restart because the running timer is stored', async () => {
    const db = await fresh();
    await plannerRepo.ensureDay(db, plan('2026-11-04'));
    const [hw] = await plannerRepo.tasks(db, '2026-11-04');
    await plannerRepo.startTimer(db, hw, 1000);
    expect(await plannerRepo.activeTimer(db)).toMatchObject({ taskId: hw.id, startedAt: 1000 });
  });
});

describe('moving a task to tomorrow', () => {
  it("repeats the unit in the same slot tomorrow without adding any extra work", async () => {
    const db = await fresh();
    await plannerRepo.ensureDay(db, plan('2026-11-04'));
    const today = await plannerRepo.tasks(db, '2026-11-04');
    const concept = today.find((t) => t.slot === 'concept')!;
    await plannerRepo.setStatus(db, concept.id, 'rescheduled');

    const carry = await plannerRepo.carryOver(db, '2026-11-05');
    expect(carry).toEqual({ concept: concept.unitId });
    const normal = plan('2026-11-05');
    const moved = plan('2026-11-05', { carryOver: carry });
    expect(moved.tasks.find((t) => t.slot === 'concept')!.unitId).toBe(concept.unitId);
    expect(moved.totalMinutes).toBe(normal.totalMinutes);
    expect(moved.tasks.length).toBe(normal.tasks.length);
  });
  it('is ignored when the unit has since been mastered', () => {
    const mastered = units.map((u) => (u.id === IDS.chapter.gravitation ? { ...u, status: 'mastered' as const } : u));
    const p = plan('2026-11-05', { units: mastered, carryOver: { concept: IDS.chapter.gravitation } });
    expect(p.tasks.find((t) => t.slot === 'concept')!.unitId).not.toBe(IDS.chapter.gravitation);
  });
  it('only looks at yesterday', async () => {
    const db = await fresh();
    await plannerRepo.ensureDay(db, plan('2026-11-04'));
    const concept = (await plannerRepo.tasks(db, '2026-11-04')).find((t) => t.slot === 'concept')!;
    await plannerRepo.setStatus(db, concept.id, 'rescheduled');
    expect(await plannerRepo.carryOver(db, '2026-11-07')).toEqual({});
  });
});

describe('weekly summary', () => {
  const t = (planDate: string, status: string, external = false) => ({ planDate, status, plannedMinutes: 30, external });
  it('counts planned and finished sessions, ignoring school homework and moved tasks', () => {
    const w = summarizeWeek('2026-11-04', [t('2026-11-04', 'done'), t('2026-11-04', 'pending'), t('2026-11-04', 'done', true), t('2026-11-03', 'rescheduled'), t('2026-11-03', 'done')], [{ planDate: '2026-11-04', minutes: 35 }, { planDate: '2026-11-03', minutes: 20 }]);
    expect(w.days).toHaveLength(7);
    expect([w.plannedTotal, w.doneTotal, w.minutesTotal, w.activeDays]).toEqual([3, 2, 55, 2]);
    expect(w.message).toBe('You finished 2 of 3 planned sessions across 2 days.');
  });
  it('is kind about empty and zero weeks', () => {
    expect(summarizeWeek('2026-11-04', [], []).message).toMatch(/No plan/);
    expect(summarizeWeek('2026-11-04', [t('2026-11-04', 'pending')], []).message).toMatch(/fresh start/i);
    expect(summarizeWeek('2026-11-04', [t('2026-11-04', 'done')], []).message).toMatch(/every planned session/);
  });
  it('reads the stored week end to end', async () => {
    const db = await fresh();
    await plannerRepo.ensureDay(db, plan('2026-11-04'));
    const tasks = await plannerRepo.tasks(db, '2026-11-04');
    await plannerRepo.setStatus(db, tasks.find((x) => x.slot === 'concept')!.id, 'done');
    await plannerRepo.startTimer(db, tasks.find((x) => x.slot === 'concept')!, 0);
    await plannerRepo.stopTimer(db, 42 * 60_000);
    const w = await plannerRepo.week(db, '2026-11-04');
    expect([w.plannedTotal, w.doneTotal, w.minutesTotal]).toEqual([3, 1, 42]);
  });
});

describe('two devices', () => {
  it('a task completed on the phone shows as done on the tablet after a pull', async () => {
    const [phone, tablet] = [await fresh(), await fresh()];
    await plannerRepo.ensureDay(phone, plan('2026-11-04'));
    await plannerRepo.ensureDay(tablet, plan('2026-11-04'));
    const task = (await plannerRepo.tasks(phone, '2026-11-04'))[1];
    await new Promise((r) => setTimeout(r, 8));
    await plannerRepo.setStatus(phone, task.id, 'done');
    const row = (await phone.first<Record<string, unknown>>('SELECT * FROM study_tasks WHERE id = ?', [task.id]))!;
    // The server sends boolean/timestamp types; mergeRemoteRow converts them like a real pull.
    await mergeRemoteRow(tablet, 'study_tasks', { ...row, external: !!row.external });
    expect((await plannerRepo.tasks(tablet, '2026-11-04'))[1].status).toBe('done');
    expect((await tablet.first<{ n: number }>('SELECT COUNT(*) n FROM study_tasks'))!.n).toBe(4);
  });
});
