import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://qmtzmlpgsvtietkqgwnb.supabase.co';
const publishableKey = 'sb_publishable_5gaVlwMu1tNVDqYjp0Fy0Q_vekCjHjT';
export const lumioSupabase = createClient ? createClient(supabaseUrl, publishableKey) : null;

const offlineError = () => new Error('Online aanmelden is tijdelijk niet beschikbaar. Je kunt als gast spelen.');

export async function currentSession() {
  if (!lumioSupabase) return null;
  const { data, error } = await lumioSupabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signUp(email, password) { return lumioSupabase ? lumioSupabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } }) : { data: { session: null, user: null }, error: offlineError() }; }
export async function signIn(email, password) { return lumioSupabase ? lumioSupabase.auth.signInWithPassword({ email, password }) : { data: { session: null, user: null }, error: offlineError() }; }
export async function signOut() { return lumioSupabase ? lumioSupabase.auth.signOut() : { error: null }; }

export async function readProgress(userId) {
  if (!lumioSupabase) return [];
  const { data, error } = await lumioSupabase.from('user_progress').select('level,word_index,completed,updated_at').eq('user_id', userId);
  if (error) throw error;
  return data || [];
}

export async function writeProgress(userId, level, wordIndex, completed) {
  if (!lumioSupabase) return;
  const { error } = await lumioSupabase.from('user_progress').upsert({ user_id: userId, level, word_index: wordIndex, completed, updated_at: new Date().toISOString() }, { onConflict: 'user_id,level' });
  if (error) throw error;
}
