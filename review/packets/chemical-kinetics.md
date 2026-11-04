# Academic review packet: Chemical Kinetics

Generated 2026-11-05. Subject: chemistry.

**What this is.** Original explanations, formulas, practice questions and video links written for ORBIT. None of it has been academically reviewed. Please read each item, solve each question yourself before looking at the key, and record a decision in the companion CSV (one row per item, identified by the code shown in each heading).

**Decisions:** `approved` · `rejected` · `needs_research` · `edited` (you changed it elsewhere) · `comment`. For each check use `pass`, `fail` or `na`. Add feedback for anything that is not a plain pass.

**Please also judge:** whether the explanation skips reasoning, whether prerequisites are right, whether each topic and question is inside the intended syllabus, and whether the difficulty label reflects the reasoning needed.

**Scope caution.** The topic list is ORBIT's provisional crosswalk to the JEE syllabus, not the Chaitanya IPL scheme.

## Chapter overview

### [L-c9de9d3c] introduction (foundation)

**Two different questions in chemistry.** Thermodynamics asks whether a reaction *can* happen (is it energetically favourable?). Kinetics asks *how fast* it happens and *by what path*. Diamond turning into graphite is favourable but so slow that you will never see it; a burning match is fast. Chemical kinetics gives us numbers for speed, and a model of how speed depends on concentration, temperature and catalysts.

**Prerequisites.** (1) Balanced equations and mole ratios (stoichiometry). (2) Concentration in mol L⁻¹ (molarity). (3) Logarithms and natural logarithms, including $\ln x=2.303\log x$. (4) Reading and sketching graphs of straight lines and exponentials. (5) The idea that molecules collide to react.

**What you will be able to do.** Express the rate of a reaction in terms of any reactant or product; use experimental data to find order and rate constant; use integrated rate laws and half-lives for zero and first order; and use the Arrhenius equation to relate rate constant, temperature and activation energy.

### [L-a0c5c0f0] why it matters (main)

Chemical kinetics is one of the highest-scoring physical-chemistry chapters because the ideas are few and the numerical methods are standard: initial rates, integrated rate laws, half-lives and the Arrhenius equation. JEE Main asks mostly direct numerical questions and "which graph is correct" questions; JEE Advanced adds multi-step reasoning, mechanisms with a rate-determining step, and pressure-based data. The skills (logarithm handling, working with ratios, careful units) carry over to equilibrium and electrochemistry.

**Syllabus note.** (The official syllabus PDF could not be retrieved when this was written, so the wording below comes from published summaries and has not been checked against it.) Published summaries of the JEE syllabus lists rate of reaction, rate law and rate constant, order and molecularity, integrated rate equations and half-life for zero and first order, concept of collision theory and activation energy, and the Arrhenius equation. Kinetics at Class 9 level in a coaching programme may be introduced more lightly. The four-topic split here is ORBIT's provisional crosswalk, not the confirmed Chaitanya IPL scheme.

### [Q-d9dc1986] Question (single, foundation, origin: generated)

For $2N_2O_5\to4NO_2+O_2$, if $N_2O_5$ disappears at $6.0\times10^{-3}$ M s⁻¹, $O_2$ forms at

   A. $3.0\times10^{-3}$ M s⁻¹
   B. $6.0\times10^{-3}$ M s⁻¹
   C. $1.2\times10^{-2}$ M s⁻¹
   D. $1.5\times10^{-3}$ M s⁻¹

**Key:** A
**Solution:** $\dfrac{d[O_2]}{dt}=\dfrac12\left(-\dfrac{d[N_2O_5]}{dt}\right)$.

### [Q-b80eac9f] Question (single, foundation, origin: generated)

The unit of the rate constant of a first-order reaction is

   A. mol L⁻¹ s⁻¹
   B. s⁻¹
   C. L mol⁻¹ s⁻¹
   D. mol² L⁻² s⁻¹

**Key:** B
**Solution:** $(\mathrm{mol\,L^{-1}})^{1-n}\mathrm{s^{-1}}$ with $n=1$.

### [Q-75d6f9c0] Question (single, advanced, origin: generated)

A mechanism has a fast reversible step $2NO\rightleftharpoons N_2O_2$ followed by a slow step $N_2O_2+O_2\to2NO_2$. The overall order is

   A. 2
   B. 3
   C. 1
   D. 4

**Key:** B
**Solution:** Rate $=k_2K[NO]^2[O_2]$, which is third order.

### [Q-142782ac] Question (integer, foundation, origin: generated)

A first-order reaction is $75\%$ complete in $32$ minutes. Its half-life in minutes is

**Key:** 16
**Solution:** $25\%$ left is two half-lives.

### [Q-5fda171c] Question (single, main, origin: generated)

The rate of a reaction is $k[A]^2[B]$. If the volume is reduced to $\tfrac13$ the rate changes by a factor of

   A. 3
   B. 9
   C. 27
   D. 81

**Key:** C
**Solution:** Each concentration triples, so $3^2\times3=27$.

### [Q-7d6ffc20] Question (integer, main, origin: generated)

For a reaction, doubling $[A]$ raises the rate $4$ times and doubling $[B]$ doubles the rate. The overall order is

**Key:** 3
**Solution:** Order in $A$ is $2$ ($2^m=4$), in $B$ is $1$: total $3$.

### [Q-4776d3b9] Question (multi, main, origin: generated)

Which statements about order and molecularity are correct?

   A. Order can be fractional
   B. Molecularity can be fractional
   C. Molecularity applies to elementary steps
   D. Order is always equal to the sum of the stoichiometric coefficients of reactants

**Key:** A, C
**Solution:** Order is experimental and may be zero or fractional; molecularity is a whole number for an elementary step.

### [Q-4eba44d2] Question (single, advanced, origin: generated)

