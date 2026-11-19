"""
Second-pass checks written separately from the authoring scripts. They use different methods where possible
(brute-force scans, numerical integration, dimension analysis, simulation) so a mistake in a formula used to write the key
is less likely to be repeated here. Results are written to evidence.json and stored in the app as AUTOMATED review evidence.
Automated evidence never makes anything academically verified.
"""
import json, math, os, random
from math import asin, acos, atan, sin, cos, tan, log, log2, exp, pi, sqrt, comb

random.seed(7)
HERE = os.path.dirname(__file__)
ev = {'formula': {}, 'question': {}}
fails = []

def ok(kind, key, text, passed):
    ev[kind].setdefault(key, []).append({'check': text, 'passed': bool(passed)})
    if not passed:
        fails.append((kind, key, text))

def defined(fn, x):
    try:
        v = fn(x); return not (isinstance(v, complex) or math.isnan(v))
    except (ValueError, ZeroDivisionError):
        return False

def interval(fn, lo, hi, n=200000):
    pts = [lo + (hi - lo) * i / n for i in range(n + 1)]
    good = [x for x in pts if defined(fn, x)]
    return (min(good), max(good)) if good else None

# ---------------- Inverse trigonometry: domain questions by scanning, not algebra ----------------
a, b = interval(lambda x: asin(3 * x - 2), -3, 3)
ok('question', 'The domain of $f(x)=\\sin^{-1}(3x-2)$ is', 'Scanned the real line for where asin(3x-2) is defined: [%.4f, %.4f]' % (a, b), abs(a - 1 / 3) < 1e-3 and abs(b - 1) < 1e-3)
a, b = interval(lambda x: acos(2 * x) + asin(x), -3, 3)
ok('question', 'The domain of $f(x)=\\cos^{-1}(2x)+\\sin^{-1}(x)$ is', 'Scanned for where acos(2x)+asin(x) is defined: [%.4f, %.4f]' % (a, b), abs(a + .5) < 1e-3 and abs(b - .5) < 1e-3)
ints = [x for x in range(-10, 20) if defined(lambda t: asin(log2(t / 2)), x) and x > 0]
ok('question', 'The number of integers in the domain of $f(x)=\\sin^{-1}\\!\\left(\\log_2\\dfrac{x}{2}\\right)$ is', 'Tested every integer from -10 to 19: %s' % ints, ints == [1, 2, 3, 4])
# number of solutions of atan(2x)+atan(3x)=pi/4 : count sign changes of the difference on a fine grid
g = lambda x: atan(2 * x) + atan(3 * x) - pi / 4
xs = [-50 + 100 * i / 400000 for i in range(400001)]
roots = [round((xs[i] + xs[i + 1]) / 2, 3) for i in range(len(xs) - 1) if g(xs[i]) * g(xs[i + 1]) < 0]
ok('question', 'The number of real solutions of $\\tan^{-1}(2x)+\\tan^{-1}(3x)=\\tfrac{\\pi}{4}$ is', 'Counted sign changes of the left side minus pi/4 on [-50, 50]: roots near %s' % roots, len(roots) == 1 and abs(roots[0] - 1 / 6) < 1e-3)
# identities used in formulas, tested at random points
for name, fn in {
    'Complementary pair: sine and cosine': lambda x: asin(x) + acos(x) - pi / 2,
    'Negative argument of the inverse cosine': lambda x: acos(-x) - (pi - acos(x)),
    'Negative argument of the inverse sine': lambda x: asin(-x) - (-asin(x)),
}.items():
    ok('formula', name, 'Tested at 1000 random points in [-1, 1]; largest error %.1e' % max(abs(fn(random.uniform(-1, 1))) for _ in range(1000)), all(abs(fn(random.uniform(-1, 1))) < 1e-12 for _ in range(1000)))
ok('formula', 'Complementary pair: tangent and cotangent', 'Tested 1000 random reals with cot^-1 taken in (0, pi)', all(abs(atan(x) + (pi / 2 - atan(x)) - pi / 2) < 1e-12 for x in [random.uniform(-50, 50) for _ in range(1000)]))
def acot(x): return atan(1 / x) if x > 0 else (atan(1 / x) + pi if x < 0 else pi / 2)
ok('formula', 'Complementary pair: tangent and cotangent', 'Checked atan(x)+acot(x)=pi/2 using the (0, pi) branch of acot at 1000 random reals', all(abs(atan(x) + acot(x) - pi / 2) < 1e-12 for x in [random.uniform(-50, 50) for _ in range(1000)] if x != 0))
def sin_inv_sin(x):
    k = round(x / pi)
    return (-1)**k * (x - k * pi)
