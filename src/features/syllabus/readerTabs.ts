import type { LessonSection } from './importBundle';

/** The guided path through one topic. Order is the order a student should work in. */
export const READER_TABS = ['overview', 'understand', 'examples', 'videos', 'practice', 'pyqs', 'notes', 'revise'] as const;
export type ReaderTab = (typeof READER_TABS)[number];
export const TAB_LABEL: Record<ReaderTab, string> = {
  overview: 'Overview', understand: 'Understand', examples: 'Worked examples', videos: 'Videos', practice: 'Practice', pyqs: 'PYQs', notes: 'My notes', revise: 'Revise',
};

/** Which lesson sections belong to which tab. Tabs with no lesson sections (videos, practice, ...) are filled from other tables. */
export const TAB_SECTIONS: Partial<Record<ReaderTab, LessonSection[]>> = {
  overview: ['introduction', 'why_it_matters'],
  understand: ['explanation', 'derivation', 'common_mistakes', 'tips'],
  examples: ['example'],
  revise: ['summary', 'mini_assessment'],
};

export const nextTab = (t: ReaderTab): ReaderTab | null => READER_TABS[READER_TABS.indexOf(t) + 1] ?? null;

export interface TabCounts { lessons: Partial<Record<LessonSection, number>>; formulas: number; videos: number; questions: number; pyqs: number; notes: number }

/** How much material each tab holds, so empty tabs are marked instead of opening onto a blank page. */
export function tabItemCount(t: ReaderTab, c: TabCounts): number {
  const sections = TAB_SECTIONS[t] ?? [];
  const lessonN = sections.reduce((a, s) => a + (c.lessons[s] ?? 0), 0);
  switch (t) {
    case 'understand': return lessonN + c.formulas;
    case 'revise': return lessonN + c.formulas;
    case 'videos': return c.videos;
    case 'practice': return c.questions;
    case 'pyqs': return c.pyqs;
    case 'notes': return c.notes;
    default: return lessonN;
  }
}
