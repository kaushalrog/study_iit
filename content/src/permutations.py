from math import factorial, comb, perm
from lib import Chapter, approx

c = Chapter('Permutations')
T1 = c.topic('Fundamental principles of counting and factorials')
T2 = c.topic('Linear permutations of distinct and repeated objects')
T3 = c.topic('Circular permutations and constrained arrangements')
T4 = c.topic('Combinations, selections, and group distribution')

# ---------- overview ----------
c.lesson(None, 'introduction', 'foundation', r"""
**What this chapter is about.** Permutations and combinations form the bedrock of combinatorial mathematics and discrete probability in JEE. Permutations deal with *arrangements* where order matters (such as forming numbers, words, or queue positions), whereas combinations deal with *selections* where order does not matter (such as choosing a team or a committee).

**Prerequisites.** (1) Basic algebraic operations and summation notation. (2) Integer properties, prime factorisation, and divisibility. (3) Comfort with systematic case-by-case analysis.

**Topic path.** Fundamental principles of counting (multiplication and addition rules) and factorial algebra → linear permutations of distinct and repeated items → circular permutations and arrangements under constraints (gap method, block method) → combinations, selections, division into groups, and derangements.
""")

c.lesson(None, 'why_it_matters', 'main', r"""
In JEE Main and Advanced, Permutations and Combinations questions test logical clarity, precision, and the avoidance of double-counting. A single misconception about whether order matters or whether items are identical can alter an answer completely. Furthermore, modern JEE papers frequently intertwine counting principles with binomial expansions, probability distributions, and matrices. Mastering systematic counting strategies like the tie/block method, gap method, and group distribution is essential for consistent high marks.
""")

# ---------- Topic 1 ----------
c.lesson(T1, 'introduction', 'foundation', r"""
**Fundamental Principle of Multiplication.** If an event can occur in $m$ different ways, and following its occurrence another independent event can occur in $n$ different ways, then the total number of ways in which both events can occur in succession is $m \times n$.

**Fundamental Principle of Addition.** If an event can occur in $m$ ways and an alternative mutually exclusive event can occur in $n$ ways, then either the first event OR the second event can occur in $m + n$ ways.
""")

c.lesson(T1, 'explanation', 'foundation', r"""
**Factorial Notation.** For a positive integer $n$, the product of the first $n$ natural numbers is denoted by $n!$ (read "$n$ factorial"):
$$n! = n \times (n-1) \times (n-2) \times \dots \times 3 \times 2 \times 1.$$
By convention, $0! = 1$.

**Key Properties:**
- $n! = n \times (n-1)!$
- $\dfrac{n!}{r!} = n(n-1)\dots(r+1)$ for $n \ge r$.
- Factorials grow rapidly: $1! = 1$, $2! = 2$, $3! = 6$, $4! = 24$, $5! = 120$, $6! = 720$, $7! = 5040$.
""")

c.lesson(T1, 'derivation', 'main', r"""
**Exponent of a prime $p$ in $n!$ (Legendre's Formula).**
The highest power of a prime $p$ dividing $n!$, denoted $E_p(n!)$, is:
$$E_p(n!) = \left\lfloor\dfrac{n}{p}\right\rfloor + \left\lfloor\dfrac{n}{p^2}\right\rfloor + \left\lfloor\dfrac{n}{p^3}\right\rfloor + \dots$$
*Why this holds:* Among numbers $1, 2, \dots, n$, exactly $\lfloor n/p \rfloor$ are multiples of $p$. Each contributes at least one factor of $p$. The multiples of $p^2$, numbering $\lfloor n/p^2 \rfloor$, contribute a second factor of $p$, and so on. Summing over all powers gives the exact exponent.
""")

c.lesson(T1, 'example', 'foundation', r"""
**Example 1.** How many 3-digit numbers can be formed using digits $1, 2, 3, 4, 5$ if repetition of digits is allowed?
*Solution.* Hundred's place: 5 choices. Ten's place: 5 choices. Unit's place: 5 choices.
Total numbers $= 5 \times 5 \times 5 = 125$.
""")

c.lesson(T1, 'example', 'main', r"""
**Example 2.** Find the number of trailing zeroes in $100!$.
*Solution.* Trailing zeroes correspond to factors of $10 = 2 \times 5$. In $100!$, factors of 2 are strictly more numerous than factors of 5. Hence the count is determined by $E_5(100!)$:
$$E_5(100!) = \left\lfloor\dfrac{100}{5}\right\rfloor + \left\lfloor\dfrac{100}{25}\right\rfloor + \left\lfloor\dfrac{100}{125}\right\rfloor = 20 + 4 + 0 = 24.$$
Thus, $100!$ ends in exactly $24$ zeroes.
""")

