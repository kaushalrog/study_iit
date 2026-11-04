import { z } from 'zod';
import { newQuestionSchema } from '../../database/repositories/questions';
import { newVideoSchema } from '../../database/repositories/videos';

export const LESSON_SECTIONS = ['introduction', 'why_it_matters', 'explanation', 'derivation', 'example', 'common_mistakes', 'tips', 'summary', 'mini_assessment'] as const;
export type LessonSection = (typeof LESSON_SECTIONS)[number];
export const SECTION_LABEL: Record<LessonSection, string> = {
  introduction: 'Introduction', why_it_matters: 'Why it matters', explanation: 'Explanation', derivation: 'Derivation', example: 'Worked example',
  common_mistakes: 'Common mistakes', tips: 'Shortcuts and tips', summary: 'Quick revision', mini_assessment: 'Mini assessment',
};

const level = z.enum(['foundation', 'main', 'advanced']).default('main');
const lessonSchema = z.object({
  topic: z.string().trim().optional(),
  section: z.enum(LESSON_SECTIONS),
  level, language: z.enum(['en', 'te']).default('en'),
  body: z.string().trim().min(3, 'Lesson text is empty.'),
  source: z.string().optional(),
});
const formulaSchema = z.object({
  topic: z.string().trim().optional(),
  name: z.string().trim().min(2, 'Give the formula a name.'),
  latex: z.string().trim().min(1, 'The formula is empty.'),
  variables: z.array(z.object({ symbol: z.string().trim().min(1), meaning: z.string().trim().min(1), unit: z.string().trim().optional() })).default([]),
  units: z.string().optional(), conditions: z.string().optional(), explanation: z.string().optional(), example: z.string().optional(), source: z.string().optional(),
});
const questionSchema = z.object({
  topic: z.string().trim().optional(),
  type: z.enum(['single', 'multi', 'integer', 'matching', 'assertion_reason']).default('single'),
  stem: z.string(), options: z.array(z.string()).default([]),
  correct: z.array(z.string()).default([]), numeric: z.number().nullable().optional(), tolerance: z.number().optional(),
  difficulty: z.enum(['foundation', 'main', 'advanced']).default('main'),
  explanation: z.string().optional(), hint: z.string().optional(), source: z.string().optional(),
  origin: z.enum(['official', 'coaching', 'generated', 'student']).optional(),
  // Provenance. A question is a previous-year question only with all of exam, year and citation.
  examCategory: z.enum(['jee_main', 'jee_advanced', 'other_official']).nullable().optional(), examYear: z.number().int().nullable().optional(),
  session: z.string().optional(), citation: z.string().optional(), citationUrl: z.string().optional(), license: z.enum(['open', 'permission', 'personal_use', 'unknown']).optional(),
});
const videoSchema = z.object({
  topic: z.string().trim().optional(),
  url: z.string(), title: z.string(), channel: z.string(),
  purpose: z.enum(['concept', 'classroom', 'examples', 'main', 'advanced', 'revision']),
  level, language: z.enum(['en', 'te', 'hi']).default('en'),
  why: z.string().optional(), source: z.string().optional(), durationSeconds: z.number().int().positive().nullable().optional(),
});
const topicSchema = z.union([z.string().trim().min(1), z.object({ title: z.string().trim().min(1) })]);

const bundleSchema = z.object({
  chapter: z.string({ error: 'Name the chapter this belongs to, e.g. "chapter": "Gravitation".' }).trim().min(1, 'Name the chapter this belongs to.'),
  topics: z.array(topicSchema).default([]),
  lessons: z.array(z.unknown()).default([]),
  formulas: z.array(z.unknown()).default([]),
  questions: z.array(z.unknown()).default([]),
  videos: z.array(z.unknown()).default([]),
});

export interface ImportIssue { where: string; message: string }
export interface ParsedBundle {
  chapter: string;
  topics: string[];
  lessons: z.infer<typeof lessonSchema>[];
  formulas: z.infer<typeof formulaSchema>[];
  questions: z.infer<typeof questionSchema>[];
  videos: z.infer<typeof videoSchema>[];
}
export interface ParseResult {
  bundles: ParsedBundle[];
  issues: ImportIssue[];
  /** True when the text could not be read as JSON at all. */
  unreadable: boolean;
}

const firstIssue = (e: z.ZodError) => e.issues[0]?.message ?? 'Invalid';

