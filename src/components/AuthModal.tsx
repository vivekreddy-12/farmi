import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { sounds } from '../utils/soundEffects';
import {
  loginWithEmail,
  registerFarmer,
  sendPasswordReset,
  sendPhoneOtp,
  verifyPhoneOtp,
} from '../lib/farmerData';
import { startGoogleSignIn } from '../lib/supabase';

export type AuthTab = 'google' | 'email' | 'phone' | 'register';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  defaultEmail?: string;
  defaultPhone?: string;
  /** Which tab to show each time the modal opens. */
  initialTab?: AuthTab;
}


export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultEmail = '',
  defaultPhone = '',
  initialTab = 'google',
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [isOpen, initialTab]);
  
  // Email state
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Phone state
  const [phone, setPhone] = useState(defaultPhone);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(30);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState(defaultEmail);
  const [regPhone, setRegPhone] = useState(defaultPhone);
  const [regFarmName, setRegFarmName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCropType, setRegCropType] = useState('Corn & Soybeans');

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isOpen) return null;

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
      onClose();
    } catch (err) {
      setErrorMessage(messageFrom(err, 'Could not sign in. Please try again.'));
    } finally {
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
      setOtpCountdown(30);
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
      setErrorMessage('Please enter the 6-digit verification code sent to your phone.');
      return;
    }

    sounds.playClick();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await verifyPhoneOtp(phone, otpCode);
      sounds.playSuccess();
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      setErrorMessage(messageFrom(err, 'That code did not work. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setErrorMessage('Please provide your name and email.');
      return;
    }
    if (regPassword.length < 8) {
      setErrorMessage('Choose a password of at least 8 characters.');
      return;
    }
    if (regPhone && regPhone.replace(/[^0-9]/g, '').length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number, or leave it blank.');
      return;
    }

    sounds.playClick();
    setIsLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);
    try {
      const result = await registerFarmer({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        farmName: regFarmName,
        cropType: regCropType,
      });
      sounds.playSuccess();
      if (result.status === 'signed-in') {
        onLoginSuccess(result.user);
        onClose();
      } else {
        // Email confirmation is switched on: the account exists but needs its link clicked.
        setEmail(regEmail.trim());
        setRegPassword('');
        setActiveTab('email');
        setInfoMessage('Account created. Check your email for a confirmation link, then sign in here.');
      }
    } catch (err) {
      setErrorMessage(messageFrom(err, 'Could not create your account. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-[#111A13] rounded-2xl w-full max-w-md shadow-2xl border-2 border-[#1E2E21] overflow-hidden flex flex-col max-h-[92vh] text-[#F1F5F2]">
        {/* Header */}
        <div className="p-5 border-b-2 border-[#1E2E21] bg-[#16241A] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B110D] border-2 border-[#84CC16] flex items-center justify-center text-[#84CC16]">
              <span className="material-symbols-outlined text-[22px]">account_circle</span>
            </div>
            <div>
              <h2 className="text-base font-['Space_Grotesk',sans-serif] font-black uppercase text-[#F1F5F2] tracking-wide">
                {activeTab === 'register' ? 'Create Farmer Account' : 'Farmer Login'}
              </h2>
              <p className="text-xs text-[#9CAFA0] font-medium">
                {activeTab === 'register'
                  ? 'Join farmin Agro for instant subsidies & live agronomy'
                  : 'Access your order invoices, soil scans & crop plans'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-[#0B110D] text-[#9CAFA0] hover:text-[#F1F5F2] hover:bg-[#1E2E21] flex items-center justify-center transition-colors border border-[#1E2E21]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="p-3 bg-[#0B110D] border-b border-[#1E2E21] grid grid-cols-4 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('google');
              setErrorMessage(null);
            }}
            className={`py-2 px-1 rounded-lg font-['Space_Grotesk',sans-serif] font-bold text-center transition-all flex flex-col items-center gap-1 ${
              activeTab === 'google'
                ? 'bg-[#84CC16] text-[#0B110D] shadow-sm'
                : 'text-[#9CAFA0] hover:text-[#F1F5F2] hover:bg-[#16241A]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">g_mobiledata</span>
            <span className="text-[10px] uppercase tracking-wider font-extrabold">Google</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('email');
              setErrorMessage(null);
            }}
            className={`py-2 px-1 rounded-lg font-['Space_Grotesk',sans-serif] font-bold text-center transition-all flex flex-col items-center gap-1 ${
              activeTab === 'email'
                ? 'bg-[#84CC16] text-[#0B110D] shadow-sm'
                : 'text-[#9CAFA0] hover:text-[#F1F5F2] hover:bg-[#16241A]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">mail</span>
            <span className="text-[10px] uppercase tracking-wider font-extrabold">Email</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('phone');
              setErrorMessage(null);
            }}
            className={`py-2 px-1 rounded-lg font-['Space_Grotesk',sans-serif] font-bold text-center transition-all flex flex-col items-center gap-1 ${
              activeTab === 'phone'
                ? 'bg-[#84CC16] text-[#0B110D] shadow-sm'
                : 'text-[#9CAFA0] hover:text-[#F1F5F2] hover:bg-[#16241A]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">smartphone</span>
            <span className="text-[10px] uppercase tracking-wider font-extrabold">Phone OTP</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('register');
              setErrorMessage(null);
            }}
            className={`py-2 px-1 rounded-lg font-['Space_Grotesk',sans-serif] font-bold text-center transition-all flex flex-col items-center gap-1 ${
              activeTab === 'register'
                ? 'bg-[#84CC16] text-[#0B110D] shadow-sm'
                : 'text-[#9CAFA0] hover:text-[#F1F5F2] hover:bg-[#16241A]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span className="text-[10px] uppercase tracking-wider font-extrabold">Register</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
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

          {/* TAB 1: GOOGLE LOGIN */}
          {activeTab === 'google' && (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-[#16241A] rounded-xl border border-[#1E2E21] space-y-3">
                <div className="w-14 h-14 rounded-full bg-white text-black font-black text-xl flex items-center justify-center mx-auto shadow-md border-2 border-[#84CC16]">
                  G
                </div>
                <div>
                  <h3 className="text-sm font-['Space_Grotesk',sans-serif] font-bold text-[#F1F5F2]">
                    Quick One-Tap Google Sign-In
                  </h3>
                  <p className="text-xs text-[#9CAFA0] mt-0.5">
                    Sign in with your verified Google account
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3.5 bg-white hover:bg-neutral-100 text-[#111827] font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2.5 border-2 border-white"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    <span>Authenticating with Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: EMAIL & PASSWORD LOGIN */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-3.5">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl text-xs text-[#F1F5F2] font-mono outline-none transition-colors"
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
                    className="w-full pl-10 pr-10 py-2.5 bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl text-xs text-[#F1F5F2] font-mono outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CAFA0] hover:text-[#F1F5F2]"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[#9CAFA0]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded accent-[#84CC16]"
                  />
                  <span>Remember my login</span>
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
                className="w-full py-3 bg-[#84CC16] hover:bg-[#99E321] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 border-2 border-[#84CC16] mt-2"
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

          {/* TAB 3: PHONE OTP LOGIN */}
          {activeTab === 'phone' && (
            <div className="space-y-4">
              {!otpSent ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1.5">
                      Farmer Mobile Number
                    </label>
                    <div className="relative flex">
                      <span className="inline-flex items-center px-3 bg-[#16241A] border-2 border-r-0 border-[#1E2E21] rounded-l-xl text-xs font-mono font-bold text-[#84CC16]">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className="w-full px-3 py-2.5 bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-r-xl text-xs text-[#F1F5F2] font-mono outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-[#9CAFA0]">
                    We will send a 6-digit OTP via carrier SMS to verify your grower credentials.
                  </p>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="w-full py-3 bg-[#84CC16] hover:bg-[#99E321] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 border-2 border-[#84CC16]"
                  >
                    {isLoading ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                        <span>Sending SMS OTP...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px] font-bold">sms</span>
                        <span>Send 6-Digit OTP</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePhoneVerify} className="space-y-3.5">
                  <div className="p-3 bg-[#16241A] rounded-xl border border-[#84CC16]/60 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-[#9CAFA0]">OTP sent to:</div>
                      <div className="text-xs font-mono font-bold text-[#84CC16]">+91 {phone}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[11px] text-[#9CAFA0] hover:text-[#F1F5F2] underline"
                    >
                      Change Phone
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1.5">
                      Enter 6-Digit OTP
                    </label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="6-digit code"
                      maxLength={6}
                      className="w-full text-center tracking-[0.5em] text-lg font-mono py-2.5 bg-[#0B110D] border-2 border-[#84CC16] rounded-xl text-[#F1F5F2] font-bold outline-none"
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-[#9CAFA0]">
                    <span>Enter the code from the SMS we sent you</span>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-[#84CC16] hover:underline font-bold"
                    >
                      Resend SMS
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#84CC16] hover:bg-[#99E321] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 border-2 border-[#84CC16]"
                  >
                    {isLoading ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                        <span>Verifying OTP...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px] font-bold">verified_user</span>
                        <span>Verify & Sign In</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: REGISTER NEW FARMER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1">
                  Full Name / Lead Farmer
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl text-xs text-[#F1F5F2] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl text-xs text-[#F1F5F2] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full px-3 py-2 bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl text-xs text-[#F1F5F2] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1">
                  Create Password
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="w-full px-3 py-2 bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl text-xs text-[#F1F5F2] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1">
                  Farm Name & Location
                </label>
                <input
                  type="text"
                  value={regFarmName}
                  onChange={(e) => setRegFarmName(e.target.value)}
                  placeholder="e.g. Green Valley Farm, Warangal"
                  className="w-full px-3 py-2 bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl text-xs text-[#F1F5F2] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1">
                  Primary Crop Focus
                </label>
                <select
                  value={regCropType}
                  onChange={(e) => setRegCropType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl text-xs text-[#F1F5F2] outline-none"
                >
                  <option value="Corn & Soybeans">Corn & Soybeans (Row Crops)</option>
                  <option value="Wheat & Barley">Wheat & Small Grains</option>
                  <option value="Horticulture & Fruits">Horticulture, Vineyards & Fruits</option>
                  <option value="Vegetables & Greens">High-Value Greenhouse Vegetables</option>
                  <option value="Organic Mixed Farm">100% Certified Organic Farm</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#84CC16] hover:bg-[#99E321] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 border-2 border-[#84CC16] mt-2"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    <span>Creating Grower Profile...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px] font-bold">how_to_reg</span>
                    <span>Register & Claim Subsidies</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Disclaimer / Support footer */}
          <div className="pt-2 border-t border-[#1E2E21] text-center text-[10px] text-[#9CAFA0]">
            <span>Need login assistance? Call Agronomy Hotline: </span>
            <strong className="text-[#84CC16]">1800-419-AGRO</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
