# Production release proof

Date: 2026-11-05 (device clock UTC 16:2x–16:4x on 2026-11-04). Expo account `kaushal4599`, project `@kaushal4599/orbit`, project id `f78e0915-c5bd-4cc4-b52c-d1e7bb613267`.

**Status in one line: production OTA through the real Expo EAS service is proven on an installed Android build (two updates delivered and applied), and a real Supabase content-pack publication (two versions) reached the same installed app. Both were tested on an emulator, not a physical phone.**

## 1. Expo configuration and project id
- You had run `eas login`, but `eas init` had not completed: `app.json` had no project id and `eas project:info` reported no project. I ran `eas init --account kaushal4599 --non-interactive`, which created `@kaushal4599/orbit` and wrote the project id into `app.json` (`extra.eas.projectId`).
- Resolved configuration (`npx expo config`): `updates.url = https://u.expo.dev/f78e0915-…`, `enabled: true`, `checkAutomatically: ON_LOAD`, `runtimeVersion: { policy: "fingerprint" }`, clear-text traffic **off**.
- **Bug found and fixed:** `app.config.ts` only set the channel request header for test builds. A locally built APK would therefore not have asked for the `production` channel. It now always sets `expo-channel-name` (default `production`).

## 2. Channels
Neither channel existed. I created both (`eas channel:create production`, `… preview`); each points at a branch of the same name. `eas channel:list` shows `production` (Active, branch `production`).

## 3. Runtime of the installed APK against the runtime EAS uses
| Source | Runtime version |
|---|---|
| Embedded in the production APK (`assets/fingerprint`) | `7b0a46edb5a443996b6a5d52f908d598366204b0` |
| `expo-updates runtimeversion:resolve` | `7b0a46edb5a443996b6a5d52f908d598366204b0` |
| Reported by EAS for the published updates | `7b0a46edb5a443996b6a5d52f908d598366204b0` |
| Shown in the installed app (Settings → Software updates) | `7b0a46edb5a443996b6a5d52f908d598366204b0` |
All four match. The APK manifest (checked with `aapt2`) has `expo.modules.updates.ENABLED`, `EXPO_UPDATE_URL`, `EXPO_RUNTIME_VERSION` and the channel header; `usesCleartextTraffic=false`; package `app.orbit.learning`.

