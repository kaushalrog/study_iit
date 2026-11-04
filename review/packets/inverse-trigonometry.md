# Academic review packet: Inverse Trigonometry

Generated 2026-11-05. Subject: math.

**What this is.** Original explanations, formulas, practice questions and video links written for ORBIT. None of it has been academically reviewed. Please read each item, solve each question yourself before looking at the key, and record a decision in the companion CSV (one row per item, identified by the code shown in each heading).

**Decisions:** `approved` · `rejected` · `needs_research` · `edited` (you changed it elsewhere) · `comment`. For each check use `pass`, `fail` or `na`. Add feedback for anything that is not a plain pass.

**Please also judge:** whether the explanation skips reasoning, whether prerequisites are right, whether each topic and question is inside the intended syllabus, and whether the difficulty label reflects the reasoning needed.

**Scope caution.** The topic list is ORBIT's provisional crosswalk to the JEE syllabus, not the Chaitanya IPL scheme.

## Chapter overview

### [L-7d5432e6] introduction (foundation)

**Where this chapter sits.** Trigonometry asks: given an angle, what is the ratio? Inverse trigonometry reverses the question: given a ratio, what is the angle? If $\sin\theta = \tfrac12$, then $\theta = \tfrac{\pi}{6}$ is one answer, but so are $\tfrac{5\pi}{6}$, $\tfrac{13\pi}{6}$ and infinitely many more. A function must give exactly one output, so we agree on one standard answer (the "principal value") and build the inverse functions around that agreement.

**Prerequisites.** (1) Trigonometric ratios of 0, 30, 45, 60, 90 degrees and their values in all four quadrants. (2) What a function, domain and range are. (3) What "one-one" and "onto" mean, and that only a bijection has an inverse. (4) Radian measure. If any of these feels shaky, revise it first: this chapter is mostly careful bookkeeping of intervals.

**What you will be able to do.** Evaluate expressions like $\cos^{-1}(-\tfrac12)$ without guessing; find the domain and range of expressions containing inverse trigonometric functions; simplify $\sin^{-1}(\sin x)$ for any $x$; combine inverse tangents; and solve equations without keeping false roots.

### [L-aeee0c00] why it matters (main)

Inverse trigonometric functions appear in JEE Main and Advanced in three ways: direct evaluation and simplification (almost always involving principal values), domain and range questions that combine them with logarithms and quadratics, and integration and differentiation later (for example $\int \frac{dx}{1+x^2} = \tan^{-1}x + C$). In physics they appear whenever you need an angle from a ratio, such as the angle of a resultant vector or the launch angle for a given range. The chapter is short, but almost every mark is lost to the same few causes: forgetting the principal range, ignoring the condition $xy<1$, or keeping an extraneous root. The four topics below are ordered to remove those causes one at a time.

**Syllabus note.** (The official syllabus PDF could not be retrieved when this was written, so the wording below comes from published summaries and has not been checked against it.) Published summaries of the JEE syllabus list inverse trigonometric functions under Trigonometry. The topic split here is ORBIT's own provisional crosswalk. The Chaitanya IPL scheme for the school year may order or group these differently, so confirm the exact scope with her teacher.

### [Q-6c375753] Question (single, foundation, origin: generated)

The value of $\sin^{-1}\!\left(-\tfrac{1}{2}\right)$ is

   A. $-\tfrac{\pi}{6}$
   B. $\tfrac{\pi}{6}$
   C. $\tfrac{7\pi}{6}$
   D. $\tfrac{11\pi}{6}$

**Key:** A
**Solution:** Sine inverse is odd and its range is $[-\tfrac{\pi}{2},\tfrac{\pi}{2}]$, so the answer is $-\tfrac{\pi}{6}$.

### [Q-e5cca369] Question (single, foundation, origin: generated)

The value of $\cos^{-1}\!\left(-\tfrac{1}{2}\right)$ is

   A. $-\tfrac{\pi}{3}$
   B. $\tfrac{\pi}{3}$
   C. $\tfrac{2\pi}{3}$
   D. $\tfrac{4\pi}{3}$

**Key:** C
**Solution:** $\cos^{-1}(-x)=\pi-\cos^{-1}x=\pi-\tfrac{\pi}{3}=\tfrac{2\pi}{3}$, which is in $[0,\pi]$.

### [Q-175d1bc6] Question (single, foundation, origin: generated)

The value of $\cot^{-1}(-\sqrt3)$ is (use the range $(0,\pi)$)

   A. $-\tfrac{\pi}{6}$
   B. $\tfrac{\pi}{6}$
   C. $\tfrac{5\pi}{6}$
   D. $\tfrac{2\pi}{3}$

**Key:** C
**Solution:** $\cot\tfrac{5\pi}{6}=-\sqrt3$ and $\tfrac{5\pi}{6}\in(0,\pi)$.

### [Q-187491f4] Question (integer, advanced, origin: generated)

The number of integers in the domain of $f(x)=\sin^{-1}\!\left(\log_2\dfrac{x}{2}\right)$ is

**Key:** 4
**Solution:** The domain is $[1,4]$, containing the integers $1,2,3,4$.

### [Q-8b5040e9] Question (single, foundation, origin: generated)

$\sin^{-1}\tfrac{3}{5}+\cos^{-1}\tfrac{3}{5}$ equals

   A. $\tfrac{\pi}{2}$
   B. $\pi$
   C. $\tfrac{3}{5}$
   D. $0$

**Key:** A
**Solution:** The complementary pair adds to a right angle.

### [Q-33c428eb] Question (single, foundation, origin: generated)

$\tan^{-1}3+\cot^{-1}3$ equals

   A. $\tfrac{\pi}{2}$
   B. $\tfrac{\pi}{4}$
   C. $\pi$
   D. $\tfrac{3\pi}{4}$

**Key:** A
**Solution:** True for all real $x$.

### [Q-5e26fe65] Question (single, main, origin: generated)

The domain of $f(x)=\sin^{-1}(3x-2)$ is

   A. $[\tfrac13,1]$
   B. $[-1,1]$
   C. $[0,1]$
   D. $[\tfrac13,\tfrac53]$

**Key:** A
**Solution:** $-1\le3x-2\le1\Rightarrow\tfrac13\le x\le1$.

### [Q-45bb6640] Question (single, main, origin: generated)

The domain of $f(x)=\cos^{-1}(2x)+\sin^{-1}(x)$ is

   A. $[-1,1]$
   B. $[-\tfrac12,\tfrac12]$
   C. $[0,\tfrac12]$
   D. $[-\tfrac12,1]$

**Key:** B
**Solution:** $|2x|\le1$ gives $|x|\le\tfrac12$ and $|x|\le1$ is weaker, so the domain is $[-\tfrac12,\tfrac12]$.

### [Q-00cb0aa1] Question (integer, main, origin: generated)

If $\sin^{-1}a+\sin^{-1}b+\sin^{-1}c=\tfrac{3\pi}{2}$, find $a^2+b^2+c^2$.

