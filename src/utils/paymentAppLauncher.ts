/**
 * UPI & Payment App Deep Link Generator and Launcher
 * Supports Google Pay (Tez), PhonePe, Paytm, BHIM UPI, Amazon Pay, CRED, and generic UPI protocol.
 */

export interface UpiPaymentIntentConfig {
  vpa?: string;
  payeeName?: string;
  amount: number;
  transactionRef?: string;
  note?: string;
  appName?: string;
}

export const FARMIN_VPA = '9391216686@ybl';
export const FARMIN_PAYEE_NAME = 'farmin Agro Solutions';

/**
 * Builds the standard RFC UPI deep link URI
 */
export function buildUpiUri(config: UpiPaymentIntentConfig): string {
  const vpa = encodeURIComponent(config.vpa || FARMIN_VPA);
  const name = encodeURIComponent(config.payeeName || FARMIN_PAYEE_NAME);
  const amount = Number(config.amount).toFixed(2);
  const note = encodeURIComponent(config.note || 'farmin Agro Order Payment');
  const ref = encodeURIComponent(config.transactionRef || `FM${Date.now().toString().slice(-6)}`);

  return `upi://pay?pa=${vpa}&pn=${name}&am=${amount}&cu=INR&tn=${note}&tr=${ref}`;
}

/**
 * Builds custom app-specific scheme deep links
 */
export function buildAppSpecificUri(appName: string, config: UpiPaymentIntentConfig): string {
  const genericUpi = buildUpiUri(config);
  const normalized = appName.toLowerCase();

  const vpa = encodeURIComponent(config.vpa || FARMIN_VPA);
  const name = encodeURIComponent(config.payeeName || FARMIN_PAYEE_NAME);
  const amount = Number(config.amount).toFixed(2);
  const note = encodeURIComponent(config.note || 'farmin Agro Order Payment');
  const ref = encodeURIComponent(config.transactionRef || `FM${Date.now().toString().slice(-6)}`);
  const queryParams = `pa=${vpa}&pn=${name}&am=${amount}&cu=INR&tn=${note}&tr=${ref}`;

  if (normalized.includes('google') || normalized.includes('gpay') || normalized.includes('tez')) {
    return `tez://upi/pay?${queryParams}`;
  }
  if (normalized.includes('phonepe') || normalized.includes('phone pe')) {
    return `phonepe://pay?${queryParams}`;
  }
  if (normalized.includes('paytm')) {
    return `paytmmp://pay?${queryParams}`;
  }
  if (normalized.includes('bhim')) {
    return `bhim://pay?${queryParams}`;
  }
  if (normalized.includes('amazon')) {
    return `amazonpay://pay?${queryParams}`;
  }
  if (normalized.includes('cred')) {
    return `cred://pay?${queryParams}`;
  }
  if (normalized.includes('mobikwik')) {
    return `mobikwik://pay?${queryParams}`;
  }

  return genericUpi;
}

/**
 * Launches the payment app on the user's phone / desktop
 */
export function launchPaymentApp(
  appName: string,
  config: UpiPaymentIntentConfig
): { uri: string; fallbackUri: string; triggered: boolean } {
  const specificUri = buildAppSpecificUri(appName, config);
  const genericUri = buildUpiUri(config);

  if (typeof window !== 'undefined') {
    try {
      // Create hidden link and click to initiate protocol handler safely without breaking SPA state
      const anchor = document.createElement('a');
      anchor.href = specificUri;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      setTimeout(() => {
        if (anchor.parentNode) {
          anchor.parentNode.removeChild(anchor);
        }
      }, 500);
      return { uri: specificUri, fallbackUri: genericUri, triggered: true };
    } catch {
      // Fallback to generic UPI protocol
      try {
        window.location.href = genericUri;
      } catch {
        // Safe failover
      }
      return { uri: specificUri, fallbackUri: genericUri, triggered: false };
    }
  }

  return { uri: specificUri, fallbackUri: genericUri, triggered: false };
}
