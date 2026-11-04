import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { fonts, useTheme } from '../src/components/design-system';
import { DatabaseProvider } from '../src/database/DatabaseProvider';
import { AuthProvider } from '../src/services/auth/AuthProvider';
import { SyncProvider } from '../src/services/sync/SyncProvider';

export default function RootLayout() {
  const { colors } = useTheme();
  return (
    <DatabaseProvider>
     <AuthProvider>
      <SyncProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text, contentStyle: { backgroundColor: colors.bg }, headerShadowVisible: false, headerTitleStyle: { color: colors.text, fontFamily: fonts.display, fontWeight: '700' } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chapter/[id]" options={{ title: 'Chapter' }} />
        <Stack.Screen name="mistake/new" options={{ title: 'Add a mistake', presentation: 'modal' }} />
        <Stack.Screen name="result/[examId]" options={{ title: 'Record result', presentation: 'modal' }} />
        <Stack.Screen name="quiz/setup" options={{ title: 'Set up' }} />
        <Stack.Screen name="quiz/run" options={{ title: 'Test', gestureEnabled: false }} />
        <Stack.Screen name="question/new" options={{ title: 'Add a question', presentation: 'modal' }} />
        <Stack.Screen name="lesson/[chapterId]" options={{ title: 'Lesson' }} />
        <Stack.Screen name="content/lesson" options={{ title: 'Lesson', presentation: 'modal' }} />
        <Stack.Screen name="content/formula" options={{ title: 'Add a formula', presentation: 'modal' }} />
        <Stack.Screen name="search" options={{ title: 'Search' }} />
        <Stack.Screen name="roadmap" options={{ title: 'IIT roadmap' }} />
        <Stack.Screen name="coverage" options={{ title: 'Content coverage' }} />
        <Stack.Screen name="content/video" options={{ title: 'Lesson video' }} />
        <Stack.Screen name="exam/pattern" options={{ title: 'Exam pattern' }} />
        <Stack.Screen name="exam/mock" options={{ title: 'Timed mock' }} />
        <Stack.Screen name="import/index" options={{ title: 'Import material' }} />
        <Stack.Screen name="tutor/index" options={{ title: 'AI Tutor' }} />
        <Stack.Screen name="settings/index" options={{ title: 'Settings' }} />
      </Stack>
      </SyncProvider>
     </AuthProvider>
    </DatabaseProvider>
  );
}
