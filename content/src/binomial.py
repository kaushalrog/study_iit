from math import comb, floor, factorial, isqrt, sqrt
from lib import Chapter, approx

c = Chapter('Binomial Theorem')
T1 = c.topic('Binomial expansion and Pascal’s triangle')
T2 = c.topic('General term and middle term')
T3 = c.topic('Properties of binomial coefficients')
T4 = c.topic('Greatest term and applications')


def poly_mul(p, q):
    out = [0] * (len(p) + len(q) - 1)
    for i, a in enumerate(p):
        for j, b in enumerate(q):
            out[i + j] += a * b
    return out


def expand(a, b, n):
    """coefficients (low power of x first) of (a + b x)^n by repeated multiplication, independent of the theorem."""
    p = [1]
    for _ in range(n):
        p = poly_mul(p, [a, b])
    return p


# ---------- overview ----------
c.lesson(None, 'introduction', 'foundation', r"""
**What the chapter is about.** You already know $(a+b)^2=a^2+2ab+b^2$ and $(a+b)^3=a^3+3a^2b+3ab^2+b^3$. The binomial theorem gives the full expansion of $(a+b)^n$ for any positive integer $n$ without multiplying brackets one by one, and explains where each coefficient comes from. The coefficients are the **binomial coefficients** $\binom{n}{r}$, which also count the number of ways to choose $r$ objects from $n$.

**Prerequisites.** (1) Factorials and the meaning of $\binom{n}{r}=\dfrac{n!}{r!\,(n-r)!}$ from permutations and combinations. (2) Laws of indices, including negative and fractional powers. (3) Basic algebraic manipulation and solving linear and quadratic equations. If $\binom{n}{r}$ is new to you, spend an hour on combinations first; every topic here depends on it.

**Topic path.** Expansion and Pascal's triangle → general term and middle term → properties of coefficients and their sums → greatest term and applications such as remainders and divisibility.
""")
c.lesson(None, 'why_it_matters', 'main', r"""
Binomial theorem questions in JEE are reliably scoring: they test careful algebra with powers rather than deep ideas. Typical questions ask for a specific term (often the term independent of $x$), a coefficient, the sum of coefficients, the greatest term, or a remainder or last digits. The same machinery appears later in probability (binomial distribution), in series (approximations such as $(1+x)^n\approx1+nx$ for small $x$), and in calculus (the proof that $\frac{d}{dx}x^n=nx^{n-1}$).

**Syllabus note.** The official JEE syllabi cover the binomial theorem for a positive integral index, general and middle terms, and simple applications. Expansions for negative or fractional index are not part of that statement. The grouping into four topics is ORBIT's provisional crosswalk and may differ from Chaitanya's order for Class 9.
""")

