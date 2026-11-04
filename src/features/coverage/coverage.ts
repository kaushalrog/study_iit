export const ITEMS = ['explanation', 'formulas', 'notes', 'videos', 'examples', 'practice', 'pyq'] as const;
export type CoverageItem = (typeof ITEMS)[number];
export const ITEM_LABEL: Record<CoverageItem, string> = {
  explanation: 'Explanation', formulas: 'Formulas', notes: 'Notes', videos: 'Videos', examples: 'Worked examples', practice: 'Practice questions', pyq: 'Previous-year questions',
};

export interface Count { verified: number; unverified: number }
export type ItemCounts = Record<CoverageItem, Count>;
export const emptyCounts = (): ItemCounts => Object.fromEntries(ITEMS.map((i) => [i, { verified: 0, unverified: 0 }])) as ItemCounts;

export type ItemState = 'missing' | 'unverified' | 'verified';
export const itemState = (c: Count): ItemState => (c.verified > 0 ? 'verified' : c.unverified > 0 ? 'unverified' : 'missing');

export type Status = 'complete' | 'partial' | 'unverified' | 'empty';
/**
 * 'complete' only when every item has verified material; 'empty' when nothing exists at all.
 * Unverified content is never counted towards completeness.
 */
export function topicStatus(c: ItemCounts): Status {
  const states = ITEMS.map((i) => itemState(c[i]));
  if (states.every((s) => s === 'verified')) return 'complete';
  if (states.every((s) => s === 'missing')) return 'empty';
  if (states.every((s) => s !== 'verified')) return 'unverified';
  return 'partial';
}

export function addCounts(a: ItemCounts, b: ItemCounts): ItemCounts {
  const out = emptyCounts();
  for (const i of ITEMS) out[i] = { verified: a[i].verified + b[i].verified, unverified: a[i].unverified + b[i].unverified };
  return out;
}

export interface TopicCoverage { topicId: string | null; title: string; counts: ItemCounts; status: Status }
export interface ChapterCoverage { chapterId: string; title: string; subject: string; counts: ItemCounts; status: Status; topics: TopicCoverage[] }

/** Share of the seven items that have verified material, as a whole percent. */
export const itemsCovered = (c: ItemCounts) => Math.round((ITEMS.filter((i) => c[i].verified > 0).length / ITEMS.length) * 100);
