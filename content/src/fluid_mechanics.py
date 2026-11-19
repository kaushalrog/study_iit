from math import pi, sqrt
from lib import Chapter, approx

c = Chapter('Fluid Mechanics')
T1 = c.topic('Fluid statics: Pressure, density, and Pascal’s law')
T2 = c.topic('Buoyancy, Archimedes’ principle, and floatation')
T3 = c.topic('Fluid dynamics: Continuity and Bernoulli’s equation')
T4 = c.topic('Viscosity, terminal velocity, and surface tension')

# ---------- overview ----------
c.lesson(None, 'introduction', 'foundation', r"""
**What this chapter is about.** Fluids (liquids and gases) are substances that deform continuously under applied shear stress. Fluid mechanics explores how fluids behave at rest (**hydrostatics**) and in motion (**hydrodynamics**).

**Prerequisites.** (1) Newton's laws of motion and free-body diagrams. (2) Work, kinetic energy, and potential energy. (3) Basic geometry (volumes, cross-sectional areas of cylinders and spheres).

**Topic path.** Hydrostatic pressure, Pascal's principle, and U-tube manometers → Archimedes' principle, apparent weight, and floatation stability → streamline flow, continuity equation, and Bernoulli's theorem with practical applications (efflux, Venturimeter) → viscous drag, Stokes' law, terminal velocity, and surface tension with capillarity.
""")

c.lesson(None, 'why_it_matters', 'main', r"""
In JEE Main and Advanced, Fluid Mechanics carries consistent weight, bridging classical mechanics with continuous media. Key examination staples include hydrostatic pressure in accelerated frames (sloshing liquids), Archimedes' principle with multi-layer liquids or melting ice, Bernoulli applications (draining tanks, dynamic lift), and capillary rise with contact angles. Conceptual rigor around non-viscous vs viscous flow and energy conservation makes this chapter a high-yield scoring area.
""")

# ---------- Topic 1 ----------
c.lesson(T1, 'introduction', 'foundation', r"""
**Pressure in a Fluid.**
Fluid pressure is defined as the normal compressive force per unit surface area:
$$P = \lim_{\Delta A \to 0} \dfrac{\Delta F_{\perp}}{\Delta A}.$$
SI unit: Pascal ($\mathrm{Pa} = \mathrm{N\,m^{-2}}$). Standard atmospheric pressure: $1\ \mathrm{atm} = 1.013 \times 10^5\ \mathrm{Pa} = 760\ \mathrm{mm\ Hg}$. Pressure is a scalar quantity because at any point it acts equally in all directions.
""")

c.lesson(T1, 'explanation', 'foundation', r"""
**Variation of Pressure with Depth (Hydrostatic Law).**
In an incompressible fluid of uniform density $\rho$ under uniform gravity $g$, pressure increases linearly with depth $h$:
$$P = P_0 + \rho g h,$$
where $P_0$ is the pressure at the liquid surface (often atmospheric pressure $P_{\text{atm}}$).
The difference $P - P_0 = \rho g h$ is called the **gauge pressure**.
Points at the same horizontal level in a continuous, static, interconnected body of the same fluid must have the same pressure.
""")

c.lesson(T1, 'derivation', 'main', r"""
**Pascal's Principle and the Hydraulic Lift.**
*Pascal's Law:* Pressure applied to an enclosed, incompressible static fluid is transmitted undiminished to every portion of the fluid and to the walls of the containing vessel.
In a hydraulic press with pistons of areas $A_1$ and $A_2$:
$$\dfrac{F_1}{A_1} = \dfrac{F_2}{A_2} \implies F_2 = F_1 \left(\dfrac{A_2}{A_1}\right).$$
*Work conservation:* Since the fluid is incompressible, $A_1 \Delta x_1 = A_2 \Delta x_2$.
$$W = F_1 \Delta x_1 = \left(F_2 \dfrac{A_1}{A_2}\right)\left(\Delta x_2 \dfrac{A_2}{A_1}\right) = F_2 \Delta x_2.$$
Ideal mechanical advantage multiplies force without violating energy conservation.
""")

