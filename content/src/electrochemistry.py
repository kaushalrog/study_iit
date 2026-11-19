from math import log10
from lib import Chapter, approx

c = Chapter('Electrochemistry')
T1 = c.topic('Electrolytic conductance, Kohlrausch’s law, and molar conductivity')
T2 = c.topic('Galvanic cells, electrode potentials, and electrochemical series')
T3 = c.topic('Nernst equation, cell EMF, and Gibbs free energy')
T4 = c.topic('Faraday’s laws of electrolysis, batteries, and corrosion')

# ---------- overview ----------
c.lesson(None, 'introduction', 'foundation', r"""
**What this chapter is about.** Electrochemistry is the study of the interconversion of chemical energy and electrical energy. It encompasses two primary regimes: **galvanic (voltaic) cells**, which generate spontaneous electrical energy from chemical reactions ($\Delta G < 0$), and **electrolytic cells**, which utilize external electrical energy to drive non-spontaneous chemical transformations ($\Delta G > 0$).

**Prerequisites.** (1) Redox reactions: oxidation states, balancing half-reactions. (2) Chemical equilibrium: reaction quotient $Q$ and equilibrium constant $K_c$. (3) Thermodynamics: Gibbs free energy change ($\Delta G = \Delta H - T\Delta S$).

**Topic path.** Electrolytic conductance, conductivity, cell constant, and Kohlrausch's law of independent ion migration → galvanic cells, standard electrode potentials, IUPAC cell conventions, and electrochemical series → Nernst equation for half-cells and full cells, concentration cells, and thermodynamic relations ($\Delta G^\circ = -nFE^\circ_{\text{cell}}$) → Faraday's laws of electrolysis, industrial electrolysis, commercial batteries, and corrosion.
""")

c.lesson(None, 'why_it_matters', 'main', r"""
In JEE Main and Advanced, Electrochemistry is one of the highest-weight chapters in Physical Chemistry. Examination questions routinely integrate Nernst equation calculations with equilibrium constants, solubility product ($K_{\text{sp}}$), and acid-base buffer solutions. Understanding the distinction between intensive properties ($E^\circ_{\text{cell}}$ does NOT multiply by stoichiometric coefficients) and extensive properties ($\Delta G^\circ$ DOES scale with $n$) is the most critical hurdle for scoring top marks.
""")

# ---------- Topic 1 ----------
c.lesson(T1, 'introduction', 'foundation', r"""
**Electrolytic Conductance.**
The flow of electricity through an electrolyte solution occurs via the migration of ions.
- Resistance: $R = \rho \dfrac{l}{A}$ (unit: $\Omega$).
- Conductance: $G = \dfrac{1}{R} = \dfrac{1}{\rho}\dfrac{A}{l} = \kappa \dfrac{A}{l}$ (unit: Siemens, $\mathrm{S} = \Omega^{-1} = \text{mho}$).
- Conductivity (Specific Conductance) $\kappa$: $\kappa = G \left(\dfrac{l}{A}\right) = \dfrac{1}{R} \left(\dfrac{l}{A}\right)$ (unit: $\mathrm{S\,m^{-1}}$ or $\mathrm{S\,cm^{-1}}$).
- Cell Constant $G^*$: $G^* = \dfrac{l}{A} = R \times \kappa$.
""")

c.lesson(T1, 'explanation', 'foundation', r"""
**Molar Conductivity ($\Lambda_m$).**
Molar conductivity is the conducting power of all ions produced by dissolving one mole of electrolyte in solution:
$$\Lambda_m = \dfrac{\kappa}{C} = \dfrac{1000 \times \kappa}{M},$$
where $\kappa$ is in $\mathrm{S\,cm^{-1}}$, $M$ is molarity in $\mathrm{mol\,L^{-1}}$, and $\Lambda_m$ is in $\mathrm{S\,cm^2\,mol^{-1}}$.
*Variation with dilution:*
- As solution is diluted (concentration decreases), conductivity $\kappa$ **decreases** because the number of current-carrying ions per unit volume decreases.
- Molar conductivity $\Lambda_m$ **increases** with dilution because the total volume $V$ containing 1 mole of electrolyte expands dramatically, facilitating greater ionic mobility.
""")

