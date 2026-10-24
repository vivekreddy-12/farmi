import { Resend } from 'resend';

const CREATOR_EMAIL = 'njersey382@gmail.com';

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
  if (!subject || !html) {
    return res.status(400).json({ error: 'Missing required receipt content (subject, html)' });
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
        to: [CREATOR_EMAIL],
        subject,
        html,
        text: text || undefined,
      },
      orderNumber ? { idempotencyKey: `order-receipt/${orderNumber}` } : undefined
    );

    if (error) {
      console.error('[farmin] Resend send error:', error.message);
      return res.status(502).json({ error: error.message });
    }

    return res.status(200).json({ id: data?.id ?? null });
  } catch (err) {
    console.error('[farmin] Serverless error:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
}
