export type Kind = 'chapter' | 'topic' | 'lesson' | 'formula' | 'question' | 'pyq' | 'video' | 'note' | 'mistake';

export interface ParsedQuery { terms: string[]; kinds: Kind[] | null }

const INTENT: Record<string, Kind[]> = {
  pyq: ['pyq'], pyqs: ['pyq'], video: ['video'], videos: ['video'], formula: ['formula'], formulas: ['formula'],
  note: ['note'], notes: ['note'], question: ['question', 'pyq'], questions: ['question', 'pyq'], mistake: ['mistake'], mistakes: ['mistake'],
  numericals: ['question', 'pyq'], numerical: ['question', 'pyq'],
};
const STOP = new Set(['on', 'the', 'a', 'an', 'of', 'in', 'for', 'and', 'to', 'explaining', 'about', 'jee', 'main', 'advanced', 'with']);

/**
 * "JEE Advanced PYQs on functions" -> terms ["functions"], kinds ["pyq"]. Words like "videos" or "PYQs" narrow the kind of result
 * and are not searched for in the text. Unknown words are always searched.
 */
export function parseQuery(input: string): ParsedQuery {
  const words = input.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, ' ').split(/\s+/).filter(Boolean);
  const kinds = new Set<Kind>();
  const terms: string[] = [];
  for (const w of words) {
    if (INTENT[w]) INTENT[w].forEach((k) => kinds.add(k));
    else if (!STOP.has(w) && w.length > 1) terms.push(w);
  }
  return { terms, kinds: kinds.size ? Array.from(kinds) : null };
}

/** Cheap singular form so "functions" finds "function" and "coefficients" finds "coefficient". */
export const stem = (t: string) => (t.length > 3 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t);

/** Escape LIKE wildcards in user text. */
export const likeTerm = (t: string) => `%${stem(t).replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