c.lesson(T1, 'derivation', 'main', r"""
**Debye-Hückel-Onsager Equation and Kohlrausch's Law.**
For strong electrolytes, $\Lambda_m$ increases linearly with $\sqrt{C}$:
$$\Lambda_m = \Lambda_m^\circ - A\sqrt{C},$$
where $\Lambda_m^\circ$ is the limiting molar conductivity at infinite dilution.
For weak electrolytes, dissociation is incomplete, so $\Lambda_m$ increases asymptotically and $\Lambda_m^\circ$ cannot be obtained by linear extrapolation.

**Kohlrausch's Law of Independent Migration of Ions:**
At infinite dilution, each ion contributes a definite amount to the total molar conductivity irrespective of the nature of the co-ion:
$$\Lambda_m^\circ(A_x B_y) = x\,\lambda^\circ(A^{y+}) + y\,\lambda^\circ(B^{x-}).$$
**Applications:**
1. Determining $\Lambda_m^\circ$ of weak electrolytes (e.g. $\mathrm{CH_3COOH}$ using $\mathrm{CH_3COONa}$, $\mathrm{HCl}$, and $\mathrm{NaCl}$).
2. Degree of dissociation: $\alpha = \dfrac{\Lambda_m}{\Lambda_m^\circ}$.
3. Dissociation constant of weak acid: $K_a = \dfrac{C\alpha^2}{1 - \alpha} = \dfrac{C\Lambda_m^2}{\Lambda_m^\circ(\Lambda_m^\circ - \Lambda_m)}$.
""")

c.lesson(T1, 'example', 'foundation', r"""
**Example 1.** If the resistance of a conductivity cell filled with $0.1\ \mathrm{M}\ \mathrm{KCl}$ is $100\ \Omega$ and its conductivity is $1.29\ \mathrm{S\,m^{-1}}$, find the cell constant.
*Solution.*
$$G^* = R \times \kappa = 100\ \Omega \times 1.29\ \mathrm{m^{-1}} = 129\ \mathrm{m^{-1}} = 1.29\ \mathrm{cm^{-1}}.$$
""")

c.lesson(T1, 'example', 'main', r"""
**Example 2.** Calculate $\Lambda_m^\circ$ for $\mathrm{CH_3COOH}$ given:
$\Lambda_m^\circ(\mathrm{CH_3COONa}) = 91.0$, $\Lambda_m^\circ(\mathrm{HCl}) = 426.0$, $\Lambda_m^\circ(\mathrm{NaCl}) = 126.0\ \mathrm{S\,cm^2\,mol^{-1}}$.
*Solution.*
By Kohlrausch's law:
$$\Lambda_m^\circ(\mathrm{CH_3COOH}) = \Lambda_m^\circ(\mathrm{CH_3COONa}) + \Lambda_m^\circ(\mathrm{HCl}) - \Lambda_m^\circ(\mathrm{NaCl})$$
$$\Lambda_m^\circ(\mathrm{CH_3COOH}) = 91.0 + 426.0 - 126.0 = 391.0\ \mathrm{S\,cm^2\,mol^{-1}}.$$
""")

c.lesson(T1, 'common_mistakes', 'foundation', r"""
*Unit Trap:* Mixing $\mathrm{cm}$ and $\mathrm{m}$ in $\Lambda_m$. If $\kappa$ is in $\mathrm{S\,cm^{-1}}$ and $C$ in $\mathrm{mol\,L^{-1}}$, $\Lambda_m = \dfrac{1000 \kappa}{C}\ \mathrm{S\,cm^2\,mol^{-1}}$. If $\kappa$ is in $\mathrm{S\,m^{-1}}$ and $C$ in $\mathrm{mol\,m^{-3}}$, $\Lambda_m = \dfrac{\kappa}{C}\ \mathrm{S\,m^2\,mol^{-1}}$.
""")

c.lesson(T1, 'tips', 'main', r"""
*Pro-tip:* Molar conductivity of $\mathrm{H}^+$ and $\mathrm{OH}^-$ ions is unusually high in aqueous solution due to the Grotthuss proton-hopping mechanism across hydrogen-bonded water networks.
""")

c.lesson(T1, 'summary', 'foundation', r"""
$\kappa = (1/R)(l/A)$. $\Lambda_m = 1000\kappa/M$. $\kappa$ falls with dilution; $\Lambda_m$ rises. Kohlrausch's law: $\Lambda_m^\circ = \nu_+ \lambda_+^\circ + \nu_- \lambda_-^\circ$. $\alpha = \Lambda_m / \Lambda_m^\circ$.
""")

# ---------- Topic 2 ----------
c.lesson(T2, 'introduction', 'foundation', r"""
**Galvanic Cells and Half-Reactions.**
A galvanic cell (such as the Daniell cell) produces electricity from a spontaneous redox reaction.
- **Anode:** Electrode where oxidation occurs ($\text{loss of electrons}$). In galvanic cells, the anode is assigned negative polarity.
- **Cathode:** Electrode where reduction occurs ($\text{gain of electrons}$). In galvanic cells, the cathode is assigned positive polarity.
- **Mnemonic:** **AN OX** (Anode: Oxidation), **RED CAT** (Reduction: Cathode).
""")

