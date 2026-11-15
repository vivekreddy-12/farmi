import { track } from '@vercel/analytics';
import { getConsent } from './consent';

/** Records a custom event, but only after the visitor accepted analytics. */
export function trackEvent(name: string, data?: Record<string, string | number | boolean>): void {
  if (getConsent() !== 'accepted') return;
  try {
    track(name, data);
  } catch {
    /* analytics must never break the app */
  }
}
