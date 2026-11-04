import { busyMessage, canRestartNow, describeRuntime, friendlyError, MIN_CHECK_GAP_MS, shouldCheck, updateState } from '../../src/services/updates/policy';

const base = { enabled: true, isChecking: false, isDownloading: false, isAvailable: false, isPending: false, error: null, offline: false };

describe('update state', () => {
  it.each([
    [{ enabled: false }, 'disabled'], [{ isChecking: true }, 'checking'], [{ isDownloading: true }, 'downloading'], [{ isPending: true }, 'ready'],
    [{ isAvailable: true }, 'available'], [{ error: 'x' }, 'error'], [{ offline: true }, 'offline'], [{}, 'current'],
    [{ isPending: true, isChecking: true }, 'ready'], [{ enabled: false, isPending: true }, 'disabled'],
  ])('%j -> %s', (o, s) => expect(updateState({ ...base, ...o })).toBe(s));
});

describe('safe restart', () => {
  it('refuses while a test or unsaved writing is open, and says why', () => {
    expect(canRestartNow([])).toBe(true);
    expect(canRestartNow(['a timed test is in progress'])).toBe(false);
    expect(busyMessage(['a timed test is in progress', 'an unsaved note'])).toMatch(/timed test.*and.*unsaved note.*next time/);
  });
});

describe('check cadence', () => {
  it('checks at once, then not again within the gap', () => {
    expect(shouldCheck(null, 1000)).toBe(true);
    expect(shouldCheck(1000, 1000 + MIN_CHECK_GAP_MS - 1)).toBe(false);
    expect(shouldCheck(1000, 1000 + MIN_CHECK_GAP_MS)).toBe(true);
  });
});

describe('plain-language output', () => {
  it('describes a build with no update installed, and an installed one', () => {
    expect(describeRuntime({ updateId: null, runtimeVersion: 'abc', channel: null, isEmbedded: true, createdAt: null })).toMatchObject({ update: expect.stringMatching(/Built into the app/), channel: 'none' });
    expect(describeRuntime({ updateId: 'u-1', runtimeVersion: 'r1', channel: 'production', isEmbedded: false, createdAt: new Date('2026-11-05T10:20:30Z') })).toEqual({ update: 'u-1', runtime: 'r1', channel: 'production', published: '2026-11-05 10:20 UTC' });
  });
  it('treats network failures as offline and keeps other errors short', () => {
    expect(friendlyError(new Error('Network request failed'))).toEqual({ offline: true, text: 'No internet connection.' });
    expect(friendlyError(new Error('Unable to resolve host u.expo.dev')).offline).toBe(true);
    expect(friendlyError(new Error('x'.repeat(500))).text.length).toBe(200);
  });
});
