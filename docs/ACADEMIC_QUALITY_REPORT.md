# Academic quality report

Generated 2026-11-05 from the database after loading the starter library. Counts are read from the data, not typed in. **No item has been academically approved: no authorised reviewer has reviewed anything yet.**

## Records
| Kind | Total | Academically approved | Student-checked | Rejected | Needs research | Stale | Not yet academically reviewed |
|---|---|---|---|---|---|---|---|
| Lessons | 170 | 0 | 0 | 0 | 0 | 0 | 170 |
| Formulas | 47 | 0 | 0 | 0 | 0 | 0 | 47 |
| Generated questions | 82 | 0 | 0 | 0 | 0 | 0 | 82 |
| Videos | 19 | 0 | 0 | 0 | 0 | 0 | 19 |
| **All** | **318** | **0** | **0** | **0** | **0** | **0** | **318** |

(The brief's "50 worked examples" are 50 of the 170 lessons, those of section type worked example. The brief's "45 formulas" is now 47: one chained double-angle formula was split into three correct ones.)

## What was done in this review pass
- **Independent automated checks:** 55 checks (content/audit/audit.py) on 39 formulas and 12 questions, using different methods from the authoring scripts (brute-force scans, numerical integration of motion, simulation of rate laws, dimension analysis, random-point identity tests). Failures: 0.
- **AI read-through (not an academic review):** all 82 generated questions were re-read and solved by hand; no error found. Formulas were audited for expression, variables, conditions and units; metadata was incomplete on many and was fixed. Lessons were **not** read line by line: two factual claims were corrected (a wrong comparison for the size of gravitational force, and the strength of gravity at the space station).
- **Corrections shipped:** 2 lessons rewritten, 1 formula split into 3, variable definitions and units completed on the gravitation and kinetics formulas. Devices that loaded the earlier pack receive the corrections when the pack is loaded again; superseded lessons are withdrawn unless someone already confirmed them.

