import React, { useState } from 'react';
import { Share, View } from 'react-native';
import { AppText, Button, Card, Chip, ErrorState, Field, Group, LoadingState, Page, SectionHeader, space, useTheme } from '../src/components/design-system';
import { useDb } from '../src/database/DatabaseProvider';
import { reviewsRepo, ImportReport } from '../src/database/repositories/reviews';
import { syllabusRepo } from '../src/database/repositories/syllabus';
import { useAsync } from '../src/hooks/useAsync';

/** Tools for an academic reviewer: who counts as one, send a packet out, bring a filled-in decision sheet back. */
export default function ReviewDesk() {
  const db = useDb();
  const { colors } = useTheme();
  const { data, error, reload } = useAsync(async () => ({ chapters: await syllabusRepo.chapters(db), reviewers: await reviewsRepo.reviewers(db) }), [db]);
  const [names, setNames] = useState<string | null>(null);
  const [csv, setCsv] = useState('');
  const [report, setReport] = useState<ImportReport | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState />;
  const shownNames = names ?? data.reviewers.join(', ');

  const saveReviewers = async () => { await reviewsRepo.setReviewers(db, shownNames.split(/[,\n]/)); setNames(null); setMsg('Reviewers saved.'); reload(); };
  const share = async (chapterId: string, what: 'markdown' | 'csv') => {
    try {
      const p = await reviewsRepo.buildPacket(db, chapterId);
      await Share.share({ message: what === 'markdown' ? p.markdown : p.csv, title: what === 'markdown' ? 'ORBIT review packet' : 'ORBIT decision sheet (CSV)' });
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Could not share'); }
  };
  const importCsv = async () => {
    setBusy(true); setReport(null);
    try { setReport(await reviewsRepo.importDecisions(db, csv)); setMsg(null); } catch (e) { setMsg(e instanceof Error ? e.message : 'Import failed'); } finally { setBusy(false); }
  };

  return (
    <Page keyboardShouldPersistTaps="handled">
      <AppText variant="caption" style={{ marginBottom: space.md }}>Academic approval can only come from a person on the reviewer list below, through an imported decision sheet. A student's own check, watching a video, or an automated or AI note never approves anything.</AppText>

      <Group title="Who counts as an academic reviewer">
        <Field label="Reviewer names, separated by commas" value={shownNames} onChangeText={setNames} hint="Nobody can approve until at least one name is listed. Anyone with this phone can edit the list, so keep it in the hands of the account owner. In the cloud, approvals are also limited to accounts the project owner lists in the database." />
        <Button title="Save reviewers" icon="people-outline" variant="secondary" onPress={saveReviewers} disabled={names === null} />
      </Group>

      <SectionHeader title="1. Send a review packet" icon="share-outline" />
      {data.chapters.map((c) => (
        <Card key={c.id} style={{ marginBottom: space.sm, gap: space.sm }}>
          <AppText variant="heading">{c.title}</AppText>
          <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
            <Chip label="Share the packet to read" onPress={() => share(c.id, 'markdown')} />
            <Chip label="Share the decision sheet (CSV)" onPress={() => share(c.id, 'csv')} />
          </View>
        </Card>
      ))}
      <AppText variant="caption">The packet has every explanation, formula, question with its solution, and video link, each with a code. The decision sheet has one row per code. The same files for all four chapters are in the project folder under review/.</AppText>

      <SectionHeader title="2. Bring decisions back" icon="download-outline" />
      <Field label="Paste the filled-in decision sheet" multiline minLines={6} value={csv} onChangeText={setCsv} autoCapitalize="none" autoCorrect={false} placeholder="record_id,kind,code,..." />
      <Button title="Import decisions" icon="checkmark-done" onPress={importCsv} loading={busy} disabled={!csv.trim()} style={{ marginTop: space.sm }} />
      {report && (
        <Card tone={report.rejected.length ? 'accent' : 'default'} style={{ marginTop: space.md, gap: space.xs }} accessibilityLabel="Import result">
          <AppText variant="heading">{report.added} decision{report.added === 1 ? '' : 's'} recorded</AppText>
          {report.duplicates > 0 && <AppText variant="body">{report.duplicates} already recorded and left alone.</AppText>}
          {report.rejected.length > 0 && <AppText variant="body" color={colors.danger}>{report.rejected.length} row{report.rejected.length === 1 ? '' : 's'} not imported:</AppText>}
          {report.rejected.slice(0, 15).map((r) => <AppText key={r.line} variant="caption">Line {r.line}: {r.reason}</AppText>)}
        </Card>
      )}
      {msg ? <AppText variant="body" accessibilityRole="alert" style={{ marginTop: space.md }}>{msg}</AppText> : null}
    </Page>
  );
}