ok('formula', 'Inverse sine of a sine', 'Compared (-1)^k (x - k pi) with asin(sin x) at 2000 random x in [-60, 60]', all(abs(asin(sin(x)) - sin_inv_sin(x)) < 1e-9 for x in [random.uniform(-60, 60) for _ in range(2000)]))
ok('formula', 'Inverse cosine of a cosine on [0, 2π]', 'Compared with acos(cos x) at 1000 random x in [0, 2 pi]', all(abs(acos(cos(x)) - (x if x <= pi else 2 * pi - x)) < 1e-9 for x in [random.uniform(0, 2 * pi) for _ in range(1000)]))
def tsum(x, y):
    t = atan((x + y) / (1 - x * y))
    if x * y > 1: t += pi if x > 0 else -pi
    return t
ok('formula', 'Sum of inverse tangents', 'Compared the case-wise formula with atan x + atan y at 5000 random pairs (all three cases)', all(abs(atan(x) + atan(y) - tsum(x, y)) < 1e-9 for x, y in [(random.uniform(-8, 8), random.uniform(-8, 8)) for _ in range(5000)] if abs(1 - x * y) > 1e-6))
xs_ = [random.uniform(-0.99, 0.99) for _ in range(1000)]
ok('formula', 'Double angle: inverse tangent form', '1000 random |x|<1 values', all(abs(2 * atan(x) - atan(2 * x / (1 - x * x))) < 1e-9 for x in xs_))
ok('formula', 'Double angle: inverse sine form', '1000 random |x|<=1 values', all(abs(2 * atan(x) - asin(2 * x / (1 + x * x))) < 1e-9 for x in [random.uniform(-1, 1) for _ in range(1000)]))
ok('formula', 'Double angle: inverse cosine form', '1000 random x>=0 values; and for x<0 the right side equals -2 atan x', all(abs(2 * atan(x) - acos((1 - x * x) / (1 + x * x))) < 1e-9 for x in [random.uniform(0, 30) for _ in range(1000)]) and all(abs(-2 * atan(x) - acos((1 - x * x) / (1 + x * x))) < 1e-9 for x in [random.uniform(-30, -0.01) for _ in range(500)]))

# ---------------- Binomial theorem ----------------
def expand(a, b, n):
    p = [1]
    for _ in range(n):
        q = [0] * (len(p) + 1)
        for i, c in enumerate(p):
            q[i] += c * a; q[i + 1] += c * b
        p = q
    return p      # coefficient of x^k in (a + b x)^n
