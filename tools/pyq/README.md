# PYQ ingestion

A two-step, human-in-the-loop path from an official paper PDF to ORBIT. It never invents provenance and never labels anything verified.

Requires `pdftotext` (poppler) and Python 3.

```
python3 tools/pyq/pyq_extract.py extract paper.pdf --exam jee_main --year 2023 --session "25 Jan, Shift 1" --paper "Paper 1" --source-url <official URL> --license unknown -o review.json
# a person checks review.json: chapter, topic, type, the official answer, and sets "reviewed": true
python3 tools/pyq/pyq_extract.py bundle review.json -o bundles/
```
Then import `bundles/<chapter>.json` with the app's normal import screen. The questions arrive as *needs review*, classified as PYQs (exam, year, citation and URL are all present), counted as **unverified** until a person confirms them.

## What is left out of the bundle, and why
Questions that are not marked reviewed, have no chapter, have no official answer, have empty text, or have the wrong number of answers for their type. They are listed so nothing disappears silently.

## Sources and permissions
Use only papers and answer keys you may legitimately use: NTA's published JEE Main papers and keys, the JEE Advanced papers and keys published by the organising IIT, or material a teacher or publisher has given permission to use. Keep `--license unknown` unless you know the terms; the field exists so the reuse position is stored with each question. Do not scrape sites or copy commercial books.

## Limits
Extraction from PDFs is heuristic: figures, tables, chemical structures and two-column layouts will not extract cleanly and must be checked by eye. The synthetic fixtures in `tools/pyq/tests` are not exam questions. **No real paper has been processed yet; the PYQ count is zero.**
