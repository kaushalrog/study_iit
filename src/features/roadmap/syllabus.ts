import type { SubjectKey } from '../exam-engine/types';

/**
 * ORBIT's suggested preparation order. This is a planning aid, NOT the official JEE syllabus: stages and prerequisites are
 * editable here without touching any screen. Stage is independent of school class. A node links to a chapter by title once
 * the student has that chapter in her library; unlinked nodes are honest placeholders ("no material yet").
 */
export interface Stage { n: number; name: string; blurb: string }
export const STAGES: Stage[] = [
  { n: 1, name: 'Foundation and mathematical thinking', blurb: 'Number sense, algebra, units and the tools every later topic uses.' },
  { n: 2, name: 'Core foundations', blurb: 'Equations, functions, trigonometry, geometry, the mole concept and periodic ideas.' },
  { n: 3, name: 'Advanced school-level problem solving', blurb: 'Series, binomial theorem, coordinate geometry, counting, kinematics, atomic structure and bonding.' },
  { n: 4, name: 'JEE-oriented Class 11 preparation', blurb: 'Mechanics, thermodynamics, oscillations, organic foundations, equilibrium and calculus beginnings.' },
  { n: 5, name: 'JEE-oriented Class 12 preparation', blurb: 'Calculus, 3D geometry, electricity and magnetism, optics, modern physics, solutions, kinetics, electrochemistry and the p/d/f blocks.' },
  { n: 6, name: 'Full-syllabus preparation', blurb: 'Mixed-topic work across everything. Builds on evidence from stages 1 to 5.' },
  { n: 7, name: 'Intensive mocks, revision and final preparation', blurb: 'Full-length mocks, error-book revision, exam strategy.' },
];

export interface RoadmapNode { key: string; subject: SubjectKey; area: string; title: string; stage: number; prereqs: string[]; chapter?: string }

const n = (key: string, subject: SubjectKey, area: string, title: string, stage: number, prereqs: string[] = [], chapter?: string): RoadmapNode =>
  ({ key, subject, area, title, stage, prereqs, chapter });