A first-order reaction is $20\%$ complete in $10$ min. The time for $80\%$ completion (min) is closest to

   A. 50
   B. 72
   C. 80
   D. 100

**Key:** B
**Solution:** $k=\dfrac{\ln1.25}{10}=0.02231$; $t=\dfrac{\ln5}{k}=72$ min.

### [Q-0c844d59] Question (integer, advanced, origin: generated)

For $A(g)\to B(g)+C(g)$ (first order) the initial pressure is $100$ mm Hg and the total pressure after $10$ min is $150$ mm Hg. The half-life in minutes is

**Key:** 10
**Solution:** $P_A=2P_0-P_t=50=P_0/2$, so $10$ min is one half-life.

### [Q-3f566ea5] Question (single, main, origin: generated)

The half-life of a zero-order reaction with $k=2.5\times10^{-4}$ mol L⁻¹ s⁻¹ and $[A]_0=0.10$ M is

   A. 100 s
   B. 200 s
   C. 400 s
   D. 50 s

**Key:** B
**Solution:** $[A]_0/2k=0.10/(5\times10^{-4})=200$ s.

### [Q-a1bb573e] Question (single, main, origin: generated)

For a first-order reaction $k=0.0693$ min⁻¹. The time for $75\%$ completion is

   A. 10 min
   B. 20 min
   C. 30 min
   D. 40 min

**Key:** B
**Solution:** $t_{1/2}=10$ min, and $75\%$ complete is two half-lives.

### [Q-a24f3476] Question (integer, main, origin: generated)

The time for $99.9\%$ completion of a first-order reaction is $x$ times its half-life. Find $x$ (nearest integer).

**Key:** 10
**Solution:** $\ln1000/\ln2=9.97\approx10$.

### [Q-bc49b6c9] Question (single, main, origin: generated)

The half-life is $20$ min at $0.10$ M and $40$ min at $0.05$ M. The order is

   A. 0
   B. 1
   C. 2
   D. 3

**Key:** C
**Solution:** $t_{1/2}\propto1/[A]_0\Rightarrow n=2$.

### [Q-c17d9850] Question (integer, advanced, origin: generated)

For a reaction $t_{1/2}$ is $100$ s at $[A]_0=0.8$ M and $50$ s at $0.4$ M. The order is

**Key:** 0
**Solution:** Half-life halves when concentration halves, so $t_{1/2}\propto[A]_0$ and $n=0$.

### [Q-9ac8deca] Question (single, foundation, origin: generated)

A plot of $\ln[A]$ against $t$ is a straight line. The reaction is

   A. zero order
   B. first order
   C. second order
   D. cannot be said

**Key:** B
**Solution:** That is the first-order test.

### [Q-f70dc52c] Question (single, foundation, origin: generated)

The slope of a plot of $\ln k$ against $1/T$ equals

   A. $E_a/R$
   B. $-E_a/R$
   C. $-E_a$
   D. $\ln A$

**Key:** B
**Solution:** From $\ln k=\ln A-\dfrac{E_a}{R}\cdot\dfrac1T$.

### [Q-84c83d30] Question (single, main, origin: generated)

The half-life of a reaction is directly proportional to the initial concentration. The order is

   A. 0
   B. 1
   C. 2
   D. 3

**Key:** A
**Solution:** $t_{1/2}\propto[A]_0^{1-n}$ and $1-n=1$ gives $n=0$.

### [Q-af505ad4] Question (single, main, origin: generated)

The rate constant doubles when $T$ rises from $300$ K to $310$ K. $E_a$ in kJ mol⁻¹ is closest to

   A. 27
   B. 54
   C. 108
   D. 5.4

**Key:** B
**Solution:** $E_a=\dfrac{R\ln2}{1/300-1/310}=53.6$ kJ mol⁻¹.

### [Q-f4f040b1] Question (single, advanced, origin: generated)

A catalyst lowers $E_a$ from $75$ to $60$ kJ mol⁻¹ at $300$ K. The rate constant increases by a factor of about

   A. 4
   B. 40
   C. 400
   D. 4000

**Key:** C
**Solution:** $e^{15000/(8.314\times300)}=e^{6.01}\approx4\times10^2$.

### [Q-03fb8a0b] Question (integer, advanced, origin: generated)

A reaction has $E_{a,\text{forward}}=95$ and $E_{a,\text{reverse}}=70$ kJ mol⁻¹. $\Delta H$ in kJ mol⁻¹ is

**Key:** 25
**Solution:** $\Delta H=E_{a,f}-E_{a,r}=+25$ (endothermic).

### [Q-c2c399fc] Question (single, main, origin: generated)

At $300$ K, $k=1.0\times10^{-3}$ s⁻¹ and $E_a=50$ kJ mol⁻¹. $k$ at $320$ K (s⁻¹) is closest to

   A. $1.7\times10^{-3}$
   B. $3.5\times10^{-3}$
   C. $7.0\times10^{-3}$
   D. $1.0\times10^{-2}$

**Key:** B
**Solution:** $\ln(k_2/k_1)=1.253$ so $k_2/k_1=3.50$.

### [Q-edb0145c] Question (multi, main, origin: generated)

Which statements about a catalyst are correct?

   A. It lowers the activation energy
   B. It changes $\Delta H$ of the reaction
   C. It changes the equilibrium constant
   D. It increases the rates of the forward and reverse reactions

**Key:** A, D
**Solution:** A catalyst provides a lower-energy path; thermodynamics ($\Delta H$, $K$) is unchanged.

### [V-833074aa] Video: Chemical Kinetics Complete Chapter | Rate Law, Order, Half-Life & Numericals

Channel: AcadXL  
Link: https://www.youtube.com/watch?v=Bgh6GY47yi0  
Purpose: revision, level main
Why recommended: A single lecture covering rate law, order, half-life and numericals; useful as a whole-chapter revision.