c.lesson(T1, 'example', 'foundation', r"""
**Example 1.** Calculate the absolute pressure at a depth of $10\ \mathrm{m}$ in fresh water ($\rho = 1000\ \mathrm{kg\,m^{-3}}$, $g = 9.8\ \mathrm{m\,s^{-2}}$, $P_{\text{atm}} = 1.01 \times 10^5\ \mathrm{Pa}$).
*Solution.*
$$P = P_0 + \rho g h = 1.01 \times 10^5 + (1000)(9.8)(10) = 101{,}000 + 98{,}000 = 199{,}000\ \mathrm{Pa} = 1.99 \times 10^5\ \mathrm{Pa}.$$
""")

c.lesson(T1, 'example', 'main', r"""
**Example 2 (U-tube with two immiscible liquids).** A U-tube contains water ($\rho_w = 1000\ \mathrm{kg\,m^{-3}}$). Oil of density $\rho_o = 800\ \mathrm{kg\,m^{-3}}$ is poured into one arm until it forms a column of height $10\ \mathrm{cm}$. Find the difference in water levels.
*Solution.* Equating pressures at the horizontal interface level:
$$\rho_o g h_o = \rho_w g h_w \implies h_w = h_o \left(\dfrac{\rho_o}{\rho_w}\right) = 10 \times \dfrac{800}{1000} = 8\ \mathrm{cm}.$$
The water column is $8\ \mathrm{cm}$ above the interface, while the oil column is $10\ \mathrm{cm}$. The height difference between the two surfaces is $10 - 8 = 2\ \mathrm{cm}$.
""")

c.lesson(T1, 'common_mistakes', 'foundation', r"""
*Hydrostatic Paradox:* The pressure at the bottom of a liquid column depends only on vertical depth $h$ and density $\rho$, not on the shape, volume, or total weight of the liquid in the container.
""")

c.lesson(T1, 'tips', 'main', r"""
*Accelerating containers:* If a container accelerates horizontally with acceleration $a$, the effective gravity is $\vec{g}_{\text{eff}} = \vec{g} - \vec{a}$, and the liquid free surface tilts at an angle $\tan\theta = a / g$ to the horizontal.
""")

c.lesson(T1, 'summary', 'foundation', r"""
$P = P_0 + \rho gh$. Gauge pressure is $\rho gh$. Pascal's principle governs hydraulic multiplication. Free surface tilts at $\tan\theta = a/g$ under horizontal acceleration.
""")

# ---------- Topic 2 ----------
c.lesson(T2, 'introduction', 'foundation', r"""
**Archimedes' Principle.**
When a body is wholly or partially submerged in a static fluid, it experiences an upward buoyant force equal to the weight of the fluid displaced by the body:
$$F_B = \rho_f V_{\text{disp}} g,$$
where $\rho_f$ is fluid density and $V_{\text{disp}}$ is the submerged volume of the body.
The buoyant force acts vertically upwards through the **centre of buoyancy** (the centre of gravity of the displaced fluid).
""")

c.lesson(T2, 'explanation', 'foundation', r"""
**Principle of Floatation.**
For a floating body in static equilibrium, the net vertical force is zero:
$$F_B = W \implies \rho_f V_{\text{sub}} g = \rho_b V_{\text{total}} g \implies \dfrac{V_{\text{sub}}}{V_{\text{total}}} = \dfrac{\rho_b}{\rho_f}.$$
- If $\rho_b < \rho_f$: The body floats partially submerged.
- If $\rho_b = \rho_f$: The body floats fully submerged in neutral equilibrium.
- If $\rho_b > \rho_f$: The body sinks to the bottom.
""")

c.lesson(T2, 'derivation', 'main', r"""
**Apparent Weight of a Submerged Body.**
When weighed in a fluid, the apparent weight $W_{\text{app}}$ recorded by a scale is:
$$W_{\text{app}} = W_{\text{true}} - F_B = \rho_b V g - \rho_f V g = W_{\text{true}}\left(1 - \dfrac{\rho_f}{\rho_b}\right).$$
Relative density (specific gravity) of the solid is:
$$\text{Relative Density} = \dfrac{\rho_b}{\rho_w} = \dfrac{W_{\text{true}}}{W_{\text{true}} - W_{\text{water}}} = \dfrac{W_{\text{air}}}{\text{Loss of weight in water}}.$$
""")