**Key:** 3
**Solution:** Each term is at most $\tfrac{\pi}{2}$, so all equal $\tfrac{\pi}{2}$ and $a=b=c=1$.

### [Q-27e7c97e] Question (single, advanced, origin: generated)

$\sin^{-1}(\sin 10)$ (in radians) equals

   A. $10-3\pi$
   B. $3\pi-10$
   C. $10-2\pi$
   D. $10$

**Key:** B
**Solution:** $10\in[\tfrac{5\pi}{2},\tfrac{7\pi}{2}]$ ($k=3$), so $(-1)^3(10-3\pi)=3\pi-10$.

### [Q-1a9d1f04] Question (single, foundation, origin: generated)

$\tan^{-1}\tfrac{1}{2}+\tan^{-1}\tfrac{1}{3}$ equals

   A. $\tfrac{\pi}{4}$
   B. $\tfrac{\pi}{3}$
   C. $\tfrac{\pi}{2}$
   D. $\tan^{-1}\tfrac{5}{6}$

**Key:** A
**Solution:** $xy=\tfrac16<1$, so the sum is $\tan^{-1}\tfrac{5/6}{5/6}=\tfrac{\pi}{4}$.

### [Q-cad7f064] Question (single, main, origin: generated)

The range of $f(x)=\sin^{-1}x+\cos^{-1}x+\tan^{-1}x$ for $x\in[-1,1]$ has maximum

   A. $\tfrac{3\pi}{4}$
   B. $\tfrac{\pi}{2}$
   C. $\pi$
   D. $\tfrac{\pi}{4}$

**Key:** A
**Solution:** $f=\tfrac{\pi}{2}+\tan^{-1}x$, maximum at $x=1$: $\tfrac{3\pi}{4}$.

### [Q-97e82aca] Question (multi, main, origin: generated)

Which of the following are correct?

   A. $\sin^{-1}\!\left(\sin\tfrac{2\pi}{3}\right)=\tfrac{2\pi}{3}$
   B. $\sin^{-1}\!\left(\sin\tfrac{2\pi}{3}\right)=\tfrac{\pi}{3}$
   C. $\cos^{-1}\!\left(\cos\tfrac{7\pi}{6}\right)=\tfrac{5\pi}{6}$
   D. $\tan^{-1}\!\left(\tan\tfrac{3\pi}{4}\right)=\tfrac{3\pi}{4}$

**Key:** B, C
**Solution:** Reduce each angle into its principal range: the second and third statements are true; the first and fourth are not.

### [Q-4d97d170] Question (single, main, origin: generated)

$\sin^{-1}(\sin 4)$ (in radians) equals

   A. $4$
   B. $\pi-4$
   C. $4-\pi$
   D. $4-2\pi$

**Key:** B
**Solution:** $4\in[\tfrac{\pi}{2},\tfrac{3\pi}{2}]\approx[1.57,4.71]$, so the result is $\pi-4\approx-0.858$.

### [Q-d874783d] Question (single, main, origin: generated)

$\sin\!\left(\cos^{-1}\tfrac{5}{13}\right)$ equals

   A. $\tfrac{12}{13}$
   B. $-\tfrac{12}{13}$
   C. $\tfrac{5}{12}$
   D. $\tfrac{8}{13}$

**Key:** A
**Solution:** $\theta\in[0,\pi]$ so $\sin\theta\ge0$: $\sqrt{1-\tfrac{25}{169}}=\tfrac{12}{13}$.

### [Q-c4da8b93] Question (integer, advanced, origin: generated)

If $\tan^{-1}\tfrac13+\tan^{-1}\tfrac15+\tan^{-1}\tfrac17+\tan^{-1}\tfrac18=k\cdot\tfrac{\pi}{4}$, find $k$.

**Key:** 1
**Solution:** Pairing gives $\tan^{-1}\tfrac47+\tan^{-1}\tfrac3{11}=\tan^{-1}1=\tfrac{\pi}{4}$.

### [Q-f53cfab0] Question (single, advanced, origin: generated)

$\tan^{-1}1+\tan^{-1}2+\tan^{-1}3$ equals

   A. $\tfrac{\pi}{2}$
   B. $\pi$
   C. $\tfrac{3\pi}{2}$
   D. $2\pi$

**Key:** B
**Solution:** $\tan^{-1}2+\tan^{-1}3=\tfrac{3\pi}{4}$ and $\tan^{-1}1=\tfrac{\pi}{4}$.

### [Q-3c8edfd8] Question (single, main, origin: generated)

$\tan^{-1}2+\tan^{-1}3$ equals

   A. $-\tfrac{\pi}{4}$
   B. $\tfrac{\pi}{4}$
   C. $\tfrac{3\pi}{4}$
   D. $\tfrac{5\pi}{4}$

**Key:** C
**Solution:** $xy=6>1$ with both positive, so add $\pi$ to $\tan^{-1}(-1)$.

### [Q-c50f0086] Question (integer, main, origin: generated)

The number of real solutions of $\tan^{-1}(2x)+\tan^{-1}(3x)=\tfrac{\pi}{4}$ is

**Key:** 1
**Solution:** The quadratic gives $x=\tfrac16$ and $x=-1$; $x=-1$ is rejected because $xy>1$ with both negative. One solution remains.

## Definition, domain, range and principal values

### [L-60e6f0e1] introduction (foundation)

**Why an inverse needs a restriction.** A function $f$ has an inverse only if every output comes from exactly one input (one-one) and every value of the codomain is reached (onto). The function $\sin x$ on all real numbers fails the first test: $\sin 0 = \sin \pi = 0$. If we tried to define "the angle whose sine is 0" we would get a whole list of answers, not one.

**The fix.** Choose a stretch of the x-axis on which $\sin x$ takes every value from $-1$ to $1$ exactly once. The stretch $\left[-\tfrac{\pi}{2}, \tfrac{\pi}{2}\right]$ works. On it, sine rises steadily from $-1$ to $1$. The inverse of this restricted function is called $\sin^{-1}$ (also written $\arcsin$). The restricted stretch becomes the **range** of the inverse and is called the **principal value branch**.

**Notation warning.** $\sin^{-1}x$ means "the angle whose sine is $x$". It does NOT mean $\dfrac{1}{\sin x}$, which is $\csc x$ or $(\sin x)^{-1}$.

### [L-591ddb53] explanation (foundation)

**The six principal ranges.** Each trigonometric function is restricted to a stretch where it is one-one and covers its full set of values:

- $\sin^{-1}x$: domain $[-1,1]$, range $\left[-\tfrac{\pi}{2},\tfrac{\pi}{2}\right]$
- $\cos^{-1}x$: domain $[-1,1]$, range $[0,\pi]$
- $\tan^{-1}x$: domain $\mathbb{R}$, range $\left(-\tfrac{\pi}{2},\tfrac{\pi}{2}\right)$
- $\cot^{-1}x$: domain $\mathbb{R}$, range $(0,\pi)$
- $\sec^{-1}x$: domain $(-\infty,-1]\cup[1,\infty)$, range $[0,\pi]$ except $\tfrac{\pi}{2}$
- $\csc^{-1}x$: domain $(-\infty,-1]\cup[1,\infty)$, range $\left[-\tfrac{\pi}{2},\tfrac{\pi}{2}\right]$ except $0$

