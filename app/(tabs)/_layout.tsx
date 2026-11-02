import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { fonts, MIN_TOUCH, useTheme } from '../../src/components/design-system';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const TABS: { name: string; title: string; on: IconName; off: IconName }[] = [
  { name: 'index', title: 'Home', on: 'home', off: 'home-outline' },
  { name: 'learn', title: 'Learn', on: 'book', off: 'book-outline' },
  { name: 'practice', title: 'Practice', on: 'create', off: 'create-outline' },
  { name: 'mistakes', title: 'Error Book', on: 'bookmark', off: 'bookmark-outline' },
  { name: 'progress', title: 'Progress', on: 'stats-chart', off: 'stats-chart-outline' },
];

export default function TabsLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <Tabs screenOptions={{
      sceneStyle: { backgroundColor: colors.bg },
      headerStyle: { backgroundColor: colors.bg }, headerShadowVisible: false,
      headerTitleStyle: { color: colors.text, fontFamily: fonts.display, fontWeight: '700', fontSize: 20 },
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      tabBarAllowFontScaling: false,
      tabBarActiveTintColor: colors.accentStrong, tabBarInactiveTintColor: colors.textMuted,
      headerRight: () => (
        <Pressable accessibilityRole="button" accessibilityLabel="Ask the AI tutor" onPress={() => router.push('/tutor')} android_ripple={{ color: colors.border, borderless: true, radius: 24 }}
          style={{ minWidth: MIN_TOUCH, minHeight: MIN_TOUCH, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
          <Ionicons name="sparkles-outline" size={22} color={colors.accentStrong} />
        </Pressable>
      ),
    }}>
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.title, tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? t.on : t.off} color={String(color)} size={size} /> }} />
      ))}
    </Tabs>
  );
}
