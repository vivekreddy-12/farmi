import React, { useState } from 'react';
import { UserProfile } from '../types';
import { sounds } from '../utils/soundEffects';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  signInFarmerWithEmail,
  registerFarmerWithEmail,
  signInFarmerWithGoogle,
  sendFarmerPhoneOtp,
  verifyFarmerPhoneOtp,
  fetchFarmerProfile,
} from '../services/supabaseService';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  onContinueAsGuest: () => void;
  defaultEmail?: string;
}

type Mode = 'email' | 'phone';
type AuthIntent = 'signin' | 'signup';

const AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onContinueAsGuest,
  defaultEmail = 'njersey382@gmail.com',
}) => {
  const [intent, setIntent] = useState<AuthIntent>('signin');
  const [mode, setMode] = useState<Mode>('email');

  // Sign in / Sign up fields
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('farmin2026@Agri');
  const [showPassword, setShowPassword] = useState(false);

  // Sign up extra fields
  const [fullName, setFullName] = useState('Alex Miller');
  const [farmName, setFarmName] = useState('Miller Organic Field Station');
  const [cropType, setCropType] = useState('Corn & Wheat');

  // Phone fields
  const [phone, setPhone] = useState('9391216686');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handles Google Login
  const handleGoogleLogin = async () => {
    sounds.playClick();
    setErrorMessage(null);

    if (isSupabaseConfigured) {
      try {
        setIsLoading(true);
        await signInFarmerWithGoogle();
      } catch (err: any) {
        setIsLoading(false);
        setErrorMessage(err.message || 'Google sign-in failed');
      }
      return;
    }

    // Demo fallback if Supabase keys not set yet
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      sounds.playSuccess();
      onLoginSuccess({
        id: 'usr-google-demo',
        name: 'Alex Miller',
        email: 'njersey382@gmail.com',
        phone: '+91 9391216686',
        farmName: 'Miller Organic Field Station',
        location: 'Kansas City, MO (Zone 6A)',
        avatar: AVATAR,
        isLoggedIn: true,
        memberSince: 'March 2024',
        kisanId: 'FARMIN-KISAN-9831',
        role: 'Verified Google Account Grower',
      });
    }, 700);
  };

  // Handles Email Sign In or Sign Up
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }
    sounds.playClick();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isSupabaseConfigured) {
      try {
        if (intent === 'signup') {
          const res = await registerFarmerWithEmail(email, password, {
            name: fullName.trim() || 'Grower',
            phone: phone.trim(),
            farmName: farmName.trim(),
            cropType,
          });

          if (res.user) {
            sounds.playSuccess();
            const profile = (await fetchFarmerProfile(res.user.id)) || {
              id: res.user.id,
              name: fullName.trim() || 'Grower',
              email: email.trim(),
              phone: phone.trim(),
              farmName: farmName.trim() || 'My Farmstead',
              location: 'Select Location',
              avatar: AVATAR,
              isLoggedIn: true,
              memberSince: 'October 2026',
              kisanId: `FARMIN-${res.user.id.slice(0, 4).toUpperCase()}`,
              role: `Grower (${cropType})`,
            };
            onLoginSuccess(profile);
          } else {
            setSuccessMessage('Registration email sent! Please check your inbox to confirm.');
          }
        } else {
          // Sign In
          const { data, error } = await signInFarmerWithEmail(email, password);
          if (error) throw error;

          if (data.user) {
            sounds.playSuccess();
            const profile = await fetchFarmerProfile(data.user.id);
            if (profile) {
              onLoginSuccess(profile);
            } else {
              const nameFromEmail = email.split('@')[0];
              onLoginSuccess({
                id: data.user.id,
                name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
                email: email.trim(),
                phone: phone.trim(),
                farmName: 'My Farmstead',
                location: 'Select Location',
                avatar: AVATAR,
                isLoggedIn: true,
                memberSince: 'October 2026',
                kisanId: `FARMIN-${data.user.id.slice(0, 4).toUpperCase()}`,
                role: 'Verified Grower',
              });
            }
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Demo fallback when Supabase keys are pending
    setTimeout(() => {
      setIsLoading(false);
      sounds.playSuccess();
      const nameFromEmail = email.split('@')[0];
      const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
      onLoginSuccess({
        id: `usr-demo-${Math.floor(100000 + Math.random() * 900000)}`,
        name: intent === 'signup' ? fullName : email.toLowerCase() === 'njersey382@gmail.com' ? 'Alex Miller' : formattedName,
        email: email.trim(),
        phone: '+91 9391216686',
        farmName: intent === 'signup' ? farmName : 'Miller Organic Field Station',
        location: 'Kansas City, MO (Zone 6A)',
        avatar: AVATAR,
        isLoggedIn: true,
        memberSince: 'October 2026',
        kisanId: 'FARMIN-KISAN-9831',
        role: intent === 'signup' ? `Grower (${cropType})` : 'Commercial Grower',
      });
    }, 700);
  };

  // Handles Sending OTP
  const handleSendOtp = async () => {
    if (!phone.trim()) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    sounds.playClick();
    setIsLoading(true);
    setErrorMessage(null);

    if (isSupabaseConfigured) {
      try {
        const { error } = await sendFarmerPhoneOtp(phone);
        if (error) throw error;
        setOtpSent(true);
        sounds.playDroplet();
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to dispatch SMS OTP.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Demo fallback
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      setOtpCode('939121');
      sounds.playDroplet();
    }, 600);
  };

  // Handles Phone OTP Verification
  const handlePhoneVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setErrorMessage('Please enter the verification code sent to your phone.');
      return;
    }
    sounds.playClick();
    setIsLoading(true);
    setErrorMessage(null);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await verifyFarmerPhoneOtp(phone, otpCode);
        if (error) throw error;
        if (data?.user) {
          sounds.playSuccess();
          const profile = await fetchFarmerProfile(data.user.id);
          if (profile) {
            onLoginSuccess(profile);
          } else {
            onLoginSuccess({
              id: data.user.id,
              name: 'Farmer',
              email: data.user.email || '',
              phone: `+91 ${phone.slice(-10)}`,
              farmName: 'My Farmstead',
              location: 'Select Location',
              avatar: AVATAR,
              isLoggedIn: true,
              memberSince: 'October 2026',
              kisanId: `FARMIN-${data.user.id.slice(0, 4).toUpperCase()}`,
              role: 'Verified Mobile Grower',
            });
          }
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'OTP verification failed.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Demo fallback
    setTimeout(() => {
      setIsLoading(false);
      sounds.playSuccess();
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      onLoginSuccess({
        id: `usr-phone-${Math.floor(100000 + Math.random() * 900000)}`,
        name: 'Alex Miller',
        email: 'njersey382@gmail.com',
        phone: `+91 ${cleanPhone.slice(-10)}`,
        farmName: 'Miller Organic Field Station',
        location: 'Kansas City, MO (Zone 6A)',
        avatar: AVATAR,
        isLoggedIn: true,
        memberSince: 'October 2026',
        kisanId: 'FARMIN-OTP-9391',
        role: 'Verified Mobile Grower',
      });
    }, 700);
  };

  const inputClass =
    'w-full bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl px-3.5 py-2.5 pl-10 text-xs text-[#F1F5F2] placeholder-[#9CAFA0]/50 outline-none transition-all';

  return (
    <main className="min-h-screen bg-[#0B110D] flex items-center justify-center p-4 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial from-[#84CC16]/5 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-md bg-[#111A13] border-2 border-[#1E2E21] rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-5 z-10 relative">
        {/* Supabase Status Banner */}
        {isSupabaseConfigured ? (
          <div className="px-3 py-1.5 bg-[#84CC16]/10 border border-[#84CC16]/30 rounded-xl flex items-center justify-between text-[11px] text-[#84CC16]">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#84CC16] animate-pulse" />
              Supabase Cloud Database Connected
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider bg-[#84CC16]/20 px-1.5 py-0.5 rounded">
              Live
            </span>
          </div>
        ) : (
          <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex flex-col gap-0.5">
            <span className="font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Supabase Keys Pending in Vercel
            </span>
            <span className="text-[10px] text-amber-200/80">
              Add VITE_SUPABASE_URL &amp; VITE_SUPABASE_ANON_KEY to save data to the cloud.
            </span>
          </div>
        )}

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-[#0B110D] border-2 border-[#84CC16] flex items-center justify-center text-[#84CC16] shadow-lg shadow-[#84CC16]/10">
            <span className="material-symbols-outlined text-[32px]">agriculture</span>
          </div>
          <div>
            <h1 className="font-['Space_Grotesk',sans-serif] text-xl font-black uppercase tracking-wider text-[#F1F5F2]">
              farmin <span className="text-[#84CC16]">Agro</span>
            </h1>
            <p className="text-xs text-[#9CAFA0] mt-0.5 font-medium">
              Agricultural Management &amp; Knowledge Hub
            </p>
          </div>
        </div>

        {/* Sign In vs Sign Up Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#0B110D] border border-[#1E2E21] rounded-xl text-xs font-['Space_Grotesk',sans-serif] font-bold">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIntent('signin');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              intent === 'signin'
                ? 'bg-[#84CC16] text-[#0B110D] shadow-md'
                : 'text-[#9CAFA0] hover:text-[#F1F5F2]'
            }`}
          >
            Farmer Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIntent('signup');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              intent === 'signup'
                ? 'bg-[#84CC16] text-[#0B110D] shadow-md'
                : 'text-[#9CAFA0] hover:text-[#F1F5F2]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Channel Selector: Email vs Phone (in signin mode) */}
        {intent === 'signin' && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setMode('email');
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-xl border-2 font-['Space_Grotesk',sans-serif] font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'email'
                  ? 'bg-[#16241A] border-[#84CC16] text-[#84CC16]'
                  : 'bg-[#0B110D] border-[#1E2E21] text-[#9CAFA0] hover:text-[#F1F5F2]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">mail</span>
              <span>Email</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setMode('phone');
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-xl border-2 font-['Space_Grotesk',sans-serif] font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'phone'
                  ? 'bg-[#16241A] border-[#84CC16] text-[#84CC16]'
                  : 'bg-[#0B110D] border-[#1E2E21] text-[#9CAFA0] hover:text-[#F1F5F2]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">smartphone</span>
              <span>Mobile OTP</span>
            </button>
          </div>
        )}

        {/* Alerts */}
        {errorMessage && (
          <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center gap-2 animate-shake">
            <span className="material-symbols-outlined text-red-400 text-[18px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-3 bg-[#84CC16]/10 border border-[#84CC16]/40 rounded-xl text-[#84CC16] text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* EMAIL FORM (Sign In & Sign Up) */}
        {(mode === 'email' || intent === 'signup') && (
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3.5">
            {intent === 'signup' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1.5">
                    Farmer Full Name
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9CAFA0] text-[18px]">
                      person
                    </span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="e.g. Ramesh Reddy"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1.5">
                      Farm Name
                    </label>
                    <input
                      type="text"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      placeholder="e.g. Green Valley"
                      className="w-full bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl px-3 py-2 text-xs text-[#F1F5F2] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1.5">
                      Main Crops
                    </label>
                    <input
                      type="text"
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                      placeholder="e.g. Rice, Cotton"
                      className="w-full bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl px-3 py-2 text-xs text-[#F1F5F2] outline-none"
                    />
                  </div>
                </div>
              </>
            )}

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
                  placeholder="farmer@farmin.ag"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0]">
                  Password
                </label>
                {intent === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setEmail('njersey382@gmail.com');
                      setPassword('farmin2026@Agri');
                    }}
                    className="text-[10px] text-[#84CC16] hover:underline font-bold"
                  >
                    Use Demo Password
                  </button>
                )}
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
                  placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#84CC16] hover:bg-[#99E321] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 border-2 border-[#84CC16] disabled:opacity-70 mt-1"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  <span>{intent === 'signup' ? 'Creating Account...' : 'Authenticating...'}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px] font-bold">
                    {intent === 'signup' ? 'person_add' : 'login'}
                  </span>
                  <span>{intent === 'signup' ? 'Register Farmer Account' : 'Sign In with Email'}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* PHONE FORM (Sign In mode) */}
        {mode === 'phone' && intent === 'signin' && (
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
        <div className="flex items-center gap-3 py-0.5">
          <div className="flex-grow h-px bg-[#1E2E21]" />
          <span className="text-[10px] uppercase tracking-widest text-[#9CAFA0] font-bold">or</span>
          <div className="flex-grow h-px bg-[#1E2E21]" />
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-2.5 bg-white hover:bg-neutral-100 text-[#111827] font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2.5 border border-white disabled:opacity-70"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
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
        </button>

        {/* Guest Option */}
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onContinueAsGuest();
          }}
          className="w-full py-2 text-[#9CAFA0] hover:text-[#F1F5F2] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">person_outline</span>
          Continue as Guest Farmer
        </button>
      </div>
    </main>
  );
};
