import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User as UserIcon,
  Shield,
  Bell,
  HardDrive,
  Sparkles,
  HelpCircle,
  ChevronRight,
  Check,
  Smartphone,
  Trash2,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  RefreshCw,
  Sun,
  Moon,
  Palette,
  CheckCircle2,
  Users,
  ExternalLink,
  Info,
  Globe,
  Cake,
  Phone,
  Mail,
  Edit3,
  Calendar,
  UserX,
  MessageSquare,
  FileText,
  LifeBuoy,
  HeartHandshake,
  Bug,
  BookOpen,
  Scale,
  Search,
  Activity,
} from 'lucide-react';
import {
  User,
  ThemeMode,
  SettingsSection,
  AppPermissionsState,
  ChatThread,
} from '../types';

export type { SettingsSection };
import { useNavigation } from '../context/NavigationContext';
import { getStoredPermissions, saveStoredPermissions } from '../services/permissionService';
import { getSavedLanguage, LANGUAGES_LIST } from '../services/languageService';
import { clearSearchHistory, getSearchHistory } from '../services/searchHistoryService';
import { AndroidSystemSettingsModal } from './AndroidSystemSettingsModal';

// Subpage Components
import {
  UsernameSubPage,
  MobileNumberSubPage,
  EmailSubPage,
  PasswordSubPage,
  TwoFactorSubPage,
} from './settings/AccountSettingsSubPages';
import { NotificationsSubPage } from './settings/NotificationsSubPage';
import { LanguageSubPage } from './settings/LanguageSubPage';
import { AppAppearanceSubPage } from './settings/AppAppearanceSubPage';
import { SavedLoginSubPage } from './settings/SavedLoginSubPage';
import { MyReportsSubPage } from './settings/MyReportsSubPage';
import { AccountStatusSubPage } from './settings/AccountStatusSubPage';
import { DeleteAccountSubPage } from './settings/DeleteAccountSubPage';
import { PublicProfileSubPage } from './settings/PublicProfileSubPage';
import { AppPermissionsSubPage } from './settings/AppPermissionsSubPage';
import { ContactSyncSubPage } from './settings/ContactSyncSubPage';
import { PrivacyControlsSubPage } from './settings/PrivacyControlsSubPage';
import { BlockedListSubPage } from './settings/BlockedListSubPage';
import { WhoCanContactSubPage } from './settings/WhoCanContactSubPage';
import { ClearConversationsSubPage } from './settings/ClearConversationsSubPage';
import { AccountRecoverySubPage } from './settings/AccountRecoverySubPage';
import { SafetyCentreSubPage } from './settings/SafetyCentreSubPage';
import { HelpCentreSubPage } from './settings/HelpCentreSubPage';
import { BugsAndSuggestionsSubPage } from './settings/BugsAndSuggestionsSubPage';
import { LegalDocumentsSubPage } from './settings/LegalDocumentsSubPage';

