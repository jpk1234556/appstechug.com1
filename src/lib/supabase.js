import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export async function subscribeToNewsletter(email) {
  if (!supabase) {
    return { ok: false, message: 'Newsletter signup is not configured yet.' };
  }

  const { error } = await supabase.from('newsletter_subscribers').insert({ email });
  if (error?.code === '23505') return { ok: true };
  if (error) return { ok: false, message: 'We could not save your email. Please try again.' };
  return { ok: true };
}