export const ROADMAP: RoadmapNode[] = [
  // Mathematics
  n('m-number', 'math', 'Algebra', 'Number systems', 1),
  n('m-algebra', 'math', 'Algebra', 'Algebra', 1, ['m-number']),
  n('m-equations', 'math', 'Algebra', 'Equations and inequalities', 2, ['m-algebra']),
  n('m-functions', 'math', 'Algebra', 'Functions', 2, ['m-algebra']),
  n('m-trig', 'math', 'Trigonometry', 'Trigonometry', 2, ['m-algebra']),
  n('m-geometry', 'math', 'Geometry', 'Geometry', 2, ['m-number']),
  n('m-invtrig', 'math', 'Trigonometry', 'Inverse trigonometric functions', 3, ['m-trig', 'm-functions'], 'Inverse Trigonometry'),
  n('m-series', 'math', 'Algebra', 'Sequences and series', 3, ['m-algebra']),
  n('m-binomial', 'math', 'Algebra', 'Binomial theorem', 3, ['m-algebra', 'm-pnc'], 'Binomial Theorem'),
  n('m-coord', 'math', 'Coordinate geometry', 'Coordinate geometry', 3, ['m-algebra', 'm-geometry']),
  n('m-pnc', 'math', 'Counting', 'Permutations and combinations', 3, ['m-algebra']),
  n('m-prob', 'math', 'Counting', 'Probability', 3, ['m-pnc']),
  n('m-matrices', 'math', 'Algebra', 'Matrices and determinants', 4, ['m-algebra']),
  n('m-vectors', 'math', 'Vectors', 'Vectors', 4, ['m-trig', 'm-coord']),
  n('m-limits', 'math', 'Calculus', 'Limits', 4, ['m-functions']),
  n('m-continuity', 'math', 'Calculus', 'Continuity and differentiability', 4, ['m-limits']),
  n('m-diffcalc', 'math', 'Calculus', 'Differential calculus', 5, ['m-continuity']),
  n('m-intcalc', 'math', 'Calculus', 'Integral calculus', 5, ['m-diffcalc']),
  n('m-3d', 'math', 'Vectors', 'Three-dimensional geometry', 5, ['m-vectors', 'm-coord']),
  // Physics
  n('p-units', 'physics', 'Foundations', 'Units and dimensions', 1),
  n('p-tools', 'physics', 'Foundations', 'Mathematical tools for physics', 1, ['m-algebra']),
  n('p-vectors', 'physics', 'Foundations', 'Vectors in physics', 2, ['p-tools', 'm-trig']),
  n('p-kinematics', 'physics', 'Mechanics', 'Kinematics', 3, ['p-vectors']),
  n('p-gravitation', 'physics', 'Mechanics', 'Gravitation', 3, ['p-vectors', 'p-units'], 'Gravitation'),
  n('p-lom', 'physics', 'Mechanics', 'Laws of motion', 4, ['p-kinematics']),
  n('p-wep', 'physics', 'Mechanics', 'Work, energy and power', 4, ['p-lom']),
  n('p-com', 'physics', 'Mechanics', 'Centre of mass', 4, ['p-wep']),
  n('p-rotation', 'physics', 'Mechanics', 'Rotational motion', 4, ['p-com']),
  n('p-matter', 'physics', 'Properties of matter', 'Properties of matter', 4, ['p-lom']),
  n('p-thermo', 'physics', 'Heat', 'Thermodynamics', 4, ['p-wep']),
  n('p-waves', 'physics', 'Waves', 'Oscillations and waves', 4, ['p-lom', 'm-trig']),
  n('p-electrostatics', 'physics', 'Electricity', 'Electrostatics', 5, ['p-vectors', 'm-intcalc']),
  n('p-current', 'physics', 'Electricity', 'Current electricity', 5, ['p-electrostatics']),
  n('p-magnetism', 'physics', 'Electricity', 'Magnetism', 5, ['p-current', 'm-vectors']),
  n('p-emi', 'physics', 'Electricity', 'Electromagnetic induction', 5, ['p-magnetism']),
  n('p-ac', 'physics', 'Electricity', 'Alternating current', 5, ['p-emi']),
  n('p-optics', 'physics', 'Optics', 'Optics', 5, ['m-trig']),
  n('p-modern', 'physics', 'Modern physics', 'Modern physics', 5, ['p-electrostatics']),
  n('p-semi', 'physics', 'Modern physics', 'Semiconductors', 5, ['p-modern', 'p-current']),
  // Chemistry
  n('c-mole', 'chemistry', 'Physical chemistry', 'Mole concept', 2, ['m-algebra']),
  n('c-periodic', 'chemistry', 'Inorganic chemistry', 'Periodic classification', 2),
  n('c-atomic', 'chemistry', 'Physical chemistry', 'Atomic structure', 3, ['c-mole']),
  n('c-bonding', 'chemistry', 'Inorganic chemistry', 'Chemical bonding', 3, ['c-atomic', 'c-periodic']),
  n('c-states', 'chemistry', 'Physical chemistry', 'States of matter', 4, ['c-mole']),
  n('c-thermo', 'chemistry', 'Physical chemistry', 'Chemical thermodynamics', 4, ['c-mole', 'p-thermo']),
  n('c-equilibrium', 'chemistry', 'Physical chemistry', 'Chemical equilibrium', 4, ['c-mole']),
  n('c-ionic', 'chemistry', 'Physical chemistry', 'Ionic equilibrium', 4, ['c-equilibrium']),
  n('c-goc', 'chemistry', 'Organic chemistry', 'General organic chemistry', 4, ['c-bonding']),
  n('c-isomerism', 'chemistry', 'Organic chemistry', 'Structural representation and isomerism', 4, ['c-goc']),
  n('c-hydrocarbons', 'chemistry', 'Organic chemistry', 'Hydrocarbons', 4, ['c-goc']),
  n('c-kinetics', 'chemistry', 'Physical chemistry', 'Chemical kinetics', 5, ['c-mole', 'm-diffcalc'], 'Chemical Kinetics'),
  n('c-solutions', 'chemistry', 'Physical chemistry', 'Solutions', 5, ['c-mole']),
  n('c-electro', 'chemistry', 'Physical chemistry', 'Electrochemistry', 5, ['c-equilibrium']),
  n('c-coord', 'chemistry', 'Inorganic chemistry', 'Coordination compounds', 5, ['c-bonding']),
  n('c-pblock', 'chemistry', 'Inorganic chemistry', 'p-block elements', 5, ['c-bonding', 'c-periodic']),
  n('c-dfblock', 'chemistry', 'Inorganic chemistry', 'd- and f-block elements', 5, ['c-coord']),
  n('c-mechanisms', 'chemistry', 'Organic chemistry', 'Reaction mechanisms', 4, ['c-goc']),
  n('c-functional', 'chemistry', 'Organic chemistry', 'Functional groups and transformations', 5, ['c-mechanisms', 'c-hydrocarbons']),
];
