import React, { useState, useEffect } from 'react';
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
  Loader2,
  RefreshCw,
  Edit3,
  ExternalLink,
} from 'lucide-react';
import { User, ThemeMode } from '../types';
import { LegalDocumentsSubPage } from './settings/LegalDocumentsSubPage';
import {
  sendFirebasePhoneOtp,
  verifyFirebasePhoneOtp,
  signInWithGooglePopup,
  formatPhoneNumber,
  ConfirmationResult,
  syncUserProfileToFirestore,
  getUserProfileFromFirestore,
  getUserProfileByPhone,
  checkIfPhoneRegistered,
  clearRecaptchaVerifier,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  auth
} from '../services/firebase';

interface WelcomeAuthScreenProps {
  onContinueAsGuest?: () => void;
  onAuthenticate: (user: Partial<User>) => void;
  theme?: ThemeMode;
}

type AuthViewMode = 'welcome' | 'signup' | 'signin';
type SignupMethod = 'email' | 'mobile';

export const WelcomeAuthScreen: React.FC<WelcomeAuthScreenProps> = ({
  onContinueAsGuest,
  onAuthenticate,
}) => {
  const [viewMode, setViewMode] = useState<AuthViewMode>('welcome');
  const [signupMethod, setSignupMethod] = useState<SignupMethod>('email');
  const [signinMethod, setSigninMethod] = useState<'email' | 'mobile'>('email');
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [signupCountryCode, setSignupCountryCode] = useState('+91');
  const [signinCountryCode, setSigninCountryCode] = useState('+91');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');

  // Firebase Phone Auth States (Signup)
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [formattedNumberDisplay, setFormattedNumberDisplay] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Firebase Phone Auth States (Signin)
  const [isSigninOtpSent, setIsSigninOtpSent] = useState(false);
  const [signinConfirmationResult, setSigninConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [signinFormattedNumberDisplay, setSigninFormattedNumberDisplay] = useState('');
  const [isSigninSendingOtp, setIsSigninSendingOtp] = useState(false);
  const [isSigninVerifyingOtp, setIsSigninVerifyingOtp] = useState(false);
  const [signinOtpCode, setSigninOtpCode] = useState('');
  const [signinResendCooldown, setSigninResendCooldown] = useState(0);

  // General Error / Feedback Message
  const [errorMessage, setErrorMessage] = useState('');

  // Legal Modals
  const [activeLegalModal, setActiveLegalModal] = useState<'terms' | 'privacy' | null>(null);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Signin Resend Countdown Timer
  useEffect(() => {
    let timer: any;
    if (signinResendCooldown > 0) {
      timer = setTimeout(() => setSigninResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [signinResendCooldown]);

  const handleAutoFillOtp = async (isSignin: boolean) => {
    try {
      const text = await navigator.clipboard.readText();
      const digits = text.replace(/\D/g, '').slice(0, 6);
      if (digits.length === 6) {
        if (isSignin) setSigninOtpCode(digits);
        else setOtpCode(digits);
        return;
      }
    } catch {
      // fallback
    }
    if (isSignin) setSigninOtpCode('123456');
    else setOtpCode('123456');
  };

  // Clean up any active reCAPTCHA verifiers and check redirect auth results on mount
  useEffect(() => {
    // Check if user is returning from Google/Facebook redirect authentication flow
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const u = result.user;
          const existing = await getUserProfileFromFirestore(u.uid);
          const userObj: Partial<User> = {
            id: u.uid,
            name: u.displayName || existing?.name || 'Funshann Member',
            username: existing?.username || (u.displayName || u.email?.split('@')[0] || 'google_user').toLowerCase().replace(/[^a-z0-9_]/g, ''),
            email: u.email || undefined,
            avatar: u.photoURL || existing?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
            bio: existing?.bio || `Creating vibes on Funshann ✨ | Connected with Google`,
          };
          await syncUserProfileToFirestore(userObj);
          onAuthenticate(userObj as User);
        }
      })
      .catch((err) => {
        console.warn('Google redirect result check:', err);
      });

    return () => {
      clearRecaptchaVerifier('send-otp-btn');
    };
  }, []);

  // Handle Google / Gmail Authentication
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      // If app is embedded in an iframe preview, popup storage access might be restricted by browser security policies
      const isInIframe = window.self !== window.top;

      try {
        const res = await signInWithPopup(auth, provider);
        if (res.user) {
          const u = res.user;
          const existing = await getUserProfileFromFirestore(u.uid);
          const userObj: Partial<User> = {
            id: u.uid,
            name: u.displayName || existing?.name || 'Funshann Member',
            username: existing?.username || (u.displayName || u.email?.split('@')[0] || 'google_user').toLowerCase().replace(/[^a-z0-9_]/g, ''),
            email: u.email || undefined,
            avatar: u.photoURL || existing?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
            bio: existing?.bio || `Creating vibes on Funshann ✨ | Connected with Google`,
          };
          await syncUserProfileToFirestore(userObj);
          onAuthenticate(userObj as User);
        }
      } catch (popupErr: any) {
        if (
          popupErr?.code === 'auth/network-request-failed' ||
          popupErr?.message?.includes('network-request-failed')
        ) {
          if (isInIframe) {
            setErrorMessage(
              'Google Sign-In popup request was restricted inside preview iframe sandbox. Click below to open in a new tab or use Email / Phone Login.'
            );
          } else {
            // If full page, try redirect flow
            await signInWithRedirect(auth, provider);
          }
        } else {
          throw popupErr;
        }
      }
    } catch (error: any) {
      console.error('Google Sign-In note:', error);
      if (
        error?.code === 'auth/network-request-failed' ||
        error?.message?.includes('network-request-failed')
      ) {
        setErrorMessage(
          'Google Sign-In popup request was restricted inside preview iframe sandbox. Click below to open in a new tab or use Email / Phone Login.'
        );
      } else if (error?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Google Sign-In popup was closed before completing. Please try again.');
      } else if (error?.code === 'auth/popup-blocked') {
        setErrorMessage('Google Sign-In popup was blocked by browser settings. Please allow popups or open the app in a new tab.');
      } else {
        setErrorMessage(error?.message || 'Google Sign-In failed.');
      }
    }
  };

  // Handle Facebook Authentication
  const handleFacebookSignIn = async () => {
    setErrorMessage('');
    try {
      const provider = new FacebookAuthProvider();
      const res = await signInWithPopup(auth, provider);
      
      if (res.user) {
        const u = res.user;
        const existing = await getUserProfileFromFirestore(u.uid);
        
        const userObj: Partial<User> = {
          id: u.uid,
          name: u.displayName || existing?.name || 'Funshann Member',
          username: existing?.username || (u.displayName || u.email?.split('@')[0] || 'fb_user').toLowerCase().replace(/[^a-z0-9_]/g, ''),
          email: u.email || undefined,
          avatar: u.photoURL || existing?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
          bio: existing?.bio || 'Sharing moments & building real connections on Funshann 💙',
        };
        await syncUserProfileToFirestore(userObj);
        onAuthenticate(userObj as User);
      }
    } catch (error: any) {
      console.error('Facebook Sign-In note:', error);
      if (
        error?.code === 'auth/network-request-failed' ||
        error?.message?.includes('network-request-failed')
      ) {
        setErrorMessage(
          'Facebook Sign-In popup failed due to iframe restrictions. Please sign in using Email or Phone Number below, or open the app in a new tab.'
        );
      } else {
        setErrorMessage(error?.message || 'Facebook Sign-In failed or is not configured.');
      }
    }
  };

  // Handle Email Sign Up
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password || !fullName) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await sendEmailVerification(userCredential.user);
      
      const userId = userCredential.user.uid;
      const existingProfile = await getUserProfileFromFirestore(userId);
      
      const userProfile: Partial<User> = existingProfile || {
        id: userId,
        name: fullName.trim(),
        username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, ''),
        email: email.trim(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        bio: `Hello from ${fullName.trim()} on Funshann 📸✨`,
      };

      await syncUserProfileToFirestore(userProfile);
      setErrorMessage('Account created. Please verify your email before logging in.');
      setViewMode('signin');
    } catch (error: any) {
      console.error('Email Signup error:', error);
      if (
        error?.code === 'auth/email-already-in-use' ||
        error?.message?.includes('email-already-in-use') ||
        error?.message?.includes('already in use')
      ) {
        setErrorMessage('An account already exists with this email. Please log in.');
        setViewMode('signin');
      } else {
        setErrorMessage(error?.message || 'Email Signup failed.');
      }
    }
  };

  // Handle Email Sign In
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!userCredential.user.emailVerified) {
        setErrorMessage('Please verify your email address to log in.');
        return;
      }
      // Successfully authenticated
    } catch (error: any) {
      console.error('Email Login error:', error);
      setErrorMessage(error?.message || 'Email Login failed.');
    }
  };

  // Send real SMS OTP via Firebase Authentication (Signup)
  const handleSendOtp = async () => {
    setErrorMessage('');
    if (!phone || phone.trim().length < 7) {
      setErrorMessage('Please enter a valid mobile number.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const fullPhone = phone.trim().startsWith('+') ? phone.trim() : `${signupCountryCode}${phone.trim()}`;
      const isRegistered = await checkIfPhoneRegistered(fullPhone);
      if (isRegistered) {
        setErrorMessage('An account already exists with this phone number. Please log in.');
        setViewMode('signin');
        setIsSendingOtp(false);
        return;
      }

      const formatted = formatPhoneNumber(fullPhone);
      const res = await sendFirebasePhoneOtp(fullPhone, 'send-otp-btn');

      if (res.success && res.confirmationResult) {
        setConfirmationResult(res.confirmationResult);
        setFormattedNumberDisplay(formatted);
        setIsOtpSent(true);
        setResendCooldown(30);
        setOtpCode('');
      } else {
        if (
          res.error?.includes('billing-not-enabled') ||
          res.error?.includes('billing')
        ) {
          setErrorMessage('SMS auth requires active Firebase billing or configured Test Phone Numbers.');
        } else if (res.error?.includes('too-many-requests') || res.error?.includes('Too many attempts')) {
          setErrorMessage('Too many attempts. Please try again later.');
        } else if (res.error?.includes('invalid-phone-number') || res.error?.includes('Invalid phone number')) {
          setErrorMessage('Invalid phone number format.');
        } else {
          setErrorMessage(res.error || 'Failed to send SMS verification code. Please check your number.');
        }
      }
    } catch (err: any) {
      if (
        err?.code === 'auth/billing-not-enabled' ||
        err?.message?.includes('billing-not-enabled') ||
        err?.message?.includes('billing')
      ) {
        setErrorMessage('SMS auth requires active Firebase billing or configured Test Phone Numbers.');
      } else if (err?.code === 'auth/too-many-requests') {
        setErrorMessage('Too many attempts. Please try again later.');
      } else if (err?.code === 'auth/invalid-phone-number') {
        setErrorMessage('Invalid phone number format.');
      } else {
        setErrorMessage(err?.message || 'An unexpected error occurred while sending SMS code.');
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Sign-in Send SMS OTP
  const handleSigninSendOtp = async () => {
    setErrorMessage('');
    if (!phone || phone.trim().length < 7) {
      setErrorMessage('Please enter a valid mobile number.');
      return;
    }

    setIsSigninSendingOtp(true);
    try {
      const fullPhone = phone.trim().startsWith('+') ? phone.trim() : `${signinCountryCode}${phone.trim()}`;
      const isRegistered = await checkIfPhoneRegistered(fullPhone);
      if (!isRegistered) {
        setErrorMessage('This phone number is not registered. Please create an account.');
        setIsSigninSendingOtp(false);
        return;
      }

      const formatted = formatPhoneNumber(fullPhone);
      const res = await sendFirebasePhoneOtp(fullPhone, 'signin-otp-btn');

      if (res.success && res.confirmationResult) {
        setSigninConfirmationResult(res.confirmationResult);
        setSigninFormattedNumberDisplay(formatted);
        setIsSigninOtpSent(true);
        setSigninResendCooldown(30);
        setSigninOtpCode('');
      } else {
        if (
          res.error?.includes('billing-not-enabled') ||
          res.error?.includes('billing')
        ) {
          setErrorMessage('SMS auth requires active Firebase billing or configured Test Phone Numbers.');
        } else if (res.error?.includes('too-many-requests') || res.error?.includes('Too many attempts')) {
          setErrorMessage('Too many attempts. Please try again later.');
        } else if (res.error?.includes('invalid-phone-number') || res.error?.includes('Invalid phone number')) {
          setErrorMessage('Invalid phone number format.');
        } else {
          setErrorMessage(res.error || 'Failed to send SMS verification code. Please check your number.');
        }
      }
    } catch (err: any) {
      if (
        err?.code === 'auth/billing-not-enabled' ||
        err?.message?.includes('billing-not-enabled') ||
        err?.message?.includes('billing')
      ) {
        setErrorMessage('SMS auth requires active Firebase billing or configured Test Phone Numbers.');
      } else if (err?.code === 'auth/too-many-requests') {
        setErrorMessage('Too many attempts. Please try again later.');
      } else if (err?.code === 'auth/invalid-phone-number') {
        setErrorMessage('Invalid phone number format.');
      } else {
        setErrorMessage(err?.message || 'An unexpected error occurred while sending SMS code.');
      }
    } finally {
      setIsSigninSendingOtp(false);
    }
  };

  // Sign-in Verify OTP for existing account
  const handleSigninVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isSigninOtpSent || !signinConfirmationResult) {
      setErrorMessage('Please request an SMS verification code first.');
      return;
    }

    if (!signinOtpCode || signinOtpCode.trim().length < 6) {
      setErrorMessage('Please enter the complete 6-digit SMS verification code.');
      return;
    }

    setIsSigninVerifyingOtp(true);
    try {
      const res = await verifyFirebasePhoneOtp(signinConfirmationResult, signinOtpCode);

      if (res.success && res.user) {
        const firebaseUser = res.user;
        const fullPhone = phone.trim().startsWith('+') ? phone.trim() : `${signinCountryCode}${phone.trim()}`;

        let existingProfile = await getUserProfileFromFirestore(firebaseUser.uid);
        if (!existingProfile) {
          existingProfile = await getUserProfileByPhone(fullPhone);
        }

        const userProfile: Partial<User> = existingProfile || {
          id: firebaseUser.uid,
          name: `Member_${phone.slice(-4)}`,
          username: `user_${phone.slice(-4)}`,
          mobileNumber: firebaseUser.phoneNumber || signinFormattedNumberDisplay || fullPhone,
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
          bio: 'Mobile verified member on Funshann 🚀',
        };

        if (existingProfile && existingProfile.id) {
          userProfile.id = existingProfile.id;
        }

        await syncUserProfileToFirestore(userProfile);
        onAuthenticate(userProfile as User);
      } else {
        setErrorMessage(res.error || 'Incorrect SMS code entered. Please check your messages and try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to verify the SMS code. Please try again.');
    } finally {
      setIsSigninVerifyingOtp(false);
    }
  };

  // Verify real Firebase SMS OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isOtpSent || !confirmationResult) {
      setErrorMessage('Please request an SMS verification code first.');
      return;
    }

    if (!otpCode || otpCode.trim().length < 6) {
      setErrorMessage('Please enter the complete 6-digit SMS verification code.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await verifyFirebasePhoneOtp(confirmationResult, otpCode);

      if (res.success && res.user) {
        const firebaseUser = res.user;
        const existingProfile = await getUserProfileFromFirestore(firebaseUser.uid);

        const nameToUse = fullName.trim() || existingProfile?.name || `Member_${phone.slice(-4)}`;
        const userProfile: Partial<User> = {
          id: firebaseUser.uid,
          name: nameToUse,
          username: existingProfile?.username || `user_${phone.slice(-4)}`,
          mobileNumber: firebaseUser.phoneNumber || formattedNumberDisplay || phone,
          avatar: existingProfile?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
          bio: existingProfile?.bio || `Mobile verified member on Funshann 🚀`,
        };

        await syncUserProfileToFirestore(userProfile);
        onAuthenticate(userProfile);
      } else {
        setErrorMessage(res.error || 'Incorrect SMS code entered. Please check your messages and try again.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to verify the SMS code. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Reset back to Phone input to change phone number
  const handleChangePhoneNumber = () => {
    setIsOtpSent(false);
    setConfirmationResult(null);
    setOtpCode('');
    setErrorMessage('');
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
                <div className="w-64 h-64 rounded-full bg-gradient-to-b from-[#FFFFFF] to-[#F4F7FB] shadow-[0_24px_50px_-8px_rgba(100,116,139,0.32),0_10px_20px_-4px_rgba(148,163,184,0.2),inset_0_2px_6px_rgba(255,255,255,0.95)] flex items-center justify-center border border-white/80 p-3 overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="Funshann Official Logo"
                    className="w-full h-full object-cover rounded-full shadow-inner"
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23ffffff'/%3E%3Ctext x='50' y='68' font-size='55' font-weight='bold' text-anchor='middle' fill='%23000000' font-family='sans-serif'%3EF%3C/text%3E%3C/svg%3E";
                    }}
                  />
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
                <div className="p-2.5 mb-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium flex flex-col gap-2">
                  <span>{errorMessage}</span>
                  {(errorMessage.includes('new tab') || errorMessage.includes('iframe')) && (
                    <button
                      type="button"
                      onClick={() => window.open(window.location.href, '_blank')}
                      className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold shadow-2xs hover:bg-blue-700 transition flex items-center justify-center gap-1.5 w-fit"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open App in New Tab</span>
                    </button>
                  )}
                </div>
              )}

              {/* EMAIL REGISTRATION FORM */}
              {signupMethod === 'email' && (
                <form onSubmit={handleEmailSignup} className="flex flex-col gap-3">
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
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (isOtpSent) {
                      handleVerifyOtp(e);
                    } else {
                      handleSendOtp();
                    }
                  }}
                  className="flex flex-col gap-3"
                >
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your name"
                        disabled={isOtpSent || isSendingOtp}
                        className="w-full h-11 pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:bg-white disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">Mobile Phone Number</label>
                      {isOtpSent && (
                        <button
                          type="button"
                          onClick={handleChangePhoneNumber}
                          className="text-[11px] font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Change Number</span>
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={signupCountryCode}
                        onChange={(e) => setSignupCountryCode(e.target.value)}
                        disabled={isOtpSent || isSendingOtp}
                        aria-label="Country Code"
                        className="h-11 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#2563EB] disabled:opacity-60"
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+81">🇯🇵 +81</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+55">🇧🇷 +55</option>
                        <option value="+52">🇲🇽 +52</option>
                      </select>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="98765 43210"
                          disabled={isOtpSent || isSendingOtp}
                          required
                          className="w-full h-11 pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:bg-white disabled:opacity-60"
                        />
                      </div>
                    </div>
                  </div>

                  {isOtpSent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-1 flex flex-col gap-2"
                    >
                      <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
                          <span className="font-medium text-[11.5px]">
                            SMS sent to <span className="font-bold">{formattedNumberDisplay || phone}</span>
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-800">
                            Enter 6-Digit SMS Verification Code
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAutoFillOtp(false)}
                            className="text-[11px] font-bold text-[#2563EB] hover:underline flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md"
                          >
                            <span>⚡ Auto-fill / Paste</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="••••••"
                          autoFocus
                          required
                          disabled={isVerifyingOtp}
                          className="w-full h-12 text-center tracking-[0.45em] text-xl font-bold font-mono bg-slate-50 border-2 border-blue-500/80 rounded-xl text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white disabled:opacity-60"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-500">Didn't receive SMS?</span>
                        <button
                          type="button"
                          disabled={resendCooldown > 0 || isSendingOtp}
                          onClick={handleSendOtp}
                          className="text-[11px] font-bold text-[#2563EB] hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1"
                        >
                          <RefreshCw className={`w-3 h-3 ${isSendingOtp ? 'animate-spin' : ''}`} />
                          <span>
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend SMS Code'}
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <button
                    id="send-otp-btn"
                    type="submit"
                    disabled={isSendingOtp || isVerifyingOtp}
                    className="w-full h-12 mt-2 bg-gradient-to-r from-[#3B82F6] via-[#2F7AF6] to-[#1D63ED] text-white font-bold rounded-xl text-sm shadow-[0_10px_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:brightness-105 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isSendingOtp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending SMS Code...</span>
                      </>
                    ) : isVerifyingOtp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : isOtpSent ? (
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
                <div className="p-2.5 mb-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium flex flex-col gap-2">
                  <span>{errorMessage}</span>
                  {(errorMessage.includes('new tab') || errorMessage.includes('iframe')) && (
                    <button
                      type="button"
                      onClick={() => window.open(window.location.href, '_blank')}
                      className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold shadow-2xs hover:bg-blue-700 transition flex items-center justify-center gap-1.5 w-fit"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open App in New Tab</span>
                    </button>
                  )}
                </div>
              )}

              {/* Sign In Method Tabs (Email vs Mobile) */}
              <div className="flex bg-[#F1F5F9] p-1 rounded-2xl mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setSigninMethod('email');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    signinMethod === 'email'
                      ? 'bg-white text-[#2563EB] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Email Address
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSigninMethod('mobile');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    signinMethod === 'mobile'
                      ? 'bg-white text-[#2563EB] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Mobile Number
                </button>
              </div>

              {/* EMAIL LOGIN FORM */}
              {signinMethod === 'email' && (
                <form onSubmit={handleEmailLogin} className="flex flex-col gap-3.5">
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
              )}

              {/* MOBILE LOGIN OTP FORM */}
              {signinMethod === 'mobile' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (isSigninOtpSent) {
                      handleSigninVerifyOtp(e);
                    } else {
                      handleSigninSendOtp();
                    }
                  }}
                  className="flex flex-col gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">Mobile Phone Number</label>
                      {isSigninOtpSent && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsSigninOtpSent(false);
                            setSigninConfirmationResult(null);
                            setSigninOtpCode('');
                            setErrorMessage('');
                          }}
                          className="text-[11px] font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Change Number</span>
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={signinCountryCode}
                        onChange={(e) => setSigninCountryCode(e.target.value)}
                        disabled={isSigninOtpSent || isSigninSendingOtp}
                        aria-label="Country Code"
                        className="h-11 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#2563EB] disabled:opacity-60"
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+81">🇯🇵 +81</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+55">🇧🇷 +55</option>
                        <option value="+52">🇲🇽 +52</option>
                      </select>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="98765 43210"
                          disabled={isSigninOtpSent || isSigninSendingOtp}
                          required
                          className="w-full h-11 pl-10 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#2563EB] focus:bg-white disabled:opacity-60"
                        />
                      </div>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 mb-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium flex flex-col gap-1.5">
                      <span>{errorMessage}</span>
                      {(errorMessage.includes('new tab') || errorMessage.includes('iframe')) && (
                        <button
                          type="button"
                          onClick={() => window.open(window.location.href, '_blank')}
                          className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold shadow-2xs hover:bg-blue-700 transition flex items-center justify-center gap-1.5 w-fit my-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open App in New Tab</span>
                        </button>
                      )}
                      {errorMessage.toLowerCase().includes('not registered') && (
                        <button
                          type="button"
                          onClick={() => {
                            setViewMode('signup');
                            setSignupMethod('mobile');
                            setErrorMessage('');
                          }}
                          className="text-[11px] font-bold text-[#2563EB] hover:underline text-left flex items-center gap-1"
                        >
                          <span>No account found? Create Account / Sign Up →</span>
                        </button>
                      )}
                    </div>
                  )}

                  {isSigninOtpSent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-1 flex flex-col gap-2"
                    >
                      <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
                          <span className="font-medium text-[11.5px]">
                            SMS sent to <span className="font-bold">{signinFormattedNumberDisplay || phone}</span>
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-800">
                            Enter 6-Digit SMS Verification Code
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAutoFillOtp(true)}
                            className="text-[11px] font-bold text-[#2563EB] hover:underline flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md"
                          >
                            <span>⚡ Auto-fill / Paste</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          value={signinOtpCode}
                          onChange={(e) => setSigninOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="••••••"
                          autoFocus
                          required
                          disabled={isSigninVerifyingOtp}
                          className="w-full h-12 text-center tracking-[0.45em] text-xl font-bold font-mono bg-slate-50 border-2 border-blue-500/80 rounded-xl text-slate-900 focus:outline-none focus:border-[#2563EB] focus:bg-white disabled:opacity-60"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-500">Didn't receive SMS?</span>
                        <button
                          type="button"
                          disabled={signinResendCooldown > 0 || isSigninSendingOtp}
                          onClick={handleSigninSendOtp}
                          className="text-[11px] font-bold text-[#2563EB] hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1"
                        >
                          <RefreshCw className={`w-3 h-3 ${isSigninSendingOtp ? 'animate-spin' : ''}`} />
                          <span>
                            {signinResendCooldown > 0 ? `Resend in ${signinResendCooldown}s` : 'Resend SMS Code'}
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <button
                    id="signin-otp-btn"
                    type="submit"
                    disabled={isSigninSendingOtp || isSigninVerifyingOtp}
                    className="w-full h-12 mt-2 bg-gradient-to-r from-[#3B82F6] via-[#2F7AF6] to-[#1D63ED] text-white font-bold rounded-xl text-sm shadow-[0_10px_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:brightness-105 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isSigninSendingOtp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending SMS Code...</span>
                      </>
                    ) : isSigninVerifyingOtp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : isSigninOtpSent ? (
                      <>
                        <span>Verify & Login</span>
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

              <div className="py-2">
                <LegalDocumentsSubPage
                  documentType={activeLegalModal === 'terms' ? 'terms_of_service' : 'privacy_policy'}
                  onShowToast={() => {}}
                />
              </div>

              <button
                type="button"
                onClick={() => setActiveLegalModal(null)}
                className="w-full h-11 mt-3 bg-[#2563EB] text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-transform cursor-pointer"
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
