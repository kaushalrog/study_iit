import React from 'react';
import { Linking, View } from 'react-native';
import { AppText, Button, Card, Chip, Tag, space } from '../design-system';
import { PURPOSE_LABEL, VideoRow } from '../../database/repositories/videos';

export interface VideoActions { onWatched: (v: VideoRow) => void; onSaved: (v: VideoRow) => void; onVerified: (v: VideoRow) => void; onRemove: (v: VideoRow) => void }

const fmt = (s: number) => `${Math.floor(s / 60)} min`;

/** One recommended lesson: why it is recommended, whether anyone has opened and checked the link, and the student's own progress. */
export function VideoCard({ v, actions, topic }: { v: VideoRow; actions: VideoActions; topic?: string }) {
  const verified = v.verification === 'verified';
  return (
    <Card style={{ marginBottom: space.sm, gap: space.sm }}>
      <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}>
        <Tag tone="accent" label={PURPOSE_LABEL[v.purpose]} />
        <Tag label={v.kind === 'playlist' ? 'Playlist' : 'Video'} />
        {verified ? <Tag tone="success" label={`Link checked ${new Date(v.linkCheckedAt ?? '').toLocaleDateString()}`} /> : <Tag tone="warning" label="Link not yet checked" />}
        {v.watchedAt ? <Tag tone="success" label="Watched" /> : null}
      </View>
      <AppText variant="heading">{v.title}</AppText>
      <AppText variant="caption">{v.channel}{v.durationSeconds ? ` · ${fmt(v.durationSeconds)}` : ''}{topic ? ` · ${topic}` : ''}</AppText>
      {v.why ? <AppText variant="body">{v.why}</AppText> : null}
      <Button title={v.kind === 'playlist' ? 'Open playlist' : 'Watch lesson'} icon="play-circle-outline" onPress={() => Linking.openURL(v.url)} accessibilityHint="Opens YouTube" />
      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
        <Chip label={v.watchedAt ? 'Watched' : 'Mark watched'} selected={!!v.watchedAt} onPress={() => actions.onWatched(v)} />
        <Chip label={v.saved ? 'Saved' : 'Save'} selected={v.saved} onPress={() => actions.onSaved(v)} />
        <Chip label={verified ? 'I checked this link' : 'I opened it: it teaches this'} selected={verified} onPress={() => actions.onVerified(v)} />
      </View>
      <Button title="Remove" variant="ghost" icon="trash-outline" onPress={() => actions.onRemove(v)} />
    </Card>
  );
}
