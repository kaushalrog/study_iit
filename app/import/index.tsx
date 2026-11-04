import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Switch, View } from 'react-native';
import { AppText, Button, Card, Chip, ErrorState, Field, Group, Icon, LoadingState, Page, SectionHeader, Tag, space, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { contentRepo, ImportReport } from '../../src/database/repositories/content';
import { syllabusRepo } from '../../src/database/repositories/syllabus';
import { IMPORT_EXAMPLE, parseImport } from '../../src/features/syllabus/importBundle';
import { useAsync } from '../../src/hooks/useAsync';

const AI_PROMPT = `Turn the notes below into JSON in exactly this format. Copy the text and formulas faithfully from my notes. Do not invent anything, do not add answers I did not give you, and leave out anything you are unsure about.\n\n${IMPORT_EXAMPLE}\n\nMy notes:\n`;

export default function ImportScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId?: string }>();
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const { data: chapters, error, reload } = useAsync(() => syllabusRepo.chapters(db), [db]);
  const [text, setText] = useState('');
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<ImportReport[] | null>(null);
  const [fail, setFail] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const parsed = useMemo(() => (text.trim() ? parseImport(text) : null), [text]);
  const [resolved, setResolved] = useState<Record<string, string | null>>({});
  useEffect(() => {
    if (!parsed || !chapters) { setResolved({}); return; }
    let alive = true;
    (async () => {
      const m: Record<string, string | null> = {};
      for (const b of parsed.bundles) {
        const byName = await contentRepo.resolveChapter(db, b.chapter);
        // If she opened Import from a chapter and the name doesn't match, a single bundle goes into that chapter.
        m[b.chapter] = byName?.id ?? (chapterId && parsed.bundles.length === 1 ? chapterId : null);
      }
      if (alive) setResolved(m);
    })();
    return () => { alive = false; };
  }, [parsed, chapters, db, chapterId]);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!chapters) return <LoadingState />;

  const importable = parsed?.bundles.filter((b) => resolved[b.chapter]) ?? [];
  const total = importable.reduce((a, b) => a + b.topics.length + b.lessons.length + b.formulas.length + b.questions.length, 0);

  const run = async () => {
    setBusy(true); setFail(null);
    try {
      const out: ImportReport[] = [];
      for (const b of importable) out.push(await contentRepo.importBundle(db, resolved[b.chapter]!, b, checked));
      setReport(out);
    } catch (e) { setFail(e instanceof Error ? e.message : 'Import failed. Nothing was added.'); }
    finally { setBusy(false); }
  };

  if (report) {
    const sum = report.reduce((a, r) => ({ topics: a.topics + r.added.topics, lessons: a.lessons + r.added.lessons, formulas: a.formulas + r.added.formulas, questions: a.questions + r.added.questions, videos: a.videos + r.added.videos }), { topics: 0, lessons: 0, formulas: 0, questions: 0, videos: 0 });
    const skipped = report.reduce((a, r) => a + r.skipped.lessons + r.skipped.formulas + r.skipped.questions + r.skipped.videos, 0);
    return (
      <Page>
        <Card tone="hero" style={{ gap: space.sm }}>
          <Icon name="checkmark-circle" size="lg" color={colors.accent} />
          <AppText variant="title" color={colors.onPrimary}>Imported</AppText>
          <AppText variant="body" color={colors.onPrimary}>{sum.lessons} lessons · {sum.formulas} formulas · {sum.questions} questions · {sum.videos} videos · {sum.topics} new topics</AppText>
          {skipped > 0 && <AppText variant="caption" color={colors.accent}>{skipped} item{skipped === 1 ? ' was' : 's were'} already there and were left alone.</AppText>}
        </Card>
        {!checked && sum.questions > 0 && (
          <Card tone="accent" style={{ marginTop: space.md }}>
            <AppText variant="body" color={colors.onAccent}>The {sum.questions} question{sum.questions === 1 ? '' : 's'} you imported are saved but <AppText variant="body" style={{ fontWeight: '700' }} color={colors.onAccent}>not in practice yet</AppText>, because you didn't confirm the answer keys. Check them against your book, then import again with the box ticked.</AppText>
          </Card>
        )}
        <View style={{ gap: space.sm, marginTop: space.md }}>
          <Button title="Go to Learn" icon="book-outline" onPress={() => router.replace('/(tabs)/learn')} />
          <Button title="Import more" variant="secondary" icon="add" onPress={() => { setReport(null); setText(''); setChecked(false); }} />
        </View>
      </Page>
    );
  }

  return (
    <Page keyboardShouldPersistTaps="handled">
      <AppText variant="caption">Bring in a whole chapter at once: topics, lessons, formulas and questions with answer keys. ORBIT checks every item and tells you exactly what's wrong before anything is added.</AppText>

      <Group title="1 · Paste your JSON">
        <Field label="Import text" multiline minLines={8} autoCapitalize="none" autoCorrect={false} placeholder="Paste here" value={text} onChangeText={(t) => { setText(t); setReport(null); }} />
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
          <Chip label={showHelp ? 'Hide format and AI prompt' : 'Show the format'} selected={showHelp} onPress={() => setShowHelp(!showHelp)} />
        </View>
        {showHelp && (
          <View style={{ gap: space.sm }}>
            <AppText variant="caption">Format (long-press to select and copy). Only "chapter" is required. Everything else is optional.</AppText>
            <Card tone="accent"><AppText variant="caption" selectable color={colors.onAccent} style={{ fontFamily: 'monospace' }}>{IMPORT_EXAMPLE}</AppText></Card>
            <AppText variant="caption" style={{ fontWeight: '600' }} color={colors.text}>To convert notes with an AI tool, paste this before your notes:</AppText>
            <Card><AppText variant="caption" selectable style={{ fontFamily: 'monospace' }}>{AI_PROMPT}</AppText></Card>
            <AppText variant="caption">Always check what an AI copied against your book before you tick "I checked this" below.</AppText>
          </View>
        )}
      </Group>

      {parsed && (
        <Group title="2 · Check what was found">
          {parsed.unreadable ? null : parsed.bundles.map((b) => {
            const ch = resolved[b.chapter];
            const title = chapters.find((c) => c.id === ch)?.title;
            return (
              <View key={b.chapter} style={{ gap: space.xs }}>
                <AppText variant="heading">{b.chapter}</AppText>
                {ch ? <Tag tone="success" label={`Goes into ${title}`} /> : <Tag tone="danger" label="No chapter with this name. Check the spelling." />}
                <AppText variant="body">{b.topics.length} topics · {b.lessons.length} lessons · {b.formulas.length} formulas · {b.questions.length} questions</AppText>
              </View>
            );
          })}
          {parsed.issues.length > 0 && (
            <View style={{ gap: space.xs }} accessibilityRole="alert">
              <View style={{ flexDirection: 'row', gap: space.xs, alignItems: 'center' }}><Icon name="alert-circle" size="md" color={colors.danger} /><AppText variant="body" color={colors.danger} style={{ fontWeight: '700' }}>{parsed.issues.length} problem{parsed.issues.length === 1 ? '' : 's'} (these items will be skipped)</AppText></View>
              {parsed.issues.slice(0, 8).map((i, n) => <AppText key={n} variant="caption" color={colors.danger}>• {i.where}: {i.message}</AppText>)}
              {parsed.issues.length > 8 && <AppText variant="caption">…and {parsed.issues.length - 8} more.</AppText>}
            </View>
          )}
        </Group>
      )}

      {parsed && importable.length > 0 && (
        <>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.md }}>
            <View style={{ flex: 1 }}>
              <AppText variant="body" style={{ fontWeight: '600' }}>I checked all of this against my book or teacher</AppText>
              <AppText variant="caption">Questions only go into practice and mastery when you tick this. Unticked, everything is still saved and labelled "Not yet verified".</AppText>
            </View>
            <Switch value={checked} onValueChange={setChecked} accessibilityLabel="Everything checked" trackColor={{ true: colors.accentStrong, false: colors.controlBorder }} />
          </Card>
          {fail ? <AppText variant="body" color={colors.danger} accessibilityRole="alert" style={{ marginBottom: space.sm }}>{fail}</AppText> : null}
          <Button title={`Import ${total} item${total === 1 ? '' : 's'}`} icon="cloud-upload-outline" onPress={run} loading={busy} disabled={total === 0} />
          <AppText variant="caption" style={{ marginTop: space.sm }}>Importing the same thing twice is safe: items already there are skipped.</AppText>
        </>
      )}
    </Page>
  );
}