*Watch before deciding. Check: link works, title/channel match, covers the topic, suitable for the level, teaching quality.*

## Rate of reaction, rate law, order and molecularity

### [L-3512b7ae] introduction (foundation)

**Measuring speed.** Speed of a car is distance per unit time. The speed (rate) of a reaction is the change in concentration per unit time. Reactants are used up, so their concentration falls; products appear, so theirs rises. The rate is always quoted as a positive number.

### [L-22f63c8e] explanation (foundation)

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

### [L-b8280fed] derivation (main)

**Why units of $k$ follow from the order.** Rate has units $\mathrm{mol\,L^{-1}s^{-1}}$. In $\text{rate}=k[A]^n$, the concentration factor has units $(\mathrm{mol\,L^{-1}})^n$. So $k$ has units $\dfrac{\mathrm{mol\,L^{-1}s^{-1}}}{(\mathrm{mol\,L^{-1}})^n}=(\mathrm{mol\,L^{-1}})^{1-n}\mathrm{s^{-1}}$. For $n=1$ the concentration units cancel, leaving $\mathrm{s^{-1}}$. For $n=2$, $k$ is $\mathrm{L\,mol^{-1}s^{-1}}$.

**Why the rate equation is divided by coefficients.** In $2N_2O_5\to4NO_2+O_2$, when one mole of $O_2$ forms, two moles of $N_2O_5$ vanish and four moles of $NO_2$ form. So $N_2O_5$ is used at twice the rate $O_2$ appears and $NO_2$ appears at four times that rate. Dividing each by its coefficient gives a single common number for "the rate of the reaction".

**Rate-determining step (idea).** In a series of steps the overall speed is controlled by the slowest one, like cars on a road narrowing to one lane. The intermediate species in earlier fast steps can be expressed in terms of reactants, so the final rate law may involve only the species appearing up to the slow step.

### [L-4ed18195] example (foundation)

**Example 1 (relating rates).** For $2N_2O_5\to4NO_2+O_2$, the rate of disappearance of $N_2O_5$ is $6.0\times10^{-3}\ \mathrm{mol\,L^{-1}s^{-1}}$. Find the rates of formation of $NO_2$ and $O_2$.
$-\dfrac12\dfrac{d[N_2O_5]}{dt}=\dfrac14\dfrac{d[NO_2]}{dt}=\dfrac{d[O_2]}{dt}$.
$\dfrac{d[NO_2]}{dt}=2\times6.0\times10^{-3}=1.2\times10^{-2}$ and $\dfrac{d[O_2]}{dt}=\dfrac12\times6.0\times10^{-3}=3.0\times10^{-3}\ \mathrm{mol\,L^{-1}s^{-1}}$.

### [L-336d47b8] example (main)

**Example 2 (order from initial rates).** For $A+B\to$ products, the initial rate was measured:

Experiment 1: $[A]=0.10$ M, $[B]=0.10$ M, rate $=2.0\times10^{-3}$ M s⁻¹.
Experiment 2: $[A]=0.20$ M, $[B]=0.10$ M, rate $=8.0\times10^{-3}$ M s⁻¹.
Experiment 3: $[A]=0.10$ M, $[B]=0.20$ M, rate $=4.0\times10^{-3}$ M s⁻¹.

*Method.* Change one concentration at a time. From 1→2, $[A]$ doubles and the rate becomes $4\times$, so the order in $A$ is $2$ ($2^m=4$). From 1→3, $[B]$ doubles and the rate doubles, so the order in $B$ is $1$. The rate law is $\text{rate}=k[A]^2[B]$ and the overall order is $3$.
$k=\dfrac{2.0\times10^{-3}}{(0.10)^2(0.10)}=2.0\ \mathrm{L^2mol^{-2}s^{-1}}$.

**Example 3 (units).** What are the units of $k$ for a second-order reaction? $\mathrm{L\,mol^{-1}s^{-1}}$ (from $(\mathrm{mol\,L^{-1}})^{1-2}\mathrm{s^{-1}}$).

### [L-603f8f95] example (advanced)

**Example 4 (changing volume).** The rate law of a gas-phase reaction is $\text{rate}=k[A]^2[B]$. If the volume of the container is reduced to one-third, by what factor does the rate change?
Halving the volume doubles each concentration; making the volume one-third triples each. Both $[A]$ and $[B]$ become $3\times$, so the rate becomes $3^2\times3=27\times$ the original.

**Example 5 (rate-determining step).** A mechanism: Step 1 (fast, reversible): $2NO\rightleftharpoons N_2O_2$. Step 2 (slow): $N_2O_2+O_2\to2NO_2$. Find the rate law.
The rate is that of the slow step: $\text{rate}=k_2[N_2O_2][O_2]$. $N_2O_2$ is an intermediate. From the fast equilibrium, $[N_2O_2]=K[NO]^2$, so $\text{rate}=k_2K[NO]^2[O_2]=k'[NO]^2[O_2]$, third order overall.

### [L-3f8f7c33] common mistakes (foundation)

1. Reading the order from the balanced equation. The order comes from experiment (it equals the coefficients only for an elementary step).
2. Confusing **order** (experimental, can be $0$ or a fraction) with **molecularity** (theoretical, whole number, only for elementary steps).
3. Forgetting to divide by the stoichiometric coefficient when relating rates of different species.
4. Writing a negative rate. Use the minus sign in the formula for reactants, so the rate is positive.
5. Putting intermediates in the final rate law without eliminating them.
6. Taking $k$ as dependent on concentration (it changes with temperature, not concentration).

### [L-a24ecf14] tips (main)

