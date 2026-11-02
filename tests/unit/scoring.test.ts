import { advancedSampleConfig } from '../../src/features/exam-engine/templates';
import { examMaxMarks, scoreExam, scoreQuestion, topicWeaknesses, validatePaper } from '../../src/features/exam-engine/scoring';
import { examConfigSchema, ExamConfig, ExamQuestion, ScoringRule } from '../../src/features/exam-engine/types';

const single: ScoringRule = { correct: 3, incorrect: -1, unanswered: 0, partialPerCorrectOption: null };
const multi: ScoringRule = { correct: 4, incorrect: -2, unanswered: 0, partialPerCorrectOption: 1 };
const integer: ScoringRule = { correct: 4, incorrect: 0, unanswered: 0, partialPerCorrectOption: null };

describe('scoreQuestion', () => {
  it('awards full marks for the correct single option', () => {
    expect(scoreQuestion('single', single, { correct: ['B'] }, { selected: ['B'] })).toEqual({ outcome: 'correct', marks: 3 });
  });
  it('applies negative marking for a wrong single option', () => {
    expect(scoreQuestion('single', single, { correct: ['B'] }, { selected: ['C'] })).toEqual({ outcome: 'incorrect', marks: -1 });
  });
  it('gives zero for unanswered, including an empty selection', () => {
    expect(scoreQuestion('single', single, { correct: ['B'] }, undefined).marks).toBe(0);
    expect(scoreQuestion('single', single, { correct: ['B'] }, { selected: [] }).outcome).toBe('unanswered');
  });
  it('is case and whitespace insensitive for option keys', () => {
    expect(scoreQuestion('single', single, { correct: ['B'] }, { selected: [' b '] }).outcome).toBe('correct');
  });
  it('treats picking two options in a single-correct question as incorrect', () => {
    expect(scoreQuestion('single', single, { correct: ['B'] }, { selected: ['B', 'C'] }).outcome).toBe('incorrect');
  });

  describe('multi-correct with partial marking (sample-paper scheme)', () => {
    it('full marks when all correct options chosen', () => {
      expect(scoreQuestion('multi', multi, { correct: ['A', 'B', 'D'] }, { selected: ['D', 'A', 'B'] })).toEqual({ outcome: 'correct', marks: 4 });
    });
    it('+3 when all four options are correct and three are chosen', () => {
      expect(scoreQuestion('multi', multi, { correct: ['A', 'B', 'C', 'D'] }, { selected: ['A', 'B', 'C'] })).toEqual({ outcome: 'partial', marks: 3 });
    });
    it('+2 when three are correct and two correct ones are chosen (paper example A,B)', () => {
      expect(scoreQuestion('multi', multi, { correct: ['A', 'B', 'D'] }, { selected: ['A', 'B'] }).marks).toBe(2);
    });
    it('+1 for a single correct option out of several (paper example A)', () => {
      expect(scoreQuestion('multi', multi, { correct: ['A', 'B', 'D'] }, { selected: ['A'] }).marks).toBe(1);
    });
    it('-2 if any wrong option is chosen, even with correct ones', () => {
      expect(scoreQuestion('multi', multi, { correct: ['A', 'B', 'D'] }, { selected: ['A', 'B', 'C'] })).toEqual({ outcome: 'incorrect', marks: -2 });
    });
    it('without partial marking an incomplete answer is incorrect', () => {
      const r = { ...multi, partialPerCorrectOption: null };
      expect(scoreQuestion('multi', r, { correct: ['A', 'B'] }, { selected: ['A'] }).outcome).toBe('incorrect');
    });
  });

  describe('integer', () => {
    it('matches exactly by default', () => {
      expect(scoreQuestion('integer', integer, { numeric: 7 }, { numeric: 7 }).marks).toBe(4);
      expect(scoreQuestion('integer', integer, { numeric: 7 }, { numeric: 8 })).toEqual({ outcome: 'incorrect', marks: 0 });
    });
    it('treats 0 as an answer, not as blank', () => {
      expect(scoreQuestion('integer', integer, { numeric: 0 }, { numeric: 0 }).outcome).toBe('correct');
    });
    it('treats null / NaN as unanswered', () => {
      expect(scoreQuestion('integer', integer, { numeric: 0 }, { numeric: null }).outcome).toBe('unanswered');
      expect(scoreQuestion('integer', integer, { numeric: 0 }, { numeric: NaN }).outcome).toBe('unanswered');
    });
    it('honours tolerance', () => {
      expect(scoreQuestion('integer', integer, { numeric: 2.5, tolerance: 0.05 }, { numeric: 2.52 }).outcome).toBe('correct');
    });
  });
});

describe('advanced sample template', () => {
  const config = advancedSampleConfig();
  it('validates against the schema', () => {
    expect(() => examConfigSchema.parse(config)).not.toThrow();
  });
  it('totals 180 marks and 60 per subject, matching the sample paper header', () => {
    expect(examMaxMarks(config)).toBe(180);
    const perSubject = ['math', 'physics', 'chemistry'].map((s) =>
      config.sections.filter((x) => x.subject === s).reduce((a, x) => a + x.questionCount * x.rule.correct, 0));
    expect(perSubject).toEqual([60, 60, 60]);
  });
});

