export interface TrendPoint { label: string; at: number; pct: number }

/** Percent of marks, 0–100 (negative totals clamp to 0). Null when the maximum is not positive. */
export function pctOf(total: number, max: number): number | null {
  return max > 0 ? Math.max(0, Math.min(100, Math.round((total / max) * 1000) / 10)) : null;
}

/** Oldest first; entries without a usable date or maximum are left out rather than guessed. */
export function toPoints(rows: { label: string; at: string; total: number; max: number }[]): TrendPoint[] {
  const out: TrendPoint[] = [];
  for (const r of rows) {
    const at = Date.parse(r.at);
    const pct = pctOf(r.total, r.max);
    if (Number.isFinite(at) && pct !== null) out.push({ label: r.label, at, pct });
  }
  return out.sort((a, b) => a.at - b.at);
}

/** Plain-words summary for screen readers and for the caption under the chart. */
export function describeTrend(points: TrendPoint[], noun: string): string {
  if (points.length === 0) return `No ${noun} yet.`;
  if (points.length === 1) return `One ${noun}: ${points[0].pct}% of marks. A trend needs at least two.`;
  const first = points[0].pct, last = points[points.length - 1].pct;
  const d = Math.round((last - first) * 10) / 10;
  const dir = d > 0 ? `up ${d} points` : d < 0 ? `down ${-d} points` : 'unchanged';
  return `${points.length} ${noun}s, from ${first}% to ${last}% of marks (${dir}). Best ${Math.max(...points.map((p) => p.pct))}%.`;
}
