from math import log, exp, log10
from lib import Chapter, approx

R = 8.314
c = Chapter('Chemical Kinetics')
T1 = c.topic('Rate of reaction, rate law, order and molecularity')
T2 = c.topic('Integrated rate equations and half-life')
T3 = c.topic('Determining the order of a reaction')
T4 = c.topic('Temperature, collision theory and the Arrhenius equation')

# ---------- overview ----------
c.lesson(None, 'introduction', 'foundation', r"""
**Two different questions in chemistry.** Thermodynamics asks whether a reaction *can* happen (is it energetically favourable?). Kinetics asks *how fast* it happens and *by what path*. Diamond turning into graphite is favourable but so slow that you will never see it; a burning match is fast. Chemical kinetics gives us numbers for speed, and a model of how speed depends on concentration, temperature and catalysts.

**Prerequisites.** (1) Balanced equations and mole ratios (stoichiometry). (2) Concentration in mol L⁻¹ (molarity). (3) Logarithms and natural logarithms, including $\ln x=2.303\log x$. (4) Reading and sketching graphs of straight lines and exponentials. (5) The idea that molecules collide to react.

**What you will be able to do.** Express the rate of a reaction in terms of any reactant or product; use experimental data to find order and rate constant; use integrated rate laws and half-lives for zero and first order; and use the Arrhenius equation to relate rate constant, temperature and activation energy.
""")
c.lesson(None, 'why_it_matters', 'main', r"""
Chemical kinetics is one of the highest-scoring physical-chemistry chapters because the ideas are few and the numerical methods are standard: initial rates, integrated rate laws, half-lives and the Arrhenius equation. JEE Main asks mostly direct numerical questions and "which graph is correct" questions; JEE Advanced adds multi-step reasoning, mechanisms with a rate-determining step, and pressure-based data. The skills (logarithm handling, working with ratios, careful units) carry over to equilibrium and electrochemistry.

**Syllabus note.** The official JEE syllabus lists rate of reaction, rate law and rate constant, order and molecularity, integrated rate equations and half-life for zero and first order, concept of collision theory and activation energy, and the Arrhenius equation. Kinetics at Class 9 level in a coaching programme may be introduced more lightly. The four-topic split here is ORBIT's provisional crosswalk, not the confirmed Chaitanya IPL scheme.
""")