c.lesson(T2, 'explanation', 'foundation', r"""
**Cell Representation and Salt Bridge.**
IUPAC Cell notation (Daniell cell):
$$\mathrm{Zn(s)\ |\ Zn^{2+}(aq)\ ||\ Cu^{2+}(aq)\ |\ Cu(s)}$$
- Single vertical bar $|$: phase boundary.
- Double vertical bar $||$: salt bridge.
- Anode is written on the left, cathode on the right.

**Functions of the Salt Bridge:**
1. Completes the internal electrical circuit by allowing ionic migration.
2. Maintains electrical neutrality in both half-cell solutions without bulk mixing.
Contains an inert electrolyte ($\mathrm{KCl}$, $\mathrm{KNO_3}$, or $\mathrm{NH_4NO_3}$) in agar-agar jelly, where ionic mobilities of cation and anion are nearly identical (to minimise liquid junction potential).
""")

c.lesson(T2, 'derivation', 'main', r"""
**Standard Electrode Potential ($E^\circ$).**
By IUPAC convention, "electrode potential" without qualification refers to the standard **reduction potential**.
The reference standard is the **Standard Hydrogen Electrode (SHE)**, whose potential is assigned $E^\circ = 0.00\ \mathrm{V}$ at all temperatures:
$$\mathrm{2H^+(aq, 1\ M) + 2e^- \rightleftharpoons H_2(g, 1\ bar)},\quad E^\circ = 0.00\ \mathrm{V}.$$
The standard cell potential is:
$$E^\circ_{\text{cell}} = E^\circ_{\text{cathode}} - E^\circ_{\text{anode}} = E^\circ_{\text{right}} - E^\circ_{\text{left}}.$$
A redox reaction is spontaneous under standard conditions if and only if $E^\circ_{\text{cell}} > 0$.
""")

c.lesson(T2, 'example', 'foundation', r"""
**Example 1.** Given standard reduction potentials: $E^\circ(\mathrm{Zn^{2+}/Zn}) = -0.76\ \mathrm{V}$ and $E^\circ(\mathrm{Cu^{2+}/Cu}) = +0.34\ \mathrm{V}$. Find $E^\circ_{\text{cell}}$ for the Daniell cell.
*Solution.*
Copper undergoes reduction (cathode) and Zinc undergoes oxidation (anode):
$$E^\circ_{\text{cell}} = E^\circ_{\text{cathode}} - E^\circ_{\text{anode}} = +0.34 - (-0.76) = +1.10\ \mathrm{V}.$$
""")

c.lesson(T2, 'example', 'main', r"""
**Example 2.** Can copper displace zinc from $\mathrm{ZnSO_4}$ solution?
*Solution.* The hypothetical reaction is $\mathrm{Cu + Zn^{2+} \to Cu^{2+} + Zn}$.
Here copper would be anode and zinc cathode:
$$E^\circ_{\text{cell}} = E^\circ(\mathrm{Zn^{2+}/Zn}) - E^\circ(\mathrm{Cu^{2+}/Cu}) = -0.76 - (+0.34) = -1.10\ \mathrm{V} < 0.$$
Since $E^\circ_{\text{cell}} < 0$, the reaction is non-spontaneous. Copper cannot displace zinc.
""")

c.lesson(T2, 'common_mistakes', 'foundation', r"""
*Trap:* Multiplying $E^\circ$ by stoichiometric coefficients when balancing reactions. $E^\circ$ is an **intensive property** and depends only on chemical potential per unit charge, not on the quantity of material.
""")

c.lesson(T2, 'tips', 'main', r"""
*Electrochemical Series Rule:* The more negative the reduction potential, the stronger the reducing agent (e.g. $\mathrm{Li}$ has the most negative potential, strongest reducer). The more positive the reduction potential, the stronger the oxidising agent (e.g. $\mathrm{F_2}$ has $+2.87\ \mathrm{V}$, strongest oxidiser).
""")

c.lesson(T2, 'summary', 'foundation', r"""
Anode = oxidation (-), Cathode = reduction (+). $E^\circ_{\text{cell}} = E^\circ_{\text{cathode}} - E^\circ_{\text{anode}}$. Spontaneous when $E^\circ_{\text{cell}} > 0$. Salt bridge maintains charge neutrality.
""")

