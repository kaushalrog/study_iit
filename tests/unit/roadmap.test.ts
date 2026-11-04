import { nodeStatus, NodeEvidence, prereqInfo, stageProgress, weeklyGoals } from '../../src/features/roadmap/roadmap';
import { ROADMAP, STAGES } from '../../src/features/roadmap/syllabus';

const ev = (o: Record<string, Partial<NodeEvidence>>) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { linked: true, hasMaterial: true, score: null, ...v }])) as Record<string, NodeEvidence>;

describe('roadmap data', () => {
  it('has unique keys, valid prerequisites, no cycles, and prerequisites never come from a later stage', () => {
    const keys = new Set(ROADMAP.map((n) => n.key));
    expect(keys.size).toBe(ROADMAP.length);
    for (const n of ROADMAP) for (const p of n.prereqs) {
      expect(keys.has(p)).toBe(true);
      expect(ROADMAP.find((x) => x.key === p)!.stage).toBeLessThanOrEqual(n.stage);
    }
    const visit = (k: string, path: string[]): void => { expect(path).not.toContain(k); ROADMAP.find((x) => x.key === k)!.prereqs.forEach((p) => visit(p, [...path, k])); };
    ROADMAP.forEach((n) => visit(n.key, []));
  });
  it('covers all three subjects and the four current chapters, independent of school class', () => {
    expect(new Set(ROADMAP.map((n) => n.subject))).toEqual(new Set(['math', 'physics', 'chemistry']));
    expect(ROADMAP.filter((n) => n.chapter).map((n) => n.chapter).sort()).toEqual(['Binomial Theorem', 'Chemical Kinetics', 'Gravitation', 'Inverse Trigonometry']);
    expect(STAGES).toHaveLength(7);
    expect(ROADMAP.find((n) => n.chapter === 'Chemical Kinetics')!.stage).toBeGreaterThan(ROADMAP.find((n) => n.chapter === 'Gravitation')!.stage);
  });
});

describe('status and goals', () => {
  it('status comes only from evidence', () => {
    expect(nodeStatus(undefined)).toBe('no_material');
    expect(nodeStatus({ linked: true, hasMaterial: false, score: null })).toBe('ready');
    expect(nodeStatus({ linked: true, hasMaterial: true, score: 79 })).toBe('building');
    expect(nodeStatus({ linked: true, hasMaterial: true, score: 80 })).toBe('strong');
  });
  it('prerequisites are reported but never block', () => {
    const e = ev({ 'm-trig': { score: 40 }, 'm-functions': {} });
    const info = prereqInfo(ROADMAP.find((n) => n.key === 'm-invtrig')!, e);
    expect(info.map((i) => [i.node.key, i.state])).toEqual([['m-trig', 'weak'], ['m-functions', 'unchecked']]);
  });
  it('stage progress counts only what exists and what was assessed', () => {
    const p = stageProgress(ev({ 'm-invtrig': { score: 85 }, 'p-gravitation': {} }));
    expect(p[2]).toMatchObject({ stage: 3, withMaterial: 2, assessed: 1, strong: 1 });
    expect(p[0].withMaterial).toBe(0);
  });
  it('weekly goals revise weak prerequisites first, then continue unfinished topics, and never exceed the cap', () => {
    const e = ev({ 'm-invtrig': { score: 60 }, 'm-trig': { score: 30 }, 'p-gravitation': {}, 'c-kinetics': {} });
    const g = weeklyGoals(e, 3);
    expect(g[0]).toMatchObject({ kind: 'revise' });
    expect(g[0].node.key).toBe('m-trig');
    expect(g.length).toBeLessThanOrEqual(3);
    expect(weeklyGoals({}, 3)).toEqual([]);
  });
});
