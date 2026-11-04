import { httpContentRemote } from '../../src/services/content/httpContentRemote';

describe('http content feed', () => {
  it('reads the manifest and a pack, and turns server errors into errors', async () => {
    const calls: string[] = [];
    const fake = (async (url: string) => { calls.push(url); return url.includes('/boom') ? { ok: false, status: 500, json: async () => ({}) } : { ok: true, status: 200, json: async () => (url.endsWith('/manifest') ? [{ id: 'a' }] : { id: 'a', payload: {} }) }; }) as unknown as typeof fetch;
    const r = httpContentRemote('http://x/feed/', fake);
    expect(await r.manifest()).toEqual([{ id: 'a' }]);
    expect((await r.pack('chapter:a b')).id).toBe('a');
    expect(calls).toEqual(['http://x/feed/manifest', 'http://x/feed/pack/chapter%3Aa%20b']);
    await expect(httpContentRemote('http://x/boom', fake).manifest()).rejects.toThrow(/500/);
  });
});
