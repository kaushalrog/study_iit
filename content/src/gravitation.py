from math import sqrt, pi
from lib import Chapter, approx

G = 6.674e-11
ME = 5.972e24
RE = 6.371e6
g0 = G * ME / RE**2

c = Chapter('Gravitation')
T1 = c.topic("Newton's law of gravitation and the gravitational field")
T2 = c.topic('Acceleration due to gravity and its variation')
T3 = c.topic('Gravitational potential energy and escape velocity')
T4 = c.topic("Satellites and Kepler's laws")

# ---------- overview ----------
c.lesson(None, 'introduction', 'foundation', r"""
**The one idea.** Every piece of matter pulls on every other piece of matter. The pull between everyday objects is far too weak to notice, but between a planet and anything near it, it dominates. Gravitation explains why things fall, why the Moon orbits the Earth, why planets orbit the Sun, and why a rocket needs a very large speed to leave Earth.

**Prerequisites.** (1) Newton's laws of motion and the meaning of force as $F=ma$. (2) Circular motion and centripetal acceleration $a=v^2/r$. (3) Work, kinetic energy and the work-energy theorem, and the idea of potential energy. (4) Basic algebra with powers and square roots. If circular motion or energy conservation feels uncertain, revise them first because satellites and escape velocity use both.

**What you will be able to do.** Calculate the gravitational force and field from point masses and spheres; find how $g$ changes with height and depth; use energy to get escape velocity; and work out orbital speed, period and energy of a satellite.
""")
c.lesson(None, 'why_it_matters', 'main', r"""
Gravitation is one of the most predictable chapters in JEE mechanics: almost every question reduces to Newton's law of gravitation, energy conservation, or circular-orbit equations. The same few expressions are combined in different ways, so a student who understands where $v_{orbit}=\sqrt{GM/r}$ and $v_{escape}=\sqrt{2GM/R}$ come from can rebuild any variant instead of memorising each one. Gravitation also trains habits needed in later chapters: choosing a reference for potential energy, using ratios to avoid numbers, and checking dimensions.

**Syllabus note.** The official JEE syllabus lists universal law of gravitation, acceleration due to gravity and its variation with altitude and depth, Kepler's laws, gravitational potential energy and potential, escape velocity, and orbital velocity of a satellite. The four-topic grouping is ORBIT's provisional crosswalk, not the confirmed Chaitanya IPL scheme.
""")

# ---------- Topic 1 ----------
c.lesson(T1, 'introduction', 'foundation', r"""
**Why does an apple fall but the Moon does not?** Newton's insight was that the same force acts in both cases. The apple falls straight down; the Moon also falls toward Earth, but it moves sideways so fast that it keeps missing the Earth. The force law that covers both is the **universal law of gravitation**.
""")
c.lesson(T1, 'explanation', 'foundation', r"""
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

**Why $G$ is tiny.** For two 1 kg masses 1 m apart, $F=6.67\times10^{-11}$ N, about the weight of a few bacteria. Gravity matters only when at least one mass is astronomical.
""")
c.lesson(T1, 'derivation', 'main', r"""
**Where the inverse-square law comes from (conceptually).** Imagine the pull of a mass spreading out equally in all directions, like light from a bulb. At distance $r$ it is spread over a sphere of area $4\pi r^2$. If the total "amount of pull" is conserved, its strength per unit area falls as $1/r^2$. Newton also showed it fits Kepler's observations: for circular orbits $T^2\propto r^3$ requires the force to fall as $1/r^2$.

**Check with the Moon.** The Moon is about $60R$ from Earth's centre. If gravity falls as $1/r^2$, the Moon's acceleration should be $g/3600\approx2.7\times10^{-3}\ \mathrm{m\,s^{-2}}$. Its centripetal acceleration from its period (27.3 days) and distance ($3.84\times10^8$ m) is $\dfrac{4\pi^2r}{T^2}\approx2.7\times10^{-3}\ \mathrm{m\,s^{-2}}$. The numbers match, which is how Newton confirmed the law.

**Field of a uniform shell (idea).** Add up the forces from all small patches of a thin shell on a test mass inside it. The nearer patches pull harder but there are fewer of them, since the area scales as $r^2$ while the force scales as $1/r^2$; the pulls from opposite sides cancel exactly for every position inside. Hence $g=0$ inside a uniform thin shell.
""")
c.lesson(T1, 'example', 'foundation', r"""
**Example 1.** Two masses of $10$ kg and $10$ kg are $0.1$ m apart. Find the attractive force.
$F=\dfrac{G m_1m_2}{r^2}=\dfrac{6.67\times10^{-11}\times10\times10}{(0.1)^2}=6.67\times10^{-7}$ N.
This is far below anything we can feel, which is why we do not notice attraction between everyday objects.
""")
c.lesson(T1, 'example', 'main', r"""
**Example 2 (a point of zero field).** Masses $M$ and $4M$ are $3$ m apart. Find where, on the line between them, the net gravitational field is zero.
Let the point be $x$ from $M$ (so $3-x$ from $4M$). The fields point toward their own masses, in opposite directions, so they cancel when
$\dfrac{GM}{x^2}=\dfrac{G\cdot4M}{(3-x)^2}\Rightarrow(3-x)^2=4x^2\Rightarrow3-x=2x\Rightarrow x=1$ m.
(We took the positive root because the point lies between the masses.) The point is $1$ m from $M$.
""")
c.lesson(T1, 'example', 'advanced', r"""
**Example 3 (force scaling).** The distance between two masses is increased from $r$ to $3r$ and one of the masses is doubled. By what factor does the force change?
$F\propto\dfrac{m_1m_2}{r^2}$. New force $=\dfrac{2}{(3)^2}=\dfrac29$ of the old force.

**Example 4 (ring of masses, symmetry).** Four equal masses $m$ sit at the corners of a square of side $a$. Find the net force on one of them.
Let the mass be at one corner. The two adjacent masses (distance $a$) each give $\dfrac{Gm^2}{a^2}$ along the sides, at right angles. The diagonal mass (distance $a\sqrt2$) gives $\dfrac{Gm^2}{2a^2}$ along the diagonal. Resolve along the diagonal toward the centre: each side force contributes $\dfrac{Gm^2}{a^2}\cos45^\circ=\dfrac{Gm^2}{a^2\sqrt2}$, so two of them give $\dfrac{\sqrt2\,Gm^2}{a^2}$. Total $=\dfrac{Gm^2}{a^2}\left(\sqrt2+\dfrac12\right)$, directed toward the centre of the square.
""")
c.lesson(T1, 'common_mistakes', 'foundation', r"""
1. Using the distance between **surfaces** instead of **centres** for spheres. For a body at height $h$ above Earth, $r=R+h$.
2. Treating the field as a scalar and adding magnitudes. Fields are vectors; draw directions first.
3. Thinking the heavier body pulls harder on the lighter one than vice versa. The forces are equal in magnitude.
4. Confusing $G$ (universal constant) with $g$ (local acceleration).
5. Using $g=GM/r^2$ inside a shell, where the field is zero.
""")
c.lesson(T1, 'tips', 'main', r"""
- Prefer ratios: when a question changes masses or distances, write $F\propto\dfrac{m_1m_2}{r^2}$ and compute the factor, avoiding $G$ altogether.
- For zero-field points between two masses, equate the two magnitudes and take the root that lies between them. Outside the pair, the fields point the same way, so the field cannot vanish there when both masses attract.
- For symmetric arrangements, find the net force by components along a symmetry axis.
""")
c.lesson(T1, 'summary', 'foundation', r"""
$F=\dfrac{Gm_1m_2}{r^2}$; always attractive; equal and opposite on the two bodies. Field $g=\dfrac{GM}{r^2}$ toward the mass; fields add as vectors. Sphere/shell acts as a point at its centre for outside points; zero field inside a thin shell. $G=6.67\times10^{-11}$ N m² kg⁻².
""")
c.lesson(T1, 'mini_assessment', 'foundation', r"""
**Check yourself.**
1. If the distance between two masses is doubled, by what factor does the force change?
2. Does the Earth pull on you harder than you pull on the Earth?
3. What is the gravitational field inside a hollow uniform shell?

**Answers.** 1. Becomes $\tfrac14$. 2. No: the forces are equal and opposite (the Earth barely accelerates because its mass is huge). 3. Zero.
""")
assert approx(G * 10 * 10 / 0.1**2, 6.674e-7)
assert abs(1 - 2) == 1 and approx(3 - 1, 2 * 1)       # (3-x)=2x with x=1
x = 1.0
assert approx(G * 1 / x**2, G * 4 / (3 - x)**2)
assert approx(2 / 9, 2 / 3**2)
sq = (2 * (1 / sqrt(2)) + 0.5)
assert approx(sq, sqrt(2) + 0.5)
rm, Tm = 3.84e8, 27.3 * 86400
assert abs(4 * pi**2 * rm / Tm**2 - g0 / 3600) / (g0 / 3600) < 0.1