**How to read them.** The statement $y = \sin^{-1}x$ means two things together: $\sin y = x$ AND $y$ lies in the principal range. Both parts are required. For example $\sin^{-1}\tfrac12 = \tfrac{\pi}{6}$ because $\sin\tfrac{\pi}{6}=\tfrac12$ and $\tfrac{\pi}{6}\in[-\tfrac{\pi}{2},\tfrac{\pi}{2}]$. The angle $\tfrac{5\pi}{6}$ also has sine $\tfrac12$ but is outside the range, so it is not the answer.

**A pattern to remember.** Sine, tangent and cosecant are measured on the right-hand side of the unit circle, so their inverses give angles from $-\tfrac{\pi}{2}$ to $\tfrac{\pi}{2}$. Cosine, cotangent and secant are measured from the positive x-axis through the upper half, so their inverses give angles from $0$ to $\pi$.

**Convention check.** Some books define the range of $\cot^{-1}$ as $\left(-\tfrac{\pi}{2},\tfrac{\pi}{2}\right]\setminus\{0\}$. The NCERT and most JEE material use $(0,\pi)$, which is used throughout here. Check which your coaching uses before comparing answers.

### [L-2eb0b206] derivation (main)

**Why these exact intervals?** We look for an interval that satisfies three conditions: the function is continuous and strictly monotonic on it (so it is one-one), it covers the full range of values, and it contains the angles near $0$ (the acute angles) so that familiar values come out as expected.

*Sine.* On $\left[-\tfrac{\pi}{2},\tfrac{\pi}{2}\right]$, $\sin x$ is continuous and strictly increasing because its derivative $\cos x \ge 0$ with equality only at the endpoints. It goes from $\sin(-\tfrac{\pi}{2}) = -1$ to $\sin\tfrac{\pi}{2}=1$. By the intermediate value theorem every value in $[-1,1]$ is reached, and by strict monotonicity only once. So sine restricted here is a bijection onto $[-1,1]$.

*Why not $[0,\pi]$ for sine?* Because $\sin\tfrac{\pi}{6}=\sin\tfrac{5\pi}{6}$: two inputs, one output. Not one-one.

*Cosine.* On $[0,\pi]$, $\cos x$ is strictly decreasing (derivative $-\sin x\le 0$), from $\cos0=1$ to $\cos\pi=-1$. A bijection onto $[-1,1]$. The interval $\left[-\tfrac{\pi}{2},\tfrac{\pi}{2}\right]$ would fail since $\cos(-x)=\cos x$.

*Tangent.* On $\left(-\tfrac{\pi}{2},\tfrac{\pi}{2}\right)$, $\tan x$ is strictly increasing (derivative $\sec^2x>0$) and tends to $-\infty$ and $+\infty$ at the ends, so it covers all real numbers once. The endpoints are excluded because tangent is undefined there.

The other three follow from the reciprocal relations $\csc x = 1/\sin x$, $\sec x = 1/\cos x$, $\cot x = 1/\tan x$, using the same intervals with the points where the reciprocal fails removed ($0$ for $\csc$, $\tfrac{\pi}{2}$ for $\sec$).

### [L-6dd52346] example (foundation)

**Example 1 (basic).** Find $\sin^{-1}\tfrac{\sqrt3}{2}+\cos^{-1}\tfrac12$.

*Method.* Find each angle in its own principal range.
$\sin^{-1}\tfrac{\sqrt3}{2}$: the angle in $[-\tfrac{\pi}{2},\tfrac{\pi}{2}]$ with sine $\tfrac{\sqrt3}{2}$ is $\tfrac{\pi}{3}$.
$\cos^{-1}\tfrac12$: the angle in $[0,\pi]$ with cosine $\tfrac12$ is $\tfrac{\pi}{3}$.
**Answer:** $\tfrac{2\pi}{3}$.

### [L-32ffe555] example (main)

**Example 2 (standard).** Find $\tan^{-1}(1)+\cot^{-1}(-1)$.

*Method.* $\tan^{-1}1=\tfrac{\pi}{4}$. For $\cot^{-1}(-1)$ we need an angle in $(0,\pi)$ with cotangent $-1$. Cotangent is negative in the second quadrant, and $\cot\tfrac{3\pi}{4}=-1$. So $\cot^{-1}(-1)=\tfrac{3\pi}{4}$.
**Answer:** $\tfrac{\pi}{4}+\tfrac{3\pi}{4}=\pi$.

*Common trap.* Writing $\cot^{-1}(-1)=-\tfrac{\pi}{4}$. That angle is not in $(0,\pi)$.

### [L-16d2ac28] example (main)

**Example 3 (domain).** Find the domain of $f(x)=\sin^{-1}(2x-1)$.

*Method.* The input of $\sin^{-1}$ must lie in $[-1,1]$.
$-1\le 2x-1\le 1 \Rightarrow 0\le 2x\le 2 \Rightarrow 0\le x\le 1$.
**Answer:** $[0,1]$.

*Why it works.* The domain of the outer function pulls back through the inner expression. Always write the condition on the expression first, then solve for $x$.

### [L-76cc8117] example (advanced)

**Example 4 (combined conditions).** Find the domain of $f(x)=\sin^{-1}\!\left(\log_2\dfrac{x}{2}\right)$.

*Method.* Two conditions: the logarithm needs $\dfrac{x}{2}>0$, and its value must lie in $[-1,1]$.
$-1\le\log_2\dfrac{x}{2}\le1 \Rightarrow 2^{-1}\le\dfrac{x}{2}\le2^{1} \Rightarrow 1\le x\le4$.
Since this already forces $x>0$, the first condition adds nothing.
**Answer:** $[1,4]$.

*Alternative.* Substitute $u=\log_2(x/2)$, solve $-1\le u\le1$, then undo the substitution. Because $2^u$ is increasing, the inequalities keep their direction.

### [L-7c54516e] common mistakes (foundation)

1. **Treating $\sin^{-1}x$ as $1/\sin x$.** The inverse function and the reciprocal are different objects.
2. **Picking any angle with the right ratio.** The answer must be in the principal range. $\cos^{-1}\!\left(\tfrac12\right)$ is $\tfrac{\pi}{3}$, not $-\tfrac{\pi}{3}$, because the range is $[0,\pi]$.
3. **Wrong sign for negative inputs of $\cos^{-1}$, $\cot^{-1}$, $\sec^{-1}$.** These are in the second quadrant: $\cos^{-1}\!\left(-\tfrac12\right)=\tfrac{2\pi}{3}$, not $-\tfrac{\pi}{3}$.
4. **Forgetting the domain $[-1,1]$.** $\sin^{-1}2$ does not exist for real numbers.
5. **Mixing the $\cot^{-1}$ convention** (see Explanation). Confirm which range your source uses.

### [L-da2deccb] tips (main)