c.lesson(T2, 'example', 'foundation', r"""
**Example 1.** An iceberg of density $900\ \mathrm{kg\,m^{-3}}$ floats in sea water of density $1025\ \mathrm{kg\,m^{-3}}$. What fraction of its volume is submerged?
*Solution.*
$$\dfrac{V_{\text{sub}}}{V} = \dfrac{\rho_{\text{ice}}}{\rho_{\text{water}}} = \dfrac{900}{1025} \approx 0.878 \quad (87.8\%).$$
""")

c.lesson(T2, 'example', 'main', r"""
**Example 2 (Melting Ice in Water).** A piece of ice floats in water in a beaker. When the ice melts completely, does the water level change?
*Solution.*
Floating condition: Weight of ice = Weight of displaced water $\implies m_{\text{ice}} g = \rho_w V_{\text{disp}} g \implies V_{\text{disp}} = m_{\text{ice}} / \rho_w$.
When melted into water of mass $m_{\text{ice}}$, its new volume is $V_{\text{melted}} = m_{\text{ice}} / \rho_w$.
Since $V_{\text{melted}} = V_{\text{disp}}$, the melted water exactly fills the cavity previously occupied by the submerged portion. The water level **remains unchanged**.
""")

c.lesson(T2, 'common_mistakes', 'foundation', r"""
*Trap:* Using the body's density instead of the fluid's density when calculating buoyant force: $F_B = \rho_{\text{fluid}} V_{\text{sub}} g$, NEVER $\rho_{\text{body}}$.
""")

c.lesson(T2, 'tips', 'main', r"""
*Ice with trapped density:* If ice contains a lead pellet ($\rho_{\text{lead}} > \rho_w$), the water level falls upon melting. If ice contains a cork or air bubble ($\rho < \rho_w$), the water level remains unchanged.
""")

c.lesson(T2, 'summary', 'foundation', r"""
$F_B = \rho_f V_{\text{disp}} g$. Submerged fraction is $\rho_{\text{body}} / \rho_{\text{fluid}}$. Apparent weight is $W(1 - \rho_f/\rho_b)$.
""")

# ---------- Topic 3 ----------
c.lesson(T3, 'introduction', 'foundation', r"""
**Ideal Fluid Flow.**
An ideal fluid is assumed to be:
1. *Incompressible:* Constant density throughout.
2. *Non-viscous (inviscid):* Zero internal friction between liquid layers.
3. *Steady (streamline):* Velocity at any fixed spatial point is invariant with time.
4. *Irrotational:* Elements have zero net angular momentum about their centres.
""")

c.lesson(T3, 'explanation', 'main', r"""
**Equation of Continuity.**
Due to conservation of mass, the mass flow rate through any cross-section of a flow tube must remain constant:
$$\rho_1 A_1 v_1 = \rho_2 A_2 v_2.$$
For an incompressible fluid ($\rho_1 = \rho_2$):
$$A_1 v_1 = A_2 v_2 = Q = \text{constant},$$
where $Q$ is the volume flow rate ($\mathrm{m^3\,s^{-1}}$). When cross-sectional area decreases, flow speed must increase.
""")

c.lesson(T3, 'derivation', 'main', r"""
**Bernoulli's Theorem.**
Bernoulli's equation expresses the work-energy theorem for steady streamline flow of an ideal, incompressible fluid:
$$P + \dfrac{1}{2}\rho v^2 + \rho g h = \text{constant}.$$
Dividing by $\rho g$, it is often expressed in heads:
$$\dfrac{P}{\rho g} + \dfrac{v^2}{2g} + h = \text{constant},$$
where $\dfrac{P}{\rho g}$ is pressure head, $\dfrac{v^2}{2g}$ is velocity head, and $h$ is datum/elevation head.
""")

c.lesson(T3, 'example', 'foundation', r"""
**Example 1 (Torricelli's Law of Efflux).** Water is stored in an open tank to height $H$. An orifice is opened at depth $h$ below the free surface. Find the efflux speed.
*Solution.* Applying Bernoulli's equation between surface and orifice:
$$P_{\text{atm}} + \rho g H + 0 = P_{\text{atm}} + \rho g (H - h) + \dfrac{1}{2}\rho v^2 \implies v = \sqrt{2gh}.$$
This equals the velocity of a particle freely falling through height $h$.
""")