# ---------- Topic 2 ----------
c.lesson(T2, 'introduction', 'main', r"""
**Earth's pull is not the same everywhere.** The value $g=9.8\ \mathrm{m\,s^{-2}}$ is the field at Earth's surface. It changes as you go up a mountain, down a mine, or toward the equator. JEE asks for the size of these changes, usually as fractions of $g$.

**Prerequisites.** The law of gravitation and field of a sphere; the binomial approximation $(1+x)^n\approx1+nx$ for small $x$; the idea of density for a uniform sphere.
""")
c.lesson(T2, 'explanation', 'main', r"""
**At the surface.** $g=\dfrac{GM}{R^2}$ where $M$ is Earth's mass and $R$ its radius. This also shows that $GM=gR^2$, a relation used constantly.

**At height $h$ above the surface.** The distance from the centre is $R+h$:
$$g_h=\frac{GM}{(R+h)^2}=g\left(\frac{R}{R+h}\right)^2.$$
For $h\ll R$: $g_h\approx g\left(1-\dfrac{2h}{R}\right)$.

**At depth $d$ below the surface (uniform-density Earth).** Only the mass inside the radius $R-d$ attracts you (the outer shell contributes zero):
$$g_d=g\left(1-\frac dR\right).$$
So $g$ decreases linearly to zero at the centre.

**Effect of rotation.** At latitude $\lambda$ the apparent $g$ is $g'=g-\omega^2R\cos^2\lambda$. At the poles ($\lambda=90^\circ$) there is no correction; at the equator the correction is largest, $\omega^2R\approx0.034\ \mathrm{m\,s^{-2}}$ (about $0.35\%$ of $g$). Also Earth is slightly flattened, so $g$ is slightly larger at the poles for that reason too.

**Graph.** $g$ inside rises linearly from $0$ at the centre to its maximum at the surface, then falls as $1/r^2$ outside.
""")
c.lesson(T2, 'derivation', 'main', r"""
**Depth formula.** Assume uniform density $\rho$. At radius $r<R$ only the sphere of radius $r$ attracts (the shell outside gives no net field), with mass $M_r=\tfrac43\pi r^3\rho$. So
$g_r=\dfrac{GM_r}{r^2}=\dfrac{G\cdot\tfrac43\pi r^3\rho}{r^2}=\tfrac43\pi G\rho\,r$.
At the surface $g=\tfrac43\pi G\rho R$, so $g_r=g\,\dfrac rR$. With $r=R-d$: $g_d=g\left(1-\dfrac dR\right)$.

**Small-height approximation.** $g_h=g(1+h/R)^{-2}$. For $h/R\ll1$ the binomial approximation gives $g(1-2h/R)$. The approximation is good when $h/R$ is below about $0.05$; for larger $h$ use the exact formula.

**Rotation correction.** A person at latitude $\lambda$ moves in a circle of radius $R\cos\lambda$ with angular speed $\omega$. The centripetal acceleration needed is $\omega^2R\cos\lambda$, directed toward the axis. Its component along the line to Earth's centre is $\omega^2R\cos^2\lambda$, which reduces the apparent weight: $g'=g-\omega^2R\cos^2\lambda$.
""")
c.lesson(T2, 'example', 'foundation', r"""
**Example 1.** At what height above the surface is $g$ one quarter of its surface value?
$g_h=\dfrac g4\Rightarrow\left(\dfrac R{R+h}\right)^2=\dfrac14\Rightarrow R+h=2R\Rightarrow h=R$.
""")
c.lesson(T2, 'example', 'main', r"""
**Example 2.** At what depth is $g$ half of its surface value?
$g_d=g\left(1-\dfrac dR\right)=\dfrac g2\Rightarrow d=\dfrac R2$.

**Example 3 (when the approximation is allowed).** By what fraction does $g$ decrease at $h=\dfrac R{200}$?
Using $g_h\approx g(1-2h/R)$: decrease $=\dfrac{2h}R=\dfrac{2}{200}=1\%$.
*Exact check:* $\left(\dfrac{200}{201}\right)^2=0.99007$, so the decrease is $0.993\%$, which rounds to $1\%$. The approximation is excellent here.
""")
c.lesson(T2, 'example', 'advanced', r"""
**Example 4 (same $g$ up and down).** Find $h$ (above the surface) and $d$ (below it) such that $g$ has the same value at both places, assuming $h\ll R$.
$g\left(1-\dfrac{2h}R\right)=g\left(1-\dfrac dR\right)\Rightarrow d=2h$.

**Example 5 (rotation).** What angular speed must Earth have for objects at the equator to be weightless?
At the equator $g'=g-\omega^2R=0\Rightarrow\omega=\sqrt{g/R}\approx\sqrt{9.8/6.4\times10^6}=1.24\times10^{-3}\ \mathrm{rad\,s^{-1}}$, about $17$ times Earth's actual angular speed ($7.3\times10^{-5}$). The day would last about $84$ minutes.
""")
c.lesson(T2, 'common_mistakes', 'main', r"""
1. Using $g(1-h/R)$ for height (that is the **depth** formula). Height gives $1-2h/R$.
2. Using $h$ instead of $R+h$ in the exact formula.
3. Applying the binomial approximation for $h$ comparable to $R$.
4. Assuming $g$ is zero at the centre only in a hollow Earth; for a solid uniform Earth it is zero at the centre because the enclosed mass shrinks to zero.
5. Forgetting that the depth formula assumes uniform density; the real Earth's core is denser, so real $g$ first rises slightly below the surface.
""")
c.lesson(T2, 'tips', 'main', r"""
- Write $GM=gR^2$ and replace $GM$ by it whenever $g$ and $R$ are given.
- Height: $1-2h/R$; depth: $1-d/R$. Remember "twice as sensitive going up".
- For a ratio like $g_h/g_d$, divide the two expressions rather than computing each separately.
""")
c.lesson(T2, 'summary', 'main', r"""
$g=\dfrac{GM}{R^2}$, $GM=gR^2$. Height: $g_h=g\left(\dfrac R{R+h}\right)^2\approx g(1-\tfrac{2h}R)$. Depth: $g_d=g(1-\tfrac dR)$. Latitude: $g'=g-\omega^2R\cos^2\lambda$. Zero at the centre, maximum at the surface, $1/r^2$ outside.
""")
c.lesson(T2, 'mini_assessment', 'main', r"""
**Check yourself.**
1. Find $g$ at height $R$ above the surface in terms of $g$.
2. Find the depth at which $g$ is $75\%$ of the surface value.
3. What is the apparent weight change at the equator due to rotation, as a fraction of $g$ (roughly)?

**Answers.** 1. $g/4$. 2. $d=\dfrac R4$. 3. About $0.35\%$ less.
""")
assert approx(g0 / 4, g0 * (RE / (RE + RE))**2)
assert approx(1 - 0.5, 0.5)
h = RE / 200
assert abs((RE / (RE + h))**2 - 0.99) < 0.001 and abs(2 * h / RE - 0.01) < 1e-12
w_eq = sqrt(9.8 / 6.4e6)
assert abs(w_eq - 1.237e-3) < 1e-5 and abs(w_eq / 7.292e-5 - 17) < 0.5
assert abs(2 * pi / w_eq / 60 - 84.4) < 1
assert abs(7.292e-5**2 * RE / g0 - 0.0035) < 0.0002

