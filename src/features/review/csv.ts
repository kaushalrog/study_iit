/** Minimal RFC-4180 style CSV: quoted fields, doubled quotes, commas and newlines inside quotes. */
export function toCsv(rows: string[][]): string {
  const cell = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return rows.map((r) => r.map((c) => cell(c ?? '')).join(',')).join('\n') + '\n';
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cur = '', quoted = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') { if (src[i + 1] === '"') { cur += '"'; i++; } else quoted = false; } else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cur); cur = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(cur); cur = '';
      if (row.some((c) => c.length > 0) || row.length > 1) rows.push(row);
      row = [];
    } else cur += ch;
  }
  if (cur.length > 0 || row.length > 0) { row.push(cur); if (row.some((c) => c.length > 0)) rows.push(row); }
  return rows;
}
