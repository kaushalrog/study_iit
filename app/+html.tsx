import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/** Root HTML for the web build: viewport, installable-app manifest and theme colour. Not used by the Android app. */
export default function Root({ children }: PropsWithChildren) {
  const base = process.env.EXPO_BASE_URL ?? '';
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <meta name="theme-color" content="#FAF7F0" />
        <meta name="description" content="ORBIT: a private IIT-foundation learning companion." />
        <link rel="manifest" href={`${base}/manifest.json`} />
        <link rel="apple-touch-icon" href={`${base}/icon-192.png`} />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