# ---------- Topic 3 ----------
c.lesson(T3, 'introduction', 'main', r"""
**Energy is a better tool than force here.** The pull of gravity changes with distance, so using $W=Fd$ directly is awkward. Gravity is a **conservative** force: the work it does depends only on the start and end points. That lets us define a potential energy and solve "how fast to leave Earth" with energy conservation instead of integrating motion.

**Prerequisites.** Work done by a variable force (area under an $F$–$r$ graph, or a simple integral); conservation of mechanical energy; the law of gravitation. Where an integral appears we show every step.
""")
c.lesson(T3, 'explanation', 'main', r"""
**Reference.** Gravitational potential energy is measured from infinity, where it is defined to be zero. Because gravity is attractive, energy is **negative** at any finite distance:
$$U(r)=-\frac{GMm}{r}.$$
The **gravitational potential** at a point is the potential energy per unit mass: $V=-\dfrac{GM}{r}$ (units J kg⁻¹).

**Near the surface** the change in potential energy for a small rise $h$ is $mgh$. The familiar $mgh$ is the difference of two values of $-\dfrac{GMm}{r}$, not a different law.

**Escape velocity.** The minimum speed that lets a body leave Earth's gravity and never return (ignoring air and other bodies):
$$v_e=\sqrt{\frac{2GM}{R}}=\sqrt{2gR}\approx11.2\ \mathrm{km\,s^{-1}}.$$
It does not depend on the mass of the body or the direction of launch (if it does not hit anything), and it equals $\sqrt2$ times the speed of a circular orbit just above the surface.

**Binding energy.** The energy needed to take a body from rest at distance $r$ to infinity is $\dfrac{GMm}{r}$.
""")
c.lesson(T3, 'derivation', 'advanced', r"""
**Potential energy.** Move a mass $m$ in slowly from infinity to distance $r$ from $M$. Gravity pulls it inward with $F=\dfrac{GMm}{x^2}$ when it is at distance $x$, and the displacement is also inward, so gravity does positive work:
$W_g=\int_r^\infty\dfrac{GMm}{x^2}\,dx=GMm\left[-\dfrac1x\right]_r^\infty=\dfrac{GMm}{r}$.
Potential energy is defined as minus the work done by the force when the body moves from the reference point (infinity) to the point in question, so $U(r)=-W_g=-\dfrac{GMm}{r}$ with $U(\infty)=0$.

**Escape velocity.** Launch from the surface with speed $v_e$ and require that the speed just reaches $0$ at infinity. Energy conservation:
$\tfrac12mv_e^2-\dfrac{GMm}{R}=0+0\Rightarrow v_e=\sqrt{\dfrac{2GM}{R}}$.
Using $GM=gR^2$: $v_e=\sqrt{2gR}$. With $g=9.8$ and $R=6.4\times10^6$ m: $v_e=\sqrt{1.254\times10^8}=1.12\times10^4$ m/s.

**Link to $mgh$.** $U(R+h)-U(R)=GMm\left(\dfrac1R-\dfrac1{R+h}\right)=\dfrac{GMm\,h}{R(R+h)}\approx\dfrac{GMm\,h}{R^2}=mgh$ for $h\ll R$.
""")
c.lesson(T3, 'example', 'foundation', r"""
**Example 1.** Find the escape velocity from Earth using $g=9.8$ m s⁻² and $R=6.4\times10^6$ m.
$v_e=\sqrt{2gR}=\sqrt{2\times9.8\times6.4\times10^6}=\sqrt{1.2544\times10^8}=1.12\times10^4$ m s⁻¹ $=11.2$ km s⁻¹.
""")
c.lesson(T3, 'example', 'main', r"""
**Example 2 (another planet).** A planet has $\tfrac1{10}$ of Earth's mass and $\tfrac12$ of Earth's radius. Find its escape velocity in terms of Earth's.
$v_e\propto\sqrt{M/R}$, so the ratio is $\sqrt{\dfrac{1/10}{1/2}}=\sqrt{0.2}=0.447$. The escape velocity is about $0.447\times11.2=5.0$ km s⁻¹.

**Example 3 (energy to lift).** How much energy is needed to raise a $1$ kg mass from Earth's surface to a height $R$?
$\Delta U=GMm\left(\dfrac1R-\dfrac1{2R}\right)=\dfrac{GMm}{2R}=\dfrac{mgR}2=\dfrac{1\times9.8\times6.4\times10^6}2=3.1\times10^7$ J.
*Trap.* Using $mgh=mgR$ would give twice the correct value, because $g$ is not constant over such a height.
""")
c.lesson(T3, 'example', 'advanced', r"""
**Example 4 (speed at a distance).** A body is projected from the surface with speed $v=\dfrac{v_e}{2}$. Find the maximum height above the surface.
At the top the speed is zero. Energy: $\tfrac12mv^2-\dfrac{GMm}R=-\dfrac{GMm}{R+h}$. With $v^2=\dfrac{v_e^2}4=\dfrac{GM}{2R}$:
$\dfrac{GMm}{4R}-\dfrac{GMm}R=-\dfrac{GMm}{R+h}\Rightarrow-\dfrac34\cdot\dfrac1R=-\dfrac1{R+h}\Rightarrow R+h=\dfrac{4R}3\Rightarrow h=\dfrac R3$.

**Example 5 (speed at infinity).** A body leaves the surface with $v=2v_e$. Find its speed when far away (at infinity).
$\tfrac12mv_\infty^2=\tfrac12m(2v_e)^2-\dfrac{GMm}R=2mv_e^2-\tfrac12mv_e^2$ (since $\dfrac{GM}R=\tfrac12v_e^2$) $=\tfrac32mv_e^2$. So $v_\infty=\sqrt3\,v_e$.
""")
c.lesson(T3, 'common_mistakes', 'main', r"""
1. Using $mgh$ for large heights.
2. Giving $U$ a positive sign: gravitational potential energy of an attractive pair is negative.
3. Thinking escape velocity depends on the mass of the projectile.
4. Mixing up escape velocity ($\sqrt{2gR}$) and orbital velocity near the surface ($\sqrt{gR}$).
5. Taking the height above the surface as the distance in $U=-GMm/r$; $r$ is measured from the centre.
""")
c.lesson(T3, 'tips', 'main', r"""
- Energy conservation between two positions is almost always the fastest route; avoid kinematics for variable-force motion.
- Replace $GM$ by $gR^2$ and $\dfrac{GM}{R}$ by $gR$ to simplify.
- If a question mentions "just escapes", set total energy $=0$; "bound" means total energy $<0$.
""")
c.lesson(T3, 'summary', 'main', r"""
$U=-\dfrac{GMm}r$ (zero at infinity), $V=-\dfrac{GM}r$. Escape velocity $v_e=\sqrt{2GM/R}=\sqrt{2gR}\approx11.2$ km/s; independent of mass and direction; $v_e=\sqrt2\,v_o$. Total energy zero at escape; binding energy $=GMm/r$. $mgh$ is the small-height limit.
""")
c.lesson(T3, 'mini_assessment', 'main', r"""
**Check yourself.**
1. Is the potential energy of a mass in Earth's field positive or negative? Why?
2. By what factor must the escape velocity change if Earth's radius doubles at constant mass?
3. What happens to the escape velocity of a body if its mass is doubled?

**Answers.** 1. Negative, because gravity is attractive and $U=0$ is chosen at infinity. 2. It becomes $\tfrac1{\sqrt2}$ of the original. 3. Nothing; it is independent of the body's mass.
""")
ve = sqrt(2 * 9.8 * 6.4e6)
assert abs(ve - 11200) < 20
assert approx(sqrt(0.1 / 0.5), sqrt(0.2)) and abs(sqrt(0.2) * 11.2 - 5.0) < 0.01
assert abs(9.8 * 6.4e6 / 2 - 3.136e7) < 1e4
vv = 0.5
# h = R/3 from energy conservation, in units GM = R = 1: v^2 = ve^2/4 = 1/2
R_ = 1.0; GM = 1.0; ve2 = 2 * GM / R_; v2 = ve2 / 4
Rh = 1 / (GM / R_ - 0.5 * v2) * GM / 1.0  # R + h from 0.5 v^2 - GM/R = -GM/(R+h)
assert approx(Rh, 4 / 3)
assert approx(sqrt(2 * (0.5 * (2 * sqrt(ve2))**2 - GM / R_)) / sqrt(ve2), sqrt(3))
assert approx(sqrt(2 * G * ME / RE), sqrt(2) * sqrt(G * ME / RE))
assert round(6400 * (1 / sqrt(0.99) - 1)) == 32

