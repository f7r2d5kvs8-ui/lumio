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
export async function signInWithGoogle() {
  if (!lumioSupabase) return { data: null, error: offlineError() };
  if (!/^https?:$/.test(window.location.protocol)) return { data: null, error: new Error('Google sign-in is available in the online version of Lumio.') };
  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  return lumioSupabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
}
export async function signOut() { return lumioSupabase ? lumioSupabase.auth.signOut() : { error: null }; }

export async function deleteAccount() {
  if (!lumioSupabase) return { data: null, error: offlineError() };
  return lumioSupabase.functions.invoke('delete-account', { method: 'POST', body: {} });
}

export async function readProgress(userId, languageId, activity) {
  if (!lumioSupabase) return [];
  const { data, error } = await lumioSupabase
    .from('user_progress')
    .select('level,word_index,completed,updated_at')
    .eq('user_id', userId)
    .eq('language_id', languageId)
    .eq('activity', activity);
  if (error) throw error;
  return data || [];
}

export async function writeProgress(userId, languageId, activity, level, wordIndex, completed) {
  if (!lumioSupabase) return;
  const { error } = await lumioSupabase.from('user_progress').upsert(
    { user_id: userId, language_id: languageId, activity, level, word_index: wordIndex, completed, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,language_id,activity,level' }
  );
  if (error) throw error;
}