- **Range memory:** "sine, tangent, cosecant live in $(-\tfrac{\pi}{2},\tfrac{\pi}{2})$; cosine, cotangent, secant live in $(0,\pi)$".
- **Negative inputs:** for the first group the answer is negative, for the second group it lies in the second quadrant ($\tfrac{\pi}{2}$ to $\pi$).
- **Always sketch** the unit circle for a value you are unsure about: mark the angle with the required ratio inside the allowed half.
- **Domain questions:** write the condition "argument in $[-1,1]$" for each inverse sine/cosine and "argument $\ne$ anything" for others, then intersect all conditions at the end.

### [L-0b323f76] summary (foundation)

**Quick revision.** $y=\sin^{-1}x \iff \sin y=x$ and $y\in[-\tfrac{\pi}{2},\tfrac{\pi}{2}]$. Ranges: $\sin^{-1}$: $[-\tfrac{\pi}{2},\tfrac{\pi}{2}]$; $\cos^{-1}$: $[0,\pi]$; $\tan^{-1}$: $(-\tfrac{\pi}{2},\tfrac{\pi}{2})$; $\cot^{-1}$: $(0,\pi)$; $\sec^{-1}$: $[0,\pi]\setminus\{\tfrac{\pi}{2}\}$; $\csc^{-1}$: $[-\tfrac{\pi}{2},\tfrac{\pi}{2}]\setminus\{0\}$. Domains: $[-1,1]$ for sine/cosine; all reals for tangent/cotangent; $|x|\ge1$ for secant/cosecant. Inverse $\ne$ reciprocal.

### [L-2633564c] mini assessment (foundation)

**Check yourself (answers at the end).**
1. Evaluate $\cos^{-1}\!\left(-\tfrac{\sqrt3}{2}\right)$.
2. Is $\sin^{-1}\tfrac12=\tfrac{5\pi}{6}$ correct? Why or why not?
3. Find the domain of $\cos^{-1}(3x)$.
4. Evaluate $\tan^{-1}(-\sqrt3)$.

**Answers.** 1. $\tfrac{5\pi}{6}$. 2. No: $\tfrac{5\pi}{6}$ is outside $[-\tfrac{\pi}{2},\tfrac{\pi}{2}]$; the answer is $\tfrac{\pi}{6}$. 3. $\left[-\tfrac13,\tfrac13\right]$. 4. $-\tfrac{\pi}{3}$.

### [F-ea540001] Formula: Principal range of the inverse cotangent

$$\cot^{-1}x \in (0, \pi)$$

Variables: x: any real number
Conditions: NCERT/JEE convention. Some books use a different range; check yours.

### [F-d20126fc] Formula: Principal value of the inverse cosine

$$y = \cos^{-1}x \iff \cos y = x,\; y \in [0, \pi]$$

Variables: x: the ratio, between -1 and 1; y: the angle in radians
Conditions: x in [-1, 1]

### [F-1353eac0] Formula: Principal value of the inverse sine

$$y = \sin^{-1}x \iff \sin y = x,\; y \in \left[-\tfrac{\pi}{2}, \tfrac{\pi}{2}\right]$$

Variables: x: the ratio, between -1 and 1; y: the angle in radians
Conditions: x in [-1, 1]

Note: Both parts must hold: the sine matches AND the angle is in the principal range.

### [F-22263a8b] Formula: Principal value of the inverse tangent

$$y = \tan^{-1}x \iff \tan y = x,\; y \in \left(-\tfrac{\pi}{2}, \tfrac{\pi}{2}\right)$$

Variables: x: any real number; y: the angle in radians
Conditions: x real

### [V-1fa2db6c] Video: Defining Inverse Trigonometric Functions

Channel: Edubuzz Gurus  
Link: https://www.youtube.com/watch?v=hHPK1or5gRI  
Purpose: concept, level foundation
Why recommended: Short definition-level lesson. Use for a first pass before the JEE-level lecture.

*Watch before deciding. Check: link works, title/channel match, covers the topic, suitable for the level, teaching quality.*

### [V-5f9f03d7] Video: Inverse Trigonometric Functions IIT JEE [Domain, Range & Principal Values With Graph] L1 | JEE 2022

Channel: Vedantu JEE English  
Link: https://www.youtube.com/watch?v=MUKFqDiUVbg  
Purpose: classroom, level main
Why recommended: A full classroom lesson on domain, range and principal values with graphs. Matches this topic directly.

*Watch before deciding. Check: link works, title/channel match, covers the topic, suitable for the level, teaching quality.*

### [V-d465e877] Video: Inverse trigonometric functions.Why do we have principal value branch in range. Conditions for Inv.

Channel: 3 dots physics JEENEET  Dehradun  
Link: https://www.youtube.com/watch?v=1CqkEnTtjF8  
Purpose: concept, level foundation
Why recommended: Explains why a principal value branch is needed, which is the first idea of this chapter.

*Watch before deciding. Check: link works, title/channel match, covers the topic, suitable for the level, teaching quality.*

## Properties and identities

### [L-48d09e38] introduction (foundation)

**Why identities help.** Once the principal ranges are fixed, the six inverse functions are linked by a few exact relations. These let you flip signs, swap one inverse for its partner, and often collapse a long expression to a constant.

**Prerequisites.** Principal ranges (previous topic), the complementary-angle relations $\sin(\tfrac{\pi}{2}-\theta)=\cos\theta$ and $\tan(\tfrac{\pi}{2}-\theta)=\cot\theta$, and the fact that $\sin$, $\tan$ are odd while $\cos$ is even.

### [L-3a710a43] explanation (main)

**Negative arguments.**
- $\sin^{-1}(-x)=-\sin^{-1}x$, $\tan^{-1}(-x)=-\tan^{-1}x$, $\csc^{-1}(-x)=-\csc^{-1}x$ (odd functions).
- $\cos^{-1}(-x)=\pi-\cos^{-1}x$, $\cot^{-1}(-x)=\pi-\cot^{-1}x$, $\sec^{-1}(-x)=\pi-\sec^{-1}x$.

**Complementary pairs.**
- $\sin^{-1}x+\cos^{-1}x=\tfrac{\pi}{2}$ for $x\in[-1,1]$.
- $\tan^{-1}x+\cot^{-1}x=\tfrac{\pi}{2}$ for all real $x$.
- $\sec^{-1}x+\csc^{-1}x=\tfrac{\pi}{2}$ for $|x|\ge1$.

**Reciprocal arguments.**
- $\sin^{-1}\tfrac1x=\csc^{-1}x$ and $\cos^{-1}\tfrac1x=\sec^{-1}x$ for $|x|\ge1$.
- $\tan^{-1}\tfrac1x=\cot^{-1}x$ for $x>0$, and $\tan^{-1}\tfrac1x=\cot^{-1}x-\pi$ for $x<0$.

**How to use them.** A constant like $\sin^{-1}x+\cos^{-1}x$ appearing in a question is a signal: replace it by $\tfrac{\pi}{2}$ immediately. The conditions on each identity (such as $x>0$) are part of the identity. Quoting it without checking the condition is the most frequent source of lost marks.

### [L-6fdbb893] derivation (main)

