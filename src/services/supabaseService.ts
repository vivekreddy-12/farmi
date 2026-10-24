import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, Order } from '../types';

export interface FarmerProfileRow {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  farm_name: string | null;
  location: string | null;
  kisan_id: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';

export function rowToUserProfile(row: Partial<FarmerProfileRow>, isLoggedIn = true): UserProfile {
  return {
    id: row.id || 'guest',
    name: row.full_name || 'Farmer',
    email: row.email || '',
    phone: row.phone || '',
    farmName: row.farm_name || 'My Farmstead',
    location: row.location || 'Select Location',
    avatar: row.avatar_url || DEFAULT_AVATAR,
    isLoggedIn,
    memberSince: row.created_at
      ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : 'October 2026',
    kisanId: row.kisan_id || `FARMIN-${(row.id || '1000').slice(0, 4).toUpperCase()}`,
    role: row.role || 'Verified Grower',
  };
}

/**
 * Loads a farmer profile from Supabase by user ID.
 */
export async function fetchFarmerProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[farmin] fetchFarmerProfile warning:', error.message);
      return null;
    }
    if (!data) return null;
    return rowToUserProfile(data, true);
  } catch (err) {
    console.error('[farmin] fetchFarmerProfile exception:', err);
    return null;
  }
}

/**
 * Saves or updates farmer profile details in the database.
 */
export async function saveFarmerProfile(
  profile: Partial<UserProfile> & { id: string }
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const updatePayload: Record<string, any> = {
      id: profile.id,
      updated_at: new Date().toISOString(),
    };
    if (profile.name !== undefined) updatePayload.full_name = profile.name;
    if (profile.email !== undefined) updatePayload.email = profile.email;
    if (profile.phone !== undefined) updatePayload.phone = profile.phone;
    if (profile.farmName !== undefined) updatePayload.farm_name = profile.farmName;
    if (profile.location !== undefined) updatePayload.location = profile.location;
    if (profile.kisanId !== undefined) updatePayload.kisan_id = profile.kisanId;
    if (profile.avatar !== undefined) updatePayload.avatar_url = profile.avatar;
    if (profile.role !== undefined) updatePayload.role = profile.role;

    const { error } = await supabase.from('profiles').upsert(updatePayload);
    if (error) {
      console.error('[farmin] saveFarmerProfile error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[farmin] saveFarmerProfile exception:', err);
    return false;
  }
}

/**
 * Fetches all orders placed by the authenticated farmer.
 */
export async function fetchFarmerOrders(farmerId: string): Promise<Order[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('[farmin] fetchFarmerOrders error:', error?.message);
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      orderNumber: row.order_number || `ORD-${row.id.slice(0, 6).toUpperCase()}`,
      date: new Date(row.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      status: 'Completed',
      statusBadge: 'Delivered',
      statusColor: 'text-[#84CC16]',
      statusClass: 'bg-[#84CC16]/10 text-[#84CC16] border-[#84CC16]/30',
      badgeClass: 'bg-[#84CC16]/10 text-[#84CC16] border-[#84CC16]/30',
      itemsCount: Array.isArray(row.items)
        ? row.items.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0)
        : 1,
      total: Number(row.total_amount) || 0,
      icon: 'inventory_2',
      items: row.items || [],
      destination: row.delivery_address || 'Farm Gate',
      trackingNumber: `TRK-${row.order_number || row.id.slice(0, 8)}`,
      estimatedDelivery: 'Delivered',
    }));
  } catch (err) {
    console.error('[farmin] fetchFarmerOrders exception:', err);
    return [];
  }
}

/**
 * Stores a placed order in Supabase.
 */
export async function saveFarmerOrder(order: Order, farmerId?: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('orders').insert({
      order_number: order.orderNumber,
      farmer_id: farmerId && farmerId !== 'guest' ? farmerId : null,
      items: order.items,
      total_amount: order.total,
      delivery_address: order.destination,
      payment_status: order.paymentDetails?.status || 'Paid',
    });

    if (error) {
      console.error('[farmin] saveFarmerOrder error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[farmin] saveFarmerOrder exception:', err);
    return false;
  }
}

/**
 * Sign in using email & password with Supabase Auth.
 */
export async function signInFarmerWithEmail(email: string, password: string) {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured yet. Add VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY to Vercel/env.'
    );
  }
  return await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
}

/**
 * Sign up a new farmer account with Supabase Auth and save profile.
 */
export async function registerFarmerWithEmail(
  email: string,
  password: string,
  profileData: {
    name: string;
    phone?: string;
    farmName?: string;
    cropType?: string;
  }
) {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured yet. Add VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY to Vercel/env.'
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: profileData.name,
        phone: profileData.phone,
        farm_name: profileData.farmName,
        crop_type: profileData.cropType,
      },
    },
  });

  if (error) throw error;

  if (data?.user) {
    await saveFarmerProfile({
      id: data.user.id,
      name: profileData.name,
      email: email.trim(),
      phone: profileData.phone || '',
      farmName: profileData.farmName || 'My Farmstead',
      location: 'Select Location',
      role: `Grower (${profileData.cropType || 'Commercial'})`,
      avatar: DEFAULT_AVATAR,
    });
  }

  return data;
}

/**
 * Sign in with Google OAuth using Supabase Auth.
 */
export async function signInFarmerWithGoogle() {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured yet. Add VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY to Vercel/env.'
    );
  }
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
}

/**
 * Dispatches an SMS OTP for phone authentication.
 */
export async function sendFarmerPhoneOtp(phone: string) {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured yet. Add VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY to Vercel/env.'
    );
  }
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone.slice(-10)}`;
  return await supabase.auth.signInWithOtp({
    phone: formattedPhone,
  });
}

/**
 * Verifies SMS OTP code.
 */
export async function verifyFarmerPhoneOtp(phone: string, token: string) {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase is not configured yet. Add VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY to Vercel/env.'
    );
  }
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone.slice(-10)}`;
  return await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token,
    type: 'sms',
  });
}

/**
 * Sign out the currently logged in farmer.
 */
export async function signOutFarmer() {
  if (!isSupabaseConfigured) return;
  return await supabase.auth.signOut();
}

/**
 * Sends a password reset email via Supabase.
 */
export async function sendPasswordReset(email: string) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured yet.');
  }
  return await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}`,
  });
}