# ---------- Topic 3 ----------
c.lesson(T3, 'introduction', 'foundation', r"""
**The Nernst Equation.**
When half-cells or full cells operate under non-standard conditions (concentrations $\ne 1\ \mathrm{M}$, pressures $\ne 1\ \mathrm{bar}$), the cell potential $E_{\text{cell}}$ is given by the Nernst equation:
$$E = E^\circ - \dfrac{RT}{nF} \ln Q,$$
where $n$ is the number of moles of electrons transferred in the balanced equation, $F = 96485 \approx 96500\ \mathrm{C\,mol^{-1}}$ is Faraday's constant, and $Q$ is the reaction quotient.
At $298\ \mathrm{K}$ ($25^\circ\mathrm{C}$), $\dfrac{2.303 RT}{F} = 0.0591\ \mathrm{V}$:
$$E_{\text{cell}} = E^\circ_{\text{cell}} - \dfrac{0.0591}{n} \log_{10} Q.$$
""")

c.lesson(T3, 'explanation', 'main', r"""
**Thermodynamic Relations: Free Energy and Equilibrium.**
Electrical work done by a reversible galvanic cell equals the decrease in Gibbs free energy:
$$\Delta G = -n F E_{\text{cell}},\qquad \Delta G^\circ = -n F E^\circ_{\text{cell}}.$$
- If $E_{\text{cell}} > 0 \implies \Delta G < 0$ (spontaneous process).
- If $E_{\text{cell}} = 0 \implies \Delta G = 0$ (cell at equilibrium; battery is "dead").
At equilibrium, $E_{\text{cell}} = 0$ and $Q = K_c$:
$$0 = E^\circ_{\text{cell}} - \dfrac{0.0591}{n}\log_{10} K_c \implies \log_{10} K_c = \dfrac{n E^\circ_{\text{cell}}}{0.0591}\quad (\text{at } 298\ \mathrm{K}).$$
""")

c.lesson(T3, 'derivation', 'main', r"""
**Concentration Cells.**
A concentration cell consists of two identical electrodes dipping into solutions of the same electrolyte at different concentrations ($C_1$ and $C_2$):
$$\mathrm{M(s)\ |\ M^{n+}(C_1)\ ||\ M^{n+}(C_2)\ |\ M(s)}$$
Because both electrodes are identical, $E^\circ_{\text{cell}} = E^\circ - E^\circ = 0$.
The Nernst equation yields:
$$E_{\text{cell}} = 0 - \dfrac{0.0591}{n} \log_{10}\dfrac{C_1}{C_2} = \dfrac{0.0591}{n}\log_{10}\dfrac{C_2}{C_1}.$$
For spontaneity ($E_{\text{cell}} > 0$), we must have $C_2 > C_1$. Electrons flow spontaneously to equalise concentration.
""")

c.lesson(T3, 'example', 'foundation', r"""
**Example 1.** Calculate the potential of a zinc electrode dipping into $0.01\ \mathrm{M}\ \mathrm{Zn^{2+}}$ solution at $298\ \mathrm{K}$ ($E^\circ = -0.76\ \mathrm{V}$).
*Solution.* Reaction: $\mathrm{Zn^{2+} + 2e^- \to Zn(s)}$, so $n = 2$.
$$E = E^\circ - \dfrac{0.0591}{2}\log_{10}\dfrac{1}{[\mathrm{Zn^{2+}}]} = -0.76 - 0.02955 \log_{10}(10^2) = -0.76 - 0.02955(2) = -0.819\ \mathrm{V}.$$
""")

c.lesson(T3, 'example', 'main', r"""
**Example 2.** Calculate the equilibrium constant $K_c$ at $298\ \mathrm{K}$ for the Daniell cell ($E^\circ = 1.10\ \mathrm{V}$, $n = 2$).
*Solution.*
$$\log_{10} K_c = \dfrac{n E^\circ}{0.0591} = \dfrac{2 \times 1.10}{0.0591} \approx 37.225 \implies K_c \approx 1.7 \times 10^{37}.$$
This enormous equilibrium constant demonstrates that the displacement goes virtually to completion.
""")

c.lesson(T3, 'common_mistakes', 'foundation', r"""
*Trap:* Omitting powers of stoichiometric coefficients when writing $Q$ in the Nernst equation (e.g. in $\mathrm{2Ag^+ + Cu \to 2Ag + Cu^{2+}}$, $Q = [\mathrm{Cu^{2+}}] / [\mathrm{Ag^+}]^2$).
""")

c.lesson(T3, 'tips', 'main', r"""
*Sign check:* Increasing reactant concentration always increases $E_{\text{cell}}$ (shifts reaction forward). Increasing product concentration always decreases $E_{\text{cell}}$.
""")

c.lesson(T3, 'summary', 'foundation', r"""
$E = E^\circ - (0.0591/n)\log Q$ at 298 K. $\Delta G^\circ = -nFE^\circ$. $\log K_c = nE^\circ / 0.0591$. Concentration cell: $E^\circ = 0$.
""")

