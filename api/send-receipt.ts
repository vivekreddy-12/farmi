import { Resend } from 'resend';

/**
 * Vercel serverless function: POST /api/send-receipt
 *
 * Production counterpart of server/receiptEmailPlugin.ts (which only runs under
 * `vite dev`). Emails an order receipt to the store owner. The RESEND_API_KEY
 * stays on the server.
 *
 * Only signed-in farmers may call it: the browser sends its Supabase access
 * token and we confirm it with Supabase before sending anything, so the
 * endpoint can't be used by strangers to mail arbitrary content to the owner.
 *
 * Environment variables (set in the Vercel project settings):
 *   RESEND_API_KEY            required
 *   RESEND_EMAIL_DOMAIN       optional, a domain verified at resend.com/domains
 *   ORDER_NOTIFICATION_EMAIL  optional, who receives the receipts
 *   VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY   already needed by the app
 */

// Kept from the original dev plugin so behaviour is unchanged until you set ORDER_NOTIFICATION_EMAIL.
const FALLBACK_NOTIFICATION_EMAIL = 'njersey382@gmail.com';
const MAX_FIELD_LENGTH = 200_000;

interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface ApiResponse {
  status(code: number): ApiResponse;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
}

interface ReceiptBody {
  subject?: unknown;
  html?: unknown;
  text?: unknown;
  orderNumber?: unknown;
}

function header(req: ApiRequest, name: string): string {
  const v = req.headers[name];
  return Array.isArray(v) ? v[0] ?? '' : v ?? '';
}

async function isSignedIn(accessToken: string): Promise<boolean> {
  const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const key =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';
  if (!url || !key) return false;

  const res = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
  });
  return res.ok;
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'RESEND_API_KEY is not configured on the server' });
    return;
  }

  const authorization = header(req, 'authorization');
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: 'Sign in to send order receipts.' });
    return;
  }
  try {
    if (!(await isSignedIn(token))) {
      res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
      return;
    }
  } catch {
    res.status(502).json({ error: 'Could not verify your session. Please try again.' });
    return;
  }

  const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as ReceiptBody;
  const subject = typeof body.subject === 'string' ? body.subject : '';
  const html = typeof body.html === 'string' ? body.html : '';
  const text = typeof body.text === 'string' ? body.text : undefined;
  const orderNumber = typeof body.orderNumber === 'string' ? body.orderNumber : undefined;

  if (!subject || !html) {
    res.status(400).json({ error: 'Missing required receipt content (subject, html)' });
    return;
  }
  if (subject.length > 300 || html.length > MAX_FIELD_LENGTH || (text && text.length > MAX_FIELD_LENGTH)) {
    res.status(413).json({ error: 'Receipt is too large.' });
    return;
  }

  const domain = process.env.RESEND_EMAIL_DOMAIN;
  const from = domain ? `farmin Orders <orders@${domain}>` : 'farmin Orders <onboarding@resend.dev>';
  const to = process.env.ORDER_NOTIFICATION_EMAIL || FALLBACK_NOTIFICATION_EMAIL;

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send(
      { from, to: [to], subject, html, text },
      orderNumber ? { idempotencyKey: `order-receipt/${orderNumber}` } : undefined
    );
    if (error) {
      console.error('[send-receipt] Resend send failed:', error.message);
      res.status(502).json({ error: error.message });
      return;
    }
    res.status(200).json({ id: data?.id ?? null });
  } catch (err) {
    console.error('[send-receipt] unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
