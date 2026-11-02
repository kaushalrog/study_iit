/** Deterministic UUID-shaped id for seed rows so re-seeding (or seeding on two devices) never duplicates. */
export function seedId(name: string): string {
  const h = (seed: number) => {
    let x = seed >>> 0;
    for (let i = 0; i < name.length; i++) x = Math.imul(x ^ name.charCodeAt(i), 16777619) >>> 0;
    return x.toString(16).padStart(8, '0');
  };
  const hex = h(2166136261) + h(0x9e3779b1) + h(0x85ebca6b) + h(0xc2b2ae35);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

/** Random v4 UUID generated on-device. */
export function newId(): string {
  const g = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (g?.randomUUID) return g.randomUUID();
  const b = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = b.map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