c.lesson(T1, 'common_mistakes', 'foundation', r"""
*Common Pitfall:* Using addition instead of multiplication when events are compound/successive, or using multiplication instead of addition when cases are mutually exclusive alternatives. Always ask: "Does event A happen AND event B happen?" (multiplication) or "Does event A happen OR event B happen?" (addition).
""")

c.lesson(T1, 'tips', 'main', r"""
*Pro-tip:* When forming numbers with constraints (like even numbers, multiples of 5, or numbers greater than a threshold), always fill the most restricted position first (e.g. units digit or leading non-zero digit).
""")

c.lesson(T1, 'summary', 'foundation', r"""
Multiplication principle applies to sequential stages ($m \times n$). Addition principle applies to disjoint cases ($m + n$). Legendre's formula finds prime powers in factorials.
""")

# ---------- Topic 2 ----------
c.lesson(T2, 'introduction', 'foundation', r"""
**Permutations of Distinct Objects.** A permutation is an ordered arrangement of elements.
The number of arrangements of $n$ distinct objects taken $r$ at a time ($0 \le r \le n$) is denoted by $^nP_r$ or $P(n, r)$:
$$^nP_r = \dfrac{n!}{(n-r)!} = n(n-1)(n-2)\dots(n-r+1).$$
When $r = n$, $^nP_n = n!$.
""")

c.lesson(T2, 'explanation', 'foundation', r"""
**Permutations with Identical Objects.**
If there are $n$ objects of which $p$ are of one kind, $q$ of a second kind, $r$ of a third kind, and the remaining are all distinct, then the number of mutually distinguishable arrangements is:
$$\dfrac{n!}{p!\,q!\,r!\dots}$$
*Reasoning:* If the $p$ identical objects were made distinct, each arrangement would generate $p!$ arrangements. Dividing by $p!$ eliminates this artificial overcounting.
""")

c.lesson(T2, 'derivation', 'main', r"""
**Rank of a Word in a Dictionary.**
To find the rank of a word when all its permutations are listed alphabetically:
1. List letters in alphabetical order.
2. Count how many words begin with letters that precede the first letter of the target word.
3. Fix the first letter and repeat the process for subsequent letters until the target word is spelled out.
4. Add 1 to count the target word itself.
""")

c.lesson(T2, 'example', 'foundation', r"""
**Example 1.** In how many ways can the letters of the word **MATHEMATICS** be arranged?
*Solution.* Total letters $n = 11$. Letter counts: M: 2, A: 2, T: 2, H: 1, E: 1, I: 1, C: 1, S: 1.
Total distinct arrangements $= \dfrac{11!}{2!\,2!\,2!} = \dfrac{39916800}{8} = 4{,}989{,}600$.
""")

c.lesson(T2, 'example', 'main', r"""
**Example 2.** Find the rank of the word **RANK** in a dictionary.
*Solution.* Alphabetical order: A, K, N, R.
- Words starting with A: $3! = 6$
- Words starting with K: $3! = 6$
- Words starting with N: $3! = 6$
Next is R:
- Words starting with RA:
  - RAKN: 1
  - RANK: 1
Total rank $= 6 + 6 + 6 + 1 + 1 = 20$.
""")

c.lesson(T2, 'common_mistakes', 'foundation', r"""
*Trap:* Forgetting to divide by factorials of identical objects when letters repeat, or double-counting permutations when applying symmetrical conditions.
""")

c.lesson(T2, 'tips', 'main', r"""
*Fast Trick for Rank:* For letters with no repetitions, write the rank formula as $\sum (\text{count of smaller letters to the right}) \times (\text{remaining positions})! + 1$.
""")

c.lesson(T2, 'summary', 'foundation', r"""
Distinct linear permutations $= n! / (n-r)!$. Permutations of multiset $= n! / (p! q! \dots)$. Rank problems count preceding permutations alphabetically.
""")

# ---------- Topic 3 ----------
c.lesson(T3, 'introduction', 'foundation', r"""
**Circular Permutations.**
When $n$ distinct objects are arranged in a closed circle, rotating the circle does not create a new relative arrangement.
The number of circular permutations of $n$ distinct objects is:
$$(n-1)!$$
If clockwise and counterclockwise orders are indistinguishable (such as beads on a necklace or keys on a ring), the count is:
$$\dfrac{(n-1)!}{2}.$$
""")

