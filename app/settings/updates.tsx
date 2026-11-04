import Constants from 'expo-constants';
import React from 'react';
import { View } from 'react-native';
import { AppText, Button, Card, Icon, Page, SectionHeader, Tag, space, useTheme } from '../../src/components/design-system';
import { useContentSync } from '../../src/services/content/ContentSyncProvider';
import { OTA_MARKER } from '../../src/otaMarker';
import { describeRuntime, STATE_TEXT } from '../../src/services/updates/policy';
import { useUpdateManager } from '../../src/services/updates/UpdateProvider';

const when = (iso: string | number | null) => (iso ? new Date(iso).toLocaleString() : 'never');
const Row = ({ k, v }: { k: string; v: string }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.md }} accessible accessibilityLabel={`${k}: ${v}`}>
    <AppText variant="caption">{k}</AppText><AppText variant="caption" style={{ flexShrink: 1, textAlign: 'right' }} selectable>{v}</AppText>
  </View>
);

/** Settings → About ORBIT → Software updates. Two independent channels: app code (Expo updates) and academic content (Supabase packs). */
export default function Updates() {
  const { colors } = useTheme();
  const u = useUpdateManager();
  const c = useContentSync();
  const d = describeRuntime(u.runtime);
  const tone = u.state === 'ready' ? 'success' : u.state === 'error' ? 'danger' : u.state === 'offline' || u.state === 'available' ? 'warning' : 'neutral';
  const cr = c.last;

  return (
    <Page>
      <SectionHeader title="App software" icon="phone-portrait-outline" />
      <Card style={{ gap: space.sm }}>
        <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}><Tag tone={tone} label={STATE_TEXT[u.state]} /></View>
        <Row k="Installed version" v={Constants.expoConfig?.version ?? '1.0.0'} />
        <Row k="Runtime version" v={d.runtime} />
        <Row k="Update channel" v={d.channel} />
        <Row k="Current update" v={d.update} />
        <Row k="Code version label" v={OTA_MARKER} />
        <Row k="Published" v={d.published} />
        <Row k="Last update check" v={when(u.lastCheckAt)} />
        {u.message ? <AppText variant="caption" accessibilityRole="alert">{u.message}</AppText> : null}
        {u.error ? <AppText variant="caption" color={colors.danger}>{u.error}</AppText> : null}
        {!u.enabled ? <AppText variant="caption">This build has no update server configured, so it will not receive over-the-air updates. See docs/UPDATES.md.</AppText> : null}
        {u.busy.length > 0 && u.state === 'ready' ? <AppText variant="caption">Waiting: {u.busy.join(' and ')}. The update will be used next time ORBIT opens.</AppText> : null}
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
          <Button title="Check for updates" icon="cloud-download-outline" onPress={u.check} loading={u.checking} disabled={!u.enabled} style={{ flexGrow: 1 }} />
          {u.state === 'ready' && <Button title="Restart to apply" icon="refresh-outline" variant="secondary" onPress={() => u.apply(false)} style={{ flexGrow: 1 }} />}
        </View>
        <AppText variant="caption">Updates download in the background and are used the next time ORBIT opens. ORBIT never restarts by itself, and refuses to restart during a test or while you have unsaved writing.</AppText>
      </Card>

      <SectionHeader title="Academic content" icon="library-outline" />
      <Card style={{ gap: space.sm }}>
        {!c.available ? <Tag tone="neutral" label="Needs sign-in and a cloud project" /> : (
          <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}>
            <Tag tone={c.syncing ? 'accent' : !cr ? 'neutral' : cr.status === 'ok' ? 'success' : cr.status === 'offline' ? 'warning' : cr.status === 'partial' ? 'warning' : 'danger'}
              label={c.syncing ? 'Checking for new content…' : !cr ? 'Not checked yet' : cr.status === 'ok' ? 'Up to date' : cr.status === 'offline' ? 'Offline' : cr.status === 'partial' ? 'Some packs failed' : 'Could not check'} />
            {c.pending > 0 ? <Tag tone="warning" label={`${c.pending} update${c.pending === 1 ? '' : 's'} waiting`} /> : null}
          </View>
        )}
        <Row k="Last successful sync" v={when(c.lastSuccessAt)} />
        {cr ? <Row k="Last attempt" v={when(cr.at)} /> : null}
        {cr && cr.applied.length > 0 ? cr.applied.map((a) => (
          <View key={a.id} accessible accessibilityLabel={`${a.title} version ${a.version}`}>
            <AppText variant="caption" style={{ fontWeight: '600' }}>{a.title} · version {a.version}</AppText>
            <AppText variant="caption">{a.added} new, {a.updated} improved{a.withdrawn ? `, ${a.withdrawn} replaced` : ''}{a.warnings.length ? ` · ${a.warnings.length} item${a.warnings.length === 1 ? '' : 's'} skipped as invalid` : ''}</AppText>
          </View>
        )) : null}
        {cr?.message ? <AppText variant="caption" accessibilityRole="alert">{cr.message}</AppText> : null}
        {cr?.failed.map((f) => <AppText key={f.id} variant="caption" color={colors.danger}>{f.id}: {f.reason}</AppText>)}
        {cr?.skipped.map((s) => <AppText key={s.id} variant="caption">{s.id}: {s.reason}</AppText>)}
        {cr?.withdrawnByPublisher.length ? <AppText variant="caption">{cr.withdrawnByPublisher.length} pack{cr.withdrawnByPublisher.length === 1 ? ' was' : 's were'} withdrawn by the publisher. Your copy is kept.</AppText> : null}
        <Button title="Refresh content" icon="sync-outline" onPress={c.refresh} loading={c.syncing} disabled={!c.available} />
        <View style={{ flexDirection: 'row', gap: space.xs, alignItems: 'center' }}>
          <Icon name="information-circle-outline" size="sm" color={colors.textMuted} />
          <AppText variant="caption" style={{ flex: 1 }}>New lessons, questions, videos and roadmap changes arrive here without a new app. They load as "needs review"; nothing is deleted from your device, and everything stays available offline.</AppText>
        </View>
      </Card>
    </Page>
  );
}
