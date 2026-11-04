/**
 * Offline LaTeX -> readable text. Covers what Class 9-10 IIT-foundation material uses
 * (fractions, powers, subscripts, roots, Greek, common operators) without a WebView or network.
 * Deeply nested or exotic LaTeX degrades to a linear, still-readable form; the raw LaTeX is always kept alongside.
 */
const SUP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  a: 'ᵃ', b: 'ᵇ', c: 'ᶜ', d: 'ᵈ', e: 'ᵉ', f: 'ᶠ', g: 'ᵍ', h: 'ʰ', i: 'ⁱ', j: 'ʲ', k: 'ᵏ', l: 'ˡ', m: 'ᵐ', n: 'ⁿ', o: 'ᵒ', p: 'ᵖ', r: 'ʳ', s: 'ˢ', t: 'ᵗ', u: 'ᵘ', v: 'ᵛ', w: 'ʷ', x: 'ˣ', y: 'ʸ', z: 'ᶻ',
};
const SUB: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
  a: 'ₐ', e: 'ₑ', h: 'ₕ', i: 'ᵢ', j: 'ⱼ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', o: 'ₒ', p: 'ₚ', r: 'ᵣ', s: 'ₛ', t: 'ₜ', u: 'ᵤ', v: 'ᵥ', x: 'ₓ',
};

const SYMBOLS: Record<string, string> = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'θ', iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν',
  xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', upsilon: 'υ', phi: 'φ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
  times: '×', cdot: '·', div: '÷', pm: '±', mp: '∓', le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠', approx: '≈', equiv: '≡', sim: '∼', propto: '∝',
  infty: '∞', to: '→', rightarrow: '→', leftarrow: '←', leftrightarrow: '↔', Rightarrow: '⇒', Leftarrow: '⇐', Leftrightarrow: '⇔', rightleftharpoons: '⇌', implies: '⇒',
  sum: 'Σ', prod: '∏', int: '∫', partial: '∂', nabla: '∇', degree: '°', circ: '°', angle: '∠', perp: '⊥', parallel: '∥', in: '∈', notin: '∉', subset: '⊂', cup: '∪', cap: '∩',
  forall: '∀', exists: '∃', therefore: '∴', because: '∵', ldots: '…', cdots: '⋯', dots: '…', prime: '′', hbar: 'ħ', ell: 'ℓ', quad: '  ', qquad: '    ',
  lbrace: '{', rbrace: '}', '%': '%', '&': '&', '$': '$', '#': '#', '_': '_',
};
const STYLE_CMDS = new Set(['text', 'mathrm', 'mathbf', 'mathit', 'mathsf', 'mathbb', 'mathcal', 'operatorname', 'textbf', 'textit', 'boldsymbol', 'bm', 'rm', 'vec', 'hat', 'bar', 'overline', 'underline']);
const SKIP_CMDS = new Set(['left', 'right', 'big', 'Big', 'bigg', 'Bigg', 'displaystyle', 'textstyle', 'limits', 'nolimits']);
const SPACE_CMDS = new Set([',', ';', ':', '!', ' ']);

const SCRIPTS = '\\u2070-\\u209f\\u00b2\\u00b3\\u00b9\\u1d2c-\\u1dbf';
/** Safe to leave unbracketed next to "/": a plain number, or plain letters (with scripts). Mixed like "2a" is bracketed, since x/2a is ambiguous. */
const isSimple = (x: string) => new RegExp(`^(\\d+(\\.\\d+)?[${SCRIPTS}]*|[\\p{L}\\p{M}]+[${SCRIPTS}]*)$`, 'u').test(x);

/** Operators and relations that read better with spaces around them, whatever the author typed. */
const SPACED = new Set(['±', '∓', '×', '÷', '·', '≤', '≥', '≠', '≈', '≡', '∼', '∝', '→', '←', '↔', '⇒', '⇐', '⇔', '⇌', '∈', '∉', '⊂', '∪', '∩', '∴', '∵']);

function mapScript(inner: string, table: Record<string, string>, marker: '^' | '_'): string {
  const t = inner.replace(/\s+/g, '');
  if (!t) return '';
  if (marker === '^' && t === '°') return '°';
  const chars = Array.from(t);
  if (chars.every((c) => table[c] !== undefined || Object.values(table).includes(c))) return chars.map((c) => table[c] ?? c).join('');
  return `${marker}(${inner.trim()})`;
}

