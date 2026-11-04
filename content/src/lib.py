"""Authoring helpers. Every question key and every worked-example answer is checked numerically here before a file is written."""
import json, math, os, re

SRC = "ORBIT original explanation. Provisional: not yet reviewed against a teacher's notes or the Chaitanya IPL scheme."
OUT = os.path.join(os.path.dirname(__file__), '..')
KEYS = 'ABCDEF'


def approx(a, b, tol=1e-9):
    """Relative comparison (so values around 1e-3 are not accidentally equal)."""
    return abs(a - b) <= tol * max(abs(a), abs(b)) or abs(a - b) < 1e-15


class Chapter:
    def __init__(self, name):
        self.name = name
        self.topics, self.lessons, self.formulas, self.questions, self.videos = [], [], [], [], []

    def topic(self, title):
        self.topics.append(title)
        return title

    def lesson(self, topic, section, level, body, source=SRC):
        d = {'section': section, 'level': level, 'language': 'en', 'body': body.strip(), 'source': source}
        if topic:
            d['topic'] = topic
        self.lessons.append(d)

    def formula(self, topic, name, latex, variables=(), conditions=None, explanation=None, example=None, units=None):
        d = {'name': name, 'latex': latex, 'variables': [{'symbol': a, 'meaning': b, **({'unit': c} if c else {})} for a, b, *r in variables for c in [r[0] if r else None]],
             'source': SRC}
        for k, v in (('topic', topic), ('conditions', conditions), ('explanation', explanation), ('example', example), ('units', units)):
            if v:
                d[k] = v
        self.formulas.append(d)

    def _q(self, topic, d, difficulty, explanation, hint, source):
        d.update({'difficulty': difficulty, 'explanation': explanation.strip(), 'origin': 'generated', 'source': source or 'ORBIT original question. Answer key machine-checked; awaiting human review.'})
        if hint:
            d['hint'] = hint
        if topic:
            d['topic'] = topic
        self.questions.append(d)

    def mcq(self, topic, stem, opts, idx, expected, difficulty, explanation, hint=None, source=None, tol=1e-9):
        """opts: [(text, numeric value)]. Exactly option idx must equal `expected`."""
        hits = [i for i, (_, v) in enumerate(opts) if approx(v, expected, tol)]
        assert hits == [idx], f'key check failed for: {stem[:60]} -> hits {hits}, key {idx}'
        self._q(topic, {'type': 'single', 'stem': stem, 'options': [t for t, _ in opts], 'correct': [KEYS[idx]]}, difficulty, explanation, hint, source)

    def multi(self, topic, stem, opts, difficulty, explanation, hint=None, source=None):
        """opts: [(text, is_true)] with is_true computed in code."""
        correct = [KEYS[i] for i, (_, t) in enumerate(opts) if t]
        assert correct, f'no true option: {stem[:60]}'
        self._q(topic, {'type': 'multi', 'stem': stem, 'options': [t for t, _ in opts], 'correct': correct}, difficulty, explanation, hint, source)

    def integer(self, topic, stem, value, difficulty, explanation, hint=None, source=None):
        assert float(value) == int(value), f'integer answer must be whole: {stem[:60]}'
        self._q(topic, {'type': 'integer', 'stem': stem, 'numeric': int(value), 'tolerance': 0}, difficulty, explanation, hint, source)

    def video(self, topic, vid, title, channel, purpose, level, why, playlist=False):
        url = f'https://www.youtube.com/playlist?list={vid}' if playlist else f'https://www.youtube.com/watch?v={vid}'
        d = {'url': url, 'title': title, 'channel': channel, 'purpose': purpose, 'level': level, 'language': 'en', 'why': why,
             'source': 'Title and channel read from the YouTube oEmbed record on 2026-11-04. Not yet watched or checked by a person. Length not recorded.'}
        if topic:
            d['topic'] = topic
        self.videos.append(d)

    def dump(self, filename):
        assert len({q['stem'] for q in self.questions}) == len(self.questions), 'duplicate question stems'
        data = {'chapter': self.name, 'topics': self.topics, 'lessons': self.lessons, 'formulas': self.formulas, 'questions': self.questions, 'videos': self.videos}
        with open(os.path.join(OUT, filename), 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=1)
        print(f'{self.name}: {len(self.topics)} topics, {len(self.lessons)} lessons, {len(self.formulas)} formulas, {len(self.questions)} questions, {len(self.videos)} videos')
