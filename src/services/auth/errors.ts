/** Turn a Supabase auth failure into a short message a 14-year-old can act on. Never echoes server internals. */
export function describeAuthError(e: { message?: string; status?: number } | null | undefined): string {
  const m = (e?.message ?? '').toLowerCase();
  if (e?.status === 429 || m.includes('rate limit') || m.includes('too many')) return 'Too many tries. Wait a minute and try again.';
  if (m.includes('invalid login') || m.includes('invalid credentials') || e?.status === 400) return 'That email or password is not right.';
  if (m.includes('email not confirmed')) return 'This email has not been confirmed yet. Ask the person who set up ORBIT to confirm it.';
  if (m.includes('network') || m.includes('fetch') || m.includes('timeout') || m.includes('failed to')) return "Can't reach the server. Check your internet and try again.";
  return 'Could not sign in. Please try again.';
}

export function validateCredentials(email: string, password: string): { email?: string; password?: string } {
  const out: { email?: string; password?: string } = {};
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) out.email = 'Enter the email address you were given.';
  if (password.length === 0) out.password = 'Enter your password.';
  return out;
}