/** Reads one LaTeX argument starting at i: a {...} group or a single token. Returns [raw, nextIndex]. */
function readArg(s: string, i: number): [string, number] {
  while (i < s.length && s[i] === ' ') i++;
  if (i >= s.length) return ['', i];
  if (s[i] === '{') {
    let depth = 0;
    for (let j = i; j < s.length; j++) {
      if (s[j] === '{') depth++;
      else if (s[j] === '}') { depth--; if (depth === 0) return [s.slice(i + 1, j), j + 1]; }
    }
    return [s.slice(i + 1), s.length]; // unbalanced: take the rest rather than failing
  }
  if (s[i] === '\\') {
    const m = /^\\([A-Za-z]+|.)/.exec(s.slice(i));
    return m ? [m[0], i + m[0].length] : [s[i], i + 1];
  }
  return [s[i], i + 1];
}

function render(s: string, depth = 0): string {
  if (depth > 40) return s;
  let out = '';
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === '\\') {
      const m = /^\\([A-Za-z]+|.)/.exec(s.slice(i));
      if (!m) { i++; continue; }
      const name = m[1];
      i += m[0].length;
      if (SPACE_CMDS.has(name)) { out += ' '; continue; }
      if (name === '\\') { out += ' '; continue; }
      if (SKIP_CMDS.has(name)) { if (s[i] === '.') i++; continue; }
      if (name === 'frac' || name === 'dfrac' || name === 'tfrac') {
        const [a, ia] = readArg(s, i); const [b, ib] = readArg(s, ia); i = ib;
        const num = render(a, depth + 1).trim(), den = render(b, depth + 1).trim();
        if (out && !/[\s(\[{=+\-*/×·]$/.test(out)) out += ' '; // "G\frac{..}" must not read like a call G(..)
        out += `${isSimple(num) ? num : `(${num})`}/${isSimple(den) ? den : `(${den})`}`;
        continue;
      }
      if (name === 'binom') {
        const [a, ia] = readArg(s, i); const [b, ib] = readArg(s, ia); i = ib;
        out += `C(${render(a, depth + 1).trim()}, ${render(b, depth + 1).trim()})`;
        continue;
      }
      if (name === 'sqrt') {
        let index = '';
        if (s[i] === '[') { const e = s.indexOf(']', i); if (e > 0) { index = render(s.slice(i + 1, e), depth + 1); i = e + 1; } }
        const [a, ia] = readArg(s, i); i = ia;
        const body = render(a, depth + 1).trim();
        out += `${index ? mapScript(index, SUP, '^') : ''}√${isSimple(body) ? body : `(${body})`}`;
        continue;
      }
      if (STYLE_CMDS.has(name)) { const [a, ia] = readArg(s, i); i = ia; out += render(a, depth + 1); continue; }
      if (name in SYMBOLS) { const sym = SYMBOLS[name]; out += SPACED.has(sym) ? ` ${sym} ` : sym; if (s[i] === ' ' && /[A-Za-z]/.test(name)) i++; continue; }
      out += name; // sin, cos, log, ln, lim ... keep the word
      if (/^[A-Za-z]+$/.test(name) && s[i] === ' ') { out += ' '; i++; }
      continue;
    }
    if (ch === '^' || ch === '_') {
      const [a, ia] = readArg(s, i + 1); i = ia;
      out += mapScript(render(a, depth + 1), ch === '^' ? SUP : SUB, ch);
      continue;
    }
    if (ch === '{') { const [a, ia] = readArg(s, i); i = ia; out += render(a, depth + 1); continue; }
    if (ch === '}' || ch === '$') { i++; continue; }
    if (ch === '~') { out += ' '; i++; continue; }
    out += ch; i++;
  }
  return out;
}

export function latexToReadable(latex: string): string {
  try {
    return render(latex ?? '').replace(/[ \t]+/g, ' ').trim();
  } catch {
    return latex ?? '';
  }
}

/** Lesson text may mix prose with LaTeX in $...$, $$...$$ or \( ... \). Render only the maths parts. */
export function richToReadable(text: string): string {
  return (text ?? '')
    .replace(/\$\$([^$]+)\$\$/g, (_, m) => latexToReadable(m))
    .replace(/\$([^$\n]+)\$/g, (_, m) => latexToReadable(m))
    .replace(/\\\(([^]*?)\\\)/g, (_, m) => latexToReadable(m))
    .replace(/\\\[([^]*?)\\\]/g, (_, m) => latexToReadable(m))
    // Lessons are written with light Markdown emphasis; show the words without the marker characters.
    .replace(/\*\*([^*\n][^*]*?)\*\*/g, '$1')
    .replace(/(^|[\s(])\*([^\s*][^*\n]*?)\*(?=[\s).,;:!?]|$)/g, '$1$2');
}
