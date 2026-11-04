"""Tests use a SYNTHETIC paper written for this test. It is not an exam question and is never imported anywhere."""
import os, sys, unittest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
import pyq_extract as p

SAMPLE = """
Synthetic Test Paper (not a real exam)

1. A ball is thrown upward. Which quantity is zero at the top?
   (1) speed
   (2) acceleration
   (3) mass
   (4) weight

2. Two numbers add to 10 and differ by 4. Find the larger number.

3. Which are even?
   (A) 2
   (B) 3
   (C) 4
   (D) 5
"""
SRC = {'exam': 'jee_main', 'year': 2023, 'session': '25 Jan, Shift 1', 'paper': 'Paper 1', 'sourceUrl': 'https://example.org/paper.pdf', 'license': 'unknown'}


class Parse(unittest.TestCase):
    def test_splits_questions_and_options(self):
        qs = p.parse_text(SAMPLE)
        self.assertEqual([q['number'] for q in qs], [1, 2, 3])
        self.assertEqual(qs[0]['options'], ['speed', 'acceleration', 'mass', 'weight'])
        self.assertEqual(qs[1]['options'], [])
        self.assertTrue(qs[1]['stem'].startswith('Two numbers add'))
        self.assertEqual(qs[2]['options'], ['2', '3', '4', '5'])


class Bundle(unittest.TestCase):
    def review(self, **over):
        qs = [{'number': 1, 'stem': 'Stem one', 'options': ['a', 'b', 'c', 'd'], 'type': 'single', 'chapter': 'Gravitation', 'topic': 'Escape velocity', 'difficulty': 'main', 'answer': 2, 'solution': '', 'reviewed': True},
              {'number': 2, 'stem': 'Stem two', 'options': [], 'type': 'integer', 'chapter': 'Gravitation', 'topic': '', 'difficulty': 'main', 'answer': '7', 'solution': '', 'reviewed': True},
              {'number': 3, 'stem': 'Not reviewed', 'options': [], 'type': 'integer', 'chapter': 'Gravitation', 'topic': '', 'difficulty': 'main', 'answer': '1', 'solution': '', 'reviewed': False},
              {'number': 4, 'stem': 'No answer', 'options': ['a', 'b'], 'type': 'single', 'chapter': 'Gravitation', 'topic': '', 'difficulty': 'main', 'answer': None, 'solution': '', 'reviewed': True},
              {'number': 5, 'stem': 'No chapter', 'options': ['a', 'b'], 'type': 'single', 'chapter': '', 'topic': '', 'difficulty': 'main', 'answer': 1, 'solution': '', 'reviewed': True},
              {'number': 6, 'stem': 'Two answers for single', 'options': ['a', 'b'], 'type': 'single', 'chapter': 'Gravitation', 'topic': '', 'difficulty': 'main', 'answer': [1, 2], 'solution': '', 'reviewed': True}]
        return {'source': {**SRC, **over}, 'questions': qs}

    def test_only_complete_reviewed_questions_are_bundled_with_full_provenance(self):
        bundles, skipped = p.build_bundles(self.review())
        items = bundles['Gravitation']['questions']
        self.assertEqual(len(items), 2)
        q1 = items[0]
        self.assertEqual((q1['origin'], q1['examCategory'], q1['examYear'], q1['correct']), ('official', 'jee_main', 2023, ['B']))
        self.assertEqual(q1['citation'], 'JEE Main, 2023, Paper 1, 25 Jan, Shift 1, Question 1')
        self.assertEqual(q1['citationUrl'], 'https://example.org/paper.pdf')
        self.assertEqual(q1['license'], 'unknown')
        self.assertEqual(items[1]['numeric'], 7.0)
        reasons = {s['question']: s['reason'] for s in skipped}
        self.assertEqual(sorted(reasons), [3, 4, 5, 6])
        self.assertIn('official answer', reasons[4])

    def test_refuses_papers_that_cannot_be_traced(self):
        for bad in ({'sourceUrl': ''}, {'year': 1800}, {'exam': 'made_up'}, {'license': 'free-for-all'}):
            bundles, skipped = p.build_bundles(self.review(**bad))
            self.assertEqual(bundles, {}); self.assertTrue(skipped)


if __name__ == '__main__':
    unittest.main()
