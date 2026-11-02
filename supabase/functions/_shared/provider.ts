// Provider-independent LLM client. Configure with AI_PROVIDER, AI_MODEL, AI_API_KEY, AI_BASE_URL.
// Keys exist only in the function environment (supabase secrets set ...), never in the mobile app.

export interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string; imageUrl?: string }
export interface ProviderResult { text: string; model: string; provider: string }

export class ProviderError extends Error {
  constructor(message: string, public status = 502) { super(message); }
}

export async function complete(messages: ChatMessage[], opts: { maxTokens?: number; temperature?: number } = {}): Promise<ProviderResult> {
  const provider = (Deno.env.get('AI_PROVIDER') ?? '').toLowerCase();
  const model = Deno.env.get('AI_MODEL');
  const apiKey = Deno.env.get('AI_API_KEY');
  const baseUrl = Deno.env.get('AI_BASE_URL');
  if (!provider || !model || !apiKey) {
    throw new ProviderError('AI is not configured on the server (AI_PROVIDER, AI_MODEL, AI_API_KEY).', 503);
  }
  const maxTokens = opts.maxTokens ?? 1200;
  const temperature = opts.temperature ?? 0.3;

  if (provider === 'anthropic') {
    const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n');
    const body = {
      model, max_tokens: maxTokens, temperature, system,
      messages: messages.filter((m) => m.role !== 'system').map((m) => ({
        role: m.role,
        content: m.imageUrl
          ? [{ type: 'image', source: dataUrlToSource(m.imageUrl) }, { type: 'text', text: m.content }]
          : m.content,
      })),
    };
    const r = await fetch(`${baseUrl ?? 'https://api.anthropic.com'}/v1/messages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new ProviderError(`Provider error ${r.status}`, r.status === 429 ? 429 : 502);
    const j = await r.json();
    return { text: (j.content ?? []).map((c: { text?: string }) => c.text ?? '').join(''), model, provider };
  }

  // Default: OpenAI-compatible chat completions (OpenAI, Groq, Together, Ollama, vLLM, ...).
  const r = await fetch(`${baseUrl ?? 'https://api.openai.com/v1'}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model, max_tokens: maxTokens, temperature,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.imageUrl ? [{ type: 'image_url', image_url: { url: m.imageUrl } }, { type: 'text', text: m.content }] : m.content,
      })),
    }),
  });
  if (!r.ok) throw new ProviderError(`Provider error ${r.status}`, r.status === 429 ? 429 : 502);
  const j = await r.json();
  return { text: j.choices?.[0]?.message?.content ?? '', model, provider };
}

function dataUrlToSource(url: string) {
  const m = /^data:(.+?);base64,(.+)$/.exec(url);
  if (!m) throw new ProviderError('Images must be sent as base64 data URLs.', 400);
  return { type: 'base64', media_type: m[1], data: m[2] };
}