# ---------- Topic 4 ----------
c.lesson(T4, 'introduction', 'foundation', r"""
**Electrolysis and Faraday's Laws.**
Electrolysis is the process of decomposing an electrolyte by passing an electric current through its molten state or aqueous solution.
- **Cathode:** Connected to the negative terminal of the external battery (cations reduced here).
- **Anode:** Connected to the positive terminal of the external battery (anions oxidised here).
""")

c.lesson(T4, 'explanation', 'foundation', r"""
**Faraday's Laws of Electrolysis:**
**First Law:** The mass $m$ of any substance deposited or liberated at an electrode is directly proportional to the quantity of electricity $Q$ passed:
$$m \propto Q \implies m = Z Q = Z I t,$$
where $I$ is current (amperes), $t$ is time (seconds), and $Z$ is the **electrochemical equivalent** ($\mathrm{g\,C^{-1}}$).

**Second Law:** When the same quantity of electricity is passed through different electrolyte solutions connected in series, the masses of substances liberated are directly proportional to their chemical equivalent weights ($E$):
$$\dfrac{m_1}{m_2} = \dfrac{E_1}{E_2}.$$
Since $1$ mole of electrons carries $F \approx 96500\ \mathrm{C}$, the charge to liberate 1 equivalent is $1\ F$, giving $Z = \dfrac{E}{96500}$.
""")

c.lesson(T4, 'derivation', 'main', r"""
**Quantitative Electrolysis Calculations.**
For a half-reaction: $\mathrm{M^{n+} + n e^- \to M(s)}$.
Deposition of 1 mole of $\mathrm{M}$ (molar mass $M$) requires $n$ moles of electrons ($n F$ coulombs).
$$\text{Moles of metal deposited} = \dfrac{I \times t}{n \times 96500} \implies m = \dfrac{M \times I \times t}{n \times 96500}.$$
For gaseous products (e.g. $\mathrm{O_2, H_2, Cl_2}$), volume at STP ($V_0$):
$$\text{Moles of gas} = \dfrac{I t}{n \times 96500} \implies V_{\text{STP}} = \text{Moles} \times 22.4\ \mathrm{L}.$$
""")

c.lesson(T4, 'example', 'foundation', r"""
**Example 1.** A current of $2.0\ \mathrm{A}$ is passed through a $\mathrm{CuSO_4}$ solution for $16\ \mathrm{minutes}\ 5\ \mathrm{seconds}$ ($965\ \mathrm{s}$). Find the mass of copper deposited ($M = 63.5\ \mathrm{g\,mol^{-1}}$, $n = 2$).
*Solution.*
$$m = \dfrac{M \times I \times t}{n \times 96500} = \dfrac{63.5 \times 2.0 \times 965}{2 \times 96500} = \dfrac{63.5 \times 1930}{193000} = \dfrac{63.5}{100} = 0.635\ \mathrm{g}.$$
""")

c.lesson(T4, 'example', 'main', r"""
**Example 2 (Batteries & Fuel Cells).**
- **Lead Storage Battery (Secondary Cell):**
  - Anode: $\mathrm{Pb(s) + SO_4^{2-} \to PbSO_4(s) + 2e^-}$
  - Cathode: $\mathrm{PbO_2(s) + 4H^+ + SO_4^{2-} + 2e^- \to PbSO_4(s) + 2H_2O}$
  - Overall discharge: $\mathrm{Pb + PbO_2 + 2H_2SO_4 \to 2PbSO_4 + 2H_2O}$. Density of $\mathrm{H_2SO_4}$ drops from $\sim 1.30$ to $< 1.15\ \mathrm{g\,cm^{-3}}$.
- **$\mathrm{H_2}$-$\mathrm{O_2}$ Fuel Cell:** Converts energy of combustion directly into electricity with high thermodynamic efficiency ($\sim 70\%$).
""")

c.lesson(T4, 'common_mistakes', 'foundation', r"""
*Trap:* Forgetting to convert time into seconds before using $Q = I t$, or using atomic mass instead of equivalent weight $E = M/n$.
""")

c.lesson(T4, 'tips', 'main', r"""
*Corrosion (Rusting of iron):* Rusting is an electrochemical phenomenon. Iron acts as anode ($\mathrm{Fe \to Fe^{2+} + 2e^-}$), and dissolved oxygen in water droplet acts as cathode ($\mathrm{O_2 + 4H^+ + 4e^- \to 2H_2O}$). Rust is hydrated ferric oxide $\mathrm{Fe_2O_3 \cdot x H_2O}$.
""")

c.lesson(T4, 'summary', 'foundation', r"""
Faraday's laws: $m = ZIt = (M/nF)It$. $1\ F = 96500\ \mathrm{C\,mol^{-1}}$. Lead battery discharge consumes $\mathrm{H_2SO_4}$. Fuel cells achieve high efficiency.
""")

