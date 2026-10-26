/**
 * Minimal Supabase client (Auth + PostgREST) built on fetch.
 *
 * Why not @supabase/supabase-js? This project deploys on Vercel with a frozen
 * pnpm lockfile, so adding a dependency means regenerating the lockfile first.
 * This file covers exactly what farmin needs and has no dependencies. If you
 * later add supabase-js, only this file and farmerData.ts need to change.
 *
 * Only the public URL and publishable (anon) key are used here. Data access is
 * protected by row-level security in the database, not by hiding the key.
 */

const env = import.meta.env;

const SUPABASE_URL = String(env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_KEY = String(
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
);

export const isBackendConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  created_at?: string;
  user_metadata?: Record<string, unknown>;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  /** Unix seconds */
  expires_at: number;
  user: AuthUser;
}

export class BackendError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'BackendError';
    this.code = code;
  }
}

const FRIENDLY_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Incorrect email or password.',
  email_not_confirmed: 'Please confirm your email first. Check your inbox for the confirmation link.',
  user_already_exists: 'An account with this email already exists. Try signing in instead.',
  email_exists: 'An account with this email already exists. Try signing in instead.',
  phone_exists: 'An account with this phone number already exists.',
  signup_disabled: 'New sign-ups are currently turned off.',
  over_email_send_rate_limit: 'Too many emails requested. Please wait a few minutes and try again.',
  over_request_rate_limit: 'Too many attempts. Please wait a moment and try again.',
  over_sms_send_rate_limit: 'Too many codes requested. Please wait a minute and try again.',
  otp_expired: 'That code has expired. Request a new one.',
  weak_password: 'Choose a stronger password (at least 8 characters).',
};

function requireConfig(): void {
  if (!isBackendConfigured) {
    throw new BackendError(
      'The backend is not connected yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment.',
      'not_configured'
    );
  }
}

async function parseError(res: Response): Promise<BackendError> {
  let body: Record<string, unknown> = {};
  try {
    body = await res.json();
  } catch {
    // non-JSON error body
  }
  const code = String(body.error_code || body.code || '');
  const raw = String(body.msg || body.message || body.error_description || body.error || `Request failed (${res.status})`);
  return new BackendError(FRIENDLY_MESSAGES[code] || raw, code || String(res.status));
}

// ───────────────────────── session storage ─────────────────────────

const STORAGE_KEY = 'farmin_sb_session';

function loadStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    return parsed?.access_token && parsed?.refresh_token ? parsed : null;
  } catch {
    return null;
  }
}

let session: Session | null = loadStoredSession();
const listeners = new Set<(s: Session | null) => void>();

function setSession(next: Session | null): void {
  session = next;
  try {
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable (private mode); session lives in memory only
  }
  listeners.forEach((cb) => cb(next));
}

export function getCurrentSession(): Session | null {
  return session;
}

/** Subscribe to sign-in / sign-out. Returns an unsubscribe function. */
export function onAuthChange(cb: (s: Session | null) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  expires_at?: number;
  user: AuthUser;
}

function toSession(t: TokenResponse): Session {
  return {
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    expires_at: t.expires_at ?? Math.floor(Date.now() / 1000) + (t.expires_in ?? 3600),
    user: t.user,
  };
}

/**
 * Headers for calls made before/without a user session. New-style publishable
 * keys (sb_publishable_...) are not JWTs and must only go in `apikey`; the
 * legacy anon key is a JWT and may also be sent as the Bearer token.
 */
function publicHeaders(userToken?: string): Record<string, string> {
  const headers: Record<string, string> = { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' };
  if (userToken) headers.Authorization = `Bearer ${userToken}`;
  else if (SUPABASE_KEY.startsWith('eyJ')) headers.Authorization = `Bearer ${SUPABASE_KEY}`;
  return headers;
}

async function authRequest<T>(path: string, init: { method?: string; body?: unknown; token?: string } = {}): Promise<T> {
  requireConfig();
  const res = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method: init.method || 'POST',
    headers: publicHeaders(init.token),
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!res.ok) throw await parseError(res);
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}

// ───────────────────────── token refresh ─────────────────────────

let refreshing: Promise<Session | null> | null = null;

