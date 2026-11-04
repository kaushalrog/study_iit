#!/usr/bin/env python3
"""
Turn a legitimately obtained exam paper (a PDF you are allowed to use) into a REVIEW file, then into an ORBIT import bundle.

    # 1. Extract candidate questions to a review file. Nothing here is trusted.
    python3 tools/pyq/pyq_extract.py extract paper.pdf --exam jee_main --year 2023 --session "25 Jan, Shift 1" \
        --paper "Paper 1" --source-url https://example.org/official/paper.pdf --license unknown -o review.json

    # 2. A person opens review.json, assigns chapter/topic, copies the official answer for each question, checks the text
    #    against the PDF, and sets "reviewed": true on every question that is ready.

    # 3. Build an importer bundle (only reviewed questions with an answer and a chapter are included).
    python3 tools/pyq/pyq_extract.py bundle review.json -o bundles/

Rules enforced here: every question keeps exam, year, session, paper, question number and source URL; questions with no
official answer or no chapter are left out of the bundle and listed; nothing is ever labelled verified (the app imports
them as "needs review"); generated questions are not accepted into this path.
"""
import argparse, json, os, re, subprocess, sys

EXAMS = {'jee_main': 'JEE Main', 'jee_advanced': 'JEE Advanced', 'other_official': 'Other official exam'}
LICENSES = {'open', 'permission', 'personal_use', 'unknown'}


def pdf_to_text(path):
    out = subprocess.run(['pdftotext', '-layout', path, '-'], capture_output=True, text=True)
    if out.returncode != 0:
        sys.exit('pdftotext failed: ' + out.stderr.strip())
    return out.stdout


Q_START = re.compile(r'^\s*(?:Q(?:uestion)?\.?\s*)?(\d{1,3})\s*[.)]\s+(?=\S)', re.I)
OPT = re.compile(r'^\s*\(?([A-Da-d1-4])\)?[.)]\s+(.*)$')


def parse_text(text):
    """Split paper text into candidate questions. Heuristic: a line that starts with a number and a dot or bracket begins one."""
    questions, cur = [], None
    for raw in text.splitlines():
        line = raw.rstrip()
        if not line.strip():
            if cur: cur['_lines'].append('')
            continue
        m = Q_START.match(line)
        if m and (cur is None or int(m.group(1)) == cur['number'] + 1 or int(m.group(1)) == 1):
            if cur: questions.append(cur)
            cur = {'number': int(m.group(1)), '_lines': [line[m.end():]]}
        elif cur is not None:
            cur['_lines'].append(line.strip())
    if cur: questions.append(cur)
    out = []
    for q in questions:
        stem, opts = [], []
        for ln in q['_lines']:
            mo = OPT.match(ln)
            if mo: opts.append(mo.group(2).strip())
            elif opts and ln: opts[-1] += ' ' + ln
            elif ln: stem.append(ln)
        out.append({'number': q['number'], 'stem': ' '.join(stem).strip(), 'options': opts})
    return out


def extract(args):
    text = pdf_to_text(args.pdf)
    qs = parse_text(text)
    review = {
        'source': {'exam': args.exam, 'year': args.year, 'session': args.session, 'paper': args.paper, 'sourceUrl': args.source_url, 'license': args.license, 'file': os.path.basename(args.pdf)},
        'note': 'Candidate extraction. Check every question against the PDF. Fill chapter, topic, type, answer (from the OFFICIAL answer key), then set reviewed=true.',
        'questions': [{'number': q['number'], 'stem': q['stem'], 'options': q['options'], 'type': 'single' if q['options'] else 'integer',
                       'chapter': '', 'topic': '', 'difficulty': 'main', 'answer': None, 'solution': '', 'reviewed': False} for q in qs],
    }
    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(review, f, ensure_ascii=False, indent=1)
    print(f'{len(qs)} candidate questions written to {args.output}. None is usable until a person reviews it.')


