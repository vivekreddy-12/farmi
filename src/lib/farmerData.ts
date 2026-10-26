import type { Order, UserProfile } from '../types';
import {
  rest,
  sendPasswordReset as sbSendPasswordReset,
  sendPhoneOtp as sbSendPhoneOtp,
  signInWithPassword,
  signUpWithPassword,
  verifyPhoneOtp as sbVerifyPhoneOtp,
  type AuthUser,
} from './supabase';

/** Row shape of public.profiles */
interface ProfileRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  farm_name: string | null;
  location: string | null;
  crop_type: string | null;
  avatar: string | null;
  kisan_id: string | null;
  role: string | null;
  created_at: string;
}

interface OrderRow {
  data: Order;
}

function monthYear(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function rowToProfile(row: ProfileRow, authUser: AuthUser): UserProfile {
  return {
    id: row.id,
    name: row.name || authUser.email?.split('@')[0] || 'Farmer',
    email: row.email || authUser.email || '',
    phone: row.phone || authUser.phone || '',
    farmName: row.farm_name || 'My Farmstead',
    location: row.location || 'Select Location',
    avatar: row.avatar || '',
    isLoggedIn: true,
    memberSince: monthYear(row.created_at),
    kisanId: row.kisan_id || undefined,
    role: row.role || undefined,
  };
}

/** Normalises an Indian mobile number to "+91 XXXXXXXXXX". Returns '' if there are no digits. */
export function formatIndianPhone(input: string): string {
  const digits = input.replace(/[^0-9]/g, '').slice(-10);
  return digits ? `+91 ${digits}` : '';
}

/** E.164 form for SMS providers: +91XXXXXXXXXX */
function toE164(input: string): string {
  const digits = input.replace(/[^0-9]/g, '').slice(-10);
  return `+91${digits}`;
}

/**
 * Loads the signed-in farmer's profile. A database trigger creates the row at
 * sign-up; if it is missing (e.g. an account created before the trigger
 * existed) it is created here.
 */
export async function ensureProfile(authUser: AuthUser): Promise<UserProfile> {
  const rows = await rest<ProfileRow[]>(`/profiles?id=eq.${encodeURIComponent(authUser.id)}&select=*`);
  if (rows.length > 0) return rowToProfile(rows[0], authUser);

  const meta = authUser.user_metadata ?? {};
  // ignore-duplicates: if the sign-up trigger (or another tab) created it first, keep that row.
  await rest('/profiles?on_conflict=id', {
    method: 'POST',
    prefer: 'resolution=ignore-duplicates,return=minimal',
    body: {
      id: authUser.id,
      name: String(meta.name || meta.full_name || authUser.email?.split('@')[0] || 'Farmer'),
      email: authUser.email ?? null,
      phone: authUser.phone ?? (meta.phone ? String(meta.phone) : null),
      farm_name: meta.farm_name ? String(meta.farm_name) : 'My Farmstead',
      crop_type: meta.crop_type ? String(meta.crop_type) : null,
    },
  });
  const created = await rest<ProfileRow[]>(`/profiles?id=eq.${encodeURIComponent(authUser.id)}&select=*`);
  if (created.length === 0) throw new Error('Your farmer profile could not be created. Please try again.');
  return rowToProfile(created[0], authUser);
}

/** Saves edits from the Grower Profile form. Returns the stored profile. */
export async function updateProfile(authUser: AuthUser, updated: UserProfile): Promise<UserProfile> {
  const location = updated.location === 'Select Location' ? '' : updated.location;
  const rows = await rest<ProfileRow[]>(`/profiles?id=eq.${encodeURIComponent(authUser.id)}`, {
    method: 'PATCH',
    prefer: 'return=representation',
    body: {
      name: updated.name,
      phone: updated.phone,
      farm_name: updated.farmName,
      location,
      avatar: updated.avatar,
    },
  });
  if (rows.length === 0) throw new Error('Your profile could not be saved. Please sign in again.');
  return rowToProfile(rows[0], authUser);
}

// ───────────────────────── orders ─────────────────────────

/** Saves a placed order to the signed-in farmer's account (idempotent per order number). */
export async function saveOrder(order: Order): Promise<void> {
  await rest('/orders?on_conflict=user_id,order_number', {
    method: 'POST',
    prefer: 'resolution=ignore-duplicates,return=minimal',
    body: {
      order_number: order.orderNumber,
      status: order.status,
      total: order.total,
      data: order,
    },
  });
}

export async function fetchOrders(): Promise<Order[]> {
  const rows = await rest<OrderRow[]>('/orders?select=data&order=created_at.desc&limit=200');
  return rows.map((r) => r.data);
}

// ───────────────────────── auth flows shared by both login screens ─────────────────────────

export async function loginWithEmail(email: string, password: string): Promise<UserProfile> {
  const session = await signInWithPassword(email.trim(), password);
  return ensureProfile(session.user);
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  farmName: string;
  cropType: string;
}

export type RegisterResult =
  | { status: 'signed-in'; user: UserProfile }
  | { status: 'confirm-email' };

export async function registerFarmer(input: RegisterInput): Promise<RegisterResult> {
  const { session, needsEmailConfirmation } = await signUpWithPassword({
    email: input.email.trim(),
    password: input.password,
    data: {
      name: input.name.trim(),
      phone: formatIndianPhone(input.phone),
      farm_name: input.farmName.trim() || 'My Farmstead',
      crop_type: input.cropType,
    },
  });
  if (session && !needsEmailConfirmation) {
    return { status: 'signed-in', user: await ensureProfile(session.user) };
  }
  return { status: 'confirm-email' };
}

export async function sendPhoneOtp(phone: string): Promise<void> {
  await sbSendPhoneOtp(toE164(phone));
}

export async function verifyPhoneOtp(phone: string, code: string): Promise<UserProfile> {
  const session = await sbVerifyPhoneOtp(toE164(phone), code.trim());
  return ensureProfile(session.user);
}

export function sendPasswordReset(email: string): Promise<void> {
  return sbSendPasswordReset(email.trim());
}
