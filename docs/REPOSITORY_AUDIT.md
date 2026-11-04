# ORBIT repository audit

Audited from the working tree on 2026-11-04 (branch `main`, after commit `e3868ae`). Facts below were read from code, migrations, a freshly seeded database and the test suite, not from earlier documents.

## 1. Current architecture
- **Stack:** Expo SDK 58, React Native 0.88, Expo Router, TypeScript, zod 4, expo-sqlite on device, Supabase (Postgres + RLS + one edge function) for optional sync. Keep it; nothing in the brief needs a different stack.
- **Layers:** `app/` (routes) → `src/features/*` (pure logic: exam engine, mastery, planner, revision, math rendering, import, trend) → `src/database/repositories/*` (SQLite via the `SqlDb` interface; write-through helpers queue `sync_outbox` rows) → `src/services/{sync,auth,ai,supabase}`.
- **Storage:** SQLite migrations v1–v5 (`src/database/migrations/index.ts`); Supabase migrations 0001–0008 plus a one-paste `supabase/dist/orbit_setup.sql`.
- **Sync:** per-table pull cursors, push of the outbox, last-write-wins by `updated_at`, append-only attempt tables, conflict log. Verified against real Postgres (37 live tests) and once against a real Supabase project.
- **Security:** owner-only RLS, answer keys in a separate table, restrictive policies stopping students from self-publishing generated questions, AI keys only in the (undeployed) edge function.

## 2. Working functionality (verified by tests and/or the emulator)
Home with persisted daily plan, timer and weekly summary; syllabus → chapter → topic hierarchy with student-authored lessons and formulas; JSON bulk import; readable LaTeX approximation; practice and timed tests with crash recovery; configurable exam patterns and pattern-built mocks; scoring with negative and partial marking; Error Book with revision schedule; mastery from verified attempts; Progress trend charts; sign-in and sync; AI tutor client.

## 3. Incomplete functionality
- Tutor edge function is written, not deployed. No retrieval from lesson content yet.
- No video catalogue, no PYQ metadata (exam, year, session), no global search, no notes reader beyond a plain notes table, no roadmap, no tablet layouts, no PDF/scan ingestion, no camera question assistance, no Telugu mode, no downloads manager (everything lives in SQLite already, so offline works for what exists).
- Matching and assertion-reason questions have answer entry but no special rendering.

## 4. Known bugs and rough edges
- Done tasks on Home are not struck through (style props not applied by `AppText`).
- Template-mock "ready" counts reshuffle on each render (counts stay correct).
- Release build depended on stale Gradle autolinking paths after the folder moved (fixed by clearing `android/build/generated/autolinking`).

## 5. Existing content (the central finding)
A freshly seeded install contains: 3 subjects, 4 chapters, 0 topics, 0 lessons, 0 formulas, 0 questions, 0 notes, 0 videos, 2 exam patterns (Main-style empty, Advanced sample unverified). **ORBIT currently ships tools for content, not content.** All academic material must be authored, imported, or supplied by the student and teacher, and each item carries a verification state.

## 6. Empty or placeholder modules
Topics, lessons, formulas, questions, notes, videos. These show honest empty states; none is presented as complete.

## 7. Content quality
Nothing shipped to judge. The pipeline enforces: unverified items are tagged, AI-generated items can never be self-verified (database policy), imports are idempotent and validated.

## 8. UI/UX weaknesses
Contrast-tested design tokens and 48dp targets exist, but screens are card lists with little visual identity, no illustrations, no roadmap, a single phone layout stretched on tablets, and the lesson reader is a collapsible list rather than a guided path.

## 9. Technical debt
`app/(tabs)/index.tsx` and several screens are large; question list queries do not paginate yet; no full-text index; no component tests (only logic and database tests); Maestro/e2e folder is empty.

## 10. Proposed improvements
See `docs/ORBIT_PRODUCT_GAP_ANALYSIS.md` for the ordered plan. Priority: provenance-carrying video and question catalogues, a truthful coverage report, then reader/roadmap/search UX, then ingestion.

## Tests
216 unit/integration tests (jest), 37 live-Postgres tests, 1 real-Supabase cloud suite. No UI automation.
