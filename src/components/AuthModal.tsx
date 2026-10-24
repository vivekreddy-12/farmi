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

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  defaultEmail?: string;
  defaultPhone?: string;
}

type AuthTab = 'google' | 'email' | 'phone' | 'register';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultEmail = 'njersey382@gmail.com',
  defaultPhone = '9391216686',
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('email');

  // Email state
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('farmin2026@Agri');
  const [showPassword, setShowPassword] = useState(false);

  // Phone state
  const [phone, setPhone] = useState(defaultPhone);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Register state
  const [regName, setRegName] = useState('Alex Miller');
  const [regEmail, setRegEmail] = useState(defaultEmail);
  const [regPassword, setRegPassword] = useState('farmin2026@Agri');
  const [regPhone, setRegPhone] = useState(defaultPhone);
  const [regFarmName, setRegFarmName] = useState('Miller Organic Field Station');
  const [regCropType, setRegCropType] = useState('Corn & Soybeans');

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    sounds.playClick();
    setIsLoading(true);
    setErrorMessage(null);

    if (isSupabaseConfigured) {
      try {
        await signInFarmerWithGoogle();
      } catch (err: any) {
        setIsLoading(false);
        setErrorMessage(err.message || 'Google sign in failed');
      }
      return;
    }

    setTimeout(() => {
      setIsLoading(false);
      sounds.playSuccess();
      const user: UserProfile = {
        id: 'usr-google-938210',
        name: 'Alex Miller',
        email: 'njersey382@gmail.com',
        phone: '+91 9391216686',
        farmName: 'Miller Organic Field Station',
        location: 'Kansas City, MO (Zone 6A)',
        avatar: DEFAULT_AVATAR,
        isLoggedIn: true,
        memberSince: 'March 2024',
        kisanId: 'FARMIN-KISAN-9831',
        role: 'Verified Google Account Grower',
      };
      onLoginSuccess(user);
      onClose();
    }, 800);
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

    if (isSupabaseConfigured) {
      try {
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
              avatar: DEFAULT_AVATAR,
              isLoggedIn: true,
              memberSince: 'October 2026',
              kisanId: `FARMIN-${data.user.id.slice(0, 4).toUpperCase()}`,
              role: 'Commercial Grower',
            });
          }
          onClose();
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Invalid credentials or user not found.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setTimeout(() => {
      setIsLoading(false);
      sounds.playSuccess();
      const nameFromEmail = email.split('@')[0];
      const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

      const user: UserProfile = {
        id: `usr-email-${Math.floor(100000 + Math.random() * 900000)}`,
        name: email.toLowerCase() === 'njersey382@gmail.com' ? 'Alex Miller' : formattedName,
        email: email.trim(),
        phone: '+91 9391216686',
        farmName: 'Miller Organic Field Station',
        location: 'Kansas City, MO (Zone 6A)',
        avatar: DEFAULT_AVATAR,
        isLoggedIn: true,
        memberSince: 'September 2026',
        kisanId: 'FARMIN-KISAN-9831',
        role: 'Commercial Grower',
      };
      onLoginSuccess(user);
      onClose();
    }, 700);
  };

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

    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      setOtpCode('939121');
      sounds.playDroplet();
    }, 600);
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
              avatar: DEFAULT_AVATAR,
              isLoggedIn: true,
              memberSince: 'October 2026',
              kisanId: `FARMIN-${data.user.id.slice(0, 4).toUpperCase()}`,
              role: 'Verified Mobile Grower',
            });
          }
          onClose();
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'OTP verification failed.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setTimeout(() => {
      setIsLoading(false);
      sounds.playSuccess();
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const user: UserProfile = {
        id: `usr-phone-${Math.floor(100000 + Math.random() * 900000)}`,
        name: 'Alex Miller',
        email: 'njersey382@gmail.com',
        phone: `+91 ${cleanPhone.slice(-10)}`,
        farmName: 'Miller Organic Field Station',
        location: 'Kansas City, MO (Zone 6A)',
        avatar: DEFAULT_AVATAR,
        isLoggedIn: true,
        memberSince: 'September 2026',
        kisanId: 'FARMIN-OTP-9391',
        role: 'Verified Mobile Grower',
      };
      onLoginSuccess(user);
      onClose();
    }, 700);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMessage('Please provide your name, email, and a password.');
      return;
    }

    sounds.playClick();
    setIsLoading(true);
    setErrorMessage(null);

    if (isSupabaseConfigured) {
      try {
        const res = await registerFarmerWithEmail(regEmail, regPassword, {
          name: regName.trim(),
          phone: regPhone.trim(),
          farmName: regFarmName.trim(),
          cropType: regCropType,
        });

        if (res.user) {
          sounds.playSuccess();
          const profile = (await fetchFarmerProfile(res.user.id)) || {
            id: res.user.id,
            name: regName.trim(),
            email: regEmail.trim(),
            phone: regPhone ? `+91 ${regPhone.replace(/[^0-9]/g, '').slice(-10)}` : '+91 9391216686',
            farmName: regFarmName.trim() || 'My Farmstead',
            location: 'Kansas City, MO (Zone 6A)',
            avatar: DEFAULT_AVATAR,
            isLoggedIn: true,
            memberSince: 'October 2026',
            kisanId: `FARMIN-${res.user.id.slice(0, 4).toUpperCase()}`,
            role: `Grower (${regCropType})`,
          };
          onLoginSuccess(profile);
          onClose();
        } else {
          setInfoMessage('Account created! Check your email to confirm registration.');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Registration failed.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setTimeout(() => {
      setIsLoading(false);
      sounds.playSuccess();
      const user: UserProfile = {
        id: `usr-reg-${Math.floor(100000 + Math.random() * 900000)}`,
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone ? `+91 ${regPhone.replace(/[^0-9]/g, '').slice(-10)}` : '+91 9391216686',
        farmName: regFarmName.trim() || 'My Farmstead',
        location: 'Kansas City, MO (Zone 6A)',
        avatar: DEFAULT_AVATAR,
        isLoggedIn: true,
        memberSince: 'October 2026',
        kisanId: `FARMIN-${Math.floor(1000 + Math.random() * 9000)}`,
        role: `Grower (${regCropType})`,
      };
      onLoginSuccess(user);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up font-['Plus_Jakarta_Sans',sans-serif]">
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
                  ? 'Join farmin Agro for cloud sync & live agronomy'
                  : 'Access your cloud orders, soil scans & crop plans'}
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

        {/* Supabase Status Banner inside Modal */}
        {isSupabaseConfigured ? (
          <div className="px-4 py-1.5 bg-[#84CC16]/10 border-b border-[#84CC16]/20 flex items-center justify-between text-[11px] text-[#84CC16]">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#84CC16] animate-pulse" />
              Supabase Database Connected
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider bg-[#84CC16]/20 px-1.5 py-0.2 rounded">
              Real Cloud Sync
            </span>
          </div>
        ) : (
          <div className="px-4 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-[10px] text-amber-300 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">info</span>
            <span>Demo Mode active. Connect Supabase keys in Vercel to save data in cloud.</span>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="p-3 bg-[#0B110D] border-b border-[#1E2E21] grid grid-cols-4 gap-1.5 text-xs">
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
            <span className="text-[10px] uppercase tracking-wider font-extrabold">Sign Up</span>
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
            <span className="text-[10px] uppercase tracking-wider font-extrabold">Phone</span>
          </button>

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
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center gap-2 animate-shake">
              <span className="material-symbols-outlined text-red-400 text-[18px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3 bg-[#84CC16]/10 border border-[#84CC16]/40 rounded-xl text-[#84CC16] text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span>{infoMessage}</span>
            </div>
          )}

          {/* TAB 1: GOOGLE */}
          {activeTab === 'google' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto shadow-lg shadow-white/5 border border-white">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
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
              </div>

              <div>
                <h3 className="font-['Space_Grotesk',sans-serif] font-bold text-sm text-[#F1F5F2]">
                  One-Tap Google Authentication
                </h3>
                <p className="text-xs text-[#9CAFA0] mt-1 max-w-xs mx-auto">
                  Instant sign-in with your Google Farmer profile.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 bg-white hover:bg-neutral-100 text-[#111827] font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 border-2 border-white disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">login</span>
                    <span>Sign In with Google</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: EMAIL */}
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
                    placeholder="farmer@farmin.ag"
                    className="w-full bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl px-3.5 py-2.5 pl-10 text-xs text-[#F1F5F2] outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0]">
                    Password
                  </label>
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
                    placeholder="Account password"
                    className="w-full bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-xs text-[#F1F5F2] outline-none"
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#84CC16] hover:bg-[#99E321] text-[#0B110D] font-['Space_Grotesk',sans-serif] text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 border-2 border-[#84CC16] mt-2"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    <span>Authenticating...</span>
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

          {/* TAB 3: PHONE */}
          {activeTab === 'phone' && (
            <div className="space-y-3.5">
              {!otpSent ? (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1.5">
                      10-Digit Mobile Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#84CC16] font-mono text-xs font-bold">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9391216686"
                        maxLength={10}
                        className="w-full bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl px-3.5 py-2.5 pl-12 text-xs text-[#F1F5F2] outline-none"
                      />
                    </div>
                  </div>

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
                      placeholder="Enter OTP"
                      maxLength={6}
                      className="w-full text-center tracking-[0.5em] text-lg font-mono py-2.5 bg-[#0B110D] border-2 border-[#84CC16] rounded-xl text-[#F1F5F2] font-bold outline-none"
                    />
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
                        <span>Verify &amp; Sign In</span>
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
                  placeholder="e.g. Ramesh Reddy"
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
                    placeholder="farmer@farmin.ag"
                    className="w-full px-3 py-2 bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl text-xs text-[#F1F5F2] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    placeholder="Create password"
                    className="w-full px-3 py-2 bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl text-xs text-[#F1F5F2] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="9391216686"
                    className="w-full px-3 py-2 bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl text-xs text-[#F1F5F2] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9CAFA0] mb-1">
                    Farm Name
                  </label>
                  <input
                    type="text"
                    value={regFarmName}
                    onChange={(e) => setRegFarmName(e.target.value)}
                    placeholder="Green Valley Farms"
                    className="w-full px-3 py-2 bg-[#0B110D] border-2 border-[#1E2E21] focus:border-[#84CC16] rounded-xl text-xs text-[#F1F5F2] outline-none"
                  />
                </div>
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
                  <option value="Rice & Wheat">Rice &amp; Wheat (Grains)</option>
                  <option value="Corn & Soybeans">Corn &amp; Soybeans (Row Crops)</option>
                  <option value="Cotton & Sugarcane">Cotton &amp; Sugarcane</option>
                  <option value="Horticulture & Fruits">Horticulture, Vineyards &amp; Fruits</option>
                  <option value="Vegetables & Greens">Vegetables &amp; Greens</option>
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
                    <span>Creating Account &amp; Syncing Profile...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px] font-bold">how_to_reg</span>
                    <span>Register &amp; Save Profile to Cloud</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Disclaimer */}
          <div className="pt-2 border-t border-[#1E2E21] text-center text-[10px] text-[#9CAFA0]">
            <span>Need login assistance? Call Agronomy Hotline: </span>
            <strong className="text-[#84CC16]">1800-419-AGRO</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
