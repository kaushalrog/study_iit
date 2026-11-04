import { nextTab, READER_TABS, tabItemCount, TAB_SECTIONS } from '../../src/features/syllabus/readerTabs';
import { LESSON_SECTIONS } from '../../src/features/syllabus/importBundle';

describe('reader tabs', () => {
  it('every lesson section appears in exactly one tab, so no imported text is hidden', () => {
    const all = Object.values(TAB_SECTIONS).flat();
    expect(new Set(all).size).toBe(all.length);
    expect([...all].sort()).toEqual([...LESSON_SECTIONS].sort());
  });
  it('the guided path visits every tab once, then ends', () => {
    let t: (typeof READER_TABS)[number] | null = READER_TABS[0]; const seen: string[] = [];
    while (t) { seen.push(t); t = nextTab(t); }
    expect(seen).toEqual([...READER_TABS]);
  });
  it('counts reflect the real material', () => {
    const c = { lessons: { introduction: 1, explanation: 2, example: 3 }, formulas: 2, videos: 1, questions: 0, pyqs: 0, notes: 4 };
    expect(tabItemCount('overview', c)).toBe(1);
    expect(tabItemCount('understand', c)).toBe(4);
    expect(tabItemCount('examples', c)).toBe(3);
    expect(tabItemCount('videos', c)).toBe(1);
    expect(tabItemCount('practice', c)).toBe(0);
    expect(tabItemCount('pyqs', c)).toBe(0);
    expect(tabItemCount('notes', c)).toBe(4);
    expect(tabItemCount('revise', c)).toBe(2);
  });
});
