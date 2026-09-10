import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthStateChange(callback) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

export async function signIn(email, password) {
  if (!supabase) return { ok: false, message: 'Login is not configured yet.' };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? { ok: false, message: error.message } : { ok: true };
}

export async function signUp(email, password) {
  if (!supabase) return { ok: false, message: 'Account creation is not configured yet.' };
  const { error } = await supabase.auth.signUp({ email, password });
  return error ? { ok: false, message: error.message } : { ok: true };
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
}

export async function subscribeToNewsletter(email) {
  if (!supabase) {
    return { ok: false, message: 'Newsletter signup is not configured yet.' };
  }

  const { error } = await supabase.from('newsletter_subscribers').insert({ email });
  if (error?.code === '23505') return { ok: true };
  if (error) return { ok: false, message: 'We could not save your email. Please try again.' };
  return { ok: true };
}

export async function createOrder(customer, items, total) {
  if (!supabase) {
    return { ok: false, message: 'Ordering is not configured yet.' };
  }

  const orderId = crypto.randomUUID();
  const { error: orderError } = await supabase
    .from('orders')
    .insert({ id: orderId, customer_name: customer.name, customer_email: customer.email, customer_phone: customer.phone, total_amount: total });
  if (orderError) return { ok: false, message: 'We could not send your order. Please try again.' };

  const orderItems = items.map((item) => ({ order_id: orderId, product_name: item.name, unit_price: item.amount, quantity: item.quantity }));
  const { error: itemError } = await supabase.from('order_items').insert(orderItems);
  if (itemError) return { ok: false, message: 'Your order could not be completed. Please try again.' };
  return { ok: true, orderId };
}