# ---------- Topic 1 ----------
c.lesson(T1, 'introduction', 'foundation', r"""
**Starting from what you know.** Multiply out $(a+b)^3$ the slow way and the coefficients are $1,3,3,1$. For $(a+b)^4$ they are $1,4,6,4,1$. Each row can be built from the previous one: every entry is the sum of the two entries above it. This is **Pascal's triangle**.

Row 0: 1 | Row 1: 1 1 | Row 2: 1 2 1 | Row 3: 1 3 3 1 | Row 4: 1 4 6 4 1 | Row 5: 1 5 10 10 5 1.

The entries are exactly the numbers $\binom{n}{r}$: the entry in row $n$, position $r$ (starting from 0) equals $\binom{n}{r}$.
""")
c.lesson(T1, 'explanation', 'foundation', r"""
**The binomial theorem.** For any positive integer $n$,
$$(a+b)^n=\sum_{r=0}^{n}\binom{n}{r}a^{\,n-r}b^{\,r}=\binom n0a^n+\binom n1a^{n-1}b+\binom n2a^{n-2}b^2+\dots+\binom nnb^n.$$

**Things to notice.**
- There are $n+1$ terms.
- In every term the powers of $a$ and $b$ add to $n$. The power of $a$ falls from $n$ to $0$ while the power of $b$ rises from $0$ to $n$.
- The coefficients are symmetric: $\binom nr=\binom n{n-r}$, so the first and last coefficients are equal, the second and second-last are equal, and so on.
- Replacing $b$ by $-b$ gives $(a-b)^n=\sum(-1)^r\binom nr a^{n-r}b^r$: the signs alternate.
- Setting $a=1$ and $b=x$ gives the most-used form $(1+x)^n=\sum\binom nr x^r$.

**Why Pascal's rule holds.** $\binom nr+\binom n{r-1}=\binom{n+1}r$. This is the algebraic form of "each entry is the sum of the two above it".
""")
c.lesson(T1, 'derivation', 'main', r"""
**Why the coefficient is $\binom nr$ (counting argument).**
Write $(a+b)^n=(a+b)(a+b)\cdots(a+b)$ with $n$ brackets. To expand, choose either $a$ or $b$ from each bracket and multiply the choices. A product that contains $b$ exactly $r$ times (so $a$ exactly $n-r$ times) equals $a^{n-r}b^r$. How many ways give this product? We must decide which $r$ of the $n$ brackets supply the $b$: that is $\binom nr$ ways. Collecting all products with the same power gives the coefficient $\binom nr$.

**Proof of Pascal's rule.**
$\dbinom n{r-1}+\dbinom nr=\dfrac{n!}{(r-1)!(n-r+1)!}+\dfrac{n!}{r!(n-r)!}=\dfrac{n!}{r!(n-r+1)!}\bigl[r+(n-r+1)\bigr]=\dfrac{(n+1)!}{r!(n+1-r)!}=\dbinom{n+1}r$.

**Induction sketch.** Assume the theorem for $n$. Multiply both sides by $(a+b)$. The coefficient of $a^{n+1-r}b^r$ in the product is $\binom nr+\binom n{r-1}$, which equals $\binom{n+1}r$ by Pascal's rule, giving the theorem for $n+1$.
""")
c.lesson(T1, 'example', 'foundation', r"""
**Example 1.** Expand $(x+2)^4$.
Use $\binom4r=1,4,6,4,1$ and powers of $2$: $1,2,4,8,16$.
$(x+2)^4=x^4+4\cdot2\,x^3+6\cdot4\,x^2+4\cdot8\,x+16=x^4+8x^3+24x^2+32x+16$.
""")
c.lesson(T1, 'example', 'main', r"""
**Example 2 (with signs and coefficients).** Expand $(2x-3y)^3$.
Treat it as $(a+b)^3$ with $a=2x$ and $b=-3y$:
$\binom30(2x)^3+\binom31(2x)^2(-3y)+\binom32(2x)(-3y)^2+\binom33(-3y)^3=8x^3-36x^2y+54xy^2-27y^3$.
*Trap.* Keep the negative sign inside $b$ before raising to a power; $(-3y)^2$ is positive and $(-3y)^3$ is negative.

**Example 3 (approximation).** Estimate $(1.01)^5$ to four decimal places using the first three terms.
$(1+0.01)^5\approx1+5(0.01)+10(0.01)^2=1+0.05+0.001=1.0510$. The exact value is $1.0510100\ldots$; later terms are tiny.
""")
c.lesson(T1, 'example', 'advanced', r"""
**Example 4 (cancelling terms).** Evaluate $(\sqrt2+1)^5+(\sqrt2-1)^5$.
Write $a=\sqrt2$ and $b=\pm1$. In the sum of the two expansions the terms with an odd power of $b$ cancel and the terms with an even power of $b$ double:
$2\left[\binom50(\sqrt2)^5+\binom52(\sqrt2)^3+\binom54(\sqrt2)\right]=2\left[4\sqrt2+10\cdot2\sqrt2+5\sqrt2\right]=2\cdot29\sqrt2=58\sqrt2$.
*Check.* $(\sqrt2+1)^5\approx82.0122$ and $(\sqrt2-1)^5\approx0.01219$; sum $\approx82.0244=58\sqrt2$. ✓

**Example 5.** How many terms does $(x+y)^{10}+(x-y)^{10}$ have after simplification? Odd powers of $y$ cancel and even powers double, leaving the terms with $r=0,2,4,6,8,10$: that is $6$ terms.
""")
c.lesson(T1, 'common_mistakes', 'foundation', r"""
1. Forgetting that $(a+b)^n$ has $n+1$ terms, not $n$.
2. Dropping the sign of $b$ when it is negative, or the coefficient when $b=kx$: $(2x)^3=8x^3$, not $2x^3$.
3. Writing $(a+b)^n=a^n+b^n$.
4. Using $\binom nr$ with $r>n$ or negative $r$ (the value is $0$ in expansions).
5. Mixing up which variable carries the power $r$: in $\binom nr a^{n-r}b^r$ the lower index equals the power of the second term.
""")
c.lesson(T1, 'tips', 'main', r"""
- For small $n$ write Pascal's triangle; for larger $n$ use $\binom nr=\binom n{r-1}\cdot\dfrac{n-r+1}{r}$ to build coefficients one after another.
- Check an expansion by putting $a=b=1$: the coefficients must add up to $2^n$.
- For $(a+b)^n\pm(a-b)^n$ keep only even or odd powers of $b$.
""")
c.lesson(T1, 'summary', 'foundation', r"""
$(a+b)^n=\sum_{r=0}^{n}\binom nr a^{n-r}b^r$. $n+1$ terms; powers of $a$ and $b$ add to $n$; coefficients symmetric; $\binom nr+\binom n{r-1}=\binom{n+1}r$; coefficients add to $2^n$. $(1+x)^n=\sum\binom nr x^r$.
""")
c.lesson(T1, 'mini_assessment', 'foundation', r"""
**Check yourself.**
1. Write the row of Pascal's triangle for $n=6$.
2. Expand $(1-x)^4$.
3. How many terms are there in $(2a-3b)^{12}$?

**Answers.** 1. $1,6,15,20,15,6,1$. 2. $1-4x+6x^2-4x^3+x^4$. 3. $13$.
""")
assert expand(2, 1, 4)[::-1] == [1, 8, 24, 32, 16]     # (x+2)^4 -> coefficients of x^4..x^0 are 1, 8, 24, 32, 16
p = expand(2, 1, 4)  # a=2 constant, b=1 coefficient of x: p[k] = coeff of x^k
assert p == [16, 32, 24, 8, 1]
# (2x - 3y)^3 with y=1 -> poly in x: coefficients of x^0..x^3 : (-3)^3, 3*(2)(9), 3*4*(-3), 8
assert expand(-3, 2, 3) == [-27, 54, -36, 8]
assert approx(1.01**5, 1.0510100501) and abs(1.01**5 - 1.0510) < 1e-4
assert approx((sqrt(2) + 1)**5 + (sqrt(2) - 1)**5, 58 * sqrt(2))
assert sum(1 for r in range(11) if r % 2 == 0) == 6
assert [comb(6, r) for r in range(7)] == [1, 6, 15, 20, 15, 6, 1]
assert all(comb(n, r) + comb(n, r - 1) == comb(n + 1, r) for n in range(1, 20) for r in range(1, n + 1))
assert expand(1, -1, 4) == [1, -4, 6, -4, 1]

