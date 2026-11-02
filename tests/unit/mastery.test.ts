import { computeMastery, MasteryAttempt, MASTERY_WEIGHTS } from '../../src/features/analytics/mastery';

const NOW = Date.UTC(2026, 10, 1);
const att = (o: Partial<MasteryAttempt> = {}): MasteryAttempt => ({
  correct: true, difficulty: 'main', kind: 'practice', hintUsed: false, verified: true, at: NOW, ...o,
});
const many = (n: number, o: Partial<MasteryAttempt> = {}) => Array.from({ length: n }, () => att(o));

describe('computeMastery', () => {
  it('weights sum to 100%', () => {
    expect(Object.values(MASTERY_WEIGHTS).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
  });
  it('shows "not assessed" with no data — never an invented percentage', () => {
    const r = computeMastery([], NOW);
    expect(r.state).toBe('not_assessed');
    expect(r.score).toBeNull();
    expect(r.mastered).toBe(false);
  });
  it('ignores unverified (e.g. AI-generated) questions entirely', () => {
    const r = computeMastery(many(30, { verified: false }), NOW);
    expect(r.state).toBe('not_assessed');
    expect(r.evidenceCount).toBe(0);
  });
  it('requires a minimum amount of evidence before scoring', () => {
    expect(computeMastery(many(2), NOW).state).toBe('not_assessed');
    expect(computeMastery(many(3), NOW).state).toBe('assessed');
  });
  it('does not award mastery on high accuracy from too few answers', () => {
    const r = computeMastery(many(5), NOW);
    expect(r.score).toBe(100);
    expect(r.mastered).toBe(false);
    expect(r.confidence).not.toBe('high');
  });
  it('awards mastery only with broad, sufficient, strong evidence', () => {
    const attempts = [
      ...many(4, { kind: 'concept_check' }),
      ...many(6, { kind: 'practice' }),
      ...many(3, { kind: 'revision' }),
    ];
    const r = computeMastery(attempts, NOW);
    expect(r.mastered).toBe(true);
    expect(r.confidence).toBe('high');
  });
  it('does not count hinted or foundation-level answers as independent solving', () => {
    const r = computeMastery([...many(3, { hintUsed: true }), ...many(3, { difficulty: 'foundation' })], NOW);
    expect(r.components.independent).toBeNull();
    expect(r.components.practice).toBe(1);
  });
  it('identifies the weakest component and recommends an action for it', () => {
    const attempts = [
      ...many(4, { kind: 'concept_check' }),
      ...many(4, { kind: 'practice' }),
      ...many(4, { kind: 'revision', correct: false }),
    ];
    const r = computeMastery(attempts, NOW);
    expect(r.weakestComponent).toBe('retention');
    expect(r.recommendedAction).toMatch(/revise/i);
    expect(r.mastered).toBe(false);
  });
  it('weights recent attempts above old ones', () => {
    const old = Array.from({ length: 5 }, () => att({ correct: true, at: NOW - 120 * 86_400_000 }));
    const recent = Array.from({ length: 5 }, () => att({ correct: false }));
    expect(computeMastery([...old, ...recent], NOW).score!).toBeLessThan(30);
  });
  it('reports last assessed date', () => {
    expect(computeMastery(many(3), NOW).lastAssessedAt).toBe(NOW);
  });
});
