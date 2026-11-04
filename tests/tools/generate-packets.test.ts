/** @jest-environment node */
// Not a test: writes the review packets and the video checklist into review/. Run with GEN_PACKETS=1 npx jest tests/tools
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { loadStarterLibrary } from '../../src/content/starter';
import { migrate } from '../../src/database/migrations';
import { reviewsRepo } from '../../src/database/repositories/reviews';
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
  expect(chapters.length).toBe(4);
});