# ---------- Topic 2 ----------
c.lesson(T2, 'introduction', 'main', r"""
**Why one term at a time.** For large $n$ nobody expands the whole thing. Questions ask for a single term: the term containing $x^5$, the term independent of $x$, the middle term. All of them are answered with one formula for the general term.

**Prerequisites.** The binomial theorem; laws of indices including negative powers ($1/x^2=x^{-2}$); solving a linear equation for the index $r$.
""")
c.lesson(T2, 'explanation', 'main', r"""
**General term.** In $(a+b)^n$ the $(r+1)$-th term is
$$T_{r+1}=\binom nr a^{\,n-r}b^{\,r},\qquad r=0,1,\dots,n.$$
Note the shift: the term number is one more than $r$.

**Method for a required power of $x$.**
1. Write $T_{r+1}$ with every factor, including signs and constants.
2. Combine all powers of $x$ into a single expression in $n$ and $r$.
3. Set the exponent equal to the required power and solve for $r$.
4. Accept $r$ only if it is an integer with $0\le r\le n$. If not, that power does not occur and the coefficient is $0$.
5. Evaluate the coefficient with that $r$.
The **term independent of $x$** is the case where the power of $x$ is zero.

**Middle term(s).** The expansion has $n+1$ terms.
- If $n$ is even there is one middle term: $T_{\frac n2+1}$.
- If $n$ is odd there are two middle terms: $T_{\frac{n+1}2}$ and $T_{\frac{n+3}2}$.

**Ratios.** $\dfrac{T_{r+1}}{T_r}=\dfrac{n-r+1}{r}\cdot\dfrac ba$. This is useful for locating the greatest term and for questions where coefficients of consecutive terms are given in a ratio.
""")
c.lesson(T2, 'derivation', 'main', r"""
**Where the middle-term rule comes from.** There are $n+1$ terms in a row. If $n+1$ is odd (so $n$ is even) there is exactly one centre, at position $\tfrac{n+1+1}{2}=\tfrac n2+1$. If $n+1$ is even (so $n$ is odd) there are two centres, at positions $\tfrac{n+1}2$ and $\tfrac{n+1}2+1=\tfrac{n+3}2$.

**Where the ratio comes from.**
$\dfrac{T_{r+1}}{T_r}=\dfrac{\binom nr a^{n-r}b^r}{\binom n{r-1}a^{n-r+1}b^{r-1}}=\dfrac{\binom nr}{\binom n{r-1}}\cdot\dfrac ba=\dfrac{n-r+1}{r}\cdot\dfrac ba$, using $\dfrac{\binom nr}{\binom n{r-1}}=\dfrac{(r-1)!\,(n-r+1)!}{r!\,(n-r)!}=\dfrac{n-r+1}{r}$.
""")
c.lesson(T2, 'example', 'foundation', r"""
**Example 1.** Find the middle term of $\left(x+\dfrac1x\right)^{10}$.
$n=10$ is even, so the middle term is $T_6$: $\binom{10}{5}x^{5}\left(\dfrac1x\right)^{5}=252$. It is a constant.
""")
c.lesson(T2, 'example', 'main', r"""
**Example 2 (term independent of $x$).** Find the term independent of $x$ in $\left(x^2+\dfrac1x\right)^9$.
$T_{r+1}=\binom9r(x^2)^{9-r}\left(\dfrac1x\right)^r=\binom9r x^{18-2r-r}=\binom9r x^{18-3r}$.
Set $18-3r=0\Rightarrow r=6$, an integer between $0$ and $9$. The term is $\binom96=84$.

**Example 3 (a given power).** Find the coefficient of $x^3$ in $\left(2x^2-\dfrac3x\right)^6$.
$T_{r+1}=\binom6r(2x^2)^{6-r}\left(-\dfrac3x\right)^r=\binom6r2^{6-r}(-3)^r\,x^{12-3r}$.
$12-3r=3\Rightarrow r=3$. Coefficient $=\binom63\cdot2^3\cdot(-3)^3=20\cdot8\cdot(-27)=-4320$.
""")
c.lesson(T2, 'example', 'advanced', r"""
**Example 4 (ratio of consecutive coefficients).** The coefficients of three consecutive terms in the expansion of $(1+x)^n$ are in the ratio $1:7:42$. Find $n$.
Let the terms be $T_r,T_{r+1},T_{r+2}$, so the coefficients are $\binom n{r-1},\binom nr,\binom n{r+1}$.
$\dfrac{\binom nr}{\binom n{r-1}}=\dfrac{n-r+1}{r}=7\Rightarrow n=8r-1$.
$\dfrac{\binom n{r+1}}{\binom nr}=\dfrac{n-r}{r+1}=6\Rightarrow n=7r+6$.
Equating: $8r-1=7r+6\Rightarrow r=7$ and $n=55$.
*Check.* $\binom{55}{6}:\binom{55}{7}:\binom{55}{8}=1:7:42$. ✓

**Example 5 (existence).** Is there a term containing $x^{10}$ in $\left(x^2+\dfrac1x\right)^9$? The exponent is $18-3r=10\Rightarrow r=\tfrac83$, not an integer. So no such term exists and its coefficient is $0$.
""")
c.lesson(T2, 'common_mistakes', 'main', r"""
1. Confusing $T_r$ and $T_{r+1}$: the formula $\binom nr a^{n-r}b^r$ is the $(r+1)$-th term.
2. Losing the constant or sign: $(2x^2)^{6-r}$ contributes $2^{6-r}$, and $(-3/x)^r$ contributes $(-3)^r$.
3. Mishandling the exponent of $x$ when a factor is in the denominator: $(1/x)^r=x^{-r}$.
4. Accepting a non-integer or out-of-range $r$.
5. For $n$ odd, giving only one middle term.
""")
c.lesson(T2, 'tips', 'main', r"""
- Collect the exponent as $\alpha n+\beta r$ before solving; it avoids sign slips.
- The term independent of $x$ is the "constant term": solve exponent $=0$.
- When two binomials multiply, find the needed power from each pair of terms (e.g. $x^3$ from $x^{p}$ in one and $x^{3-p}$ in the other) and add.
""")
c.lesson(T2, 'summary', 'main', r"""
$T_{r+1}=\binom nr a^{n-r}b^r$. Middle term: $n$ even $\Rightarrow T_{n/2+1}$; $n$ odd $\Rightarrow T_{(n+1)/2},T_{(n+3)/2}$. For power $x^k$: solve exponent $=k$ for integer $r\in[0,n]$. $T_{r+1}/T_r=\frac{n-r+1}{r}\cdot\frac ba$.
""")
c.lesson(T2, 'mini_assessment', 'main', r"""
**Check yourself.**
1. Find the 4th term of $(x-2y)^7$.
2. Find the term independent of $x$ in $\left(x-\dfrac1x\right)^8$.
3. How many middle terms are there in $(a+b)^{11}$ and which are they?

**Answers.** 1. $T_4=\binom73x^4(-2y)^3=-280x^4y^3$. 2. $r=4$: $\binom84=70$. 3. Two: $T_6$ and $T_7$.
""")
assert comb(10, 5) == 252
assert comb(9, 6) == 84 and 18 - 3 * 6 == 0
assert comb(6, 3) * 2**3 * (-3)**3 == -4320 and 12 - 3 * 3 == 3
# brute force check of the x^3 coefficient of (2x^2 - 3/x)^6, using x^6 * (...) = (2x^3 - 3)^6 -> coefficient of x^9
# (2x^2 - 3x^-1)^6 = x^-6 (2x^3 - 3)^6 ; need x^3 -> x^9 in (2x^3-3)^6 ; with y=x^3: coefficient of y^3
assert expand(-3, 2, 6)[3] == -4320
assert expand(0, 1, 1) == [0, 1]
r = 7; n = 55
assert comb(n, r) * 1 == 7 * comb(n, r - 1) and comb(n, r + 1) == 6 * comb(n, r)
assert comb(n, r + 1) * 1 == 42 * comb(n, r - 1)
assert (18 - 10) % 3 != 0
assert comb(7, 3) * (-2)**3 == -280 and comb(8, 4) == 70 and (11 + 1) // 2 == 6

