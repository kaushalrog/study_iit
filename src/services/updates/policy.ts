/** Pure rules for the update manager, kept free of React and native modules so they can be tested. */

export interface UpdateFacts {
  enabled: boolean;
  isChecking: boolean;
  isDownloading: boolean;
  isAvailable: boolean;
  isPending: boolean;
  error: string | null;
  offline: boolean;
}
export type UpdateState = 'disabled' | 'checking' | 'downloading' | 'ready' | 'available' | 'error' | 'offline' | 'current';

/** One word for what the update system is doing, in the order a person cares about. */
export function updateState(f: UpdateFacts): UpdateState {
  if (!f.enabled) return 'disabled';
  if (f.isPending) return 'ready';
  if (f.isDownloading) return 'downloading';
  if (f.isChecking) return 'checking';
  if (f.error) return 'error';
  if (f.isAvailable) return 'available';
  if (f.offline) return 'offline';
  return 'current';
}

export const STATE_TEXT: Record<UpdateState, string> = {
  disabled: 'Updates are not enabled in this build.',
  checking: 'Checking for updates…',
  downloading: 'Downloading an update…',
  ready: 'An update is ready. Restart ORBIT to use it.',
  available: 'An update is available.',
  error: 'The last check did not work.',
  offline: 'You appear to be offline. ORBIT will check again later.',
  current: 'ORBIT is up to date.',
};

/** Things that must not be interrupted by a restart: a test in progress, an unsaved note or lesson. */
export type BusyReasons = readonly string[];
export const canRestartNow = (busy: BusyReasons) => busy.length === 0;
export const busyMessage = (busy: BusyReasons) => `Not now: ${busy.join(' and ')}. ORBIT will keep the update ready and use it the next time it opens.`;

export const MIN_CHECK_GAP_MS = 6 * 60 * 60 * 1000;
/** Check on launch and when coming back to the app, but not more than once every few hours. */
export const shouldCheck = (lastCheckAt: number | null, now: number, gap = MIN_CHECK_GAP_MS) => lastCheckAt === null || now - lastCheckAt >= gap;

/** Friendly rendering of the numbers expo-updates exposes. */
export function describeRuntime(r: { updateId: string | null; runtimeVersion: string | null; channel: string | null; isEmbedded: boolean; createdAt: Date | null }) {
  return {
    update: r.isEmbedded || !r.updateId ? 'Built into the app (no update installed yet)' : r.updateId,
    runtime: r.runtimeVersion ?? 'unknown',
    channel: r.channel ?? 'none',
    published: r.createdAt ? r.createdAt.toISOString().slice(0, 16).replace('T', ' ') + ' UTC' : 'not available',
  };
}

/** Network and server problems are normal on a phone. Say so plainly instead of showing a stack trace. */
export function friendlyError(e: unknown): { offline: boolean; text: string } {
  const m = e instanceof Error ? e.message : String(e ?? '');
  if (/network|offline|internet|timed? ?out|unable to resolve|failed to connect|ENOTFOUND|ECONN/i.test(m)) return { offline: true, text: 'No internet connection.' };
  return { offline: false, text: m.slice(0, 200) || 'Unknown error' };
}