c.lesson(T3, 'example', 'main', r"""
**Example 2 (Venturimeter).** A horizontal pipe of cross-section $A_1$ narrows to a throat of cross-section $A_2$. The pressure difference is measured as $\Delta P$. Find the flow rate $Q$.
*Solution.*
By continuity: $v_2 = v_1 (A_1 / A_2)$.
By horizontal Bernoulli: $P_1 - P_2 = \dfrac{1}{2}\rho (v_2^2 - v_1^2) = \dfrac{1}{2}\rho v_1^2 \left[\left(\dfrac{A_1}{A_2}\right)^2 - 1\right]$.
$$v_1 = \sqrt{\dfrac{2(P_1 - P_2)}{\rho\left[(A_1/A_2)^2 - 1\right]}} \implies Q = A_1 v_1 = A_1 A_2 \sqrt{\dfrac{2\Delta P}{\rho(A_1^2 - A_2^2)}}.$$
""")

c.lesson(T3, 'common_mistakes', 'foundation', r"""
*Trap:* Applying Bernoulli's equation across different streamlines when flow is rotational, or ignoring the pressure difference created by velocity changes (e.g. thinking high speed means high pressure, when in fact high speed corresponds to low pressure).
""")

c.lesson(T3, 'tips', 'main', r"""
*Maximum Range of Efflux:* In a tank of height $H$, an orifice at depth $h = H/2$ gives the maximum horizontal range $R_{\text{max}} = H$.
""")

c.lesson(T3, 'summary', 'foundation', r"""
Continuity: $A_1 v_1 = A_2 v_2$. Bernoulli: $P + \frac{1}{2}\rho v^2 + \rho gh = \text{const}$. Efflux speed: $v = \sqrt{2gh}$.
""")

# ---------- Topic 4 ----------
c.lesson(T4, 'introduction', 'foundation', r"""
**Viscosity and Newton's Law.**
Viscosity is the internal friction between adjacent layers of fluid in relative motion.
Newton's law of viscosity states that the viscous shear force $F$ between fluid layers of area $A$ separated by velocity gradient $dv/dy$ is:
$$F = -\eta A \dfrac{dv}{dy},$$
where $\eta$ is the coefficient of viscosity.
SI unit: $\mathrm{Pa\,s} = \mathrm{N\,s\,m^{-2}} = \mathrm{kg\,m^{-1}\,s^{-1}}$. (In CGS: $1\ \text{poise} = 0.1\ \mathrm{Pa\,s}$).
""")

c.lesson(T4, 'explanation', 'main', r"""
**Stokes' Law and Terminal Velocity.**
When a small sphere of radius $r$ moves with speed $v$ through a fluid of viscosity $\eta$, the viscous drag is:
$$F_v = 6\pi \eta r v.$$
When dropping under gravity, the sphere reaches a constant **terminal velocity** $v_t$ when weight equals the sum of buoyant force and viscous drag:
$$W = F_B + F_v \implies \dfrac{4}{3}\pi r^3 \rho g = \dfrac{4}{3}\pi r^3 \sigma g + 6\pi \eta r v_t \implies v_t = \dfrac{2}{9}\dfrac{r^2(\rho - \sigma)g}{\eta},$$
where $\rho$ is the density of the sphere and $\sigma$ is the density of the fluid.
""")

c.lesson(T4, 'derivation', 'main', r"""
**Surface Tension and Capillary Rise.**
Surface tension $T$ is the tensile force per unit length on an imaginary line on the liquid surface: $T = F / L$ (units $\mathrm{N\,m^{-1}} = \mathrm{J\,m^{-2}}$).
**Excess Pressure:**
- Spherical liquid drop (1 surface): $\Delta P = \dfrac{2T}{R}$.
- Spherical soap bubble (2 surfaces): $\Delta P = \dfrac{4T}{R}$.
- Cylindrical liquid jet: $\Delta P = \dfrac{T}{R}$.

**Capillary Ascent (Jurin's Law):**
A tube of radius $r$ dipped in liquid of density $\rho$ and contact angle $\theta$ sustains a column of height $h$:
$$2\pi r T \cos\theta = \pi r^2 h \rho g \implies h = \dfrac{2T\cos\theta}{r\rho g}.$$
""")

