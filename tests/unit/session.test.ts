import { answer, clearAnswer, deadline, finish, goTo, isExpired, paletteStatus, progress, remainingMs, restore, serialize, startSession, tick, toggleMark } from '../../src/features/exam-engine/session';
import { scoreExam } from '../../src/features/exam-engine/scoring';
import { buildCustomExam, BankQuestion, selectQuestions } from '../../src/features/practice/quiz';

const T0 = 1_000_000;
const ids = ['a', 'b', 'c'];

describe('exam session', () => {
  it('refuses an empty session', () => expect(() => startSession([], T0, null)).toThrow());

  it('attributes time to the question being viewed', () => {
    let s = startSession(ids, T0, null);
    s = goTo(s, 1, T0 + 5_000);
    s = goTo(s, 2, T0 + 12_000);
    s = finish(s, T0 + 20_000);
    expect(s.timeMs).toEqual({ a: 5_000, b: 7_000, c: 8_000 });
  });
  it('tracks answers, clears, and review marks per question', () => {
    let s = startSession(ids, T0, null);
    s = answer(s, { selected: ['B'] }, T0 + 1000);
    s = toggleMark(s, T0 + 2000);
    expect(paletteStatus(s, 'a')).toBe('answered_marked');
    s = clearAnswer(s, T0 + 3000);
    expect(paletteStatus(s, 'a')).toBe('marked');
    s = toggleMark(s, T0 + 3500);
    expect(paletteStatus(s, 'a')).toBe('visited');
    expect(paletteStatus(s, 'b')).toBe('unvisited');
  });
  it('treats integer 0 as answered and an empty selection as unanswered', () => {
    let s = startSession(ids, T0, null);
    s = answer(s, { numeric: 0 }, T0);
    expect(progress(s).answered).toBe(1);
    s = answer(s, { selected: [] }, T0);
    expect(progress(s).answered).toBe(0);
  });
  it('reports remaining time and blocks edits after the deadline', () => {
    let s = startSession(ids, T0, 60_000);
    expect(remainingMs(s, T0 + 20_000)).toBe(40_000);
    expect(isExpired(s, T0 + 60_000)).toBe(true);
    s = answer(s, { selected: ['A'] }, T0 + 61_000);
    expect(s.responses).toEqual({});
  });
  it('caps attributed time and finish time at the deadline', () => {
    const s = finish(startSession(ids, T0, 60_000), T0 + 500_000);
    expect(s.finishedAt).toBe(T0 + 60_000);
    expect(s.timeMs.a).toBe(60_000);
    expect(deadline(s)).toBe(T0 + 60_000);
  });
  it('ignores navigation outside the paper and actions after finishing', () => {
    let s = startSession(ids, T0, null);
    expect(goTo(s, 9, T0).index).toBe(0);
    s = finish(s, T0 + 1);
    expect(answer(s, { selected: ['A'] }, T0 + 2)).toBe(s);
  });

  describe('crash recovery', () => {
    it('restores answers and keeps the clock running while the app was closed', () => {
      let s = startSession(ids, T0, 600_000);
      s = answer(s, { selected: ['C'] }, T0 + 10_000);
      s = goTo(s, 1, T0 + 20_000);
      const saved = serialize(s);
      const r = restore(saved, T0 + 120_000)!; // reopened 100 s later
      expect(r.expired).toBe(false);
      expect(r.state.responses).toEqual({ a: { selected: ['C'] } });
      expect(r.state.index).toBe(1);
      expect(remainingMs(r.state, T0 + 120_000)).toBe(480_000);
      // time away is not credited to question b
      expect(tick(r.state, T0 + 125_000).timeMs.b).toBe(5_000);
    });
    it('flags a session whose time ran out while closed', () => {
      const r = restore(serialize(startSession(ids, T0, 60_000)), T0 + 3_600_000)!;
      expect(r.expired).toBe(true);
    });
    it('does not credit time spent closed to a question even when the clock ran out', () => {
      let s = startSession(ids, T0, 600_000);
      s = answer(s, { selected: ['A'] }, T0 + 5_000); // last action at 5 s, then the app dies
      const r = restore(serialize(s), T0 + 3_600_000)!;
      const done = finish(r.state, T0 + 3_600_000);
      expect(done.responses).toEqual({ a: { selected: ['A'] } });
      expect(done.timeMs.a ?? 0).toBeLessThanOrEqual(5_000);
      expect(done.finishedAt).toBe(T0 + 600_000);
    });
    it('rejects corrupt saves instead of crashing', () => {
      expect(restore('{nope', T0)).toBeNull();
      expect(restore(JSON.stringify({ questionIds: [] }), T0)).toBeNull();
    });
  });
});

