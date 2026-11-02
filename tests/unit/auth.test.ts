import { describeAuthError, validateCredentials } from '../../src/services/auth/errors';
import { supabaseRemote } from '../../src/services/sync/supabaseRemote';

describe('auth error messages', () => {
  it.each([
    [{ message: 'Invalid login credentials', status: 400 }, /not right/],
    [{ message: 'Email not confirmed' }, /confirmed/],
    [{ message: 'Network request failed' }, /Can't reach/],
    [{ message: 'x', status: 429 }, /Too many/],
    [{ message: 'something internal: db host 10.0.0.5' }, /Could not sign in/],
  ])('%j', (e, re) => expect(describeAuthError(e)).toMatch(re));
  it('never leaks server internals', () => expect(describeAuthError({ message: 'secret stack trace at /srv/app' })).not.toMatch(/secret|srv/));
  it('validates the form before calling the server', () => {
    expect(validateCredentials('nope', '')).toEqual({ email: expect.any(String), password: expect.any(String) });
    expect(validateCredentials(' a@b.co ', 'pw')).toEqual({});
  });
});

describe('supabaseRemote adapter', () => {
  const chain = (result: { data: unknown; error: { message: string } | null }) => {
    const calls: unknown[][] = [];
    const q: Record<string, unknown> = {
      select: (...a: unknown[]) => { calls.push(['select', ...a]); return q; },
      order: (...a: unknown[]) => { calls.push(['order', ...a]); return q; },
      limit: (...a: unknown[]) => { calls.push(['limit', ...a]); return q; },
      gte: (...a: unknown[]) => { calls.push(['gte', ...a]); return q; },
      then: (res: (v: unknown) => unknown) => res(result),
    };
    return { q, calls };
  };
  it('pulls oldest-first from the cursor, inclusive', async () => {
    const { q, calls } = chain({ data: [{ id: '1' }], error: null });
    const r = await supabaseRemote({ from: () => q as never }).pull('notes', '2026-11-02T00:00:00.000Z', 500);
    expect(r.rows).toEqual([{ id: '1' }]);
    expect(calls).toEqual([['select', '*'], ['order', 'updated_at', { ascending: true }], ['limit', 500], ['gte', 'updated_at', '2026-11-02T00:00:00.000Z']]);
  });
  it('upserts keyed on id and surfaces errors', async () => {
    const upsert = jest.fn().mockResolvedValue({ error: { message: 'rls denied' } });
    const r = await supabaseRemote({ from: () => ({ upsert }) as never }).upsert('notes', { id: 'n1' });
    expect(upsert).toHaveBeenCalledWith({ id: 'n1' }, { onConflict: 'id' });
    expect(r.error).toEqual({ message: 'rls denied' });
  });
});
