import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Extends app.json. Over-the-air updates (expo-updates) are configured here so they can differ per build:
 *
 *  - Production / preview builds: the update URL comes from the EAS project id (`eas init` writes it, or set
 *    EXPO_PUBLIC_EAS_PROJECT_ID). The channel comes from eas.json (build profile "production" / "preview").
 *  - Local test builds (ORBIT_UPDATES_TEST=1): updates come from a server you run yourself (scripts/ota-test-server.mjs)
 *    so delivery can be proven without an Expo account. Clear-text HTTP is allowed in that build only.
 *
 * With no project id and no test URL, updates are switched OFF in the build (never a half-configured state).
 * runtimeVersion uses the "fingerprint" policy: it changes whenever anything native changes, so an update is only ever
 * delivered to builds that can run it.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const testUrl = process.env.ORBIT_UPDATES_URL;
  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? (config.extra?.eas as { projectId?: string } | undefined)?.projectId;
  const url = testUrl ?? (projectId ? `https://u.expo.dev/${projectId}` : undefined);
  const testBuild = process.env.ORBIT_UPDATES_TEST === '1';
  return {
    ...config,
    name: config.name ?? 'ORBIT',
    slug: config.slug ?? 'orbit',
    // GitHub Pages serves the web build from /<repo>/, so the router needs that base path (set only for the web export).
    experiments: { ...config.experiments, ...(process.env.ORBIT_WEB_BASE ? { baseUrl: process.env.ORBIT_WEB_BASE } : {}) },
    runtimeVersion: { policy: 'fingerprint' },
    updates: url
      ? {
          url, enabled: true, checkAutomatically: 'ON_LOAD', fallbackToCacheTimeout: 0,
          // The channel this build listens to. `eas build` sets it from eas.json; a local Gradle build needs it written here.
          requestHeaders: { 'expo-channel-name': process.env.ORBIT_UPDATES_CHANNEL ?? (testBuild ? 'preview' : 'production') },
        }
      : { enabled: false },
    extra: { ...(config.extra ?? {}), ...(projectId ? { eas: { projectId } } : {}) },
    plugins: [
      ...(config.plugins ?? []),
      'expo-updates',
      ['expo-build-properties', { android: { usesCleartextTraffic: testBuild } }],
    ],
  };
};
