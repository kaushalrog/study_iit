import { DateKey } from '../../utils/dates';
import { MasteryResult } from '../analytics/mastery';

export interface TopicSignal {
  id: string;
  title: string;
  subjectLabel: string;
  mastery: MasteryResult;
  hasContent: boolean;
  status: string;
}

export interface ActionInput {
  today: DateKey;
  daysToNextExam: number | null;
  overdueRevisions: number;
  topics: TopicSignal[];
  mocksCompletedThisCycle: number;
  minutesAvailableToday: number;
  recentAttempts7d: number;
}

export type ActionKind = 'setup_content' | 'revise_mistakes' | 'take_mock' | 'learn_topic' | 'targeted_practice' | 'assess_topic' | 'keep_going';

export interface NextBestAction {
  kind: ActionKind;
  title: string;
  reason: string;
  route: string;
  priority: number;
  topicId?: string;
}

/** Rank candidate actions from real data; returns all candidates, best first. */
export function rankActions(input: ActionInput): NextBestAction[] {
  const out: NextBestAction[] = [];
  const { topics } = input;

  if (topics.length > 0 && topics.every((t) => !t.hasContent)) {
    out.push({
      kind: 'setup_content', priority: 60,
      title: 'Add your lesson material',
      reason: 'Your four chapters are registered but have no lessons or questions yet. Add them from your notes to unlock a real plan.',
      route: '/import',
    });
  }

  if (input.overdueRevisions > 0) {
    const n = input.overdueRevisions;
    out.push({
      kind: 'revise_mistakes', priority: 70 + Math.min(20, n * 3),
      title: `Review ${Math.min(n, 5)} overdue mistake${n === 1 ? '' : 's'}`,
      reason: `${n} item${n === 1 ? ' is' : 's are'} past the revision date. A short review now is easier than relearning later.`,
      route: '/(tabs)/mistakes',
    });
  }

  const d = input.daysToNextExam;
  if (d !== null && d >= 0 && d <= 3 && input.mocksCompletedThisCycle === 0 && input.minutesAvailableToday >= 30) {
    out.push({
      kind: 'take_mock', priority: 85,
      title: 'Take a timed practice test',
      reason: `Your exam is in ${d} day${d === 1 ? '' : 's'} and you haven't done a timed test this cycle.`,
      route: '/(tabs)/practice',
    });
  }

  const withContent = topics.filter((t) => t.hasContent);
  const unassessed = withContent.filter((t) => t.mastery.state === 'not_assessed');
  const assessed = withContent.filter((t) => t.mastery.state === 'assessed' && !t.mastery.mastered);

  if (assessed.length) {
    const weakest = [...assessed].sort((a, b) => (a.mastery.score ?? 0) - (b.mastery.score ?? 0))[0];
    out.push({
      kind: 'targeted_practice', topicId: weakest.id, priority: 65 + (100 - (weakest.mastery.score ?? 0)) / 5,
      title: `Work on ${weakest.title}`,
      reason: weakest.mastery.recommendedAction,
      route: `/chapter/${weakest.id}`,
    });
  }
  if (unassessed.length) {
    const t = unassessed.find((x) => x.status === 'not_started') ?? unassessed[0];
    const started = t.status !== 'not_started';
    out.push({
      kind: started ? 'assess_topic' : 'learn_topic', topicId: t.id, priority: 50,
      title: started ? `Check what you know in ${t.title}` : `Start ${t.title}`,
      reason: started ? 'You have studied this but ORBIT has no answers from you yet to judge understanding.' : 'You have not started this topic.',
      route: `/chapter/${t.id}`,
    });
  }

  if (out.length === 0) {
    out.push({ kind: 'keep_going', priority: 0, title: 'You are on track', reason: 'Nothing urgent. Keep your routine.', route: '/(tabs)/learn' });
  }
  return out.sort((a, b) => b.priority - a.priority);
}

export const nextBestAction = (input: ActionInput): NextBestAction => rankActions(input)[0];