## 4. Publishing script and environment
- `scripts/ota-publish.sh` ran the typecheck and tests (316 passed), printed the runtime, and published. Two script bugs were found and fixed by running it for real: `eas update` needs `--environment` in non-interactive mode, and needs `--platform android` (the web export fails because `react-native-web` is not installed). A typo in a test string was also caught by the test gate before publishing.
- **Bug found and fixed (important):** the first update delivered fine but the app then showed "This device only": the update bundle had lost the Supabase settings. `eas update --environment production` reads variables from EAS, which were empty, instead of the local `.env`. I created `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (public values by design) as plain-text variables in the EAS `production` and `preview` environments. Update 2 kept the cloud settings (Settings showed "Sign in to back up"). **Any new EXPO_PUBLIC_ setting must be added to EAS the same way.**

## 5. Supabase migration 0011 readiness
- Locally ready: migrations apply cleanly, and 47 live-Postgres tests pass, including 4 on `content_packs` (publisher-only writes, version guard, tamper rejection, publish → sync → update → sync → offline).
- **Your Supabase project is NOT ready.** Probes with the project's public key and the test account show it is missing migrations 0007–0011: `content_packs`, `content_publishers`, `content_reviews`, `academic_reviewers`, `video_resources` do not exist, and `learning_content.source_note`, `formulas.owner_id`, `study_tasks.start_time` and `questions.exam_category` are missing. It is at migration 0006.
- I built `supabase/dist/orbit_upgrade_0007_to_0011.sql` (0007–0011 plus the line that makes `kaushalreddy15@gmail.com` a content publisher) and tested it on a database at migration 0006: it applied cleanly, created the five tables and the publisher row.

## 6. One-time account setup
Done for you in this session: Expo login, project, project id, channels, EAS environment variables, production APK.
Done by you: `supabase/dist/orbit_upgrade_0007_to_0011.sql` run once in Supabase → SQL Editor.

## 7. The production APK
`release-apk/ORBIT-production-arm64.apk` (37.6 MB), built with `npm run apk:build` after `eas init`; the script's check that the embedded runtime equals the EAS runtime passed. SHA-256 is in `release-apk/SHA256.txt`. Debug-signed, arm64.

## 8. Test updates published through EAS
| Update | Android update ID | Group ID | Message |
|---|---|---|---|
| 1 | `01a1a769-169c-7c94-9dae-b85e3235f2cf` | `065c5ff0-c073-444e-b4ae-bbcb62544597` | text change |
| 2 | `01a1a771-0441-7234-a211-8604d0fa3f58` | `767fd7bf-56f6-4a4d-9f97-df1f55cb6f62` | keep Supabase settings |
Both went to branch `production`, runtime `7b0a46ed…`. Update 2 was published with `scripts/ota-publish.sh`, the documented command.
Note: these two test updates (they only change a label on the Software updates screen) stay on the production channel until the next real publish replaces them.

## 9. Delivery to the installed device
The production APK was installed on an Android emulator after uninstalling the earlier build, so it started with no update (Current update: "Built into the app", label "embedded in the installed app", channel `production`).
- Update 1: on launch the app downloaded it ("An update is ready"); *Restart to apply* → **Current update `01a1a769-169c-7c94-9dae-b85e3235f2cf`**, label "EAS UPDATE 1: delivered through the real Expo update service".
- Update 2: same path → **Current update `01a1a771-0441-7234-a211-8604d0fa3f58`**, label "EAS UPDATE 2: cloud settings kept in the update"; the app still showed the cloud sign-in.
No reinstall happened between the APK install and either update.

**Caveats on this proof:** it ran on an emulator, not a physical phone, and the emulator's DNS had to be fixed (restarted with `-dns-server 8.8.8.8`) before it could reach `u.expo.dev`; nothing in the app changed for that. Treat a physical-phone check as still worth doing once.

## 10. Real Supabase content-pack publication: PROVEN
After you ran `supabase/dist/orbit_upgrade_0007_to_0011.sql`:
- The tables answer (HTTP 401 for the anonymous key = exists but not readable, instead of 404).
- I published a small test pack to your real Supabase project with `scripts/publish-content.mjs` (new `--dir` option), signing in as `kaushalreddy15@gmail.com`, which the SQL made a publisher: `chapter:gravitation` **v1** (one lesson, "SUPABASE-LESSON-ONE"). Running it again changed nothing ("unchanged").
- On the installed production build (running EAS update 2) I signed in with that account. Content sync ran on sign-in. The lesson was found by in-app search ("Lesson: Escape velocity · tips. Gravitation") and was in the on-device SQLite as `needs_review`; the stored pack state was `version 1` with its checksum.
- I published **v2** (a second lesson and one question). *Refresh content* in Settings → Software updates reported "Gravitation · version 2 · 2 new".
- No APK or OTA update was involved in either content delivery.

Caveats:
- The cloud pack `chapter:gravitation` currently holds this small test bundle (v2). The real `npm run content:publish` will replace it with the full chapter as v3; devices that already received the test lessons keep them (nothing is deleted).
- The sign-in used the test account stored in `.env.cloud-test`. Its password appeared in my command output during the UI sign-in. **Change that account's password**, and consider using a separate publisher account.
- Emulator, not a physical phone.

## Final status
Production OTA through EAS: proven on an installed build. Real Supabase content packs: proven on an installed build. Not done: a physical phone, and publishing the full four chapters (run `npm run content:publish` when you want them in the cloud).