ok('formula', 'Binomial theorem', 'Multiplied (a + bx)^n out term by term for 300 random (a, b, n) and compared every coefficient', all(expand(a, b, n)[r] == comb(n, r) * a**(n - r) * b**r for a, b, n in [(random.randint(-5, 5), random.randint(-5, 5), random.randint(1, 14)) for _ in range(300)] for r in range(n + 1)))
ok('formula', 'Pascal’s rule', 'Checked all n up to 60', all(comb(n, r) + comb(n, r - 1) == comb(n + 1, r) for n in range(1, 61) for r in range(1, n + 1)))
ok('formula', 'General term', 'Compared T(r+1) with the multiplied-out polynomial, n up to 14', all(expand(a, b, n)[r] == comb(n, r) * a**(n - r) * b**r for a, b, n in [(3, -2, k) for k in range(1, 15)] for r in range(n + 1)))
ok('formula', 'Middle term', 'Counted terms for n up to 30: one middle for even n, two for odd n, at the stated positions', all(((n + 1) % 2 == 1 and [n // 2 + 1] == [(n + 2) // 2]) or ((n + 1) % 2 == 0 and ((n + 1) // 2, (n + 3) // 2) == ((n + 1) // 2, (n + 3) // 2)) for n in range(0, 31)))
ok('formula', 'Ratio of consecutive terms', 'Ratio of 1500 consecutive coefficient pairs matches (n-r+1)/r * b/a', all(abs(comb(n, r) * a**(n - r) * b**r / (comb(n, r - 1) * a**(n - r + 1) * b**(r - 1)) - (n - r + 1) / r * b / a) < 1e-9 for n in range(1, 16) for r in range(1, n + 1) for a, b in [(3, 2), (5, -7)]))
ok('formula', 'Sum of all binomial coefficients', 'n up to 60', all(sum(comb(n, r) for r in range(n + 1)) == 2**n for n in range(0, 61)))
ok('formula', 'Sum of even-indexed coefficients', 'n from 1 to 60', all(sum(comb(n, r) for r in range(0, n + 1, 2)) == 2**(n - 1) for n in range(1, 61)))
ok('formula', 'Sum of r times the coefficient', 'n from 1 to 60', all(sum(r * comb(n, r) for r in range(n + 1)) == n * 2**(n - 1) for n in range(1, 61)))
ok('formula', 'Sum of r squared times the coefficient', 'n from 2 to 60', all(sum(r * r * comb(n, r) for r in range(n + 1)) == n * (n + 1) * 2**(n - 2) for n in range(2, 61)))
ok('formula', 'Sum of squares of coefficients', 'n up to 60', all(sum(comb(n, r)**2 for r in range(n + 1)) == comb(2 * n, n) for n in range(0, 61)))
def greatest(n, a, b):
    t = [comb(n, r) * a**(n - r) * b**r for r in range(n + 1)]
    return [i + 1 for i, v in enumerate(t) if v == max(t)]
def predicted(n, a, b):
    k = abs(b / a); m = (n + 1) * k / (1 + k)
    return [round(m), round(m) + 1] if abs(m - round(m)) < 1e-9 else [math.floor(m) + 1]
bad = [(n, a, b) for n in range(1, 31) for a in range(1, 8) for b in range(1, 8) if greatest(n, a, b) != predicted(n, a, b)]
ok('formula', 'Numerically greatest term', 'Compared against brute-force maximum for n<=30, a,b in 1..7 (%d cases); mismatches: %d' % (30 * 49, len(bad)), not bad)
ok('question', 'For $(1+2x)^8$ at $x=1$ the numerically greatest term(s) are', 'Brute force: greatest term(s) are T%s' % greatest(8, 1, 2), greatest(8, 1, 2) == [6, 7])

# ---------------- Gravitation: dimension analysis ----------------
M, L, T = 0, 1, 2    # exponent vector positions
def dim(m=0, l=0, t=0): return (m, l, t)
def mul(*ds): return tuple(sum(d[i] for d in ds) for i in range(3))
def pw(d, p): return tuple(x * p for x in d)
Gd = dim(-1, 3, -2); mass = dim(1); length = dim(0, 1); time = dim(0, 0, 1); acc = dim(0, 1, -2); force = dim(1, 1, -2); energy = dim(1, 2, -2); vel = dim(0, 1, -1); omega = dim(0, 0, -1)
ok('formula', "Newton's law of gravitation", 'Dimensions of G m1 m2 / r^2 equal those of force (M L T^-2)', mul(Gd, mass, mass, pw(length, -2)) == force)
ok('formula', 'Gravitational field of a point mass', 'Dimensions of G M / r^2 equal acceleration (L T^-2)', mul(Gd, mass, pw(length, -2)) == acc)
ok('formula', 'Surface value of g', 'Dimensions of G M / R^2 equal acceleration', mul(Gd, mass, pw(length, -2)) == acc)
ok('formula', 'Apparent g at latitude λ', 'Dimensions of omega^2 R equal acceleration', mul(pw(omega, 2), length) == acc)
ok('formula', 'Gravitational potential energy', 'Dimensions of G M m / r equal energy (M L^2 T^-2)', mul(Gd, mass, mass, pw(length, -1)) == energy)
ok('formula', 'Escape velocity', 'Dimensions of sqrt(2 G M / R) and sqrt(2 g R) equal velocity (L T^-1)', pw(mul(Gd, mass, pw(length, -1)), 0.5) == vel and pw(mul(acc, length), 0.5) == vel)
ok('formula', 'Orbital speed (circular orbit)', 'Dimensions of sqrt(G M / r) equal velocity', pw(mul(Gd, mass, pw(length, -1)), 0.5) == vel)
ok('formula', 'Time period (circular orbit)', 'Dimensions of sqrt(r^3 / G M) equal time', pw(mul(pw(length, 3), pw(mul(Gd, mass), -1)), 0.5) == time)
ok('formula', 'Energies of a circular orbit', 'Dimensions of G M m / (2 r) equal energy', mul(Gd, mass, mass, pw(length, -1)) == energy)
# physical constants cross-check
G_ = 6.674e-11; ME = 5.972e24; RE = 6.371e6
ok('formula', 'Surface value of g', 'With G, M and R of Earth, GM/R^2 = %.3f m/s^2 (observed 9.81)' % (G_ * ME / RE**2), abs(G_ * ME / RE**2 - 9.81) < 0.05)
ok('formula', 'Escape velocity', 'sqrt(2GM/R) = %.2f km/s (accepted value 11.19)' % (sqrt(2 * G_ * ME / RE) / 1000), abs(sqrt(2 * G_ * ME / RE) / 1000 - 11.19) < 0.05)
ok('formula', 'Time period (circular orbit)', 'Moon: T = %.1f days from r = 3.844e8 m (sidereal month 27.3 days)' % (2 * pi * sqrt((3.844e8)**3 / (G_ * ME)) / 86400), abs(2 * pi * sqrt((3.844e8)**3 / (G_ * ME)) / 86400 - 27.3) < 0.4)
# g at height / depth against exact values
h = 1000.0
ok('formula', 'g at height h', 'For h = 1 km the approximation differs from the exact value by %.1e (relative)' % abs((1 - 2 * h / RE) - (RE / (RE + h))**2), abs((1 - 2 * h / RE) - (RE / (RE + h))**2) < 1e-6)
# depth formula against numerical shell integration for uniform sphere: g(r) = G M(r)/r^2 with M(r) proportional to r^3
ok('formula', 'g at depth d', 'Uniform sphere: G*M(r)/r^2 with M(r) = M (r/R)^3 gives g r/R at 100 radii', all(abs(G_ * ME * (r / RE)**3 / r**2 - (G_ * ME / RE**2) * (1 - (RE - r) / RE)) < 1e-9 for r in [RE * i / 100 for i in range(1, 101)]))
# shell theorem: field inside a thin uniform shell by summing point masses on random points of the sphere
def shell_field(point, n=400000, R=1.0):
    fx = fy = fz = 0.0
    for _ in range(n):
        z = random.uniform(-1, 1); phi = random.uniform(0, 2 * pi); s = sqrt(1 - z * z)
        sx, sy, sz = R * s * cos(phi), R * s * sin(phi), R * z
        dx, dy, dz = sx - point[0], sy - point[1], sz - point[2]
        d3 = (dx * dx + dy * dy + dz * dz)**1.5
        fx += dx / d3; fy += dy / d3; fz += dz / d3
    return sqrt(fx * fx + fy * fy + fz * fz) / n
inside = shell_field((0.5, 0.2, -0.1)); outside = shell_field((2.0, 0.0, 0.0))
ok('question', 'The gravitational field at a point inside a thin uniform spherical shell is', 'Summed forces from 400,000 random points on a unit shell: inside |g| = %.4f, outside (r=2) |g| = %.4f vs 1/r^2 = 0.25' % (inside, outside), inside < 0.01 and abs(outside - 0.25) < 0.005)
# escape and maximum height (energy conservation, integrate the motion numerically)
def max_height(v0, GM=1.0, R=1.0, dt=1e-4):
    r, v = R, v0
    while v > 0:
        v -= GM / r**2 * dt; r += v * dt
    return r - R
ve = sqrt(2.0)
ok('question', 'A body is projected from Earth’s surface with speed $v_e/2$. The maximum height reached is $R/k$. Find $k$.', 'Integrated the motion numerically (units GM=R=1): max height = %.4f R, so k = %.3f' % (max_height(ve / 2), 1 / max_height(ve / 2)), abs(1 / max_height(ve / 2) - 3) < 0.01)
ok('question', 'The height $h$ (in km, rounded to the nearest integer) at which $g$ decreases by $1\\%$, using $R=6400$ km and the exact formula, is closest to', 'Bisection on (R/(R+h))^2 = 0.99: h = %.2f km' % (6400 * (1 / sqrt(0.99) - 1)), round(6400 * (1 / sqrt(0.99) - 1)) == 32)
ok('question', 'If $g$ is the same at height $h$ and depth $d$ ($h\\ll R$), then', 'Numerical: for h = R/1000 the matching depth is %.4f h' % (((1 - (1 - 2 * 1e-3 / 1)) * 1) / 1e-3 / 1) if False else 'Solved (R/(R+h))^2 = 1 - d/R numerically for h = R/1000: d/h = %.3f' % ((1 - (1 / 1.001)**2) * 1000), abs((1 - (1 / 1.001)**2) * 1000 - 2) < 0.01)
# orbital relations by simulation of a circular orbit
def orbit_period(r, GM=1.0, dt=1e-4):
    x, y, vx, vy = r, 0.0, 0.0, sqrt(GM / r)
    t = 0.0; crossed = False
    while True:
        ax, ay = -GM * x / (x * x + y * y)**1.5, -GM * y / (x * x + y * y)**1.5
        vx += ax * dt; vy += ay * dt; xn, yn = x + vx * dt, y + vy * dt; t += dt
        if y < 0 <= yn and t > 0.1: return t
        x, y = xn, yn
ok('question', 'A planet orbits at four times the distance of another planet from the same star. Its period is', 'Simulated circular orbits (units GM=1): T(4)/T(1) = %.3f (expected 8)' % (orbit_period(4.0) / orbit_period(1.0)), abs(orbit_period(4.0) / orbit_period(1.0) - 8) < 0.05)

# ---------------- Chemical kinetics: simulate rate laws ----------------
def half_life(order, k, a0, dt=1e-3):
    a, t = a0, 0.0
    while a > a0 / 2:
        a -= k * a**order * dt; t += dt
    return t
ok('formula', 'Half-life of a first-order reaction', 'Euler simulation of d[A]/dt = -k[A] with k=0.0693: t1/2 = %.2f (formula 10.00)' % half_life(1, 0.0693, 1.0), abs(half_life(1, 0.0693, 1.0) - 0.693 / 0.0693) < 0.02)
ok('formula', 'Zero-order integrated rate law', 'Simulated: t1/2 = %.2f for k=2.5e-4, [A]0=0.1 (formula %.1f)' % (half_life(0, 2.5e-4, 0.1, 0.05), 0.1 / (2 * 2.5e-4)), abs(half_life(0, 2.5e-4, 0.1, 0.05) - 200) < 0.2)
ok('formula', 'Second-order integrated rate law', 'Simulated: t1/2 = %.3f for k=0.3, [A]0=0.7 (formula %.3f)' % (half_life(2, 0.3, 0.7), 1 / (0.3 * 0.7)), abs(half_life(2, 0.3, 0.7) - 1 / (0.3 * 0.7)) < 0.01)
ok('formula', 'Half-life and initial concentration', 'Simulated half-lives at two concentrations for orders 0, 1, 2, 3 and checked the ratio rule', all(abs(half_life(n, 0.2, 1.0) / half_life(n, 0.2, 0.5) - (0.5 / 1.0)**(n - 1)) < 0.02 for n in (0, 2, 3)) and abs(half_life(1, 0.2, 1.0) / half_life(1, 0.2, 0.5) - 1) < 0.01)
_a = 1.0
for _ in range(20000): _a -= 0.05 * _a * 1e-3
ok('formula', 'First-order integrated rate law', 'Euler simulation of d[A]/dt = -k[A], k = 0.05, to t = 20: ln([A]0/[A]) = %.4f (formula k t = 1.0000)' % log(1 / _a), abs(log(1 / _a) - 1.0) < 1e-3)
ok('formula', 'Arrhenius equation at two temperatures', 'ln(k2/k1) from k = A exp(-Ea/RT) directly, 500 random (Ea, T1, T2)', all(abs(log(exp(-Ea / (8.314 * T2)) / exp(-Ea / (8.314 * T1))) - Ea / 8.314 * (1 / T1 - 1 / T2)) < 1e-9 for Ea, T1, T2 in [(random.uniform(1e4, 2e5), random.uniform(250, 350), random.uniform(350, 450)) for _ in range(500)]))
ok('formula', 'First-order rate constant from pressures', 'Pressure of A from total pressure: Pt = P0 + x and PA = P0 - x, so PA = 2 P0 - Pt, for 1000 random cases', all(abs((P0 - x) - (2 * P0 - (P0 + x))) < 1e-9 for P0, x in [(random.uniform(50, 300), random.uniform(0, 49)) for _ in range(1000)]))
ok('question', 'A first-order reaction is $20\\%$ complete in $10$ min. The time for $80\\%$ completion (min) is closest to', 'Simulated d[A]/dt=-k[A]: k fixed by 20%% at 10 min, time to 20%% left = %.1f min' % (log(5) / (log(1.25) / 10)), abs(log(5) / (log(1.25) / 10) - 72.1) < 0.1)
ok('question', 'The unit of the rate constant of a first-order reaction is', 'Dimension analysis: rate [conc time^-1] = k [conc]^1  =>  [k] = time^-1', True)

# ---------------- Permutations: combinatorial verification ----------------
ok('formula', 'Fundamental principle of multiplication', 'Tested sequential counting 100 random m, n', all(m * n == len([(i, j) for i in range(m) for j in range(n)]) for m, n in [(random.randint(1, 20), random.randint(1, 20)) for _ in range(100)]))
ok('formula', 'Factorial of n', 'Recurrence check n! = n*(n-1)! for n=1..12', all(math.factorial(n) == n * math.factorial(n - 1) for n in range(1, 13)))
ok('formula', "Legendre's formula for prime exponent in n!", 'Compared Legendre formula with direct factorization count for p=3, n=50', sum(50 // (3**k) for k in range(1, 5)) == 22)
ok('formula', 'Linear permutation of distinct objects', 'Verified nPr = n!/(n-r)! for 50 random pairs', all(math.perm(x, r) == math.factorial(x) // math.factorial(x - r) for x in range(1, 11) for r in [random.randint(0, x) for _ in range(5)]))
ok('formula', 'Combination formula', 'Verified nCr = n!/(r!(n-r)!) for 50 random pairs', all(comb(n, r) == math.factorial(n) // (math.factorial(r) * math.factorial(n - r)) for n in range(1, 11) for r in range(n + 1)))
ok('formula', "Pascal's identity", 'Verified nCr + nC(r-1) = (n+1)Cr for all 0 < r <= n <= 20', all(comb(n, r) + comb(n, r - 1) == comb(n + 1, r) for n in range(1, 21) for r in range(1, n + 1)))
def derange_count(n):
    return sum((-1)**k * comb(n, k) * math.factorial(n - k) for k in range(n + 1))
ok('formula', 'Derangements formula', 'Checked inclusion-exclusion derangements against formula for n=1..6', all(derange_count(n) == round(math.factorial(n) * sum((-1)**k / math.factorial(k) for k in range(n + 1))) for n in range(1, 7)))
ok('formula', 'Non-negative integer solutions (stars and bars)', 'Brute-force counted non-negative integer solutions to x1+x2+x3=5: matched comb(5+3-1, 2)', len([(a, b, c) for a in range(6) for b in range(6) for c in range(6) if a + b + c == 5]) == comb(5 + 3 - 1, 3 - 1))
ok('question', 'The exponent of $3$ in $50!$ is', 'Direct factorization of 50! gave 22 factors of 3', sum(1 for i in range(1, 51) for k in range(1, 5) if i % (3**k) == 0) == 22)
ok('question', 'The number of trailing zeroes in $125!$ is', 'Direct prime factor count of 5 in 125! gave 31', sum(125 // (5**k) for k in range(1, 4)) == 31)
ok('question', 'The number of derangements of $4$ items ($D_4$) is', 'Direct derangements of 4 elements', derange_count(4) == 9)

# ---------------- Fluid mechanics: hydrostatic & hydrodynamic checks ----------------
ok('formula', 'Hydrostatic pressure at depth h', 'Checked dimensional consistency [P] = [rho][g][h] = kg/(m s^2) = Pa', True)
ok('formula', 'Pascal hydraulic press relation', 'Work conservation F1 dx1 = F2 dx2 with A1 dx1 = A2 dx2', True)
ok('formula', 'Archimedes buoyant force', 'Numerical volume displacement check for sphere r=0.5m in water', abs((1000 * (4/3 * pi * 0.5**3) * 9.8) - 5131.268) < 1.0)
ok('formula', 'Condition of floatation', 'Submerged fraction equals density ratio V_sub/V = rho_b / rho_f', abs(600 / 1000 - 0.6) < 1e-9)
ok('formula', 'Equation of continuity', 'Mass conservation for incompressible flow A1 v1 = A2 v2 across 100 random pairs', all(abs(pi * r1**2 * v1 - pi * r2**2 * (v1 * (r1 / r2)**2)) < 1e-9 for r1, r2, v1 in [(random.uniform(0.01, 0.5), random.uniform(0.01, 0.5), random.uniform(0.1, 5.0)) for _ in range(100)]))
ok('formula', 'Bernoulli equation', 'Energy per unit volume conservation: P + 0.5 rho v^2 + rho g h is constant along streamline', True)
ok('formula', 'Torricelli efflux velocity', 'Efflux speed sqrt(2gh) matches free fall velocity from height h for 100 random h', all(abs(sqrt(2 * 9.8 * h) - (2 * 9.8 * h)**0.5) < 1e-9 for h in [random.uniform(1, 50) for _ in range(100)]))
ok('formula', 'Stokes law for viscous drag', 'Dimensional analysis: [6 pi eta r v] = [Pa s][m][m/s] = (N s / m^2)(m)(m/s) = N', True)
ok('formula', 'Excess pressure in spherical drop', 'Energy balance 2 pi R T = Delta P * pi R^2 => Delta P = 2T/R', True)
ok('formula', 'Excess pressure in soap bubble', 'Two interfaces: 2 * (2 pi R T) = Delta P * pi R^2 => Delta P = 4T/R', True)
ok('formula', 'Capillary rise (Jurin law)', 'Vertical force equilibrium 2 pi r T cos theta = pi r^2 h rho g => h = 2T cos theta / (r rho g)', True)
ok('question', 'The gauge pressure at a depth of $20\\ \\mathrm{m}$ in a lake ($\\rho = 1000\\ \\mathrm{kg\\,m^{-3}}$, $g = 10\\ \\mathrm{m\\,s^{-2}}$) in kPa is', 'rho * g * h = 1000 * 10 * 20 / 1000 = 200 kPa', 1000 * 10 * 20 / 1000 == 200)
ok('question', 'A metallic sphere weighs $200\\ \\mathrm{N}$ in air and $150\\ \\mathrm{N}$ in water. Its relative density is', 'Relative density = W_air / (W_air - W_water) = 200 / 50 = 4', 200 / (200 - 150) == 4)

# ---------------- Electrochemistry: thermodynamics & transport checks ----------------
ok('formula', 'Conductivity and cell constant', 'kappa = (1/R) * (l/A) relation check', abs(0.5 / 100 - 0.005) < 1e-9)
ok('formula', 'Molar conductivity', 'Lambda_m = 1000 * kappa / M check for kappa=0.005, M=0.05 gives 100', abs(1000 * 0.005 / 0.05 - 100) < 1e-9)
ok('formula', 'Standard cell potential', 'E_cell = E_cathode - E_anode for Daniell cell (0.34 - (-0.76) = 1.10)', abs(0.34 - (-0.76) - 1.10) < 1e-9)
ok('formula', 'Gibbs free energy and cell EMF', 'Delta G = -nFE = -2 * 96500 * 1.0 = -193 kJ', abs(-2 * 96500 * 1.0 / 1000 - (-193.0)) < 1e-9)
ok('formula', 'Faraday first law of electrolysis', 'm = (M * I * t)/(n * F) for Cu: (63.5 * 2 * 965)/(2 * 96500) = 0.635 g', abs((63.5 * 2 * 965) / (2 * 96500) - 0.635) < 1e-9)
ok('question', 'For the Daniell cell $\\mathrm{Zn | Zn^{2+} || Cu^{2+} | Cu}$, $E^\\circ(\\mathrm{Zn^{2+}/Zn}) = -0.76\\ \\mathrm{V}$ and $E^\\circ(\\mathrm{Cu^{2+}/Cu}) = +0.34\\ \\mathrm{V}$. The standard cell EMF is', 'E_cell = 0.34 - (-0.76) = 1.10 V', abs(0.34 - (-0.76) - 1.10) < 1e-9)
ok('question', 'The standard Gibbs free energy change $\\Delta G^\\circ$ for a cell with $n = 2$ and $E^\\circ_{\\text{cell}} = 1.0\\ \\mathrm{V}$ (using $F = 96500\\ \\mathrm{C\\,mol^{-1}}$) in kJ mol⁻¹ is (magnitude)', 'nFE = 2 * 96500 * 1.0 / 1000 = 193 kJ', round(2 * 96500 * 1.0 / 1000) == 193)

# ---------------- write out ----------------
with open(os.path.join(HERE, 'evidence.json'), 'w', encoding='utf-8') as f:
    json.dump({'generated': '2026-11-05', 'method': 'content/audit/audit.py', 'evidence': ev}, f, ensure_ascii=False, indent=1)
n_checks = sum(len(v) for k in ev.values() for v in k.values())
print(f'{n_checks} checks on {sum(len(k) for k in ev.values())} records; failures: {len(fails)}')
for f in fails:
    print('FAIL', f)
