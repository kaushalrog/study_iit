import { ExamConfig, SubjectKey } from './types';

/**
 * Advanced-style template transcribed from the supplied Sri Chaitanya sample paper
 * "JEE-ADVANCE-2024-P1-Model" (WTA-00): 4 sections per subject, 60 marks per subject, 180 total.
 * It is stored as EDITABLE configuration and flagged unverified: the student must confirm it
 * against the actual coaching paper before relying on it.
 */
export const ADVANCED_SAMPLE_SOURCE =
  'Sample paper "00-00-2025_C IPL _Jee-Adv (2024-P1)_WTA-00_Q.P.pdf" (instructions pages). Not confirmed for the 11 Nov 2026 exam.';

const SUBJECTS: { key: SubjectKey; name: string }[] = [
  { key: 'math', name: 'Mathematics' },
  { key: 'physics', name: 'Physics' },
  { key: 'chemistry', name: 'Chemistry' },
];

export function advancedSampleConfig(): ExamConfig {
  return {
    name: 'Advanced-style (from sample paper, unverified)',
    style: 'advanced',
    durationMinutes: 180,
    negativeMarkingEnabled: true,
    sections: SUBJECTS.flatMap(({ key, name }) => [
      { id: `${key}-1`, name: `${name} I: single correct`, subject: key, questionType: 'single' as const, questionCount: 4, attemptLimit: null,
        rule: { correct: 3, incorrect: -1, unanswered: 0, partialPerCorrectOption: null } },
      { id: `${key}-2`, name: `${name} II: one or more correct`, subject: key, questionType: 'multi' as const, questionCount: 3, attemptLimit: null,
        rule: { correct: 4, incorrect: -2, unanswered: 0, partialPerCorrectOption: 1 } },
      { id: `${key}-3`, name: `${name} III: integer`, subject: key, questionType: 'integer' as const, questionCount: 6, attemptLimit: null,
        rule: { correct: 4, incorrect: 0, unanswered: 0, partialPerCorrectOption: null } },
      { id: `${key}-4`, name: `${name} IV: matching list`, subject: key, questionType: 'matching' as const, questionCount: 4, attemptLimit: null,
        rule: { correct: 3, incorrect: -1, unanswered: 0, partialPerCorrectOption: null } },
    ]),
  };
}

/**
 * Main-style: the pattern has NOT been supplied, so no sections are invented.
 * Negative marking is on; the student configures sections in Settings > Exams.
 */
export function mainSetupConfig(): ExamConfig {
  return { name: 'Main-style (needs setup)', style: 'main', durationMinutes: null, negativeMarkingEnabled: true, sections: [] };
}