# ---------- Topic 3 ----------
c.lesson(T3, 'introduction', 'main', r"""
**The idea.** The coefficients $\binom n0,\binom n1,\dots,\binom nn$ satisfy several neat relations, and a handful of substitutions ($x=1$, $x=-1$, differentiation, comparing coefficients) turn an expansion into sums of coefficients. Writing $C_r=\binom nr$ shortens the notation.

**Prerequisites.** The binomial theorem for $(1+x)^n$; the formula $\binom nr=\dfrac{n!}{r!(n-r)!}$; the idea of equating coefficients of equal powers on two sides of an identity.
""")
c.lesson(T3, 'explanation', 'main', r"""
**Basic properties.**
1. $C_r=C_{n-r}$ (symmetry).
2. $C_r+C_{r-1}=\binom{n+1}{r}$ (Pascal).
3. $r\,C_r=n\binom{n-1}{r-1}$ (the workhorse for sums that contain a factor $r$).
4. If $C_x=C_y$ then $x=y$ or $x+y=n$.

**Sums of coefficients.**
- $C_0+C_1+\dots+C_n=2^n$ (put $x=1$ in $(1+x)^n$).
- $C_0-C_1+C_2-\dots=0$ (put $x=-1$), so the sum of even-indexed coefficients equals the sum of odd-indexed ones: each is $2^{n-1}$.
- $\sum_{r}r\,C_r=n2^{n-1}$.
- $\sum_{r}r^2C_r=n(n+1)2^{n-2}$.
- $C_0^2+C_1^2+\dots+C_n^2=\dbinom{2n}{n}$.

**Sum of coefficients of a polynomial.** To find the sum of all coefficients in an expansion, put $x=1$ (or all variables equal to $1$).
""")
c.lesson(T3, 'derivation', 'advanced', r"""
**$\sum rC_r=n2^{n-1}$.** Use $rC_r=n\binom{n-1}{r-1}$, which follows from $r\cdot\dfrac{n!}{r!(n-r)!}=\dfrac{n\,(n-1)!}{(r-1)!\,(n-r)!}$. Then $\sum_{r\ge1}rC_r=n\sum_{r\ge1}\binom{n-1}{r-1}=n\,2^{n-1}$.

**$\sum r^2C_r=n(n+1)2^{n-2}$.** Write $r^2=r(r-1)+r$. For the first part, $r(r-1)C_r=n(n-1)\binom{n-2}{r-2}$, which sums to $n(n-1)2^{n-2}$. Adding the second part: $n(n-1)2^{n-2}+n2^{n-1}=n2^{n-2}\,[(n-1)+2]=n(n+1)2^{n-2}$.

**$\sum C_r^2=\binom{2n}{n}$.** The coefficient of $x^n$ in $(1+x)^{2n}$ is $\binom{2n}n$. Also $(1+x)^{2n}=(1+x)^n(1+x)^n$, and the coefficient of $x^n$ in the product is $\sum_{r}C_r\,C_{n-r}=\sum_rC_r^2$ by symmetry.
""")
c.lesson(T3, 'example', 'foundation', r"""
**Example 1.** Find $\binom{10}0+\binom{10}1+\dots+\binom{10}{10}$. $=2^{10}=1024$.

**Example 2.** If $\binom{12}x=\binom{12}{2x-3}$ find $x$. Either $x=2x-3\Rightarrow x=3$, or $x+(2x-3)=12\Rightarrow x=5$. Both are valid since $0\le2x-3\le12$ holds for $x=3$ and $x=5$.
""")
c.lesson(T3, 'example', 'main', r"""
**Example 3.** Evaluate $\sum_{r=0}^{10}r\binom{10}{r}$. $=10\cdot2^9=5120$.

**Example 4.** Find $\sum_{r=0}^{5}\binom5r^2$. $=\binom{10}5=252$. *Check by direct addition:* $1+25+100+100+25+1=252$. ✓

**Example 5.** Find the sum of the coefficients in the expansion of $(2x-3)^5$. Put $x=1$: $(2-3)^5=-1$.
""")
c.lesson(T3, 'example', 'advanced', r"""
**Example 6.** Evaluate $\sum_{r=0}^{5}r^2\binom5r$. Using $n(n+1)2^{n-2}=5\cdot6\cdot8=240$. *Direct check:* $0+5+4\cdot10+9\cdot10+16\cdot5+25=240$. ✓

**Example 7 (even-indexed sum).** Find $\binom{20}{0}+\binom{20}{2}+\dots+\binom{20}{20}$. The even-indexed and odd-indexed sums are equal and add to $2^{20}$, so each is $2^{19}=524288$.
""")
c.lesson(T3, 'common_mistakes', 'main', r"""
1. Forgetting that $\sum r\,C_r$ starts at $r=1$ (the $r=0$ term is zero), so the shifted sum has $n-1$ as its new index.
2. Using $2^n$ for the sum of **even-indexed** coefficients; it is $2^{n-1}$.
3. Using $C_x=C_y\Rightarrow x=y$ only; the second possibility $x+y=n$ is easy to miss.
4. For $r^2C_r$, trying to reduce it in one step; split $r^2=r(r-1)+r$.
""")
c.lesson(T3, 'tips', 'advanced', r"""
- Whenever a sum has a factor $r$ or $r(r-1)$ in front of $C_r$, use $rC_r=n\binom{n-1}{r-1}$.
- Whenever a sum has alternating signs, think $x=-1$. Whenever it has plain sums, think $x=1$.
- Products of coefficients usually signal "compare the coefficient of the same power on both sides of $(1+x)^m(1+x)^n=(1+x)^{m+n}$".
""")
c.lesson(T3, 'summary', 'main', r"""
$C_r=C_{n-r}$; $C_r+C_{r-1}=\binom{n+1}r$; $rC_r=n\binom{n-1}{r-1}$. $\sum C_r=2^n$; $\sum(-1)^rC_r=0$; even sum $=$ odd sum $=2^{n-1}$; $\sum rC_r=n2^{n-1}$; $\sum r^2C_r=n(n+1)2^{n-2}$; $\sum C_r^2=\binom{2n}n$.
""")
c.lesson(T3, 'mini_assessment', 'main', r"""
**Check yourself.**
1. $\sum_{r=0}^{8}\binom8r$.
2. $\sum_{r=0}^{6}r\binom6r$.
3. If $\binom{15}{a}=\binom{15}{b}$ with $a\ne b$, what is $a+b$?

**Answers.** 1. $256$. 2. $6\cdot2^5=192$. 3. $15$.
""")
assert sum(comb(10, r) for r in range(11)) == 1024
assert sorted(x for x in range(0, 14) if 0 <= 2 * x - 3 <= 12 and comb(12, x) == comb(12, 2 * x - 3)) == [3, 5]
assert sum(r * comb(10, r) for r in range(11)) == 10 * 2**9 == 5120
assert sum(comb(5, r)**2 for r in range(6)) == comb(10, 5) == 252
assert (2 - 3)**5 == -1
assert sum(r * r * comb(5, r) for r in range(6)) == 5 * 6 * 2**3 == 240
assert sum(comb(20, r) for r in range(0, 21, 2)) == 2**19 == 524288
assert all(sum(r * r * comb(n, r) for r in range(n + 1)) == n * (n + 1) * 2**(n - 2) for n in range(2, 15))
assert all(sum(comb(n, r)**2 for r in range(n + 1)) == comb(2 * n, n) for n in range(1, 15))
assert sum(r * comb(6, r) for r in range(7)) == 192

