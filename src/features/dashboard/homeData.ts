import { attemptRepo } from '../../database/repositories/attempts';
import { examRepo, ExamRow } from '../../database/repositories/exams';
import { mistakeRepo } from '../../database/repositories/mistakes';
import { syllabusRepo } from '../../database/repositories/syllabus';
import type { SqlDb } from '../../database/sqlite/types';
import { DateKey, diffDays } from '../../utils/dates';
import { computeMastery, MasteryResult } from '../analytics/mastery';
import { generateDailyPlan, DailyPlan, PlanUnit } from '../planner/planner';
import { nextBestAction, NextBestAction, TopicSignal } from './nextBestAction';

export interface ChapterMastery { chapterId: string; title: string; subject: 'math' | 'physics' | 'chemistry'; subjectName: string; hasContent: boolean; mastery: MasteryResult }

export interface HomeData {
  student: { name: string; classLevel: number; programme: string | null };
  exams: (ExamRow & { daysLeft: number })[];
  plan: DailyPlan;
  action: NextBestAction;
  chapters: ChapterMastery[];
  overdueRevisions: number;
  attempts7d: number;
}

export async function loadHomeData(db: SqlDb, today: DateKey, now = Date.now()): Promise<HomeData> {
  const profile = await db.first<{ display_name: string; class_level: number; programme: string | null }>('SELECT display_name, class_level, programme FROM profiles LIMIT 1');
  const exams = (await examRepo.list(db)).map((e) => ({ ...e, daysLeft: diffDays(today, e.examDate) }));
  const chapters = await syllabusRepo.chapters(db);

  const chapterMastery: ChapterMastery[] = [];
  for (const c of chapters) {
    const attempts = await attemptRepo.masteryAttempts(db, c.id);
    chapterMastery.push({
      chapterId: c.id, title: c.title, subject: c.subject, subjectName: c.subjectName,
      hasContent: c.lessonCount + c.questionCount > 0, mastery: computeMastery(attempts, now),
    });
  }

  const overdue = await mistakeRepo.overdueCount(db, today);
  const upcoming = exams.filter((e) => e.daysLeft >= 0 && e.status !== 'completed');
  const nextExam = upcoming[0] ?? null;

  const units: PlanUnit[] = chapterMastery.map((cm) => ({
    id: cm.chapterId, subject: cm.subject, chapterId: cm.chapterId, chapterTitle: cm.title, title: cm.title,
    masteryScore: cm.mastery.score, status: cm.mastery.mastered ? 'mastered' : cm.mastery.state === 'assessed' ? 'practising' : 'not_started',
    hasContent: cm.hasContent,
  }));

  const plan = generateDailyPlan({ today, examDate: nextExam?.examDate ?? today, units, overdueRevisions: overdue });
  const signals: TopicSignal[] = chapterMastery.map((cm) => ({
    id: cm.chapterId, title: cm.title, subjectLabel: cm.subjectName, mastery: cm.mastery, hasContent: cm.hasContent,
    status: cm.mastery.state === 'assessed' ? 'practising' : 'not_started',
  }));
  const attempts7d = await attemptRepo.countSince(db, new Date(now - 7 * 86_400_000).toISOString());

  const action = nextBestAction({
    today, daysToNextExam: nextExam ? nextExam.daysLeft : null, overdueRevisions: overdue, topics: signals,
    mocksCompletedThisCycle: exams.filter((e) => e.status === 'completed' && e.entryMode === 'engine').length,
    minutesAvailableToday: plan.totalMinutes, recentAttempts7d: attempts7d,
  });

  return {
    student: { name: profile?.display_name ?? 'Student', classLevel: profile?.class_level ?? 9, programme: profile?.programme ?? null },
    exams, plan, action, chapters: chapterMastery, overdueRevisions: overdue, attempts7d,
  };
}
