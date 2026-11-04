import React from 'react';
import { View } from 'react-native';
import { useUpdateManager } from '../services/updates/UpdateProvider';
import { AppText, Button, space, useTheme } from './design-system';

/** A quiet strip shown only when an update has been downloaded. It never restarts the app by itself. */
export function UpdateBanner() {
  const { colors } = useTheme();
  const u = useUpdateManager();
  if (u.state !== 'ready' && u.state !== 'downloading') return null;
  return (
    <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, paddingVertical: space.xs, backgroundColor: colors.surfaceAlt, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <AppText variant="caption" style={{ flex: 1 }}>{u.state === 'ready' ? 'An update is ready.' : 'Downloading an update…'}</AppText>
      {u.state === 'ready' && <Button title="Restart" variant="ghost" icon="refresh-outline" onPress={() => u.apply(false)} accessibilityHint="Restarts ORBIT to use the update" />}
    </View>
  );
}