# ---------- Topic 1 ----------
c.lesson(T1, 'introduction', 'foundation', r"""
**Measuring speed.** Speed of a car is distance per unit time. The speed (rate) of a reaction is the change in concentration per unit time. Reactants are used up, so their concentration falls; products appear, so theirs rises. The rate is always quoted as a positive number.
""")
c.lesson(T1, 'explanation', 'foundation', r"""
**Average and instantaneous rate.** Average rate over a time interval: $\dfrac{\Delta[\text{P}]}{\Delta t}$ or $-\dfrac{\Delta[\text{R}]}{\Delta t}$. Instantaneous rate: the slope of the concentration–time curve at one moment, $\dfrac{d[\text{P}]}{dt}$.

**Rate for a balanced equation.** For $aA+bB\to cC+dD$:
$$\text{rate}=-\frac1a\frac{d[A]}{dt}=-\frac1b\frac{d[B]}{dt}=\frac1c\frac{d[C]}{dt}=\frac1d\frac{d[D]}{dt}.$$
Dividing by the stoichiometric coefficient makes the rate the same whichever species you follow.

**Rate law.** An equation (found by experiment) linking the rate to concentrations:
$$\text{rate}=k\,[A]^m[B]^n.$$
$k$ is the **rate constant**; it depends on temperature (and catalyst), not on concentration. The exponents $m,n$ need not equal the stoichiometric coefficients.

**Order of reaction.** The order is $m+n$ (the sum of exponents in the rate law). It can be $0$, a positive integer or a fraction, and is determined only by experiment. We also speak of the order with respect to each species.

**Units of $k$.** For order $n$: $k$ has units $(\mathrm{mol\,L^{-1}})^{1-n}\,\mathrm{s^{-1}}$. Zero order: $\mathrm{mol\,L^{-1}s^{-1}}$. First order: $\mathrm{s^{-1}}$. Second order: $\mathrm{L\,mol^{-1}s^{-1}}$.

**Molecularity.** The number of molecules that collide in one **elementary step**. It is a whole number (1, 2, rarely 3) and applies only to elementary steps. For an elementary step the rate law can be written from the equation; for a complex reaction it cannot. The slowest step in a mechanism is the **rate-determining step**: the overall rate law follows from it.
""")
c.lesson(T1, 'derivation', 'main', r"""
**Why units of $k$ follow from the order.** Rate has units $\mathrm{mol\,L^{-1}s^{-1}}$. In $\text{rate}=k[A]^n$, the concentration factor has units $(\mathrm{mol\,L^{-1}})^n$. So $k$ has units $\dfrac{\mathrm{mol\,L^{-1}s^{-1}}}{(\mathrm{mol\,L^{-1}})^n}=(\mathrm{mol\,L^{-1}})^{1-n}\mathrm{s^{-1}}$. For $n=1$ the concentration units cancel, leaving $\mathrm{s^{-1}}$. For $n=2$, $k$ is $\mathrm{L\,mol^{-1}s^{-1}}$.

**Why the rate equation is divided by coefficients.** In $2N_2O_5\to4NO_2+O_2$, when one mole of $O_2$ forms, two moles of $N_2O_5$ vanish and four moles of $NO_2$ form. So $N_2O_5$ is used at twice the rate $O_2$ appears and $NO_2$ appears at four times that rate. Dividing each by its coefficient gives a single common number for "the rate of the reaction".

**Rate-determining step (idea).** In a series of steps the overall speed is controlled by the slowest one, like cars on a road narrowing to one lane. The intermediate species in earlier fast steps can be expressed in terms of reactants, so the final rate law may involve only the species appearing up to the slow step.
""")
c.lesson(T1, 'example', 'foundation', r"""
**Example 1 (relating rates).** For $2N_2O_5\to4NO_2+O_2$, the rate of disappearance of $N_2O_5$ is $6.0\times10^{-3}\ \mathrm{mol\,L^{-1}s^{-1}}$. Find the rates of formation of $NO_2$ and $O_2$.
$-\dfrac12\dfrac{d[N_2O_5]}{dt}=\dfrac14\dfrac{d[NO_2]}{dt}=\dfrac{d[O_2]}{dt}$.
$\dfrac{d[NO_2]}{dt}=2\times6.0\times10^{-3}=1.2\times10^{-2}$ and $\dfrac{d[O_2]}{dt}=\dfrac12\times6.0\times10^{-3}=3.0\times10^{-3}\ \mathrm{mol\,L^{-1}s^{-1}}$.
""")
c.lesson(T1, 'example', 'main', r"""
**Example 2 (order from initial rates).** For $A+B\to$ products, the initial rate was measured:

Experiment 1: $[A]=0.10$ M, $[B]=0.10$ M, rate $=2.0\times10^{-3}$ M s⁻¹.
Experiment 2: $[A]=0.20$ M, $[B]=0.10$ M, rate $=8.0\times10^{-3}$ M s⁻¹.
Experiment 3: $[A]=0.10$ M, $[B]=0.20$ M, rate $=4.0\times10^{-3}$ M s⁻¹.

*Method.* Change one concentration at a time. From 1→2, $[A]$ doubles and the rate becomes $4\times$, so the order in $A$ is $2$ ($2^m=4$). From 1→3, $[B]$ doubles and the rate doubles, so the order in $B$ is $1$. The rate law is $\text{rate}=k[A]^2[B]$ and the overall order is $3$.
$k=\dfrac{2.0\times10^{-3}}{(0.10)^2(0.10)}=2.0\ \mathrm{L^2mol^{-2}s^{-1}}$.

**Example 3 (units).** What are the units of $k$ for a second-order reaction? $\mathrm{L\,mol^{-1}s^{-1}}$ (from $(\mathrm{mol\,L^{-1}})^{1-2}\mathrm{s^{-1}}$).
""")
c.lesson(T1, 'example', 'advanced', r"""
**Example 4 (changing volume).** The rate law of a gas-phase reaction is $\text{rate}=k[A]^2[B]$. If the volume of the container is reduced to one-third, by what factor does the rate change?
Halving the volume doubles each concentration; making the volume one-third triples each. Both $[A]$ and $[B]$ become $3\times$, so the rate becomes $3^2\times3=27\times$ the original.

**Example 5 (rate-determining step).** A mechanism: Step 1 (fast, reversible): $2NO\rightleftharpoons N_2O_2$. Step 2 (slow): $N_2O_2+O_2\to2NO_2$. Find the rate law.
The rate is that of the slow step: $\text{rate}=k_2[N_2O_2][O_2]$. $N_2O_2$ is an intermediate. From the fast equilibrium, $[N_2O_2]=K[NO]^2$, so $\text{rate}=k_2K[NO]^2[O_2]=k'[NO]^2[O_2]$, third order overall.
""")
c.lesson(T1, 'common_mistakes', 'foundation', r"""
1. Reading the order from the balanced equation. The order comes from experiment (it equals the coefficients only for an elementary step).
2. Confusing **order** (experimental, can be $0$ or a fraction) with **molecularity** (theoretical, whole number, only for elementary steps).
3. Forgetting to divide by the stoichiometric coefficient when relating rates of different species.
4. Writing a negative rate. Use the minus sign in the formula for reactants, so the rate is positive.
5. Putting intermediates in the final rate law without eliminating them.
6. Taking $k$ as dependent on concentration (it changes with temperature, not concentration).
""")
c.lesson(T1, 'tips', 'main', r"""
- **Initial rates:** compare two experiments in which only one concentration changes, and match the factor: factor $2$ giving $2^m$.
- Always check by recomputing $k$ from all experiments; it must come out the same.
- The units of $k$ immediately tell the order of the reaction: $\mathrm{s^{-1}}$ means first order.
- For a mechanism, write the rate law from the slow step, then replace intermediates using the fast steps.
""")
c.lesson(T1, 'summary', 'foundation', r"""
Rate $=-\frac1a\frac{d[A]}{dt}=\frac1c\frac{d[C]}{dt}$. Rate law $=k[A]^m[B]^n$ (experimental). Order $=m+n$. $k$ units: $(\mathrm{mol\,L^{-1}})^{1-n}\mathrm{s^{-1}}$. Molecularity: whole number, elementary steps only. Slowest step controls the rate.
""")
c.lesson(T1, 'mini_assessment', 'foundation', r"""
**Check yourself.**
1. For $N_2+3H_2\to2NH_3$, if $-\dfrac{d[N_2]}{dt}=0.5$ M/s, what is $\dfrac{d[NH_3]}{dt}$?
2. What is the order of a reaction whose $k$ has units $\mathrm{mol\,L^{-1}s^{-1}}$?
3. Can molecularity be zero or fractional?

**Answers.** 1. $1.0$ M/s. 2. Zero order. 3. No: molecularity is a positive whole number (and only defined for elementary steps).
""")
assert approx(2 * 6.0e-3, 1.2e-2) and approx(0.5 * 6.0e-3, 3.0e-3)
# example 2: orders and k
r1, r2, r3 = 2.0e-3, 8.0e-3, 4.0e-3
m = log(r2 / r1) / log(0.20 / 0.10); n_ = log(r3 / r1) / log(0.20 / 0.10)
assert approx(m, 2) and approx(n_, 1)
assert approx(r1 / (0.1**2 * 0.1), 2.0)
assert 3**2 * 3 == 27
assert approx(2 * 1.0 * 0.5, 1.0)  # NH3 = 2 x 0.5