**Derivation of $\sin^{-1}x+\cos^{-1}x=\tfrac{\pi}{2}$.**
Let $\theta=\sin^{-1}x$, so $\theta\in\left[-\tfrac{\pi}{2},\tfrac{\pi}{2}\right]$ and $\sin\theta=x$.
Then $x=\sin\theta=\cos\!\left(\tfrac{\pi}{2}-\theta\right)$.
Now check that $\tfrac{\pi}{2}-\theta$ is in the range of $\cos^{-1}$: since $-\tfrac{\pi}{2}\le\theta\le\tfrac{\pi}{2}$, we get $0\le\tfrac{\pi}{2}-\theta\le\pi$. It is. Therefore $\cos^{-1}x=\tfrac{\pi}{2}-\theta$, which rearranges to the identity.
*The range check is the essential step.* Without it, $x=\cos(\text{something})$ does not yet identify the something as $\cos^{-1}x$.

**Derivation of $\cos^{-1}(-x)=\pi-\cos^{-1}x$.**
Let $\theta=\cos^{-1}x\in[0,\pi]$. Then $\cos(\pi-\theta)=-\cos\theta=-x$ and $\pi-\theta\in[0,\pi]$. Hence $\cos^{-1}(-x)=\pi-\theta$.

**Derivation of $\tan^{-1}\tfrac1x=\cot^{-1}x$ for $x>0$.**
Let $\theta=\cot^{-1}x\in(0,\pi)$; since $x>0$, $\cot\theta>0$ so $\theta\in\left(0,\tfrac{\pi}{2}\right)$. Then $\tan\theta=\tfrac1x$ with $\theta\in\left(-\tfrac{\pi}{2},\tfrac{\pi}{2}\right)$, so $\tan^{-1}\tfrac1x=\theta$. For $x<0$ the angle $\theta$ is in $\left(\tfrac{\pi}{2},\pi\right)$, outside the range of $\tan^{-1}$, so we use $\theta-\pi$ instead.

### [L-f9614f44] example (foundation)

**Example 1.** Find $\sin^{-1}(0.6)+\cos^{-1}(0.6)$.
Both inverses are defined at $0.6$, and the identity gives $\tfrac{\pi}{2}$. No calculation of the angles is needed.

### [L-8f9282d9] example (main)

**Example 2.** Find $\cos^{-1}\!\left(-\tfrac{\sqrt3}{2}\right)$ using the negative-argument rule.
$\cos^{-1}\!\left(-\tfrac{\sqrt3}{2}\right)=\pi-\cos^{-1}\!\left(\tfrac{\sqrt3}{2}\right)=\pi-\tfrac{\pi}{6}=\tfrac{5\pi}{6}$.

### [L-5f3e268b] example (main)

**Example 3.** Find $\tan^{-1}2+\tan^{-1}\tfrac12$.
Both arguments are positive and reciprocals of each other, so $\tan^{-1}\tfrac12=\cot^{-1}2$ and the sum is $\tan^{-1}2+\cot^{-1}2=\tfrac{\pi}{2}$.
*Check.* $\tan^{-1}2\approx1.1071$, $\tan^{-1}\tfrac12\approx0.4636$; sum $\approx1.5708=\tfrac{\pi}{2}$.

### [L-607521bf] example (advanced)

**Example 4 (extreme-value reasoning).** If $\sin^{-1}x+\sin^{-1}y+\sin^{-1}z=\tfrac{3\pi}{2}$, find $x^2+y^2+z^2$.
Each term is at most $\tfrac{\pi}{2}$, so the sum is at most $\tfrac{3\pi}{2}$, with equality only if every term equals $\tfrac{\pi}{2}$. Hence $x=y=z=\sin\tfrac{\pi}{2}=1$ and $x^2+y^2+z^2=3$.

**Example 5 (range).** Find the range of $f(x)=\sin^{-1}x+\cos^{-1}x+\tan^{-1}x$ on $[-1,1]$.
The first two terms add to $\tfrac{\pi}{2}$, so $f(x)=\tfrac{\pi}{2}+\tan^{-1}x$. On $[-1,1]$, $\tan^{-1}x$ goes from $-\tfrac{\pi}{4}$ to $\tfrac{\pi}{4}$, so the range is $\left[\tfrac{\pi}{4},\tfrac{3\pi}{4}\right]$.

### [L-bb587254] common mistakes (main)

1. Using $\sin^{-1}x+\cos^{-1}x=\tfrac{\pi}{2}$ outside $[-1,1]$. The expression is not defined there.
2. Writing $\cos^{-1}(-x)=-\cos^{-1}x$ (cosine is even, not odd; the correct rule is $\pi-\cos^{-1}x$).
3. Using $\tan^{-1}\tfrac1x=\cot^{-1}x$ for negative $x$.
4. Forgetting that identities with conditions are only valid on the stated set.

### [L-6c6ff6be] tips (main)

- Spot constants: whenever you see $\sin^{-1}x$ and $\cos^{-1}x$ together with the same argument, replace the pair by $\tfrac{\pi}{2}$.
- For maximum/minimum questions, bound each term by its range first, then see whether all bounds can be reached at the same time.
- When an answer should be a "nice" angle, test it numerically with a calculator in radians as a final sanity check.

### [L-a9345ca9] summary (main)

Odd: $\sin^{-1},\tan^{-1},\csc^{-1}$ ($f(-x)=-f(x)$). Others: $f(-x)=\pi-f(x)$. Complementary: $\sin^{-1}x+\cos^{-1}x=\tfrac{\pi}{2}$; $\tan^{-1}x+\cot^{-1}x=\tfrac{\pi}{2}$; $\sec^{-1}x+\csc^{-1}x=\tfrac{\pi}{2}$. Reciprocal: $\sin^{-1}\tfrac1x=\csc^{-1}x$; $\cos^{-1}\tfrac1x=\sec^{-1}x$ ($|x|\ge1$); $\tan^{-1}\tfrac1x=\cot^{-1}x$ ($x>0$).

### [L-a700b008] mini assessment (main)

**Check yourself.**
1. Evaluate $\sin^{-1}\tfrac13+\cos^{-1}\tfrac13$.
2. Evaluate $\tan^{-1}(-1)+\cot^{-1}(-1)$.
3. Evaluate $\tan^{-1}\!\left(-\tfrac13\right)+\cot^{-1}\!\left(-\tfrac13\right)$.

**Answers.** 1. $\tfrac{\pi}{2}$. 2. $-\tfrac{\pi}{4}+\tfrac{3\pi}{4}=\tfrac{\pi}{2}$ (the pair always adds to $\tfrac{\pi}{2}$). 3. $\tfrac{\pi}{2}$.

### [F-ded1a89c] Formula: Complementary pair: sine and cosine

$$\sin^{-1}x + \cos^{-1}x = \tfrac{\pi}{2}$$

Variables: x: a number in [-1, 1]
Conditions: x in [-1, 1]

### [F-8657debf] Formula: Complementary pair: tangent and cotangent

$$\tan^{-1}x + \cot^{-1}x = \tfrac{\pi}{2}$$

