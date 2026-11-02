import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const cloudConfigured = Boolean(url && anon);

/** null in local-only mode: the app works fully offline and says so honestly. */
export const supabase: SupabaseClient | null = cloudConfigured
  ? createClient(url!, anon!, { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } })
  : null;