/** Parse a pasted JSON import. Bad items are reported individually and skipped; good items still import. */
export function parseImport(text: string): ParseResult {
  let raw: unknown;
  try { raw = JSON.parse(text.trim().replace(/^```(?:json)?|```$/g, '').trim()); }
  catch { return { bundles: [], issues: [{ where: 'file', message: 'This is not valid JSON. Check for a missing comma, quote or bracket.' }], unreadable: true }; }

  const list: unknown[] = Array.isArray(raw) ? raw : raw && typeof raw === 'object' && Array.isArray((raw as { bundles?: unknown }).bundles) ? (raw as { bundles: unknown[] }).bundles : [raw];
  const bundles: ParsedBundle[] = [];
  const issues: ImportIssue[] = [];

  list.forEach((entry, bi) => {
    const tag = list.length > 1 ? `Bundle ${bi + 1}` : 'File';
    const b = bundleSchema.safeParse(entry);
    if (!b.success) { issues.push({ where: tag, message: firstIssue(b.error) }); return; }
    const out: ParsedBundle = { chapter: b.data.chapter, topics: b.data.topics.map((t) => (typeof t === 'string' ? t : t.title)), lessons: [], formulas: [], questions: [], videos: [] };
    b.data.lessons.forEach((l, i) => { const r = lessonSchema.safeParse(l); r.success ? out.lessons.push(r.data) : issues.push({ where: `${tag} · lesson ${i + 1}`, message: firstIssue(r.error) }); });
    b.data.formulas.forEach((f, i) => { const r = formulaSchema.safeParse(f); r.success ? out.formulas.push(r.data) : issues.push({ where: `${tag} · formula ${i + 1}`, message: firstIssue(r.error) }); });
    b.data.videos.forEach((v, i) => {
      const r = videoSchema.safeParse(v);
      if (!r.success) { issues.push({ where: `${tag} · video ${i + 1}`, message: firstIssue(r.error) }); return; }
      const full = newVideoSchema.safeParse({ chapterId: 'x', ...r.data, topicId: null, sourceNote: r.data.source ?? '', durationSeconds: r.data.durationSeconds ?? null, verified: false });
      full.success ? out.videos.push(r.data) : issues.push({ where: `${tag} · video ${i + 1}`, message: firstIssue(full.error) });
    });
    b.data.questions.forEach((q, i) => {
      const r = questionSchema.safeParse(q);
      if (!r.success) { issues.push({ where: `${tag} · question ${i + 1}`, message: firstIssue(r.error) }); return; }
      // Full answer-key validation (option letters, single vs multi, integer present) uses the same rules as the add-question form.
      const full = newQuestionSchema.safeParse({ chapterId: 'x', ...r.data, numeric: r.data.numeric ?? null, sourceNote: r.data.source ?? '', examCategory: r.data.examCategory ?? null, examYear: r.data.examYear ?? null, examSession: r.data.session ?? '', citation: r.data.citation ?? '', citationUrl: r.data.citationUrl ?? '', license: r.data.license ?? 'unknown', verified: false });
      full.success ? out.questions.push(r.data) : issues.push({ where: `${tag} · question ${i + 1}`, message: firstIssue(full.error) });
    });
    bundles.push(out);
  });
  return { bundles, issues, unreadable: false };
}

/** Text a student can hand to any AI or teacher to convert her notes into this format. */
export const IMPORT_EXAMPLE = `{
  "chapter": "Gravitation",
  "topics": ["Newton's law of gravitation", "Acceleration due to gravity"],
  "lessons": [
    { "topic": "Newton's law of gravitation", "section": "explanation", "level": "foundation", "language": "en",
      "body": "Every mass attracts every other mass. The force gets weaker as the masses move apart." }
  ],
  "formulas": [
    { "topic": "Newton's law of gravitation", "name": "Law of gravitation",
      "latex": "F = G \\\\frac{m_1 m_2}{r^2}",
      "variables": [ { "symbol": "G", "meaning": "gravitational constant", "unit": "N m²/kg²" },
                     { "symbol": "r", "meaning": "distance between the centres", "unit": "m" } ],
      "conditions": "Point masses or spheres" }
  ],
  "questions": [
    { "topic": "Acceleration due to gravity", "type": "single", "difficulty": "foundation",
      "stem": "Which quantity does g depend on?",
      "options": ["Mass of the falling body", "Mass and radius of the planet", "Colour of the body"],
      "correct": ["B"], "explanation": "g = GM/R²", "source": "Book name, page" },
    { "type": "integer", "difficulty": "main", "stem": "If r doubles, F becomes 1/x times. What is x?", "numeric": 4 }
  ]
}`;