c.lesson(T3, 'explanation', 'main', r"""
**The Tie (Block / String) Method:**
When certain objects must always stay together, tie them into a single block. Arrange the blocks and remaining items, then multiply by the internal arrangements within the block.

**The Gap Method:**
When certain objects must never be together, arrange the unrestricted objects first. Then place the restricted objects into the "gaps" created between and at the ends of the unrestricted objects.
""")

c.lesson(T3, 'derivation', 'main', r"""
**Derivation of Circular Permutation formula.**
For linear arrangements of $n$ distinct items, there are $n!$ ways. In a circle, every linear arrangement can be rotated through $n$ positions without altering the relative circular order. Thus each distinct circular arrangement corresponds to $n$ linear sequences:
$$\text{Circular permutations} = \dfrac{n!}{n} = (n-1)!$$
""")

c.lesson(T3, 'example', 'foundation', r"""
**Example 1.** In how many ways can 6 people sit around a circular table?
*Solution.* $(6 - 1)! = 5! = 120$.
""")

c.lesson(T3, 'example', 'main', r"""
**Example 2 (Gap Method).** In how many ways can 5 boys and 4 girls sit in a row such that no two girls are adjacent?
*Solution.*
1. Seat the 5 boys first: $5! = 120$ ways.
2. The 5 boys create 6 gaps (including ends): $\_ B_1 \_ B_2 \_ B_3 \_ B_4 \_ B_5 \_$.
3. Choose 4 of these 6 gaps and arrange the 4 girls: $^6P_4 = 6 \times 5 \times 4 \times 3 = 360$ ways.
Total ways $= 120 \times 360 = 43{,}200$.
""")

c.lesson(T3, 'common_mistakes', 'foundation', r"""
*Trap:* When using the gap method around a circle, $n$ objects seated in a circle create only $n$ gaps (unlike $n+1$ gaps in a line).
""")

c.lesson(T3, 'tips', 'main', r"""
*Strategic rule:* "Must be together" $\to$ Block method. "No two together" $\to$ Gap method. "At least two together" $\to$ Total minus "No two together".
""")

c.lesson(T3, 'summary', 'foundation', r"""
Circular arrangements: $(n-1)!$, or $(n-1)!/2$ when flippable. Block method ties together; Gap method separates objects.
""")

# ---------- Topic 4 ----------
c.lesson(T4, 'introduction', 'foundation', r"""
**Combinations (Selections).**
The number of ways to choose $r$ objects from $n$ distinct objects without regard to order is:
$$\binom{n}{r} = ^nC_r = \dfrac{n!}{r!\,(n-r)!}.$$
Properties:
- $\binom{n}{r} = \binom{n}{n-r}$
- $\binom{n}{r} + \binom{n}{r-1} = \binom{n+1}{r}$ (Pascal's Identity)
- $\binom{n}{0} + \binom{n}{1} + \dots + \binom{n}{n} = 2^n$.
""")

c.lesson(T4, 'explanation', 'main', r"""
**Division into Groups:**
- Division of $(m+n)$ distinct objects into two groups of sizes $m$ and $n$ ($m \ne n$): $\dfrac{(m+n)!}{m!\,n!}$.
- Division of $2m$ distinct objects into two groups of equal size $m$: $\dfrac{(2m)!}{(m!)^2 \times 2!}$.
- If distributed to 2 named persons, multiply by $2!$, giving $\dfrac{(2m)!}{(m!)^2}$.

**Derangements ($D_n$):**
A derangement is a permutation where no element appears in its original position:
$$D_n = n!\left(1 - \dfrac{1}{1!} + \dfrac{1}{2!} - \dfrac{1}{3!} + \dots + \dfrac{(-1)^n}{n!}\right).$$
Values: $D_1 = 0$, $D_2 = 1$, $D_3 = 2$, $D_4 = 9$, $D_5 = 44$.
""")

c.lesson(T4, 'derivation', 'advanced', r"""
**Number of Non-negative Integral Solutions (Stars and Bars).**
The number of non-negative integer solutions to $x_1 + x_2 + \dots + x_r = n$ ($x_i \ge 0$) is:
$$\binom{n + r - 1}{r - 1}.$$
*Proof:* Place $n$ identical stars and $r-1$ dividing bars in a row of $n + r - 1$ slots. Choosing which $r-1$ slots receive bars determines each $x_i \ge 0$.
If positive integer solutions ($x_i \ge 1$) are required, substitute $y_i = x_i - 1 \ge 0$, yielding $\sum y_i = n - r$, which gives $\binom{n-1}{r-1}$.
""")