Variables: x: any real number
Conditions: x real

### [F-02b7ad0b] Formula: Negative argument of the inverse cosine

$$\cos^{-1}(-x) = \pi - \cos^{-1}x$$

Variables: x: a number in [-1, 1]
Conditions: x in [-1, 1]

### [F-b7be739c] Formula: Negative argument of the inverse sine

$$\sin^{-1}(-x) = -\sin^{-1}x$$

Variables: x: a number in [-1, 1]
Conditions: x in [-1, 1]

## Simplifying f⁻¹(f(x)) expressions

### [L-fe886c06] introduction (main)

**The key asymmetry.** $\sin(\sin^{-1}x)=x$ for every $x\in[-1,1]$. But $\sin^{-1}(\sin x)$ equals $x$ only when $x$ already lies in $\left[-\tfrac{\pi}{2},\tfrac{\pi}{2}\right]$. For other $x$ the inverse brings the angle back into the principal range, and that changes the answer. Almost every simplification question in JEE is about this asymmetry.

**Prerequisites.** Principal ranges; the reduction identities $\sin(\pi-x)=\sin x$, $\cos(2\pi-x)=\cos x$, $\tan(x-\pi)=\tan x$.

### [L-44b24e76] explanation (main)

**Rule for $\sin^{-1}(\sin x)$.** Find the angle $y$ in $\left[-\tfrac{\pi}{2},\tfrac{\pi}{2}\right]$ with $\sin y=\sin x$:
- $x\in\left[-\tfrac{\pi}{2},\tfrac{\pi}{2}\right]$: result $x$.
- $x\in\left[\tfrac{\pi}{2},\tfrac{3\pi}{2}\right]$: result $\pi-x$.
- $x\in\left[\tfrac{3\pi}{2},\tfrac{5\pi}{2}\right]$: result $x-2\pi$.
In general, for $x\in\left[\left(2k-1\right)\tfrac{\pi}{2},\left(2k+1\right)\tfrac{\pi}{2}\right]$ the result is $(-1)^k(x-k\pi)$.

**Rule for $\cos^{-1}(\cos x)$.** Find $y\in[0,\pi]$ with $\cos y=\cos x$:
- $x\in[0,\pi]$: $x$. $\;x\in[\pi,2\pi]$: $2\pi-x$. $\;x\in[2\pi,3\pi]$: $x-2\pi$.

**Rule for $\tan^{-1}(\tan x)$.** $x\in\left(-\tfrac{\pi}{2},\tfrac{\pi}{2}\right)$: $x$. $\;x\in\left(\tfrac{\pi}{2},\tfrac{3\pi}{2}\right)$: $x-\pi$. In general subtract the multiple of $\pi$ that brings $x$ into the principal interval.

**Picture.** The graph of $y=\sin^{-1}(\sin x)$ is a zig-zag (triangle wave) between $-\tfrac{\pi}{2}$ and $\tfrac{\pi}{2}$ with period $2\pi$. It coincides with the straight line $y=x$ only on $\left[-\tfrac{\pi}{2},\tfrac{\pi}{2}\right]$. $y=\cos^{-1}(\cos x)$ is a triangle wave between $0$ and $\pi$ with period $2\pi$.

### [L-9431dbbc] derivation (main)

**Why $\sin^{-1}(\sin x)=\pi-x$ on $\left[\tfrac{\pi}{2},\tfrac{3\pi}{2}\right]$.**
If $x\in\left[\tfrac{\pi}{2},\tfrac{3\pi}{2}\right]$ then $\pi-x\in\left[-\tfrac{\pi}{2},\tfrac{\pi}{2}\right]$, which is the principal range. Also $\sin(\pi-x)=\sin x$. So $\pi-x$ is an angle in the principal range with the same sine as $x$. By definition of $\sin^{-1}$ that angle is the answer.

**General recipe (works for any function).** To simplify $f^{-1}(f(x))$: (1) rewrite $x$ as $\pm x'+k\cdot(\text{period or half-period})$ so that $f(x)=f(x')$ with $x'$ in the principal range; (2) the answer is $x'$. Check that $x'$ is in range, not just that its ratio matches.

### [L-88ec36e4] example (foundation)

**Example 1.** $\sin^{-1}\!\left(\sin\tfrac{\pi}{3}\right)$. Since $\tfrac{\pi}{3}\in\left[-\tfrac{\pi}{2},\tfrac{\pi}{2}\right]$, the answer is $\tfrac{\pi}{3}$.

**Example 2.** $\sin^{-1}\!\left(\sin\tfrac{2\pi}{3}\right)$. $\tfrac{2\pi}{3}\in\left[\tfrac{\pi}{2},\tfrac{3\pi}{2}\right]$, so the answer is $\pi-\tfrac{2\pi}{3}=\tfrac{\pi}{3}$.

### [L-a93bb4fb] example (main)

**Example 3.** $\cos^{-1}\!\left(\cos\tfrac{7\pi}{6}\right)$. $\tfrac{7\pi}{6}\in[\pi,2\pi]$, so the answer is $2\pi-\tfrac{7\pi}{6}=\tfrac{5\pi}{6}$.
*Check.* $\cos\tfrac{7\pi}{6}=-\tfrac{\sqrt3}{2}$ and $\cos^{-1}\!\left(-\tfrac{\sqrt3}{2}\right)=\tfrac{5\pi}{6}$. ✓

**Example 4.** $\tan^{-1}\!\left(\tan\tfrac{3\pi}{4}\right)$. $\tfrac{3\pi}{4}\in\left(\tfrac{\pi}{2},\tfrac{3\pi}{2}\right)$, so the answer is $\tfrac{3\pi}{4}-\pi=-\tfrac{\pi}{4}$.

### [L-ebc4850f] example (advanced)

**Example 5 (a number that is not a multiple of $\pi$).** Simplify $\sin^{-1}(\sin 10)$ (angle in radians).
$10$ lies in $\left[\tfrac{5\pi}{2},\tfrac{7\pi}{2}\right]\approx[7.85,\,10.99]$, i.e. $k=3$. The result is $(-1)^3(10-3\pi)=3\pi-10\approx-0.575$.
*Check.* $\sin10\approx-0.544$ and $\sin^{-1}(-0.544)\approx-0.575$. ✓ The answer lies in $\left[-\tfrac{\pi}{2},\tfrac{\pi}{2}\right]$ as required.

**Example 6.** Find $\sin\!\left(\cos^{-1}\tfrac35\right)$. Let $\theta=\cos^{-1}\tfrac35\in[0,\pi]$. Then $\sin\theta\ge0$ and $\sin\theta=\sqrt{1-\tfrac{9}{25}}=\tfrac45$.
*Trap.* On $[0,\pi]$ the sine is never negative, so the positive root is the right one.

### [L-77f06a06] common mistakes (main)

