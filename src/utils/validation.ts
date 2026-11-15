// Shared form validators. Each returns an error message, or '' when the value is valid.
export const validateEmail = (v: string): string => {
  const s = v.trim();
  if (!s) return 'Enter your email address.';
  if (s.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return 'Enter a valid email address.';
  return '';
};

export const validatePhone = (v: string): string => {
  const digits = v.replace(/\D/g, '');
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  if (!local) return 'Enter your mobile number.';
  if (!/^[6-9]\d{9}$/.test(local)) return 'Enter a valid 10-digit Indian mobile number.';
  return '';
};

export const validatePassword = (v: string): string => {
  if (!v) return 'Enter a password.';
  if (v.length < 8) return 'Use at least 8 characters.';
  if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return 'Include at least one letter and one number.';
  return '';
};

export const validateName = (v: string): string => {
  const s = v.trim();
  if (s.length < 2) return 'Enter your full name.';
  if (s.length > 80) return 'Name is too long.';
  return '';
};

export const validateOtp = (v: string): string => (/^\d{6}$/.test(v.trim()) ? '' : 'Enter the 6-digit code.');

/** Bot trap: real people never fill the hidden field and never submit within ~2 seconds of load. */
export const looksLikeBot = (honeypot: string, openedAt: number, minMs = 2000): boolean =>
  honeypot.trim() !== '' || Date.now() - openedAt < minMs;
