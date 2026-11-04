import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { AppText, Card, ErrorState, LoadingState, Page, SectionHeader, Tag, space, useTheme } from '../src/components/design-system';
import { useDb } from '../src/database/DatabaseProvider';
import { coverageRepo } from '../src/database/repositories/coverage';
import { ITEMS, ITEM_LABEL, itemState, itemsCovered, Status } from '../src/features/coverage/coverage';
import { useAsync } from '../src/hooks/useAsync';

const STATUS: Record<Status, { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  complete: { label: 'Complete', tone: 'success' }, partial: { label: 'Partly covered', tone: 'warning' }, unverified: { label: 'Only unverified material', tone: 'warning' }, empty: { label: 'Nothing yet', tone: 'danger' },
};

/** What the library really contains. Unverified material is shown but never counted as covered. */
export default function Coverage() {
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const { data, error, reload } = useAsync(() => coverageRepo.load(db), [db]);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;
  const mark = (s: ReturnType<typeof itemState>) => (s === 'verified' ? '●' : s === 'unverified' ? '◐' : '○');
  const word = (s: ReturnType<typeof itemState>) => (s === 'verified' ? 'verified' : s === 'unverified' ? 'unverified only' : 'missing');

  return (
    <Page>
      <AppText variant="display">Content coverage</AppText>
      <AppText variant="caption" style={{ marginBottom: space.md }}>● verified   ◐ exists but unverified   ○ missing. A chapter is complete only when every row has verified material.</AppText>
      {data.map((c) => (
        <View key={c.chapterId}>
          <SectionHeader title={c.title} />
          <Card tone={c.subject as 'math' | 'physics' | 'chemistry'} style={{ marginBottom: space.sm, gap: space.xs }}
            onPress={() => router.push({ pathname: '/chapter/[id]', params: { id: c.chapterId } })} accessibilityLabel={`${c.title} coverage. Open chapter`}>
            <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center', flexWrap: 'wrap' }}>
              <Tag tone={STATUS[c.status].tone} label={STATUS[c.status].label} />
              <AppText variant="caption">{itemsCovered(c.counts)}% of the seven kinds of material have verified content</AppText>
            </View>
            {ITEMS.map((i) => {
              const n = c.counts[i];
              const s = itemState(n);
              return (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.sm }} accessible accessibilityLabel={`${ITEM_LABEL[i]}: ${n.verified} verified, ${n.unverified} unverified, ${word(s)}`}>
                  <AppText variant="body" color={s === 'missing' ? colors.textMuted : colors.text}>{mark(s)}  {ITEM_LABEL[i]}</AppText>
                  <AppText variant="caption">{n.verified} verified · {n.unverified} unverified</AppText>
                </View>
              );
            })}
            {c.topics.length === 0 ? <AppText variant="caption">No topics yet, so nothing can be tracked per topic.</AppText> : (
              <AppText variant="caption" style={{ marginTop: space.xs }}>{c.topics.filter((t) => t.status === 'complete').length} of {c.topics.length} topics complete.</AppText>
            )}
          </Card>
        </View>
      ))}
    </Page>
  );
}