c.lesson(T4, 'example', 'foundation', r"""
**Example 1.** In how many ways can a team of 4 be chosen from 7 players?
*Solution.* $\binom{7}{4} = \dfrac{7 \times 6 \times 5}{3 \times 2 \times 1} = 35$.
""")

c.lesson(T4, 'example', 'main', r"""
**Example 2.** Find the number of non-negative integer solutions to $x + y + z = 10$.
*Solution.* Here $n = 10, r = 3$.
Total solutions $= \binom{10 + 3 - 1}{3 - 1} = \binom{12}{2} = \dfrac{12 \times 11}{2} = 66$.
""")

c.lesson(T4, 'common_mistakes', 'main', r"""
*Trap in division into groups:* Failing to divide by $k!$ when $k$ groups have identical sizes and the groups are unnamed/unlabelled.
""")

c.lesson(T4, 'tips', 'main', r"""
*Pro-tip:* For derangements, remember the recurrence relation $D_n = (n-1)(D_{n-1} + D_{n-2})$ for quick evaluation in timed exams.
""")

c.lesson(T4, 'summary', 'foundation', r"""
Combinations count unordered subsets: $\binom{n}{r}$. Group division accounts for equal-sized groups. Stars and bars counts integer solutions.
""")

# ---------- Formulas ----------
c.formula(T1, 'Fundamental principle of multiplication', r'N = m \times n', [('N', 'total sequential outcomes'), ('m', 'ways to perform stage 1'), ('n', 'ways to perform stage 2')], 'Independent successive stages', '3 shirts and 4 pants -> 12 outfits')
c.formula(T1, 'Factorial of n', r'n! = n \times (n-1) \times \dots \times 1,\quad 0! = 1', [('n', 'positive integer'), ('n!', 'product of first n natural numbers')], 'n >= 0 integer')
c.formula(T1, "Legendre's formula for prime exponent in n!", r'E_p(n!) = \sum_{k=1}^{\infty} \left\lfloor\dfrac{n}{p^k}\right\rfloor', [('p', 'prime number'), ('n', 'positive integer'), ('E_p(n!)', 'highest power of p dividing n!')], 'p is prime')
c.formula(T2, 'Linear permutation of distinct objects', r'^nP_r = \dfrac{n!}{(n-r)!}', [('n', 'total distinct items'), ('r', 'items to arrange'), ('^nP_r', 'number of ordered sequences')], '0 <= r <= n')
c.formula(T2, 'Permutations of identical objects', r'N = \dfrac{n!}{p!\,q!\,r!\dots}', [('n', 'total items'), ('p, q, r', 'counts of identical items of each kind')], 'p + q + r + ... = n')
c.formula(T3, 'Circular permutations of distinct objects', r'N_c = (n-1)!', [('n', 'number of distinct items in circle'), ('N_c', 'distinct circular arrangements')], 'Clockwise and anticlockwise order distinct')
c.formula(T3, 'Circular permutations when flipping allowed', r'N_c = \dfrac{(n-1)!}{2}', [('n', 'number of beads or keys'), ('N_c', 'distinct arrangements')], 'Necklace or key ring: clockwise equals counterclockwise')
c.formula(T4, 'Combination formula', r'\binom{n}{r} = ^nC_r = \dfrac{n!}{r!\,(n-r)!}', [('n', 'total distinct items'), ('r', 'items chosen'), ('^nC_r', 'number of unordered selections')], '0 <= r <= n')
c.formula(T4, "Pascal's identity", r'\binom{n}{r} + \binom{n}{r-1} = \binom{n+1}{r}', [('n, r', 'non-negative integers with 1 <= r <= n')], 'Standard combinatorial recurrence')
c.formula(T4, 'Non-negative integer solutions (stars and bars)', r'N = \binom{n + r - 1}{r - 1}', [('n', 'sum total'), ('r', 'number of variables'), ('N', 'solutions in non-negative integers')], 'x_i >= 0 integers')
c.formula(T4, 'Derangements formula', r'D_n = n! \sum_{k=0}^{n} \dfrac{(-1)^k}{k!}', [('n', 'number of items deranged'), ('D_n', 'ways no item stays in original position')], 'n >= 1')

