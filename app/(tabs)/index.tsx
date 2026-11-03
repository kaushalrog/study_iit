import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { ActionTile, AppText, Button, Card, EmptyState, ErrorState, FadeIn, Icon, LoadingState, Page, ProgressBar, SectionHeader, StatTile, SubjectDot, Tag, space, useLayout, useTheme } from '../../src/components/design-system';
import { useDb } from '../../src/database/DatabaseProvider';
import { PlanTaskRow } from '../../src/components/content/PlanTaskRow';
import { plannerRepo } from '../../src/database/repositories/planner';
import { loadHomeData } from '../../src/features/dashboard/homeData';
import { useNow } from '../../src/hooks/useNow';
import { useAsync } from '../../src/hooks/useAsync';
import { toDateKey } from '../../src/utils/dates';

const SUBJECT_NAME = { math: 'Mathematics', physics: 'Physics', chemistry: 'Chemistry' } as const;
const greeting = (h: number) => (h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
const ACTION_ICON = {
  setup_content: 'library-outline', revise_mistakes: 'refresh-circle-outline', take_mock: 'timer-outline',
  learn_topic: 'book-outline', targeted_practice: 'barbell-outline', assess_topic: 'help-circle-outline', keep_going: 'checkmark-circle-outline',
} as const;

export default function Home() {
  const db = useDb();
  const router = useRouter();
  const { colors } = useTheme();
  const { isTablet } = useLayout();
  const today = toDateKey(new Date());
  const { data, error, reload } = useAsync(() => loadHomeData(db, today), [db, today]);

  const now = useNow(!!data?.timer);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return <LoadingState label="Loading your day" />;

  const act = (fn: () => Promise<unknown>) => fn().then(reload).catch(() => reload());
  const toggleDone = (t: { id: string; status: string }) => act(() => plannerRepo.setStatus(db, t.id, t.status === 'done' ? 'pending' : 'done'));
  const openTask = (t: { slot: string; unitId: string | null }) => {
    if (!t.unitId) return undefined;
    if (t.slot === 'practice') return () => router.push({ pathname: '/quiz/setup', params: { mode: 'practice', chapterId: t.unitId! } });
    if (t.slot === 'concept') return () => router.push({ pathname: '/chapter/[id]', params: { id: t.unitId! } });
    return undefined;
  };

  const first = data.student.name.replace(/^S\.\s*/, '');
  const upcoming = data.exams.filter((e) => e.daysLeft >= 0);
  const nextExam = upcoming[0];
  const dayWord = (n: number) => (n === 0 ? 'Today' : n === 1 ? '1 day' : `${n} days`);

  const Hero = (
    <FadeIn index={0}>
      <Card tone="hero">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <Icon name={ACTION_ICON[data.action.kind]} size="md" color={colors.accent} />
          <AppText variant="label" color={colors.accent}>Your next step</AppText>
        </View>
        <AppText variant="title" color={colors.onPrimary} style={{ marginTop: space.sm }}>{data.action.title}</AppText>
        <AppText variant="body" color={colors.onPrimary} style={{ marginTop: space.xs, opacity: 0.92 }}>{data.action.reason}</AppText>
        <Button title="Start" icon="arrow-forward" variant="secondary" onPress={() => router.push(data.action.route as never)} style={{ marginTop: space.md, alignSelf: 'flex-start' }}
          accessibilityHint={data.action.title} />
      </Card>
    </FadeIn>
  );

  const Exams = (
    <FadeIn index={1}>
      <SectionHeader title="Exams" icon="calendar-outline" />
      {upcoming.length === 0 ? (
        <EmptyState title="No upcoming exams" body="Add your next exam date in Practice." icon="calendar-outline" />
      ) : (
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
          {upcoming.map((e) => (
            <StatTile key={e.id} label={e.style === 'main' ? 'Main exam' : 'Advanced exam'} value={dayWord(e.daysLeft)}
              hint={new Date(e.examDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })} />
          ))}
        </View>
      )}
      {nextExam && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.sm }}>
          {nextExam.syllabus.map((s) => <Tag key={s.chapterId} label={s.title} tone="neutral" />)}
        </View>
      )}
    </FadeIn>
  );

  const Plan = (
    <FadeIn index={2}>
      <SectionHeader title="Today's plan" icon="today-outline" />
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' }}>
          {data.plan.cycle.day ? <Tag tone="accent" label={`Day ${data.plan.cycle.day} of ${data.plan.cycle.length}`} /> : null}
          {data.plan.cycle.phase ? <AppText variant="caption">{data.plan.cycle.phase.label}</AppText> : null}
          {data.plan.holiday ? <Tag tone="success" label="Holiday" /> : null}
        </View>
        {data.planTasks.map((t, i) => (
          <PlanTaskRow key={t.id} t={t} last={i === data.planTasks.length - 1}
            running={data.timer?.taskId === t.id} elapsedMs={data.timer?.taskId === t.id ? now - data.timer.startedAt : 0}
            onToggleDone={() => toggleDone(t)} onStart={() => act(() => plannerRepo.startTimer(db, t))} onStop={() => act(() => plannerRepo.stopTimer(db))}
            onLater={() => act(() => plannerRepo.setStatus(db, t.id, 'rescheduled'))} onOpen={openTask(t)} />
        ))}
      </Card>
    </FadeIn>
  );

  const Subjects = (
    <FadeIn index={3}>
      <SectionHeader title="Subjects" icon="school-outline" />
      {(['math', 'physics', 'chemistry'] as const).map((s) => {
        const cs = data.chapters.filter((c) => c.subject === s);
        if (!cs.length) return null;
        return (
          <Card key={s} tone={s} style={{ marginBottom: space.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <SubjectDot subject={s} size={12} />
              <AppText variant="heading" color={colors[s]}>{SUBJECT_NAME[s]}</AppText>
            </View>
            {cs.map((c) => (
              <View key={c.chapterId} style={{ marginTop: space.md, gap: space.xs }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.sm }}>
                  <AppText variant="body" style={{ flexShrink: 1 }}>{c.title}</AppText>
                  <AppText variant="caption" style={{ fontWeight: '600' }}>{c.mastery.state === 'assessed' ? `${c.mastery.score}%` : 'Not assessed'}</AppText>
                </View>
                <ProgressBar value={c.mastery.score === null ? null : c.mastery.score / 100} color={colors[s]} label={`${c.title} mastery`} />
              </View>
            ))}
          </Card>
        );
      })}
    </FadeIn>
  );

  const Week = (
    <FadeIn index={4}>
      <SectionHeader title="This week" icon="pulse-outline" />
      <Card style={{ gap: space.sm }}>
        <AppText variant="body" style={{ fontWeight: '600' }}>{data.week.message}</AppText>
        <View style={{ flexDirection: 'row', gap: space.xs, alignItems: 'flex-end', height: 72 }} accessibilityLabel={`Sessions finished each day this week: ${data.week.days.map((d) => `${d.done} of ${d.planned}`).join(', ')}`} accessible>
          {data.week.days.map((d) => {
            const h = d.planned === 0 ? 4 : Math.max(4, Math.round((d.done / d.planned) * 56));
            return (
              <View key={d.date} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <View style={{ width: '70%', height: h, borderRadius: 4, backgroundColor: d.done > 0 ? colors.success : colors.track }} />
                <AppText variant="caption" style={{ fontSize: 11, lineHeight: 14 }}>{new Date(d.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'narrow' })}</AppText>
              </View>
            );
          })}
        </View>
      </Card>
      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap', marginTop: space.sm }}>
        <StatTile label="Sessions finished" value={`${data.week.doneTotal}/${data.week.plannedTotal}`} />
        <StatTile label="Minutes timed" value={String(data.week.minutesTotal)} hint="from the study timer" />
        <StatTile label="Questions answered" value={String(data.attempts7d)} />
        <StatTile label="Overdue revisions" value={String(data.overdueRevisions)} hint={data.overdueRevisions ? 'Do five today' : 'All caught up'} />
      </View>
    </FadeIn>
  );

  const Quick = (
    <FadeIn index={5}>
      <SectionHeader title="Quick actions" icon="flash-outline" />
      <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
        <ActionTile icon="book-outline" label="Learn" hint="Lessons and formulas" onPress={() => router.push('/(tabs)/learn')} />
        <ActionTile icon="create-outline" label="Practise" hint="Questions and tests" onPress={() => router.push('/(tabs)/practice')} />
        <ActionTile icon="bookmark-outline" label="Mistakes" hint="Review and add" onPress={() => router.push('/(tabs)/mistakes')} />
        <ActionTile icon="sparkles-outline" label="AI Tutor" hint="Ask a question" onPress={() => router.push('/tutor')} />
      </View>
      <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.sm, flexWrap: 'wrap' }}>
        <Button variant="ghost" icon="add-circle-outline" title="Add a mistake" onPress={() => router.push('/mistake/new')} />
        <Button variant="ghost" icon="settings-outline" title="Settings and backup" onPress={() => router.push('/settings')} />
      </View>
    </FadeIn>
  );

  return (
    <Page>
      <AppText variant="label">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</AppText>
      <AppText variant="display" style={{ marginTop: space.xs }}>{greeting(new Date().getHours())}, {first}</AppText>
      <AppText variant="caption" style={{ marginBottom: space.md }}>Class {data.student.classLevel}{data.student.programme ? ` · ${data.student.programme}` : ''}</AppText>

      {Hero}
      {isTablet ? (
        <View style={{ flexDirection: 'row', gap: space.lg, alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>{Plan}{Week}</View>
          <View style={{ flex: 1 }}>{Exams}{Subjects}{Quick}</View>
        </View>
      ) : (<>{Exams}{Plan}{Subjects}{Week}{Quick}</>)}
    </Page>
  );
}