# ---------- Topic 2 ----------
c.lesson(T2, 'introduction', 'main', r"""
**From rate to concentration.** The rate law tells us the speed at a given concentration. Often we want the concentration at a later time, or how long a reaction takes to reach a given stage. Integrating the rate law gives equations that connect concentration and time.

**Prerequisites.** Rate law and order; natural logarithms and exponentials; basic integration of $dx$ and $dx/x$ (shown step by step below).
""")
c.lesson(T2, 'explanation', 'main', r"""
**Zero order** ($\text{rate}=k$): $[A]=[A]_0-kt$. A plot of $[A]$ against $t$ is a straight line with slope $-k$. Half-life $t_{1/2}=\dfrac{[A]_0}{2k}$ (depends on initial concentration).

**First order** ($\text{rate}=k[A]$): $\ln\dfrac{[A]_0}{[A]}=kt$, i.e. $[A]=[A]_0e^{-kt}$, and $k=\dfrac{2.303}{t}\log\dfrac{[A]_0}{[A]}$. A plot of $\ln[A]$ against $t$ is a straight line with slope $-k$. Half-life $t_{1/2}=\dfrac{0.693}{k}$ (independent of initial concentration).

**Second order** ($\text{rate}=k[A]^2$): $\dfrac1{[A]}-\dfrac1{[A]_0}=kt$; $t_{1/2}=\dfrac1{k[A]_0}$.

**Fraction remaining.** In first-order decay, after $n$ half-lives the fraction left is $\left(\tfrac12\right)^n$: $50\%$, $25\%$, $12.5\%$, ... The time for $99.9\%$ completion is about $10$ half-lives.

**Pseudo first-order.** If one reactant is in large excess its concentration is practically constant, and a second-order reaction behaves like first order (for example, hydrolysis of an ester in dilute acid, with water in excess).
""")
c.lesson(T2, 'derivation', 'advanced', r"""
**First order.** $-\dfrac{d[A]}{dt}=k[A]\Rightarrow\dfrac{d[A]}{[A]}=-k\,dt$. Integrate from $t=0$ ($[A]_0$) to $t$ ($[A]$):
$\int_{[A]_0}^{[A]}\dfrac{d[A]}{[A]}=-k\int_0^tdt\Rightarrow\ln[A]-\ln[A]_0=-kt\Rightarrow\ln\dfrac{[A]_0}{[A]}=kt$.
Half-life: put $[A]=\tfrac12[A]_0$: $\ln2=kt_{1/2}\Rightarrow t_{1/2}=\dfrac{\ln2}k=\dfrac{0.693}k$.

**Zero order.** $-\dfrac{d[A]}{dt}=k\Rightarrow\int_{[A]_0}^{[A]}d[A]=-k\int_0^tdt\Rightarrow[A]=[A]_0-kt$. Half-life: $\tfrac12[A]_0=[A]_0-kt_{1/2}\Rightarrow t_{1/2}=\dfrac{[A]_0}{2k}$.

**Second order.** $-\dfrac{d[A]}{dt}=k[A]^2\Rightarrow\int\dfrac{d[A]}{[A]^2}=-k\int dt\Rightarrow\left[-\dfrac1{[A]}\right]_{[A]_0}^{[A]}=-kt\Rightarrow\dfrac1{[A]}-\dfrac1{[A]_0}=kt$.
Half-life: $\dfrac2{[A]_0}-\dfrac1{[A]_0}=kt_{1/2}\Rightarrow t_{1/2}=\dfrac1{k[A]_0}$.

**General order $n\ne1$.** $t_{1/2}\propto[A]_0^{\,1-n}$. This is the basis of the half-life method of finding order.
""")
c.lesson(T2, 'example', 'foundation', r"""
**Example 1.** A first-order reaction is $75\%$ complete in $32$ minutes. Find its half-life.
$75\%$ complete means $25\%$ left $=\left(\tfrac12\right)^2$: two half-lives. So $t_{1/2}=32/2=16$ min.
*Then* $k=\dfrac{0.693}{16}=0.0433\ \mathrm{min^{-1}}$.
""")
c.lesson(T2, 'example', 'main', r"""
**Example 2 (zero order).** A zero-order reaction has $k=2.5\times10^{-4}\ \mathrm{mol\,L^{-1}s^{-1}}$ and $[A]_0=0.10$ mol L⁻¹. Find the half-life and the time for completion.
$t_{1/2}=\dfrac{[A]_0}{2k}=\dfrac{0.10}{2\times2.5\times10^{-4}}=200$ s. Completion needs $t=\dfrac{[A]_0}k=400$ s (twice the half-life, because zero-order reactions end in finite time).

**Example 3 (time for 99.9%).** For a first-order reaction, how many half-lives for $99.9\%$ completion?
$\ln\dfrac{1}{0.001}=kt\Rightarrow t=\dfrac{6.908}{k}$ and $t_{1/2}=\dfrac{0.693}k$, so $t=9.97\,t_{1/2}\approx10\,t_{1/2}$.
""")
c.lesson(T2, 'example', 'advanced', r"""
**Example 4.** A first-order reaction is $20\%$ complete in $10$ minutes. Find the time for $80\%$ completion.
$k=\dfrac{2.303}{10}\log\dfrac{100}{80}=\dfrac{2.303\times0.0969}{10}=0.02231\ \mathrm{min^{-1}}$. For $80\%$ completion: $t=\dfrac{2.303}{k}\log\dfrac{100}{20}=\dfrac{2.303\times0.699}{0.02231}=72.1$ min.

**Example 5 (pressure data, first order).** For $A(g)\to B(g)+C(g)$ the initial pressure of $A$ is $P_0=100$ mm Hg, and after $10$ minutes the total pressure is $150$ mm Hg. Find the half-life (reaction is first order).
Let $x$ be the pressure of $A$ that reacted. Total pressure $=P_0-x+x+x=P_0+x$, so $x=50$ and $P_A=P_0-x=50$ mm Hg, i.e. $P_0/2$. So $10$ min is exactly one half-life.
*General expression:* $P_A=2P_0-P_t$, and $k=\dfrac{2.303}{t}\log\dfrac{P_0}{2P_0-P_t}$.
""")
c.lesson(T2, 'common_mistakes', 'main', r"""
1. Using $t_{1/2}=0.693/k$ for a reaction that is not first order.
2. Saying the half-life of a zero-order reaction is constant; it halves when the initial concentration halves.
3. Treating "75% complete" as one half-life or "75% left" as two. Check the fraction remaining.
4. Using $\log$ and $\ln$ interchangeably. $\ln x=2.303\log x$.
5. Applying $\ln\frac{[A]_0}{[A]}$ with $[A]$ as the amount **reacted** instead of what remains.
6. Mixing time units between $k$ and $t$.
""")
c.lesson(T2, 'tips', 'main', r"""
- Start every first-order problem by asking: is it a whole number of half-lives? If so, use the fraction $(1/2)^n$ and avoid logarithms.
- First-order and radioactive decay are the same mathematics: $N=N_0e^{-\lambda t}$.
- Convert percentages to fractions remaining before using the formulas.
- For gas reactions followed by pressure, express the reactant's partial pressure in terms of total pressure from the stoichiometry.
""")
c.lesson(T2, 'summary', 'main', r"""
Zero: $[A]=[A]_0-kt$; $t_{1/2}=\frac{[A]_0}{2k}$. First: $\ln\frac{[A]_0}{[A]}=kt$; $t_{1/2}=\frac{0.693}k$; $[A]=[A]_0e^{-kt}$. Second: $\frac1{[A]}-\frac1{[A]_0}=kt$; $t_{1/2}=\frac1{k[A]_0}$. $99.9\%$ completion $\approx10\,t_{1/2}$ (first order). Straight-line plots: zero $[A]$–$t$; first $\ln[A]$–$t$; second $1/[A]$–$t$.
""")
c.lesson(T2, 'mini_assessment', 'main', r"""
**Check yourself.**
1. A first-order reaction has $k=0.0693\ \mathrm{min^{-1}}$. What is its half-life?
2. After how many half-lives is $12.5\%$ of a first-order reactant left?
3. Initial concentration is doubled; by what factor does the half-life of a zero-order reaction change?

**Answers.** 1. $10$ min. 2. $3$. 3. It doubles.
""")
assert approx(0.693 / 16, 0.0433, 1e-2)
assert approx(0.10 / (2 * 2.5e-4), 200) and approx(0.10 / 2.5e-4, 400)
assert abs(log(1000) / (log(2)) - 9.966) < 0.01
k = 2.303 / 10 * log10(100 / 80)
assert abs(k - 0.02231) < 1e-4
assert abs(2.303 / k * log10(100 / 20) - 72.1) < 0.3
P0, Pt = 100, 150
assert 2 * P0 - Pt == 50 == P0 / 2
assert approx(log(2) / 0.0693, 10, 1e-3)

