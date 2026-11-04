# ORBIT starter content

Four chapters of original teaching material in the bulk-import JSON format that the app already understands (`src/features/syllabus/importBundle.ts`), plus an optional `videos` list and optional question provenance fields.

| File | Built from |
|---|---|
| `inverse-trigonometry.json` | `src/inverse_trig.py` |
| `binomial-theorem.json` | `src/binomial.py` |
| `gravitation.json` | `src/gravitation.py` |
| `chemical-kinetics.json` | `src/kinetics.py` |

Rebuild and re-check: `for f in inverse_trig binomial gravitation kinetics; do python3 content/src/$f.py; done`

**What the build checks.** Every worked-example answer and every multiple-choice, multi-select and integer answer key is recomputed in Python (`math`, brute-force polynomial expansion, `comb`, simulations of the numerically-greatest-term rule) and the build stops if a key does not match. Domain-type questions and conceptual ones (such as "which statements about a catalyst are correct") are checked by reasoning, not by computation, and need a human reader.

**What it does not check.** That the explanations are the best way to teach the topic, that the scope matches the Chaitanya IPL scheme, or that the videos are good. Those need a teacher.

**Status of everything here.** Imported as `needs_review` with a source note. Questions are labelled `generated` and are never PYQs. Videos record the title and channel returned by YouTube's oEmbed service on 2026-11-04; nobody has watched them, and no durations are stored.

In the app: Learn tab → *Load the starter library*, then *Check material* to confirm items one at a time.
