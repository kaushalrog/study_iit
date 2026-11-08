# Updating ORBIT without reinstalling it

ORBIT has two independent update channels. Install the OTA-enabled APK once; after that, almost everything arrives inside the installed app.

| What changed | How it reaches Mahitha | New APK? |
|---|---|---|
| App code and screens (TypeScript/JavaScript, images) | **Expo EAS Update**, published to the `production` channel | No |
| Lessons, formulas, worked examples, practice questions, PYQs, videos, roadmap | **Content packs in Supabase**, fetched by the app | No |
| Native Android code, a native dependency, permissions, app icon/config that is native | A new APK | Yes (and only then) |

## 1. Audit of the APK installed before this change
Checked on 2026-11-05:
- `expo-updates` was **not installed**.
- The generated `AndroidManifest.xml` had `expo.modules.updates.ENABLED = false`, no `EXPO_UPDATE_URL`, no `EXPO_RUNTIME_VERSION`, no channel header.
- There was no EAS project id (`extra.eas.projectId`) and `eas-cli` was not installed or logged in.

**Conclusion: the APK installed earlier cannot receive over-the-air updates. One final replacement APK is needed** to switch the mechanism on. After that APK is installed, normal changes need no reinstall. (Same application id `app.orbit.learning`, so it installs over the old one and keeps its data.)

## 2. What is configured
- `app.config.ts` (extends `app.json`): `expo-updates`, `runtimeVersion: { policy: "fingerprint" }`, `updates.url` from the EAS project id, `checkAutomatically: ON_LOAD`.
- `eas.json`: build profiles with channels `production`, `preview` and `development`; production builds an APK (side-loaded).
- **Fingerprint runtime**: the runtime version is a hash of everything native (Expo config, autolinked native modules, native dependencies). A JavaScript-only change keeps it; a native change alters it, so an update is only delivered to builds that can run it. `npm run ota:runtime` prints it.
- With no EAS project id the build switches updates **off** rather than ship half-configured.

## 3. One-time setup you must do (needs your Expo account)
These need your login, so they cannot be done from here:
```bash
npx eas-cli login
npx eas-cli init                       # creates the project and writes extra.eas.projectId into app.json
npx eas-cli update:configure           # confirms updates.url and the runtime policy
npx eas-cli channel:create production  # if EAS reports they do not exist
npx eas-cli channel:create preview
npm run apk:build                      # builds the OTA-enabled production APK: install it ONCE on the phone
```
Commit the `projectId` change in `app.json`. Do not put Expo tokens in the repository.

## 4. Release workflows
**Normal UI update** (code or screens):
```bash
npm run ota:publish:preview   # optional: test on a preview-channel build first
npm run ota:publish           # runs typecheck + tests, shows the runtime, publishes to production
```
The phone downloads it the next time ORBIT opens (and when coming back to the app, at most every six hours), and uses it on the launch after that, or immediately via Settings → About ORBIT → Software updates → Restart to apply. ORBIT never restarts by itself, and refuses to restart during a test or with unsaved writing.

**Academic content update** (lessons, questions, videos, roadmap):
```bash
# edit content/src/*.py (or add a chapter), then:
npm run content:validate            # rebuilds the JSON, recomputes answer keys, runs the audit and the importer
npm run content:publish:dry         # shows which packs would change
CONTENT_PUBLISHER_EMAIL=... CONTENT_PUBLISHER_PASSWORD=... npm run content:publish
```
Mahitha's app fetches it at the next open or via Settings → Software updates → Refresh content. Publishing signs in as an account listed in `content_publishers` (a SQL one-liner, below); it never uses a service-role key.