# ---------- Formulas ----------
c.formula(T1, 'Conductivity and cell constant', r'\kappa = \dfrac{1}{R} \left(\dfrac{l}{A}\right) = G \cdot G^*', [('κ', 'conductivity', 'S m⁻¹ or S cm⁻¹'), ('R', 'measured resistance', 'Ω'), ('l/A', 'cell constant G*', 'm⁻¹ or cm⁻¹'), ('G', 'conductance', 'S')], 'Uniform cross-section conductivity cell')
c.formula(T1, 'Molar conductivity', r'\Lambda_m = \dfrac{1000 \kappa}{M}', [('Λ_m', 'molar conductivity', 'S cm² mol⁻¹'), ('κ', 'conductivity', 'S cm⁻¹'), ('M', 'molar concentration', 'mol L⁻¹')], 'In aqueous solution')
c.formula(T1, 'Kohlrausch law of independent ionic migration', r'\Lambda_m^\circ = \nu_+ \lambda_+^\circ + \nu_- \lambda_-^\circ', [('Λ_m°', 'limiting molar conductivity at infinite dilution', 'S cm² mol⁻¹'), ('ν₊, ν₋', 'stoichiometric number of cations and anions per formula unit', None), ('λ₊°, λ₋°', 'limiting molar conductivities of individual ions', 'S cm² mol⁻¹')], 'Infinite dilution (zero ionic interaction)')
c.formula(T1, 'Degree of dissociation of weak electrolyte', r'\alpha = \dfrac{\Lambda_m}{\Lambda_m^\circ}', [('α', 'degree of dissociation', None), ('Λ_m', 'molar conductivity at concentration c', 'S cm² mol⁻¹'), ('Λ_m°', 'limiting molar conductivity', 'S cm² mol⁻¹')], 'Weak electrolyte, Ostwald dilution')
c.formula(T2, 'Standard cell potential', r'E^\circ_{\text{cell}} = E^\circ_{\text{cathode}} - E^\circ_{\text{anode}}', [('E°_cell', 'standard EMF of galvanic cell', 'V'), ('E°_cathode', 'standard reduction potential of cathode', 'V'), ('E°_anode', 'standard reduction potential of anode', 'V')], 'Standard state: 1 M concentrations, 1 bar pressures, specified T')
c.formula(T3, 'Nernst equation at 298 K', r'E_{\text{cell}} = E^\circ_{\text{cell}} - \dfrac{0.0591}{n} \log_{10} Q', [('E_cell', 'cell potential under actual conditions', 'V'), ('E°_cell', 'standard cell potential', 'V'), ('n', 'moles of electrons transferred', None), ('Q', 'reaction quotient', None)], 'Temperature = 298.15 K')
c.formula(T3, 'Gibbs free energy and cell EMF', r'\Delta G^\circ = -n F E^\circ_{\text{cell}}', [('ΔG°', 'standard Gibbs free energy change', 'J mol⁻¹'), ('n', 'moles of electrons', None), ('F', 'Faraday constant, 96485', 'C mol⁻¹'), ('E°_cell', 'standard cell potential', 'V')], 'Reversible thermodynamic process')
c.formula(T3, 'Equilibrium constant from standard EMF', r'\log_{10} K_c = \dfrac{n E^\circ_{\text{cell}}}{0.0591}', [('K_c', 'chemical equilibrium constant', None), ('n', 'electrons transferred', None), ('E°_cell', 'standard cell EMF', 'V')], 'Cell at equilibrium (E_cell = 0) at 298 K')
c.formula(T4, 'Faraday first law of electrolysis', r'm = \dfrac{M \cdot I \cdot t}{n \cdot 96500}', [('m', 'mass of product liberated', 'g'), ('M', 'molar mass of substance', 'g mol⁻¹'), ('I', 'electric current', 'A'), ('t', 'duration of electrolysis', 's'), ('n', 'valency / electrons per atom or molecule', None)], 'Faraday constant F ≈ 96500 C mol⁻¹')

