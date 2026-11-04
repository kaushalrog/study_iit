# Academic review packet: Gravitation

Generated 2026-11-05. Subject: physics.

**What this is.** Original explanations, formulas, practice questions and video links written for ORBIT. None of it has been academically reviewed. Please read each item, solve each question yourself before looking at the key, and record a decision in the companion CSV (one row per item, identified by the code shown in each heading).

**Decisions:** `approved` · `rejected` · `needs_research` · `edited` (you changed it elsewhere) · `comment`. For each check use `pass`, `fail` or `na`. Add feedback for anything that is not a plain pass.

**Please also judge:** whether the explanation skips reasoning, whether prerequisites are right, whether each topic and question is inside the intended syllabus, and whether the difficulty label reflects the reasoning needed.

**Scope caution.** The topic list is ORBIT's provisional crosswalk to the JEE syllabus, not the Chaitanya IPL scheme.

## Chapter overview

### [L-f8acd0cb] introduction (foundation)

**The one idea.** Every piece of matter pulls on every other piece of matter. The pull between everyday objects is far too weak to notice, but between a planet and anything near it, it dominates. Gravitation explains why things fall, why the Moon orbits the Earth, why planets orbit the Sun, and why a rocket needs a very large speed to leave Earth.

**Prerequisites.** (1) Newton's laws of motion and the meaning of force as $F=ma$. (2) Circular motion and centripetal acceleration $a=v^2/r$. (3) Work, kinetic energy and the work-energy theorem, and the idea of potential energy. (4) Basic algebra with powers and square roots. If circular motion or energy conservation feels uncertain, revise them first because satellites and escape velocity use both.

**What you will be able to do.** Calculate the gravitational force and field from point masses and spheres; find how $g$ changes with height and depth; use energy to get escape velocity; and work out orbital speed, period and energy of a satellite.

### [L-6a9fc2c9] why it matters (main)

Gravitation is one of the most predictable chapters in JEE mechanics: almost every question reduces to Newton's law of gravitation, energy conservation, or circular-orbit equations. The same few expressions are combined in different ways, so a student who understands where $v_{orbit}=\sqrt{GM/r}$ and $v_{escape}=\sqrt{2GM/R}$ come from can rebuild any variant instead of memorising each one. Gravitation also trains habits needed in later chapters: choosing a reference for potential energy, using ratios to avoid numbers, and checking dimensions.

**Syllabus note.** (The official syllabus PDF could not be retrieved when this was written, so the wording below comes from published summaries and has not been checked against it.) Published summaries of the JEE syllabus lists universal law of gravitation, acceleration due to gravity and its variation with altitude and depth, Kepler's laws, gravitational potential energy and potential, escape velocity, and orbital velocity of a satellite. The four-topic grouping is ORBIT's provisional crosswalk, not the confirmed Chaitanya IPL scheme.

### [Q-79506b44] Question (single, advanced, origin: generated)

Four equal masses $m$ at the corners of a square of side $a$. The net force on one is

   A. $\dfrac{Gm^2}{a^2}\left(\sqrt2+\tfrac12\right)$
   B. $\dfrac{Gm^2}{a^2}\left(2+\tfrac12\right)$
   C. $\dfrac{4Gm^2}{a^2}$
   D. $\dfrac{Gm^2}{a^2}\left(\tfrac{1}{\sqrt2}+\tfrac12\right)$

**Key:** A
**Solution:** Two side forces resolve to $\sqrt2\,Gm^2/a^2$ along the diagonal; the diagonal mass adds $Gm^2/2a^2$.

### [Q-56bdbf6d] Question (single, foundation, origin: generated)

The distance between two masses is doubled and one mass is also doubled. The force becomes

   A. $\tfrac12$ of the original
   B. $\tfrac14$ of the original
   C. the same
   D. $2$ times

**Key:** A
**Solution:** $F\propto m_1m_2/r^2$: $2/4=1/2$.

### [Q-a39f6bfd] Question (single, foundation, origin: generated)

The gravitational field at a point inside a thin uniform spherical shell is

   A. zero
   B. $GM/R^2$
   C. $GM/r^2$ with $r$ the distance from the centre
   D. maximum at the centre

**Key:** A
**Solution:** By symmetry the pulls of the shell cancel everywhere inside.

### [Q-f7b05014] Question (single, main, origin: generated)

Two masses $M$ and $4M$ are $3$ m apart. The gravitational field is zero at a distance (from $M$, on the line between them) of

   A. 0.5 m
   B. 1 m
   C. 1.5 m
   D. 2 m

**Key:** B
**Solution:** $\dfrac{1}{x^2}=\dfrac{4}{(3-x)^2}\Rightarrow x=1$ m.

### [Q-3657625c] Question (integer, advanced, origin: generated)

The height $h$ (in km, rounded to the nearest integer) at which $g$ decreases by $1\%$, using $R=6400$ km and the exact formula, is closest to

**Key:** 32
**Solution:** $(R/(R+h))^2=0.99\Rightarrow h=R(1/\sqrt{0.99}-1)=0.005038R\approx32$ km.

### [Q-24be76b6] Question (single, foundation, origin: generated)

At what height above the surface is $g$ equal to $\tfrac14$ of its surface value?

   A. $R/2$
   B. $R$
   C. $2R$
   D. $3R$

**Key:** B
**Solution:** $(R/(R+h))^2=1/4\Rightarrow h=R$.

### [Q-a13f19dd] Question (single, foundation, origin: generated)

At a depth $d=R/2$ the value of $g$ (uniform Earth) is

   A. $g/4$
   B. $g/2$
   C. $3g/4$
   D. $g$

**Key:** B
**Solution:** $g_d=g(1-d/R)=g/2$.

### [Q-c58934da] Question (single, foundation, origin: generated)

