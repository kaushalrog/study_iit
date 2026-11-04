# Academic review workflow

## Two different things
| | Meaning | Who can do it | Effect |
|---|---|---|---|
| **Student check** | "I read this / the key matches my book / I watched the video" | Mahitha, in *Check material* | Lets a question join practice and mastery. **Not academic approval.** |
| **Academic approval** | A named academic reviewer judged the item correct, in syllabus and suitable | Only a reviewer on the authorised list, through an imported decision sheet | Shown as "Approved by NAME, DATE". Bound to the exact text reviewed: if the text changes afterwards it becomes *stale*. |

Automated checks (the audit script), AI-assistant notes, student feedback and video watching are recorded in each item's history as **evidence**. They never change the academic status.

## How a reviewer works
1. The account owner adds the reviewer's name in *Check material → Reviewer tools*. Until a name is listed nobody can approve anything.
2. Open `review/packets/<chapter>.md` (or share the packet from the app). Every item has a code such as `Q-79506b44`. Solve each question yourself before reading the key.
3. Fill in `review/packets/<chapter>.csv`: one row per code. Columns:
   - `decision`: `approved`, `rejected`, `needs_research`, `edited` (you changed it elsewhere) or `comment`. Leave blank to skip a row.
   - checks, each `pass`, `fail` or `na`: `correctness`, `syllabus`, `level`, `topic_mapping` (lessons, formulas, questions) and `url_ok`, `metadata_ok`, `topic_coverage`, `suitability`, `teaching_quality` (videos).
   - `feedback` (required for `rejected` and `needs_research`), `reviewer`, `reviewed_at` (e.g. 2026-11-20).
4. Paste the CSV into *Reviewer tools → Import decisions*. The import:
   - checks each row on its own and reports the ones it cannot use, with the line number and reason;
   - refuses a row if the content changed since the packet was made (export a new packet);
   - refuses `approved` when a check is `fail`, and refuses an unlisted reviewer;
   - never creates a duplicate: re-importing the same sheet adds nothing.
5. A `rejected` decision withdraws the item from the library (the reason stays in its history and in the totals). `needs_research` keeps it visible with the reviewer's note.

Videos have a separate checklist: `review/VIDEO_CHECKLIST.md`.

## What the history keeps
Every review is an append-only row: kind, record, decision, reviewer, role, checks, feedback, evidence text, the content hash that was reviewed, and the date. Edits to a lesson also store the previous text, so earlier versions can be recovered.

## Limits, stated plainly
- On the phone, the reviewer list is a setting; someone with the phone can change it. The protection is that approvals only count when the reviewer is on the list *and* has the `academic_reviewer` role.
- In the cloud (Supabase migration 0010), a row with role `academic_reviewer` is accepted only from an account listed in the `academic_reviewers` table, which only the project owner can edit with SQL. A student account cannot write it. This is tested against a real Postgres.
- Approvals are verified against content hashes, not signatures. ORBIT does not authenticate who a name on a CSV really is.