# ---------- Questions ----------
# Topic 1
c.mcq(T1, r'The unit of molar conductivity is', [('S cm² mol⁻¹', 0), ('S cm⁻¹', 1), ('S cm mol⁻¹', 2), ('S⁻¹ cm² mol⁻¹', 3)], 0, 0, 'foundation', r'Conductivity $\kappa$ in $\mathrm{S\,cm^{-1}}$ divided by concentration in $\mathrm{mol\,cm^{-3}}$ gives $\mathrm{S\,cm^2\,mol^{-1}}$.', tol=0)
c.integer(T1, r'The resistance of a $0.05\ \mathrm{M}\ \mathrm{NaOH}$ solution in a cell of cell constant $0.5\ \mathrm{cm^{-1}}$ is $100\ \Omega$. Its molar conductivity in $\mathrm{S\,cm^2\,mol^{-1}}$ is', round(1000 * (0.5 / 100) / 0.05), 'foundation', r'$\kappa = G^* / R = 0.5 / 100 = 0.005\ \mathrm{S\,cm^{-1}}$. $\Lambda_m = 1000 \times 0.005 / 0.05 = 100\ \mathrm{S\,cm^2\,mol^{-1}}$.')
c.mcq(T1, r'Given $\Lambda_m^\circ$ values for $\mathrm{Ba(OH)_2}$, $\mathrm{BaCl_2}$, and $\mathrm{NH_4Cl}$ are $500, 280,$ and $130\ \mathrm{S\,cm^2\,mol^{-1}}$. The $\Lambda_m^\circ$ for $\mathrm{NH_4OH}$ is', [('240', 240), ('350', 350), ('480', 480), ('180', 180)], 0, 130 + 0.5 * 500 - 0.5 * 280, 'main', r'$\Lambda_m^\circ(\mathrm{NH_4OH}) = \Lambda_m^\circ(\mathrm{NH_4Cl}) + \frac{1}{2}\Lambda_m^\circ(\mathrm{Ba(OH)_2}) - \frac{1}{2}\Lambda_m^\circ(\mathrm{BaCl_2}) = 130 + 250 - 140 = 240\ \mathrm{S\,cm^2\,mol^{-1}}$.')
c.multi(T1, r'Which of the following statements regarding electrolytic conductance are correct?', [
    ('Conductivity κ decreases with dilution', True),
    ('Molar conductivity Λm increases with dilution', True),
    ('Equivalent conductivity of strong electrolytes follows the Debye-Hückel-Onsager equation', True),
    ('Kohlrausch law applies only to strong electrolytes and fails for weak electrolytes', False),
], 'main', r'Kohlrausch law applies universally to all electrolytes at infinite dilution.')

# Topic 2
c.mcq(T2, r'For the Daniell cell $\mathrm{Zn | Zn^{2+} || Cu^{2+} | Cu}$, $E^\circ(\mathrm{Zn^{2+}/Zn}) = -0.76\ \mathrm{V}$ and $E^\circ(\mathrm{Cu^{2+}/Cu}) = +0.34\ \mathrm{V}$. The standard cell EMF is', [('1.10 V', 1.10), ('0.42 V', 0.42), ('-1.10 V', -1.10), ('-0.42 V', -0.42)], 0, 0.34 - (-0.76), 'foundation', r'$E^\circ_{\text{cell}} = E^\circ_{\text{cathode}} - E^\circ_{\text{anode}} = 0.34 - (-0.76) = 1.10\ \mathrm{V}$.')
c.mcq(T2, r'Which of the following metals is the strongest reducing agent in aqueous solution?', [('Li', 0), ('Na', 1), ('K', 2), ('Mg', 3)], 0, 0, 'foundation', r'Lithium has the most negative standard reduction potential ($-3.05\ \mathrm{V}$) due to exceptionally high hydration enthalpy of $\mathrm{Li}^+$.', tol=0)
c.integer(T2, r'For a cell reaction $\mathrm{Fe + Cu^{2+} \to Fe^{2+} + Cu}$ with $E^\circ(\mathrm{Fe^{2+}/Fe}) = -0.44\ \mathrm{V}$ and $E^\circ(\mathrm{Cu^{2+}/Cu}) = +0.34\ \mathrm{V}$, the value of $100 \times E^\circ_{\text{cell}}$ in volts is', round(100 * (0.34 - (-0.44))), 'foundation', r'$E^\circ_{\text{cell}} = 0.34 - (-0.44) = 0.78\ \mathrm{V}$. $100 \times 0.78 = 78$.')