- **Initial rates:** compare two experiments in which only one concentration changes, and match the factor: factor $2$ giving $2^m$.
- Always check by recomputing $k$ from all experiments; it must come out the same.
- The units of $k$ immediately tell the order of the reaction: $\mathrm{s^{-1}}$ means first order.
- For a mechanism, write the rate law from the slow step, then replace intermediates using the fast steps.

### [L-74be7abe] summary (foundation)

Rate $=-\frac1a\frac{d[A]}{dt}=\frac1c\frac{d[C]}{dt}$. Rate law $=k[A]^m[B]^n$ (experimental). Order $=m+n$. $k$ units: $(\mathrm{mol\,L^{-1}})^{1-n}\mathrm{s^{-1}}$. Molecularity: whole number, elementary steps only. Slowest step controls the rate.

### [L-e48c1f97] mini assessment (foundation)

**Check yourself.**
1. For $N_2+3H_2\to2NH_3$, if $-\dfrac{d[N_2]}{dt}=0.5$ M/s, what is $\dfrac{d[NH_3]}{dt}$?
2. What is the order of a reaction whose $k$ has units $\mathrm{mol\,L^{-1}s^{-1}}$?
3. Can molecularity be zero or fractional?

**Answers.** 1. $1.0$ M/s. 2. Zero order. 3. No: molecularity is a positive whole number (and only defined for elementary steps).

### [F-e524279c] Formula: Rate law

$$\text{rate}=k[A]^m[B]^n,\quad \text{order}=m+n$$

Variables: k: rate constant (units depend on the order); [A], [B]: molar concentrations (mol L⁻¹); m, n: orders in A and B, found by experiment
Conditions: m and n equal the coefficients only for an elementary step
Units: mol L⁻¹ s⁻¹ (rate)

### [F-d21fc971] Formula: Rate of a reaction

$$\text{rate}=-\dfrac{1}{a}\dfrac{d[A]}{dt}=-\dfrac1b\dfrac{d[B]}{dt}=\dfrac1c\dfrac{d[C]}{dt}=\dfrac1d\dfrac{d[D]}{dt}$$

Variables: a, b, c, d: stoichiometric coefficients in aA + bB → cC + dD; [X]: molar concentration of X (mol L⁻¹)
Conditions: Balanced equation
Units: mol L⁻¹ s⁻¹

### [F-0c2779ff] Formula: Units of the rate constant

$$[k]=(\mathrm{mol\,L^{-1}})^{1-n}\,\mathrm{s^{-1}}$$

Variables: [k]: units of the rate constant; n: overall order of the reaction
Conditions: Whole-number or fractional order

Note: Zero order: mol L⁻¹ s⁻¹; first: s⁻¹; second: L mol⁻¹ s⁻¹

## Integrated rate equations and half-life

### [L-0a78fcd3] introduction (main)

**From rate to concentration.** The rate law tells us the speed at a given concentration. Often we want the concentration at a later time, or how long a reaction takes to reach a given stage. Integrating the rate law gives equations that connect concentration and time.

**Prerequisites.** Rate law and order; natural logarithms and exponentials; basic integration of $dx$ and $dx/x$ (shown step by step below).

### [L-dce24787] explanation (main)

**Zero order** ($\text{rate}=k$): $[A]=[A]_0-kt$. A plot of $[A]$ against $t$ is a straight line with slope $-k$. Half-life $t_{1/2}=\dfrac{[A]_0}{2k}$ (depends on initial concentration).

**First order** ($\text{rate}=k[A]$): $\ln\dfrac{[A]_0}{[A]}=kt$, i.e. $[A]=[A]_0e^{-kt}$, and $k=\dfrac{2.303}{t}\log\dfrac{[A]_0}{[A]}$. A plot of $\ln[A]$ against $t$ is a straight line with slope $-k$. Half-life $t_{1/2}=\dfrac{0.693}{k}$ (independent of initial concentration).

**Second order** ($\text{rate}=k[A]^2$): $\dfrac1{[A]}-\dfrac1{[A]_0}=kt$; $t_{1/2}=\dfrac1{k[A]_0}$.

**Fraction remaining.** In first-order decay, after $n$ half-lives the fraction left is $\left(\tfrac12\right)^n$: $50\%$, $25\%$, $12.5\%$, ... The time for $99.9\%$ completion is about $10$ half-lives.

**Pseudo first-order.** If one reactant is in large excess its concentration is practically constant, and a second-order reaction behaves like first order (for example, hydrolysis of an ester in dilute acid, with water in excess).

### [L-663f4c7d] derivation (advanced)

**First order.** $-\dfrac{d[A]}{dt}=k[A]\Rightarrow\dfrac{d[A]}{[A]}=-k\,dt$. Integrate from $t=0$ ($[A]_0$) to $t$ ($[A]$):
$\int_{[A]_0}^{[A]}\dfrac{d[A]}{[A]}=-k\int_0^tdt\Rightarrow\ln[A]-\ln[A]_0=-kt\Rightarrow\ln\dfrac{[A]_0}{[A]}=kt$.
Half-life: put $[A]=\tfrac12[A]_0$: $\ln2=kt_{1/2}\Rightarrow t_{1/2}=\dfrac{\ln2}k=\dfrac{0.693}k$.

**Zero order.** $-\dfrac{d[A]}{dt}=k\Rightarrow\int_{[A]_0}^{[A]}d[A]=-k\int_0^tdt\Rightarrow[A]=[A]_0-kt$. Half-life: $\tfrac12[A]_0=[A]_0-kt_{1/2}\Rightarrow t_{1/2}=\dfrac{[A]_0}{2k}$.

