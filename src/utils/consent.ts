// Cookie / analytics consent, stored locally in the visitor's browser.
export type ConsentChoice = 'accepted' | 'declined';
const KEY = 'farmin_cookie_consent';

export function getConsent(): ConsentChoice | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'accepted' || v === 'declined' ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(choice: ConsentChoice): void {
  try {
    localStorage.setItem(KEY, choice);
  } catch {
    /* storage unavailable: choice applies for this visit only */
  }
}