# ---------- Topic 3 ----------
c.lesson(T3, 'introduction', 'main', r"""
**The detective work.** Nobody can read the order off the equation, so it has to be extracted from measurements. There are three standard methods, and JEE uses all three: the **initial-rate method**, the **integrated (graphical) method** and the **half-life method**.

**Prerequisites.** Rate law and order; integrated equations and half-lives; plotting straight lines.
""")
c.lesson(T3, 'explanation', 'main', r"""
**1. Initial-rate method.** Run experiments with different starting concentrations and measure the initial rate. If doubling $[A]$ (others fixed) changes the rate by a factor $f$, then $2^m=f$ gives the order $m$ in $A$. Repeat for each reactant. (Done in Topic 1.)

**2. Integrated rate / graph method.** Measure concentration at several times. Test which quantity gives a straight line:
- $[A]$ vs $t$ is linear $\Rightarrow$ zero order.
- $\ln[A]$ vs $t$ is linear $\Rightarrow$ first order.
- $1/[A]$ vs $t$ is linear $\Rightarrow$ second order.
Or compute $k$ from each reading using the first-order formula; if $k$ is constant, first order is confirmed.

**3. Half-life method.** Measure $t_{1/2}$ at two different initial concentrations. Since $t_{1/2}\propto[A]_0^{1-n}$:
$$\frac{(t_{1/2})_1}{(t_{1/2})_2}=\left(\frac{[A]_{0,2}}{[A]_{0,1}}\right)^{n-1}.$$
- $t_{1/2}$ independent of $[A]_0$ $\Rightarrow$ first order.
- $t_{1/2}\propto[A]_0$ $\Rightarrow$ zero order.
- $t_{1/2}\propto1/[A]_0$ $\Rightarrow$ second order.

**Isolation (pseudo-order).** Keep all reactants except one in large excess; the observed order then equals the order in the limiting reactant.
""")
c.lesson(T3, 'derivation', 'advanced', r"""
**Half-life dependence on concentration.** For $\text{rate}=k[A]^n$ with $n\ne1$: $\int_{[A]_0}^{[A]}[A]^{-n}d[A]=-k\,t\Rightarrow\dfrac{[A]^{1-n}-[A]_0^{1-n}}{1-n}=-kt$. Put $[A]=\tfrac12[A]_0$:
$\dfrac{\left(\tfrac12\right)^{1-n}-1}{1-n}[A]_0^{1-n}=-kt_{1/2}\Rightarrow t_{1/2}=\dfrac{2^{n-1}-1}{(n-1)\,k}\,[A]_0^{\,1-n}$.
So $t_{1/2}\propto[A]_0^{1-n}$, with the constant of proportionality depending on $n$ and $k$ only. For $n=1$ the limit gives $\dfrac{\ln2}{k}$, independent of $[A]_0$.

**Why the ratio formula works.** Dividing the expression for $(t_{1/2})_1$ by that for $(t_{1/2})_2$ cancels $k$ and the numerical factor, leaving $\left(\dfrac{[A]_{0,1}}{[A]_{0,2}}\right)^{1-n}=\left(\dfrac{[A]_{0,2}}{[A]_{0,1}}\right)^{n-1}$.
""")
c.lesson(T3, 'example', 'foundation', r"""
**Example 1.** The half-life of a reaction is $20$ min when $[A]_0=0.10$ M and $40$ min when $[A]_0=0.05$ M. Find the order.
Halving $[A]_0$ doubled $t_{1/2}$, so $t_{1/2}\propto1/[A]_0$, which means $n-1=1$ and $n=2$. Second order.
""")
c.lesson(T3, 'example', 'main', r"""
**Example 2 (graph method).** Concentration of $A$ at different times: $t=0$, $50$, $100$, $150$ s gives $[A]=1.00,\ 0.607,\ 0.368,\ 0.223$ M. Is it first order?
$k=\dfrac1t\ln\dfrac{[A]_0}{[A]}$: at $50$ s, $\dfrac1{50}\ln\dfrac{1}{0.607}=0.0100$; at $100$ s, $\dfrac1{100}\ln\dfrac1{0.368}=0.0100$; at $150$ s, $\dfrac1{150}\ln\dfrac1{0.223}=0.0100\ \mathrm{s^{-1}}$. $k$ is constant, so the reaction is first order with $k=0.010\ \mathrm{s^{-1}}$.
""")
c.lesson(T3, 'example', 'advanced', r"""
**Example 3 (zero order check).** For a reaction, $t_{1/2}$ is $100$ s at $[A]_0=0.8$ M and $50$ s at $[A]_0=0.4$ M. Order?
$\dfrac{100}{50}=\left(\dfrac{0.4}{0.8}\right)^{n-1}\Rightarrow2=\left(\tfrac12\right)^{n-1}\Rightarrow n-1=-1\Rightarrow n=0$. Zero order (half-life proportional to $[A]_0$).

**Example 4 (isolation).** In the reaction $A+B\to$ products, with $[B]$ in large excess, the observed rate is first order in $A$. In a separate experiment with $[A]$ in large excess it is also first order in $B$. State the overall rate law and order.
$\text{rate}=k[A][B]$, overall second order. The pseudo-first-order constant in the first experiment is $k'=k[B]_0$.
""")
c.lesson(T3, 'common_mistakes', 'main', r"""
1. Using the first-order half-life rule for a reaction of unknown order.
2. Taking the ratio of half-lives the wrong way up; check against the three standard cases.
3. Reading order from stoichiometry in a table-of-data question.
4. Assuming a fractional order is a mistake; it can be genuine.
5. Plotting $\ln[A]$ when the data are pressures of a product rather than the reactant.
""")
c.lesson(T3, 'tips', 'main', r"""
- A quick memory table: $t_{1/2}$ constant $\to$ first; $t_{1/2}$ grows with $[A]_0\to$ zero; $t_{1/2}$ shrinks with $[A]_0\to$ second.
- When data are given at equal time intervals, test first order by checking whether the concentration falls by the same factor in each interval.
- A graph question usually asks for a quantity from the slope; remember slope $=-k$ for zero and first order plots and $+k$ for second order $1/[A]$ plots.
""")
c.lesson(T3, 'summary', 'main', r"""
Initial-rate: $2^m=$ factor. Graphs: $[A]$ vs $t$ linear $\to$ zero; $\ln[A]$ vs $t$ linear $\to$ first; $1/[A]$ vs $t$ linear $\to$ second. Half-life: $\frac{t_1}{t_2}=\left(\frac{a_2}{a_1}\right)^{n-1}$. $t_{1/2}\propto[A]_0^{1-n}$.
""")
c.lesson(T3, 'mini_assessment', 'main', r"""
**Check yourself.**
1. $t_{1/2}$ is the same at two different initial concentrations. Order?
2. Doubling the initial concentration of $A$ doubles the half-life. Order?
3. What does a straight line of $1/[A]$ against $t$ with positive slope indicate?

**Answers.** 1. First. 2. Zero. 3. Second order, with slope $=k$.
""")
assert approx(log(40 / 20) / log(0.10 / 0.05), 1.0)   # n-1 = 1
for t, a in ((50, 0.607), (100, 0.368), (150, 0.223)):
    assert abs(log(1 / a) / t - 0.0100) < 3e-5