# ---------- Topic 4 ----------
c.lesson(T4, 'introduction', 'main', r"""
**Two kinds of question.** (1) Which term of $(a+b)^n$ is the largest, and what is the largest coefficient? (2) How do we use the theorem to find a remainder, last digits, or to prove divisibility? Both use the same idea: how terms grow and shrink, and how powers of a number close to a multiple of the divisor can be written as $(\text{multiple}+\text{small})^n$.

**Prerequisites.** General term and ratio of consecutive terms (previous topics); divisibility and remainders; inequalities.
""")
c.lesson(T4, 'explanation', 'main', r"""
**Greatest binomial coefficient.** In $(1+x)^n$:
- $n$ even: the greatest coefficient is $\binom n{n/2}$.
- $n$ odd: the greatest coefficients are $\binom n{(n-1)/2}=\binom n{(n+1)/2}$ (two equal ones).

**Numerically greatest term.** For $(a+b)^n$ with given numbers $a,b$, the ratio $\dfrac{T_{r+1}}{T_r}=\dfrac{n-r+1}{r}\cdot\left|\dfrac ba\right|$ decreases as $r$ increases. A term is at least as large as the one before it while the ratio is at least $1$:
$$\frac{n-r+1}{r}\left|\frac ba\right|\ge1\iff r\le m,\qquad m=\frac{(n+1)\left|b/a\right|}{1+\left|b/a\right|}.$$
- If $m$ is not an integer, the greatest term is $T_{\lfloor m\rfloor+1}$.
- If $m$ is an integer, $T_m$ and $T_{m+1}$ are equal and both are greatest.

**Remainders and divisibility.** Write the number as (multiple of the divisor) $\pm$ small number, expand using the binomial theorem, and observe that every term except the last few is a multiple of the divisor.
""")
c.lesson(T4, 'derivation', 'advanced', r"""
**Why the greatest term formula works.** The ratio $\rho(r)=\dfrac{T_{r+1}}{T_r}=\dfrac{n-r+1}{r}k$ with $k=|b/a|$ is a decreasing function of $r$ for $r\ge1$ (the fraction $\frac{n-r+1}{r}$ falls as $r$ rises). So terms increase while $\rho\ge1$ and then decrease. Solving $\rho(r)\ge1$:
$(n-r+1)k\ge r\iff(n+1)k\ge r(1+k)\iff r\le\dfrac{(n+1)k}{1+k}=m$.
Thus $T_{r+1}\ge T_r$ for $r\le m$ and $T_{r+1}<T_r$ for $r>m$. The last increasing step is at $r=\lfloor m\rfloor$, so the maximum is at $T_{\lfloor m\rfloor+1}$. If $m$ is an integer then at $r=m$ the ratio equals $1$ exactly, so $T_{m+1}=T_m$.

**Why remainder tricks work.** If the divisor is $d$ and the base is $kd\pm1$, then $(kd\pm1)^N=\sum\binom Nr(kd)^{N-r}(\pm1)^r$ and every term except $r=N$ contains the factor $d$. So $(kd\pm1)^N\equiv(\pm1)^N\pmod d$.
""")
c.lesson(T4, 'example', 'foundation', r"""
**Example 1.** Greatest coefficient of $(1+x)^{10}$: $n$ even, so $\binom{10}5=252$.

**Example 2.** Last two digits of $11^{10}$. $11^{10}=(10+1)^{10}=1+10\cdot10+45\cdot100+\dots\equiv1+100\equiv01\pmod{100}$. The last two digits are $01$.
""")
c.lesson(T4, 'example', 'main', r"""
**Example 3 (numerically greatest term).** For $(3+2x)^9$ at $x=1$, find the numerically greatest term.
Here $a=3$, $b=2x=2$, so $k=\tfrac23$. $m=\dfrac{(9+1)\cdot\frac23}{1+\frac23}=\dfrac{20/3}{5/3}=4$, an integer. So $T_4$ and $T_5$ are equal and both greatest.
*Check.* $T_4=\binom93\,3^6\,2^3=84\cdot729\cdot8=489888$ and $T_5=\binom94\,3^5\,2^4=126\cdot243\cdot16=489888$. ✓

**Example 4 (remainder).** Remainder when $7^{103}$ is divided by $25$.
$7^2=49=50-1$, so $7^{103}=7\,(7^2)^{51}=7(50-1)^{51}$. Every term of $(50-1)^{51}$ except $(-1)^{51}=-1$ is a multiple of $50$, hence of $25$. So $7^{103}\equiv7\cdot(-1)=-7\equiv18\pmod{25}$. The remainder is $18$.
""")
c.lesson(T4, 'example', 'advanced', r"""
**Example 5 (divisibility proof).** Show that $2^{3n}-7n-1$ is divisible by $49$ for every positive integer $n$.
$2^{3n}=8^n=(1+7)^n=1+7n+\binom n27^2+\binom n37^3+\dots$.
Hence $2^{3n}-7n-1=\binom n27^2+\binom n37^3+\dots$, and each term has a factor $7^2=49$. ∎

**Example 6 (comparing sizes).** Which is larger, $99^{50}+100^{50}$ or $101^{50}$?
Write $101^{50}=(100+1)^{50}$ and $99^{50}=(100-1)^{50}$. Then $101^{50}-99^{50}=2\left[\binom{50}{1}100^{49}+\binom{50}{3}100^{47}+\dots\right]$, and the first term of this bracket is $50\cdot100^{49}=\dfrac{100^{50}}{2}$. So $101^{50}-99^{50}=100^{50}+2\left[\binom{50}3 100^{47}+\dots\right]>100^{50}$. Therefore $101^{50}>99^{50}+100^{50}$.
""")
c.lesson(T4, 'common_mistakes', 'main', r"""
1. Using the coefficient ratio instead of the **term** ratio: the factor $|b/a|$ must be included for numerically greatest terms.
2. Forgetting to check whether $m$ is an integer (two equal greatest terms).
3. Taking the floor of $m$ and calling that the term number; the term is $T_{\lfloor m\rfloor+1}$.
4. For remainders, splitting a number as a multiple of the divisor plus a number that is not small, so the leftover terms are not obviously multiples.
5. Ignoring the sign: $(−1)^N$ depends on whether $N$ is even or odd.
""")
c.lesson(T4, 'tips', 'main', r"""
- Greatest coefficient: pick the middle one. Greatest term (numerical): use $m$.
- Remainder by $d$: find a power of the base that is $\pm1$ modulo $d$, or write the base as $kd\pm1$.
- To prove "divisible by $d^2$", expand $(1+d)^n$ and subtract the first two terms.
""")
c.lesson(T4, 'summary', 'main', r"""
Greatest coefficient of $(1+x)^n$: $\binom n{n/2}$ ($n$ even), or $\binom n{(n\pm1)/2}$ ($n$ odd). Numerically greatest term of $(a+b)^n$: $m=\frac{(n+1)k}{1+k}$ with $k=|b/a|$; term $T_{\lfloor m\rfloor+1}$, or $T_m=T_{m+1}$ if $m$ is an integer. Remainders: write the base as multiple $\pm1$ and expand. $(1+d)^n-1-nd$ is divisible by $d^2$.
""")
c.lesson(T4, 'mini_assessment', 'main', r"""
**Check yourself.**
1. Greatest binomial coefficient in $(1+x)^{9}$.
2. Remainder when $3^{50}$ is divided by $8$.
3. In $(1+2x)^{8}$ at $x=1$ which term is numerically greatest?

**Answers.** 1. $\binom94=\binom95=126$. 2. $3^2=9\equiv1\pmod 8$, so $3^{50}\equiv1$: remainder $1$. 3. $k=2$, $m=\dfrac{9\cdot2}{3}=6$ (an integer): $T_6$ and $T_7$ are equal and greatest.
""")
assert comb(10, 5) == max(comb(10, r) for r in range(11))
assert max(comb(9, r) for r in range(10)) == comb(9, 4) == comb(9, 5) == 126
assert 11**10 % 100 == 1
n, a, b = 9, 3, 2
terms = [comb(n, r) * a**(n - r) * b**r for r in range(n + 1)]
assert terms[3] == terms[4] == max(terms) == 489888
assert pow(7, 103, 25) == 18
assert all((2**(3 * n) - 7 * n - 1) % 49 == 0 for n in range(1, 60))
assert 101**50 > 99**50 + 100**50
assert pow(3, 50, 8) == 1
t = [comb(8, r) * 2**r for r in range(9)]
assert t.index(max(t)) in (5, 6) and t[5] == t[6]
# check the m formula against brute force for many (n, a, b)
for n in range(1, 25):
    for a in range(1, 6):
        for b in range(1, 6):
            t = [comb(n, r) * a**(n - r) * b**r for r in range(n + 1)]
            k = b / a
            m = (n + 1) * k / (1 + k)
            best = [i + 1 for i, v in enumerate(t) if v == max(t)]
            if abs(m - round(m)) < 1e-9:
                assert round(m) in best and round(m) + 1 in best
            else:
                assert best == [floor(m) + 1]

