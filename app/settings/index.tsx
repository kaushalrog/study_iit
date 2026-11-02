import React, { useState } from 'react';
import { View } from 'react-native';
import { AppText, Button, Card, Field, Icon, Page, SectionHeader, Tag, space, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { useAsync } from '../../src/hooks/useAsync';
import { useAuth } from '../../src/services/auth/AuthProvider';
import { validateCredentials } from '../../src/services/auth/errors';
import { useSync } from '../../src/services/sync/SyncProvider';

export default function Settings() {
  const db = useDb();
  const { colors } = useTheme();
  const auth = useAuth();
  const sync = useSync();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const { data } = useAsync(async () => ({
    pending: (await db.first<{ n: number }>('SELECT COUNT(*) AS n FROM sync_outbox'))?.n ?? 0,
    conflicts: (await db.first<{ n: number }>('SELECT COUNT(*) AS n FROM sync_conflicts'))?.n ?? 0,
    last: (await db.first<{ value: string }>("SELECT value FROM app_meta WHERE key = 'last_synced_at'"))?.value ?? null,
  }), [db, sync.last, sync.syncing, auth.status]);

  const submit = async () => {
    const v = validateCredentials(email, password);
    if (v.email || v.password) { setErrors(v); return; }
    setBusy(true); setErrors({});
    const err = await auth.signIn(email, password);
    setBusy(false);
    if (err) setErrors({ general: err }); else setPassword('');
  };

  const r = sync.last;
  const syncTone = !r ? 'neutral' : r.status === 'ok' ? 'success' : r.status === 'partial' ? 'warning' : 'danger';
  const syncText = sync.syncing ? 'Syncing…' : !r ? 'Not synced yet' : r.status === 'ok' ? 'Up to date' : r.status === 'wrong_account' ? 'Wrong account' : r.status === 'partial' ? 'Some changes are waiting' : 'Could not sync';

  return (
    <Page keyboardShouldPersistTaps="handled">
      <SectionHeader title="Account and backup" icon="cloud-outline" />

      {auth.status === 'unconfigured' && (
        <Card style={{ gap: space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <Icon name="phone-portrait-outline" size="lg" color={colors.textMuted} />
            <View style={{ flex: 1 }}>
              <AppText variant="heading">This device only</AppText>
              <AppText variant="caption">Everything is saved on this device. Nothing is uploaded.</AppText>
            </View>
          </View>
          <AppText variant="caption">To back up and share between your phone and tablet, ORBIT needs a cloud project. See "Cloud setup" in the README.</AppText>
        </Card>
      )}

      {auth.status === 'loading' && <Card><AppText variant="body">Checking sign-in…</AppText></Card>}

      {auth.status === 'signed_out' && (
        <Card style={{ gap: space.md }}>
          <AppText variant="heading">Sign in to back up</AppText>
          <AppText variant="caption">ORBIT works without signing in. Signing in saves a copy online and keeps your phone and tablet in step. Your lessons, practice and Error Book stay on this device either way.</AppText>
          <Field label="Email" value={email} onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }} keyboardType="email-address"
            autoCapitalize="none" autoComplete="email" textContentType="emailAddress" autoCorrect={false} error={errors.email} returnKeyType="next" />
          <Field label="Password" value={password} onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }} secureTextEntry={!show}
            autoCapitalize="none" autoComplete="password" textContentType="password" autoCorrect={false} error={errors.password} returnKeyType="go" onSubmitEditing={submit} />
          <View style={{ flexDirection: 'row' }}><Button variant="ghost" icon={show ? 'eye-off-outline' : 'eye-outline'} title={show ? 'Hide password' : 'Show password'} onPress={() => setShow(!show)} /></View>
          {errors.general ? (
            <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }} accessibilityRole="alert" accessibilityLiveRegion="polite">
              <Icon name="alert-circle" size="md" color={colors.danger} /><AppText variant="body" color={colors.danger} style={{ flex: 1 }}>{errors.general}</AppText>
            </View>
          ) : null}
          <Button title="Sign in" icon="log-in-outline" onPress={submit} loading={busy} />
          <AppText variant="caption">No account yet? It is created for you by whoever set up ORBIT. You can't sign up here.</AppText>
        </Card>
      )}

      {auth.status === 'signed_in' && (
        <Card style={{ gap: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <Icon name="cloud-done-outline" size="lg" color={colors.success} />
            <View style={{ flex: 1 }}>
              <AppText variant="heading">Signed in</AppText>
              <AppText variant="caption" selectable>{auth.email}</AppText>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}>
            <Tag tone={syncTone} label={syncText} />
            {data ? <Tag tone={data.pending ? 'warning' : 'neutral'} label={`${data.pending} waiting to upload`} /> : null}
            <Tag label={`Last synced: ${data?.last ? new Date(data.last).toLocaleString() : 'never'}`} />
          </View>
          {r?.message && r.status !== 'ok' ? <AppText variant="caption" color={r.status === 'wrong_account' ? colors.danger : colors.textMuted}>{r.status === 'wrong_account' ? r.message : 'Some changes could not be synced yet. ORBIT will keep trying.'}</AppText> : null}
          {r && r.status !== 'wrong_account' ? <AppText variant="caption">Last run: {r.pushed} uploaded · {r.pulled.inserted + r.pulled.updated} received{r.pulled.conflicts ? ` · ${r.pulled.conflicts} edit${r.pulled.conflicts === 1 ? '' : 's'} replaced by a newer one from your other device` : ''}</AppText> : null}
          {data && data.conflicts > 0 ? <AppText variant="caption">{data.conflicts} older version{data.conflicts === 1 ? ' is' : 's are'} kept safely on this device.</AppText> : null}
          <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
            <Button title="Sync now" icon="sync-outline" onPress={sync.syncNow} loading={sync.syncing} style={{ flexGrow: 1 }} />
            <Button title="Sign out" icon="log-out-outline" variant="secondary" onPress={auth.signOut} style={{ flexGrow: 1 }} />
          </View>
          <AppText variant="caption">Signing out keeps everything on this device. It only stops syncing.</AppText>
        </Card>
      )}

      <SectionHeader title="About" icon="information-circle-outline" />
      <Card><AppText variant="body">ORBIT keeps your study records on this device first, so lessons, practice and the Error Book work without internet. AI answers are always labelled as generated and unverified.</AppText></Card>
    </Page>
  );
}