assert approx(log(100 / 50) / log(0.8 / 0.4), 1.0)    # t1/2 100/50 = 2 = (0.4/0.8)^(n-1) -> (1/2)^(n-1)=2 -> n-1=-1
assert approx(0.5**(-1), 2)
# general half-life formula for second order matches 1/(k a0)
n_ = 2; kk = 0.3; a0 = 0.7
assert approx((2**(n_ - 1) - 1) / ((n_ - 1) * kk) * a0**(1 - n_), 1 / (kk * a0))
# zero order: n=0 -> a0/(2k)
n_ = 0
assert approx((2**(n_ - 1) - 1) / ((n_ - 1) * kk) * a0**(1 - n_), a0 / (2 * kk))

# ---------- Topic 4 ----------
c.lesson(T4, 'introduction', 'main', r"""
**Why heating speeds things up so much.** A rule of thumb says the rate of many reactions roughly doubles or triples for every $10^\circ$C rise. Collision theory and the Arrhenius equation explain the number: it is not collisions becoming more frequent (that change is small) but a far larger fraction of collisions having enough energy to react.

**Prerequisites.** Rate constant; natural logarithm and exponential; the Kelvin scale; Boltzmann-type distribution of molecular energies (a few molecules have much more than the average energy).
""")
c.lesson(T4, 'explanation', 'main', r"""
**Collision theory.** For a reaction to occur, molecules must (1) collide, (2) with at least a minimum energy called the **threshold** or **activation energy** $E_a$, and (3) with the correct orientation.

**Activation energy.** The energy barrier between reactants and products. A reaction with a high barrier is slow at a given temperature.

**Arrhenius equation.**
$$k=A\,e^{-E_a/RT}\qquad\Longleftrightarrow\qquad\ln k=\ln A-\frac{E_a}{RT}.$$
$A$ is the frequency (pre-exponential) factor, related to the collision frequency and orientation. $R=8.314\ \mathrm{J\,mol^{-1}K^{-1}}$ and $T$ is in kelvin. $e^{-E_a/RT}$ is the fraction of molecules with energy $\ge E_a$.

**Two-temperature form.**
$$\ln\frac{k_2}{k_1}=\frac{E_a}{R}\left(\frac1{T_1}-\frac1{T_2}\right),\qquad\log\frac{k_2}{k_1}=\frac{E_a}{2.303\,R}\left(\frac1{T_1}-\frac1{T_2}\right).$$

**Graph.** A plot of $\ln k$ against $1/T$ is a straight line with slope $-E_a/R$ and intercept $\ln A$.

**Catalyst.** A catalyst provides an alternative path with a lower activation energy. It increases the rate of both forward and reverse reactions equally and does not change $\Delta H$, $\Delta G$ or the equilibrium constant. It is not consumed.

**Energy profile.** For a reaction, $\Delta H=E_{a(\text{forward})}-E_{a(\text{reverse})}$.
""")
c.lesson(T4, 'derivation', 'advanced', r"""
**Two-temperature form from the Arrhenius equation.** Write the equation at two temperatures:
$\ln k_1=\ln A-\dfrac{E_a}{RT_1}$ and $\ln k_2=\ln A-\dfrac{E_a}{RT_2}$.
Subtract the first from the second. $\ln A$ cancels:
$\ln k_2-\ln k_1=-\dfrac{E_a}{RT_2}+\dfrac{E_a}{RT_1}=\dfrac{E_a}R\left(\dfrac1{T_1}-\dfrac1{T_2}\right)$.
Since $T_2>T_1$ implies $\dfrac1{T_1}>\dfrac1{T_2}$, the right side is positive and $k_2>k_1$.

**Why the effect of a catalyst is so large.** Because $E_a$ appears in an exponent, a modest reduction multiplies the rate by a large factor. If a catalyst lowers $E_a$ by $\Delta E$ at fixed $T$ (with $A$ unchanged), the rate constant is multiplied by $e^{\Delta E/RT}$.

**Fraction of molecules above $E_a$.** The factor $e^{-E_a/RT}$ comes from the Boltzmann distribution of energies. At higher $T$ the exponent $-E_a/RT$ is less negative, so the fraction rises sharply.
""")
c.lesson(T4, 'example', 'foundation', r"""
**Example 1.** What is the slope of a plot of $\ln k$ against $1/T$? $-\dfrac{E_a}R$. A steeper (more negative) slope means a larger activation energy.
""")
c.lesson(T4, 'example', 'main', r"""
**Example 2 (activation energy from two rates).** The rate constant doubles when the temperature rises from $300$ K to $310$ K. Find $E_a$.
$\ln2=\dfrac{E_a}{8.314}\left(\dfrac1{300}-\dfrac1{310}\right)=\dfrac{E_a}{8.314}\times1.0753\times10^{-4}$.
$E_a=\dfrac{0.6931\times8.314}{1.0753\times10^{-4}}=5.36\times10^4\ \mathrm{J\,mol^{-1}}=53.6\ \mathrm{kJ\,mol^{-1}}$.

**Example 3 (new rate constant).** At $300$ K, $k=1.0\times10^{-3}\ \mathrm{s^{-1}}$ and $E_a=50\ \mathrm{kJ\,mol^{-1}}$. Find $k$ at $320$ K.
$\ln\dfrac{k_2}{k_1}=\dfrac{50000}{8.314}\left(\dfrac1{300}-\dfrac1{320}\right)=6014\times2.0833\times10^{-4}=1.253$. $\dfrac{k_2}{k_1}=e^{1.253}=3.50$, so $k_2=3.5\times10^{-3}\ \mathrm{s^{-1}}$.
""")
c.lesson(T4, 'example', 'advanced', r"""
**Example 4 (catalyst).** A catalyst lowers the activation energy from $75$ to $60\ \mathrm{kJ\,mol^{-1}}$ at $300$ K. By what factor does the rate constant increase (assume $A$ is unchanged)?
$\dfrac{k_{cat}}{k}=e^{\Delta E/RT}=\exp\!\left(\dfrac{15000}{8.314\times300}\right)=e^{6.01}\approx4.1\times10^2$.

**Example 5 (reaction enthalpy).** A reaction has $E_a=95$ kJ/mol (forward) and $E_a=70$ kJ/mol (reverse). Is the reaction endothermic or exothermic, and what is $\Delta H$?
$\Delta H=E_{a,f}-E_{a,r}=95-70=+25$ kJ/mol, so the reaction is endothermic.
""")
c.lesson(T4, 'common_mistakes', 'main', r"""
1. Using temperature in $^\circ$C. $T$ must be in kelvin.
2. Mixing units of $R$ and $E_a$ ($8.314$ J with $E_a$ in kJ without converting).
3. Saying a catalyst changes $\Delta H$ or the equilibrium position. It changes the rate only (it speeds both directions equally).
4. Saying temperature raises the rate because it increases collision frequency a lot. The main reason is the larger fraction of molecules with $E\ge E_a$.
5. Confusing $\ln$ and $\log$ in the two-temperature form (difference of factor $2.303$).
6. Thinking a reaction with a higher activation energy is always slower at all temperatures; it also responds more strongly to temperature.
""")
c.lesson(T4, 'tips', 'main', r"""
- Write $\dfrac{1}{T_1}-\dfrac1{T_2}$ as $\dfrac{T_2-T_1}{T_1T_2}$ to keep arithmetic clean.
- In graph questions identify the slope as $-E_a/R$ (or $-E_a/2.303R$ if the axis is $\log k$).
- For "rate doubles every $10^\circ$C" estimates, remember it is an approximation that corresponds to $E_a\approx50$ kJ/mol near room temperature.
""")
c.lesson(T4, 'summary', 'main', r"""
$k=Ae^{-E_a/RT}$; $\ln k=\ln A-\frac{E_a}{RT}$; slope of $\ln k$ vs $1/T$ is $-E_a/R$. $\ln\frac{k_2}{k_1}=\frac{E_a}R\left(\frac1{T_1}-\frac1{T_2}\right)$. Catalyst: lowers $E_a$, same $\Delta H$, same equilibrium. $\Delta H=E_{a,f}-E_{a,r}$. $T$ in kelvin.
""")
c.lesson(T4, 'mini_assessment', 'main', r"""
**Check yourself.**
1. What is the unit of the frequency factor $A$ for a first-order reaction?
2. Does a catalyst change the equilibrium constant?
3. If $E_a=0$, how does $k$ depend on temperature?

**Answers.** 1. $\mathrm{s^{-1}}$ (the same as $k$). 2. No. 3. It does not: $k=A$.
""")
Ea = R * log(2) / (1 / 300 - 1 / 310)
assert abs(Ea - 53600) < 100
k2 = 1.0e-3 * exp(50000 / R * (1 / 300 - 1 / 320))
assert abs(k2 - 3.5e-3) < 0.05e-3 and abs(50000 / R * (1 / 300 - 1 / 320) - 1.253) < 0.002
fac = exp(15000 / (R * 300))
assert 400 < fac < 420
assert 95 - 70 == 25
assert abs(1 / 300 - 1 / 310 - 1.0753e-4) < 1e-8

