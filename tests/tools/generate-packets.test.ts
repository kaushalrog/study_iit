/** @jest-environment node */
// Not a test: writes the review packets and the video checklist into review/. Run with GEN_PACKETS=1 npx jest tests/tools
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { loadStarterLibrary } from '../../src/content/starter';
import { migrate } from '../../src/database/migrations';
import { reviewsRepo } from '../../src/database/repositories/reviews';
import { coverageRepo } from '../../src/database/repositories/coverage';
import { starterTotals } from '../../src/content/starter';
import { seedInitialData } from '../../src/database/seed';
import { memoryDb } from '../unit/sqlite-harness';

const run = process.env.GEN_PACKETS === '1' ? it : it.skip;
run('writes review packets and the video checklist', async () => {
  const db = memoryDb(); await migrate(db); await seedInitialData(db); await loadStarterLibrary(db);
  const out = join(__dirname, '../../review'); mkdirSync(join(out, 'packets'), { recursive: true });
  const chapters = await db.all<{ id: string; title: string }>('SELECT id, title FROM chapters ORDER BY title');
  const videoLines: string[] = [
    '# Video watch-and-review checklist', '',
    'Existence, title and channel were confirmed through YouTube\'s oEmbed service on 2026-11-04 (a machine check). **Nobody has watched these videos.** Duration was not available from any source and is left blank.', '',
    'Watch each video (at least the parts relevant to the topic) and fill in the table. Mark `approved` only if it teaches the topic correctly at a suitable level. A relevant title is not enough.', '',
  ];
  for (const c of chapters) {
    const p = await reviewsRepo.buildPacket(db, c.id, '2026-11-05');
    const slug = c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    writeFileSync(join(out, 'packets', `${slug}.md`), p.markdown);
    writeFileSync(join(out, 'packets', `${slug}.csv`), p.csv);
    const vids = await db.all<{ id: string; title: string; channel: string; url: string; purpose: string; level: string; topic: string | null }>(
      'SELECT v.id, v.title, v.channel, v.url, v.purpose, v.level, (SELECT title FROM topics t WHERE t.id = v.topic_id) AS topic FROM video_resources v WHERE v.chapter_id = ? AND v.deleted_at IS NULL ORDER BY v.title', [c.id]);
    videoLines.push(`## ${c.title}`, '', '| Code | Title | Channel | Claimed topic | Purpose | Link works (machine) | Metadata matches (machine) | Covers topic | Suitable level | Teaching quality | Length | Decision |', '|---|---|---|---|---|---|---|---|---|---|---|---|');
    for (const v of vids) videoLines.push(`| V-${v.id.slice(0, 8)} | ${v.title.replace(/\|/g, '/')} | ${v.channel.trim()} | ${v.topic ?? '(whole chapter)'} | ${v.purpose}, ${v.level} | yes | yes | ☐ | ☐ | ☐ | ☐ | ☐ |`);
    videoLines.push('');
  }
  writeFileSync(join(out, 'VIDEO_CHECKLIST.md'), videoLines.join('\n'));
  // ---- quality report, computed from the database ----
  const ev = require('../../content/audit/evidence.json').evidence as { formula: Record<string, { passed: boolean }[]>; question: Record<string, { passed: boolean }[]> };
  const tot = await reviewsRepo.totals(db);
  const row = (k: 'lesson' | 'formula' | 'question' | 'video') => `| ${k === 'lesson' ? 'Lessons' : k === 'formula' ? 'Formulas' : k === 'question' ? 'Generated questions' : 'Videos'} | ${tot[k].total} | ${tot[k].approved} | ${tot[k].student_checked} | ${tot[k].rejected} | ${tot[k].needs_research} | ${tot[k].stale} | ${tot[k].unreviewed} |`;
  const qs = await db.all<{ stem: string }>("SELECT stem FROM questions WHERE deleted_at IS NULL");
  const noAuto = qs.filter((q) => !(q.stem in ev.question));
  const fNo = (await db.all<{ name: string }>('SELECT name FROM formulas WHERE deleted_at IS NULL')).filter((f) => !(f.name in ev.formula));
  const cov = await coverageRepo.load(db);
  const topicRows: string[] = [];
  for (const c of cov) for (const t of c.topics) topicRows.push(`| ${c.title} | ${t.title} | ${t.counts.explanation.unverified + t.counts.explanation.verified} | ${t.counts.examples.unverified + t.counts.examples.verified} | ${t.counts.formulas.unverified + t.counts.formulas.verified} | ${t.counts.practice.unverified + t.counts.practice.verified} | ${t.counts.videos.unverified + t.counts.videos.verified} | ${t.counts.pyq.unverified + t.counts.pyq.verified} |`);
  const autoCount = Object.values(ev.formula).reduce((a, v) => a + v.length, 0) + Object.values(ev.question).reduce((a, v) => a + v.length, 0);
  const autoFail = [...Object.values(ev.formula), ...Object.values(ev.question)].flat().filter((c) => !c.passed).length;
  const st = starterTotals();
  const report = `# Academic quality report

Generated 2026-11-05 from the database after loading the starter library. Counts are read from the data, not typed in. **No item has been academically approved: no authorised reviewer has reviewed anything yet.**

## Records
| Kind | Total | Academically approved | Student-checked | Rejected | Needs research | Stale | Not yet academically reviewed |
|---|---|---|---|---|---|---|---|
${row('lesson')}
${row('formula')}
${row('question')}
${row('video')}
| **All** | **${st.lessons + st.formulas + st.questions + st.videos}** | **0** | **0** | **0** | **0** | **0** | **${st.lessons + st.formulas + st.questions + st.videos}** |

(The brief's "50 worked examples" are 50 of the ${st.lessons} lessons, those of section type worked example. The brief's "45 formulas" is now ${st.formulas}: one chained double-angle formula was split into three correct ones.)

## What was done in this review pass
- **Independent automated checks:** ${autoCount} checks (content/audit/audit.py) on ${Object.keys(ev.formula).length} formulas and ${Object.keys(ev.question).length} questions, using different methods from the authoring scripts (brute-force scans, numerical integration of motion, simulation of rate laws, dimension analysis, random-point identity tests). Failures: ${autoFail}.
- **AI read-through (not an academic review):** all ${qs.length} generated questions were re-read and solved by hand; no error found. Formulas were audited for expression, variables, conditions and units; metadata was incomplete on many and was fixed. Lessons were **not** read line by line: two factual claims were corrected (a wrong comparison for the size of gravitational force, and the strength of gravity at the space station).
- **Corrections shipped:** 2 lessons rewritten, 1 formula split into 3, variable definitions and units completed on the gravitation and kinetics formulas. Devices that loaded the earlier pack receive the corrections when the pack is loaded again; superseded lessons are withdrawn unless someone already confirmed them.

## Question validation status
- Questions with an independent automated check: ${qs.length - noAuto.length} of ${qs.length}. Domain-type questions (three) are now checked by scanning for where the function is defined; the "number of solutions" and "greatest term" questions by brute force; the shell-theorem, maximum-height, period and half-life questions by numerical simulation.
- Questions with **no second, independent computation**: ${noAuto.length}. Their keys were recomputed once while the questions were written (same author, so not independent) and were solved again by hand in the AI read-through. Definition, conceptual and recall items among them rest on that and on a human reviewer:
${noAuto.map((q) => `  - ${q.stem.replace(/\s+/g, ' ').slice(0, 110)}`).join('\n')}
- **Difficulty labels** were not independently validated. **Topic mapping** looked consistent on read-through.
- Formulas without an automated check (reasoned only): ${fNo.length}${fNo.length ? ' – ' + fNo.map((f) => f.name).join('; ') : ''}.

## Video review status
${st.videos} videos. Machine-confirmed: the link exists (YouTube oEmbed, 2026-11-04) and the title and channel are as recorded. **Not done: watching them.** Topic coverage, suitability, teaching quality and level are unreviewed; no durations are stored (no source for them was available). The checklist is review/VIDEO_CHECKLIST.md. A video watched or ticked by the student is not academic verification.

## PYQs
**0** authentic PYQs. The extraction and bundling tool is ready (tools/pyq) and tested on a synthetic file; no official paper has been processed.

## Topic coverage (records present, all unverified)
| Chapter | Topic | Explanation lessons | Worked examples | Formulas | Practice questions | Videos | PYQs |
|---|---|---|---|---|---|---|---|
${topicRows.join('\n')}

Missing content (see docs/CHAPTER_EXPANSION_PLAN.md): graphs and diagrams everywhere, PYQs, Telugu versions, licensed reference questions, and the subtopics listed in the expansion plan. The comparison with the official syllabus is **not done**: the official PDFs could not be retrieved.

## UI testing
Tested on an Android emulator (phone size): Learn, chapter, topic reader tabs (Overview, Understand, Worked examples, Videos, Practice, PYQs, My notes, Revise), Check material, Reviewer tools, Coverage, Roadmap, Search; markdown markers hidden, mathematical notation readable; data persisted after the app was force-stopped. **Not done:** a real phone, a real tablet, diagrams (none exist), and a full dark-mode pass. A tablet-sized emulator showed the phone layout centred with wide margins: there is no tablet-specific layout yet.

## Test results
${process.env.TEST_SUMMARY ?? '(run with TEST_SUMMARY set)'}
`;
  writeFileSync(join(__dirname, '../../docs/ACADEMIC_QUALITY_REPORT.md'), report);
  expect(chapters.length).toBe(4);
});
