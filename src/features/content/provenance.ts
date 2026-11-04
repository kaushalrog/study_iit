export type Origin = 'official' | 'coaching' | 'generated' | 'student';
export type Provenance = 'pyq' | 'official_unsourced' | 'coaching' | 'student' | 'generated';

export interface ProvenanceInput { origin: Origin; examCategory?: string | null; examYear?: number | null; citation?: string | null }

/** Papers from the 1990s are plausible; anything far in the future is a typo. */
export const validYear = (y: number | null | undefined, now = new Date().getFullYear()) => y != null && Number.isInteger(y) && y >= 1990 && y <= now + 1;

/**
 * "PYQ" is earned, not chosen: an official origin AND an exam category AND a plausible year AND a written citation.
 * Generated questions can never be PYQs. Official claims without a trace are shown as such.
 */
export function classifyProvenance(q: ProvenanceInput): Provenance {
  if (q.origin === 'generated') return 'generated';
  if (q.origin === 'official') return q.examCategory && validYear(q.examYear) && !!q.citation?.trim() ? 'pyq' : 'official_unsourced';
  return q.origin;
}

export const PROVENANCE_LABEL: Record<Provenance, string> = {
  pyq: 'Previous-year question', official_unsourced: 'Official (source missing)', coaching: 'Coaching material', student: 'Own question', generated: 'AI-generated',
};
export const EXAM_LABEL: Record<string, string> = { jee_main: 'JEE Main', jee_advanced: 'JEE Advanced', other_official: 'Other official exam' };

/** Problems that stop an "official" question being saved. Empty array = fine. */
export function provenanceIssues(q: ProvenanceInput): string[] {
  if (q.origin !== 'official') return [];
  const out: string[] = [];
  if (!q.examCategory) out.push('Choose the exam this came from.');
  if (!validYear(q.examYear)) out.push('Enter the exam year (for example 2023).');
  if (!q.citation?.trim()) out.push('Write where you found it (paper name, shift, question number), so it can be traced.');
  return out;
}