# ---------- Formulas ----------
c.formula(T1, 'Rate of a reaction', r'\text{rate}=-\dfrac{1}{a}\dfrac{d[A]}{dt}=-\dfrac1b\dfrac{d[B]}{dt}=\dfrac1c\dfrac{d[C]}{dt}=\dfrac1d\dfrac{d[D]}{dt}', [('a, b, c, d', 'stoichiometric coefficients in aA + bB → cC + dD'), ('[X]', 'molar concentration of X', 'mol L⁻¹')], 'Balanced equation', None, None, 'mol L⁻¹ s⁻¹')
c.formula(T1, 'Rate law', r'\text{rate}=k[A]^m[B]^n,\quad \text{order}=m+n', [('k', 'rate constant (units depend on the order)'), ('[A], [B]', 'molar concentrations', 'mol L⁻¹'), ('m, n', 'orders in A and B, found by experiment')], 'm and n equal the coefficients only for an elementary step', None, None, 'mol L⁻¹ s⁻¹ (rate)')
c.formula(T1, 'Units of the rate constant', r'[k]=(\mathrm{mol\,L^{-1}})^{1-n}\,\mathrm{s^{-1}}', [('[k]', 'units of the rate constant'), ('n', 'overall order of the reaction')], 'Whole-number or fractional order', 'Zero order: mol L⁻¹ s⁻¹; first: s⁻¹; second: L mol⁻¹ s⁻¹')
c.formula(T2, 'Zero-order integrated rate law', r'[A]=[A]_0-kt,\qquad t_{1/2}=\dfrac{[A]_0}{2k}', [('[A]', 'concentration at time t', 'mol L⁻¹'), ('[A]₀', 'initial concentration', 'mol L⁻¹'), ('k', 'zero-order rate constant', 'mol L⁻¹ s⁻¹'), ('t', 'time', 's')], 'Zero-order reaction; valid until [A] reaches 0')
c.formula(T2, 'First-order integrated rate law', r'\ln\dfrac{[A]_0}{[A]}=kt,\qquad k=\dfrac{2.303}{t}\log\dfrac{[A]_0}{[A]}', [('[A]₀', 'initial concentration', 'mol L⁻¹'), ('[A]', 'concentration at time t', 'mol L⁻¹'), ('k', 'first-order rate constant', 's⁻¹'), ('t', 'time', 's')], 'First-order reaction; same units for [A]₀ and [A]')
c.formula(T2, 'Half-life of a first-order reaction', r't_{1/2}=\dfrac{0.693}{k}', [('k', 'first-order rate constant', 's⁻¹')], 'Independent of the initial concentration')
c.formula(T2, 'Second-order integrated rate law', r'\dfrac{1}{[A]}-\dfrac{1}{[A]_0}=kt,\qquad t_{1/2}=\dfrac{1}{k[A]_0}', [('[A]₀, [A]', 'initial concentration and concentration at time t', 'mol L⁻¹'), ('k', 'second-order rate constant', 'L mol⁻¹ s⁻¹'), ('t', 'time', 's')], 'Rate = k[A]²')
c.formula(T2, 'First-order rate constant from pressures', r'k=\dfrac{2.303}{t}\log\dfrac{P_0}{2P_0-P_t}', [('P₀', 'initial pressure of A', 'mm Hg or any pressure unit'), ('Pₜ', 'total pressure at time t, same unit', None), ('t', 'time', 's'), ('k', 'first-order rate constant', 's⁻¹ (matches t)')], 'A(g) → B(g) + C(g), first order, only A present initially')
c.formula(T3, 'Half-life and initial concentration', r't_{1/2}\propto[A]_0^{\,1-n}\ \Longrightarrow\ \dfrac{(t_{1/2})_1}{(t_{1/2})_2}=\left(\dfrac{[A]_{0,2}}{[A]_{0,1}}\right)^{n-1}', [('n', 'order of the reaction'), ('[A]₀', 'initial concentration', 'mol L⁻¹'), ('t_{1/2}', 'half-life', 's')], 'n ≠ 1 for the proportionality; for n = 1 the half-life does not depend on [A]₀')
c.formula(T4, 'Arrhenius equation', r'k=A\,e^{-E_a/RT}', [('A', 'frequency (pre-exponential) factor'), ('Eₐ', 'activation energy', 'J mol⁻¹'), ('R', 'gas constant, 8.314', 'J mol⁻¹ K⁻¹'), ('T', 'absolute temperature', 'K')], 'T in kelvin')
c.formula(T4, 'Arrhenius equation at two temperatures', r'\ln\dfrac{k_2}{k_1}=\dfrac{E_a}{R}\left(\dfrac{1}{T_1}-\dfrac{1}{T_2}\right)', [('k₁, k₂', 'rate constants at T₁ and T₂', 'same units'), ('Eₐ', 'activation energy', 'J mol⁻¹'), ('R', 'gas constant, 8.314', 'J mol⁻¹ K⁻¹'), ('T₁, T₂', 'absolute temperatures', 'K')], 'Eₐ taken as constant over the range; T in kelvin', 'With log₁₀: log(k₂/k₁) = (Eₐ/2.303R)(1/T₁ − 1/T₂)')

