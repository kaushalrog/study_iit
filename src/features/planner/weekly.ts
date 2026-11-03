import { addDays, DateKey } from '../../utils/dates';

export interface WeekTask { planDate: DateKey; status: string; plannedMinutes: number; external: boolean }
export interface WeekDay { date: DateKey; planned: number; done: number; minutes: number }
export interface WeekSummary {
  days: WeekDay[];
  plannedTotal: number;
  doneTotal: number;
  /** Minutes actually timed in the study timer. Untimed work is not guessed. */
  minutesTotal: number;
  /** Days with at least one finished session. */
  activeDays: number;
  message: string;
}

/**
 * Seven days ending on `endDate`. Moved ("rescheduled") tasks are not counted as planned or missed:
 * moving something is a sensible choice, not a failure.
 */
export function summarizeWeek(endDate: DateKey, tasks: WeekTask[], timed: { planDate: DateKey; minutes: number }[]): WeekSummary {
  const days: WeekDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = addDays(endDate, -i);
    const mine = tasks.filter((t) => t.planDate === date && !t.external && t.status !== 'rescheduled');
    days.push({
      date,
      planned: mine.length,
      done: mine.filter((t) => t.status === 'done').length,
      minutes: timed.filter((t) => t.planDate === date).reduce((a, t) => a + t.minutes, 0),
    });
  }
  const plannedTotal = days.reduce((a, d) => a + d.planned, 0);
  const doneTotal = days.reduce((a, d) => a + d.done, 0);
  const minutesTotal = days.reduce((a, d) => a + d.minutes, 0);
  const activeDays = days.filter((d) => d.done > 0).length;

  let message: string;
  if (plannedTotal === 0) message = 'No plan has been made this week yet.';
  else if (doneTotal === 0) message = 'A fresh start is fine. Do one session today and the week begins.';
  else if (doneTotal >= plannedTotal) message = `You finished every planned session this week: ${doneTotal} of ${plannedTotal}.`;
  else message = `You finished ${doneTotal} of ${plannedTotal} planned sessions across ${activeDays} day${activeDays === 1 ? '' : 's'}.`;
  return { days, plannedTotal, doneTotal, minutesTotal, activeDays, message };
}