c.lesson(T4, 'example', 'foundation', r"""
**Example 1.** Calculate the excess pressure inside a soap bubble of radius $2\ \mathrm{mm}$ in air ($T = 0.03\ \mathrm{N\,m^{-1}}$).
*Solution.* A soap bubble has two liquid-gas interfaces:
$$\Delta P = \dfrac{4T}{R} = \dfrac{4 \times 0.03}{2 \times 10^{-3}} = \dfrac{0.12}{0.002} = 60\ \mathrm{Pa}.$$
""")

c.lesson(T4, 'example', 'main', r"""
**Example 2.** Eight identical spherical rain droplets, each falling with terminal speed $v_0 = 5\ \mathrm{cm\,s^{-1}}$, coalesce into a single larger drop. Find the terminal speed of the new drop.
*Solution.*
Volume conservation: $\dfrac{4}{3}\pi R^3 = 8 \left(\dfrac{4}{3}\pi r^3\right) \implies R = 2r$.
Since terminal velocity $v_t \propto r^2$:
$$\dfrac{v_t'}{v_0} = \left(\dfrac{R}{r}\right)^2 = 2^2 = 4 \implies v_t' = 4 \times 5 = 20\ \mathrm{cm\,s^{-1}}.$$
""")

c.lesson(T4, 'common_mistakes', 'foundation', r"""
*Trap:* Forgetting that a soap bubble in air has TWO surfaces (inside and outside), giving $\Delta P = 4T/R$, whereas a liquid droplet or an air bubble inside liquid has only ONE surface, giving $\Delta P = 2T/R$.
""")

c.lesson(T4, 'tips', 'main', r"""
*Insufficient tube length:* If a capillary tube of length $L < h$ is used, liquid rises to the top and adjusts its radius of curvature $R'$ such that $h r = L R'$; liquid does NOT overflow.
""")

c.lesson(T4, 'summary', 'foundation', r"""
Stokes' law: $F = 6\pi\eta rv$. Terminal speed: $v_t \propto r^2$. Drop excess pressure: $2T/R$; bubble: $4T/R$. Capillary rise: $h = 2T\cos\theta / (r\rho g)$.
""")