# ---------- Formulas ----------
c.formula(T1, 'Binomial theorem', r'(a+b)^n = \sum_{r=0}^{n}\binom{n}{r}a^{n-r}b^{r}', [('n', 'a positive integer'), ('a, b', 'any numbers or expressions'), ('r', 'index of the term, 0 to n')],
          'n is a positive integer', 'n + 1 terms; the powers of a and b add to n.')
c.formula(T1, 'Pascal’s rule', r'\binom{n}{r}+\binom{n}{r-1}=\binom{n+1}{r}', [('n', 'a non-negative integer'), ('r', 'an integer with 1 ≤ r ≤ n')], '1 ≤ r ≤ n')
c.formula(T2, 'General term', r'T_{r+1}=\binom{n}{r}a^{n-r}b^{r}', [('T_{r+1}', 'the (r+1)-th term'), ('r', '0, 1, ..., n')], 'The term number is one more than r.')
c.formula(T2, 'Middle term', r'T_{\frac n2+1}\ (n\text{ even});\quad T_{\frac{n+1}2},\,T_{\frac{n+3}2}\ (n\text{ odd})', [('n', 'the index of the expansion')], 'There are n + 1 terms in total.')
c.formula(T2, 'Ratio of consecutive terms', r'\dfrac{T_{r+1}}{T_r}=\dfrac{n-r+1}{r}\cdot\dfrac{b}{a}', [('a, b', 'the two terms of the binomial'), ('r', 'index with 1 ≤ r ≤ n')], '1 ≤ r ≤ n, a ≠ 0')
c.formula(T3, 'Sum of all binomial coefficients', r'\binom n0+\binom n1+\dots+\binom nn=2^n', [('n', 'a non-negative integer')], 'n ≥ 0', 'Put x = 1 in (1 + x)^n.')
c.formula(T3, 'Sum of even-indexed coefficients', r'\binom n0+\binom n2+\binom n4+\dots=2^{n-1}', [('n', 'a positive integer')], 'n ≥ 1', 'Equal to the sum of the odd-indexed coefficients.')
c.formula(T3, 'Sum of r times the coefficient', r'\sum_{r=0}^{n}r\binom nr=n\,2^{n-1}', [('n', 'a positive integer')], 'n ≥ 1', 'Uses r·C(n,r) = n·C(n−1, r−1).')
c.formula(T3, 'Sum of r squared times the coefficient', r'\sum_{r=0}^{n}r^2\binom nr=n(n+1)2^{n-2}', [('n', 'an integer, n ≥ 2')], 'n ≥ 2')
c.formula(T3, 'Sum of squares of coefficients', r'\sum_{r=0}^{n}\binom nr^2=\binom{2n}{n}', [('n', 'a non-negative integer')], 'n ≥ 0', 'Compare the coefficient of x^n in (1+x)^(2n) = (1+x)^n(1+x)^n.')
c.formula(T4, 'Numerically greatest term', r'm=\dfrac{(n+1)\,|b/a|}{1+|b/a|}', [('m', 'cut-off index'), ('n', 'index of the expansion'), ('a, b', 'the two terms, as numbers (b/a is used as an absolute value)')], 'For (a + b)^n with given numerical a and b. If m is not an integer the greatest term is T(floor(m)+1); if m is an integer, T(m) = T(m+1) are both greatest.')