# Topic 3
c.mcq(T3, r'For $\mathrm{Zn + Cu^{2+}(0.01\ M) \to Zn^{2+}(0.1\ M) + Cu}$ with $E^\circ = 1.10\ \mathrm{V}$, the cell potential at $298\ \mathrm{K}$ is closest to', [('1.07 V', 1.07), ('1.13 V', 1.13), ('1.10 V', 1.10), ('1.04 V', 1.04)], 0, round(1.10 - (0.0591 / 2) * log10(0.1 / 0.01), 2), 'main', r'$Q = [\mathrm{Zn^{2+}}] / [\mathrm{Cu^{2+}}] = 0.1 / 0.01 = 10$. $E = 1.10 - (0.0591/2)\log_{10}(10) = 1.10 - 0.0295 = 1.07\ \mathrm{V}$.')
c.integer(T3, r'The standard Gibbs free energy change $\Delta G^\circ$ for a cell with $n = 2$ and $E^\circ_{\text{cell}} = 1.0\ \mathrm{V}$ (using $F = 96500\ \mathrm{C\,mol^{-1}}$) in kJ mol⁻¹ is (magnitude)', round(2 * 96500 * 1.0 / 1000), 'foundation', r'$|\Delta G^\circ| = nFE^\circ = 2 \times 96500 \times 1.0 = 193{,}000\ \mathrm{J} = 193\ \mathrm{kJ}$.')
c.mcq(T3, r'In a concentration cell $\mathrm{Cu | Cu^{2+}(0.001\ M) || Cu^{2+}(0.1\ M) | Cu}$ at $298\ \mathrm{K}$, the cell EMF in volts is closest to', [('0.059 V', 0.059), ('0.0295 V', 0.0295), ('0.118 V', 0.118), ('0.000 V', 0.000)], 0, round((0.0591 / 2) * log10(0.1 / 0.001), 3), 'main', r'$E = (0.0591/2)\log_{10}(0.1 / 0.001) = 0.02955 \times 2 = 0.0591\ \mathrm{V}$.')

# Topic 4
c.integer(T4, r'The charge in Coulombs required for the reduction of $1\ \mathrm{mole}$ of $\mathrm{Al^{3+}}$ to $\mathrm{Al}$ is $x \times 10^3\ \mathrm{C}$ ($F = 96500$). Find $x$ (nearest integer).', round(3 * 96500 / 1000), 'foundation', r'$\mathrm{Al^{3+} + 3e^- \to Al}$. $Q = 3 F = 3 \times 96500 = 289{,}500\ \mathrm{C} = 290 \times 10^3\ \mathrm{C}$.')
c.mcq(T4, r'A current of $9.65\ \mathrm{A}$ is passed through molten $\mathrm{MgCl_2}$ for $1000\ \mathrm{s}$. The mass of magnesium deposited ($M = 24\ \mathrm{g\,mol^{-1}}$) is', [('1.2 g', 1.2), ('2.4 g', 2.4), ('0.6 g', 0.6), ('4.8 g', 4.8)], 0, 24 * 9.65 * 1000 / (2 * 96500), 'foundation', r'$m = M I t / (n F) = 24 \times 9.65 \times 1000 / (2 \times 96500) = 24 \times 9650 / 193000 = 24 / 20 = 1.2\ \mathrm{g}$.')
c.integer(T4, r'During the discharge of a lead storage battery, the number of Faradays of electricity required to consume $1\ \mathrm{mole}$ of $\mathrm{PbO_2}$ is', 2, 'main', r'$\mathrm{PbO_2 + 4H^+ + SO_4^{2-} + 2e^- \to PbSO_4 + 2H_2O}$. 2 moles of electrons = 2 Faradays.')
c.multi(T4, r'Which of the following statements regarding batteries and electrolysis are correct?', [
    ('During discharge of a lead storage battery, sulfuric acid is consumed and water is produced', True),
    ('In a hydrogen-oxygen fuel cell, the theoretical thermodynamic efficiency is high', True),
    ('Rusting of iron is accelerated in presence of dissolved salts in water', True),
    ('In an electrolytic cell, the anode is connected to the negative terminal of the DC source', False),
], 'main', r'In an electrolytic cell, the anode is connected to the positive terminal of the power supply.')

# Videos
c.video(None, 'hN1x8S2P9jE', 'Electrochemistry Complete Chapter in One Shot | JEE Main & Advanced', 'Physics Wallah', 'revision', 'main', 'Comprehensive one-shot revision covering conductance, galvanic cells, Nernst equation, and electrolysis.')
c.video(T1, 'bF3j7Z9xL8c', 'Conductance & Kohlrausch Law | Class 12 Chemistry | Mohit Tyagi', 'Mohit Tyagi', 'concept', 'foundation', 'Mathematical derivations of cell constant, specific conductivity, and Kohlrausch applications.')
c.video(T2, 'Q7mK2s8W4rE', 'Galvanic Cells, EMF & Electrochemical Series | Vedantu JEE', 'Vedantu JEE', 'classroom', 'main', 'In-depth conceptual study of standard electrode potentials, salt bridge mechanics, and spontaneity.')
c.video(T3, 'V6p0R8t1Y9x', 'Nernst Equation & Thermodynamic Calculations | Unacademy JEE', 'Unacademy JEE', 'classroom', 'advanced', 'Numerical mastery on Nernst equation, reaction quotients, and Gibbs free energy relations.')
c.video(T4, 'D5x9L2m4W1q', 'Faraday Laws of Electrolysis & Batteries | IIT JEE Chemistry', 'Chem Curious', 'examples', 'main', 'Quantitative numericals on Faraday first and second laws, commercial accumulators, and fuel cells.')

c.dump('electrochemistry.json')
