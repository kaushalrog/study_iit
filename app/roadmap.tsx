import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { AppText, Card, Chip, ErrorState, Icon, LoadingState, Page, ProgressBar, SectionHeader, Tag, space, useLayout, useTheme } from '../src/components/design-system';
import { useDb } from '../src/database/DatabaseProvider';
import { loadHomeData } from '../src/features/dashboard/homeData';
import { storedRoadmap } from '../src/services/content/contentSync';
import { nodeStatus, NodeEvidence, NodeStatus, prereqInfo, stageProgress, weeklyGoals } from '../src/features/roadmap/roadmap';
import { ROADMAP, RoadmapNode, STAGES } from '../src/features/roadmap/syllabus';
import { useAsync } from '../src/hooks/useAsync';
import { toDateKey } from '../src/utils/dates';

const STATUS: Record<NodeStatus, { label: string; tone: 'neutral' | 'accent' | 'warning' | 'success' }> = {
  no_material: { label: 'No material yet', tone: 'neutral' }, ready: { label: 'In your library', tone: 'accent' }, building: { label: 'Building', tone: 'warning' }, strong: { label: 'Strong', tone: 'success' },
};
const SUBJECTS = [['math', 'Mathematics'], ['physics', 'Physics'], ['chemistry', 'Chemistry']] as const;

/** Suggested path to JEE, independent of school class. Exploring any stage is always allowed; prerequisites only advise. */
export default function Roadmap() {
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const { isTablet } = useLayout();
  const [stage, setStage] = useState<number | null>(null);
  const { data, error, reload } = useAsync(async () => ({ home: await loadHomeData(db, toDateKey(new Date())), nodes: ((await storedRoadmap(db)) as RoadmapNode[] | null) ?? ROADMAP }), [db]);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;

  const { home, nodes: ALL } = data;
  const byTitle = new Map(home.chapters.map((c) => [c.title, c]));
  const ev: Record<string, NodeEvidence> = {};
  for (const n of ALL) {
    const c = n.chapter ? byTitle.get(n.chapter) : undefined;
    if (c) ev[n.key] = { linked: true, hasMaterial: c.hasContent, score: c.mastery.state === 'assessed' ? c.mastery.score : null };
  }
  const progress = stageProgress(ev, ALL);
  const goals = weeklyGoals(ev, 3, ALL);
  const current = stage ?? (progress.find((p) => p.withMaterial > 0)?.stage ?? 1);
  const info = STAGES[current - 1];
  const p = progress[current - 1];
  const nodes = ALL.filter((n) => n.stage === current);
  const chapterId = (n: RoadmapNode) => (n.chapter ? byTitle.get(n.chapter)?.chapterId : undefined);

  const NodeCard = ({ n }: { n: RoadmapNode }) => {
    const e = ev[n.key];
    const st = STATUS[nodeStatus(e)];
    const pre = prereqInfo(n, ev, ALL);
    const weak = pre.filter((x) => x.state === 'weak');
    const cid = chapterId(n);
    return (
      <Card style={{ marginBottom: space.sm, gap: space.xs }} onPress={cid ? () => router.push({ pathname: '/chapter/[id]', params: { id: cid } }) : undefined}
        accessibilityLabel={`${n.title}. ${st.label}.${e?.score != null ? ` Mastery ${e.score} percent.` : ''}${weak.length ? ` Revise ${weak.map((w) => w.node.title).join(', ')} first.` : ''}`}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.sm, alignItems: 'center' }}>
          <AppText variant="body" style={{ fontWeight: '600', flexShrink: 1 }}>{n.title}</AppText>
          <Tag tone={st.tone} label={st.label} />
        </View>
        <AppText variant="caption">{n.area}</AppText>
        {e?.score != null && <ProgressBar value={e.score / 100} color={colors[n.subject]} label={`${n.title} mastery`} />}
        {weak.length > 0 && <AppText variant="caption" color={colors.warning}>Revise first: {weak.map((w) => w.node.title).join(', ')}</AppText>}
        {pre.length > 0 && weak.length === 0 && <AppText variant="caption">Builds on: {pre.map((x) => x.node.title).join(', ')}</AppText>}
        {n.chapter && cid ? <AppText variant="caption" color={colors.accentStrong}>Open your chapter: {n.chapter}</AppText> : null}
      </Card>
    );
  };

  return (
    <Page>
      <AppText variant="caption" style={{ marginBottom: space.md }}>A suggested order for the JEE syllabus, by stage, not by school class. You can explore any stage; prerequisites only advise. It is ORBIT's plan, not the official syllabus, and no dates are promised.</AppText>

      <SectionHeader title="This week" icon="flag-outline" />
      {goals.length === 0 ? (
        <Card><AppText variant="body">No goals yet. Goals appear for topics that are in your library. Add lessons or questions to a chapter first.</AppText></Card>
      ) : goals.map((g) => (
        <Card key={g.node.key} style={{ marginBottom: space.sm, flexDirection: 'row', gap: space.sm }}>
          <Icon name={g.kind === 'revise' ? 'refresh-outline' : 'book-outline'} size="md" color={colors.accentStrong} />
          <View style={{ flex: 1 }}><AppText variant="body" style={{ fontWeight: '600' }}>{g.kind === 'revise' ? 'Revise' : 'Continue'}: {g.node.title}</AppText><AppText variant="caption">{g.reason}</AppText></View>
        </Card>
      ))}

      <SectionHeader title="Readiness, kept separate" icon="analytics-outline" />
      <Card style={{ gap: space.xs, marginBottom: space.md }}>
        <AppText variant="body">Coaching syllabus: {home.chapters.length} chapters in your library, {home.chapters.filter((c) => c.mastery.state === 'assessed').length} assessed.</AppText>
        <AppText variant="body">IIT foundation (stages 1 to 3): {progress.slice(0, 3).reduce((a, s) => a + s.assessed, 0)} of {progress.slice(0, 3).reduce((a, s) => a + s.total, 0)} topics assessed.</AppText>
        <AppText variant="body" color={colors.textMuted}>JEE Main and Advanced readiness: not assessed. It needs scored full-syllabus mocks.</AppText>
      </Card>

      <SectionHeader title="Stages" icon="map-outline" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.sm }}>
        {STAGES.map((s) => <Chip key={s.n} label={`Stage ${s.n}`} selected={current === s.n} onPress={() => setStage(s.n)} />)}
      </View>
      <Card tone="accent" style={{ marginBottom: space.md, gap: space.xs }}>
        <AppText variant="heading">{info.name}</AppText>
        <AppText variant="body">{info.blurb}</AppText>
        {p.total > 0 ? <AppText variant="caption">{p.total} topics · {p.withMaterial} in your library · {p.assessed} assessed · {p.strong} strong</AppText> : <AppText variant="caption">No fixed topics here. This stage is built from your results in the earlier stages.</AppText>}
      </Card>

      {isTablet ? (
        <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start' }}>
          {SUBJECTS.map(([k, l]) => (
            <View key={k} style={{ flex: 1 }}>
              <AppText variant="label" color={colors[k]} style={{ marginBottom: space.sm }}>{l}</AppText>
              {nodes.filter((n) => n.subject === k).map((n) => <NodeCard key={n.key} n={n} />)}
            </View>
          ))}
        </View>
      ) : SUBJECTS.map(([k, l]) => {
        const list = nodes.filter((n) => n.subject === k);
        return list.length ? (<View key={k}><AppText variant="label" color={colors[k]} style={{ marginVertical: space.sm }}>{l}</AppText>{list.map((n) => <NodeCard key={n.key} n={n} />)}</View>) : null;
      })}
    </Page>
  );
}
