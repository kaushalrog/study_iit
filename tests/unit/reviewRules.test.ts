import { parseCsv, toCsv } from '../../src/features/review/csv';
import { academicStatus, Review } from '../../src/features/review/rules';

const r = (over: Partial<Review>): Review => ({ id: 'a', recordKind: 'lesson', recordId: 'x', decision: 'approved', reviewerName: 'Dr Rao', reviewerRole: 'academic_reviewer', checks: {}, feedback: null, evidence: null, contentHash: 'h1', reviewedAt: '2026-11-05', ...over });
const OK = new Set(['dr rao']);

describe('academic status', () => {
  it('is unreviewed with no reviews', () => expect(academicStatus([], 'h1', OK).status).toBe('unreviewed'));
  it('only an authorised academic reviewer can approve', () => {
    expect(academicStatus([r({})], 'h1', OK).status).toBe('approved');
    expect(academicStatus([r({ reviewerName: 'Someone Else' })], 'h1', OK).status).toBe('unreviewed');
    for (const role of ['student', 'automated', 'ai_assistant'] as const) expect(academicStatus([r({ reviewerRole: role })], 'h1', OK).status).toBe('unreviewed');
    expect(academicStatus([r({})], 'h1', new Set()).status).toBe('unreviewed');   // nobody authorised yet
  });
  it('an approval goes stale when the content changes', () => expect(academicStatus([r({})], 'h2', OK).status).toBe('stale'));
  it('the latest authorised decision wins; others never change the outcome', () => {
    const rs = [r({ id: '1', reviewedAt: '2026-11-01' }), r({ id: '2', decision: 'rejected', reviewedAt: '2026-11-02', feedback: 'Wrong' }), r({ id: '3', reviewerRole: 'student', reviewedAt: '2026-11-03' })];
    expect(academicStatus(rs, 'h1', OK)).toMatchObject({ status: 'rejected', feedback: 'Wrong' });
    expect(academicStatus([...rs, r({ id: '4', decision: 'needs_research', reviewedAt: '2026-11-04' })], 'h1', OK).status).toBe('needs_research');
    expect(academicStatus([...rs, r({ id: '5', decision: 'approved', reviewedAt: '2026-11-05' })], 'h1', OK).status).toBe('approved');
  });
  it('a reviewer comment or edit does not approve', () => {
    expect(academicStatus([r({ decision: 'comment' })], 'h1', OK).status).toBe('unreviewed');
    expect(academicStatus([r({ id: '1' }), r({ id: '2', decision: 'edited', reviewedAt: '2026-11-06' })], 'h1', OK).status).toBe('unreviewed');
  });
});

describe('csv', () => {
  it('round-trips quotes, commas and newlines', () => {
    const rows = [['id', 'text'], ['1', 'a, "b"\nline two'], ['2', '']];
    expect(parseCsv(toCsv(rows))).toEqual([['id', 'text'], ['1', 'a, "b"\nline two'], ['2', '']]);
  });
  it('handles CRLF, BOM and a missing final newline', () => expect(parseCsv('﻿a,b\r\n1,2')).toEqual([['a', 'b'], ['1', '2']]));
});
