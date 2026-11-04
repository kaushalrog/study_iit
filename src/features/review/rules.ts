export type ReviewKind = 'lesson' | 'formula' | 'question' | 'video';
export type Decision = 'approved' | 'rejected' | 'needs_research' | 'edited' | 'comment';
export type Role = 'academic_reviewer' | 'student' | 'automated' | 'ai_assistant';

export const DECISIONS: Decision[] = ['approved', 'rejected', 'needs_research', 'edited', 'comment'];
export const ROLES: Role[] = ['academic_reviewer', 'student', 'automated', 'ai_assistant'];

/** Check keys a reviewer can fill in. Each is pass, fail or na. */
export const CHECKS = ['correctness', 'syllabus', 'level', 'topic_mapping', 'url_ok', 'metadata_ok', 'topic_coverage', 'suitability', 'teaching_quality'] as const;
export type CheckKey = (typeof CHECKS)[number];
export type CheckValue = 'pass' | 'fail' | 'na';
export type Checks = Partial<Record<CheckKey, CheckValue>>;

/** Which checks matter for which kind of record, so reviewers are not asked about irrelevant things. */
export const CHECKS_FOR: Record<ReviewKind, CheckKey[]> = {
  lesson: ['correctness', 'syllabus', 'level', 'topic_mapping'],
  formula: ['correctness', 'syllabus', 'topic_mapping'],
  question: ['correctness', 'level', 'topic_mapping', 'syllabus'],
  video: ['url_ok', 'metadata_ok', 'topic_coverage', 'suitability', 'teaching_quality', 'level'],
};

export interface Review {
  id: string; recordKind: ReviewKind; recordId: string; decision: Decision; reviewerName: string; reviewerRole: Role;
  checks: Checks; feedback: string | null; evidence: string | null; contentHash: string; reviewedAt: string;
}

export type AcademicStatus = 'approved' | 'rejected' | 'needs_research' | 'stale' | 'unreviewed';

export interface StatusResult { status: AcademicStatus; by: string | null; at: string | null; feedback: string | null }

/**
 * Academic status comes ONLY from decisions by an authorised academic reviewer. Student ticks, watching a video, automated
 * checks and AI-assistant reviews are evidence that is shown, but they never change this status.
 * An approval is tied to the exact content that was reviewed: if the content changes afterwards it becomes 'stale'.
 */
export function academicStatus(reviews: Review[], currentHash: string, authorisedReviewers: ReadonlySet<string>): StatusResult {
  const own = reviews
    .filter((r) => r.reviewerRole === 'academic_reviewer' && authorisedReviewers.has(r.reviewerName.trim().toLowerCase()))
    .sort((a, b) => a.reviewedAt.localeCompare(b.reviewedAt) || a.id.localeCompare(b.id));
  const last = own[own.length - 1];
  if (!last) return { status: 'unreviewed', by: null, at: null, feedback: null };
  const base = { by: last.reviewerName, at: last.reviewedAt, feedback: last.feedback };
  if (last.decision === 'approved') return { status: last.contentHash === currentHash ? 'approved' : 'stale', ...base };
  if (last.decision === 'rejected') return { status: 'rejected', ...base };
  if (last.decision === 'needs_research') return { status: 'needs_research', ...base };
  // 'edited' and 'comment' by a reviewer do not approve anything.
  return { status: 'unreviewed', ...base };
}

export const normName = (s: string) => s.trim().toLowerCase();
export const PROMOTING_ROLE: Role = 'academic_reviewer';