**Native update** (only when `npm run ota:runtime` shows a different runtime from the installed app's):
```bash
npm run apk:build     # refuses to build if nothing native changed (use FORCE=1 to override)
```

Other commands: `npm run ota:check` (what each channel serves), `npm run test:all` (typecheck + all tests).

### Supabase one-time setup for content packs
Run `supabase/migrations/0011_content_packs.sql` (it is also in `supabase/dist/orbit_setup.sql`), then make your publishing account a publisher:
```sql
insert into content_publishers (user_id, display_name) select id, 'Publisher' from auth.users where email = 'YOUR-EMAIL';
```

## 5. How content packs work
- A pack is one chapter's bundle in the same JSON format as the in-app importer (so there is one format), or a roadmap.
- Each pack has a version and a SHA-256 of its canonical JSON. The app downloads only packs whose version moved, re-checks the hash, validates every record with the importer's rules, and applies them idempotently into SQLite. Invalid records are skipped and reported; a bad pack never blocks the others.
- Content arrives as **needs review**. Publishing does not verify anything; academic approval stays a separate step (docs/REVIEW_WORKFLOW.md).
- Corrections: a newer pack lists replaced lesson texts in `retired`; they are withdrawn **only if nobody has confirmed them**. Unconfirmed formulas are improved in place. Nothing is deleted when a pack is withdrawn by the publisher.
- Offline: everything is already in SQLite. A failed or offline check changes nothing and says so.
- Open screens reload when new content is saved; no restart.

## 6. What has and has not been proven
See the "Proof" section at the end of this file.

## Proof (what was actually run)
Test build: an OTA-enabled release APK installed on an Android emulator (same application id and signing as before). Its update URL pointed at `scripts/ota-test-server.mjs`, a small server that speaks Expo's update protocol, run on the development computer. **This proves the installed app receives, downloads and runs new JavaScript without a reinstall. It does not prove EAS Update itself**, because that needs your Expo account (section 3). The logs are in `docs/ota-proof/`.

| # | Step | Result |
|---|---|---|
| 1 | Audit of the earlier APK | No OTA support (updates disabled, no URL, no runtime version, no project id) |
| 2 | Built OTA-enabled APK (runtime `3552acc6…`, channel `preview`) | Installed; Settings → Software updates showed the runtime and "Built into the app" |
| 3 | Published a text change ("UPDATE 1") | App downloaded it in the background (server log: `GET /manifest` → manifest, `GET /assets` bundle) and said "An update is ready" |
| 4 | Tapped *Restart to apply* | Current update became `ac31ecab…`; the label read "UPDATE 1: text change delivered over the air" |
| 5 | Published a UI change ("UPDATE 2": a screen heading changed) | Same runtime, downloaded, applied: current update `c417bafc…`, new heading visible |
| 6 | Added a native permission to the config | The fingerprint runtime changed (`3552acc6…` → `d2b02d03…`) |
| 7 | Published JS built for the new runtime | Server refused it for the installed runtime (`noUpdateAvailable (runtime mismatch)`); the app stayed on update 2 |
| 8 | Forced the server to offer the mismatched update anyway | The app downloaded it but **still ran update 2** after *Restart to apply*: Android's updater refuses an incompatible update on its own |
| 9 | Published update 3 (JS that can read a content feed) over the air | Delivered and applied like the others |
| 10 | Published a lesson to a stand-in content feed after install | On next open the app applied it ("2 new"); searching found the lesson: no APK change |
| 11 | Published version 2 with 2 questions and a video; *Refresh content* | "version 2, 3 new"; the SQLite file on the device held the questions (as needs review) and the video |
| 12 | Switched off networking; *Refresh content* | "Offline … your downloaded content is unchanged"; the lesson was still found and opened |

Automated tests: content sync (11 integration tests with a fake server: versions, checksum failures, corrected lessons, withdrawn packs, offline, roadmap validation, hash agreement with the publish script), 4 live-Postgres tests of the real `content_packs` table (publisher-only writes, version guard, tamper rejection, publish → sync → update → sync → offline), update-manager rules (14), SHA-256 (3).

### Not proven, and why
- **EAS Update itself and the `production`/`preview` channels on EAS.** They need your Expo login (`eas login`, `eas init`). Until the first `npm run ota:publish` reaches a phone, treat production delivery as configured but unproven.
- **Content packs against your real Supabase project.** The tests used real Postgres locally and an HTTP stand-in on the device. Your project needs migration 0011 and a publisher row first (section 4).
- **A real phone.** Everything ran on an emulator.
- **Practice library on the device.** On the device the new questions arrived in the database as "needs review"; that they reach practice after a student check is covered by the integration test, not by a tap-through on the device.

### Things to know
- **Fingerprint pitfall, fixed:** a local Gradle build and `eas update` must compute the same runtime. They differed until `.fingerprintignore` excluded the generated `android/` and `ios/` folders. `npm run apk:build` now stops if the APK's embedded runtime differs from what `eas update` would use.
- Expo reports an update as "ready" once downloaded, even if it was built for a different runtime and will never run. With EAS this should not happen (it only serves matching runtimes); it was only seen in the forced test.
- `apk:build` rebuilds the native project with `expo prebuild`, which recreates `android/local.properties`; set `ANDROID_HOME` or recreate it.

## Production status
See `docs/PRODUCTION_RELEASE_PROOF.md`. Expo project, channels, EAS environment variables and the production APK are set up and two EAS updates have reached an installed app. Run `supabase/dist/orbit_upgrade_0007_to_0011.sql` once, then `npm run content:publish`.

## Web version (GitHub Pages)
The app also runs in a browser (SQLite via WebAssembly) and is published at https://kaushalrog.github.io/orbit-web/ from a separate public repository (`kaushalrog/orbit-web`), so this source repository can stay private. Redeploy with `scripts/deploy-web.sh` (build, publish, enable Pages). Data lives in each browser (not shared with the phone unless signed in). The site is public and contains the starter content and the Supabase public URL and key; it has no offline cache of its own, so the first visit needs internet. Over-the-air updates do not apply to the web build: redeploy it. `@expo/log-box` is pinned in `package.json` so adding the web packages does not change the Android runtime (checked: still `7b0a46ed…`).
