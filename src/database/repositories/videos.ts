import { z } from 'zod';
import { parseYoutube } from '../../features/content/youtube';
import { seedId } from '../../utils/ids';
import type { SqlDb } from '../sqlite/types';
import { updateRow, upsertRow } from './base';

export const PURPOSES = ['concept', 'classroom', 'examples', 'main', 'advanced', 'revision'] as const;
export type Purpose = (typeof PURPOSES)[number];
export const PURPOSE_LABEL: Record<Purpose, string> = {
  concept: 'Concept from basics', classroom: 'Full classroom lesson', examples: 'Worked examples', main: 'JEE Main practice', advanced: 'JEE Advanced depth', revision: 'Quick revision',
};

export const newVideoSchema = z.object({
  chapterId: z.string().min(1, 'Choose a chapter.'),
  topicId: z.string().nullable().default(null),
  url: z.string().trim().min(1, 'Paste the link to the video or playlist.'),
  title: z.string().trim().min(3, 'Give the lesson a title.'),
  channel: z.string().trim().min(2, 'Name the teacher or channel.'),
  purpose: z.enum(PURPOSES),
  level: z.enum(['foundation', 'main', 'advanced']).default('main'),
  language: z.enum(['en', 'te', 'hi']).default('en'),
  why: z.string().default(''),
  /** Only when someone confirmed it: minutes and seconds are not guessed. */
  durationSeconds: z.number().int().positive().nullable().default(null),
  sourceNote: z.string().default(''),
  /** "I opened it and it teaches this topic." Records the date; never set by imports or AI. */
  verified: z.boolean().default(false),
}).superRefine((v, ctx) => {
  if (!parseYoutube(v.url)) ctx.addIssue({ code: 'custom', path: ['url'], message: 'This is not a link to a specific YouTube video or playlist. Search pages and channel pages are not accepted.' });
});
export type NewVideo = z.input<typeof newVideoSchema>;

export interface VideoRow {
  id: string; chapterId: string; topicId: string | null; kind: 'video' | 'playlist'; youtubeId: string; url: string; title: string; channel: string;
  purpose: Purpose; level: string; language: string; durationSeconds: number | null; why: string | null;
  verification: string; linkCheckedAt: string | null; watchedAt: string | null; saved: boolean; note: string | null;
}
type Raw = { id: string; chapter_id: string; topic_id: string | null; kind: 'video' | 'playlist'; youtube_id: string; url: string; title: string; channel: string; purpose: Purpose; level: string; language: string; duration_seconds: number | null; why: string | null; verification_status: string; link_checked_at: string | null; watched_at: string | null; saved: number; personal_note: string | null };
const map = (r: Raw): VideoRow => ({ id: r.id, chapterId: r.chapter_id, topicId: r.topic_id, kind: r.kind, youtubeId: r.youtube_id, url: r.url, title: r.title, channel: r.channel, purpose: r.purpose, level: r.level, language: r.language, durationSeconds: r.duration_seconds, why: r.why, verification: r.verification_status, linkCheckedAt: r.link_checked_at, watchedAt: r.watched_at, saved: !!r.saved, note: r.personal_note });

export const videoRepo = {
  /** One row per (lesson, place it is recommended): adding the same link to the same topic again updates it instead of duplicating. */
  async add(db: SqlDb, input: NewVideo): Promise<string> {
    const v = newVideoSchema.parse(input);
    const ref = parseYoutube(v.url)!;
    const id = seedId(`video:${ref.kind}:${ref.id}:${v.topicId ?? v.chapterId}`);
    const now = new Date().toISOString();
    await upsertRow(db, 'video_resources', {
      id, chapter_id: v.chapterId, topic_id: v.topicId, kind: ref.kind, youtube_id: ref.id, url: ref.url, title: v.title, channel: v.channel,
      purpose: v.purpose, level: v.level, language: v.language, duration_seconds: v.durationSeconds, why: v.why || null,
      verification_status: v.verified ? 'verified' : 'needs_review', link_checked_at: v.verified ? now : null, source_note: v.sourceNote || null,
    });
    return id;
  },

  async forChapter(db: SqlDb, chapterId: string): Promise<VideoRow[]> {
    return (await db.all<Raw>("SELECT * FROM video_resources WHERE chapter_id = ? AND deleted_at IS NULL AND verification_status != 'archived' ORDER BY topic_id IS NULL DESC, topic_id, purpose, title", [chapterId])).map(map);
  },
  async saved(db: SqlDb): Promise<VideoRow[]> {
    return (await db.all<Raw>('SELECT * FROM video_resources WHERE saved = 1 AND deleted_at IS NULL ORDER BY title')).map(map);
  },

  /** Watching a lesson is recorded on its own. It never changes mastery. */
  markWatched: (db: SqlDb, id: string, watched: boolean) => updateRow(db, 'video_resources', id, { watched_at: watched ? new Date().toISOString() : null }),
  setSaved: (db: SqlDb, id: string, saved: boolean) => updateRow(db, 'video_resources', id, { saved: saved ? 1 : 0 }),
  setNote: (db: SqlDb, id: string, note: string) => updateRow(db, 'video_resources', id, { personal_note: note.trim() || null }),
  /** The student's statement that she opened the link and it teaches this topic; stamps the check date. */
  setVerified: (db: SqlDb, id: string, verified: boolean) =>
    updateRow(db, 'video_resources', id, { verification_status: verified ? 'verified' : 'needs_review', link_checked_at: verified ? new Date().toISOString() : null }),
  remove: (db: SqlDb, id: string) => updateRow(db, 'video_resources', id, { deleted_at: new Date().toISOString() }),
};
