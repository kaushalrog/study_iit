# Content coverage report (starter library, 2026-11-04)

Counts are taken from a freshly migrated database after loading the starter library, not typed in by hand. Re-run the import test (`tests/integration/content-pack.test.ts`) to reproduce them.

| Chapter | Topics | Lessons | Worked examples | Derivations | Quick-revision summaries | Common-mistake sheets | Formulas | Practice questions | Videos |
|---|---|---|---|---|---|---|---|---|---|
| Inverse Trigonometry | 4 | 44 | 14 | 4 | 4 | 4 | 12 | 19 | 4 |
| Binomial Theorem | 4 | 42 | 12 | 4 | 4 | 4 | 11 | 21 | 4 |
| Gravitation | 4 | 42 | 12 | 4 | 4 | 4 | 11 | 20 | 4 |
| Chemical Kinetics | 4 | 42 | 12 | 4 | 4 | 4 | 11 | 22 | 7 |
| **Total** | **16** | **170** | **50** | **16** | **16** | **16** | **45** | **82** | **19** |

Practice questions by difficulty: 23 foundation, 39 main, 20 advanced. By type: 58 single-correct, 5 multi-correct, 19 integer.

## What is NOT in the library
- **Authentic PYQs: 0.** No previous-year question has been imported. Retrieving official papers and answer keys and transcribing them without errors needs the source PDFs and a person to check each transcription; the bulk importer, provenance fields and the PYQ rule (exam, year and citation required) are ready for them.
- **Licensed reference-book questions: 0.** **Student-supplied questions: 0.**
- **Personal notes: 0** (these are written by the student). Detailed topic notes are the lesson records; revision notes are the "Quick revision" sections; formula sheets are the formula records.
- **Diagrams and graphs: 0.** Descriptions of graphs are in the text only.
- **Telugu versions: 0.**
- **Verified items: 0.** Everything arrives as *needs review*. The "Check material" screen confirms items one at a time.

## Status of each kind of material
| Kind | Status | How it was checked |
|---|---|---|
| Lessons, derivations, examples | Needs review | Worked-example answers recomputed numerically; wording and teaching order not reviewed by a teacher |
| Formulas | Needs review | Conditions stated; several identities confirmed numerically |
| Practice questions | Needs review, origin *generated* | Answer keys recomputed in code where the answer is a number or a truth-value; domain-type and conceptual keys checked by reasoning only |
| Videos | Needs review | Existence, title and channel confirmed through YouTube oEmbed. Relevance judged from the title only. **No one has watched them.** Durations not recorded |

## Syllabus scope
The four chapters map to the official JEE syllabus areas (Trigonometry – inverse trigonometric functions; Algebra – binomial theorem for a positive integral index; Mechanics – gravitation; Physical Chemistry – chemical kinetics). The official syllabus PDFs could not be retrieved from NTA or the JEE Advanced site in this session (the pages returned an error or only third-party summaries), so topic boundaries are a **provisional crosswalk**, not a quotation of the official text. Mahitha's exact Chaitanya IPL scope for these chapters is unknown and is not claimed.

## Completeness
No chapter is complete. Each has four topics covering the core of the chapter. Missing, for example, are: inverse trigonometric graphs and derivatives (the latter belong to calculus), binomial expansions for negative or fractional index (outside the official statement), Kepler-law derivations from angular momentum beyond the sketch given, and for kinetics: complex reactions (parallel, consecutive, reversible), photochemical reactions, and Lindemann theory.