# ---------- Topic 4 ----------
c.lesson(T4, 'introduction', 'main', r"""
**Falling around the Earth.** Fire a cannonball horizontally from a very high mountain. At low speed it lands nearby. At higher speed it lands farther away. At about $7.9$ km/s the ground curves away beneath it as fast as it falls, and it never lands: it is in orbit. A satellite is a body in continuous free fall around a planet.

**Prerequisites.** Centripetal force; the law of gravitation; energy; the idea of period and angular speed.
""")
c.lesson(T4, 'explanation', 'main', r"""
**Circular orbit of radius $r$ around mass $M$.** Gravity provides the centripetal force, so $\dfrac{GMm}{r^2}=\dfrac{mv^2}{r}$:
- Orbital speed $v=\sqrt{\dfrac{GM}{r}}$ (independent of the satellite's mass).
- Period $T=2\pi\sqrt{\dfrac{r^3}{GM}}$, so $T^2\propto r^3$.
- Close to the surface, $r\approx R$ and $v_o=\sqrt{gR}\approx7.9$ km/s, $T\approx84$ minutes.

**Energies in a circular orbit.**
$K=\dfrac{GMm}{2r}$, $U=-\dfrac{GMm}{r}$, $E=K+U=-\dfrac{GMm}{2r}$. So $K=-E$ and $U=2E$. The total energy is negative: the satellite is bound. To escape it needs extra energy $\dfrac{GMm}{2r}$.

**Weightlessness.** Inside an orbiting satellite everything falls with the same acceleration, so there is no contact force between you and the floor. Gravity has not vanished: at the altitude of the International Space Station, $g$ is still about $90\%$ of its surface value.

**Geostationary satellite.** Its period is one sidereal day ($\approx23$ h $56$ min), it orbits above the equator in the same direction as Earth's rotation, and it hovers over one point. Its orbital radius is about $4.22\times10^7$ m, i.e. a height of about $3.6\times10^7$ m ($36{,}000$ km) above the surface.

**Kepler's laws.**
1. **Orbits:** each planet moves in an ellipse with the Sun at one focus.
2. **Areas:** the line from the Sun to a planet sweeps equal areas in equal times (this is conservation of angular momentum).
3. **Periods:** $T^2\propto a^3$, where $a$ is the semi-major axis.
""")
c.lesson(T4, 'derivation', 'advanced', r"""
**Orbital speed and period.** Equate gravity to the centripetal requirement: $\dfrac{GMm}{r^2}=\dfrac{mv^2}r\Rightarrow v^2=\dfrac{GM}r$. The period is distance over speed: $T=\dfrac{2\pi r}v=2\pi r\sqrt{\dfrac r{GM}}=2\pi\sqrt{\dfrac{r^3}{GM}}$. Squaring: $T^2=\dfrac{4\pi^2}{GM}r^3$, which is Kepler's third law for circular orbits, with constant $\dfrac{4\pi^2}{GM}$.

**Energies.** $K=\tfrac12mv^2=\tfrac12\cdot\dfrac{GMm}r=\dfrac{GMm}{2r}$. Adding $U=-\dfrac{GMm}r$ gives $E=-\dfrac{GMm}{2r}$.

**Kepler's second law from angular momentum.** Gravity is a central force, so the torque about the Sun is zero and angular momentum $L=mr^2\dot\theta$ is constant. The area swept per unit time is $\dfrac{dA}{dt}=\tfrac12r^2\dot\theta=\dfrac L{2m}$, a constant.

**Why decaying orbits speed up.** Drag removes energy, so $E=-\dfrac{GMm}{2r}$ becomes more negative, which requires smaller $r$. But $v=\sqrt{GM/r}$ increases as $r$ decreases. So a satellite losing energy to drag moves to a lower orbit and goes faster.
""")
c.lesson(T4, 'example', 'foundation', r"""
**Example 1.** Find the orbital speed of a satellite just above Earth's surface. $v_o=\sqrt{gR}=\sqrt{9.8\times6.4\times10^6}=7.9\times10^3$ m s⁻¹.
""")
c.lesson(T4, 'example', 'main', r"""
**Example 2 (Kepler's third law).** Planet A orbits a star at a distance $r$ and has period $T$. Planet B orbits at distance $4r$. Find its period.
$T^2\propto r^3\Rightarrow\dfrac{T_B}{T_A}=\left(\dfrac{4r}{r}\right)^{3/2}=4^{3/2}=8$. So $T_B=8T$.

**Example 3 (energy of a satellite).** A $500$ kg satellite orbits at $r=7.0\times10^6$ m from Earth's centre. Find its total energy. Use $GM=3.986\times10^{14}\ \mathrm{m^3s^{-2}}$.
$E=-\dfrac{GMm}{2r}=-\dfrac{3.986\times10^{14}\times500}{2\times7.0\times10^6}=-1.42\times10^{10}$ J.
""")
c.lesson(T4, 'example', 'advanced', r"""
**Example 4 (changing orbits).** A satellite in a circular orbit has speed $v$. By what factor must its speed be increased (suddenly, tangentially) so that it just escapes?
Escape speed from radius $r$ is $\sqrt{\dfrac{2GM}r}=\sqrt2\,v$. So the speed must be multiplied by $\sqrt2\approx1.41$.

**Example 5 (conceptual).** A satellite is moved to an orbit of twice the radius. How do its (a) orbital speed, (b) period, (c) kinetic energy, (d) total energy change?
(a) $v\propto r^{-1/2}$: $v'=\dfrac v{\sqrt2}$. (b) $T\propto r^{3/2}$: $T'=2\sqrt2\,T\approx2.83T$. (c) $K\propto\dfrac1r$: $K'=\dfrac K2$. (d) $E=-\dfrac{GMm}{2r}$ rises from $-\dfrac{GMm}{2r}$ to $-\dfrac{GMm}{4r}$, i.e. $E$ increases by $\dfrac{GMm}{4r}$ (less negative). The satellite has a larger total energy but a smaller kinetic energy.
""")
c.lesson(T4, 'common_mistakes', 'main', r"""
1. Using the Earth's radius $R$ instead of the orbital radius $r=R+h$.
2. Believing satellites are weightless because there is no gravity. Gravity is what keeps them in orbit; weightlessness is free fall.
3. Writing $E=+\dfrac{GMm}{2r}$ or forgetting that $K=-E$.
4. Thinking a satellite at a higher orbit moves faster. It moves slower.
5. Saying the satellite's speed depends on its mass.
6. Using Kepler's third law with radius instead of semi-major axis for elliptical orbits.
""")
c.lesson(T4, 'tips', 'main', r"""
- Memorise the chain: $v\propto r^{-1/2}$, $T\propto r^{3/2}$, $K\propto r^{-1}$, $|E|\propto r^{-1}$.
- For close-to-surface orbits use $v=\sqrt{gR}$ and $T=2\pi\sqrt{R/g}$ to avoid $G$.
- To compare two satellites around the same body, form ratios; $GM$ cancels.
""")
c.lesson(T4, 'summary', 'main', r"""
Circular orbit: $v=\sqrt{GM/r}$, $T=2\pi\sqrt{r^3/GM}$, $K=\frac{GMm}{2r}$, $U=-\frac{GMm}r$, $E=-\frac{GMm}{2r}$. Kepler: ellipses; equal areas (angular momentum); $T^2\propto a^3$. Near-surface: $v=\sqrt{gR}\approx7.9$ km/s, $T\approx84$ min. Geostationary: $r\approx4.22\times10^7$ m. Escape from orbit needs speed $\sqrt2\,v$.
""")
c.lesson(T4, 'mini_assessment', 'main', r"""
**Check yourself.**
1. A satellite's orbital radius is doubled. What happens to its speed?
2. Why do astronauts float inside the space station?
3. Total energy of a satellite is $-4\times10^9$ J. What is its kinetic energy?

**Answers.** 1. It decreases by a factor of $\sqrt2$. 2. They and the station fall freely together, so there is no contact force; gravity still acts. 3. $K=-E=+4\times10^9$ J.
""")
assert abs(sqrt(9.8 * 6.4e6) - 7920) < 20
assert approx(4**1.5, 8)
GMe = 3.986e14
assert abs(-GMe * 500 / (2 * 7.0e6) - (-1.4236e10)) < 1e8
assert approx(sqrt(2), 2**0.5)
assert approx(1 / sqrt(2), 2**-0.5) and approx(2**1.5, 2 * sqrt(2))
Tsid = 86164
rgeo = (GMe * Tsid**2 / (4 * pi**2))**(1 / 3)
assert abs(rgeo - 4.2164e7) < 5e4 and abs((rgeo - 6.378e6) - 3.58e7) < 1e5
assert abs(2 * pi * sqrt(RE**3 / (G * ME)) / 60 - 84.4) < 0.5
iss = (RE / (RE + 4.2e5))**2
assert 0.87 < iss < 0.92
assert approx(-GMe * 1 / (2 * 1) * -1 * 2, GMe)  # K = -E

