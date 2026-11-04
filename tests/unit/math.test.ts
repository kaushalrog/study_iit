import { latexToReadable as m, richToReadable as rich } from '../../src/features/syllabus/math';

describe('latexToReadable', () => {
  it.each([
    ['F = G \\frac{m_1 m_2}{r^2}', 'F = G (m₁ m₂)/r²'],
    ['F = ma', 'F = ma'],
    ['\\frac{1}{2}', '1/2'],
    ['\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}', '(-b ± √(b²-4ac))/(2a)'],
    ['(a+b)^n = \\sum_{r=0}^{n} \\binom{n}{r} a^{n-r} b^r', '(a+b)ⁿ = Σᵣ₌₀ⁿ C(n, r) aⁿ⁻ʳ bʳ'],
    ['\\sin^{-1} x', 'sin⁻¹ x'],
    ['\\sin^{-1}(\\sin x) = x', 'sin⁻¹(sin x) = x'],
    ['\\sqrt{x^2+y^2}', '√(x²+y²)'],
    ['\\sqrt[3]{8} = 2', '³√8 = 2'],
    ['\\theta \\geq 30^\\circ', 'θ ≥ 30°'],
    ['\\Delta G = \\Delta H - T\\Delta S', 'ΔG = ΔH - TΔS'],
    ['r = k[A]^m[B]^n', 'r = k[A]ᵐ[B]ⁿ'],
    ['t_{1/2} = \\frac{0.693}{k}', 't_(1/2) = 0.693/k'],
    ['v = \\sqrt{\\frac{GM}{r}}', 'v = √(GM/r)'],
    ['\\text{Rate} = \\frac{\\Delta[A]}{\\Delta t}', 'Rate = (Δ[A])/Δt'],
    ['g = \\frac{G M}{R^2} \\approx 9.8 \\, \\text{m/s}^2', 'g = (G M)/R² ≈ 9.8 m/s²'],
  ])('%s -> %s', (src, want) => expect(m(src)).toBe(want));

  it('falls back to ^( ) / _( ) when a script cannot be written with unicode', () => {
    expect(m('k = A e^{-E_a/RT}')).toBe('k = A e^(-Eₐ/RT)');
    expect(m('x^{A+B}')).toBe('x^(A+B)');
  });
  it('keeps unknown commands readable and strips stray markup', () => {
    expect(m('\\foo + 1')).toBe('foo + 1');
    expect(m('$x$')).toBe('x');
    expect(m('')).toBe('');
  });
  it('never throws on malformed input', () => {
    for (const bad of ['\\frac{1}', '{{{', '}}}', '^', '_', 'x^', '\\sqrt[', '\\', 'a_{b', '\\frac{\\frac{1}{2}}{\\frac{3}{4}}', '\\left( \\right.']) {
      expect(() => m(bad)).not.toThrow();
      expect(typeof m(bad)).toBe('string');
    }
  });
  it('handles nested fractions', () => {
    expect(m('\\frac{\\frac{1}{2}}{\\frac{3}{4}}')).toBe('(1/2)/(3/4)');
  });
});

describe('richToReadable', () => {
  it('renders only the maths inside $...$, $$...$$ and \\( \\)', () => {
    expect(rich('The force is $F = G\\frac{m_1 m_2}{r^2}$ where r is the distance.')).toBe('The force is F = G (m₁ m₂)/r² where r is the distance.');
    expect(rich('Use \\(v^2 = u^2 + 2as\\) here.')).toBe('Use v² = u² + 2as here.');
    expect(rich('$$x^2$$')).toBe('x²');
  });
  it('leaves prose with a lone dollar sign alone', () => {
    expect(rich('It costs 5 dollars')).toBe('It costs 5 dollars');
    expect(rich('Price $5 only')).toBe('Price $5 only');
  });
  it('is safe on empty and undefined-like input', () => {
    expect(rich('')).toBe('');
    expect(rich(undefined as unknown as string)).toBe('');
  });
});

describe('emphasis markers', () => {
  it('drops ** and * around words but leaves multiplication and maths alone', () => {
    expect(rich('**Bold start.** Then *italic* text and (*note*).')).toBe('Bold start. Then italic text and (note).');
    expect(rich('5 * 3 = 15 and 2*4')).toBe('5 * 3 = 15 and 2*4');
    expect(rich('**Example 1 (basic).** Find $x^2$')).toBe('Example 1 (basic). Find x²');
  });
});
