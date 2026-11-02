# ORBIT design system

Direction: calm, editorial, premium. Swiss-style minimalism (from the ui-ux-pro-max skill's recommendation) in a warm ivory / deep navy / soft lavender palette. Tokens live in `src/components/design-system/theme.ts`; components in `index.tsx`. Screens must use tokens, never raw hex.

## Decisions vs. the skill's generated suggestion
| Skill suggested | Decision | Why |
|---|---|---|
| Indigo + orange accent | **Rejected.** Navy / lavender / sage / muted subject colours | Brief asks for a premium, non-childish, non-neon look |
| Baloo 2 / Comic Neue ("kids") | **Rejected.** Editorial serif for display, system sans for body | Student is 14; avoid childish type. No font downloads, so it works offline |
| "Avoid dark mode" | **Rejected.** Full dark theme | Dark mode is a requirement; each theme's contrast is tested separately |
| Minimalism & Swiss style | **Adopted** | Fits a dense study tool |
| Subtle motion, reduced-motion respected | **Adopted** | `FadeIn` and `Skeleton` render their end state under reduced motion |

## Tokens
- **Colour:** semantic roles only (`bg, surface, surfaceAlt, text, textMuted, primary, accent, accentStrong, success/warning/danger (+Tint), math/physics/chemistry (+Tint), controlBorder, track`). `tests/unit/theme.test.ts` asserts >= 4.5:1 for text and >= 3:1 for control borders in both themes.
- **Space:** 4/8 rhythm: xs 4, sm 8, md 16, lg 24, xl 32, xxl 48.
- **Type:** display 30, title 24, heading 18, body 16, caption 14, label 12 caps. Display/title/stat cap at 1.3x system text scale; body scales fully. Tab labels are fixed-size.
- **Touch:** minimum 48dp (`MIN_TOUCH`); small chips get `hitSlop`.
- **Icons:** one family (Ionicons), sizes sm 18 / md 22 / lg 28, outline when inactive and filled when active. Decorative icons are hidden from screen readers.
- **Motion:** 120 / 220 / 320 ms.

## Components
`Page` (adaptive gutters, 840px max width, system-bar clearance), `Card` (default / hero / subject / accent tones), `Button`, `Chip` (check mark when selected, so colour is never the only cue), `Tag`, `StatTile`, `ActionTile`, `ProgressBar`, `SectionHeader`, `EmptyState`, `ErrorState`, `LoadingState` + `Skeleton`, `FadeIn`, `Icon`, `SubjectDot`.

## Layout
Phone: single column. Tablet (>= 768dp): Home becomes hero + two columns. Keep `flexGrow + flexBasis` (not `flex: 1`) for tiles in wrapping rows.

## Verified on the Android emulator (API 28)
- Light, dark, 1.6x system text and tablet width (1600x2560 @ 280dpi): **Home**.
- Light mode, phone: Learn, Practice, Error Book, Progress, Add a question (form, validation, focus ring, save), Practice setup, the full practice flow (hint, wrong answer, feedback card, native submit dialog, result screen).
- Timed test on device: countdown pill, answer, mark for review, question list, submit dialog (mentions marked questions), result. **Crash recovery**: app force-killed mid-test, relaunched 45 s later → resume card, answer and mark restored, clock showed the true remaining time (deadline matched to the second). **Expiry while dead**: emulator clock moved 15 min past the deadline → Resume auto-submitted the saved answer, scored it, time capped at the allowed 10:00.
- Not yet verified: dark mode and large text on the screens other than Home; multi-question timed tests (only 1 question was in the bank); add-a-mistake with camera or photo import; tutor chat; record-result form; landscape phone; iOS; real devices; TalkBack traversal order.