# ---------- Formulas ----------
c.formula(T1, "Newton's law of gravitation", r'F = \dfrac{G\,m_1 m_2}{r^{2}}', [('F', 'attractive force', 'N'), ('G', 'gravitational constant, 6.67 × 10⁻¹¹', 'N m² kg⁻²'), ('m₁, m₂', 'the two masses', 'kg'), ('r', 'distance between the centres', 'm')],
          'Point masses, or spheres with spherically symmetric mass distribution', 'Inverse-square; equal and opposite on the two bodies.', None, 'N')
c.formula(T1, 'Gravitational field of a point mass', r'g = \dfrac{G M}{r^{2}}', [('g', 'field (force per unit mass)', 'N kg⁻¹'), ('M', 'the source mass', 'kg'), ('r', 'distance from the centre', 'm')], 'r ≥ R for a sphere; zero inside a thin uniform shell')
c.formula(T2, 'Surface value of g', r'g = \dfrac{G M}{R^{2}}\ \Longrightarrow\ GM = gR^{2}', [('M', 'mass of the planet', 'kg'), ('R', 'radius of the planet', 'm')], None, 'Used to replace GM whenever g and R are given.')
c.formula(T2, 'g at height h', r'g_h = g\left(\dfrac{R}{R+h}\right)^{2} \approx g\left(1-\dfrac{2h}{R}\right)', [('h', 'height above the surface', 'm'), ('R', 'radius of the planet', 'm')], 'The approximate form needs h much smaller than R')
c.formula(T2, 'g at depth d', r'g_d = g\left(1-\dfrac{d}{R}\right)', [('d', 'depth below the surface', 'm')], 'Uniform-density planet')
c.formula(T2, 'Apparent g at latitude λ', r"g' = g - \omega^{2}R\cos^{2}\lambda", [('ω', 'angular speed of the planet', 'rad s⁻¹'), ('λ', 'latitude', None)], 'Spherical rotating Earth; correction is zero at the poles')
c.formula(T3, 'Gravitational potential energy', r'U = -\dfrac{G M m}{r}', [('U', 'potential energy', 'J'), ('m', 'the test mass', 'kg')], 'Zero at infinity; r measured from the centre of M')
c.formula(T3, 'Escape velocity', r'v_e = \sqrt{\dfrac{2GM}{R}} = \sqrt{2gR}', [('v_e', 'escape speed', 'm s⁻¹')], 'Ignores air resistance and other bodies; independent of the body’s mass', '≈ 11.2 km/s for Earth')
c.formula(T4, 'Orbital speed (circular orbit)', r'v = \sqrt{\dfrac{GM}{r}}', [('r', 'orbital radius, from the centre of the planet', 'm')], 'Circular orbit', 'Near the surface: √(gR) ≈ 7.9 km/s')
c.formula(T4, 'Time period (circular orbit)', r'T = 2\pi\sqrt{\dfrac{r^{3}}{GM}}', [('T', 'period', 's')], 'Circular orbit; for ellipses use the semi-major axis a in place of r')
c.formula(T4, 'Energies of a circular orbit', r'K = \dfrac{GMm}{2r},\quad U = -\dfrac{GMm}{r},\quad E = -\dfrac{GMm}{2r}', [('K', 'kinetic energy', 'J'), ('E', 'total energy', 'J')], 'Circular orbit', 'K = −E and U = 2E')

