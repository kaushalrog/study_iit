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