1. Writing $\sin^{-1}(\sin x)=x$ without checking the interval of $x$.
2. Reducing by the wrong amount: $\tan$ has period $\pi$ but $\sin$ and $\cos$ have period $2\pi$.
3. For $\sin^{-1}(\sin x)$ with $x$ in the second quadrant, answering with a value outside $\left[-\tfrac{\pi}{2},\tfrac{\pi}{2}\right]$.
4. Treating a decimal angle (like 10 radians) as degrees.
5. Taking the wrong sign of a square root when converting between inverse functions; the principal range fixes the sign.

### [L-b2cd9bbd] tips (main)

- Locate $x$ on the unit circle first, then reflect it into the principal half.
- For decimal radians, divide by $\pi$ (or use $\pi\approx3.1416$) to find which interval it falls in.
- Convert between inverse functions with a right triangle, but fix the sign from the principal range.
- After simplifying, check the answer is inside the required range and that the original ratio matches.

### [L-37e2a197] summary (main)

$\sin^{-1}(\sin x)$: $x$ on $[-\tfrac{\pi}{2},\tfrac{\pi}{2}]$; $\pi-x$ on $[\tfrac{\pi}{2},\tfrac{3\pi}{2}]$; $x-2\pi$ on $[\tfrac{3\pi}{2},\tfrac{5\pi}{2}]$. $\cos^{-1}(\cos x)$: $x$ on $[0,\pi]$; $2\pi-x$ on $[\pi,2\pi]$. $\tan^{-1}(\tan x)$: $x-k\pi$ with the result in $(-\tfrac{\pi}{2},\tfrac{\pi}{2})$. Always $\sin(\sin^{-1}x)=x$ on $[-1,1]$.

### [L-887200f3] mini assessment (main)

**Check yourself.**
1. $\sin^{-1}\!\left(\sin\tfrac{5\pi}{6}\right)$.
2. $\cos^{-1}\!\left(\cos\tfrac{4\pi}{3}\right)$.
3. $\tan^{-1}\!\left(\tan\tfrac{5\pi}{4}\right)$.
4. $\sin^{-1}(\sin 4)$ (radians).

**Answers.** 1. $\tfrac{\pi}{6}$. 2. $\tfrac{2\pi}{3}$. 3. $\tfrac{\pi}{4}$. 4. $\pi-4\approx-0.858$ (since $4\in[\tfrac{\pi}{2},\tfrac{3\pi}{2}]$).

### [F-43101827] Formula: Inverse cosine of a cosine on [0, 2π]

$$\cos^{-1}(\cos x) = \begin{cases} x & 0 \le x \le \pi \\ 2\pi - x & \pi \le x \le 2\pi \end{cases}$$

Variables: x: angle in radians
Conditions: x in [0, 2π]

### [F-3df6b2cd] Formula: Inverse sine of a sine

$$\sin^{-1}(\sin x) = (-1)^k (x - k\pi)$$

Variables: x: any real angle in radians; k: the integer with x in [(2k-1)π/2, (2k+1)π/2]
Conditions: Valid for every real x

Note: k = 0 gives x itself on [-π/2, π/2].

### [V-45bd406d] Video: Considering only the principal values of the inverse trigonometric functions,  #jee #jeeadv pyq 2022

Channel: Maths magically delivered  
Link: https://www.youtube.com/watch?v=rKR-GrrRLzI  
Purpose: advanced, level advanced
Why recommended: Worked solution of a JEE Advanced 2022 question on principal values (title says so; check against the paper).

*Watch before deciding. Check: link works, title/channel match, covers the topic, suitable for the level, teaching quality.*

## Sums of inverse tangents and equations

### [L-f7f7c137] introduction (main)

**The problem.** The tangent addition formula $\tan(\alpha+\beta)=\dfrac{\tan\alpha+\tan\beta}{1-\tan\alpha\tan\beta}$ suggests $\tan^{-1}x+\tan^{-1}y=\tan^{-1}\dfrac{x+y}{1-xy}$. But the left side can be as large as $\pm\pi$, while $\tan^{-1}$ only returns values between $-\tfrac{\pi}{2}$ and $\tfrac{\pi}{2}$. The formula therefore needs a correction when the sum leaves that interval. This topic shows exactly when, and how to solve equations without keeping false roots.

**Prerequisites.** The tangent addition formula; the principal range of $\tan^{-1}$; solving quadratic equations.

### [L-cc5f633b] explanation (main)

**Addition.** For real $x,y$:
- if $xy<1$: $\tan^{-1}x+\tan^{-1}y=\tan^{-1}\dfrac{x+y}{1-xy}$;
- if $xy>1$ and $x,y>0$: $\tan^{-1}x+\tan^{-1}y=\pi+\tan^{-1}\dfrac{x+y}{1-xy}$;
- if $xy>1$ and $x,y<0$: $\tan^{-1}x+\tan^{-1}y=-\pi+\tan^{-1}\dfrac{x+y}{1-xy}$.
(If $xy=1$ the denominator is zero: the sum is $\tfrac{\pi}{2}$ for $x>0$ and $-\tfrac{\pi}{2}$ for $x<0$.)

**Subtraction.** Replace $y$ by $-y$: $\tan^{-1}x-\tan^{-1}y=\tan^{-1}\dfrac{x-y}{1+xy}$ if $xy>-1$.

**Double-angle forms.** $2\tan^{-1}x=\tan^{-1}\dfrac{2x}{1-x^2}$ for $|x|<1$; $\;=\sin^{-1}\dfrac{2x}{1+x^2}$ for $|x|\le1$; $\;=\cos^{-1}\dfrac{1-x^2}{1+x^2}$ for $x\ge0$.

**Solving equations.** Combine the terms with the correct case, solve the resulting algebraic equation, then substitute every root back into the original equation. Roots that violate the conditions (or fall outside the domains) must be rejected.

### [L-536bb66c] derivation (advanced)

**Why the correction appears.** Let $\alpha=\tan^{-1}x$ and $\beta=\tan^{-1}y$, so $\alpha,\beta\in\left(-\tfrac{\pi}{2},\tfrac{\pi}{2}\right)$ and $\alpha+\beta\in(-\pi,\pi)$. Then $\tan(\alpha+\beta)=\dfrac{x+y}{1-xy}$ whenever $xy\ne1$.

Also $\cos(\alpha+\beta)=\cos\alpha\cos\beta-\sin\alpha\sin\beta=\cos\alpha\cos\beta\,(1-\tan\alpha\tan\beta)=\cos\alpha\cos\beta\,(1-xy)$. Since $\cos\alpha,\cos\beta>0$, the sign of $\cos(\alpha+\beta)$ is the sign of $1-xy$.

*Case $xy<1$.* $\cos(\alpha+\beta)>0$, so $\alpha+\beta\in\left(-\tfrac{\pi}{2},\tfrac{\pi}{2}\right)$, the principal range of $\tan^{-1}$. Taking $\tan^{-1}$ of $\tan(\alpha+\beta)$ returns $\alpha+\beta$ itself.

*Case $xy>1$, $x,y>0$.* Then $\alpha,\beta\in\left(0,\tfrac{\pi}{2}\right)$ and $\cos(\alpha+\beta)<0$, so $\alpha+\beta\in\left(\tfrac{\pi}{2},\pi\right)$. Subtract $\pi$ to land in the principal range: $\alpha+\beta-\pi=\tan^{-1}\tan(\alpha+\beta)$, which gives the $+\pi$ form. The case $x,y<0$ is symmetric.

