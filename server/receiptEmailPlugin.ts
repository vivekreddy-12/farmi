import type { IncomingMessage, ServerResponse } from 'http';
import type { Plugin } from 'vite';
import { Resend } from 'resend';

/**
 * Creator email address that should receive every order receipt.
 */
const CREATOR_EMAIL = 'njersey382@gmail.com';

interface SendReceiptPayload {
  subject?: string;
  html?: string;
  text?: string;
  orderNumber?: string;
}

interface ReceiptEmailPluginOptions {
  resendApiKey?: string;
  resendEmailDomain?: string;
}

function readJsonBody(req: IncomingMessage): Promise<SendReceiptPayload> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      // Guard against oversized payloads (~1MB).
      if (raw.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

/**
 * Sends the order receipt email to the creator via Resend.
 * The RESEND_API_KEY never leaves the server.
 */
async function handleSendReceipt(
  req: IncomingMessage,
  res: ServerResponse,
  options: ReceiptEmailPluginOptions
): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const apiKey = options.resendApiKey;
  if (!apiKey) {
    sendJson(res, 500, { error: 'RESEND_API_KEY is not configured on the server' });
    return;
  }

  let payload: SendReceiptPayload;
  try {
    payload = await readJsonBody(req);
  } catch (err) {
    sendJson(res, 400, { error: (err as Error).message });
    return;
  }

  const { subject, html, text, orderNumber } = payload;
  if (!subject || !html) {
    sendJson(res, 400, { error: 'Missing required receipt content (subject, html)' });
    return;
  }

  // Use the Resend sandbox sender by default, which reliably delivers to the
  // Resend account owner's inbox (the creator). Once a custom domain is verified
  // at https://resend.com/domains, set RESEND_VERIFIED_DOMAIN to send from it.
  const verifiedDomain = options.resendEmailDomain;
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
    console.error('[v0] Resend send failed:', error.message);
    sendJson(res, 502, { error: error.message });
    return;
  }

  sendJson(res, 200, { id: data?.id ?? null });
}

/**
 * Vite dev-server plugin that exposes POST /api/send-receipt so the client can
 * trigger a real email send without ever exposing the Resend API key.
 */
export function receiptEmailPlugin(options: ReceiptEmailPluginOptions = {}): Plugin {
  return {
    name: 'farmin-receipt-email',
    configureServer(server) {
      server.middlewares.use('/api/send-receipt', (req, res) => {
        handleSendReceipt(req, res, options).catch((err) => {
          console.error('[v0] send-receipt handler error:', err);
          sendJson(res, 500, { error: 'Internal server error' });
        });
      });
    },
  };
}