async function refreshSession(): Promise<Session | null> {
  if (!session) return null;
  if (!refreshing) {
    const refreshToken = session.refresh_token;
    refreshing = authRequest<TokenResponse>('/token?grant_type=refresh_token', {
      body: { refresh_token: refreshToken },
    })
      .then((t) => {
        const next = toSession(t);
        setSession(next);
        return next;
      })
      .catch((err: BackendError) => {
        // A rejected refresh token means the session is dead. Network errors
        // keep the stored session so the user isn't logged out while offline.
        if (err.code === 'refresh_token_not_found' || err.code === 'refresh_token_already_used' || err.code === 'session_not_found' || err.code === '400' || err.code === '401') {
          setSession(null);
        }
        return null;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

/** Returns a valid access token, refreshing it first if it is about to expire. */
export async function getAccessToken(): Promise<string | null> {
  if (!session) return null;
  if (session.expires_at - 60 > Math.floor(Date.now() / 1000)) return session.access_token;
  const next = await refreshSession();
  return next?.access_token ?? null;
}

// ───────────────────────── auth actions ─────────────────────────

export interface AuthSettings {
  external?: Record<string, boolean>;
  mailer_autoconfirm?: boolean;
  disable_signup?: boolean;
}

let settingsCache: Promise<AuthSettings> | null = null;

/** Public project auth settings (which providers are switched on). */
export function getAuthSettings(): Promise<AuthSettings> {
  if (!settingsCache) {
    settingsCache = authRequest<AuthSettings>('/settings', { method: 'GET' }).catch((err) => {
      settingsCache = null;
      throw err;
    });
  }
  return settingsCache;
}

export async function signUpWithPassword(params: {
  email: string;
  password: string;
  data?: Record<string, unknown>;
}): Promise<{ session: Session | null; needsEmailConfirmation: boolean }> {
  const res = await authRequest<Partial<TokenResponse> & { id?: string }>('/signup', {
    body: { email: params.email, password: params.password, data: params.data ?? {} },
  });
  if (res.access_token && res.refresh_token && res.user) {
    const next = toSession(res as TokenResponse);
    setSession(next);
    return { session: next, needsEmailConfirmation: false };
  }
  return { session: null, needsEmailConfirmation: true };
}

export async function signInWithPassword(email: string, password: string): Promise<Session> {
  const t = await authRequest<TokenResponse>('/token?grant_type=password', { body: { email, password } });
  const next = toSession(t);
  setSession(next);
  return next;
}

export async function sendPhoneOtp(phone: string): Promise<void> {
  const settings = await getAuthSettings();
  if (settings.external && settings.external.phone === false) {
    throw new BackendError(
      'Phone sign-in is not switched on for this project yet. Use email to sign in, or enable the Phone provider and an SMS service in Supabase.',
      'provider_disabled'
    );
  }
  await authRequest('/otp', { body: { phone, create_user: true } });
}

export async function verifyPhoneOtp(phone: string, token: string): Promise<Session> {
  const t = await authRequest<TokenResponse>('/verify', { body: { type: 'sms', phone, token } });
  const next = toSession(t);
  setSession(next);
  return next;
}

/** Redirects the browser to Google. Returns only if sign-in cannot start. */
export async function startGoogleSignIn(): Promise<void> {
  requireConfig();
  const settings = await getAuthSettings();
  if (settings.external && settings.external.google === false) {
    throw new BackendError(
      'Google sign-in is not switched on for this project yet. Use email to sign in, or enable the Google provider in Supabase.',
      'provider_disabled'
    );
  }
  const redirectTo = encodeURIComponent(window.location.origin);
  window.location.assign(`${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`);
}

export async function sendPasswordReset(email: string): Promise<void> {
  await authRequest('/recover', { body: { email }, token: undefined });
}

export async function signOut(): Promise<void> {
  const token = session?.access_token;
  setSession(null);
  if (token && isBackendConfigured) {
    try {
      await authRequest('/logout', { token });
    } catch {
      // the local session is already cleared; a failed revoke is not user-facing
    }
  }
}

/**
 * Call once on app start. If the page was opened from an OAuth or email
 * confirmation link, the tokens arrive in the URL fragment: store them as the
 * session and clean the URL.
 */
export async function initAuth(): Promise<{ handledCallback: boolean; error?: string }> {
  if (!isBackendConfigured) return { handledCallback: false };

  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
  if (!hash) return { handledCallback: false };

  const params = new URLSearchParams(hash);
  const errorDescription = params.get('error_description');
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (!errorDescription && !(accessToken && refreshToken)) return { handledCallback: false };

  window.history.replaceState(null, '', window.location.pathname + window.location.search);

  if (errorDescription) {
    return { handledCallback: true, error: errorDescription.replace(/\+/g, ' ') };
  }

  try {
    const user = await authRequest<AuthUser>('/user', { method: 'GET', token: accessToken! });
    const expiresIn = Number(params.get('expires_in') || 3600);
    setSession({
      access_token: accessToken!,
      refresh_token: refreshToken!,
      expires_at: Math.floor(Date.now() / 1000) + expiresIn,
      user,
    });
    return { handledCallback: true };
  } catch (err) {
    return { handledCallback: true, error: (err as Error).message };
  }
}

// ───────────────────────── database (PostgREST) ─────────────────────────

export async function rest<T>(
  path: string,
  init: { method?: string; body?: unknown; prefer?: string } = {}
): Promise<T> {
  requireConfig();
  const token = await getAccessToken();
  if (!token) throw new BackendError('Please sign in to continue.', 'not_signed_in');

  const headers: Record<string, string> = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  if (init.prefer) headers.Prefer = init.prefer;

  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method: init.method || 'GET',
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!res.ok) throw await parseError(res);
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