**Second order.** $-\dfrac{d[A]}{dt}=k[A]^2\Rightarrow\int\dfrac{d[A]}{[A]^2}=-k\int dt\Rightarrow\left[-\dfrac1{[A]}\right]_{[A]_0}^{[A]}=-kt\Rightarrow\dfrac1{[A]}-\dfrac1{[A]_0}=kt$.
Half-life: $\dfrac2{[A]_0}-\dfrac1{[A]_0}=kt_{1/2}\Rightarrow t_{1/2}=\dfrac1{k[A]_0}$.

**General order $n\ne1$.** $t_{1/2}\propto[A]_0^{\,1-n}$. This is the basis of the half-life method of finding order.

### [L-231f4a13] example (foundation)

**Example 1.** A first-order reaction is $75\%$ complete in $32$ minutes. Find its half-life.
$75\%$ complete means $25\%$ left $=\left(\tfrac12\right)^2$: two half-lives. So $t_{1/2}=32/2=16$ min.
*Then* $k=\dfrac{0.693}{16}=0.0433\ \mathrm{min^{-1}}$.

### [L-8fe9cba0] example (main)

**Example 2 (zero order).** A zero-order reaction has $k=2.5\times10^{-4}\ \mathrm{mol\,L^{-1}s^{-1}}$ and $[A]_0=0.10$ mol L⁻¹. Find the half-life and the time for completion.
$t_{1/2}=\dfrac{[A]_0}{2k}=\dfrac{0.10}{2\times2.5\times10^{-4}}=200$ s. Completion needs $t=\dfrac{[A]_0}k=400$ s (twice the half-life, because zero-order reactions end in finite time).

**Example 3 (time for 99.9%).** For a first-order reaction, how many half-lives for $99.9\%$ completion?
$\ln\dfrac{1}{0.001}=kt\Rightarrow t=\dfrac{6.908}{k}$ and $t_{1/2}=\dfrac{0.693}k$, so $t=9.97\,t_{1/2}\approx10\,t_{1/2}$.

### [L-30075d40] example (advanced)

**Example 4.** A first-order reaction is $20\%$ complete in $10$ minutes. Find the time for $80\%$ completion.
$k=\dfrac{2.303}{10}\log\dfrac{100}{80}=\dfrac{2.303\times0.0969}{10}=0.02231\ \mathrm{min^{-1}}$. For $80\%$ completion: $t=\dfrac{2.303}{k}\log\dfrac{100}{20}=\dfrac{2.303\times0.699}{0.02231}=72.1$ min.

**Example 5 (pressure data, first order).** For $A(g)\to B(g)+C(g)$ the initial pressure of $A$ is $P_0=100$ mm Hg, and after $10$ minutes the total pressure is $150$ mm Hg. Find the half-life (reaction is first order).
Let $x$ be the pressure of $A$ that reacted. Total pressure $=P_0-x+x+x=P_0+x$, so $x=50$ and $P_A=P_0-x=50$ mm Hg, i.e. $P_0/2$. So $10$ min is exactly one half-life.
*General expression:* $P_A=2P_0-P_t$, and $k=\dfrac{2.303}{t}\log\dfrac{P_0}{2P_0-P_t}$.

### [L-8cec6c35] common mistakes (main)

1. Using $t_{1/2}=0.693/k$ for a reaction that is not first order.
2. Saying the half-life of a zero-order reaction is constant; it halves when the initial concentration halves.
3. Treating "75% complete" as one half-life or "75% left" as two. Check the fraction remaining.
4. Using $\log$ and $\ln$ interchangeably. $\ln x=2.303\log x$.
5. Applying $\ln\frac{[A]_0}{[A]}$ with $[A]$ as the amount **reacted** instead of what remains.
6. Mixing time units between $k$ and $t$.

### [L-7c1c55e0] tips (main)

- Start every first-order problem by asking: is it a whole number of half-lives? If so, use the fraction $(1/2)^n$ and avoid logarithms.
- First-order and radioactive decay are the same mathematics: $N=N_0e^{-\lambda t}$.
- Convert percentages to fractions remaining before using the formulas.
- For gas reactions followed by pressure, express the reactant's partial pressure in terms of total pressure from the stoichiometry.

### [L-81c0e50a] summary (main)

Zero: $[A]=[A]_0-kt$; $t_{1/2}=\frac{[A]_0}{2k}$. First: $\ln\frac{[A]_0}{[A]}=kt$; $t_{1/2}=\frac{0.693}k$; $[A]=[A]_0e^{-kt}$. Second: $\frac1{[A]}-\frac1{[A]_0}=kt$; $t_{1/2}=\frac1{k[A]_0}$. $99.9\%$ completion $\approx10\,t_{1/2}$ (first order). Straight-line plots: zero $[A]$–$t$; first $\ln[A]$–$t$; second $1/[A]$–$t$.

### [L-a5f3f224] mini assessment (main)

**Check yourself.**
1. A first-order reaction has $k=0.0693\ \mathrm{min^{-1}}$. What is its half-life?
2. After how many half-lives is $12.5\%$ of a first-order reactant left?
3. Initial concentration is doubled; by what factor does the half-life of a zero-order reaction change?

**Answers.** 1. $10$ min. 2. $3$. 3. It doubles.

### [F-f6a039cd] Formula: First-order integrated rate law

$$\ln\dfrac{[A]_0}{[A]}=kt,\qquad k=\dfrac{2.303}{t}\log\dfrac{[A]_0}{[A]}$$

Variables: [A]₀: initial concentration (mol L⁻¹); [A]: concentration at time t (mol L⁻¹); k: first-order rate constant (s⁻¹); t: time (s)
Conditions: First-order reaction; same units for [A]₀ and [A]

### [F-c1ff366c] Formula: First-order rate constant from pressures

$$k=\dfrac{2.303}{t}\log\dfrac{P_0}{2P_0-P_t}$$

