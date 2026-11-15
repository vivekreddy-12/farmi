import { Resend } from 'resend';

// Where order notifications go. Set ORDER_NOTIFICATION_EMAIL in Vercel to change it.
const NOTIFY_EMAIL = process.env.ORDER_NOTIFICATION_EMAIL || 'njersey382@gmail.com';

const MAX_SUBJECT = 200;
const MAX_HTML = 100_000;
const MAX_TEXT = 20_000;

// Best-effort per-instance rate limit (resets on cold start). Real limits: Vercel Firewall.
const hits = new Map();
function rateLimited(key) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 500) hits.clear();
  return recent.length > 5;
}

// Only a signed-in farmin user may trigger an email: the Supabase access token is verified server-side.
async function getUserId(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!token || !url || !anon) return null;
  try {
    const r = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } });
    if (!r.ok) return null;
    const user = await r.json();
    return user?.id || null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = await getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'Please sign in to send a receipt' });
  }
  if (rateLimited(userId)) {
    return res.status(429).json({ error: 'Too many requests. Try again in a minute.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // If RESEND_API_KEY is not set on Vercel, return 200 with skipped flag
    // so client receipt dispatch doesn't log 404 or break the experience.
    return res.status(200).json({
      success: true,
      skipped: true,
      message: 'RESEND_API_KEY is not configured in Vercel environment variables',
    });
  }

  const { subject, html, text, orderNumber } = req.body || {};
  if (typeof subject !== 'string' || typeof html !== 'string' || !subject || !html) {
    return res.status(400).json({ error: 'Missing required receipt content (subject, html)' });
  }
  if (subject.length > MAX_SUBJECT || html.length > MAX_HTML || (typeof text === 'string' && text.length > MAX_TEXT)) {
    return res.status(413).json({ error: 'Receipt content too large' });
  }

  try {
    const verifiedDomain = process.env.RESEND_EMAIL_DOMAIN;
    const from = verifiedDomain
      ? `farmin Orders <orders@${verifiedDomain}>`
      : 'farmin Orders <onboarding@resend.dev>';

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send(
      {
        from,
        to: [NOTIFY_EMAIL],
        subject,
        html,
        text: typeof text === 'string' ? text : undefined,
      },
      typeof orderNumber === 'string' && orderNumber ? { idempotencyKey: `order-receipt/${orderNumber}` } : undefined
    );

    if (error) {
      console.error('[farmin] Resend send error:', error.message);
      return res.status(502).json({ error: 'Could not send the email' });
    }

    return res.status(200).json({ id: data?.id ?? null });
  } catch (err) {
    console.error('[farmin] Serverless error:', err?.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
