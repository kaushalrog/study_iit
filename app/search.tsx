import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { AppText, Button, Card, EmptyState, Field, Icon, Page, Tag, space, useTheme } from '../src/components/design-system';
import { useDb } from '../src/database/DatabaseProvider';
import { SearchHit, searchRepo } from '../src/database/repositories/search';
import type { Kind } from '../src/features/search/query';

const KIND: Record<Kind, string> = { chapter: 'Chapter', topic: 'Topic', lesson: 'Lesson', formula: 'Formula', question: 'Question', pyq: 'PYQ', video: 'Video', note: 'Note', mistake: 'Mistake' };
const PAGE = 20;

/** Search everything on this device: chapters, topics, lessons, formulas, videos, notes, questions, PYQs and mistakes. Works offline. */
export default function Search() {
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setLimit(PAGE);
  }, [q]);
  useEffect(() => {
    if (!q.trim()) { setHits(null); return; }
    let live = true;
    const t = setTimeout(() => {
      searchRepo.search(db, q, { limit: limit + 1 }).then((r) => { if (live) { setHits(r); setErr(null); } }).catch((e) => live && setErr(e instanceof Error ? e.message : 'Search failed'));
    }, 200);
    return () => { live = false; clearTimeout(t); };
  }, [db, q, limit]);

  const open = (h: SearchHit) => {
    if (!h.chapterId) return;
    if ((h.kind === 'topic' || h.kind === 'lesson' || h.kind === 'note' || h.kind === 'formula') && h.chapterId) router.push({ pathname: '/lesson/[chapterId]', params: { chapterId: h.chapterId, topicId: h.topicId ?? 'overview' } });
    else if (h.kind === 'mistake') router.push('/mistakes');
    else router.push({ pathname: '/chapter/[id]', params: { id: h.chapterId } });
  };
  const more = hits && hits.length > limit;
  const shown = hits ? hits.slice(0, limit) : [];

  return (
    <Page keyboardShouldPersistTaps="handled">
      <Field label="Search your library" placeholder="e.g. gravitational potential energy, PYQs on functions" value={q} onChangeText={setQ} autoCapitalize="none" autoCorrect={false} returnKeyType="search" />
      <AppText variant="caption" style={{ marginVertical: space.sm }}>Add "videos", "PYQs", "formulas", "notes" or "mistakes" to narrow the results. Answer keys are never searched.</AppText>
      {err ? <AppText variant="body" color={colors.danger} accessibilityRole="alert">{err}</AppText> : null}
      {hits === null ? null : shown.length === 0 ? (
        <EmptyState icon="search-outline" title="Nothing found" body="Nothing in your library matches every word. The library only holds what you have added or imported, so a missing result can mean the material has not been added yet." />
      ) : (
        <View>
          <AppText variant="caption" style={{ marginBottom: space.sm }}>{shown.length}{more ? '+' : ''} result{shown.length === 1 ? '' : 's'}</AppText>
          {shown.map((h) => (
            <Card key={`${h.kind}-${h.id}`} style={{ marginBottom: space.sm, gap: space.xs }} onPress={() => open(h)} accessibilityLabel={`${KIND[h.kind]}: ${h.title}. ${h.chapterTitle ?? ''}`}>
              <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap', alignItems: 'center' }}>
                <Tag tone="accent" label={KIND[h.kind]} />
                {h.subject ? <Tag label={`${h.chapterTitle}${h.topicTitle ? ` · ${h.topicTitle}` : ''}`} /> : null}
                {!h.verified ? <Tag tone="warning" label="Not yet verified" /> : null}
              </View>
              <AppText variant="body" style={{ fontWeight: '600' }}>{h.title}</AppText>
              {h.snippet ? <AppText variant="caption">{h.snippet}</AppText> : null}
            </Card>
          ))}
          {more && <Button title="Show more" icon="chevron-down" variant="secondary" onPress={() => setLimit(limit + PAGE)} />}
        </View>
      )}
      {hits === null && !q.trim() ? <View style={{ alignItems: 'center', marginTop: space.lg }}><Icon name="search-outline" size="lg" color={colors.textMuted} /></View> : null}
    </Page>
  );
}