describe('scoreExam', () => {
  const config: ExamConfig = {
    name: 't', style: 'main', durationMinutes: 60, negativeMarkingEnabled: true,
    sections: [
      { id: 'p1', name: 'Phy single', subject: 'physics', questionType: 'single', questionCount: 4, attemptLimit: null, rule: { correct: 4, incorrect: -1, unanswered: 0, partialPerCorrectOption: null } },
      { id: 'm1', name: 'Math integer', subject: 'math', questionType: 'integer', questionCount: 2, attemptLimit: null, rule: { correct: 4, incorrect: 0, unanswered: 0, partialPerCorrectOption: null } },
    ],
  };
  const qs: ExamQuestion[] = [
    { id: 'p-a', sectionId: 'p1', topicId: 'grav', key: { correct: ['A'] } },
    { id: 'p-b', sectionId: 'p1', topicId: 'grav', key: { correct: ['B'] } },
    { id: 'p-c', sectionId: 'p1', topicId: 'grav', key: { correct: ['C'] } },
    { id: 'p-d', sectionId: 'p1', topicId: 'grav', key: { correct: ['D'] } },
    { id: 'm-a', sectionId: 'm1', topicId: 'bin', key: { numeric: 5 } },
    { id: 'm-b', sectionId: 'm1', topicId: 'bin', key: { numeric: 9 } },
  ];

  const result = scoreExam({
    config, questions: qs,
    responses: { 'p-a': { selected: ['A'] }, 'p-b': { selected: ['C'] }, 'p-c': { selected: ['C'] }, 'm-a': { numeric: 5 } },
    timeMs: { 'p-a': 60_000, 'p-b': 30_000, 'p-c': 90_000, 'm-a': 120_000 },
  });

  it('computes total, max and percentage', () => {
    expect(result.totalMarks).toBe(4 - 1 + 4 + 4); // 11
    expect(result.maxMarks).toBe(24);
    expect(result.percentage).toBeCloseTo(45.83, 2);
  });
  it('keeps accuracy distinct from percentage of marks', () => {
    // 3 correct of 4 attempted = 75% accuracy, but only 45.83% of the marks.
    expect(result.correct).toBe(3);
    expect(result.incorrect).toBe(1);
    expect(result.unanswered).toBe(2);
    expect(result.accuracy).toBe(75);
    expect(result.attemptRate).toBeCloseTo(66.67, 2);
    expect(result.accuracy).not.toBe(result.percentage);
  });
  it('tracks negative marks lost and time', () => {
    expect(result.negativeLost).toBe(1);
    expect(result.totalTimeMs).toBe(300_000);
    expect(result.avgTimePerAttemptedMs).toBe(75_000);
  });
  it('summarises by subject', () => {
    const phy = result.subjects.find((s) => s.subject === 'physics')!;
    expect(phy).toMatchObject({ marks: 7, maxMarks: 16, correct: 2, incorrect: 1, unanswered: 1, negativeLost: 1 });
    const math = result.subjects.find((s) => s.subject === 'math')!;
    expect(math).toMatchObject({ marks: 4, maxMarks: 8, correct: 1, unanswered: 1 });
  });
  it('ranks weakest topics first', () => {
    const w = topicWeaknesses(result);
    expect(w[0].topicId).toBe('grav'); // 7/16 < 4/8
  });
  it('ignores negative marking when disabled', () => {
    const r = scoreExam({ config: { ...config, negativeMarkingEnabled: false }, questions: qs, responses: { 'p-b': { selected: ['C'] } } });
    expect(r.totalMarks).toBe(0);
    expect(r.negativeLost).toBe(0);
    expect(r.incorrect).toBe(1);
  });
  it('rejects questions that point at unknown sections', () => {
    expect(() => scoreExam({ config, questions: [{ id: 'x', sectionId: 'nope', key: {} }], responses: {} })).toThrow();
  });
  it('reports paper/config mismatches', () => {
    expect(validatePaper(config, qs.slice(0, 5))).toHaveLength(1);
    expect(validatePaper(config, qs)).toEqual([]);
  });
  it('handles an empty paper without dividing by zero', () => {
    const r = scoreExam({ config, questions: [], responses: {} });
    expect(r.accuracy).toBe(0);
    expect(r.percentage).toBe(0);
  });
});

describe('optional-question rule', () => {
  const config: ExamConfig = {
    name: 't', style: 'main', durationMinutes: null, negativeMarkingEnabled: true,
    sections: [{ id: 's', name: 'Numerical B', subject: 'chemistry', questionType: 'integer', questionCount: 4, attemptLimit: 2, rule: { correct: 4, incorrect: -1, unanswered: 0, partialPerCorrectOption: null } }],
  };
  const qs: ExamQuestion[] = [1, 2, 3, 4].map((n) => ({ id: `q${n}`, sectionId: 's', key: { numeric: n } }));
  it('only evaluates the first N attempted and caps max marks', () => {
    const r = scoreExam({ config, questions: qs, responses: { q1: { numeric: 1 }, q2: { numeric: 9 }, q3: { numeric: 3 }, q4: { numeric: 4 } } });
    expect(r.maxMarks).toBe(8);
    expect(r.totalMarks).toBe(4 - 1);
    expect(r.unanswered).toBe(2);
  });
});