# ---------- Formulas ----------
c.formula(T1, 'Hydrostatic pressure at depth h', r'P = P_0 + \rho g h', [('P', 'absolute pressure at depth h', 'Pa'), ('P₀', 'surface / atmospheric pressure', 'Pa'), ('ρ', 'liquid density', 'kg m⁻³'), ('g', 'acceleration due to gravity', 'm s⁻²'), ('h', 'vertical depth', 'm')], 'Uniform density, static fluid')
c.formula(T1, 'Pascal hydraulic press relation', r'\dfrac{F_1}{A_1} = \dfrac{F_2}{A_2}\ \Longrightarrow\ F_2 = F_1\dfrac{A_2}{A_1}', [('F₁, F₂', 'forces on pistons 1 and 2', 'N'), ('A₁, A₂', 'cross-sectional areas', 'm²')], 'Incompressible enclosed static fluid')
c.formula(T2, 'Archimedes buoyant force', r'F_B = \rho_f V_{\text{disp}} g', [('F_B', 'buoyant upthrust', 'N'), ('ρ_f', 'fluid density', 'kg m⁻³'), ('V_disp', 'volume of fluid displaced', 'm³'), ('g', 'acceleration due to gravity', 'm s⁻²')], 'Static fluid')
c.formula(T2, 'Condition of floatation', r'\dfrac{V_{\text{sub}}}{V} = \dfrac{\rho_{\text{body}}}{\rho_{\text{fluid}}}', [('V_sub', 'submerged volume', 'm³'), ('V', 'total body volume', 'm³'), ('ρ_body', 'body density', 'kg m⁻³'), ('ρ_fluid', 'fluid density', 'kg m⁻³')], 'Floating body in static equilibrium')
c.formula(T3, 'Equation of continuity', r'A_1 v_1 = A_2 v_2 = Q', [('A₁, A₂', 'pipe cross-sectional areas', 'm²'), ('v₁, v₂', 'flow velocities', 'm s⁻¹'), ('Q', 'volumetric discharge', 'm³ s⁻¹')], 'Incompressible, steady streamline flow')
c.formula(T3, 'Bernoulli equation', r'P + \dfrac{1}{2}\rho v^2 + \rho g h = \text{constant}', [('P', 'static pressure', 'Pa'), ('ρ', 'fluid density', 'kg m⁻³'), ('v', 'streamline velocity', 'm s⁻¹'), ('h', 'elevation above datum', 'm')], 'Ideal fluid: non-viscous, incompressible, steady, irrotational')
c.formula(T3, 'Torricelli efflux velocity', r'v = \sqrt{2gh}', [('v', 'efflux speed from orifice', 'm s⁻¹'), ('g', 'gravitational acceleration', 'm s⁻²'), ('h', 'depth of orifice below liquid surface', 'm')], 'Open tank, orifice area much smaller than tank surface area')
c.formula(T4, 'Stokes law for viscous drag', r'F_v = 6\pi \eta r v', [('F_v', 'viscous retarding force', 'N'), ('η', 'coefficient of dynamic viscosity', 'Pa s'), ('r', 'radius of spherical particle', 'm'), ('v', 'speed of sphere', 'm s⁻¹')], 'Laminar flow over rigid sphere')
c.formula(T4, 'Terminal velocity of falling sphere', r'v_t = \dfrac{2}{9}\dfrac{r^2(\rho - \sigma)g}{\eta}', [('v_t', 'terminal speed', 'm s⁻¹'), ('r', 'sphere radius', 'm'), ('ρ', 'density of sphere', 'kg m⁻³'), ('σ', 'density of fluid', 'kg m⁻³'), ('η', 'fluid viscosity', 'Pa s')], 'Equilibrium of weight, buoyancy and Stokes drag')
c.formula(T4, 'Excess pressure in spherical drop', r'\Delta P = \dfrac{2T}{R}', [('ΔP', 'pressure difference across interface', 'Pa'), ('T', 'surface tension', 'N m⁻¹'), ('R', 'radius of drop', 'm')], 'Single liquid-gas surface')
c.formula(T4, 'Excess pressure in soap bubble', r'\Delta P = \dfrac{4T}{R}', [('ΔP', 'excess pressure inside bubble', 'Pa'), ('T', 'surface tension of soap solution', 'N m⁻¹'), ('R', 'bubble radius', 'm')], 'Two interfaces: inside and outside air surfaces')
c.formula(T4, 'Capillary rise (Jurin law)', r'h = \dfrac{2T\cos\theta}{r\rho g}', [('h', 'height of liquid column', 'm'), ('T', 'surface tension', 'N m⁻¹'), ('θ', 'contact angle', 'rad or deg'), ('r', 'capillary radius', 'm'), ('ρ', 'liquid density', 'kg m⁻³')], 'Cylindrical tube, steady equilibrium')

