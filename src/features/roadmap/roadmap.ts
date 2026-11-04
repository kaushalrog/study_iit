import { ROADMAP, RoadmapNode, STAGES } from './syllabus';

/** What the app knows about a node. Only evidence from verified attempts ever sets a score. */
export interface NodeEvidence { linked: boolean; hasMaterial: boolean; score: number | null }
export type NodeStatus = 'no_material' | 'ready' | 'building' | 'strong';
export const STRONG = 80;
export const WEAK = 60;

export function nodeStatus(e: NodeEvidence | undefined): NodeStatus {
  if (!e || !e.linked) return 'no_material';
  if (e.score === null) return 'ready';
  return e.score >= STRONG ? 'strong' : 'building';
}

export type PrereqState = 'met' | 'unchecked' | 'weak';
export interface PrereqInfo { node: RoadmapNode; state: PrereqState }

/** Prerequisites never lock anything. They only tell the student what to revise or check first. */
export function prereqInfo(node: RoadmapNode, ev: Record<string, NodeEvidence>, all: RoadmapNode[] = ROADMAP): PrereqInfo[] {
  return node.prereqs.map((k) => all.find((x) => x.key === k)).filter((x): x is RoadmapNode => !!x).map((p) => {
    const s = ev[p.key]?.score;
    return { node: p, state: s == null ? 'unchecked' : s >= WEAK ? 'met' : 'weak' };
  });
}

export interface StageProgress { stage: number; total: number; withMaterial: number; assessed: number; strong: number }
export function stageProgress(ev: Record<string, NodeEvidence>, all: RoadmapNode[] = ROADMAP): StageProgress[] {
  return STAGES.map((s) => {
    const nodes = all.filter((x) => x.stage === s.n);
    const st = nodes.map((x) => nodeStatus(ev[x.key]));
    return { stage: s.n, total: nodes.length, withMaterial: st.filter((x) => x !== 'no_material').length, assessed: st.filter((x) => x === 'building' || x === 'strong').length, strong: st.filter((x) => x === 'strong').length };
  });
}

export interface Goal { kind: 'revise' | 'learn'; node: RoadmapNode; reason: string }
/**
 * A few manageable goals for this week, from what she has in her library: first revise weak prerequisites of the topics she
 * is on, then continue topics that are not yet strong, lowest stage first. No dates are invented.
 */
export function weeklyGoals(ev: Record<string, NodeEvidence>, max = 3, all: RoadmapNode[] = ROADMAP): Goal[] {
  const goals: Goal[] = [];
  const seen = new Set<string>();
  const active = all.filter((x) => { const s = nodeStatus(ev[x.key]); return s === 'ready' || s === 'building'; }).sort((a, b) => a.stage - b.stage);
  for (const a of active) {
    for (const p of prereqInfo(a, ev, all)) {
      if (p.state === 'weak' && !seen.has(p.node.key)) { seen.add(p.node.key); goals.push({ kind: 'revise', node: p.node, reason: `Your ${p.node.title.toLowerCase()} is below ${WEAK}%, and ${a.title} builds on it.` }); }
    }
  }
  for (const a of active) {
    if (seen.has(a.key)) continue;
    seen.add(a.key);
    goals.push({ kind: 'learn', node: a, reason: nodeStatus(ev[a.key]) === 'ready' ? 'In your library, not assessed yet. Start with a short quiz after the lesson.' : 'Assessed but not yet strong. Practise the weakest part.' });
  }
  return goals.slice(0, max);
}
