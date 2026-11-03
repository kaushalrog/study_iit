import { describeTrend, pctOf, toPoints } from '../../src/features/progress/trend';

describe('score trend', () => {
  it('computes percent of marks and clamps', () => {
    expect(pctOf(45, 180)).toBe(25);
    expect(pctOf(-4, 20)).toBe(0);
    expect(pctOf(5, 0)).toBeNull();
  });
  it('orders oldest first and drops unusable rows', () => {
    const p = toPoints([
      { label: 'b', at: '2026-10-02', total: 50, max: 100 },
      { label: 'x', at: 'nope', total: 1, max: 10 },
      { label: 'z', at: '2026-10-03', total: 1, max: 0 },
      { label: 'a', at: '2026-10-01', total: 30, max: 100 },
    ]);
    expect(p.map((x) => x.label)).toEqual(['a', 'b']);
  });
  it('describes honestly with 0, 1 and many points', () => {
    expect(describeTrend([], 'test')).toBe('No test yet.');
    expect(describeTrend(toPoints([{ label: 'a', at: '2026-10-01', total: 3, max: 10 }]), 'test')).toMatch(/needs at least two/);
    const d = describeTrend(toPoints([{ label: 'a', at: '2026-10-01', total: 30, max: 100 }, { label: 'b', at: '2026-10-02', total: 45, max: 100 }]), 'test');
    expect(d).toBe('2 tests, from 30% to 45% of marks (up 15 points). Best 45%.');
  });
});
