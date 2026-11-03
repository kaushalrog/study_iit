import type { DailyPlan } from '../../features/planner/planner';
import { summarizeWeek, WeekSummary } from '../../features/planner/weekly';
import { addDays, DateKey } from '../../utils/dates';
import { newId, seedId } from '../../utils/ids';
import type { SqlDb } from '../sqlite/types';
import { updateRow, upsertRow } from './base';

export type TaskStatus = 'pending' | 'done' | 'skipped' | 'rescheduled';

export interface PersistedTask {
  id: string; planDate: DateKey; slot: string; startTime: string | null; endTime: string | null; title: string; detail: string | null;
  subject: 'math' | 'physics' | 'chemistry' | null; unitId: string | null; plannedMinutes: number; difficulty: string | null;
  external: boolean; needsSetup: string | null; status: TaskStatus; completedAt: string | null; actualMinutes: number;
}
export interface ActiveTimer { sessionId: string; taskId: string; startedAt: number }

/** Same id on every device for the same day and slot, so two devices never create two plans. */
export const taskId = (date: DateKey, slot: string) => seedId(`task:${date}:${slot}`);
const TIMER_KEY = 'active_timer';
/** A forgotten timer must not credit hours of "study". */
export const MAX_SESSION_MINUTES = 180;

const hydrate = (r: Record<string, unknown>): PersistedTask => ({
  id: r.id as string, planDate: r.plan_date as string, slot: r.slot as string, startTime: r.start_time as string | null, endTime: r.end_time as string | null,
  title: r.title as string, detail: r.detail as string | null, subject: r.subject_key as PersistedTask['subject'], unitId: r.chapter_id as string | null,
  plannedMinutes: r.planned_minutes as number, difficulty: r.difficulty as string | null, external: !!r.external, needsSetup: r.needs_setup as string | null,
  status: r.status as TaskStatus, completedAt: r.completed_at as string | null, actualMinutes: (r.actual as number) ?? 0,
});

export const plannerRepo = {
  /**
   * Save today's plan the first time it is seen. Later calls change nothing, so the plan stays steady
   * even if mastery changes during the day. Breaks are not stored.
   */
  async ensureDay(db: SqlDb, plan: DailyPlan): Promise<void> {
    await db.tx(async () => {
      for (const t of plan.tasks) {
        if (t.slot === 'break') continue;
        const id = taskId(plan.date, t.slot);
        if (await db.first('SELECT 1 AS x FROM study_tasks WHERE id = ?', [id])) continue;
        await upsertRow(db, 'study_tasks', {
          id, plan_date: plan.date, slot: t.slot, title: t.title, detail: t.detail ?? null, subject_key: t.subject ?? null, chapter_id: t.unitId ?? null,
          topic_id: null, planned_minutes: t.minutes, status: 'pending', start_time: t.start, end_time: t.end, difficulty: t.difficulty ?? null,
          external: t.external ? 1 : 0, needs_setup: t.needsSetup ?? null,
        });
      }
    });
  },

  async tasks(db: SqlDb, date: DateKey): Promise<PersistedTask[]> {
    const rows = await db.all<Record<string, unknown>>(
      `SELECT t.*, COALESCE((SELECT SUM(s.actual_minutes) FROM study_sessions s WHERE s.task_id = t.id AND s.deleted_at IS NULL), 0) AS actual
       FROM study_tasks t WHERE t.plan_date = ? AND t.deleted_at IS NULL ORDER BY t.start_time`, [date]);
    return rows.map(hydrate);
  },

  async setStatus(db: SqlDb, id: string, status: TaskStatus, now = new Date()): Promise<void> {
    await updateRow(db, 'study_tasks', id, { status, completed_at: status === 'done' ? now.toISOString() : null });
  },

  /** Units to repeat in the same slot today because they were moved from yesterday. No extra work is added. */
  async carryOver(db: SqlDb, today: DateKey): Promise<Partial<Record<'concept' | 'practice', string>>> {
    const rows = await db.all<{ slot: string; chapter_id: string | null }>(
      "SELECT slot, chapter_id FROM study_tasks WHERE plan_date = ? AND status = 'rescheduled' AND chapter_id IS NOT NULL AND deleted_at IS NULL", [addDays(today, -1)]);
    const out: Partial<Record<'concept' | 'practice', string>> = {};
    for (const r of rows) if ((r.slot === 'concept' || r.slot === 'practice') && r.chapter_id) out[r.slot] = r.chapter_id;
    return out;
  },

  async activeTimer(db: SqlDb): Promise<ActiveTimer | null> {
    const r = await db.first<{ value: string }>('SELECT value FROM app_meta WHERE key = ?', [TIMER_KEY]);
    if (!r) return null;
    try { return JSON.parse(r.value) as ActiveTimer; } catch { return null; }
  },

  /** Start timing a task. Any other running timer is stopped first, so time is never counted twice. */
  async startTimer(db: SqlDb, task: Pick<PersistedTask, 'id' | 'subject' | 'unitId'>, now = Date.now()): Promise<ActiveTimer> {
    await this.stopTimer(db, now);
    const sessionId = newId();
    await upsertRow(db, 'study_sessions', { id: sessionId, task_id: task.id, subject_key: task.subject, chapter_id: task.unitId, started_at: new Date(now).toISOString(), actual_minutes: 0 });
    const timer: ActiveTimer = { sessionId, taskId: task.id, startedAt: now };
    await db.run('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)', [TIMER_KEY, JSON.stringify(timer)]);
    return timer;
  },

  /** Stop the running timer and record the minutes. Returns minutes recorded, or null if none was running. */
  async stopTimer(db: SqlDb, now = Date.now()): Promise<number | null> {
    const t = await this.activeTimer(db);
    if (!t) return null;
    const minutes = Math.min(MAX_SESSION_MINUTES, Math.max(0, Math.round((now - t.startedAt) / 60_000)));
    await updateRow(db, 'study_sessions', t.sessionId, { ended_at: new Date(now).toISOString(), actual_minutes: minutes });
    await db.run('DELETE FROM app_meta WHERE key = ?', [TIMER_KEY]);
    return minutes;
  },

  async week(db: SqlDb, endDate: DateKey): Promise<WeekSummary> {
    const from = addDays(endDate, -6);
    const tasks = await db.all<{ plan_date: string; status: string; planned_minutes: number; external: number }>(
      'SELECT plan_date, status, planned_minutes, external FROM study_tasks WHERE plan_date >= ? AND plan_date <= ? AND deleted_at IS NULL', [from, endDate]);
    const timed = await db.all<{ plan_date: string; minutes: number }>(
      `SELECT t.plan_date AS plan_date, s.actual_minutes AS minutes FROM study_sessions s JOIN study_tasks t ON t.id = s.task_id
       WHERE t.plan_date >= ? AND t.plan_date <= ? AND s.deleted_at IS NULL`, [from, endDate]);
    return summarizeWeek(endDate, tasks.map((t) => ({ planDate: t.plan_date, status: t.status, plannedMinutes: t.planned_minutes, external: !!t.external })), timed.map((t) => ({ planDate: t.plan_date, minutes: t.minutes })));
  },
};