# ---------- Questions ----------
c.mcq(T1, r'For $2N_2O_5\to4NO_2+O_2$, if $N_2O_5$ disappears at $6.0\times10^{-3}$ M s⁻¹, $O_2$ forms at', [(r'$3.0\times10^{-3}$ M s⁻¹', 3.0e-3), (r'$6.0\times10^{-3}$ M s⁻¹', 6.0e-3), (r'$1.2\times10^{-2}$ M s⁻¹', 1.2e-2), (r'$1.5\times10^{-3}$ M s⁻¹', 1.5e-3)], 0, 0.5 * 6.0e-3, 'foundation', r'$\dfrac{d[O_2]}{dt}=\dfrac12\left(-\dfrac{d[N_2O_5]}{dt}\right)$.')
c.mcq(T1, r'The unit of the rate constant of a first-order reaction is', [('mol L⁻¹ s⁻¹', 0), ('s⁻¹', 1), ('L mol⁻¹ s⁻¹', 2), ('mol² L⁻² s⁻¹', 3)], 1, 1, 'foundation', r'$(\mathrm{mol\,L^{-1}})^{1-n}\mathrm{s^{-1}}$ with $n=1$.', tol=0)
c.mcq(T1, r'The rate of a reaction is $k[A]^2[B]$. If the volume is reduced to $\tfrac13$ the rate changes by a factor of', [('3', 3), ('9', 9), ('27', 27), ('81', 81)], 2, 3**3, 'main', r'Each concentration triples, so $3^2\times3=27$.')
c.integer(T1, r'For a reaction, doubling $[A]$ raises the rate $4$ times and doubling $[B]$ doubles the rate. The overall order is', 3, 'main', r'Order in $A$ is $2$ ($2^m=4$), in $B$ is $1$: total $3$.')
c.mcq(T1, r'A mechanism has a fast reversible step $2NO\rightleftharpoons N_2O_2$ followed by a slow step $N_2O_2+O_2\to2NO_2$. The overall order is', [('2', 2), ('3', 3), ('1', 1), ('4', 4)], 1, 3, 'advanced', r'Rate $=k_2K[NO]^2[O_2]$, which is third order.')
c.multi(T1, r'Which statements about order and molecularity are correct?', [
    ('Order can be fractional', True), ('Molecularity can be fractional', False), ('Molecularity applies to elementary steps', True), ('Order is always equal to the sum of the stoichiometric coefficients of reactants', False)],
    'main', r'Order is experimental and may be zero or fractional; molecularity is a whole number for an elementary step.')
