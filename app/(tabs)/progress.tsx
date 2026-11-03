import React from 'react';
import { View } from 'react-native';
import { AppText, Card, EmptyState, ErrorState, FadeIn, LoadingState, Page, ProgressBar, SectionHeader, StatTile, Tag, space, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { examRepo } from '../../src/database/repositories/exams';
import { mockRepo } from '../../src/database/repositories/mocks';
import { CATEGORY_LABEL, mistakeRepo } from '../../src/database/repositories/mistakes';
import { TrendChart } from '../../src/components/TrendChart';
import { toPoints } from '../../src/features/progress/trend';
import { loadHomeData } from '../../src/features/dashboard/homeData';
import { useAsync } from '../../src/hooks/useAsync';
import { toDateKey } from '../../src/utils/dates';

interface Baseline { main: { low: number; high: number; outOf: number }; advanced: { low: number; high: number; outOf: number }; note: string }
const COMPONENT_LABEL = { concept: 'concept understanding', practice: 'practice accuracy', independent: 'independent solving', retention: 'revision retention' } as const;

export default function Progress() {
  const db = useDb();
  const { colors } = useTheme();
  const { data, error, reload } = useAsync(async () => {
    const [history, mocks, counts, home, base] = await Promise.all([
      examRepo.history(db), mockRepo.history(db), mistakeRepo.categoryCounts(db), loadHomeData(db, toDateKey(new Date())),
      db.first<{ value: string }>("SELECT value FROM app_meta WHERE key = 'baseline'"),
    ]);
    return { history, mocks, counts, home, baseline: base ? (JSON.parse(base.value) as Baseline) : null };
  }, [db]);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;
  const { history, mocks, counts, home, baseline } = data;

  return (
    <Page>
      {baseline && (
        <FadeIn index={0}>
          <SectionHeader title="Where you started" icon="flag-outline" />
          <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
            <StatTile label="Main-style average" value={`${baseline.main.low}–${baseline.main.high}`} hint={`out of ${baseline.main.outOf}`} tone="accent" />
            <StatTile label="Advanced-style average" value={`${baseline.advanced.low}–${baseline.advanced.high}`} hint={`out of ${baseline.advanced.outOf}`} tone="accent" />
          </View>
          <AppText variant="caption" style={{ marginTop: space.sm }}>A range you reported, not individual tests. It is where you started, not a limit.</AppText>
        </FadeIn>
      )}

      <SectionHeader title="Score trend" icon="analytics-outline" />
      <Card style={{ gap: space.md, marginBottom: space.md }}>
        <AppText variant="body" style={{ fontWeight: '600' }}>Recorded exams</AppText>
        <TrendChart noun="recorded exam" points={toPoints(history.map((h) => ({ label: h.name, at: h.exam_date, total: h.total_score, max: h.max_score })))} />
        <AppText variant="body" style={{ fontWeight: '600' }}>Practice tests</AppText>
        <TrendChart noun="practice test" color={colors.physics} points={toPoints(mocks.map((m) => ({ label: m.name, at: m.finished_at, total: m.total_marks, max: m.max_marks })))} />
      </Card>

      <SectionHeader title="Recorded exams" icon="ribbon-outline" />
      {history.length === 0 ? (
        <EmptyState icon="ribbon-outline" title="No exam results yet" body="After your exam, record the marks in Practice. Your history will build up here." />
      ) : history.map((h) => (
        <Card key={h.id} style={{ marginBottom: space.sm, gap: space.sm }}>
          <AppText variant="heading">{h.name}</AppText>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm }}>
            <AppText variant="stat">{h.total_score}</AppText><AppText variant="body">/ {h.max_score} · {Math.round((h.total_score / h.max_score) * 100)}% of marks</AppText>
          </View>
          <ProgressBar value={h.total_score / h.max_score} label={`${h.name} score`} />
          <View style={{ flexDirection: 'row', gap: space.xs }}>
            <Tag label={h.exam_date} />{h.entry_mode === 'manual' ? <Tag tone="warning" label="Entered by hand: no accuracy data" /> : null}
          </View>
        </Card>
      ))}

      {mocks.length > 0 && (<>
        <SectionHeader title="Practice tests" icon="timer-outline" />
        {mocks.slice(0, 8).map((m) => (
          <Card key={m.id} style={{ marginBottom: space.sm, gap: space.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.sm }}>
              <AppText variant="body" style={{ fontWeight: '600' }}>{m.name}</AppText>
              <AppText variant="caption">{new Date(m.finished_at).toLocaleDateString()}</AppText>
            </View>
            <AppText variant="body">{m.total_marks} / {m.max_marks} marks</AppText>
            <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}>
              <Tag tone="accent" label={`${Math.round(m.percentage)}% of marks`} />
              <Tag tone="success" label={`${Math.round(m.accuracy)}% accuracy`} />
              {m.negative_lost > 0 ? <Tag tone="warning" label={`−${m.negative_lost} negative`} /> : null}
            </View>
          </Card>
        ))}
      </>)}

      <SectionHeader title="Topic mastery" icon="trending-up-outline" />
      {home.chapters.map((c) => (
        <Card key={c.chapterId} tone={c.subject} style={{ marginBottom: space.sm, gap: space.xs }}>
          <AppText variant="heading" color={colors[c.subject]}>{c.title}</AppText>
          {c.mastery.state === 'not_assessed' ? (
            <>
              <AppText variant="body" style={{ fontWeight: '600' }}>Not assessed</AppText>
              <AppText variant="caption">{c.mastery.recommendedAction}</AppText>
            </>
          ) : (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm }}>
                <AppText variant="stat">{c.mastery.score}%</AppText>
                <AppText variant="caption">confidence {c.mastery.confidence} · {c.mastery.evidenceCount} answers</AppText>
              </View>
              <ProgressBar value={(c.mastery.score ?? 0) / 100} color={colors[c.subject]} label={`${c.title} mastery`} />
              {c.mastery.weakestComponent && <AppText variant="caption">Weakest: {COMPONENT_LABEL[c.mastery.weakestComponent]}. {c.mastery.recommendedAction}</AppText>}
              {c.mastery.lastAssessedAt && <AppText variant="caption">Last assessed {new Date(c.mastery.lastAssessedAt).toLocaleDateString()}</AppText>}
            </>
          )}
        </Card>
      ))}

      <SectionHeader title="Mistake types" icon="analytics-outline" />
      {counts.length === 0 ? <AppText variant="caption">No mistakes recorded yet.</AppText> : (
        <Card style={{ gap: space.md }}>
          {counts.map((c) => (
            <View key={c.category} style={{ gap: space.xs }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <AppText variant="body" style={{ flexShrink: 1 }}>{CATEGORY_LABEL[c.category]}</AppText>
                <AppText variant="body" style={{ fontWeight: '700' }}>{c.n}</AppText>
              </View>
              <ProgressBar value={c.n / counts[0].n} color={colors.accentStrong} label={CATEGORY_LABEL[c.category]} />
            </View>
          ))}
        </Card>
      )}
    </Page>
  );
}
