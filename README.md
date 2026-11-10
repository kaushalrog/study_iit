### ORBIT — Your Personal Learning Intelligence System

Offline-first React Native (Expo) app for S. Mahitha (Class 9, Sri Chaitanya IPL, 2026–27).
Local SQLite is the source of truth; Supabase is the optional backup/sync layer; the AI tutor runs only through an authenticated Edge Function.

### Quick start
```bash
npm install            # (or bun install)
npx expo start --android   # dev build / emulator or Expo Go
npm test               # unit + integration tests
npm run typecheck
```
The app runs fully **without any cloud setup** (local-only mode). Cloud features show an honest "not connected" state.

## Environment
Copy `.env.example` to `.env`:
| Variable | Where | Purpose |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` | app | public client config (RLS protects data) |
| `AI_PROVIDER`, `AI_MODEL`, `AI_API_KEY`, `AI_BASE_URL` | **Supabase function secrets only** | LLM access. Never in the app. |

Use separate Supabase projects for development and production; never point a dev build at the production project.

## Architecture
- `app/` Expo Router screens (tabs: Home, Learn, Practice, Error Book, Progress; plus chapter, mistake, result, tutor, settings).
- `src/features/*` pure domain logic with no UI/DB imports: `exam-engine` (scoring), `analytics` (mastery), `error-book` (revision), `planner` (28-day cycle, daily plan), `dashboard` (next best action).
- `src/database/` versioned SQLite migrations, deterministic idempotent seed, repositories. Every write goes through `upsertRow/updateRow`, which saves locally and queues an outbox row in one transaction.
- `src/services/sync` outbox pusher: idempotent upserts by device-generated UUID, exponential backoff, coalesced edits, last-synced stamp.
- `src/services/ai` tutor client; `supabase/functions/tutor` provider-independent LLM gateway (OpenAI-compatible or Anthropic), prompt registry in `_shared/prompts.ts`.
- `supabase/migrations` Postgres schema + RLS. Answer keys live in `question_solutions`, which has no client read policy.

## Academic accuracy
Nothing academic is invented. Seeded: the student profile, 4 chapters, 2 exam dates, and one **unverified** Advanced-style template transcribed from the supplied sample paper (180 marks, 60/subject). The Main-style pattern was not supplied, so it has no sections until configured. Mastery shows "Not assessed" until enough **verified** answers exist; AI output is always labelled generated/unverified.

## Cloud setup (optional: backup and phone-to-tablet sync)
ORBIT works fully without this. To turn on sign-in and sync you need a Supabase project:
1. Create a project, then apply the schema: `supabase link` then `supabase db push` (runs `supabase/migrations/0001`–`0006`).
2. Load the shared chapters: run `supabase/seed/seed.sql` once (SQL editor or `psql`). Its ids **must** match the app's seed; `tests/unit/seedsql.test.ts` enforces this. Without it, synced rows that reference a chapter are rejected.
3. In Authentication, **disable sign-ups** and create the student's user by hand (email + password). The app has no sign-up screen on purpose.
4. Put the project URL and anon key in `.env` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`). Never put the service-role key or AI key in the app.
5. AI tutor: `supabase secrets set AI_PROVIDER=… AI_MODEL=… AI_API_KEY=… [AI_BASE_URL=…]` then `supabase functions deploy tutor`.
6. Use a separate project for development and for the real student's data.

### How sync works
- Every local write is saved to SQLite first and queued in `sync_outbox` in the same transaction. Nothing waits for the network.
- A sync (on sign-in, on returning to the app, every 2 minutes, or **Sync now**) first **pulls** changes newer than a per-table cursor, then **pushes** the queue, parents before children.
- **Rules:** unknown rows are inserted; history tables (`question_attempts`, `mock_attempts`, `ai_messages`, `study_sessions`) are append-only and never overwritten; for editable rows the newer `updated_at` wins. If a newer remote edit beats an unsynced local one, the losing local version is saved in `sync_conflicts` instead of being thrown away.
- **First sync** pulls everything before uploading, so a second device's untouched seed rows can never overwrite newer data. Local rows the server lacks (e.g. work done before signing in) are then uploaded once.
- Rows are keyed by device-generated UUIDs and uploaded as upserts, so retries and two devices can't create duplicates.
- **One account per device:** if a different account signs in on a device that already synced, ORBIT refuses rather than mixing two students' data.
- Signing out stops syncing but never deletes local data.

### Known sync limits
Conflict resolution trusts device clocks (last write wins by `updated_at`). Photos attached to mistakes and questions stay on the device; Supabase Storage upload is not built yet. `study_tasks` and `topic_mastery` have unique keys that two devices could collide on; the app does not write them yet. Uploads are one request per row, so a large first sync is slow on a slow network (batching is a planned improvement). Screens refresh when you navigate to them, not the instant a sync lands. See "Live tests" for exactly what has and has not been run against a real database.

## Live tests (real Postgres)
`npm run test:live` starts a throwaway local PostgreSQL (needs server binaries, e.g. `brew install postgresql@17`), applies `supabase/test/bootstrap.sql` (a stand-in for Supabase's `auth` schema and roles), all migrations and `seed.sql`, then runs `tests/live` serially and deletes everything. It is separate from `npm test` so the normal suite needs no database.

**What it proves** (32 tests): migrations apply cleanly in order; row-level security isolates students (read, update, delete, and creating or reassigning rows to someone else); signed-out visitors have no access; students cannot `TRUNCATE`; the shared bank hides answer keys; students cannot publish or self-verify generated questions; every column the app uploads exists on the server (schema contract); and the real sync engine, run as two devices against that database under RLS, round-trips booleans, jsonb and timestamps, resolves conflicts, never duplicates, and never lets another student see or disturb the data.

**What it does not prove:** it uses plain Postgres, not Supabase itself. Untested: Supabase Auth (JWT issuing, refresh, email flows), PostgREST and `supabase-js` (the test adapter emulates their insert-only-sent-columns upsert), Storage, Edge Functions (`tutor`), the dashboard's role setup, and any network behaviour. Before relying on it, run the Cloud setup steps against a dev Supabase project and sign in from the app.

**Bugs this found that the in-memory tests could not:** `anon` kept full rights (including `TRUNCATE`) on a table created after the revoke; any signed-in student could `TRUNCATE` every table including the shared chapters; a student's own verified question was readable by other students; five server tables lacked `deleted_at`, so uploads of exam templates, sections, rules, answer keys and subject results were all rejected; and quiz attempts used a non-UUID id that Postgres rejected. All fixed (migrations `0005`, `0006`; `attemptIdFor`).

**Known limit:** seed rows (exam templates, exams, profile) use fixed ids so devices of one student agree. A *second student's* first sync would collide with the first student's rows and be rejected (safely: nothing leaks or is overwritten). ORBIT is single-student by design; multi-student would need per-owner ids.

## Testing on a real Supabase project (`npm run test:cloud`)
Use a **development** project and throwaway test users, never the real student's account: the app's seed rows have fixed ids, so a test user's rows would otherwise block the student's first sync (the suite deletes its own rows afterwards).
1. In the Supabase dashboard open **SQL Editor** and run the whole of `supabase/dist/orbit_setup.sql` once (rebuild it with `supabase/test/build-setup-sql.sh` after changing a migration).
2. **Authentication → Users → Add user**: create a test user with a password and tick *Auto Confirm User*. Optionally add a second one for the cross-student test.
3. Put the project URL and publishable key in `.env` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`).
4. Copy `.env.cloud-test.example` to `.env.cloud-test` (git-ignored) and fill in the test user's email and password.
5. `npm run test:cloud`. It covers: signed-out access, wrong-password handling, seed present, RLS through PostgREST (shared data read-only, no self-publishing, no forged owner, second-student isolation), the real sync engine over `supabase-js` with two simulated devices (types, conflicts, no duplicates), and reports whether the `tutor` Edge Function is deployed and configured.
6. Result of the first real run (2 Nov 2026, a development Supabase project): 9 passed, 1 skipped (second-student isolation needs a second user), tutor function reported `not_deployed`. The two sync scenarios took about 2 minutes each, because the engine uploads one row per request; see "Known sync limits".
7. Afterwards: **Authentication → Sign In / Providers → turn off "Allow new users to sign up"**, so only the account you create can ever sign in.

## Deploy
1. `supabase link`, `supabase db push` (applies `supabase/migrations`).
2. `supabase secrets set AI_PROVIDER=… AI_MODEL=… AI_API_KEY=… [AI_BASE_URL=…]`; `supabase functions deploy tutor`.
3. Create the student's auth user in the Supabase dashboard (sign-ups off).
4. Android build (cloud, recommended on a slow connection). `eas.json` defines `preview` (installable APK) and `production` (Play Store AAB):
   ```bash
   npx eas-cli login                                   # your free Expo account
   npx eas-cli init                                    # links the project, writes the project id
   npx eas-cli env:create --environment preview --name EXPO_PUBLIC_SUPABASE_URL --value <url> --visibility plaintext
   npx eas-cli env:create --environment preview --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <publishable-key> --visibility plaintext
   npx eas-cli build -p android --profile preview      # prints a download link for the .apk
   ```
   The `.env` file is git-ignored, so the cloud build only sees values you set with `env:create`. Without them the APK works but runs in local-only mode (no sign-in or sync).
   **Local build** (no account; first run downloads about 3 GB including the NDK): with Java 21 and the Android SDK installed,
   ```bash
   npx expo prebuild --platform android --no-install    # then restore the "android"/"ios" scripts in package.json that prebuild rewrites
   echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
   cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
   ```
   The APK lands in `android/app/build/outputs/apk/release/app-release.apk`. It is signed with a debug key: fine for your own phone and tablet, **not** for the Play Store. Only 64-bit ARM is built (virtually all current devices; not x86 emulators).
   *Slow Maven Central?* On a connection where `repo.maven.apache.org` crawls, add `-I scripts/google-mirror.init.gradle` to that one command to fetch Maven Central libraries from Google's public mirror instead. It is deliberately a per-command flag, never installed globally. Measured here: about 1 MB/s versus about 64 KB/s.

   **Install the APK:** copy `ORBIT-v1.0.0-arm64.apk` to the device and open it (allow "install unknown apps" for your file manager or browser), or `adb install -r ORBIT-v1.0.0-arm64.apk`. Check the download with `shasum -a 256` against `release-apk/SHA256.txt`.

   **Permissions the APK requests:** camera (to scan questions), internet (sync and tutor), vibrate, and legacy storage access on Android 12 and older (photo import). The microphone and "draw over other apps" permissions are explicitly removed (`app.json` `blockedPermissions`).

## Backup
Cloud: Supabase daily backups (enable PITR for production). Device: the SQLite file `orbit.db`; sync status is in Settings.

## Practice & exams
- **Add questions** (Practice → Add a question): enter stem, options, answer key, explanation, hint and source. Only questions whose key you tick as *checked against your book/teacher* enter the practice bank and mastery; others wait as unconfirmed. Answer keys live in `question_solutions`, never in list queries.
- **Practice mode**: chapter/level selection, easy→hard progression, hints, instant feedback, save-to-Error-Book with a mistake type.
- **Timed test**: countdown, question palette, mark-for-review, submit confirmation, auto-submit at time-up, **crash recovery** (state saved after every action; the clock keeps running while the app is closed).
- **Results**: score (% of marks) and accuracy (% of attempted) shown separately, subject split, negative marks lost, time, where marks were lost, per-question review.
- Marking in these tests is **your own setting**, not an official pattern. Real exam marks are recorded manually on the exam card. 
- **Exam patterns** (Practice → Edit pattern): sections, subject, question type, counts, marks for correct/wrong/unanswered, partial marking and attempt limits. Main-style starts empty; the Advanced sample is flagged unverified. Ticking *I checked this* is your statement, never ours.
- **Timed mock from a pattern**: fills each section with verified questions of that subject and type, never repeats one, and lists exactly what your bank is missing. You can take a clearly labelled shorter paper with the same marking. Nothing is invented.

## Content, import and planning
- **Lessons and formulas** are written or imported by you (chapter screen → add material). Unverified items are tagged *Not yet verified*; AI-generated content is never marked verified.
- **Bulk import** (Import material): paste JSON (a fenced block works); each item is checked and reported separately; re-importing is idempotent. LaTeX (`$…$`, `\frac`, `\sqrt`, scripts, Greek) is shown as readable Unicode, not typeset like KaTeX.
- **Daily plan**: persisted per day with stable ids, so devices agree. Tick off, time (single running timer, 3 h cap) or move a task; moved tasks take the same slot next day and never add load. Home shows a seven-day summary (homework excluded).
- **Progress**: mastery from verified evidence only, recorded exams and practice tests as percent-of-marks trend lines (text summary under each; no line until there are two results).
- Database migrations v1–v5 on device; Supabase migrations 0001–0008 (`supabase/dist/orbit_setup.sql` is the one-paste version).

## Starter content
`content/` holds 170 lessons, 45 formulas, 82 generated practice questions and 19 video links for the four current chapters, in the importer's JSON format (see `content/README.md`). It is loaded from Learn → *Load the starter library* and arrives as *needs review*: nothing is verified until a person confirms it in *Check material*. There are no PYQs yet. See `docs/CONTENT_COVERAGE.md` for exact counts and limits.

## Updating the installed app
Install the OTA-enabled APK once. JavaScript changes then go out with `npm run ota:publish`, and lessons, questions, videos and the roadmap with `npm run content:publish`; only native changes need a new APK. The one-time Expo setup, the exact commands and what has and has not been proven are in `docs/UPDATES.md`. The APK installed before this change cannot receive updates.

## Known limitations
Not yet implemented: Supabase Storage for photos; matching/assertion-reason have answer entry but no special rendering; KaTeX-quality math (Unicode approximation only); diagrams in questions; PDF/image content import; crop/rotate; reminders and notifications; Maestro E2E; tablet-specific layouts; the `solve-question`, `generate-practice`, `import-content` functions. The AI `tutor` function is written but **not deployed**, so the tutor asks for sign-in/setup until it is. Sync passed the real-Supabase test with one test account; a second-student isolation check and a real-device (not emulator) run are still outstanding. Public Supabase sign-ups should be disabled for a one-student project. Logic is covered by 200+ automated tests plus 37 live-Postgres tests.
