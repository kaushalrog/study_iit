import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import { AppText, Button, Card, Chip, Field, Icon, Tag, space, useBottomInset, useLayout, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { notesRepo } from '../../src/database/repositories/notes';
import { syllabusRepo } from '../../src/database/repositories/syllabus';
import { useAsync } from '../../src/hooks/useAsync';
import { askTutor, TutorError, TutorTask } from '../../src/services/ai/tutorClient';
import { useAuth } from '../../src/services/auth/AuthProvider';
import { cloudConfigured } from '../../src/services/supabase/client';

interface Msg { id: number; role: 'user' | 'assistant' | 'error'; text: string; generated?: boolean; task?: TutorTask }

export default function Tutor() {
  const { chapterId } = useLocalSearchParams<{ chapterId?: string }>();
  const db = useDb();
  const { colors } = useTheme();
  const router = useRouter();
  const auth = useAuth();
  const signedOut = cloudConfigured && auth.status === 'signed_out';
  const bottom = useBottomInset();
  const { gutter, maxWidth } = useLayout();
  const [lang, setLang] = useState<'en' | 'te'>('en');
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const id = useRef(1);

  const { data: chapter } = useAsync(async () => (chapterId ? syllabusRepo.chapter(db, chapterId) : null), [db, chapterId]);

  const send = async (task: TutorTask, text: string) => {
    const message = text.trim();
    if (!message || busy || signedOut) return;
    const history = msgs.filter((m) => m.role !== 'error').map((m) => ({ role: m.role as 'user' | 'assistant', content: m.text }));
    setMsgs((p) => [...p, { id: id.current++, role: 'user', text: message }]);
    setInput(''); setBusy(true);
    try {
      const lessons = chapter ? (await syllabusRepo.lessons(db, chapter.id, 'en')).map((l) => l.body).join('\n\n') : '';
      const r = await askTutor({ task, message, language: lang, history, context: chapter ? { subject: chapter.subjectName, chapter: chapter.title, lessonExcerpt: lessons || undefined } : undefined });
      setMsgs((p) => [...p, { id: id.current++, role: 'assistant', text: r.text, generated: true, task }]);
    } catch (e) {
      setMsgs((p) => [...p, { id: id.current++, role: 'error', text: e instanceof TutorError ? e.message : 'Something went wrong. Please try again.' }]);
    } finally { setBusy(false); }
  };

  const lastUser = [...msgs].reverse().find((m) => m.role === 'user')?.text ?? '';
  const saveNote = async (m: Msg) => {
    if (!chapterId) return;
    await notesRepo.add(db, chapterId, m.text, { source: 'ai_tutor', title: 'AI explanation (unverified)' });
    setSaved((s) => new Set(s).add(m.id));
  };
  const wrap = { width: '100%' as const, maxWidth, alignSelf: 'center' as const, paddingHorizontal: gutter };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View style={[wrap, { paddingTop: space.md, gap: space.sm }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' }}>
          <Icon name="sparkles" size="md" color={colors.accentStrong} />
          <AppText variant="body" style={{ fontWeight: '600', flexShrink: 1 }}>{chapter ? `${chapter.subjectName} · ${chapter.title}` : 'General help'}</AppText>
        </View>
        {!chapter && <AppText variant="caption">Open the tutor from a chapter for answers based on your own lessons.</AppText>}
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Chip label="English" selected={lang === 'en'} onPress={() => setLang('en')} />
          <Chip label="తెలుగు" selected={lang === 'te'} onPress={() => setLang('te')} />
        </View>
        {signedOut && (
          <Card tone="accent" style={{ gap: space.sm }}>
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <Icon name="log-in-outline" size="md" color={colors.onAccent} />
              <AppText variant="caption" color={colors.onAccent} style={{ flex: 1 }}>The tutor works over the internet through your ORBIT account, so you need to sign in first. Everything else in ORBIT works without signing in.</AppText>
            </View>
            <Button title="Go to Settings to sign in" icon="settings-outline" variant="secondary" onPress={() => router.push('/settings')} />
          </Card>
        )}
        {!cloudConfigured && (
          <Card tone="accent" style={{ flexDirection: 'row', gap: space.sm }}>
            <Icon name="cloud-offline-outline" size="md" color={colors.onAccent} />
            <AppText variant="caption" color={colors.onAccent} style={{ flex: 1 }}>The tutor needs the ORBIT cloud connection, which isn't set up on this device yet. Everything else works offline.</AppText>
          </Card>
        )}
      </View>

      <FlatList
        data={msgs} keyExtractor={(m) => String(m.id)} contentContainerStyle={[wrap, { paddingVertical: space.md, gap: space.sm, flexGrow: 1 }]}
        ListEmptyComponent={
          <Card style={{ gap: space.sm }}>
            <AppText variant="heading">Ask anything about your syllabus</AppText>
            <AppText variant="body" color={colors.textMuted}>Try "Explain this simply", paste a question, or ask for "a hint" to get just a nudge.</AppText>
          </Card>}
        renderItem={({ item }) => {
          const mine = item.role === 'user';
          return (
            <View style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '92%' }}>
              <Card tone={mine ? 'accent' : 'default'} style={item.role === 'error' ? { backgroundColor: colors.dangerTint, borderColor: colors.danger } : undefined}>
                {!mine && item.role === 'assistant' && <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, marginBottom: space.xs }}><Icon name="sparkles-outline" size="sm" color={colors.accentStrong} /><AppText variant="label">ORBIT tutor</AppText></View>}
                {item.role === 'error' && <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, marginBottom: space.xs }}><Icon name="alert-circle" size="sm" color={colors.danger} /><AppText variant="label" color={colors.danger}>Problem</AppText></View>}
                <AppText variant="body" selectable color={mine ? colors.onAccent : item.role === 'error' ? colors.danger : colors.text}>{item.text}</AppText>
                {item.generated && <View style={{ flexDirection: 'row', marginTop: space.sm }}><Tag tone="warning" label="AI-generated · not verified" /></View>}
                {item.generated && chapterId && (
                  <Button variant="ghost" icon={saved.has(item.id) ? 'checkmark' : 'bookmark-outline'} title={saved.has(item.id) ? 'Saved to notes' : 'Save to notes'} disabled={saved.has(item.id)} onPress={() => saveNote(item)} style={{ alignSelf: 'flex-start' }} />
                )}
              </Card>
            </View>
          );
        }}
      />

      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface }}>
        <View style={[wrap, { paddingTop: space.sm, paddingBottom: space.sm + bottom, gap: space.sm }]}>
          <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
            <Chip label="Hint" onPress={() => send('hint', lastUser)} />
            <Chip label="Explain again" onPress={() => send('explain', `I don't understand. Explain this in a different, simpler way: ${lastUser}`)} />
            <Chip label="Similar problem" onPress={() => send('similar', lastUser)} />
          </View>
          <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}><Field label="Message" multiline placeholder="Ask the tutor" value={input} onChangeText={setInput} /></View>
            <Button title="Send" icon="send" onPress={() => send('explain', input)} loading={busy} disabled={!input.trim() || signedOut} />
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
