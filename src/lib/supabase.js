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
  if (!supabase) return { ok: false, message: 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart Vite.' };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? { ok: false, message: error.message } : { ok: true };
}

export async function signUp(email, password) {
  if (!supabase) return { ok: false, message: 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart Vite.' };
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

export async function isAdmin() {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('is_admin');
  return !error && data === true;
}

export async function getAdminOrders() {
  if (!supabase) return { ok: false, message: 'Supabase is not configured yet.' };
  const { data, error } = await supabase
    .from('orders')
    .select('id, customer_name, customer_email, customer_phone, total_amount, status, created_at, order_items(product_name, unit_price, quantity)')
    .order('created_at', { ascending: false });
  return error ? { ok: false, message: 'Orders could not be loaded.' } : { ok: true, orders: data };
}

export async function updateOrderStatus(orderId, status) {
  if (!supabase) return { ok: false, message: 'Supabase is not configured yet.' };
  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  return error ? { ok: false, message: 'Order status could not be updated.' } : { ok: true };
}

export async function getAdminUsers() {
  if (!supabase) return { ok: false, message: 'Supabase is not configured yet.' };
  const { data, error } = await supabase.from('user_profiles').select('user_id, email, role, status, created_at').order('created_at', { ascending: false });
  return error ? { ok: false, message: 'User accounts could not be loaded.' } : { ok: true, users: data };
}

export async function updateUserAccount(userId, changes) {
  if (!supabase) return { ok: false, message: 'Supabase is not configured yet.' };
  const { error } = await supabase.from('user_profiles').update(changes).eq('user_id', userId);
  return error ? { ok: false, message: 'User account could not be updated.' } : { ok: true };
}

export async function getProducts() {
  if (!supabase) return { ok: false, message: 'Supabase is not configured yet.' };
  const { data, error } = await supabase.from('products').select('id, name, amount, type, description, image_url, is_active, created_at').eq('is_active', true).order('created_at', { ascending: false });
  return error ? { ok: false, message: 'Products could not be loaded.' } : { ok: true, products: data };
}

export async function getAdminProducts() {
  if (!supabase) return { ok: false, message: 'Supabase is not configured yet.' };
  const { data, error } = await supabase.from('products').select('id, name, amount, type, description, image_url, is_active, created_at').order('created_at', { ascending: false });
  return error ? { ok: false, message: 'Products could not be loaded.' } : { ok: true, products: data };
}

export async function saveProduct(product, imageFile) {
  if (!supabase) return { ok: false, message: 'Supabase is not configured yet.' };
  let imageUrl = product.image_url || null;
  if (imageFile) {
    const extension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('product-images').upload(path, imageFile, { upsert: false, contentType: imageFile.type });
    if (uploadError) return { ok: false, message: 'Product photo could not be uploaded.' };
    imageUrl = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
  }
  const payload = { name: product.name, amount: Number(product.amount), type: product.type, description: product.description, image_url: imageUrl, is_active: product.is_active !== false };
  const query = product.id ? supabase.from('products').update(payload).eq('id', product.id).select().single() : supabase.from('products').insert(payload).select().single();
  const { data, error } = await query;
  return error ? { ok: false, message: 'Product could not be saved.' } : { ok: true, product: data };
}

export async function deleteProduct(productId) {
  if (!supabase) return { ok: false, message: 'Supabase is not configured yet.' };
  const { error } = await supabase.from('products').delete().eq('id', productId);
  return error ? { ok: false, message: 'Product could not be deleted.' } : { ok: true };
}

export async function getServices() {
  if (!supabase) return { ok: false, message: 'Supabase is not configured yet.' };
  const { data, error } = await supabase.from('service_packages').select('id, name, amount, type, description, is_active, created_at').eq('is_active', true).order('created_at', { ascending: false });
  return error ? { ok: false, message: 'Services could not be loaded.' } : { ok: true, services: data };
}

export async function getAdminServices() {
  if (!supabase) return { ok: false, message: 'Supabase is not configured yet.' };
  const { data, error } = await supabase.from('service_packages').select('id, name, amount, type, description, is_active, created_at').order('created_at', { ascending: false });
  return error ? { ok: false, message: 'Services could not be loaded.' } : { ok: true, services: data };
}

export async function saveService(service) {
  if (!supabase) return { ok: false, message: 'Supabase is not configured yet.' };
  const payload = { name: service.name, amount: Number(service.amount), type: service.type, description: service.description, is_active: service.is_active !== false };
  const query = service.id ? supabase.from('service_packages').update(payload).eq('id', service.id).select().single() : supabase.from('service_packages').insert(payload).select().single();
  const { data, error } = await query;
  return error ? { ok: false, message: 'Service could not be saved.' } : { ok: true, service: data };
}

export async function deleteService(serviceId) {
  if (!supabase) return { ok: false, message: 'Supabase is not configured yet.' };
  const { error } = await supabase.from('service_packages').delete().eq('id', serviceId);
  return error ? { ok: false, message: 'Service could not be deleted.' } : { ok: true };
}

export async function getCurrentProfile() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase.from('user_profiles').select('role, status').eq('user_id', data.user.id).maybeSingle();
  return profile;
}