### [L-79dd192e] example (foundation)

**Example 1.** Show $\tan^{-1}\tfrac12+\tan^{-1}\tfrac13=\tfrac{\pi}{4}$.
$xy=\tfrac16<1$, so the sum is $\tan^{-1}\dfrac{\tfrac12+\tfrac13}{1-\tfrac16}=\tan^{-1}\dfrac{5/6}{5/6}=\tan^{-1}1=\tfrac{\pi}{4}$.

### [L-ccf796d0] example (main)

**Example 2 (the correction).** Find $\tan^{-1}2+\tan^{-1}3$.
Here $xy=6>1$ with both positive, so the sum is $\pi+\tan^{-1}\dfrac{5}{1-6}=\pi+\tan^{-1}(-1)=\pi-\tfrac{\pi}{4}=\tfrac{3\pi}{4}$.
*Check.* $\tan^{-1}2\approx1.1071$, $\tan^{-1}3\approx1.2490$; sum $\approx2.3562=\tfrac{3\pi}{4}$. ✓ (Without the $\pi$ we would wrongly get $-\tfrac{\pi}{4}$.)

**Example 3 (an equation).** Solve $\tan^{-1}(2x)+\tan^{-1}(3x)=\tfrac{\pi}{4}$.
Assume $6x^2<1$: then $\dfrac{5x}{1-6x^2}=\tan\tfrac{\pi}{4}=1\Rightarrow6x^2+5x-1=0\Rightarrow(6x-1)(x+1)=0$, so $x=\tfrac16$ or $x=-1$.
Test $x=\tfrac16$: $2x=\tfrac13$, $3x=\tfrac12$, product $\tfrac16<1$ ✓ and the sum is $\tfrac{\pi}{4}$.
Test $x=-1$: $2x=-2$, $3x=-3$, product $6>1$ with both negative, so the sum is $-\pi+\tan^{-1}1=-\tfrac{3\pi}{4}\ne\tfrac{\pi}{4}$. **Reject.**
**Answer:** $x=\tfrac16$ only.

### [L-bb84f700] example (advanced)

**Example 4 (four terms).** Show $\tan^{-1}\tfrac13+\tan^{-1}\tfrac15+\tan^{-1}\tfrac17+\tan^{-1}\tfrac18=\tfrac{\pi}{4}$.
Pair them: $\tan^{-1}\tfrac13+\tan^{-1}\tfrac15=\tan^{-1}\dfrac{8/15}{14/15}=\tan^{-1}\tfrac47$ (product $\tfrac1{15}<1$).
$\tan^{-1}\tfrac17+\tan^{-1}\tfrac18=\tan^{-1}\dfrac{15/56}{55/56}=\tan^{-1}\tfrac3{11}$ (product $\tfrac1{56}<1$).
Finally $\tan^{-1}\tfrac47+\tan^{-1}\tfrac3{11}=\tan^{-1}\dfrac{65/77}{65/77}=\tan^{-1}1=\tfrac{\pi}{4}$ (product $\tfrac{12}{77}<1$). ✓

**Example 5.** Find $\sin\!\left(2\tan^{-1}\tfrac13\right)$. Using $2\tan^{-1}x=\sin^{-1}\dfrac{2x}{1+x^2}$ for $|x|\le1$: the value is $\dfrac{2/3}{1+1/9}=\dfrac{2/3}{10/9}=\dfrac35$.

### [L-89bcf0bf] common mistakes (main)

1. Using $\tan^{-1}x+\tan^{-1}y=\tan^{-1}\frac{x+y}{1-xy}$ without checking $xy<1$.
2. Keeping both roots of the quadratic after combining the terms. Always substitute back.
3. Using $2\tan^{-1}x=\tan^{-1}\frac{2x}{1-x^2}$ for $|x|>1$.
4. Forgetting the special cases $xy=1$.
5. Assuming the combined algebraic equation is equivalent to the original; it is only implied by it.

### [L-6bd08a0c] tips (advanced)

- Compute $xy$ before anything else; the case follows from its value and the signs.
- For long sums, pair terms whose product is below 1 so that no corrections are needed.
- In an equation, test each candidate numerically using a calculator in radians.
- Telescoping: $\tan^{-1}\dfrac{1}{1+n(n+1)}=\tan^{-1}(n+1)-\tan^{-1}n$ turns many sums into a difference of two terms.

### [L-041b0319] summary (main)

$\tan^{-1}x+\tan^{-1}y=\tan^{-1}\frac{x+y}{1-xy}$ ($xy<1$); add $\pi$ if $xy>1,x,y>0$; subtract $\pi$ if $xy>1,x,y<0$. $\tan^{-1}x-\tan^{-1}y=\tan^{-1}\frac{x-y}{1+xy}$ ($xy>-1$). $2\tan^{-1}x$ has three forms (tan, sin, cos) with different conditions. Always verify roots in the original equation.

### [L-8a81d438] mini assessment (main)

**Check yourself.**
1. $\tan^{-1}1+\tan^{-1}2+\tan^{-1}3$.
2. Does $\tan^{-1}\tfrac12+\tan^{-1}\tfrac14=\tan^{-1}\tfrac67$? Which condition justifies it?
3. Solve $\tan^{-1}x+\tan^{-1}\tfrac1x=\tfrac{\pi}{2}$ for $x>0$.

**Answers.** 1. $\pi$ (first $\tan^{-1}2+\tan^{-1}3=\tfrac{3\pi}{4}$, plus $\tfrac{\pi}{4}$). 2. Yes: $xy=\tfrac18<1$ and $\dfrac{3/4}{7/8}=\tfrac67$. 3. Every $x>0$.

### [F-e53517e1] Formula: Double angle: inverse cosine form

$$2\tan^{-1}x = \cos^{-1}\dfrac{1-x^2}{1+x^2}$$

Variables: x: real number
Conditions: Only for x ≥ 0 (for x < 0 the right side equals −2 tan⁻¹ x)

### [F-f305c4c1] Formula: Double angle: inverse sine form

$$2\tan^{-1}x = \sin^{-1}\dfrac{2x}{1+x^2}$$

Variables: x: real number
Conditions: Only for |x| ≤ 1

Note: For |x| > 1 the right side gives a different angle.

### [F-46576be9] Formula: Double angle: inverse tangent form

$$2\tan^{-1}x = \tan^{-1}\dfrac{2x}{1-x^2}$$

Variables: x: real number
Conditions: Only for |x| < 1 (for x > 1 add π, for x < −1 subtract π)

### [F-f8a2619c] Formula: Sum of inverse tangents

$$\tan^{-1}x + \tan^{-1}y = \tan^{-1}\dfrac{x+y}{1-xy}$$

Variables: x: real number; y: real number
Conditions: Only when xy < 1. If xy > 1 and x, y > 0 add π; if xy > 1 and x, y < 0 subtract π.
