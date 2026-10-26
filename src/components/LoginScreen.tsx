import React, { useState } from 'react';
import { UserProfile } from '../types';
import { sounds } from '../utils/soundEffects';
import { loginWithEmail, sendPasswordReset, sendPhoneOtp, verifyPhoneOtp } from '../lib/farmerData';
import { startGoogleSignIn } from '../lib/supabase';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  onContinueAsGuest: () => void;
  /** Opens the sign-up form. */
  onCreateAccount: () => void;
  defaultEmail?: string;
}

type Mode = 'email' | 'phone';

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onContinueAsGuest,
  onCreateAccount,
  defaultEmail = '',
}) => {
  const [mode, setMode] = useState<Mode>('email');

  // Email
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Phone
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const messageFrom = (err: unknown, fallback: string) =>
    err instanceof Error && err.message ? err.message : fallback;

  const handleGoogleLogin = async () => {
    sounds.playClick();
    setIsLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      // Redirects the browser to Google; the page reloads signed in.
      await startGoogleSignIn();
    } catch (err) {
      setErrorMessage(messageFrom(err, 'Could not start Google sign-in.'));
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }
    sounds.playClick();
    setIsLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      const user = await loginWithEmail(email, password);
      sounds.playSuccess();
      onLoginSuccess(user);
    } catch (err) {
      setErrorMessage(messageFrom(err, 'Could not sign in. Please try again.'));
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMessage('Enter your email above, then tap Forgot Password.');
      return;
    }
    sounds.playClick();
    setErrorMessage(null);
    try {
      await sendPasswordReset(email);
      setInfoMessage('If an account exists for that email, a password reset link is on its way.');
    } catch (err) {
      setErrorMessage(messageFrom(err, 'Could not send the reset email.'));
    }
  };

  const handleSendOtp = async () => {
    if (phone.replace(/[^0-9]/g, '').length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    sounds.playClick();
    setIsLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      await sendPhoneOtp(phone);
      setOtpSent(true);
      setOtpCode('');
      sounds.playDroplet();
    } catch (err) {
      setErrorMessage(messageFrom(err, 'Could not send the verification code.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setErrorMessage('Please enter the verification code sent to your phone.');
      return;
    }
    sounds.playClick();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await verifyPhoneOtp(phone, otpCode);
      sounds.playSuccess();
      onLoginSuccess(user);
    } catch (err) {
      setErrorMessage(messageFrom(err, 'That code did not work. Please try again.'));
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-2.5 bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl text-xs text-[#F1F5F2] font-mono outline-none transition-colors';

  return (
    <main className="min-h-screen flex flex-col bg-[#0B110D] text-[#F1F5F2] font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#84CC16] selection:text-[#0B110D]">
      {/* Hero / Brand banner */}
      <header className="relative h-40 sm:h-52 shrink-0 overflow-hidden border-b-2 border-[#1E2E21]">
        <img
          src="/src/assets/images/lush_farm_landscape_1788271790895.jpg"
          alt="Sunlit farm landscape with rows of crops"
          className="absolute inset-0 w-full h-full object-cover"
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B110D] via-[#0B110D]/70 to-[#0B110D]/30" />
        <div className="relative z-10 h-full flex flex-col justify-end p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#0B110D] border-2 border-[#84CC16] flex items-center justify-center text-[#84CC16] shadow-lg overflow-hidden">
              <img
                src="/src/assets/images/farmin_logo_icon_1788274974140.jpg"
                alt="farmin logo"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
            <div>
              <h1 className="text-xl font-['Space_Grotesk',sans-serif] font-bold tracking-tight text-[#F1F5F2] leading-none">
                farmin
              </h1>
              <p className="text-[11px] text-[#84CC16] font-semibold uppercase tracking-widest mt-1">
                Agro Intelligence
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Form area */}
      <div className="flex-grow flex flex-col p-5 gap-4 max-w-md w-full mx-auto">
        <div>
          <h2 className="text-lg font-['Space_Grotesk',sans-serif] font-bold text-[#F1F5F2] text-balance">
            Welcome back, grower
          </h2>
          <p className="text-xs text-[#9CAFA0] mt-1 leading-relaxed">
            Sign in to access your soil scans, crop plans, and order invoices.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#111A13] border border-[#1E2E21] rounded-xl">
          {(['email', 'phone'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                sounds.playClick();
                setMode(m);
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg font-['Space_Grotesk',sans-serif] text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                mode === m
                  ? 'bg-[#84CC16] text-[#0B110D] shadow-sm'
                  : 'text-[#9CAFA0] hover:text-[#F1F5F2]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {m === 'email' ? 'mail' : 'smartphone'}
              </span>
              {m === 'email' ? 'Email' : 'Phone OTP'}
            </button>
          ))}
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center gap-2 animate-shake">
            <span className="material-symbols-outlined text-red-400 text-[18px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div className="p-3 bg-[#16241A] border border-[#84CC16]/50 rounded-xl text-[#C9E8A0] text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[#84CC16] text-[18px]">mark_email_read</span>
            <span>{infoMessage}</span>
          </div>
        )}

        {/* EMAIL MODE */}
        {mode === 'email' && (
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9CAFA0] text-[18px]">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0]">
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9CAFA0] text-[18px]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your account password"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CAFA0] hover:text-[#F1F5F2]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#9CAFA0]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded accent-[#84CC16]"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[#84CC16] hover:underline text-[11px] font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#84CC16] hover:bg-[#99E321] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 border-2 border-[#84CC16] disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px] font-bold">login</span>
                  <span>Sign In with Email</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* PHONE MODE */}
        {mode === 'phone' && (
          <div className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1.5">
                Mobile Number
              </label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9CAFA0] text-[18px]">
                    smartphone
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    disabled={otpSent}
                    className={`${inputClass} disabled:opacity-60`}
                  />
                </div>
                {!otpSent && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="shrink-0 px-3 bg-[#16241A] hover:bg-[#1E2E21] text-[#84CC16] border-2 border-[#1E2E21] rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-70"
                  >
                    {isLoading ? '...' : 'Send OTP'}
                  </button>
                )}
              </div>
            </div>

            {otpSent && (
              <form onSubmit={handlePhoneVerify} className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1.5">
                    Verification Code
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9CAFA0] text-[18px]">
                      password
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className={`${inputClass} tracking-[0.3em]`}
                    />
                  </div>
                  <p className="text-[10px] text-[#84CC16] mt-1.5">
                    Code sent to +91 {phone.replace(/[^0-9]/g, '').slice(-10)}.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#84CC16] hover:bg-[#99E321] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 border-2 border-[#84CC16] disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px] font-bold">verified</span>
                      <span>Verify &amp; Sign In</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-grow h-px bg-[#1E2E21]" />
          <span className="text-[10px] uppercase tracking-widest text-[#9CAFA0] font-bold">or</span>
          <div className="flex-grow h-px bg-[#1E2E21]" />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-3 bg-white hover:bg-neutral-100 text-[#111827] font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2.5 border-2 border-white disabled:opacity-70"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Create account */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onCreateAccount();
          }}
          className="w-full py-3 bg-[#16241A] hover:bg-[#1E2E21] text-[#84CC16] font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 border-2 border-[#1E2E21]"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          New here? Create a Farmer Account
        </button>

        {/* Guest */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onContinueAsGuest();
          }}
          className="w-full py-2.5 text-[#9CAFA0] hover:text-[#F1F5F2] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">person_outline</span>
          Continue as Guest
        </button>

        <p className="text-center text-[10px] text-[#9CAFA0] leading-relaxed mt-auto pt-2">
          By continuing you agree to farmin&apos;s Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  );
};
