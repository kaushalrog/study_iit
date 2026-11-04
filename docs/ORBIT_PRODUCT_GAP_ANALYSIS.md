# ORBIT 2.0 gap analysis

Legend: **Done** works and is tested · **Partial** exists, incomplete · **Missing** not built · **Cannot be shipped by code** needs real human or licensed material.

| Requirement | Status | Notes |
|---|---|---|
| Subject → unit → chapter → topic hierarchy | Partial | subjects/chapters/topics exist; no "unit" or "subtopic" level, no stages |
| Lessons, formulas, notes | Partial | student-authored/imported; no shipped lessons; no reader with search/bookmarks/highlights |
| Worked examples, derivations, understanding checks | Partial | lesson sections exist; no structured example/check schema |
| Prerequisites between topics | Missing | needs `topic_prerequisites` |
| Curated YouTube lessons with verified URLs | Missing → building now | catalogue + verification workflow is implementable; **choosing and verifying videos is manual curation and must not be fabricated** |
| PYQ bank with exam/year/session/source | Partial → building now | `origin` and `source_note` exist; exam, year, session, citation, license do not |
| PDF ingestion for legitimate material | Missing | needs on-device extraction and a review queue |
| Reference-book practice library | Missing | can reuse the question model once provenance exists |
| Mock engine, marking, results | Done / Partial | patterns, scoring, results exist; blueprint-based difficulty balance and section navigation polish missing |
| Per-topic/chapter results analysis | Partial | subject split and mastery exist; chapter/difficulty/time analysis partial |
| Long-term roadmap independent of school grade | Missing | needs stages, prerequisites, readiness views |
| Planner, backlog, 28-day cycle | Done / Partial | no reminders |
| Error Book, revision | Done | |
| AI tutor with topic context, Telugu, scanning | Partial | client + function written, not deployed, no retrieval |
| Global search | Missing | SQLite FTS5 over chapters/topics/lessons/formulas/questions/videos |
| Coverage dashboard | Missing → building now | |
| Offline | Done for authored data | downloads manager not needed until remote content exists |
| Phone + tablet layouts | Partial | phone only |
| Security | Done | see audit |
| Verified question volume, authored lessons, curated videos | **Cannot be shipped by code** | volume depends on licensed/legitimate sources and subject-expert review |

## Order of work
1. Audit docs, then a **truthful coverage report** (per topic: explanation, formulas, notes, video, examples, practice, PYQ; per chapter: verified question counts).
2. **Video catalogue**: schema, validation (real YouTube ID/URL parsing), import, verification workflow (unverified until the student confirms; "last checked" date), topic-level display.
3. **Question provenance**: exam category, year, session, citation URL, licence; rule that "PYQ" requires an official source with a citation.
4. Then, as separate pieces of work: reader redesign + roadmap + tablet layouts; FTS search; ingestion; blueprint mocks; tutor retrieval and deployment.

Migration notes: all new columns are additive with defaults, so existing rows and synced data stay valid; Supabase gets matching migrations 0009+.