c.integer(T2, r'A first-order reaction is $75\%$ complete in $32$ minutes. Its half-life in minutes is', 16, 'foundation', r'$25\%$ left is two half-lives.')
c.mcq(T2, r'The half-life of a zero-order reaction with $k=2.5\times10^{-4}$ mol L⁻¹ s⁻¹ and $[A]_0=0.10$ M is', [('100 s', 100), ('200 s', 200), ('400 s', 400), ('50 s', 50)], 1, 0.10 / (2 * 2.5e-4), 'main', r'$[A]_0/2k=0.10/(5\times10^{-4})=200$ s.')
c.mcq(T2, r'For a first-order reaction $k=0.0693$ min⁻¹. The time for $75\%$ completion is', [('10 min', 10), ('20 min', 20), ('30 min', 30), ('40 min', 40)], 1, 2 * log(2) / 0.0693, 'main', r'$t_{1/2}=10$ min, and $75\%$ complete is two half-lives.', tol=1e-3)
c.integer(T2, r'The time for $99.9\%$ completion of a first-order reaction is $x$ times its half-life. Find $x$ (nearest integer).', 10, 'main', r'$\ln1000/\ln2=9.97\approx10$.')
c.mcq(T2, r'A first-order reaction is $20\%$ complete in $10$ min. The time for $80\%$ completion (min) is closest to', [('50', 50), ('72', 72), ('80', 80), ('100', 100)], 1, round(log(5) / (log(1.25) / 10)), 'advanced', r'$k=\dfrac{\ln1.25}{10}=0.02231$; $t=\dfrac{\ln5}{k}=72$ min.')
c.integer(T2, r'For $A(g)\to B(g)+C(g)$ (first order) the initial pressure is $100$ mm Hg and the total pressure after $10$ min is $150$ mm Hg. The half-life in minutes is', 10, 'advanced', r'$P_A=2P_0-P_t=50=P_0/2$, so $10$ min is one half-life.')
c.mcq(T3, r'The half-life is $20$ min at $0.10$ M and $40$ min at $0.05$ M. The order is', [('0', 0), ('1', 1), ('2', 2), ('3', 3)], 2, round(1 + log(40 / 20) / log(0.10 / 0.05)), 'main', r'$t_{1/2}\propto1/[A]_0\Rightarrow n=2$.')
c.mcq(T3, r'A plot of $\ln[A]$ against $t$ is a straight line. The reaction is', [('zero order', 0), ('first order', 1), ('second order', 2), ('cannot be said', 3)], 1, 1, 'foundation', r'That is the first-order test.', tol=0)
c.mcq(T3, r'The half-life of a reaction is directly proportional to the initial concentration. The order is', [('0', 0), ('1', 1), ('2', 2), ('3', 3)], 0, 0, 'main', r'$t_{1/2}\propto[A]_0^{1-n}$ and $1-n=1$ gives $n=0$.', tol=0)
c.integer(T3, r'For a reaction $t_{1/2}$ is $100$ s at $[A]_0=0.8$ M and $50$ s at $0.4$ M. The order is', 0, 'advanced', r'Half-life halves when concentration halves, so $t_{1/2}\propto[A]_0$ and $n=0$.')
c.mcq(T4, r'The slope of a plot of $\ln k$ against $1/T$ equals', [(r'$E_a/R$', 0), (r'$-E_a/R$', 1), (r'$-E_a$', 2), (r'$\ln A$', 3)], 1, 1, 'foundation', r'From $\ln k=\ln A-\dfrac{E_a}{R}\cdot\dfrac1T$.', tol=0)
c.mcq(T4, r'The rate constant doubles when $T$ rises from $300$ K to $310$ K. $E_a$ in kJ mol⁻¹ is closest to', [('27', 27), ('54', 54), ('108', 108), ('5.4', 5.4)], 1, round(R * log(2) / (1 / 300 - 1 / 310) / 1000), 'main', r'$E_a=\dfrac{R\ln2}{1/300-1/310}=53.6$ kJ mol⁻¹.')
c.mcq(T4, r'At $300$ K, $k=1.0\times10^{-3}$ s⁻¹ and $E_a=50$ kJ mol⁻¹. $k$ at $320$ K (s⁻¹) is closest to', [(r'$1.7\times10^{-3}$', 1.7e-3), (r'$3.5\times10^{-3}$', 3.5e-3), (r'$7.0\times10^{-3}$', 7.0e-3), (r'$1.0\times10^{-2}$', 1.0e-2)], 1, 1.0e-3 * exp(50000 / R * (1 / 300 - 1 / 320)), 'main', r'$\ln(k_2/k_1)=1.253$ so $k_2/k_1=3.50$.', tol=0.02)
c.mcq(T4, r'A catalyst lowers $E_a$ from $75$ to $60$ kJ mol⁻¹ at $300$ K. The rate constant increases by a factor of about', [('4', 4), ('40', 40), ('400', 400), ('4000', 4000)], 2, 400, 'advanced', r'$e^{15000/(8.314\times300)}=e^{6.01}\approx4\times10^2$.', tol=0.05)
c.multi(T4, r'Which statements about a catalyst are correct?', [
    ('It lowers the activation energy', True), ('It changes $\\Delta H$ of the reaction', False), ('It changes the equilibrium constant', False), ('It increases the rates of the forward and reverse reactions', True)],
    'main', r'A catalyst provides a lower-energy path; thermodynamics ($\Delta H$, $K$) is unchanged.')
c.integer(T4, r'A reaction has $E_{a,\text{forward}}=95$ and $E_{a,\text{reverse}}=70$ kJ mol⁻¹. $\Delta H$ in kJ mol⁻¹ is', 25, 'advanced', r'$\Delta H=E_{a,f}-E_{a,r}=+25$ (endothermic).')

# ---------- Videos ----------
c.video(None, 'Bgh6GY47yi0', 'Chemical Kinetics Complete Chapter | Rate Law, Order, Half-Life & Numericals', 'AcadXL', 'revision', 'main',
        'A single lecture covering rate law, order, half-life and numericals; useful as a whole-chapter revision.')
c.video(T2, '2c8KSAeNQ6Y', 'Integrated Rate Laws and Half Life Formula - Nth Order Reaction - Chemical Kinetics', 'The Organic Chemistry Tutor', 'concept', 'main',
        'Derives and applies integrated rate laws and half-lives for different orders. Good for building the formulas from scratch.')
c.video(T2, 'M450hLzMXGc', 'Rate Equation & Half-Life of First Order Reaction|Chemical Kinetics |Lec 04 | Class 12, NEET & JEE', 'Chem Curious', 'classroom', 'main',
        'A class-12 lecture on the first-order rate equation and half-life, with JEE-style problems.')
c.video(T2, 'A0QsbNj9x24', 'Chemical Kinetics 05 : ZERO Order Kinetics I Rate Law and Half Life Of Zero Order- JEE MAINS/NEET', 'Physics Wallah - Alakh Pandey', 'classroom', 'main',
        'Lecture on zero-order kinetics: rate law and half-life.')
c.video(T3, 'WmdnBA4CNZ4', '12th Chemistry - IIT-JEE - Chemical Kinetics - Experimental Determination Of Rate Laws', 'Turito', 'examples', 'main',
        'Covers how rate laws are found from experimental data, the core of topic 3.')
c.video(T4, 'QwxS6b70qf4', 'Arrhenius Equation | General Chemistry II | 6.8', 'Professor Derricotte', 'concept', 'main',
        'An English lecture introducing the Arrhenius equation and its meaning (university-level general chemistry).')
c.video(T4, 'eS1Fp8CKfBA', '3 / 4 - Lecture 17 - Solving for activation energy with rate constants at two different temperatures', 'CHEM1142', 'examples', 'main',
        'Worked method for finding activation energy from two rate constants (university course lecture).')
c.dump('chemical-kinetics.json')
