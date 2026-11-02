export type Difficulty = 'foundation' | 'main' | 'advanced';
export type AttemptKind = 'concept_check' | 'practice' | 'revision';

export interface MasteryAttempt {
  correct: boolean;
  difficulty: Difficulty;
  kind: AttemptKind;
  /** Hints used before answering. Hinted attempts do not count as independent solving. */
  hintUsed: boolean;
  /** Only attempts on verified questions count towards mastery. */
  verified: boolean;
  /** Epoch ms */
  at: number;
}

export const MASTERY_WEIGHTS = {
  concept: 0.3,
  practice: 0.3,
  independent: 0.25,
  retention: 0.15,
} as const;
export type MasteryComponent = keyof typeof MASTERY_WEIGHTS;

export interface MasteryConfig {
  weights: Record<MasteryComponent, number>;
  /** Minimum number of verified attempts before any score is shown. */
  minEvidenceForScore: number;
  /** Minimum number of verified attempts before "mastered" can be awarded. */
  minEvidenceForMastery: number;
  masteredThreshold: number;
  /** Mastery needs evidence on at least this many components. */
  minComponentsForMastery: number;
  halfLifeDays: number;
}

export const DEFAULT_MASTERY_CONFIG: MasteryConfig = {
  weights: { ...MASTERY_WEIGHTS },
  minEvidenceForScore: 3,
  minEvidenceForMastery: 12,
  masteredThreshold: 0.8,
  minComponentsForMastery: 3,
  halfLifeDays: 21,
};

const DIFFICULTY_WEIGHT: Record<Difficulty, number> = { foundation: 0.6, main: 1, advanced: 1.4 };

export type Confidence = 'low' | 'medium' | 'high';

export interface MasteryResult {
  state: 'not_assessed' | 'assessed';
  /** 0..100, null when not assessed */
  score: number | null;
  confidence: Confidence | null;
  evidenceCount: number;
  lastAssessedAt: number | null;
  components: Record<MasteryComponent, number | null>;
  weakestComponent: MasteryComponent | null;
  mastered: boolean;
  recommendedAction: string;
}

function weightedAccuracy(items: { correct: boolean; w: number }[]): number | null {
  const total = items.reduce((a, i) => a + i.w, 0);
  if (total === 0) return null;
  return items.reduce((a, i) => a + (i.correct ? i.w : 0), 0) / total;
}

const ACTIONS: Record<MasteryComponent, string> = {
  concept: 'Re-read the concept and try the concept checks again before more practice.',
  practice: 'Do more topic-wise practice at your current level.',
  independent: 'Attempt questions without hints first; use hints only after a real try.',
  retention: 'Revise this topic from your Error Book and quick-revision summary.',
};

export function computeMastery(
  attempts: MasteryAttempt[],
  now: number,
  config: MasteryConfig = DEFAULT_MASTERY_CONFIG,
): MasteryResult {
  const verified = attempts.filter((a) => a.verified);
  const lastAssessedAt = verified.length ? Math.max(...verified.map((a) => a.at)) : null;
  const empty = (action: string): MasteryResult => ({
    state: 'not_assessed',
    score: null,
    confidence: null,
    evidenceCount: verified.length,
    lastAssessedAt,
    components: { concept: null, practice: null, independent: null, retention: null },
    weakestComponent: null,
    mastered: false,
    recommendedAction: action,
  });

  if (verified.length < config.minEvidenceForScore) {
    return empty(
      verified.length === 0
        ? 'Not assessed yet. Learn the topic, then try a few verified questions.'
        : `Need ${config.minEvidenceForScore - verified.length} more verified answers before a score is shown.`,
    );
  }

  const recency = (a: MasteryAttempt) => Math.pow(0.5, Math.max(0, now - a.at) / 86_400_000 / config.halfLifeDays);
  const w = (a: MasteryAttempt) => recency(a) * DIFFICULTY_WEIGHT[a.difficulty];
  const toItems = (xs: MasteryAttempt[]) => xs.map((a) => ({ correct: a.correct, w: w(a) }));

  const components: Record<MasteryComponent, number | null> = {
    concept: weightedAccuracy(toItems(verified.filter((a) => a.kind === 'concept_check'))),
    practice: weightedAccuracy(toItems(verified.filter((a) => a.kind === 'practice'))),
    independent: weightedAccuracy(
      toItems(verified.filter((a) => a.kind === 'practice' && !a.hintUsed && a.difficulty !== 'foundation')),
    ),
    retention: weightedAccuracy(toItems(verified.filter((a) => a.kind === 'revision'))),
  };

  const present = (Object.keys(components) as MasteryComponent[]).filter((k) => components[k] !== null);
  if (present.length === 0) return empty('Not enough evidence yet.');

  // Missing components are excluded and the remaining weights renormalised; confidence reflects the gap.
  const wSum = present.reduce((a, k) => a + config.weights[k], 0);
  const score01 = present.reduce((a, k) => a + (components[k] as number) * config.weights[k], 0) / wSum;

  const weakest = present.reduce((lo, k) => ((components[k] as number) < (components[lo] as number) ? k : lo), present[0]);
  const missing = (Object.keys(components) as MasteryComponent[]).filter((k) => components[k] === null);

  let confidence: Confidence = 'low';
  if (verified.length >= config.minEvidenceForMastery && present.length >= config.minComponentsForMastery) confidence = 'high';
  else if (verified.length >= config.minEvidenceForScore * 2 && present.length >= 2) confidence = 'medium';

  const mastered =
    verified.length >= config.minEvidenceForMastery &&
    present.length >= config.minComponentsForMastery &&
    score01 >= config.masteredThreshold &&
    (components[weakest] as number) >= config.masteredThreshold - 0.2;

  let action = ACTIONS[weakest];
  if (mastered) action = 'Keep it fresh with spaced revision.';
  else if ((components[weakest] as number) >= 0.75 && missing.length) action = `No evidence yet for ${missing[0]}. ${ACTIONS[missing[0]]}`;

  return {
    state: 'assessed',
    score: Math.round(score01 * 100),
    confidence,
    evidenceCount: verified.length,
    lastAssessedAt,
    components,
    weakestComponent: weakest,
    mastered,
    recommendedAction: action,
  };
}