# ---------- Questions ----------
c.mcq(T1, r'The coefficient of $x^2$ in the expansion of $(1+x)^6$ is', [('6', 6), ('12', 12), ('15', 15), ('20', 20)], 2, expand(1, 1, 6)[2], 'foundation', r'$\binom62=15$.')
c.mcq(T1, r'The number of terms in the expansion of $(2x-3y)^{9}$ is', [('9', 9), ('10', 10), ('11', 11), ('18', 18)], 1, len(expand(1, 1, 9)), 'foundation', r'There are $n+1=10$ terms.')
c.mcq(T1, r'The sum of the coefficients in the expansion of $(3x-2)^4$ is', [('1', 1), ('16', 16), ('81', 81), ('-1', -1)], 0, (3 - 2)**4, 'foundation', r'Put $x=1$: $(3-2)^4=1$.')
c.mcq(T1, r'The coefficient of $x$ in the expansion of $(2x-3)^3$ is', [('36', 36), ('-36', -36), ('54', 54), ('-27', -27)], 2, expand(-3, 2, 3)[1], 'main', r'$\binom31\cdot2x\cdot(-3)^2=3\cdot2\cdot9=54$.')
c.mcq(T1, r'$(\sqrt3+1)^4+(\sqrt3-1)^4$ equals', [('56', 56), ('28', 28), ('16', 16), ('0', 0)], 0, (sqrt(3) + 1)**4 + (sqrt(3) - 1)**4, 'main', r'$2\left[\binom40\cdot9+\binom42\cdot3+\binom44\right]=2(9+18+1)=56$.')
c.integer(T2, r'Find the term independent of $x$ in $\left(x^2+\dfrac1x\right)^{9}$.', 84, 'main', r'$18-3r=0\Rightarrow r=6$, giving $\binom96=84$.')
c.integer(T2, r'Find the coefficient of $x^3$ in $\left(2x^2-\dfrac3x\right)^{6}$.', -4320, 'main', r'$12-3r=3\Rightarrow r=3$, coefficient $\binom63\cdot2^3\cdot(-3)^3=-4320$.')
c.mcq(T2, r'The middle term of $\left(x+\dfrac1x\right)^{10}$ is', [('252', 252), ('210', 210), ('120', 120), ('45', 45)], 0, comb(10, 5), 'foundation', r'$T_6=\binom{10}5=252$.')
c.mcq(T2, r'The 4th term in the expansion of $(x-2y)^7$ has coefficient', [('280', 280), ('-280', -280), ('35', 35), ('-560', -560)], 1, comb(7, 3) * (-2)**3, 'main', r'$T_4=\binom73x^4(-2y)^3$, coefficient $35\cdot(-8)=-280$.')
c.integer(T2, r'If the coefficients of three consecutive terms in $(1+x)^n$ are in the ratio $1:7:42$, find $n$.', 55, 'advanced', r'Ratios give $n=8r-1$ and $n=7r+6$, so $r=7$ and $n=55$.')
c.mcq(T2, r'The coefficient of $x^{10}$ in $\left(x^2+\dfrac1x\right)^{9}$ is', [('0', 0), ('84', 84), ('126', 126), ('36', 36)], 0, 0, 'main', r'$18-3r=10$ gives $r=\tfrac83$, not an integer, so there is no such term.')
c.mcq(T3, r'$\binom{10}{0}+\binom{10}{1}+\dots+\binom{10}{10}$ equals', [('512', 512), ('1024', 1024), ('2048', 2048), ('100', 100)], 1, 2**10, 'foundation', r'Put $x=1$ in $(1+x)^{10}$.')
c.mcq(T3, r'$\sum_{r=0}^{10}r\binom{10}{r}$ equals', [('1024', 1024), ('2560', 2560), ('5120', 5120), ('10240', 10240)], 2, sum(r * comb(10, r) for r in range(11)), 'main', r'$n2^{n-1}=10\cdot512=5120$.')
c.mcq(T3, r'$\sum_{r=0}^{5}\binom5r^2$ equals', [('32', 32), ('100', 100), ('252', 252), ('120', 120)], 2, sum(comb(5, r)**2 for r in range(6)), 'main', r'$\binom{10}{5}=252$.')
c.integer(T3, r'Find $\binom{20}{0}+\binom{20}{2}+\binom{20}{4}+\dots+\binom{20}{20}$ divided by $2^{15}$.', 16, 'advanced', r'The sum is $2^{19}$, and $2^{19}/2^{15}=16$.')
c.multi(T3, r'Which of the following equal $\binom{12}{5}$?', [
    (r'$\binom{12}{7}$', comb(12, 7) == comb(12, 5)), (r'$\binom{11}{5}+\binom{11}{4}$', comb(11, 5) + comb(11, 4) == comb(12, 5)),
    (r'$\binom{12}{6}$', comb(12, 6) == comb(12, 5)), (r'$\dfrac{12}{5}\binom{11}{4}$', 12 * comb(11, 4) == 5 * comb(12, 5)),
], 'main', r'Symmetry, Pascal’s rule and $r\binom nr=n\binom{n-1}{r-1}$ make the first, second and fourth true; $\binom{12}6\ne\binom{12}5$.')
c.integer(T4, r'The greatest coefficient in the expansion of $(1+x)^{12}$ is $\binom{12}{r}$. Find $r$.', 6, 'foundation', r'For even $n$ the middle coefficient is greatest: $r=\tfrac n2=6$.')
c.mcq(T4, r'The remainder when $7^{103}$ is divided by $25$ is', [('7', 7), ('18', 18), ('1', 1), ('24', 24)], 1, pow(7, 103, 25), 'advanced', r'$7^{103}=7(50-1)^{51}\equiv-7\equiv18\pmod{25}$.')
c.mcq(T4, r'The last two digits of $11^{10}$ are', [('01', 1), ('11', 11), ('21', 21), ('00', 0)], 0, 11**10 % 100, 'main', r'$(10+1)^{10}\equiv1+100\equiv1\pmod{100}$.')
c.mcq(T4, r'For $(1+2x)^8$ at $x=1$ the numerically greatest term(s) are', [(r'$T_5$ only', 0), (r'$T_6$ and $T_7$', 1), (r'$T_7$ only', 2), (r'$T_4$ and $T_5$', 3)], 1, 1, 'advanced', r'$k=2$, $m=\dfrac{9\cdot2}{3}=6$ is an integer so $T_6=T_7$ are both greatest (each $=1792$).', tol=0)
c.integer(T4, r'The remainder when $3^{50}$ is divided by $8$ is', 1, 'main', r'$3^2=9\equiv1\pmod8$, so $3^{50}=(3^2)^{25}\equiv1$.')

