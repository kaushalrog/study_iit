// POST /functions/v1/tutor  (JWT required)
// Body: { task, message, context?: { subject, chapter, topic, lessonExcerpt, level, recentPerformance }, language: 'en'|'te', history?: [{role,content}], imageDataUrl? }
import { createClient } from 'npm:@supabase/supabase-js@2';
import { ChatMessage, complete, ProviderError } from '../_shared/provider.ts';
import { PROMPT_VERSION, Task, TASK_INSTRUCTIONS, TUTOR_SYSTEM } from '../_shared/prompts.ts';

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, content-type, apikey',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'content-type': 'application/json' } });
const TASKS = Object.keys(TASK_INSTRUCTIONS);
const clip = (s: unknown, n: number) => (typeof s === 'string' ? s.slice(0, n) : '');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  // Authenticate: only a signed-in student may spend AI budget.
  const auth = req.headers.get('authorization') ?? '';
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { authorization: auth } } });
  const { data: user, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user?.user) return json({ error: 'unauthorized' }, 401);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: 'bad_json' }, 400); }
  const task = body.task as Task;
  if (!TASKS.includes(task)) return json({ error: 'unknown_task' }, 400);
  const message = clip(body.message, 4000);
  if (!message && !body.imageDataUrl) return json({ error: 'empty_message' }, 400);
  const language = body.language === 'te' ? 'te' : 'en';

  // Only the context needed for this request is accepted, and it is length-limited.
  const c = (body.context ?? {}) as Record<string, unknown>;
  const contextBlock = [
    c.subject && `Subject: ${clip(c.subject, 60)}`,
    c.chapter && `Chapter: ${clip(c.chapter, 120)}`,
    c.topic && `Topic: ${clip(c.topic, 120)}`,
    c.level && `Level: ${clip(c.level, 20)}`,
    c.recentPerformance && `Recent performance on this topic: ${clip(c.recentPerformance, 300)}`,
    c.lessonExcerpt && `Verified lesson material (prefer this):\n${clip(c.lessonExcerpt, 3000)}`,
  ].filter(Boolean).join('\n');

  const history = Array.isArray(body.history) ? (body.history as ChatMessage[]).slice(-8).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' as const : 'user' as const, content: clip(m.content, 2000),
  })) : [];

  const messages: ChatMessage[] = [
    { role: 'system', content: `${TUTOR_SYSTEM}\n\nTask: ${TASK_INSTRUCTIONS[task]}\nReply language: ${language === 'te' ? 'Telugu (keep technical terms in English)' : 'simple English'}.${contextBlock ? `\n\nContext:\n${contextBlock}` : ''}` },
    ...history,
    { role: 'user', content: message || 'Read the question in the image.', imageUrl: typeof body.imageDataUrl === 'string' ? body.imageDataUrl : undefined },
  ];

  try {
    const out = await complete(messages, { maxTokens: task === 'solve' ? 1800 : 1200 });
    return json({
      text: out.text,
      meta: {
        generated: true,
        // Provider success is NOT mathematical verification.
        verified: false,
        task, language, promptVersion: PROMPT_VERSION, model: out.model, provider: out.provider,
        sources: c.lessonExcerpt ? ['supplied-lesson'] : [],
      },
    });
  } catch (e) {
    if (e instanceof ProviderError) return json({ error: 'ai_unavailable', detail: e.message }, e.status);
    return json({ error: 'internal' }, 500);
  }
});