const bq = (id: string, o: Partial<BankQuestion> = {}): BankQuestion => ({
  id, chapterId: 'ch1', subject: 'physics', type: 'single', difficulty: 'main', verified: true, ...o,
});

describe('quiz selection', () => {
  const bank = [
    bq('f1', { difficulty: 'foundation' }), bq('f2', { difficulty: 'foundation' }),
    bq('m1'), bq('m2'), bq('a1', { difficulty: 'advanced' }), bq('a2', { difficulty: 'advanced' }),
    bq('u1', { verified: false }), bq('c2', { chapterId: 'ch2' }),
  ];
  it('never selects unverified questions', () => {
    const got = selectQuestions(bank, { count: 50 });
    expect(got.map((q) => q.id)).not.toContain('u1');
    expect(got).toHaveLength(7);
  });
  it('filters by chapter and difficulty', () => {
    expect(selectQuestions(bank, { count: 10, chapterIds: ['ch2'] }).map((q) => q.id)).toEqual(['c2']);
    expect(selectQuestions(bank, { count: 10, difficulty: 'advanced' })).toHaveLength(2);
  });
  it('orders progressively from foundation to advanced', () => {
    const got = selectQuestions(bank, { count: 6, progressive: true, chapterIds: ['ch1'] });
    const ranks = got.map((q) => ['foundation', 'main', 'advanced'].indexOf(q.difficulty));
    expect(ranks).toEqual([...ranks].sort());
    expect(new Set(ranks).size).toBe(3);
  });
  it('is reproducible for a seed and honours exclusions', () => {
    const a = selectQuestions(bank, { count: 4, seed: 7 }).map((q) => q.id);
    expect(selectQuestions(bank, { count: 4, seed: 7 }).map((q) => q.id)).toEqual(a);
    expect(selectQuestions(bank, { count: 10, exclude: ['m1'] }).map((q) => q.id)).not.toContain('m1');
  });
});

describe('custom exam end-to-end through the scoring engine', () => {
  const picked = [bq('s1'), bq('s2'), bq('i1', { type: 'integer', subject: 'math' }), bq('x1', { type: 'multi' })];
  const keys = { s1: { correct: ['A'] }, s2: { correct: ['B'] }, i1: { numeric: 12 }, x1: { correct: ['A', 'C'] } };
  const { config, questions } = buildCustomExam('Quick test', picked, keys, { correct: 4, incorrect: -1, partialPerCorrectOption: 1 }, 30);

  it('groups questions into sections with the chosen marking', () => {
    expect(config.sections.map((s) => [s.id, s.questionCount])).toEqual([['physics-single', 2], ['math-integer', 1], ['physics-multi', 1]]);
    expect(config.sections.find((s) => s.id === 'math-integer')!.rule.incorrect).toBe(0);
    expect(config.sections.find((s) => s.id === 'physics-multi')!.rule.partialPerCorrectOption).toBe(1);
  });
  it('requires an answer key for every question', () => {
    expect(() => buildCustomExam('x', [bq('zz')], {}, { correct: 4, incorrect: -1, partialPerCorrectOption: null }, null)).toThrow();
  });
  it('scores a played session: finish → score', () => {
    let s = startSession(questions.map((q) => q.id), T0, 30 * 60_000);
    const play = (id: string, r: Parameters<typeof answer>[1], t: number) => { s = goTo(s, s.questionIds.indexOf(id), T0 + t); s = answer(s, r, T0 + t + 1); };
    play('s1', { selected: ['A'] }, 1000);   // +4
    play('s2', { selected: ['C'] }, 5000);   // -1
    play('i1', { numeric: 13 }, 9000);       // 0
    play('x1', { selected: ['A'] }, 14000);  // partial +1
    s = finish(s, T0 + 20_000);
    const r = scoreExam({ config, questions, responses: s.responses, timeMs: s.timeMs });
    expect(r.totalMarks).toBe(4);
    expect(r.maxMarks).toBe(16);
    expect([r.correct, r.partial, r.incorrect, r.unanswered]).toEqual([1, 1, 2, 0]);
    expect(r.negativeLost).toBe(1);
    expect(r.totalTimeMs).toBe(20_000);
  });
});