The escape velocity from Earth is closest to

   A. 7.9 km/s
   B. 11.2 km/s
   C. 15.0 km/s
   D. 3.0 km/s

**Key:** B
**Solution:** $\sqrt{2gR}=11.2$ km/s.

### [Q-eed0d472] Question (single, main, origin: generated)

For small height $h$ the fractional decrease in $g$ is approximately

   A. $h/R$
   B. $2h/R$
   C. $h/2R$
   D. $h^2/R^2$

**Key:** B
**Solution:** $g_h\approx g(1-2h/R)$.

### [Q-58268e46] Question (single, main, origin: generated)

If $g$ is the same at height $h$ and depth $d$ ($h\ll R$), then

   A. $d=h$
   B. $d=2h$
   C. $d=h/2$
   D. $d=4h$

**Key:** B
**Solution:** $1-2h/R=1-d/R\Rightarrow d=2h$.

### [Q-19725eee] Question (integer, advanced, origin: generated)

A body is projected from Earth’s surface with speed $v_e/2$. The maximum height reached is $R/k$. Find $k$.

**Key:** 3
**Solution:** Energy conservation gives $R+h=\tfrac43R$, so $h=R/3$.

### [Q-a9a03c2d] Question (single, advanced, origin: generated)

A body leaves Earth with speed $2v_e$. Its speed far away is

   A. $v_e$
   B. $\sqrt3\,v_e$
   C. $2v_e$
   D. $\sqrt2\,v_e$

**Key:** B
**Solution:** $\tfrac12v_\infty^2=\tfrac12(2v_e)^2-\tfrac12v_e^2=\tfrac32v_e^2$.

### [Q-4b4822e7] Question (single, foundation, origin: generated)

The orbital speed of a satellite close to Earth’s surface is about

   A. 7.9 km/s
   B. 11.2 km/s
   C. 3.1 km/s
   D. 9.8 km/s

**Key:** A
**Solution:** $\sqrt{gR}=7.9$ km/s.

### [Q-4ac5cc69] Question (single, main, origin: generated)

A planet has $\tfrac14$ of Earth’s mass and $\tfrac14$ of Earth’s radius. Its escape velocity is

   A. same as Earth’s
   B. $\tfrac12$ of Earth’s
   C. twice Earth’s
   D. $\tfrac14$ of Earth’s

**Key:** A
**Solution:** $v_e\propto\sqrt{M/R}$, ratio $=1$.

### [Q-6251dcfc] Question (single, main, origin: generated)

The energy needed to raise $1$ kg from the surface to height $R$ is closest to

   A. $6.3\times10^7$ J
   B. $3.1\times10^7$ J
   C. $9.8\times10^6$ J
   D. $1.2\times10^8$ J

**Key:** B
**Solution:** $\Delta U=mgR/2=3.1\times10^7$ J.

### [Q-4e1fd59b] Question (single, advanced, origin: generated)

A satellite in circular orbit loses energy slowly to atmospheric drag. Its speed

   A. increases
   B. decreases
   C. stays constant
   D. first decreases then increases

**Key:** A
**Solution:** $E=-GMm/2r$ falls so $r$ falls; $v=\sqrt{GM/r}$ rises.

### [Q-2c71afdc] Question (multi, advanced, origin: generated)

A satellite moves to an orbit of twice the radius. Which statements are correct?

   A. Its orbital speed decreases by a factor of $\sqrt2$
   B. Its period increases by a factor of $2\sqrt2$
   C. Its kinetic energy doubles
   D. Its total energy increases (becomes less negative)

**Key:** A, B, D
**Solution:** $v\propto r^{-1/2}$, $T\propto r^{3/2}$, $K\propto1/r$ halves, and $E=-GMm/2r$ rises toward zero.

### [Q-0de12d0d] Question (single, main, origin: generated)

A planet orbits at four times the distance of another planet from the same star. Its period is

   A. $2$ times
   B. $4$ times
   C. $8$ times
   D. $16$ times

**Key:** C
**Solution:** $T\propto r^{3/2}$: $4^{3/2}=8$.

### [Q-3d5aeef5] Question (single, main, origin: generated)

The total energy of a satellite is $-4\times10^9$ J. Its kinetic energy is

   A. $-4\times10^9$ J
   B. $+4\times10^9$ J
   C. $-8\times10^9$ J
   D. $+8\times10^9$ J

**Key:** B
**Solution:** $K=-E$ for a circular orbit.

### [Q-ab11c73a] Question (integer, main, origin: generated)

A satellite’s circular-orbit speed is increased by a factor $\sqrt{n}$ so that it just escapes. Find $n$.

**Key:** 2
**Solution:** Escape speed is $\sqrt2$ times the circular speed.

## Newton's law of gravitation and the gravitational field

### [L-6037c9c6] introduction (foundation)

**Why does an apple fall but the Moon does not?** Newton's insight was that the same force acts in both cases. The apple falls straight down; the Moon also falls toward Earth, but it moves sideways so fast that it keeps missing the Earth. The force law that covers both is the **universal law of gravitation**.

### [L-f38dc868] explanation (foundation)

**The law.** Two point masses $m_1$ and $m_2$ a distance $r$ apart attract each other with a force
$$F=\frac{G\,m_1m_2}{r^2}.$$
$G=6.67\times10^{-11}\ \mathrm{N\,m^2\,kg^{-2}}$ is the universal gravitational constant.

