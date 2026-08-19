import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User as UserIcon,
  LogIn,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  X,
  FileText,
} from 'lucide-react';
import { User, ThemeMode } from '../types';

interface WelcomeAuthScreenProps {
  onAuthenticate: (user: Partial<User>) => void;
  onContinueAsGuest?: () => void;
  theme?: ThemeMode;
}

type AuthViewMode = 'welcome' | 'signup' | 'signin';
type SignupMethod = 'email' | 'mobile';

export const WelcomeAuthScreen: React.FC<WelcomeAuthScreenProps> = ({
  onAuthenticate,
  onContinueAsGuest,
}) => {
  const [viewMode, setViewMode] = useState<AuthViewMode>('welcome');
  const [signupMethod, setSignupMethod] = useState<SignupMethod>('email');
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Legal Modals
  const [activeLegalModal, setActiveLegalModal] = useState<'terms' | 'privacy' | null>(null);

  // Handle Google / Gmail Authentication
  const handleGoogleSignIn = () => {
    onAuthenticate({
      name: 'Harwinder Banga',
      username: 'harwinder.banga',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      bio: 'Creating vibes on Funshann ✨ | Connected with Google',
    });
  };

  // Handle Facebook Authentication
  const handleFacebookSignIn = () => {
    onAuthenticate({
      name: 'Harwinder Singh',
      username: 'harwinder_singh',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      bio: 'Sharing moments & building real connections on Funshann 💙',
    });
  };

  // Handle Email Sign In / Registration
  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    if (viewMode === 'signup' && !fullName) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const nameToUse = fullName.trim() || email.split('@')[0] || 'Funshann Creator';
    const cleanUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') || 'fun_user';

    onAuthenticate({
      name: nameToUse,
      username: cleanUsername,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      bio: `Hello from ${nameToUse} on Funshann 📸✨`,
    });
  };

  // Handle Mobile Sign In / OTP
  const handleSubmitMobile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!phone) {
      setErrorMessage('Please enter your mobile phone number.');
      return;
    }

    if (!isOtpSent) {
      setIsOtpSent(true);
      return;
    }

    if (!otpCode || otpCode.length < 4) {
      setErrorMessage('Please enter the 4-digit verification code.');
      return;
    }

    const nameToUse = fullName.trim() || `Member_${phone.slice(-4)}`;
    onAuthenticate({
      name: nameToUse,
      username: `user_${phone.slice(-4)}`,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      bio: `Mobile verified member on Funshann 🚀`,
    });
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-gradient-to-b from-[#F2F6FC] via-[#EDF3FA] to-[#E5EEF9] text-[#1E293B] flex flex-col justify-between overflow-hidden px-6 py-8 select-none font-sans">
      {/* 3D Floating Marbles & Background Accents */}
      {/* Top Left Glossy Blue 3D Sphere */}
      <div className="absolute top-10 left-6 w-9 h-9 rounded-full bg-gradient-to-br from-[#60A5FA] via-[#2563EB] to-[#1D4ED8] shadow-[0_10px_20px_rgba(37,99,235,0.35),inset_0_2px_4px_rgba(255,255,255,0.6)] pointer-events-none transform -rotate-12">
        <div className="absolute top-1.5 left-2 w-3 h-2 rounded-full bg-white/70 blur-[0.5px]" />
      </div>

      {/* Middle Left Glossy Pearl Sphere */}
      <div className="absolute top-48 left-8 w-7 h-7 rounded-full bg-gradient-to-br from-white via-[#F1F5F9] to-[#CBD5E1] shadow-[0_8px_16px_rgba(148,163,184,0.35),inset_0_2px_4px_rgba(255,255,255,0.9)] pointer-events-none">
        <div className="absolute top-1 left-1.5 w-2 h-1.5 rounded-full bg-white blur-[0.3px]" />
      </div>

      {/* Top Right Glossy Pearl Sphere */}
      <div className="absolute top-14 right-16 w-8 h-8 rounded-full bg-gradient-to-br from-white via-[#F8FAFC] to-[#CBD5E1] shadow-[0_10px_18px_rgba(148,163,184,0.3),inset_0_2px_4px_rgba(255,255,255,0.9)] pointer-events-none">
        <div className="absolute top-1.5 left-2 w-2.5 h-1.5 rounded-full bg-white blur-[0.3px]" />
      </div>

      {/* Center-Right Small Blue Sphere */}
      <div className="absolute top-52 right-8 w-5 h-5 rounded-full bg-gradient-to-br from-[#60A5FA] to-[#1D4ED8] shadow-[0_6px_14px_rgba(37,99,235,0.4),inset_0_1.5px_3px_rgba(255,255,255,0.7)] pointer-events-none">
        <div className="absolute top-0.5 left-1 w-1.5 h-1 rounded-full bg-white/80" />
      </div>

      {/* Dot Grid Accents */}
      <div className="absolute top-6 right-6 grid grid-cols-4 gap-2 opacity-30 pointer-events-none">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={`tr-dot-${i}`} className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
        ))}
      </div>

      <div className="absolute top-64 left-4 grid grid-cols-3 gap-2 opacity-30 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={`ml-dot-${i}`} className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
        ))}
      </div>

      {/* Subtle Wavy Backdrop at Bottom */}
      <div className="absolute -bottom-16 left-0 right-0 h-64 bg-gradient-to-t from-[#DCE7F6]/60 to-transparent pointer-events-none rounded-[100%] scale-150 blur-xl" />

      {/* MAIN CONTAINER CONTENT */}
      <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center my-auto">
        <AnimatePresence mode="wait">
          {/* ============================================================ */}
          {/* 1. PRIMARY WELCOME VIEW (Matches Exact Screenshot Mockup)    */}
          {/* ============================================================ */}
          {viewMode === 'welcome' && (
            <motion.div
              key="view-welcome"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col items-center text-center"
            >
              {/* Center Floating 3D Circular Medallion */}
              <div className="relative mb-6">
                <div className="w-64 h-64 rounded-full bg-gradient-to-b from-[#FFFFFF] to-[#F4F7FB] shadow-[0_24px_50px_-8px_rgba(100,116,139,0.32),0_10px_20px_-4px_rgba(148,163,184,0.2),inset_0_2px_6px_rgba(255,255,255,0.95)] flex items-center justify-center border border-white/80 p-2">
                  {/* 3D Typographic Brand Emblem */}
                  <div className="flex items-center justify-center tracking-tight font-extrabold text-[3.1rem] leading-none select-none">
                    {/* "Fun" in 3D Glossy Onyx Black */}
                    <span className="text-[#1E242E] drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] relative font-black">
                      Fun
                    </span>
                    {/* "shann" in 3D Royal Blue with Specular Depth */}
                    <span className="text-[#2F7CF6] drop-shadow-[0_4px_10px_rgba(37,99,235,0.45)] relative font-black ml-[1px]">
                      shann
                      {/* Glossy Blue Bead Accent over the last 'n' */}
                      <span className="absolute -top-1.5 -right-3 w-3 h-3 rounded-full bg-gradient-to-br from-[#60A5FA] to-[#1D4ED8] shadow-[0_3px_6px_rgba(37,99,235,0.45),inset_0_1px_2px_rgba(255,255,255,0.7)] inline-block" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Headings & Subtitle */}
              <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight">
                Welcome to <span className="text-[#2F7CF6]">Funshann</span>
              </h1>

              {/* Decorative Pill Divider with Blue Dot */}
              <div className="flex items-center justify-center gap-1.5 my-2.5">
                <div className="w-6 h-[2px] rounded-full bg-[#CBD5E1]" />
                <div className="w-2 h-2 rounded-full bg-[#2F7CF6] shadow-sm shadow-blue-500/50" />
                <div className="w-6 h-[2px] rounded-full bg-[#CBD5E1]" />
              </div>

              <p className="text-[13.5px] text-[#64748B] max-w-[260px] leading-relaxed mb-6">
                Connect with people, share moments, and build real connections. 💙
              </p>

              {/* Action Buttons Section */}
              <div className="w-full flex flex-col gap-3.5">
                {/* 1. Create New Account (Primary 3D Vibrant Blue Button) */}
                <button
                  id="btn-welcome-create-account"
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setViewMode('signup');
                  }}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#3B82F6] via-[#2F7AF6] to-[#1D63ED] text-white font-semibold text-[15px] flex items-center justify-between px-3.5 shadow-[0_12px_24px_-4px_rgba(37,99,235,0.38),0_4px_8px_-2px_rgba(37,99,235,0.2),inset_0_1.5px_2px_rgba(255,255,255,0.45)] border border-blue-400/40 active:scale-[0.98] transition-all hover:brightness-105"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.1)]">
                      <UserIcon className="w-5 h-5 text-[#2563EB]" />
                    </div>
                    <span className="font-bold tracking-tight">Create New Account</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/90 mr-1.5" />
                </button>

                {/* 2. Login to Existing Account (Neumorphic White Pill Button) */}
                <button
                  id="btn-welcome-login-account"
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setViewMode('signin');
                  }}
                  className="w-full h-14 rounded-2xl bg-white text-[#1E293B] font-semibold text-[15px] flex items-center justify-between px-3.5 shadow-[0_10px_22px_-4px_rgba(100,116,139,0.18),0_2px_6px_rgba(100,116,139,0.06),inset_0_1.5px_2px_rgba(255,255,255,0.9)] border border-[#E2E8F0] active:scale-[0.98] transition-all hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#F0F5FF] border border-[#DBEAFE] flex items-center justify-center shadow-sm">
                      <LogIn className="w-5 h-5 text-[#2563EB]" />
                    </div>
                    <span className="font-bold tracking-tight text-[#1E293B]">Login to Existing Account</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#94A3B8] mr-1.5" />
                </button>
              </div>

              {/* Or Continue With Section */}
              <div className="flex items-center gap-3 my-5 w-full">
                <div className="h-[1px] bg-[#CBD5E1]/80 flex-1" />
                <span className="text-xs text-[#64748B] font-medium whitespace-nowrap">or continue with</span>
                <div className="h-[1px] bg-[#CBD5E1]/80 flex-1" />
              </div>

              {/* Social Login Buttons (Google, Facebook, Mobile) */}
              <div className="flex items-center justify-center gap-4">
                {/* Google Circular 3D Button */}
                <button
                  id="btn-social-google"
                  type="button"
                  onClick={handleGoogleSignIn}
                  title="Sign in with Google / Gmail"
                  className="w-12 h-12 rounded-full bg-white border border-[#E2E8F0] shadow-[0_8px_16px_-2px_rgba(100,116,139,0.2),inset_0_1px_2px_#FFFFFF] flex items-center justify-center active:scale-95 transition-transform hover:bg-slate-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                </button>

                {/* Facebook Circular 3D Button */}
                <button
                  id="btn-social-facebook"
                  type="button"
                  onClick={handleFacebookSignIn}
                  title="Sign in with Facebook"
                  className="w-12 h-12 rounded-full bg-white border border-[#E2E8F0] shadow-[0_8px_16px_-2px_rgba(100,116,139,0.2),inset_0_1px_2px_#FFFFFF] flex items-center justify-center active:scale-95 transition-transform hover:bg-slate-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>

                {/* Quick Phone / SMS Button */}
                <button
                  id="btn-social-phone"
                  type="button"
                  onClick={() => {
                    setViewMode('signup');
                    setSignupMethod('mobile');
                  }}
                  title="Sign up / Login with Phone Number"
                  className="w-12 h-12 rounded-full bg-white border border-[#E2E8F0] shadow-[0_8px_16px_-2px_rgba(100,116,139,0.2),inset_0_1px_2px_#FFFFFF] flex items-center justify-center active:scale-95 transition-transform hover:bg-slate-50"
                >
                  <Phone className="w-5 h-5 text-[#10B981]" />
                </button>
              </div>

              {/* Guest Explore Mode Link */}
              {onContinueAsGuest && (
                <button
                  id="btn-explore-guest-mode"
                  type="button"
                  onClick={onContinueAsGuest}
                  className="mt-4 text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
                >
                  Explore as Guest →
                </button>
              )}
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* 2. CREATE ACCOUNT VIEW (Email & Mobile OTP Flow)             */}
          {/* ============================================================ */}
          {viewMode === 'signup' && (
            <motion.div
              key="view-signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-[0_20px_40px_-6px_rgba(100,116,139,0.22),inset_0_1px_2px_#FFFFFF] border border-[#E2E8F0]"
            >
              {/* Header with Back Button */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <button
                  type="button"
                  onClick={() => setViewMode('welcome')}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-lg font-extrabold text-[#1E293B]">Create Account</h2>
                <div className="w-8" />
              </div>

              {/* Signup Method Tabs (Email vs Mobile) */}
              <div className="flex bg-[#F1F5F9] p-1 rounded-2xl mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setSignupMethod('email');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    signupMethod === 'email'
                      ? 'bg-white text-[#2563EB] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Email Address
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSignupMethod('mobile');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    signupMethod === 'mobile'
                      ? 'bg-white text-[#2563EB] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Mobile Number
                </button>
              </div>

              {errorMessage && (
                <div className="p-2.5 mb-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              {/* EMAIL REGISTRATION FORM */}
              {signupMethod === 'email' && (
                <form onSubmit={handleSubmitEmail} className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Harwinder Banga"
                        required
                        className="w-full h-11 pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                        className="w-full h-11 pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        required
                        minLength={6}
                        className="w-full h-11 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 mt-2 bg-gradient-to-r from-[#3B82F6] via-[#2F7AF6] to-[#1D63ED] text-white font-bold rounded-xl text-sm shadow-[0_10px_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:brightness-105"
                  >
                    <span>Create Funshann Account</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* MOBILE OTP FORM */}
              {signupMethod === 'mobile' && (
                <form onSubmit={handleSubmitMobile} className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your name"
                        disabled={isOtpSent}
                        className="w-full h-11 pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:bg-white disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        disabled={isOtpSent}
                        required
                        className="w-full h-11 pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:bg-white disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {isOtpSent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-1"
                    >
                      <label className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mb-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Enter 4-Digit SMS Code (Default OTP: 1234)
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="1234"
                        autoFocus
                        required
                        className="w-full h-11 text-center tracking-[0.5em] text-lg font-black bg-emerald-50/50 border border-emerald-400 rounded-xl text-emerald-900 focus:outline-none focus:border-emerald-600"
                      />
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    className="w-full h-12 mt-2 bg-gradient-to-r from-[#3B82F6] via-[#2F7AF6] to-[#1D63ED] text-white font-bold rounded-xl text-sm shadow-[0_10px_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:brightness-105"
                  >
                    {isOtpSent ? (
                      <>
                        <span>Verify & Continue</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Send SMS Verification Code</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Toggle to Sign In */}
              <p className="text-center text-xs text-slate-500 mt-4">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setViewMode('signin')}
                  className="text-[#2563EB] font-bold hover:underline"
                >
                  Log In
                </button>
              </p>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* 3. SIGN IN VIEW (For Existing Accounts)                      */}
          {/* ============================================================ */}
          {viewMode === 'signin' && (
            <motion.div
              key="view-signin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-[0_20px_40px_-6px_rgba(100,116,139,0.22),inset_0_1px_2px_#FFFFFF] border border-[#E2E8F0]"
            >
              {/* Header with Back Button */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <button
                  type="button"
                  onClick={() => setViewMode('welcome')}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-lg font-extrabold text-[#1E293B]">Welcome Back</h2>
                <div className="w-8" />
              </div>

              {errorMessage && (
                <div className="p-2.5 mb-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmitEmail} className="flex flex-col gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email or Username</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full h-11 pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => alert('Password reset link sent to your registered email.')}
                      className="text-[11px] text-[#2563EB] font-semibold hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full h-11 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 mt-1 bg-gradient-to-r from-[#3B82F6] via-[#2F7AF6] to-[#1D63ED] text-white font-bold rounded-xl text-sm shadow-[0_10px_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:brightness-105"
                >
                  <span>Log In to Funshann</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>

              {/* Or Login with Social */}
              <div className="flex items-center gap-3 my-4">
                <div className="h-[1px] bg-slate-200 flex-1" />
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">or sign in with</span>
                <div className="h-[1px] bg-slate-200 flex-1" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
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
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleFacebookSignIn}
                  className="h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>

              {/* Toggle to Sign Up */}
              <p className="text-center text-xs text-slate-500 mt-4">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setViewMode('signup')}
                  className="text-[#2563EB] font-bold hover:underline"
                >
                  Create one
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============================================================ */}
      {/* 4. FOOTER TERMS & PRIVACY (Matches exact design)             */}
      {/* ============================================================ */}
      <div className="relative z-10 w-full text-center pt-4 pb-2 text-[12px] text-[#64748B]">
        <p className="leading-tight">
          By continuing, you agree to our{' '}
          <button
            type="button"
            onClick={() => setActiveLegalModal('terms')}
            className="text-[#2563EB] font-semibold hover:underline"
          >
            Terms of Service
          </button>{' '}
          and{' '}
          <button
            type="button"
            onClick={() => setActiveLegalModal('privacy')}
            className="text-[#2563EB] font-semibold hover:underline"
          >
            Privacy Policy
          </button>
        </p>
      </div>

      {/* ============================================================ */}
      {/* 5. LEGAL MODAL (Terms of Service / Privacy Policy)          */}
      {/* ============================================================ */}
      <AnimatePresence>
        {activeLegalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#2563EB]" />
                  <h3 className="font-bold text-slate-900 text-base">
                    {activeLegalModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveLegalModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
                <p>
                  Welcome to <strong>Funshann</strong>. By accessing or using our application, you agree to connect respectfully with our community.
                </p>
                <p>
                  <strong>Content & Ownership:</strong> You retain ownership of any media, stories, and messages you create and share on Funshann.
                </p>
                <p>
                  <strong>Data Protection & Encryption:</strong> All communications, voice notes, and private messages are encrypted and safeguarded.
                </p>
                <p>
                  <strong>Safety First:</strong> We maintain zero tolerance for harassment, hate speech, or malicious activities.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="w-full h-11 mt-4 bg-[#2563EB] text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-transform"
              >
                I Understand
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