# ---------- Questions ----------
c.mcq(T1, r'The distance between two masses is doubled and one mass is also doubled. The force becomes', [(r'$\tfrac12$ of the original', 0.5), (r'$\tfrac14$ of the original', 0.25), (r'the same', 1), (r'$2$ times', 2)], 0, 2 / 2**2, 'foundation', r'$F\propto m_1m_2/r^2$: $2/4=1/2$.')
c.mcq(T1, r'Two masses $M$ and $4M$ are $3$ m apart. The gravitational field is zero at a distance (from $M$, on the line between them) of', [('0.5 m', 0.5), ('1 m', 1), ('1.5 m', 1.5), ('2 m', 2)], 1, 1, 'main', r'$\dfrac{1}{x^2}=\dfrac{4}{(3-x)^2}\Rightarrow x=1$ m.')
c.mcq(T1, r'The gravitational field at a point inside a thin uniform spherical shell is', [('zero', 0), (r'$GM/R^2$', 1), (r'$GM/r^2$ with $r$ the distance from the centre', 2), ('maximum at the centre', 3)], 0, 0, 'foundation', 'By symmetry the pulls of the shell cancel everywhere inside.', tol=0)
c.mcq(T1, r'Four equal masses $m$ at the corners of a square of side $a$. The net force on one is', [(r'$\dfrac{Gm^2}{a^2}\left(\sqrt2+\tfrac12\right)$', sqrt(2) + 0.5), (r'$\dfrac{Gm^2}{a^2}\left(2+\tfrac12\right)$', 2.5), (r'$\dfrac{4Gm^2}{a^2}$', 4), (r'$\dfrac{Gm^2}{a^2}\left(\tfrac{1}{\sqrt2}+\tfrac12\right)$', 1 / sqrt(2) + 0.5)],
      0, sqrt(2) + 0.5, 'advanced', 'Two side forces resolve to $\\sqrt2\\,Gm^2/a^2$ along the diagonal; the diagonal mass adds $Gm^2/2a^2$.')