interface SettingsModalProps {
  isOpen: boolean;
  currentUser: User;
  onClose: () => void;
  onUpdateUser: (updated: Partial<User>) => void;
  onShowToast: (message: string) => void;
  onResetData?: () => void;
  users?: User[];
  chatThreads?: ChatThread[];
  onDeleteChatThreads?: (threadIds: string[]) => void;
  lockedChatUserIds?: string[];
  chatLockPasscode?: string;
  isChatLockEnabled?: boolean;
  onUpdateLockedChatUserIds?: (ids: string[]) => void;
  onUpdateChatLockPasscode?: (pin: string) => void;
  onUpdateChatLockEnabled?: (enabled: boolean) => void;
  theme?: ThemeMode;
  onUpdateTheme?: (theme: ThemeMode) => void;
  initialSection?: SettingsSection;
  onLogout?: () => void;
  permissionsState?: AppPermissionsState;
  onUpdatePermissions?: (perms: AppPermissionsState) => void;
  onRerunPermissionOnboarding?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onUpdateUser,
  onShowToast,
  onResetData,
  users = [],
  chatThreads = [],
  onDeleteChatThreads,
  lockedChatUserIds = [],
  chatLockPasscode = '123456',
  isChatLockEnabled = true,
  onUpdateLockedChatUserIds,
  onUpdateChatLockPasscode,
  onUpdateChatLockEnabled,
  theme = 'light',
  onUpdateTheme,
  initialSection = 'main',
  onLogout,
  permissionsState: externalPermissionsState,
  onUpdatePermissions,
  onRerunPermissionOnboarding,
}) => {
  const { navState, setSettingsSection, goBack, closeSettings } = useNavigation();
  const currentSection: SettingsSection = (navState.settingsSection || initialSection || 'main') as SettingsSection;
  const setCurrentSection = (sec: SettingsSection) => setSettingsSection(sec);

  const [cacheSize, setCacheSize] = useState('28.4 MB');

  // In-place editable state for Name
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(currentUser.name);

  // In-place editable state for Birthday
  const [isEditingBirthday, setIsEditingBirthday] = useState(false);
  const [tempBirthday, setTempBirthday] = useState(currentUser.birthday || '1998-05-14');

  const [localPermissions, setLocalPermissions] = useState<AppPermissionsState>(() => {
    return externalPermissionsState || getStoredPermissions();
  });
  const [showAndroidSystemSettingsModal, setShowAndroidSystemSettingsModal] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);

  // Keep local copies in sync if currentUser updates
  useEffect(() => {
    setTempName(currentUser.name);
    if (currentUser.birthday) {
      setTempBirthday(currentUser.birthday);
    }
  }, [currentUser.name, currentUser.birthday]);

  useEffect(() => {
    if (externalPermissionsState) {
      setLocalPermissions(externalPermissionsState);
    }
  }, [externalPermissionsState]);

  if (!isOpen) return null;

  const handleSaveName = () => {
    if (!tempName.trim()) {
      onShowToast('Name cannot be empty');
      return;
    }
    onUpdateUser({ name: tempName.trim() });
    setIsEditingName(false);
    onShowToast('Name updated successfully! ✨');
  };

  const handleSaveBirthday = () => {
    if (!tempBirthday) {
      onShowToast('Please select a valid date');
      return;
    }
    onUpdateUser({ birthday: tempBirthday });
    setIsEditingBirthday(false);
    onShowToast('Birthday updated successfully! 🎂');
  };

  const handleClearCache = () => {
    setCacheSize('0.0 MB');
    onShowToast('Cache cleared successfully! 28.4 MB freed.');
  };

  const handleClearSearchHistoryAction = () => {
    clearSearchHistory();
    setShowClearHistoryConfirm(false);
    onShowToast('Search history cleared permanently 🔍');
  };

  const handleResetDefaults = () => {
    setCacheSize('28.4 MB');
    if (onResetData) onResetData();
    onShowToast('Settings restored to default values');
  };

  const handleDeleteAccountConfirm = (reason: string, feedback: string) => {
    onShowToast('Account deletion initiated. 30-day deactivation active.');
    onClose();
    if (onLogout) onLogout();
  };

  const currentLanguageCode = getSavedLanguage();
  const currentLanguageObj =
    LANGUAGES_LIST.find((l) => l.code === currentLanguageCode) || LANGUAGES_LIST[6];

  const maskMobile = (phone?: string) => {
    if (!phone) return '+1 (555) 234-5678';
    if (phone.length <= 6) return phone;
    const end = phone.slice(-4);
    return `+1 (555) •••-${end}`;
  };

  const maskEmail = (email?: string) => {
    if (!email) return 'alex.rivera@example.com';
    const parts = email.split('@');
    if (parts.length < 2) return email;
    const name = parts[0];
    const maskedName = name.length > 2 ? `${name[0]}•••${name[name.length - 1]}` : `${name[0]}•••`;
    return `${maskedName}@${parts[1]}`;
  };

  const formatBirthday = (dateStr?: string) => {
    if (!dateStr) return 'May 14, 1998';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getSectionTitle = (sec: SettingsSection): { title: string; subtitle: string } => {
    switch (sec) {
      case 'main':
        return { title: 'Settings', subtitle: `@${currentUser.username}` };
      case 'username':
        return { title: 'Change Username', subtitle: '90-Day Policy' };
      case 'mobile':
        return { title: 'Mobile Number', subtitle: 'OTP Verified' };
      case 'email':
        return { title: 'Email Address', subtitle: 'Security Confirmation' };
      case 'password':
        return { title: 'Password', subtitle: 'Update Credentials' };
      case 'two_factor':
        return { title: 'Two-Factor Authentication', subtitle: 'Account Protection' };
      case 'saved_login':
        return { title: 'Saved Login', subtitle: 'Session Controls' };
      case 'my_reports':
        return { title: 'My Reports', subtitle: 'Submitted Infractions' };
      case 'account_status':
        return { title: 'Account Status', subtitle: 'Account Health & Standing' };
      case 'delete_account':
        return { title: 'Delete Account', subtitle: 'Permanent Account Purge' };
      case 'account_recovery':
        return { title: "I've Lost My Account", subtitle: 'Identity & Access Recovery' };
      case 'theme':
      case 'appearance':
        return { title: 'App Appearance', subtitle: 'Theme & Accent Controls' };
      case 'permissions':
        return { title: 'App Permissions', subtitle: 'Android System Access' };
      case 'contact_sync':
        return { title: 'Contact Syncing', subtitle: 'Find Friends & Privacy' };
      case 'notifications':
        return { title: 'Notifications', subtitle: 'Alerts & Quiet Hours' };
      case 'language':
        return { title: 'Language', subtitle: '42 Languages Available' };
      case 'media':
        return { title: 'Media & Cache', subtitle: 'Storage Management' };
      case 'public_profile':
        return { title: 'Public Profile Settings', subtitle: 'Visitor Visibility' };
      case 'privacy':
      case 'privacy_controls':
        return { title: 'Privacy Controls', subtitle: 'Mentions, Tags & Activity' };
      case 'blocked_list':
        return { title: 'Blocked List', subtitle: 'Restricted Accounts' };
      case 'who_can_contact':
        return { title: 'Who Can Contact Me', subtitle: 'Direct Message Privacy' };
      case 'clear_conversation':
        return { title: 'Clear Conversations', subtitle: 'Manage Inbox Histories' };
      case 'safety_centre':
        return { title: 'Safety Centre', subtitle: 'Helplines & Resources' };
      case 'help_centre':
        return { title: 'Help Centre', subtitle: 'Guides & Support Ticket' };
      case 'bugs_suggestions':
        return { title: 'Bugs & Suggestions', subtitle: 'Feedback & Issue Reports' };
      case 'more_info':
      case 'about':
        return { title: 'More Info', subtitle: 'App Specifications' };
      case 'privacy_policy':
        return { title: 'Privacy Policy', subtitle: 'Data Protections' };
      case 'terms_of_service':
        return { title: 'Terms of Service', subtitle: 'User Agreement' };
      case 'other_legal':
        return { title: 'Other Legal Notices', subtitle: 'Open Source Licenses' };
      default:
        return { title: 'Settings', subtitle: 'Funshann Android' };
    }
  };

  const headerInfo = getSectionTitle(currentSection);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="neu-flat rounded-t-[32px] sm:rounded-[32px] max-w-md w-full h-[88vh] sm:h-[650px] flex flex-col overflow-hidden relative shadow-2xl"
      >
        {/* Header Bar with Android Back & Title */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100/80 bg-white/70 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            {currentSection !== 'main' && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={goBack}
                className="w-8 h-8 rounded-full neu-raised flex items-center justify-center text-slate-700 hover:text-[#5B9DFF] cursor-pointer"
                title="Back to Settings"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </motion.button>
            )}
            <div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight font-['Outfit']">
                {headerInfo.title}
              </h2>
              <p className="text-[11px] font-semibold text-slate-400">
                {headerInfo.subtitle}
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={closeSettings}
            className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Close Settings"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* ========================================================================= */}
          {/* 1. MAIN SETTINGS SCREEN (Grouped into standard clear categories) */}
          {/* ========================================================================= */}
          {currentSection === 'main' && (
            <div className="space-y-5">
              {/* Profile Summary Card */}
              <div className="neu-flat rounded-[24px] p-4 bg-gradient-to-r from-blue-50/50 via-white to-white border border-blue-100/60">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-full neu-raised p-0.5 relative">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{currentUser.name}</span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-blue-100 text-[#5B9DFF]">
                        Active
                      </span>
                    </h3>
                    <p className="text-xs font-semibold text-[#5B9DFF]">@{currentUser.username}</p>
                    <p className="text-[10px] text-slate-400">Personal Account • Verified Creator</p>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* CATEGORY 1: ACCOUNT SETTINGS */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Account Settings
                </span>

                <div className="neu-flat rounded-[22px] overflow-hidden divide-y divide-slate-100/80">
                  {/* 1. Name */}
                  <div className="px-4 py-3.5 hover:bg-slate-50/40 transition-colors">
                    {!isEditingName ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF]">
                            <UserIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-800">Name</p>
                              <span className="text-[9px] text-slate-400 font-medium">
                                (Change anytime)
                              </span>
                            </div>
                            <p className="text-[11px] font-medium text-slate-600">
                              {currentUser.name}
                            </p>
                          </div>
                        </div>

                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          onClick={() => {
                            setTempName(currentUser.name);
                            setIsEditingName(true);
                          }}
                          className="px-2.5 py-1 rounded-full neu-raised text-[10px] font-bold text-[#5B9DFF] hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </motion.button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">Change Your Name</span>
                          <span className="text-[10px] text-emerald-600 font-bold">No restriction</span>
                        </div>
                        <input
                          type="text"
                          autoFocus
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          placeholder="Enter your name"
                          className="w-full h-10 px-3 rounded-xl neu-inset bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]"
                        />
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setTempName(currentUser.name);
                              setIsEditingName(false);
                            }}
                            className="px-3 py-1.5 rounded-xl neu-raised text-xs font-semibold text-slate-500 hover:text-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveName}
                            className="px-4 py-1.5 rounded-xl neu-active-blue text-xs font-bold text-white shadow-xs"
                          >
                            Save Name
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Username > */}
                  <button
                    onClick={() => setCurrentSection('username')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF]">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-800">Username</p>
                          <span className="text-[9px] text-amber-600 bg-amber-50 font-bold px-1.5 py-0.2 rounded-full border border-amber-200">
                            90-Day Rule
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-[#5B9DFF]">
                          @{currentUser.username}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* 3. Birthday */}
                  <div className="px-4 py-3.5 hover:bg-slate-50/40 transition-colors">
                    {!isEditingBirthday ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-pink-500">
                            <Cake className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">Birthday</p>
                            <p className="text-[11px] text-slate-600">
                              {formatBirthday(currentUser.birthday)}
                            </p>
                          </div>
                        </div>

                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          onClick={() => setIsEditingBirthday(true)}
                          className="px-2.5 py-1 rounded-full neu-raised text-[10px] font-bold text-[#5B9DFF] hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Edit</span>
                        </motion.button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-800 block">Select Birthday</span>
                        <input
                          type="date"
                          value={tempBirthday}
                          onChange={(e) => setTempBirthday(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl neu-inset bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]"
                        />
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setIsEditingBirthday(false)}
                            className="px-3 py-1.5 rounded-xl neu-raised text-xs font-semibold text-slate-500 hover:text-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveBirthday}
                            className="px-4 py-1.5 rounded-xl neu-active-blue text-xs font-bold text-white shadow-xs"
                          >
                            Save Birthday
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Mobile Number > */}
                  <button
                    onClick={() => setCurrentSection('mobile')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-emerald-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-800">Mobile Number</p>
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700">
                            OTP Verified
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-500">
                          {maskMobile(currentUser.mobileNumber)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* 5. Email > */}
                  <button
                    onClick={() => setCurrentSection('email')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-violet-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-800">Email</p>
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-violet-50 text-violet-700">
                            Confirmed
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {maskEmail(currentUser.email)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* 6. Password > */}
                  <button
                    onClick={() => setCurrentSection('password')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-amber-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Password</p>
                        <p className="text-[11px] font-mono text-slate-400">••••••••••••</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* 7. Two-Factor Authentication > */}
                  <button
                    onClick={() => setCurrentSection('two_factor')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full neu-raised flex items-center justify-center ${
                          currentUser.twoFactorEnabled ? 'text-emerald-500' : 'text-slate-400'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-800">Two-Factor Authentication</p>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.2 rounded-full ${
                              currentUser.twoFactorEnabled
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {currentUser.twoFactorEnabled ? 'ON' : 'OFF'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {currentUser.twoFactorEnabled ? 'Authenticator App Active' : 'Standard sign-in protection'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* 8. Saved Login > */}
                  <button
                    onClick={() => setCurrentSection('saved_login')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-blue-500">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Saved Login</p>
                        <p className="text-[11px] text-slate-500">Save login sessions on this device</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* 9. My Reports > */}
                  <button
                    onClick={() => setCurrentSection('my_reports')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-amber-500">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">My Reports</p>
                        <p className="text-[11px] text-slate-500">Submitted infractions & statuses</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* 10. Account Status > */}
                  <button
                    onClick={() => setCurrentSection('account_status')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-emerald-500">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-800">Account Status</p>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700">
                            Good Standing
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">Zero violations on record</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* 11. Delete Account > */}
                  <button
                    onClick={() => setCurrentSection('delete_account')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-red-50/40 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-red-600">Delete Account</p>
                        <p className="text-[11px] text-slate-400">Permanently remove account & media</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* 12. I've Lost My Account > */}
                  <button
                    onClick={() => setCurrentSection('account_recovery')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF]">
                        <LifeBuoy className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">I've Lost My Account</p>
                        <p className="text-[11px] text-slate-500">Account recovery assistance & OTP</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* CATEGORY 2: APP SETTINGS */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  App Settings
                </span>

                <div className="neu-flat rounded-[22px] overflow-hidden divide-y divide-slate-100/80">
                  {/* App Appearance > */}
                  <button
                    onClick={() => setCurrentSection('appearance')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF]">
                        <Palette className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">App Appearance</p>
                        <p className="text-[11px] text-slate-500 capitalize">
                          Current: {theme} Theme • Custom Studio
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* App Permissions > */}
                  <button
                    onClick={() => setCurrentSection('permissions')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF]">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-800">App Permissions</p>
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-blue-100 text-[#5B9DFF]">
                            Android
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Camera, Mic, Location, Photos & Contacts
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Contact Syncing > */}
                  <button
                    onClick={() => setCurrentSection('contact_sync')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-purple-500">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Contact Syncing</p>
                        <p className="text-[11px] text-slate-500">Find creators & friends from phone contacts</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* CATEGORY 3: PREFERENCES */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Preferences
                </span>

                <div className="neu-flat rounded-[22px] overflow-hidden divide-y divide-slate-100/80">
                  {/* Notifications > */}
                  <button
                    onClick={() => setCurrentSection('notifications')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-amber-500">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Notifications</p>
                        <p className="text-[11px] text-slate-500">
                          Story, Message, Updates, Following & Quiet Hours
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Language > */}
                  <button
                    onClick={() => setCurrentSection('language')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF]">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Language</p>
                        <p className="text-[11px] text-slate-500">
                          {currentLanguageObj.name} ({currentLanguageObj.nativeName})
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Media & Cache > */}
                  <button
                    onClick={() => setCurrentSection('media')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF]">
                        <HardDrive className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Media &amp; Cache</p>
                        <p className="text-[11px] text-slate-500">{cacheSize} cached media</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Clear Search History */}
                  <div className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-slate-600">
                        <Search className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Clear Search History</p>
                        <p className="text-[11px] text-slate-500">
                          {getSearchHistory().length} recent searches saved
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowClearHistoryConfirm(true)}
                      className="px-3 py-1 rounded-full neu-raised text-xs font-bold text-slate-600 hover:text-red-500 cursor-pointer shadow-xs"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* CATEGORY 4: PRIVACY & SECURITY CONTROLS */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Privacy &amp; Security Controls
                </span>

                <div className="neu-flat rounded-[22px] overflow-hidden divide-y divide-slate-100/80">
                  {/* Public Profile Settings > */}
                  <button
                    onClick={() => setCurrentSection('public_profile')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF]">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Public Profile Settings</p>
                        <p className="text-[11px] text-slate-500">Control public visibility of personal info</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Privacy Controls > */}
                  <button
                    onClick={() => setCurrentSection('privacy_controls')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-emerald-600">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Privacy Controls</p>
                        <p className="text-[11px] text-slate-500">Private account, mentions, tags, activity indicator</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Blocked List > */}
                  <button
                    onClick={() => setCurrentSection('blocked_list')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-red-500">
                        <UserX className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Blocked List</p>
                        <p className="text-[11px] text-slate-500">Manage blocked users & restrictions</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Who Can Contact Me > */}
                  <button
                    onClick={() => setCurrentSection('who_can_contact')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-purple-500">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Who Can Contact Me</p>
                        <p className="text-[11px] text-slate-500">Direct messages, voice notes & spam filter</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Clear Conversations > */}
                  <button
                    onClick={() => setCurrentSection('clear_conversation')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-blue-500">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Clear Conversations</p>
                        <p className="text-[11px] text-slate-500">
                          {chatThreads.length} active message conversations
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* CATEGORY 5: HELP & SUPPORT */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Help &amp; Support
                </span>

                <div className="neu-flat rounded-[22px] overflow-hidden divide-y divide-slate-100/80">
                  {/* Safety Centre > */}
                  <button
                    onClick={() => setCurrentSection('safety_centre')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-emerald-600">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Safety Centre</p>
                        <p className="text-[11px] text-slate-500">Crisis helplines, scam guides & protection</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Help Centre > */}
                  <button
                    onClick={() => setCurrentSection('help_centre')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-blue-500">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Help Centre</p>
                        <p className="text-[11px] text-slate-500">Guides, FAQs & 24/7 Support Tickets</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Bugs and Suggestions > */}
                  <button
                    onClick={() => setCurrentSection('bugs_suggestions')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-amber-500">
                        <Bug className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Bugs and Suggestions</p>
                        <p className="text-[11px] text-slate-500">Report problems or submit ideas</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* CATEGORY 6: LEGAL & INFORMATION */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Legal &amp; Information
                </span>

                <div className="neu-flat rounded-[22px] overflow-hidden divide-y divide-slate-100/80">
                  {/* More Info > */}
                  <button
                    onClick={() => setCurrentSection('more_info')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-indigo-500">
                        <Info className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">More Info</p>
                        <p className="text-[11px] text-slate-500">Version 2.4.0 (Build 2026.08.16)</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Privacy Policy > */}
                  <button
                    onClick={() => setCurrentSection('privacy_policy')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF]">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Privacy Policy</p>
                        <p className="text-[11px] text-slate-500">Data protection & ephemeral guarantees</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Terms of Service > */}
                  <button
                    onClick={() => setCurrentSection('terms_of_service')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-blue-500">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Terms of Service</p>
                        <p className="text-[11px] text-slate-500">Community rules & user agreement</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* Other Legal > */}
                  <button
                    onClick={() => setCurrentSection('other_legal')}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-purple-600">
                        <Scale className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Other Legal Notices</p>
                        <p className="text-[11px] text-slate-500">Open source licenses & copyright</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* CATEGORY 7: ACTIONS */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Actions
                </span>

                <div className="space-y-2">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleResetDefaults}
                    className="w-full h-11 rounded-[20px] neu-raised px-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 hover:text-[#5B9DFF] transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset Settings to Default</span>
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full h-11 rounded-[20px] neu-raised px-4 flex items-center justify-center gap-2 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out from @{currentUser.username}</span>
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. SUB-PAGES (Dedicated modular clean views with Android back support) */}
          {/* ========================================================================= */}

          {/* ACCOUNT SETTINGS SUBPAGES */}
          {currentSection === 'username' && (
            <UsernameSubPage
              currentUser={currentUser}
              onUpdateUser={onUpdateUser}
              onShowToast={onShowToast}
            />
          )}

          {currentSection === 'mobile' && (
            <MobileNumberSubPage
              currentUser={currentUser}
              onUpdateUser={onUpdateUser}
              onShowToast={onShowToast}
            />
          )}

          {currentSection === 'email' && (
            <EmailSubPage
              currentUser={currentUser}
              onUpdateUser={onUpdateUser}
              onShowToast={onShowToast}
            />
          )}

          {currentSection === 'password' && (
            <PasswordSubPage currentUser={currentUser} onShowToast={onShowToast} />
          )}

          {currentSection === 'two_factor' && (
            <TwoFactorSubPage
              currentUser={currentUser}
              onUpdateUser={onUpdateUser}
              onShowToast={onShowToast}
            />
          )}

          {currentSection === 'saved_login' && (
            <SavedLoginSubPage onShowToast={onShowToast} />
          )}

          {currentSection === 'my_reports' && (
            <MyReportsSubPage onShowToast={onShowToast} />
          )}

          {currentSection === 'account_status' && (
            <AccountStatusSubPage currentUser={currentUser} onShowToast={onShowToast} />
          )}

          {currentSection === 'delete_account' && (
            <DeleteAccountSubPage
              currentUser={currentUser}
              onCancel={goBack}
              onConfirmDelete={handleDeleteAccountConfirm}
              onShowToast={onShowToast}
            />
          )}

          {currentSection === 'account_recovery' && (
            <AccountRecoverySubPage currentUser={currentUser} onShowToast={onShowToast} />
          )}

          {/* APP SETTINGS & APPEARANCE */}
          {(currentSection === 'appearance' || currentSection === 'theme') && (
            <AppAppearanceSubPage
              theme={theme}
              onUpdateTheme={(t) => {
                if (onUpdateTheme) onUpdateTheme(t);
              }}
              onShowToast={onShowToast}
            />
          )}

          {currentSection === 'permissions' && (
            <AppPermissionsSubPage
              permissionsState={localPermissions}
              onUpdatePermissions={(updated) => {
                setLocalPermissions(updated);
                saveStoredPermissions(updated);
                if (onUpdatePermissions) onUpdatePermissions(updated);
              }}
              onOpenSystemSettings={() => setShowAndroidSystemSettingsModal(true)}
              onShowToast={onShowToast}
            />
          )}

          {currentSection === 'contact_sync' && (
            <ContactSyncSubPage onShowToast={onShowToast} />
          )}

          {/* PREFERENCES */}
          {currentSection === 'notifications' && (
            <NotificationsSubPage onShowToast={onShowToast} />
          )}

          {currentSection === 'language' && (
            <LanguageSubPage onShowToast={onShowToast} />
          )}

          {currentSection === 'media' && (
            <div className="space-y-4 pb-4">
              <div className="neu-flat rounded-[24px] p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">High-Res Uploads (4:5 HD)</h4>
                    <p className="text-[11px] text-slate-500">Preserve highest detail for your photo cards</p>
                  </div>
                  <button
                    onClick={() => onShowToast('High-Res Uploads enabled')}
                    className="w-12 h-6.5 rounded-full p-1 bg-[#5B9DFF] flex items-center justify-end cursor-pointer"
                  >
                    <div className="w-4.5 h-4.5 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Neumorphic Haptics</h4>
                    <p className="text-[11px] text-slate-500">Gentle vibration on button taps & likes</p>
                  </div>
                  <button
                    onClick={() => onShowToast('Haptic feedback enabled')}
                    className="w-12 h-6.5 rounded-full p-1 bg-[#5B9DFF] flex items-center justify-end cursor-pointer"
                  >
                    <div className="w-4.5 h-4.5 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
              </div>

              {/* Cache Management Card */}
              <div className="neu-flat rounded-[24px] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Temporary Media Cache</h4>
                    <p className="text-[11px] text-slate-500">Cached stories and feed media</p>
                  </div>
                  <span className="text-xs font-bold text-[#5B9DFF] neu-inset px-2.5 py-1 rounded-full">
                    {cacheSize}
                  </span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClearCache}
                  className="w-full h-10 rounded-full neu-raised text-xs font-bold text-slate-700 hover:text-rose-500 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Media Cache</span>
                </motion.button>
              </div>
            </div>
          )}

          {/* PRIVACY & SECURITY SUBPAGES */}
          {currentSection === 'public_profile' && (
            <PublicProfileSubPage currentUser={currentUser} onShowToast={onShowToast} />
          )}

          {(currentSection === 'privacy_controls' || currentSection === 'privacy') && (
            <PrivacyControlsSubPage onShowToast={onShowToast} />
          )}

          {currentSection === 'blocked_list' && (
            <BlockedListSubPage users={users} onShowToast={onShowToast} />
          )}

          {currentSection === 'who_can_contact' && (
            <WhoCanContactSubPage onShowToast={onShowToast} />
          )}

          {currentSection === 'clear_conversation' && (
            <ClearConversationsSubPage
              chatThreads={chatThreads}
              onDeleteThreads={(ids) => {
                if (onDeleteChatThreads) {
                  onDeleteChatThreads(ids);
                }
              }}
              onShowToast={onShowToast}
            />
          )}

          {/* HELP & SUPPORT SUBPAGES */}
          {currentSection === 'safety_centre' && (
            <SafetyCentreSubPage
              onShowToast={onShowToast}
              onOpenBlockedList={() => setCurrentSection('blocked_list')}
              onOpenPrivacyControls={() => setCurrentSection('privacy_controls')}
            />
          )}

          {currentSection === 'help_centre' && (
            <HelpCentreSubPage onShowToast={onShowToast} />
          )}

          {currentSection === 'bugs_suggestions' && (
            <BugsAndSuggestionsSubPage onShowToast={onShowToast} />
          )}

          {/* LEGAL & INFORMATION SUBPAGES */}
          {(currentSection === 'more_info' || currentSection === 'about') && (
            <LegalDocumentsSubPage documentType="more_info" onShowToast={onShowToast} />
          )}

          {currentSection === 'privacy_policy' && (
            <LegalDocumentsSubPage documentType="privacy_policy" onShowToast={onShowToast} />
          )}

          {currentSection === 'terms_of_service' && (
            <LegalDocumentsSubPage documentType="terms_of_service" onShowToast={onShowToast} />
          )}

          {currentSection === 'other_legal' && (
            <LegalDocumentsSubPage documentType="other_legal" onShowToast={onShowToast} />
          )}
        </div>

        {/* Android System Settings Simulation Modal */}
        <AndroidSystemSettingsModal
          isOpen={showAndroidSystemSettingsModal}
          onClose={() => setShowAndroidSystemSettingsModal(false)}
          permissionsState={localPermissions}
          onUpdatePermissions={(updated) => {
            setLocalPermissions(updated);
            saveStoredPermissions(updated);
            if (onUpdatePermissions) onUpdatePermissions(updated);
          }}
          onShowToast={onShowToast}
        />

        {/* Clear Search History Confirmation Dialog */}
        <AnimatePresence>
          {showClearHistoryConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="neu-flat rounded-[26px] p-5 w-full max-w-xs text-center space-y-3"
              >
                <div className="w-12 h-12 mx-auto rounded-full neu-raised flex items-center justify-center text-slate-700">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Clear Search History?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This will remove all recent user and hashtag searches saved on this device.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => setShowClearHistoryConfirm(false)}
                    className="h-10 rounded-full neu-raised text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearSearchHistoryAction}
                    className="h-10 rounded-full bg-slate-800 text-xs font-bold text-white shadow-md cursor-pointer"
                  >
                    Clear History
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout Confirmation Dialog */}
        <AnimatePresence>
          {showLogoutConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="neu-flat rounded-[26px] p-5 w-full max-w-xs text-center space-y-3"
              >
                <div className="w-12 h-12 mx-auto rounded-full neu-raised flex items-center justify-center text-rose-500">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Log Out of Funshann?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You can always log back in as @{currentUser.username} anytime.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="h-10 rounded-full neu-raised text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowLogoutConfirm(false);
                      onClose();
                      if (onLogout) {
                        onLogout();
                      } else {
                        onShowToast('Logged out. Returning to home feed.');
                      }
                    }}
                    className="h-10 rounded-full neu-active-blue text-xs font-bold text-white shadow-md cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