Variables: P₀: initial pressure of A (mm Hg or any pressure unit); Pₜ: total pressure at time t, same unit; t: time (s); k: first-order rate constant (s⁻¹ (matches t))
Conditions: A(g) → B(g) + C(g), first order, only A present initially

### [F-1793e4f7] Formula: Half-life of a first-order reaction

$$t_{1/2}=\dfrac{0.693}{k}$$

Variables: k: first-order rate constant (s⁻¹)
Conditions: Independent of the initial concentration

### [F-6599e662] Formula: Second-order integrated rate law

$$\dfrac{1}{[A]}-\dfrac{1}{[A]_0}=kt,\qquad t_{1/2}=\dfrac{1}{k[A]_0}$$

Variables: [A]₀, [A]: initial concentration and concentration at time t (mol L⁻¹); k: second-order rate constant (L mol⁻¹ s⁻¹); t: time (s)
Conditions: Rate = k[A]²

### [F-d81ec264] Formula: Zero-order integrated rate law

$$[A]=[A]_0-kt,\qquad t_{1/2}=\dfrac{[A]_0}{2k}$$

Variables: [A]: concentration at time t (mol L⁻¹); [A]₀: initial concentration (mol L⁻¹); k: zero-order rate constant (mol L⁻¹ s⁻¹); t: time (s)
Conditions: Zero-order reaction; valid until [A] reaches 0

### [V-d2dae9b1] Video: Chemical Kinetics 05 : ZERO Order Kinetics I Rate Law and Half Life Of Zero Order- JEE MAINS/NEET

Channel: Physics Wallah - Alakh Pandey  
Link: https://www.youtube.com/watch?v=A0QsbNj9x24  
Purpose: classroom, level main
Why recommended: Lecture on zero-order kinetics: rate law and half-life.

*Watch before deciding. Check: link works, title/channel match, covers the topic, suitable for the level, teaching quality.*

### [V-6d0f92d8] Video: Integrated Rate Laws and Half Life Formula - Nth Order Reaction - Chemical Kinetics

Channel: The Organic Chemistry Tutor  
Link: https://www.youtube.com/watch?v=2c8KSAeNQ6Y  
Purpose: concept, level main
Why recommended: Derives and applies integrated rate laws and half-lives for different orders. Good for building the formulas from scratch.

*Watch before deciding. Check: link works, title/channel match, covers the topic, suitable for the level, teaching quality.*

### [V-5785b9b0] Video: Rate Equation & Half-Life of First Order Reaction|Chemical Kinetics |Lec 04 | Class 12, NEET & JEE

Channel: Chem Curious  
Link: https://www.youtube.com/watch?v=M450hLzMXGc  
Purpose: classroom, level main
Why recommended: A class-12 lecture on the first-order rate equation and half-life, with JEE-style problems.

*Watch before deciding. Check: link works, title/channel match, covers the topic, suitable for the level, teaching quality.*

## Determining the order of a reaction

### [L-24669ca0] introduction (main)

**The detective work.** Nobody can read the order off the equation, so it has to be extracted from measurements. There are three standard methods, and JEE uses all three: the **initial-rate method**, the **integrated (graphical) method** and the **half-life method**.

**Prerequisites.** Rate law and order; integrated equations and half-lives; plotting straight lines.

### [L-1a09cc59] explanation (main)

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

### [L-c7dd74cd] derivation (advanced)

**Half-life dependence on concentration.** For $\text{rate}=k[A]^n$ with $n\ne1$: $\int_{[A]_0}^{[A]}[A]^{-n}d[A]=-k\,t\Rightarrow\dfrac{[A]^{1-n}-[A]_0^{1-n}}{1-n}=-kt$. Put $[A]=\tfrac12[A]_0$:
$\dfrac{\left(\tfrac12\right)^{1-n}-1}{1-n}[A]_0^{1-n}=-kt_{1/2}\Rightarrow t_{1/2}=\dfrac{2^{n-1}-1}{(n-1)\,k}\,[A]_0^{\,1-n}$.
So $t_{1/2}\propto[A]_0^{1-n}$, with the constant of proportionality depending on $n$ and $k$ only. For $n=1$ the limit gives $\dfrac{\ln2}{k}$, independent of $[A]_0$.

**Why the ratio formula works.** Dividing the expression for $(t_{1/2})_1$ by that for $(t_{1/2})_2$ cancels $k$ and the numerical factor, leaving $\left(\dfrac{[A]_{0,1}}{[A]_{0,2}}\right)^{1-n}=\left(\dfrac{[A]_{0,2}}{[A]_{0,1}}\right)^{n-1}$.

### [L-09facbac] example (foundation)

**Example 1.** The half-life of a reaction is $20$ min when $[A]_0=0.10$ M and $40$ min when $[A]_0=0.05$ M. Find the order.
Halving $[A]_0$ doubled $t_{1/2}$, so $t_{1/2}\propto1/[A]_0$, which means $n-1=1$ and $n=2$. Second order.

### [L-b8e738de] example (main)

**Example 2 (graph method).** Concentration of $A$ at different times: $t=0$, $50$, $100$, $150$ s gives $[A]=1.00,\ 0.607,\ 0.368,\ 0.223$ M. Is it first order?
$k=\dfrac1t\ln\dfrac{[A]_0}{[A]}$: at $50$ s, $\dfrac1{50}\ln\dfrac{1}{0.607}=0.0100$; at $100$ s, $\dfrac1{100}\ln\dfrac1{0.368}=0.0100$; at $150$ s, $\dfrac1{150}\ln\dfrac1{0.223}=0.0100\ \mathrm{s^{-1}}$. $k$ is constant, so the reaction is first order with $k=0.010\ \mathrm{s^{-1}}$.

### [L-87ab8b37] example (advanced)