c.mcq(T2, r'At what height above the surface is $g$ equal to $\tfrac14$ of its surface value?', [(r'$R/2$', 0.5), (r'$R$', 1), (r'$2R$', 2), (r'$3R$', 3)], 1, 1, 'foundation', r'$(R/(R+h))^2=1/4\Rightarrow h=R$.')
c.mcq(T2, r'At a depth $d=R/2$ the value of $g$ (uniform Earth) is', [(r'$g/4$', 0.25), (r'$g/2$', 0.5), (r'$3g/4$', 0.75), (r'$g$', 1)], 1, 1 - 0.5, 'foundation', r'$g_d=g(1-d/R)=g/2$.')
c.mcq(T2, r'For small height $h$ the fractional decrease in $g$ is approximately', [(r'$h/R$', 1), (r'$2h/R$', 2), (r'$h/2R$', 0.5), (r'$h^2/R^2$', 0)], 1, 2, 'main', r'$g_h\approx g(1-2h/R)$.', tol=0)
c.integer(T2, r'The height $h$ (in km, rounded to the nearest integer) at which $g$ decreases by $1\%$, using $R=6400$ km and the exact formula, is closest to', 32, 'advanced', r'$(R/(R+h))^2=0.99\Rightarrow h=R(1/\sqrt{0.99}-1)=0.005038R\approx32$ km.')
c.mcq(T2, r'If $g$ is the same at height $h$ and depth $d$ ($h\ll R$), then', [(r'$d=h$', 1), (r'$d=2h$', 2), (r'$d=h/2$', 0.5), (r'$d=4h$', 4)], 1, 2, 'main', r'$1-2h/R=1-d/R\Rightarrow d=2h$.')
c.mcq(T3, r'The escape velocity from Earth is closest to', [('7.9 km/s', 7.9), ('11.2 km/s', 11.2), ('15.0 km/s', 15), ('3.0 km/s', 3)], 1, round(sqrt(2 * 9.8 * 6.4e6) / 1000, 1), 'foundation', r'$\sqrt{2gR}=11.2$ km/s.', tol=1e-3)
c.mcq(T3, r'A planet has $\tfrac14$ of Earth’s mass and $\tfrac14$ of Earth’s radius. Its escape velocity is', [('same as Earth’s', 1), (r'$\tfrac12$ of Earth’s', 0.5), ('twice Earth’s', 2), (r'$\tfrac14$ of Earth’s', 0.25)], 0, sqrt((1 / 4) / (1 / 4)), 'main', r'$v_e\propto\sqrt{M/R}$, ratio $=1$.')
c.integer(T3, r'A body is projected from Earth’s surface with speed $v_e/2$. The maximum height reached is $R/k$. Find $k$.', 3, 'advanced', r'Energy conservation gives $R+h=\tfrac43R$, so $h=R/3$.')
c.mcq(T3, r'A body leaves Earth with speed $2v_e$. Its speed far away is', [(r'$v_e$', 1), (r'$\sqrt3\,v_e$', sqrt(3)), (r'$2v_e$', 2), (r'$\sqrt2\,v_e$', sqrt(2))], 1, sqrt(3), 'advanced', r'$\tfrac12v_\infty^2=\tfrac12(2v_e)^2-\tfrac12v_e^2=\tfrac32v_e^2$.')
c.mcq(T3, r'The energy needed to raise $1$ kg from the surface to height $R$ is closest to', [(r'$6.3\times10^7$ J', 6.27e7), (r'$3.1\times10^7$ J', 3.14e7), (r'$9.8\times10^6$ J', 9.8e6), (r'$1.2\times10^8$ J', 1.2e8)], 1, 9.8 * 6.4e6 / 2, 'main', r'$\Delta U=mgR/2=3.1\times10^7$ J.', tol=0.01)
c.mcq(T4, r'The orbital speed of a satellite close to Earth’s surface is about', [('7.9 km/s', 7.9), ('11.2 km/s', 11.2), ('3.1 km/s', 3.1), ('9.8 km/s', 9.8)], 0, round(sqrt(9.8 * 6.4e6) / 1000, 1), 'foundation', r'$\sqrt{gR}=7.9$ km/s.', tol=1e-3)
c.mcq(T4, r'A planet orbits at four times the distance of another planet from the same star. Its period is', [(r'$2$ times', 2), (r'$4$ times', 4), (r'$8$ times', 8), (r'$16$ times', 16)], 2, 4**1.5, 'main', r'$T\propto r^{3/2}$: $4^{3/2}=8$.')
c.mcq(T4, r'The total energy of a satellite is $-4\times10^9$ J. Its kinetic energy is', [(r'$-4\times10^9$ J', -4e9), (r'$+4\times10^9$ J', 4e9), (r'$-8\times10^9$ J', -8e9), (r'$+8\times10^9$ J', 8e9)], 1, -(-4e9), 'main', r'$K=-E$ for a circular orbit.')
c.mcq(T4, r'A satellite in circular orbit loses energy slowly to atmospheric drag. Its speed', [('increases', 1), ('decreases', -1), ('stays constant', 0), ('first decreases then increases', 2)], 0, 1, 'advanced', r'$E=-GMm/2r$ falls so $r$ falls; $v=\sqrt{GM/r}$ rises.', tol=0)
c.multi(T4, r'A satellite moves to an orbit of twice the radius. Which statements are correct?', [
    ('Its orbital speed decreases by a factor of $\\sqrt2$', approx(1 / sqrt(2), 2**-0.5)), ('Its period increases by a factor of $2\\sqrt2$', approx(2**1.5, 2 * sqrt(2))),
    ('Its kinetic energy doubles', False), ('Its total energy increases (becomes less negative)', (-1 / (2 * 2)) > (-1 / (2 * 1))),
], 'advanced', r'$v\propto r^{-1/2}$, $T\propto r^{3/2}$, $K\propto1/r$ halves, and $E=-GMm/2r$ rises toward zero.')
c.integer(T4, r'A satellite’s circular-orbit speed is increased by a factor $\sqrt{n}$ so that it just escapes. Find $n$.', 2, 'main', r'Escape speed is $\sqrt2$ times the circular speed.')