# ---------- Questions ----------
# Topic 1
c.mcq(T1, r'The gauge pressure at a depth of $20\ \mathrm{m}$ in a lake ($\rho = 1000\ \mathrm{kg\,m^{-3}}$, $g = 10\ \mathrm{m\,s^{-2}}$) in kPa is', [('200', 200), ('100', 100), ('300', 300), ('400', 400)], 0, 1000 * 10 * 20 / 1000, 'foundation', r'$P_{\text{gauge}} = \rho g h = 1000 \times 10 \times 20\ \mathrm{Pa} = 200\ \mathrm{kPa}$.')
c.integer(T1, r'In a hydraulic lift, the piston areas are $5\ \mathrm{cm^2}$ and $250\ \mathrm{cm^2}$. A force of $40\ \mathrm{N}$ on the small piston lifts a load of (in N)', 40 * (250 // 5), 'foundation', r'$F_2 = F_1 \times (A_2 / A_1) = 40 \times (250 / 5) = 40 \times 50 = 2000\ \mathrm{N}$.')
c.mcq(T1, r'A U-tube contains mercury ($\rho = 13600\ \mathrm{kg\,m^{-3}}$). Water is poured in one arm to height $13.6\ \mathrm{cm}$. The mercury level rises in the other arm by', [('0.5 cm', 0.5), ('1.0 cm', 1.0), ('0.25 cm', 0.25), ('2.0 cm', 2.0)], 0, 0.5, 'main', r'Difference in mercury levels $h_{\text{Hg}} = (1000 \times 13.6) / 13600 = 1.0\ \mathrm{cm}$. Rise in other arm is $h_{\text{Hg}} / 2 = 0.5\ \mathrm{cm}$.')
c.multi(T1, r'Which of the following statements about hydrostatic pressure are correct?', [
    ('Pressure at a point in a static fluid is independent of orientation', True),
    ('Hydrostatic pressure depends on the total shape of the container', False),
    ('In an elevator accelerating upward with acceleration a, the pressure gradient is ρ(g + a)', True),
    ('Free surface of a liquid tilts at an angle tan θ = a/g under horizontal acceleration a', True),
], 'main', r'Hydrostatic pressure depends only on vertical depth, not on container shape.')

# Topic 2
c.mcq(T2, r'A body of density $600\ \mathrm{kg\,m^{-3}}$ floats in water ($\rho = 1000\ \mathrm{kg\,m^{-3}}$). The percentage of volume submerged is', [('60%', 60), ('40%', 40), ('75%', 75), ('50%', 50)], 0, 60, 'foundation', r'$V_{\text{sub}} / V = \rho_{\text{body}} / \rho_{\text{liquid}} = 600 / 1000 = 0.60 = 60\%$.')
c.integer(T2, r'A metallic sphere weighs $200\ \mathrm{N}$ in air and $150\ \mathrm{N}$ in water. Its relative density is', 200 // (200 - 150), 'foundation', r'$\text{Relative Density} = W_{\text{air}} / (W_{\text{air}} - W_{\text{water}}) = 200 / (200 - 150) = 200 / 50 = 4$.')
c.mcq(T2, r'A wooden block with a coin on top floats in water. If the coin slips and drops into the water, the water level will', [('decrease', 0), ('increase', 1), ('remain unchanged', 2), ('first increase then decrease', 3)], 0, 0, 'main', r'When on the block, the coin displaces water equivalent to its weight. When submerged, it displaces water equal only to its own volume ($\rho_{\text{coin}} > \rho_w$). Hence displaced volume decreases and water level falls.', tol=0)

# Topic 3
c.integer(T3, r'Water flows through a horizontal pipe of diameter $4\ \mathrm{cm}$ at $2\ \mathrm{m\,s^{-1}}$. The speed in a constriction of diameter $2\ \mathrm{cm}$ in $\mathrm{m\,s^{-1}}$ is', 2 * (4 // 2)**2, 'foundation', r'$A_1 v_1 = A_2 v_2 \implies v_2 = v_1 (d_1 / d_2)^2 = 2 \times (4/2)^2 = 8\ \mathrm{m\,s^{-1}}$.')
c.mcq(T3, r'The speed of efflux of water from an orifice $5\ \mathrm{m}$ below the surface of a deep open reservoir ($g = 9.8\ \mathrm{m\,s^{-2}}$) in $\mathrm{m\,s^{-1}}$ is closest to', [('9.9', 9.9), ('14.0', 14.0), ('7.0', 7.0), ('4.9', 4.9)], 0, round(sqrt(2 * 9.8 * 5), 1), 'foundation', r'$v = \sqrt{2gh} = \sqrt{2 \times 9.8 \times 5} = \sqrt{98} \approx 9.9\ \mathrm{m\,s^{-1}}$.')
c.integer(T3, r'A cylindrical tank of height $8\ \mathrm{m}$ is full of water. An orifice is made at depth $h$ so that the horizontal range of the jet is maximum. The depth $h$ in metres is', 8 // 2, 'main', r'Maximum range occurs when $h = H / 2 = 8 / 2 = 4\ \mathrm{m}$.')
c.mcq(T3, r'In a horizontal pipe, water flows at $2\ \mathrm{m\,s^{-1}}$ where pressure is $20\ \mathrm{kPa}$. At another point where speed is $4\ \mathrm{m\,s^{-1}}$, the pressure in kPa is', [('14', 14), ('16', 16), ('10', 10), ('18', 18)], 0, 20 - 0.5 * 1000 * (4**2 - 2**2) / 1000, 'main', r'$P_2 = P_1 - \frac{1}{2}\rho(v_2^2 - v_1^2) = 20 - 0.5 \times 1000 \times (16 - 4)/1000 = 20 - 6 = 14\ \mathrm{kPa}$.')

# Topic 4
c.mcq(T4, r'The excess pressure inside a spherical water drop of radius $1\ \mathrm{mm}$ with $T = 0.07\ \mathrm{N\,m^{-1}}$ is', [('140 Pa', 140), ('70 Pa', 70), ('280 Pa', 280), ('35 Pa', 35)], 0, 2 * 0.07 / 1e-3, 'foundation', r'$\Delta P = 2T / R = 2 \times 0.07 / 10^{-3} = 140\ \mathrm{Pa}$.')
c.integer(T4, r'The excess pressure inside a soap bubble of radius $0.5\ \mathrm{mm}$ ($T = 0.03\ \mathrm{N\,m^{-1}}$) in Pa is', round(4 * 0.03 / 0.5e-3), 'foundation', r'$\Delta P = 4T / R = 4 \times 0.03 / (0.5 \times 10^{-3}) = 240\ \mathrm{Pa}$.')
c.mcq(T4, r'Two spherical soap bubbles have radii $r$ and $2r$. The ratio of their internal excess pressures is', [('2 : 1', 2), ('1 : 2', 0.5), ('4 : 1', 4), ('1 : 4', 0.25)], 0, 2.0, 'foundation', r'$\Delta P \propto 1/R \implies \Delta P_1 / \Delta P_2 = (2r) / r = 2 : 1$.')
c.integer(T4, r'Twenty-seven small identical liquid drops coalesce to form a single big drop. If the terminal velocity of each small drop was $2\ \mathrm{cm\,s^{-1}}$, the terminal velocity of the big drop in $\mathrm{cm\,s^{-1}}$ is', 2 * (round(27**(1/3)))**2, 'main', r'$R = 27^{1/3} r = 3r$. Terminal speed $v_t \propto R^2 \implies v_{\text{new}} = 3^2 \times 2 = 18\ \mathrm{cm\,s^{-1}}$.')
c.mcq(T4, r'Water rises to height $6\ \mathrm{cm}$ in a capillary tube of radius $r$. In a tube of radius $2r$, water will rise to a height of', [('3 cm', 3), ('12 cm', 12), ('6 cm', 6), ('1.5 cm', 1.5)], 0, 3, 'foundation', r'Jurin law: $h \propto 1/r$. Doubling the radius halves the height: $6 / 2 = 3\ \mathrm{cm}$.')
c.multi(T4, r'Which of the following statements about viscosity and surface tension are correct?', [
    ('Stokes law applies to laminar flow past a spherical body', True),
    ('Terminal velocity of a spherical body falling in viscous medium is proportional to r²', True),
    ('Surface tension of liquid generally decreases with rise in temperature', True),
    ('Liquid will overflow from the top of an insufficiently long capillary tube', False),
], 'main', r'Liquid adjusts its meniscus radius of curvature rather than overflowing.')

# Videos
c.video(None, 'eW8i6A8Q3kQ', 'Fluid Mechanics Complete Chapter in One Shot | JEE Physics', 'Physics Wallah', 'revision', 'main', 'Complete marathon session covering hydrostatics, hydrodynamics, viscosity and surface tension for JEE.')
c.video(T1, 'Vb0Xg_Fv_W8', 'Fluid Statics & Pascal Law | Physics Class 11 | Mohit Tyagi', 'Mohit Tyagi', 'concept', 'foundation', 'Mathematical derivations of pressure variation with depth and accelerating fluid containers.')
c.video(T2, 'v2wK8aM8y1c', 'Archimedes Principle & Floatation | JEE Physics | Vedantu', 'Vedantu JEE', 'classroom', 'main', 'Detailed problem-solving on buoyancy, apparent weight, and multi-liquid systems.')
c.video(T3, 'k0x4L1m3Y_E', 'Bernoulli Theorem & Applications | Unacademy JEE', 'Unacademy JEE', 'classroom', 'advanced', 'Derivation of Bernoulli theorem, Torricelli efflux, and Venturimeter numericals.')
c.video(T4, 'b3A9y7R2p1Q', 'Viscosity, Stokes Law & Surface Tension | IIT JEE Physics', 'Mohit Tyagi', 'examples', 'advanced', 'Comprehensive coverage of Stokes law, terminal speed, Jurin law, and capillary ascent.')

c.dump('fluid-mechanics.json')
