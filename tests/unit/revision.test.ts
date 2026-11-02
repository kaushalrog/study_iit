import { BASE_INTERVALS_DAYS, initialRevision, recordRevision } from '../../src/features/error-book/revision';

const T = '2026-11-01';

describe('revision scheduler', () => {
  it('schedules the first revisit 1 day after a mistake is saved', () => {
    expect(initialRevision(T)).toMatchObject({ stage: 0, intervalDays: 1, dueOn: '2026-11-02' });
  });
  it('walks the 1 → 3 → 7 → 14 day ladder on correct answers', () => {
    let s = initialRevision(T);
    const gaps: number[] = [s.intervalDays];
    for (let i = 0; i < 3; i++) { s = recordRevision(s, 'correct', T); gaps.push(s.intervalDays); }
    expect(gaps).toEqual([...BASE_INTERVALS_DAYS]);
  });
  it('keeps growing (doubling, capped) after the ladder', () => {
    let s = initialRevision(T);
    for (let i = 0; i < 4; i++) s = recordRevision(s, 'correct', T);
    expect(s.intervalDays).toBe(28);
    for (let i = 0; i < 3; i++) s = recordRevision(s, 'correct', T);
    expect(s.intervalDays).toBeLessThanOrEqual(45);
  });
  it('shortens to next day and steps back after a wrong answer', () => {
    let s = initialRevision(T);
    s = recordRevision(s, 'correct', T);
    s = recordRevision(s, 'correct', T); // stage 2, 7 days
    const w = recordRevision(s, 'wrong', T);
    expect(w.intervalDays).toBe(1);
    expect(w.stage).toBe(1);
    expect(w.dueOn).toBe('2026-11-02');
  });
  it('flags concept review and a comparable problem on repeated failure', () => {
    let s = initialRevision(T);
    const first = recordRevision(s, 'wrong', T);
    expect(first.reviewConcept).toBe(false);
    expect(first.needsComparableProblem).toBe(true);
    const second = recordRevision(first, 'wrong', T);
    expect(second.reviewConcept).toBe(true);
    expect(second.consecutiveWrong).toBe(2);
  });
  it('resets the failure streak after a correct answer', () => {
    const s = recordRevision(recordRevision(initialRevision(T), 'wrong', T), 'wrong', T);
    expect(recordRevision(s, 'correct', T).consecutiveWrong).toBe(0);
  });
  it('never drops the stage below zero', () => {
    expect(recordRevision(initialRevision(T), 'wrong', T).stage).toBe(0);
  });
  it('handles month boundaries', () => {
    expect(recordRevision({ stage: 2, intervalDays: 7, consecutiveWrong: 0, dueOn: T }, 'correct', '2026-11-28').dueOn).toBe('2026-12-12');
  });
});