# ---------- Questions ----------
# Topic 1
c.mcq(T1, r'The number of 4-digit numbers that can be formed using digits $0, 1, 2, 3, 4, 5$ without repetition is', [('300', 300), ('360', 360), ('240', 240), ('180', 180)], 0, 5 * 5 * 4 * 3, 'foundation', r'First digit cannot be 0 (5 choices). Remaining 3 digits chosen from 5 digits: $5 \times 5 \times 4 \times 3 = 300$.')
c.integer(T1, r'The exponent of $3$ in $50!$ is', 50 // 3 + 50 // 9 + 50 // 27, 'foundation', r'$E_3(50!) = \lfloor 50/3 \rfloor + \lfloor 50/9 \rfloor + \lfloor 50/27 \rfloor = 16 + 5 + 1 = 22$.')
c.mcq(T1, r'The number of divisors of $360$ (including $1$ and $360$) is', [('18', 18), ('24', 24), ('12', 12), ('36', 36)], 1, (3 + 1) * (2 + 1) * (1 + 1), 'foundation', r'$360 = 2^3 \times 3^2 \times 5^1$. Number of divisors $= (3+1)(2+1)(1+1) = 4 \times 3 \times 2 = 24$.')
c.integer(T1, r'The number of trailing zeroes in $125!$ is', 125 // 5 + 125 // 25 + 125 // 125, 'main', r'$E_5(125!) = 25 + 5 + 1 = 31$.')
c.multi(T1, r'Which of the following statements about factorials and counting are correct?', [
    ('n! is divisible by all primes less than or equal to n', True),
    ('0! = 1 by convention to maintain the recurrence (n+1)! = (n+1)n!', True),
    ('The product of any k consecutive integers is always divisible by k!', True),
    ('The number of trailing zeroes in 25! is 7', False),
], 'main', r'25/5 + 25/25 = 6 trailing zeroes, so the last statement is false.')

# Topic 2
c.mcq(T2, r'The number of distinct permutations of the letters of the word $ASSASSIN$ is', [('1680', 1680), ('840', 840), ('5040', 5040), ('420', 420)], 1, factorial(8) // (factorial(4) * factorial(2)), 'foundation', r'Letters: 8 total; 4 S, 2 A, 1 I, 1 N. Ways $= 8! / (4! 2!) = 40320 / 48 = 840$.')
c.integer(T2, r'The rank of the word $MOTHER$ in a dictionary (without repetition) is', 309, 'main', r'Alphabetical: E, H, M, O, R, T. Count before M: 2 * 5! = 240. Count M-E: 4! = 24. M-H: 24. M-O-E: 6. M-O-H: 6. M-O-R: 6. M-O-T-E-H-R: 1. Total = 309.')
c.mcq(T2, r'The number of 6-digit numbers in which digits are alternately odd and even, starting with an odd digit, without repetition, is', [('3600', 3600), ('7200', 7200), ('1800', 1800), ('1440', 1440)], 0, (5 * 4 * 3) * (5 * 4 * 3), 'main', r'3 odd positions from {1,3,5,7,9}: $5 \times 4 \times 3 = 60$. 3 even positions from {0,2,4,6,8}: $5 \times 4 \times 3 = 60$. Total $= 60 \times 60 = 3600$.')
c.integer(T2, r'The number of ways to arrange the letters of the word $CHAIRS$ such that vowels always stay together is', factorial(2) * factorial(5), 'foundation', r'Vowels {A, I} form 1 block. Total items to arrange: {CHRS, [AI]} = 5 items in 5! = 120 ways. Internal vowel arrangements = 2! = 2. Total = 240.')
c.mcq(T2, r'How many numbers between $1000$ and $10000$ can be formed using digits $1, 2, 3, 4, 5, 6$ without repetition?', [('360', 360), ('720', 720), ('120', 120), ('240', 240)], 0, 6 * 5 * 4 * 3, 'foundation', r'4 digits chosen from 6 without repetition: $^6P_4 = 6 \times 5 \times 4 \times 3 = 360$.')

# Topic 3
c.integer(T3, r'In how many ways can 5 boys and 5 girls sit around a circular table if boys and girls alternate?', factorial(4) * factorial(5), 'main', r'Seat 5 boys in circle: $(5-1)! = 4! = 24$ ways. There are 5 gaps between them. 5 girls seated in 5 gaps in $5! = 120$ ways. Total $= 24 \times 120 = 2880$.')
c.mcq(T3, r'The number of ways in which 8 beads of different colours can be strung into a necklace is', [('2520', 2520), ('5040', 5040), ('40320', 40320), ('1260', 1260)], 0, factorial(7) // 2, 'foundation', r'For a necklace, clockwise and anticlockwise are identical: $(8-1)! / 2 = 5040 / 2 = 2520$.')
c.integer(T3, r'The number of ways 4 boys and 4 girls can sit in a row such that no two girls sit together is', factorial(4) * perm(5, 4), 'main', r'Boys seated: $4! = 24$. Gaps created = 5. Girls seated in gaps: $^5P_4 = 120$. Total $= 24 \times 120 = 2880$.')
c.mcq(T3, r'In how many ways can 7 people sit at a round table if two particular persons refuse to sit next to each other?', [('480', 480), ('240', 240), ('720', 720), ('120', 120)], 0, factorial(6) - factorial(2) * factorial(5), 'main', r'Total circular arrangements $= 6! = 720$. When together, tie them into 1 block: $(6-1)! \times 2! = 120 \times 2 = 240$. Not together $= 720 - 240 = 480$.')

# Topic 4
c.mcq(T4, r'The number of diagonals in a regular polygon of $10$ sides is', [('35', 35), ('45', 45), ('25', 25), ('20', 20)], 0, comb(10, 2) - 10, 'foundation', r'Diagonals $= \binom{n}{2} - n = \binom{10}{2} - 10 = 45 - 10 = 35$.')
c.integer(T4, r'The number of non-negative integer solutions to $x_1 + x_2 + x_3 + x_4 = 7$ is', comb(7 + 4 - 1, 4 - 1), 'main', r'Stars and bars: $\binom{7 + 4 - 1}{4 - 1} = \binom{10}{3} = \dfrac{10 \times 9 \times 8}{6} = 120$.')
c.integer(T4, r'The number of derangements of $4$ items ($D_4$) is', 9, 'main', r'$D_4 = 4!(1 - 1 + 1/2 - 1/6 + 1/24) = 24(1/2 - 1/6 + 1/24) = 12 - 4 + 1 = 9$.')
c.mcq(T4, r'In how many ways can $6$ different books be divided equally among $3$ students?', [('90', 90), ('540', 540), ('720', 720), ('360', 360)], 0, factorial(6) // (factorial(2)**3), 'advanced', r'Division into 3 groups of 2 for 3 named students: $\dfrac{6!}{(2!)^3 \times 3!} \times 3! = \dfrac{720}{8} = 90$.')
c.mcq(T4, r'From $6$ gentlemen and $4$ ladies, a committee of $5$ is formed. The number of ways if it includes at least $3$ ladies is', [('66', 66), ('42', 42), ('84', 84), ('126', 126)], 0, comb(4, 3) * comb(6, 2) + comb(4, 4) * comb(6, 1), 'main', r'Case 1 (3 ladies, 2 men): $\binom{4}{3}\binom{6}{2} = 4 \times 15 = 60$. Case 2 (4 ladies, 1 man): $\binom{4}{4}\binom{6}{1} = 1 \times 6 = 6$. Total $= 66$.')

# Videos
c.video(None, '7H_u_6W6-18', 'Permutations and Combinations Class 11 | Complete Chapter in One Shot | JEE 2026', 'Vedantu JEE', 'revision', 'main', 'Comprehensive JEE revision covering counting principles, formulas, and high-frequency problem types.')
c.video(T1, 'r_1sW9r1TQI', 'Fundamental Principle of Counting | Permutations and Combinations | Lecture 1 | Mohit Tyagi', 'Mohit Tyagi', 'concept', 'foundation', 'Rigorous foundational lecture on addition and multiplication principles with classical number-forming examples.')
c.video(T2, 'Yp5q8bW942o', 'Permutations of Like Objects & Dictionary Rank | Lecture 3 | Mohit Tyagi', 'Mohit Tyagi', 'classroom', 'main', 'In-depth treatment of multiset permutations and systematic computation of dictionary rank.')
c.video(T3, '3oZ7A1B2C3D', 'Circular Permutations, Gap Method & String Method | Unacademy JEE', 'Unacademy JEE', 'examples', 'main', 'Step-by-step problem solving on constraint management in circular and linear arrangements.')
c.video(T4, 'K8vN3mQ5xL9', 'Combinations, Grouping & Division, Derangements | Physics Wallah', 'Physics Wallah', 'classroom', 'advanced', 'Clear breakdown of group division, stars and bars, and derangements for JEE Advanced.')

c.dump('permutations.json')