**What each part says.**
- The force is proportional to **each** mass: doubling one mass doubles the force.
- The force falls as the **square of the distance**: doubling the distance cuts the force to a quarter.
- The force is always **attractive** and acts along the line joining the masses.
- Forces on the two bodies are equal and opposite (Newton's third law), even if the masses differ.

**Gravitational field.** The field at a point is the force per unit mass on a small test mass placed there: $\vec g=\vec F/m$. For a point mass $M$ at distance $r$, $g=\dfrac{GM}{r^2}$, directed toward $M$. Fields from several masses add as vectors (**superposition**).

**Spheres.** A uniform solid sphere or thin shell attracts outside bodies as if all its mass were at its centre (for $r\ge R$). Inside a thin uniform shell the field is zero.

**Why $G$ is tiny.** For two 1 kg masses 1 m apart, $F=6.67\times10^{-11}$ N, roughly a hundred thousand times smaller than the weight of a grain of sand (about a milligram). Gravity matters only when at least one mass is astronomical.

### [L-4ed5ce50] derivation (main)

**Where the inverse-square law comes from (conceptually).** Imagine the pull of a mass spreading out equally in all directions, like light from a bulb. At distance $r$ it is spread over a sphere of area $4\pi r^2$. If the total "amount of pull" is conserved, its strength per unit area falls as $1/r^2$. Newton also showed it fits Kepler's observations: for circular orbits $T^2\propto r^3$ requires the force to fall as $1/r^2$.

**Check with the Moon.** The Moon is about $60R$ from Earth's centre. If gravity falls as $1/r^2$, the Moon's acceleration should be $g/3600\approx2.7\times10^{-3}\ \mathrm{m\,s^{-2}}$. Its centripetal acceleration from its period (27.3 days) and distance ($3.84\times10^8$ m) is $\dfrac{4\pi^2r}{T^2}\approx2.7\times10^{-3}\ \mathrm{m\,s^{-2}}$. The numbers match, which is how Newton confirmed the law.

**Field of a uniform shell (idea).** Add up the forces from all small patches of a thin shell on a test mass inside it. The nearer patches pull harder but there are fewer of them, since the area scales as $r^2$ while the force scales as $1/r^2$; the pulls from opposite sides cancel exactly for every position inside. Hence $g=0$ inside a uniform thin shell.

### [L-7fc580c9] example (foundation)

**Example 1.** Two masses of $10$ kg and $10$ kg are $0.1$ m apart. Find the attractive force.
$F=\dfrac{G m_1m_2}{r^2}=\dfrac{6.67\times10^{-11}\times10\times10}{(0.1)^2}=6.67\times10^{-7}$ N.
This is far below anything we can feel, which is why we do not notice attraction between everyday objects.

### [L-0bde7f2c] example (main)

**Example 2 (a point of zero field).** Masses $M$ and $4M$ are $3$ m apart. Find where, on the line between them, the net gravitational field is zero.
Let the point be $x$ from $M$ (so $3-x$ from $4M$). The fields point toward their own masses, in opposite directions, so they cancel when
$\dfrac{GM}{x^2}=\dfrac{G\cdot4M}{(3-x)^2}\Rightarrow(3-x)^2=4x^2\Rightarrow3-x=2x\Rightarrow x=1$ m.
(We took the positive root because the point lies between the masses.) The point is $1$ m from $M$.

### [L-61cc69c4] example (advanced)

**Example 3 (force scaling).** The distance between two masses is increased from $r$ to $3r$ and one of the masses is doubled. By what factor does the force change?
$F\propto\dfrac{m_1m_2}{r^2}$. New force $=\dfrac{2}{(3)^2}=\dfrac29$ of the old force.

**Example 4 (ring of masses, symmetry).** Four equal masses $m$ sit at the corners of a square of side $a$. Find the net force on one of them.
Let the mass be at one corner. The two adjacent masses (distance $a$) each give $\dfrac{Gm^2}{a^2}$ along the sides, at right angles. The diagonal mass (distance $a\sqrt2$) gives $\dfrac{Gm^2}{2a^2}$ along the diagonal. Resolve along the diagonal toward the centre: each side force contributes $\dfrac{Gm^2}{a^2}\cos45^\circ=\dfrac{Gm^2}{a^2\sqrt2}$, so two of them give $\dfrac{\sqrt2\,Gm^2}{a^2}$. Total $=\dfrac{Gm^2}{a^2}\left(\sqrt2+\dfrac12\right)$, directed toward the centre of the square.

### [L-088327dd] common mistakes (foundation)

1. Using the distance between **surfaces** instead of **centres** for spheres. For a body at height $h$ above Earth, $r=R+h$.
2. Treating the field as a scalar and adding magnitudes. Fields are vectors; draw directions first.
3. Thinking the heavier body pulls harder on the lighter one than vice versa. The forces are equal in magnitude.
4. Confusing $G$ (universal constant) with $g$ (local acceleration).
5. Using $g=GM/r^2$ inside a shell, where the field is zero.

### [L-83f8fb9c] tips (main)

- Prefer ratios: when a question changes masses or distances, write $F\propto\dfrac{m_1m_2}{r^2}$ and compute the factor, avoiding $G$ altogether.
- For zero-field points between two masses, equate the two magnitudes and take the root that lies between them. Outside the pair, the fields point the same way, so the field cannot vanish there when both masses attract.
- For symmetric arrangements, find the net force by components along a symmetry axis.

### [L-d5c90f2e] summary (foundation)

$F=\dfrac{Gm_1m_2}{r^2}$; always attractive; equal and opposite on the two bodies. Field $g=\dfrac{GM}{r^2}$ toward the mass; fields add as vectors. Sphere/shell acts as a point at its centre for outside points; zero field inside a thin shell. $G=6.67\times10^{-11}$ N m² kg⁻².

### [L-be79931d] mini assessment (foundation)

**Check yourself.**
1. If the distance between two masses is doubled, by what factor does the force change?
2. Does the Earth pull on you harder than you pull on the Earth?
3. What is the gravitational field inside a hollow uniform shell?

**Answers.** 1. Becomes $\tfrac14$. 2. No: the forces are equal and opposite (the Earth barely accelerates because its mass is huge). 3. Zero.

### [F-9c62888a] Formula: Gravitational field of a point mass

$$g = \dfrac{G M}{r^{2}}$$

Variables: g: field (force per unit mass), directed toward M (N kg⁻¹ = m s⁻²); G: universal gravitational constant (N m² kg⁻²); M: the source mass (kg); r: distance from the centre of M (m)
Conditions: r ≥ R for a sphere; zero inside a thin uniform shell
Units: N kg⁻¹ (= m s⁻²)

### [F-16fa7d00] Formula: Newton's law of gravitation

$$F = \dfrac{G\,m_1 m_2}{r^{2}}$$

Variables: F: attractive force between the two masses (N); G: universal gravitational constant, 6.67 × 10⁻¹¹ (N m² kg⁻²); m₁, m₂: the two masses (kg); r: distance between the centres (m)
Conditions: Point masses, or spheres with spherically symmetric mass distribution
Units: N
Note: Inverse-square; equal and opposite on the two bodies.

## Acceleration due to gravity and its variation

### [L-a007773c] introduction (main)

**Earth's pull is not the same everywhere.** The value $g=9.8\ \mathrm{m\,s^{-2}}$ is the field at Earth's surface. It changes as you go up a mountain, down a mine, or toward the equator. JEE asks for the size of these changes, usually as fractions of $g$.

**Prerequisites.** The law of gravitation and field of a sphere; the binomial approximation $(1+x)^n\approx1+nx$ for small $x$; the idea of density for a uniform sphere.

### [L-f2840268] explanation (main)

**At the surface.** $g=\dfrac{GM}{R^2}$ where $M$ is Earth's mass and $R$ its radius. This also shows that $GM=gR^2$, a relation used constantly.

**At height $h$ above the surface.** The distance from the centre is $R+h$:
$$g_h=\frac{GM}{(R+h)^2}=g\left(\frac{R}{R+h}\right)^2.$$
For $h\ll R$: $g_h\approx g\left(1-\dfrac{2h}{R}\right)$.

**At depth $d$ below the surface (uniform-density Earth).** Only the mass inside the radius $R-d$ attracts you (the outer shell contributes zero):
$$g_d=g\left(1-\frac dR\right).$$
So $g$ decreases linearly to zero at the centre.

**Effect of rotation.** At latitude $\lambda$ the apparent $g$ is $g'=g-\omega^2R\cos^2\lambda$. At the poles ($\lambda=90^\circ$) there is no correction; at the equator the correction is largest, $\omega^2R\approx0.034\ \mathrm{m\,s^{-2}}$ (about $0.35\%$ of $g$). Also Earth is slightly flattened, so $g$ is slightly larger at the poles for that reason too.

**Graph.** $g$ inside rises linearly from $0$ at the centre to its maximum at the surface, then falls as $1/r^2$ outside.

### [L-145ec98a] derivation (main)

**Depth formula.** Assume uniform density $\rho$. At radius $r<R$ only the sphere of radius $r$ attracts (the shell outside gives no net field), with mass $M_r=\tfrac43\pi r^3\rho$. So
$g_r=\dfrac{GM_r}{r^2}=\dfrac{G\cdot\tfrac43\pi r^3\rho}{r^2}=\tfrac43\pi G\rho\,r$.
At the surface $g=\tfrac43\pi G\rho R$, so $g_r=g\,\dfrac rR$. With $r=R-d$: $g_d=g\left(1-\dfrac dR\right)$.

**Small-height approximation.** $g_h=g(1+h/R)^{-2}$. For $h/R\ll1$ the binomial approximation gives $g(1-2h/R)$. The approximation is good when $h/R$ is below about $0.05$; for larger $h$ use the exact formula.

**Rotation correction.** A person at latitude $\lambda$ moves in a circle of radius $R\cos\lambda$ with angular speed $\omega$. The centripetal acceleration needed is $\omega^2R\cos\lambda$, directed toward the axis. Its component along the line to Earth's centre is $\omega^2R\cos^2\lambda$, which reduces the apparent weight: $g'=g-\omega^2R\cos^2\lambda$.

### [L-5a6e4c2f] example (foundation)

**Example 1.** At what height above the surface is $g$ one quarter of its surface value?
$g_h=\dfrac g4\Rightarrow\left(\dfrac R{R+h}\right)^2=\dfrac14\Rightarrow R+h=2R\Rightarrow h=R$.

### [L-8cb8f579] example (main)

**Example 2.** At what depth is $g$ half of its surface value?
$g_d=g\left(1-\dfrac dR\right)=\dfrac g2\Rightarrow d=\dfrac R2$.

**Example 3 (when the approximation is allowed).** By what fraction does $g$ decrease at $h=\dfrac R{200}$?
Using $g_h\approx g(1-2h/R)$: decrease $=\dfrac{2h}R=\dfrac{2}{200}=1\%$.
*Exact check:* $\left(\dfrac{200}{201}\right)^2=0.99007$, so the decrease is $0.993\%$, which rounds to $1\%$. The approximation is excellent here.

### [L-d56476ab] example (advanced)

**Example 4 (same $g$ up and down).** Find $h$ (above the surface) and $d$ (below it) such that $g$ has the same value at both places, assuming $h\ll R$.
$g\left(1-\dfrac{2h}R\right)=g\left(1-\dfrac dR\right)\Rightarrow d=2h$.

**Example 5 (rotation).** What angular speed must Earth have for objects at the equator to be weightless?
At the equator $g'=g-\omega^2R=0\Rightarrow\omega=\sqrt{g/R}\approx\sqrt{9.8/6.4\times10^6}=1.24\times10^{-3}\ \mathrm{rad\,s^{-1}}$, about $17$ times Earth's actual angular speed ($7.3\times10^{-5}$). The day would last about $84$ minutes.

### [L-166e8d88] common mistakes (main)

1. Using $g(1-h/R)$ for height (that is the **depth** formula). Height gives $1-2h/R$.
2. Using $h$ instead of $R+h$ in the exact formula.
3. Applying the binomial approximation for $h$ comparable to $R$.
4. Assuming $g$ is zero at the centre only in a hollow Earth; for a solid uniform Earth it is zero at the centre because the enclosed mass shrinks to zero.
5. Forgetting that the depth formula assumes uniform density; the real Earth's core is denser, so real $g$ first rises slightly below the surface.

### [L-d7207f30] tips (main)

- Write $GM=gR^2$ and replace $GM$ by it whenever $g$ and $R$ are given.
- Height: $1-2h/R$; depth: $1-d/R$. Remember "twice as sensitive going up".
- For a ratio like $g_h/g_d$, divide the two expressions rather than computing each separately.

### [L-53c85bc1] summary (main)

$g=\dfrac{GM}{R^2}$, $GM=gR^2$. Height: $g_h=g\left(\dfrac R{R+h}\right)^2\approx g(1-\tfrac{2h}R)$. Depth: $g_d=g(1-\tfrac dR)$. Latitude: $g'=g-\omega^2R\cos^2\lambda$. Zero at the centre, maximum at the surface, $1/r^2$ outside.

### [L-8135cd5c] mini assessment (main)

**Check yourself.**
1. Find $g$ at height $R$ above the surface in terms of $g$.
2. Find the depth at which $g$ is $75\%$ of the surface value.
3. What is the apparent weight change at the equator due to rotation, as a fraction of $g$ (roughly)?

**Answers.** 1. $g/4$. 2. $d=\dfrac R4$. 3. About $0.35\%$ less.

### [F-1305b988] Formula: Apparent g at latitude λ

$$g' = g - \omega^{2}R\cos^{2}\lambda$$

Variables: g': apparent value of g at latitude λ (m s⁻²); g: value without rotation (m s⁻²); ω: angular speed of the planet (rad s⁻¹); R: radius of the planet (m); λ: latitude (0° at the equator, 90° at the poles) (degrees or rad)
Conditions: Spherical rotating planet at the surface; the correction is zero at the poles
Units: m s⁻²

### [F-a160e6c5] Formula: Surface value of g

$$g = \dfrac{G M}{R^{2}}\ \Longrightarrow\ GM = gR^{2}$$

Variables: g: acceleration due to gravity at the surface (m s⁻²); G: universal gravitational constant (N m² kg⁻²); M: mass of the planet (kg); R: radius of the planet (m)
Conditions: Evaluated at the surface of a spherically symmetric planet (ignoring rotation)
Units: m s⁻²
Note: Used to replace GM whenever g and R are given.

### [F-44c8f421] Formula: g at depth d

$$g_d = g\left(1-\dfrac{d}{R}\right)$$

Variables: g_d: acceleration due to gravity at depth d (m s⁻²); g: value at the surface (m s⁻²); d: depth below the surface (m); R: radius of the planet (m)
Conditions: Uniform-density planet (the real Earth’s denser core changes this)
Units: m s⁻²

### [F-70e26c2f] Formula: g at height h

$$g_h = g\left(\dfrac{R}{R+h}\right)^{2} \approx g\left(1-\dfrac{2h}{R}\right)$$

Variables: g_h: acceleration due to gravity at height h (m s⁻²); g: value at the surface (m s⁻²); h: height above the surface (m); R: radius of the planet (m)
Conditions: The approximate form needs h much smaller than R (error below about 0.5% for h < R/50)
Units: m s⁻²

## Gravitational potential energy and escape velocity

### [L-b9852ab8] introduction (main)

**Energy is a better tool than force here.** The pull of gravity changes with distance, so using $W=Fd$ directly is awkward. Gravity is a **conservative** force: the work it does depends only on the start and end points. That lets us define a potential energy and solve "how fast to leave Earth" with energy conservation instead of integrating motion.

**Prerequisites.** Work done by a variable force (area under an $F$–$r$ graph, or a simple integral); conservation of mechanical energy; the law of gravitation. Where an integral appears we show every step.

### [L-45e2d39b] explanation (main)

**Reference.** Gravitational potential energy is measured from infinity, where it is defined to be zero. Because gravity is attractive, energy is **negative** at any finite distance:
$$U(r)=-\frac{GMm}{r}.$$
The **gravitational potential** at a point is the potential energy per unit mass: $V=-\dfrac{GM}{r}$ (units J kg⁻¹).

**Near the surface** the change in potential energy for a small rise $h$ is $mgh$. The familiar $mgh$ is the difference of two values of $-\dfrac{GMm}{r}$, not a different law.

**Escape velocity.** The minimum speed that lets a body leave Earth's gravity and never return (ignoring air and other bodies):
$$v_e=\sqrt{\frac{2GM}{R}}=\sqrt{2gR}\approx11.2\ \mathrm{km\,s^{-1}}.$$
It does not depend on the mass of the body or the direction of launch (if it does not hit anything), and it equals $\sqrt2$ times the speed of a circular orbit just above the surface.

**Binding energy.** The energy needed to take a body from rest at distance $r$ to infinity is $\dfrac{GMm}{r}$.

### [L-fad163e7] derivation (advanced)

**Potential energy.** Move a mass $m$ in slowly from infinity to distance $r$ from $M$. Gravity pulls it inward with $F=\dfrac{GMm}{x^2}$ when it is at distance $x$, and the displacement is also inward, so gravity does positive work:
$W_g=\int_r^\infty\dfrac{GMm}{x^2}\,dx=GMm\left[-\dfrac1x\right]_r^\infty=\dfrac{GMm}{r}$.
Potential energy is defined as minus the work done by the force when the body moves from the reference point (infinity) to the point in question, so $U(r)=-W_g=-\dfrac{GMm}{r}$ with $U(\infty)=0$.

**Escape velocity.** Launch from the surface with speed $v_e$ and require that the speed just reaches $0$ at infinity. Energy conservation:
$\tfrac12mv_e^2-\dfrac{GMm}{R}=0+0\Rightarrow v_e=\sqrt{\dfrac{2GM}{R}}$.
Using $GM=gR^2$: $v_e=\sqrt{2gR}$. With $g=9.8$ and $R=6.4\times10^6$ m: $v_e=\sqrt{1.254\times10^8}=1.12\times10^4$ m/s.

**Link to $mgh$.** $U(R+h)-U(R)=GMm\left(\dfrac1R-\dfrac1{R+h}\right)=\dfrac{GMm\,h}{R(R+h)}\approx\dfrac{GMm\,h}{R^2}=mgh$ for $h\ll R$.

### [L-e7c3c3d9] example (foundation)

**Example 1.** Find the escape velocity from Earth using $g=9.8$ m s⁻² and $R=6.4\times10^6$ m.
$v_e=\sqrt{2gR}=\sqrt{2\times9.8\times6.4\times10^6}=\sqrt{1.2544\times10^8}=1.12\times10^4$ m s⁻¹ $=11.2$ km s⁻¹.

### [L-a5f73572] example (main)

**Example 2 (another planet).** A planet has $\tfrac1{10}$ of Earth's mass and $\tfrac12$ of Earth's radius. Find its escape velocity in terms of Earth's.
$v_e\propto\sqrt{M/R}$, so the ratio is $\sqrt{\dfrac{1/10}{1/2}}=\sqrt{0.2}=0.447$. The escape velocity is about $0.447\times11.2=5.0$ km s⁻¹.

**Example 3 (energy to lift).** How much energy is needed to raise a $1$ kg mass from Earth's surface to a height $R$?
$\Delta U=GMm\left(\dfrac1R-\dfrac1{2R}\right)=\dfrac{GMm}{2R}=\dfrac{mgR}2=\dfrac{1\times9.8\times6.4\times10^6}2=3.1\times10^7$ J.
*Trap.* Using $mgh=mgR$ would give twice the correct value, because $g$ is not constant over such a height.

### [L-517eef70] example (advanced)

**Example 4 (speed at a distance).** A body is projected from the surface with speed $v=\dfrac{v_e}{2}$. Find the maximum height above the surface.
At the top the speed is zero. Energy: $\tfrac12mv^2-\dfrac{GMm}R=-\dfrac{GMm}{R+h}$. With $v^2=\dfrac{v_e^2}4=\dfrac{GM}{2R}$:
$\dfrac{GMm}{4R}-\dfrac{GMm}R=-\dfrac{GMm}{R+h}\Rightarrow-\dfrac34\cdot\dfrac1R=-\dfrac1{R+h}\Rightarrow R+h=\dfrac{4R}3\Rightarrow h=\dfrac R3$.

**Example 5 (speed at infinity).** A body leaves the surface with $v=2v_e$. Find its speed when far away (at infinity).
$\tfrac12mv_\infty^2=\tfrac12m(2v_e)^2-\dfrac{GMm}R=2mv_e^2-\tfrac12mv_e^2$ (since $\dfrac{GM}R=\tfrac12v_e^2$) $=\tfrac32mv_e^2$. So $v_\infty=\sqrt3\,v_e$.

### [L-3d1961ac] common mistakes (main)

1. Using $mgh$ for large heights.
2. Giving $U$ a positive sign: gravitational potential energy of an attractive pair is negative.
3. Thinking escape velocity depends on the mass of the projectile.
4. Mixing up escape velocity ($\sqrt{2gR}$) and orbital velocity near the surface ($\sqrt{gR}$).
5. Taking the height above the surface as the distance in $U=-GMm/r$; $r$ is measured from the centre.

### [L-1c9e6616] tips (main)

- Energy conservation between two positions is almost always the fastest route; avoid kinematics for variable-force motion.
- Replace $GM$ by $gR^2$ and $\dfrac{GM}{R}$ by $gR$ to simplify.
- If a question mentions "just escapes", set total energy $=0$; "bound" means total energy $<0$.

### [L-e7fac483] summary (main)

$U=-\dfrac{GMm}r$ (zero at infinity), $V=-\dfrac{GM}r$. Escape velocity $v_e=\sqrt{2GM/R}=\sqrt{2gR}\approx11.2$ km/s; independent of mass and direction; $v_e=\sqrt2\,v_o$. Total energy zero at escape; binding energy $=GMm/r$. $mgh$ is the small-height limit.

### [L-c847f6d8] mini assessment (main)

**Check yourself.**
1. Is the potential energy of a mass in Earth's field positive or negative? Why?
2. By what factor must the escape velocity change if Earth's radius doubles at constant mass?
3. What happens to the escape velocity of a body if its mass is doubled?

**Answers.** 1. Negative, because gravity is attractive and $U=0$ is chosen at infinity. 2. It becomes $\tfrac1{\sqrt2}$ of the original. 3. Nothing; it is independent of the body's mass.

### [F-5f5be600] Formula: Escape velocity

$$v_e = \sqrt{\dfrac{2GM}{R}} = \sqrt{2gR}$$

Variables: v_e: escape speed from the surface (m s⁻¹); G: universal gravitational constant (N m² kg⁻²); M: mass of the planet (kg); R: radius of the planet (m); g: surface value of g (m s⁻²)
Conditions: Ignores air resistance, rotation and other bodies; independent of the projectile’s mass
Units: m s⁻¹
Note: ≈ 11.2 km/s for Earth

### [F-ea9ecce9] Formula: Gravitational potential energy

$$U = -\dfrac{G M m}{r}$$

Variables: U: gravitational potential energy of the pair (J); G: universal gravitational constant (N m² kg⁻²); M: the large mass (kg); m: the test mass (kg); r: distance between the centres (m)
Conditions: Zero at infinity; r ≥ R for a sphere
Units: J

### [V-a46ec74d] Video: 3 Gravitation potential | Escape velocity | Kepler's law |Gravitation class 11|JEE Mains & Advanced

Channel: Mohit Tyagi  
Link: https://www.youtube.com/watch?v=Q6GDswAsY6o  
Purpose: classroom, level main
Why recommended: Covers potential, escape velocity and Kepler’s laws at JEE Main and Advanced level.

*Watch before deciding. Check: link works, title/channel match, covers the topic, suitable for the level, teaching quality.*

## Satellites and Kepler's laws

### [L-3c1c0172] introduction (main)

**Falling around the Earth.** Fire a cannonball horizontally from a very high mountain. At low speed it lands nearby. At higher speed it lands farther away. At about $7.9$ km/s the ground curves away beneath it as fast as it falls, and it never lands: it is in orbit. A satellite is a body in continuous free fall around a planet.

**Prerequisites.** Centripetal force; the law of gravitation; energy; the idea of period and angular speed.

### [L-33a523c6] explanation (main)

**Circular orbit of radius $r$ around mass $M$.** Gravity provides the centripetal force, so $\dfrac{GMm}{r^2}=\dfrac{mv^2}{r}$:
- Orbital speed $v=\sqrt{\dfrac{GM}{r}}$ (independent of the satellite's mass).
- Period $T=2\pi\sqrt{\dfrac{r^3}{GM}}$, so $T^2\propto r^3$.
- Close to the surface, $r\approx R$ and $v_o=\sqrt{gR}\approx7.9$ km/s, $T\approx84$ minutes.

**Energies in a circular orbit.**
$K=\dfrac{GMm}{2r}$, $U=-\dfrac{GMm}{r}$, $E=K+U=-\dfrac{GMm}{2r}$. So $K=-E$ and $U=2E$. The total energy is negative: the satellite is bound. To escape it needs extra energy $\dfrac{GMm}{2r}$.

**Weightlessness.** Inside an orbiting satellite everything falls with the same acceleration, so there is no contact force between you and the floor. Gravity has not vanished: at the altitude of the International Space Station, $g$ is still about $88\%$ of its surface value.

**Geostationary satellite.** Its period is one sidereal day ($\approx23$ h $56$ min), it orbits above the equator in the same direction as Earth's rotation, and it hovers over one point. Its orbital radius is about $4.22\times10^7$ m, i.e. a height of about $3.6\times10^7$ m ($36{,}000$ km) above the surface.

**Kepler's laws.**
1. **Orbits:** each planet moves in an ellipse with the Sun at one focus.
2. **Areas:** the line from the Sun to a planet sweeps equal areas in equal times (this is conservation of angular momentum).
3. **Periods:** $T^2\propto a^3$, where $a$ is the semi-major axis.

### [L-f9e4aa7a] derivation (advanced)

**Orbital speed and period.** Equate gravity to the centripetal requirement: $\dfrac{GMm}{r^2}=\dfrac{mv^2}r\Rightarrow v^2=\dfrac{GM}r$. The period is distance over speed: $T=\dfrac{2\pi r}v=2\pi r\sqrt{\dfrac r{GM}}=2\pi\sqrt{\dfrac{r^3}{GM}}$. Squaring: $T^2=\dfrac{4\pi^2}{GM}r^3$, which is Kepler's third law for circular orbits, with constant $\dfrac{4\pi^2}{GM}$.

**Energies.** $K=\tfrac12mv^2=\tfrac12\cdot\dfrac{GMm}r=\dfrac{GMm}{2r}$. Adding $U=-\dfrac{GMm}r$ gives $E=-\dfrac{GMm}{2r}$.

**Kepler's second law from angular momentum.** Gravity is a central force, so the torque about the Sun is zero and angular momentum $L=mr^2\dot\theta$ is constant. The area swept per unit time is $\dfrac{dA}{dt}=\tfrac12r^2\dot\theta=\dfrac L{2m}$, a constant.

**Why decaying orbits speed up.** Drag removes energy, so $E=-\dfrac{GMm}{2r}$ becomes more negative, which requires smaller $r$. But $v=\sqrt{GM/r}$ increases as $r$ decreases. So a satellite losing energy to drag moves to a lower orbit and goes faster.

### [L-701c7527] example (foundation)

**Example 1.** Find the orbital speed of a satellite just above Earth's surface. $v_o=\sqrt{gR}=\sqrt{9.8\times6.4\times10^6}=7.9\times10^3$ m s⁻¹.

### [L-53697119] example (main)

**Example 2 (Kepler's third law).** Planet A orbits a star at a distance $r$ and has period $T$. Planet B orbits at distance $4r$. Find its period.
$T^2\propto r^3\Rightarrow\dfrac{T_B}{T_A}=\left(\dfrac{4r}{r}\right)^{3/2}=4^{3/2}=8$. So $T_B=8T$.

**Example 3 (energy of a satellite).** A $500$ kg satellite orbits at $r=7.0\times10^6$ m from Earth's centre. Find its total energy. Use $GM=3.986\times10^{14}\ \mathrm{m^3s^{-2}}$.
$E=-\dfrac{GMm}{2r}=-\dfrac{3.986\times10^{14}\times500}{2\times7.0\times10^6}=-1.42\times10^{10}$ J.

### [L-b15637d1] example (advanced)

**Example 4 (changing orbits).** A satellite in a circular orbit has speed $v$. By what factor must its speed be increased (suddenly, tangentially) so that it just escapes?
Escape speed from radius $r$ is $\sqrt{\dfrac{2GM}r}=\sqrt2\,v$. So the speed must be multiplied by $\sqrt2\approx1.41$.

**Example 5 (conceptual).** A satellite is moved to an orbit of twice the radius. How do its (a) orbital speed, (b) period, (c) kinetic energy, (d) total energy change?
(a) $v\propto r^{-1/2}$: $v'=\dfrac v{\sqrt2}$. (b) $T\propto r^{3/2}$: $T'=2\sqrt2\,T\approx2.83T$. (c) $K\propto\dfrac1r$: $K'=\dfrac K2$. (d) $E=-\dfrac{GMm}{2r}$ rises from $-\dfrac{GMm}{2r}$ to $-\dfrac{GMm}{4r}$, i.e. $E$ increases by $\dfrac{GMm}{4r}$ (less negative). The satellite has a larger total energy but a smaller kinetic energy.

### [L-0aff76d7] common mistakes (main)

1. Using the Earth's radius $R$ instead of the orbital radius $r=R+h$.
2. Believing satellites are weightless because there is no gravity. Gravity is what keeps them in orbit; weightlessness is free fall.
3. Writing $E=+\dfrac{GMm}{2r}$ or forgetting that $K=-E$.
4. Thinking a satellite at a higher orbit moves faster. It moves slower.
5. Saying the satellite's speed depends on its mass.
6. Using Kepler's third law with radius instead of semi-major axis for elliptical orbits.

### [L-fec14250] tips (main)

- Memorise the chain: $v\propto r^{-1/2}$, $T\propto r^{3/2}$, $K\propto r^{-1}$, $|E|\propto r^{-1}$.
- For close-to-surface orbits use $v=\sqrt{gR}$ and $T=2\pi\sqrt{R/g}$ to avoid $G$.
- To compare two satellites around the same body, form ratios; $GM$ cancels.

### [L-4bf6ef10] summary (main)

Circular orbit: $v=\sqrt{GM/r}$, $T=2\pi\sqrt{r^3/GM}$, $K=\frac{GMm}{2r}$, $U=-\frac{GMm}r$, $E=-\frac{GMm}{2r}$. Kepler: ellipses; equal areas (angular momentum); $T^2\propto a^3$. Near-surface: $v=\sqrt{gR}\approx7.9$ km/s, $T\approx84$ min. Geostationary: $r\approx4.22\times10^7$ m. Escape from orbit needs speed $\sqrt2\,v$.

### [L-9caab142] mini assessment (main)

**Check yourself.**
1. A satellite's orbital radius is doubled. What happens to its speed?
2. Why do astronauts float inside the space station?
3. Total energy of a satellite is $-4\times10^9$ J. What is its kinetic energy?

**Answers.** 1. It decreases by a factor of $\sqrt2$. 2. They and the station fall freely together, so there is no contact force; gravity still acts. 3. $K=-E=+4\times10^9$ J.

### [F-7e0624e5] Formula: Energies of a circular orbit

$$K = \dfrac{GMm}{2r},\quad U = -\dfrac{GMm}{r},\quad E = -\dfrac{GMm}{2r}$$

Variables: K: kinetic energy of the satellite (J); U: potential energy (zero at infinity) (J); E: total energy (J); m: mass of the satellite (kg); M: mass of the planet (kg); r: orbital radius (m)
Conditions: Circular orbit
Units: J
Note: K = −E and U = 2E

### [F-7baf0234] Formula: Orbital speed (circular orbit)

$$v = \sqrt{\dfrac{GM}{r}}$$

Variables: v: orbital speed (m s⁻¹); G: universal gravitational constant (N m² kg⁻²); M: mass of the planet (kg); r: orbital radius, measured from the centre of the planet (m)
Conditions: Circular orbit
Units: m s⁻¹
Note: Near the surface: √(gR) ≈ 7.9 km/s

### [F-3534edec] Formula: Time period (circular orbit)

$$T = 2\pi\sqrt{\dfrac{r^{3}}{GM}}$$

Variables: T: period (s); r: orbital radius, measured from the centre of the planet (m); G: universal gravitational constant (N m² kg⁻²); M: mass of the planet (kg)
Conditions: Circular orbit; for ellipses use the semi-major axis a in place of r
Units: s
Note: Squaring gives Kepler’s third law: T² ∝ r³

### [V-22dc879c] Video: Gravitation JEE L3 [Satellites & Kepler's laws] JEE 2023 (11th Physics) | Shreyas Sir | Vedantu

Channel: Vedantu JEE English  
Link: https://www.youtube.com/watch?v=7brE-xK33Q0  
Purpose: examples, level main
Why recommended: Lecture 3 of a series on satellites and Kepler’s laws; use it for problem practice after the lesson here.

*Watch before deciding. Check: link works, title/channel match, covers the topic, suitable for the level, teaching quality.*

### [V-2e57b7ab] Video: Gravitation and Kepler's Laws of Planetary Motion (AP Physics C)

Channel: Physics Done Phast  
Link: https://www.youtube.com/watch?v=R995rOk92aE  
Purpose: concept, level advanced
Why recommended: An English concept video on Kepler’s laws at AP Physics C level (calculus-based). Useful for the derivations; the exam format differs from JEE.

*Watch before deciding. Check: link works, title/channel match, covers the topic, suitable for the level, teaching quality.*

### [V-406b72ec] Video: Gravitation | Kepler's Law, Satellite Motion & Escape Velocity | Class 11 | JEE Main 2022

Channel: Vedantu JEE  
Link: https://www.youtube.com/watch?v=kjmSi9i8QYo  
Purpose: classroom, level main
Why recommended: A lesson on Kepler’s laws, satellite motion and escape velocity; matches topics 3 and 4.

*Watch before deciding. Check: link works, title/channel match, covers the topic, suitable for the level, teaching quality.*