def citation(src, n):
    parts = [EXAMS[src['exam']], str(src['year'])]
    if src.get('paper'): parts.append(src['paper'])
    if src.get('session'): parts.append(src['session'])
    return ', '.join(parts) + f', Question {n}'


def build_bundles(review):
    src = review['source']
    problems = []
    if src['exam'] not in EXAMS: problems.append('Unknown exam category.')
    if not (1990 <= int(src['year']) <= 2100): problems.append('Implausible year.')
    if not src.get('sourceUrl'): problems.append('A source URL is required so every question can be traced.')
    if src.get('license') not in LICENSES: problems.append('license must be one of ' + ', '.join(sorted(LICENSES)))
    if problems: return {}, [{'question': None, 'reason': p} for p in problems]
    by_chapter, skipped = {}, []
    for q in review['questions']:
        n = q['number']
        if not q.get('reviewed'): skipped.append({'question': n, 'reason': 'not marked reviewed'}); continue
        if not q.get('chapter'): skipped.append({'question': n, 'reason': 'no chapter'}); continue
        if q.get('answer') in (None, '', []): skipped.append({'question': n, 'reason': 'no official answer recorded'}); continue
        if not q.get('stem', '').strip(): skipped.append({'question': n, 'reason': 'empty question text'}); continue
        item = {'type': q['type'], 'difficulty': q.get('difficulty', 'main'), 'stem': q['stem'], 'explanation': q.get('solution', ''), 'origin': 'official',
                'examCategory': src['exam'], 'examYear': int(src['year']), 'session': ' / '.join(x for x in (src.get('paper'), src.get('session')) if x),
                'citation': citation(src, n), 'citationUrl': src['sourceUrl'], 'license': src['license'], 'source': citation(src, n)}
        if q.get('topic'): item['topic'] = q['topic']
        if q['type'] == 'integer':
            try: item['numeric'] = float(q['answer'])
            except (TypeError, ValueError): skipped.append({'question': n, 'reason': 'integer/numeric question needs a number as its answer'}); continue
        else:
            ans = q['answer'] if isinstance(q['answer'], list) else [q['answer']]
            keys = 'ABCDEF'
            ans = [keys[int(a) - 1] if str(a).isdigit() else str(a).upper() for a in ans]   # official keys often use 1-4
            if q['type'] == 'single' and len(ans) != 1: skipped.append({'question': n, 'reason': 'single-correct question needs exactly one answer'}); continue
            item.update({'options': q['options'], 'correct': ans})
        by_chapter.setdefault(q['chapter'], []).append(item)
    return {ch: {'chapter': ch, 'topics': sorted({i['topic'] for i in items if i.get('topic')}), 'questions': items} for ch, items in by_chapter.items()}, skipped


def bundle(args):
    review = json.load(open(args.review, encoding='utf-8'))
    bundles, skipped = build_bundles(review)
    os.makedirs(args.output, exist_ok=True)
    for ch, b in bundles.items():
        name = re.sub(r'[^a-z0-9]+', '-', ch.lower()).strip('-')
        with open(os.path.join(args.output, f'{name}.json'), 'w', encoding='utf-8') as f: json.dump(b, f, ensure_ascii=False, indent=1)
    print(f'{sum(len(b["questions"]) for b in bundles.values())} questions bundled; {len(skipped)} left out:')
    for s in skipped: print('  -', s['question'], s['reason'])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    e = sub.add_parser('extract'); e.add_argument('pdf'); e.add_argument('--exam', required=True, choices=sorted(EXAMS)); e.add_argument('--year', required=True, type=int)
    e.add_argument('--session', default=''); e.add_argument('--paper', default=''); e.add_argument('--source-url', required=True); e.add_argument('--license', default='unknown', choices=sorted(LICENSES)); e.add_argument('-o', '--output', required=True)
    b = sub.add_parser('bundle'); b.add_argument('review'); b.add_argument('-o', '--output', required=True)
    a = ap.parse_args()
    {'extract': extract, 'bundle': bundle}[a.cmd](a)


if __name__ == '__main__':
    main()