**Example 3 (zero order check).** For a reaction, $t_{1/2}$ is $100$ s at $[A]_0=0.8$ M and $50$ s at $[A]_0=0.4$ M. Order?
$\dfrac{100}{50}=\left(\dfrac{0.4}{0.8}\right)^{n-1}\Rightarrow2=\left(\tfrac12\right)^{n-1}\Rightarrow n-1=-1\Rightarrow n=0$. Zero order (half-life proportional to $[A]_0$).

**Example 4 (isolation).** In the reaction $A+B\to$ products, with $[B]$ in large excess, the observed rate is first order in $A$. In a separate experiment with $[A]$ in large excess it is also first order in $B$. State the overall rate law and order.
$\text{rate}=k[A][B]$, overall second order. The pseudo-first-order constant in the first experiment is $k'=k[B]_0$.

### [L-0be23570] common mistakes (main)

1. Using the first-order half-life rule for a reaction of unknown order.
2. Taking the ratio of half-lives the wrong way up; check against the three standard cases.
3. Reading order from stoichiometry in a table-of-data question.
4. Assuming a fractional order is a mistake; it can be genuine.
5. Plotting $\ln[A]$ when the data are pressures of a product rather than the reactant.

### [L-e29339a3] tips (main)

- A quick memory table: $t_{1/2}$ constant $\to$ first; $t_{1/2}$ grows with $[A]_0\to$ zero; $t_{1/2}$ shrinks with $[A]_0\to$ second.
- When data are given at equal time intervals, test first order by checking whether the concentration falls by the same factor in each interval.
- A graph question usually asks for a quantity from the slope; remember slope $=-k$ for zero and first order plots and $+k$ for second order $1/[A]$ plots.

### [L-fa4ed87b] summary (main)

Initial-rate: $2^m=$ factor. Graphs: $[A]$ vs $t$ linear $\to$ zero; $\ln[A]$ vs $t$ linear $\to$ first; $1/[A]$ vs $t$ linear $\to$ second. Half-life: $\frac{t_1}{t_2}=\left(\frac{a_2}{a_1}\right)^{n-1}$. $t_{1/2}\propto[A]_0^{1-n}$.

### [L-f2ea4581] mini assessment (main)

**Check yourself.**
1. $t_{1/2}$ is the same at two different initial concentrations. Order?
2. Doubling the initial concentration of $A$ doubles the half-life. Order?
3. What does a straight line of $1/[A]$ against $t$ with positive slope indicate?

**Answers.** 1. First. 2. Zero. 3. Second order, with slope $=k$.

### [F-869134fc] Formula: Half-life and initial concentration

$$t_{1/2}\propto[A]_0^{\,1-n}\ \Longrightarrow\ \dfrac{(t_{1/2})_1}{(t_{1/2})_2}=\left(\dfrac{[A]_{0,2}}{[A]_{0,1}}\right)^{n-1}$$

Variables: n: order of the reaction; [A]₀: initial concentration (mol L⁻¹); t_{1/2}: half-life (s)
Conditions: n ≠ 1 for the proportionality; for n = 1 the half-life does not depend on [A]₀

### [V-70b5121f] Video: 12th Chemistry - IIT-JEE - Chemical Kinetics - Experimental Determination Of Rate Laws

Channel: Turito  
Link: https://www.youtube.com/watch?v=WmdnBA4CNZ4  
Purpose: examples, level main
Why recommended: Covers how rate laws are found from experimental data, the core of topic 3.

*Watch before deciding. Check: link works, title/channel match, covers the topic, suitable for the level, teaching quality.*

## Temperature, collision theory and the Arrhenius equation

### [L-de0b9f38] introduction (main)

**Why heating speeds things up so much.** A rule of thumb says the rate of many reactions roughly doubles or triples for every $10^\circ$C rise. Collision theory and the Arrhenius equation explain the number: it is not collisions becoming more frequent (that change is small) but a far larger fraction of collisions having enough energy to react.

**Prerequisites.** Rate constant; natural logarithm and exponential; the Kelvin scale; Boltzmann-type distribution of molecular energies (a few molecules have much more than the average energy).

### [L-86a9be43] explanation (main)

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

### [L-c12c8ed9] derivation (advanced)

**Two-temperature form from the Arrhenius equation.** Write the equation at two temperatures:
$\ln k_1=\ln A-\dfrac{E_a}{RT_1}$ and $\ln k_2=\ln A-\dfrac{E_a}{RT_2}$.
Subtract the first from the second. $\ln A$ cancels:
$\ln k_2-\ln k_1=-\dfrac{E_a}{RT_2}+\dfrac{E_a}{RT_1}=\dfrac{E_a}R\left(\dfrac1{T_1}-\dfrac1{T_2}\right)$.
Since $T_2>T_1$ implies $\dfrac1{T_1}>\dfrac1{T_2}$, the right side is positive and $k_2>k_1$.

**Why the effect of a catalyst is so large.** Because $E_a$ appears in an exponent, a modest reduction multiplies the rate by a large factor. If a catalyst lowers $E_a$ by $\Delta E$ at fixed $T$ (with $A$ unchanged), the rate constant is multiplied by $e^{\Delta E/RT}$.

**Fraction of molecules above $E_a$.** The factor $e^{-E_a/RT}$ comes from the Boltzmann distribution of energies. At higher $T$ the exponent $-E_a/RT$ is less negative, so the fraction rises sharply.

### [L-b6e84b70] example (foundation)

**Example 1.** What is the slope of a plot of $\ln k$ against $1/T$? $-\dfrac{E_a}R$. A steeper (more negative) slope means a larger activation energy.

### [L-826e6a92] example (main)