# ---------- Videos ----------
c.video(T2, 'IxIAQcEF_lc', 'Binomial Theorem 01 l Binomial Expansion l General Term l Middle term l JEE/BITSAT/CET/Class 11', 'GanitAnk', 'classroom', 'main',
        'A lecture covering expansion, the general term and the middle term; matches topics 1 and 2.')
c.video(T2, 'N_UotmakfE8', 'Binomial Expansion   Finding the Middle Term and Solving for x JEE 11th Maths Binomial Theorem', 'GetMiClass', 'examples', 'main',
        'Worked problems on the middle term. Use after the general-term lesson.')
c.video(T4, 'yyovTUfjnuU', 'BINOMIAL THEOREM 3- MIDDLE TERM, GREATEST BINOMIAL COEFFICIENT, NUMERICALLY GREATEST TERM IIT JEE', 'Learning With Passion ', 'main', 'main',
        'Covers greatest coefficient and numerically greatest term with JEE problems; matches topic 4.')
c.video(None, 'IqWK1Efj3ek', 'Binomial Theorem One Shot | JEE Main 2024 | RRR | Arvind Kalia Sir', 'JEE Nexus by Unacademy ', 'revision', 'main',
        'A one-shot revision of the whole chapter. Use after the four topics, not instead of them.')
c.dump('binomial-theorem.json')