## Question validation status
- Questions with an independent automated check: 12 of 82. Domain-type questions (three) are now checked by scanning for where the function is defined; the "number of solutions" and "greatest term" questions by brute force; the shell-theorem, maximum-height, period and half-life questions by numerical simulation.
- Questions with **no second, independent computation**: 70. Their keys were recomputed once while the questions were written (same author, so not independent) and were solved again by hand in the AI read-through. Definition, conceptual and recall items among them rest on that and on a human reviewer:
  - The value of $\sin^{-1}\!\left(-\tfrac{1}{2}\right)$ is
  - The value of $\cos^{-1}\!\left(-\tfrac{1}{2}\right)$ is
  - The value of $\cot^{-1}(-\sqrt3)$ is (use the range $(0,\pi)$)
  - $\sin^{-1}\tfrac{3}{5}+\cos^{-1}\tfrac{3}{5}$ equals
  - $\tan^{-1}3+\cot^{-1}3$ equals
  - If $\sin^{-1}a+\sin^{-1}b+\sin^{-1}c=\tfrac{3\pi}{2}$, find $a^2+b^2+c^2$.
  - The range of $f(x)=\sin^{-1}x+\cos^{-1}x+\tan^{-1}x$ for $x\in[-1,1]$ has maximum
  - Which of the following are correct?
  - $\sin^{-1}(\sin 4)$ (in radians) equals
  - $\sin^{-1}(\sin 10)$ (in radians) equals
  - $\sin\!\left(\cos^{-1}\tfrac{5}{13}\right)$ equals
  - $\tan^{-1}\tfrac{1}{2}+\tan^{-1}\tfrac{1}{3}$ equals
  - $\tan^{-1}2+\tan^{-1}3$ equals
  - If $\tan^{-1}\tfrac13+\tan^{-1}\tfrac15+\tan^{-1}\tfrac17+\tan^{-1}\tfrac18=k\cdot\tfrac{\pi}{4}$, find $k$.
  - $\tan^{-1}1+\tan^{-1}2+\tan^{-1}3$ equals
  - The coefficient of $x^2$ in the expansion of $(1+x)^6$ is
  - The number of terms in the expansion of $(2x-3y)^{9}$ is
  - The sum of the coefficients in the expansion of $(3x-2)^4$ is
  - The coefficient of $x$ in the expansion of $(2x-3)^3$ is
  - $(\sqrt3+1)^4+(\sqrt3-1)^4$ equals
  - Find the term independent of $x$ in $\left(x^2+\dfrac1x\right)^{9}$.
  - Find the coefficient of $x^3$ in $\left(2x^2-\dfrac3x\right)^{6}$.
  - The middle term of $\left(x+\dfrac1x\right)^{10}$ is
  - The 4th term in the expansion of $(x-2y)^7$ has coefficient
  - If the coefficients of three consecutive terms in $(1+x)^n$ are in the ratio $1:7:42$, find $n$.
  - The coefficient of $x^{10}$ in $\left(x^2+\dfrac1x\right)^{9}$ is
  - $\binom{10}{0}+\binom{10}{1}+\dots+\binom{10}{10}$ equals
  - $\sum_{r=0}^{10}r\binom{10}{r}$ equals
  - $\sum_{r=0}^{5}\binom5r^2$ equals
  - Find $\binom{20}{0}+\binom{20}{2}+\binom{20}{4}+\dots+\binom{20}{20}$ divided by $2^{15}$.
  - Which of the following equal $\binom{12}{5}$?
  - The greatest coefficient in the expansion of $(1+x)^{12}$ is $\binom{12}{r}$. Find $r$.
  - The remainder when $7^{103}$ is divided by $25$ is
  - The last two digits of $11^{10}$ are
  - The remainder when $3^{50}$ is divided by $8$ is
  - The distance between two masses is doubled and one mass is also doubled. The force becomes
  - Two masses $M$ and $4M$ are $3$ m apart. The gravitational field is zero at a distance (from $M$, on the line 
  - Four equal masses $m$ at the corners of a square of side $a$. The net force on one is
  - At what height above the surface is $g$ equal to $\tfrac14$ of its surface value?
  - At a depth $d=R/2$ the value of $g$ (uniform Earth) is
  - For small height $h$ the fractional decrease in $g$ is approximately
  - The escape velocity from Earth is closest to
  - A planet has $\tfrac14$ of Earth’s mass and $\tfrac14$ of Earth’s radius. Its escape velocity is
  - A body leaves Earth with speed $2v_e$. Its speed far away is
  - The energy needed to raise $1$ kg from the surface to height $R$ is closest to
  - The orbital speed of a satellite close to Earth’s surface is about
  - The total energy of a satellite is $-4\times10^9$ J. Its kinetic energy is
  - A satellite in circular orbit loses energy slowly to atmospheric drag. Its speed
  - A satellite moves to an orbit of twice the radius. Which statements are correct?
  - A satellite’s circular-orbit speed is increased by a factor $\sqrt{n}$ so that it just escapes. Find $n$.
  - For $2N_2O_5\to4NO_2+O_2$, if $N_2O_5$ disappears at $6.0\times10^{-3}$ M s⁻¹, $O_2$ forms at
  - The rate of a reaction is $k[A]^2[B]$. If the volume is reduced to $\tfrac13$ the rate changes by a factor of
  - For a reaction, doubling $[A]$ raises the rate $4$ times and doubling $[B]$ doubles the rate. The overall orde
  - A mechanism has a fast reversible step $2NO\rightleftharpoons N_2O_2$ followed by a slow step $N_2O_2+O_2\to2N
  - Which statements about order and molecularity are correct?
  - A first-order reaction is $75\%$ complete in $32$ minutes. Its half-life in minutes is
  - The half-life of a zero-order reaction with $k=2.5\times10^{-4}$ mol L⁻¹ s⁻¹ and $[A]_0=0.10$ M is
  - For a first-order reaction $k=0.0693$ min⁻¹. The time for $75\%$ completion is
  - The time for $99.9\%$ completion of a first-order reaction is $x$ times its half-life. Find $x$ (nearest integ
  - For $A(g)\to B(g)+C(g)$ (first order) the initial pressure is $100$ mm Hg and the total pressure after $10$ mi
  - The half-life is $20$ min at $0.10$ M and $40$ min at $0.05$ M. The order is
  - A plot of $\ln[A]$ against $t$ is a straight line. The reaction is
  - The half-life of a reaction is directly proportional to the initial concentration. The order is
  - For a reaction $t_{1/2}$ is $100$ s at $[A]_0=0.8$ M and $50$ s at $0.4$ M. The order is
  - The slope of a plot of $\ln k$ against $1/T$ equals
  - The rate constant doubles when $T$ rises from $300$ K to $310$ K. $E_a$ in kJ mol⁻¹ is closest to
  - At $300$ K, $k=1.0\times10^{-3}$ s⁻¹ and $E_a=50$ kJ mol⁻¹. $k$ at $320$ K (s⁻¹) is closest to
  - A catalyst lowers $E_a$ from $75$ to $60$ kJ mol⁻¹ at $300$ K. The rate constant increases by a factor of abou
  - Which statements about a catalyst are correct?
  - A reaction has $E_{a,\text{forward}}=95$ and $E_{a,\text{reverse}}=70$ kJ mol⁻¹. $\Delta H$ in kJ mol⁻¹ is
- **Difficulty labels** were not independently validated. **Topic mapping** looked consistent on read-through.
- Formulas without an automated check (reasoned only): 8 – Principal value of the inverse sine; Principal value of the inverse cosine; Principal value of the inverse tangent; Principal range of the inverse cotangent; Rate of a reaction; Rate law; Units of the rate constant; Arrhenius equation.

## Video review status
19 videos. Machine-confirmed: the link exists (YouTube oEmbed, 2026-11-04) and the title and channel are as recorded. **Not done: watching them.** Topic coverage, suitability, teaching quality and level are unreviewed; no durations are stored (no source for them was available). The checklist is review/VIDEO_CHECKLIST.md. A video watched or ticked by the student is not academic verification.

## PYQs
**0** authentic PYQs. The extraction and bundling tool is ready (tools/pyq) and tested on a synthetic file; no official paper has been processed.

## Topic coverage (records present, all unverified)
| Chapter | Topic | Explanation lessons | Worked examples | Formulas | Practice questions | Videos | PYQs |
|---|---|---|---|---|---|---|---|
| Inverse Trigonometry | Definition, domain, range and principal values | 3 | 4 | 4 | 0 | 3 | 0 |
| Inverse Trigonometry | Properties and identities | 3 | 4 | 4 | 0 | 0 | 0 |
| Inverse Trigonometry | Simplifying f⁻¹(f(x)) expressions | 3 | 3 | 2 | 0 | 1 | 0 |
| Inverse Trigonometry | Sums of inverse tangents and equations | 3 | 3 | 4 | 0 | 0 | 0 |
| Binomial Theorem | Binomial expansion and Pascal’s triangle | 3 | 3 | 2 | 0 | 0 | 0 |
| Binomial Theorem | General term and middle term | 3 | 3 | 3 | 0 | 2 | 0 |
| Binomial Theorem | Properties of binomial coefficients | 3 | 3 | 5 | 0 | 0 | 0 |
| Binomial Theorem | Greatest term and applications | 3 | 3 | 1 | 0 | 1 | 0 |
| Gravitation | Newton's law of gravitation and the gravitational field | 3 | 3 | 2 | 0 | 0 | 0 |
| Gravitation | Acceleration due to gravity and its variation | 3 | 3 | 4 | 0 | 0 | 0 |
| Gravitation | Gravitational potential energy and escape velocity | 3 | 3 | 2 | 0 | 1 | 0 |
| Gravitation | Satellites and Kepler's laws | 3 | 3 | 3 | 0 | 3 | 0 |
| Chemical Kinetics | Rate of reaction, rate law, order and molecularity | 3 | 3 | 3 | 0 | 0 | 0 |
| Chemical Kinetics | Integrated rate equations and half-life | 3 | 3 | 5 | 0 | 3 | 0 |
| Chemical Kinetics | Determining the order of a reaction | 3 | 3 | 1 | 0 | 1 | 0 |
| Chemical Kinetics | Temperature, collision theory and the Arrhenius equation | 3 | 3 | 2 | 0 | 2 | 0 |

Missing content (see docs/CHAPTER_EXPANSION_PLAN.md): graphs and diagrams everywhere, PYQs, Telugu versions, licensed reference questions, and the subtopics listed in the expansion plan. The comparison with the official syllabus is **not done**: the official PDFs could not be retrieved.

## UI testing
Tested on an Android emulator (phone size): Learn, chapter, topic reader tabs (Overview, Understand, Worked examples, Videos, Practice, PYQs, My notes, Revise), Check material, Reviewer tools, Coverage, Roadmap, Search; markdown markers hidden, mathematical notation readable; data persisted after the app was force-stopped. **Not done:** a real phone, a real tablet, diagrams (none exist), and a full dark-mode pass. A tablet-sized emulator showed the phone layout centred with wide margins: there is no tablet-specific layout yet.

## Test results
Run on 2026-11-05. **jest (unit, integration, tools): 286 passed, 0 failed** (53 skipped are the live-Postgres and real-Supabase suites, which need their own environment). **Live Postgres: 43 passed** (schema contract, row-level security including the reviewer-only rule). **PYQ tool (Python): 3 passed.** **Audit script: 55 checks, 0 failures.** The real-Supabase cloud suite was not re-run in this pass. APK built and installed on an emulator only; no real phone or tablet.
