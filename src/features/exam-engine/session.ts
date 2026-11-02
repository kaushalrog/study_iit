import { z } from 'zod';
import type { Response } from './types';

/**
 * Pure state machine for a (timed or untimed) test session. No timers, storage or UI here:
 * callers pass `now` explicitly, which keeps it deterministic and testable.
 */
export interface SessionState {
  questionIds: string[];
  index: number;
  responses: Record<string, Response>;
  marked: Record<string, boolean>;
  visited: Record<string, boolean>;
  timeMs: Record<string, number>;
  startedAt: number;
  /** null = untimed */
  durationMs: number | null;
  /** Wall-clock moment time was last attributed to the current question. */
  lastTick: number;
  finishedAt: number | null;
}

export const sessionSchema = z.object({
  questionIds: z.array(z.string()),
  index: z.number().int().min(0),
  responses: z.record(z.string(), z.object({ selected: z.array(z.string()).optional(), numeric: z.number().nullable().optional() })),
  marked: z.record(z.string(), z.boolean()),
  visited: z.record(z.string(), z.boolean()),
  timeMs: z.record(z.string(), z.number()),
  startedAt: z.number(),
  durationMs: z.number().nullable(),
  lastTick: z.number(),
  finishedAt: z.number().nullable(),
});

export function startSession(questionIds: string[], now: number, durationMs: number | null): SessionState {
  if (questionIds.length === 0) throw new Error('A session needs at least one question.');
  return {
    questionIds, index: 0, responses: {}, marked: {}, visited: { [questionIds[0]]: true }, timeMs: {},
    startedAt: now, durationMs, lastTick: now, finishedAt: null,
  };
}

export const currentId = (s: SessionState) => s.questionIds[s.index];
export const isFinished = (s: SessionState) => s.finishedAt !== null;

export function deadline(s: SessionState): number | null {
  return s.durationMs === null ? null : s.startedAt + s.durationMs;
}
export function remainingMs(s: SessionState, now: number): number | null {
  const d = deadline(s);
  return d === null ? null : Math.max(0, d - now);
}
export function isExpired(s: SessionState, now: number): boolean {
  const d = deadline(s);
  return d !== null && now >= d;
}

/** Attribute elapsed time since the last tick to the current question (capped at the deadline). */
export function tick(s: SessionState, now: number): SessionState {
  if (isFinished(s)) return s;
  const end = deadline(s);
  const upTo = end === null ? now : Math.min(now, end);
  const delta = Math.max(0, upTo - s.lastTick);
  const id = currentId(s);
  return { ...s, lastTick: Math.max(s.lastTick, upTo), timeMs: { ...s.timeMs, [id]: (s.timeMs[id] ?? 0) + delta } };
}

export function answer(s: SessionState, response: Response, now: number): SessionState {
  if (isFinished(s) || isExpired(s, now)) return s;
  const t = tick(s, now);
  return { ...t, responses: { ...t.responses, [currentId(t)]: response } };
}

export function clearAnswer(s: SessionState, now: number): SessionState {
  if (isFinished(s) || isExpired(s, now)) return s;
  const t = tick(s, now);
  const { [currentId(t)]: _drop, ...rest } = t.responses;
  return { ...t, responses: rest };
}

export function toggleMark(s: SessionState, now: number): SessionState {
  if (isFinished(s)) return s;
  const t = tick(s, now);
  const id = currentId(t);
  return { ...t, marked: { ...t.marked, [id]: !t.marked[id] } };
}

export function goTo(s: SessionState, index: number, now: number): SessionState {
  if (isFinished(s) || index < 0 || index >= s.questionIds.length) return s;
  const t = tick(s, now);
  return { ...t, index, visited: { ...t.visited, [t.questionIds[index]]: true } };
}

export function finish(s: SessionState, now: number): SessionState {
  if (isFinished(s)) return s;
  const t = tick(s, now);
  const end = deadline(t);
  return { ...t, finishedAt: end === null ? now : Math.min(now, end) };
}

export interface Progress { answered: number; marked: number; unvisited: number; total: number }
export function progress(s: SessionState): Progress {
  return {
    answered: s.questionIds.filter((id) => isAnswered(s.responses[id])).length,
    marked: s.questionIds.filter((id) => s.marked[id]).length,
    unvisited: s.questionIds.filter((id) => !s.visited[id]).length,
    total: s.questionIds.length,
  };
}
const isAnswered = (r: Response | undefined) =>
  !!r && ((r.selected?.length ?? 0) > 0 || (r.numeric !== undefined && r.numeric !== null && Number.isFinite(r.numeric)));

export type PaletteStatus = 'answered' | 'marked' | 'answered_marked' | 'visited' | 'unvisited';
export function paletteStatus(s: SessionState, id: string): PaletteStatus {
  const a = isAnswered(s.responses[id]);
  const m = !!s.marked[id];
  if (a && m) return 'answered_marked';
  if (m) return 'marked';
  if (a) return 'answered';
  return s.visited[id] ? 'visited' : 'unvisited';
}

export const serialize = (s: SessionState) => JSON.stringify(s);

/**
 * Restore after an unexpected shutdown. The exam clock keeps running while the app was closed
 * (like a real paper); time away is not credited to any question. Returns null if unreadable.
 */
export function restore(json: string, now: number): { state: SessionState; expired: boolean } | null {
  try {
    const parsed = sessionSchema.safeParse(JSON.parse(json));
    if (!parsed.success) return null;
    const s = parsed.data as SessionState;
    if (s.index >= s.questionIds.length) return null;
    const expired = !isFinished(s) && isExpired(s, now);
    // Time while the app was closed is never credited to a question, whether or not the clock ran out.
    const dl = deadline(s);
    const resumed = isFinished(s) ? s : expired ? { ...s, lastTick: Math.max(s.lastTick, dl ?? s.lastTick) } : { ...s, lastTick: now };
    return { state: resumed, expired };
  } catch {
    return null;
  }
}
