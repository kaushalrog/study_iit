import { z } from 'zod';
import { cloudConfigured, supabase } from '../supabase/client';

export type TutorTask = 'explain' | 'solve' | 'hint' | 'similar' | 'translate_te' | 'ocr' | 'classify_mistake' | 'revision' | 'summary';

export interface TutorContext {
  subject?: string; chapter?: string; topic?: string; level?: 'foundation' | 'main' | 'advanced';
  lessonExcerpt?: string; recentPerformance?: string;
}

const responseSchema = z.object({
  text: z.string().min(1),
  meta: z.object({ generated: z.literal(true), verified: z.boolean(), task: z.string(), language: z.string(), promptVersion: z.string() }).passthrough(),
});
export type TutorResponse = z.infer<typeof responseSchema>;

export type TutorFailure = 'not_configured' | 'not_signed_in' | 'offline' | 'unavailable' | 'bad_response';
export class TutorError extends Error { constructor(public code: TutorFailure, message: string) { super(message); } }

export const TUTOR_ERROR_COPY: Record<TutorFailure, string> = {
  not_configured: 'The AI tutor is not connected yet. Lessons, practice and the Error Book still work.',
  not_signed_in: 'Sign in to use the AI tutor.',
  offline: 'You are offline. The AI tutor needs internet; everything else still works.',
  unavailable: 'The AI tutor is unavailable right now. Please try again in a moment.',
  bad_response: 'The tutor sent back something unreadable. Please try again.',
};

export async function askTutor(input: { task: TutorTask; message: string; language: 'en' | 'te'; context?: TutorContext; history?: { role: 'user' | 'assistant'; content: string }[]; imageDataUrl?: string }): Promise<TutorResponse> {
  if (!cloudConfigured || !supabase) throw new TutorError('not_configured', TUTOR_ERROR_COPY.not_configured);
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new TutorError('not_signed_in', TUTOR_ERROR_COPY.not_signed_in);
  const { data: out, error } = await supabase.functions.invoke('tutor', { body: input });
  if (error) {
    const offline = /fetch|network/i.test(error.message);
    throw new TutorError(offline ? 'offline' : 'unavailable', TUTOR_ERROR_COPY[offline ? 'offline' : 'unavailable']);
  }
  const parsed = responseSchema.safeParse(out);
  if (!parsed.success) throw new TutorError('bad_response', TUTOR_ERROR_COPY.bad_response);
  // Whatever the server says, nothing generated is shown as verified by this client.
  return { ...parsed.data, meta: { ...parsed.data.meta, verified: false } };
}
