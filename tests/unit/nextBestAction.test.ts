import { computeMastery } from '../../src/features/analytics/mastery';
import { ActionInput, nextBestAction, rankActions, TopicSignal } from '../../src/features/dashboard/nextBestAction';

const NOW = Date.UTC(2026, 10, 1);
const none = computeMastery([], NOW);
const topic = (o: Partial<TopicSignal> = {}): TopicSignal => ({ id: 't', title: 'Gravitation', subjectLabel: 'Physics', mastery: none, hasContent: true, status: 'not_started', ...o });
const input = (o: Partial<ActionInput> = {}): ActionInput => ({
  today: '2026-11-01', daysToNextExam: 9, overdueRevisions: 0, topics: [topic()], mocksCompletedThisCycle: 0, minutesAvailableToday: 90, recentAttempts7d: 0, ...o,
});

describe('next best action', () => {
  it('asks for content setup honestly when no chapter has any material', () => {
    const a = nextBestAction(input({ topics: [topic({ hasContent: false })] }));
    expect(a.kind).toBe('setup_content');
  });
  it('prioritises overdue revisions over starting new topics', () => {
    expect(nextBestAction(input({ overdueRevisions: 4 })).kind).toBe('revise_mistakes');
  });
  it('recommends a timed test close to the exam if none has been done', () => {
    expect(nextBestAction(input({ daysToNextExam: 2 })).kind).toBe('take_mock');
    expect(nextBestAction(input({ daysToNextExam: 2, mocksCompletedThisCycle: 1 })).kind).not.toBe('take_mock');
  });
  it('does not push a mock when the exam is far away', () => {
    expect(nextBestAction(input({ daysToNextExam: 20 })).kind).toBe('learn_topic');
  });
  it('targets the weakest assessed topic using its weakest component', () => {
    const weak = computeMastery(Array.from({ length: 6 }, (_, i) => ({ correct: i < 2, difficulty: 'main' as const, kind: 'practice' as const, hintUsed: false, verified: true, at: NOW })), NOW);
    const strongish = computeMastery(Array.from({ length: 6 }, (_, i) => ({ correct: i < 5, difficulty: 'main' as const, kind: 'practice' as const, hintUsed: false, verified: true, at: NOW })), NOW);
    const a = nextBestAction(input({ topics: [topic({ id: 'a', title: 'A', mastery: strongish }), topic({ id: 'b', title: 'B', mastery: weak })] }));
    expect(a).toMatchObject({ kind: 'targeted_practice', topicId: 'b' });
    expect(a.reason).toBe(weak.recommendedAction);
  });
  it('falls back to a neutral message with no signals', () => {
    expect(nextBestAction(input({ topics: [] })).kind).toBe('keep_going');
  });
  it('returns every candidate best-first', () => {
    const r = rankActions(input({ overdueRevisions: 2, daysToNextExam: 1 }));
    expect(r.map((x) => x.priority)).toEqual([...r.map((x) => x.priority)].sort((a, b) => b - a));
  });
});