# ---------- Videos ----------
c.video(T3, 'Q6GDswAsY6o', "3 Gravitation potential | Escape velocity | Kepler's law |Gravitation class 11|JEE Mains & Advanced", 'Mohit Tyagi', 'classroom', 'main',
        'Covers potential, escape velocity and Kepler’s laws at JEE Main and Advanced level.')
c.video(T4, 'kjmSi9i8QYo', "Gravitation | Kepler's Law, Satellite Motion & Escape Velocity | Class 11 | JEE Main 2022", 'Vedantu JEE', 'classroom', 'main',
        'A lesson on Kepler’s laws, satellite motion and escape velocity; matches topics 3 and 4.')
c.video(T4, '7brE-xK33Q0', "Gravitation JEE L3 [Satellites & Kepler's laws] JEE 2023 (11th Physics) | Shreyas Sir | Vedantu", 'Vedantu JEE English', 'examples', 'main',
        'Lecture 3 of a series on satellites and Kepler’s laws; use it for problem practice after the lesson here.')
c.video(T4, 'R995rOk92aE', "Gravitation and Kepler's Laws of Planetary Motion (AP Physics C)", 'Physics Done Phast', 'concept', 'advanced',
        'An English concept video on Kepler’s laws at AP Physics C level (calculus-based). Useful for the derivations; the exam format differs from JEE.')
c.dump('gravitation.json')