**Example 2 (activation energy from two rates).** The rate constant doubles when the temperature rises from $300$ K to $310$ K. Find $E_a$.
$\ln2=\dfrac{E_a}{8.314}\left(\dfrac1{300}-\dfrac1{310}\right)=\dfrac{E_a}{8.314}\times1.0753\times10^{-4}$.
$E_a=\dfrac{0.6931\times8.314}{1.0753\times10^{-4}}=5.36\times10^4\ \mathrm{J\,mol^{-1}}=53.6\ \mathrm{kJ\,mol^{-1}}$.

**Example 3 (new rate constant).** At $300$ K, $k=1.0\times10^{-3}\ \mathrm{s^{-1}}$ and $E_a=50\ \mathrm{kJ\,mol^{-1}}$. Find $k$ at $320$ K.
$\ln\dfrac{k_2}{k_1}=\dfrac{50000}{8.314}\left(\dfrac1{300}-\dfrac1{320}\right)=6014\times2.0833\times10^{-4}=1.253$. $\dfrac{k_2}{k_1}=e^{1.253}=3.50$, so $k_2=3.5\times10^{-3}\ \mathrm{s^{-1}}$.

### [L-5dbc055a] example (advanced)

**Example 4 (catalyst).** A catalyst lowers the activation energy from $75$ to $60\ \mathrm{kJ\,mol^{-1}}$ at $300$ K. By what factor does the rate constant increase (assume $A$ is unchanged)?
$\dfrac{k_{cat}}{k}=e^{\Delta E/RT}=\exp\!\left(\dfrac{15000}{8.314\times300}\right)=e^{6.01}\approx4.1\times10^2$.

**Example 5 (reaction enthalpy).** A reaction has $E_a=95$ kJ/mol (forward) and $E_a=70$ kJ/mol (reverse). Is the reaction endothermic or exothermic, and what is $\Delta H$?
$\Delta H=E_{a,f}-E_{a,r}=95-70=+25$ kJ/mol, so the reaction is endothermic.

### [L-ac551abd] common mistakes (main)

1. Using temperature in $^\circ$C. $T$ must be in kelvin.
2. Mixing units of $R$ and $E_a$ ($8.314$ J with $E_a$ in kJ without converting).
3. Saying a catalyst changes $\Delta H$ or the equilibrium position. It changes the rate only (it speeds both directions equally).
4. Saying temperature raises the rate because it increases collision frequency a lot. The main reason is the larger fraction of molecules with $E\ge E_a$.
5. Confusing $\ln$ and $\log$ in the two-temperature form (difference of factor $2.303$).
6. Thinking a reaction with a higher activation energy is always slower at all temperatures; it also responds more strongly to temperature.

### [L-66949824] tips (main)

- Write $\dfrac{1}{T_1}-\dfrac1{T_2}$ as $\dfrac{T_2-T_1}{T_1T_2}$ to keep arithmetic clean.
- In graph questions identify the slope as $-E_a/R$ (or $-E_a/2.303R$ if the axis is $\log k$).
- For "rate doubles every $10^\circ$C" estimates, remember it is an approximation that corresponds to $E_a\approx50$ kJ/mol near room temperature.

### [L-c06f826c] summary (main)

$k=Ae^{-E_a/RT}$; $\ln k=\ln A-\frac{E_a}{RT}$; slope of $\ln k$ vs $1/T$ is $-E_a/R$. $\ln\frac{k_2}{k_1}=\frac{E_a}R\left(\frac1{T_1}-\frac1{T_2}\right)$. Catalyst: lowers $E_a$, same $\Delta H$, same equilibrium. $\Delta H=E_{a,f}-E_{a,r}$. $T$ in kelvin.

### [L-0fa311fe] mini assessment (main)

**Check yourself.**
1. What is the unit of the frequency factor $A$ for a first-order reaction?
2. Does a catalyst change the equilibrium constant?
3. If $E_a=0$, how does $k$ depend on temperature?

**Answers.** 1. $\mathrm{s^{-1}}$ (the same as $k$). 2. No. 3. It does not: $k=A$.

### [F-3ffc4265] Formula: Arrhenius equation

$$k=A\,e^{-E_a/RT}$$

Variables: A: frequency (pre-exponential) factor; Eₐ: activation energy (J mol⁻¹); R: gas constant, 8.314 (J mol⁻¹ K⁻¹); T: absolute temperature (K)
Conditions: T in kelvin

### [F-e7055401] Formula: Arrhenius equation at two temperatures

$$\ln\dfrac{k_2}{k_1}=\dfrac{E_a}{R}\left(\dfrac{1}{T_1}-\dfrac{1}{T_2}\right)$$

Variables: k₁, k₂: rate constants at T₁ and T₂ (same units); Eₐ: activation energy (J mol⁻¹); R: gas constant, 8.314 (J mol⁻¹ K⁻¹); T₁, T₂: absolute temperatures (K)
Conditions: Eₐ taken as constant over the range; T in kelvin

Note: With log₁₀: log(k₂/k₁) = (Eₐ/2.303R)(1/T₁ − 1/T₂)

### [V-ce0468e0] Video: 3 / 4 - Lecture 17 - Solving for activation energy with rate constants at two different temperatures

Channel: CHEM1142  
Link: https://www.youtube.com/watch?v=eS1Fp8CKfBA  
Purpose: examples, level main
Why recommended: Worked method for finding activation energy from two rate constants (university course lecture).

*Watch before deciding. Check: link works, title/channel match, covers the topic, suitable for the level, teaching quality.*

### [V-f0e12891] Video: Arrhenius Equation | General Chemistry II | 6.8

Channel: Professor Derricotte  
Link: https://www.youtube.com/watch?v=QwxS6b70qf4  
Purpose: concept, level main
Why recommended: An English lecture introducing the Arrhenius equation and its meaning (university-level general chemistry).

*Watch before deciding. Check: link works, title/channel match, covers the topic, suitable for the level, teaching quality.*
