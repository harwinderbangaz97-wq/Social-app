import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  Sparkles,
  Link as LinkIcon,
  Instagram,
  Twitter,
  Youtube,
  Github,
  Linkedin,
  Ghost,
  PhoneCall,
  Send,
  Gamepad2,
  Pin,
  Music,
  Disc,
  Globe,
  Tag,
  AtSign,
  User,
  FileText,
  MapPin,
  Camera,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  Crosshair,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType, SocialLink } from '../types';
import { usePermissionAndMedia } from '../context/PermissionAndMediaContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  onSave: (updated: Partial<UserType>) => void;
  onShowToast?: (msg: string) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
];

const PRESET_INTERESTS = [
  'Architecture',
  'Photography',
  'Analog Film',
  'Minimalism',
  'Coffee',
  'Design',
  'Travel',
  'Music',
  'Art & Pottery',
  'Coding',
  'Fitness',
  'Nature',
  'Fashion',
  'Books',
  'Culinary',
  'Interior',
];

const PLATFORM_CONFIG: Record<
  SocialLink['platform'],
  { label: string; placeholder: string; icon: React.FC<{ className?: string }> }
> = {
  whatsapp: { label: 'WhatsApp', placeholder: 'wa.me/number or +1234567890', icon: PhoneCall },
  snapchat: { label: 'Snapchat', placeholder: 'snapchat.com/add/username or username', icon: Ghost },
  instagram: { label: 'Instagram', placeholder: 'instagram.com/username or @username', icon: Instagram },
  twitter: { label: 'X (Twitter)', placeholder: 'x.com/username or @username', icon: Twitter },
  threads: { label: 'Threads', placeholder: 'threads.net/@username', icon: AtSign },
  youtube: { label: 'YouTube', placeholder: 'youtube.com/@channel', icon: Youtube },
  tiktok: { label: 'TikTok', placeholder: 'tiktok.com/@username', icon: Music },
  spotify: { label: 'Spotify', placeholder: 'open.spotify.com/user/...', icon: Disc },
  telegram: { label: 'Telegram', placeholder: 't.me/username or @username', icon: Send },
  discord: { label: 'Discord', placeholder: 'discord.gg/invite or username', icon: Gamepad2 },
  pinterest: { label: 'Pinterest', placeholder: 'pinterest.com/username', icon: Pin },
  github: { label: 'GitHub', placeholder: 'github.com/username', icon: Github },
  linkedin: { label: 'LinkedIn', placeholder: 'linkedin.com/in/username', icon: Linkedin },
  website: { label: 'Custom Link / Website', placeholder: 'https://yourwebsite.com', icon: Globe },
};

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSave,
  onShowToast,
}) => {
  const { chooseFromGallery, takePhoto, getLocation } = usePermissionAndMedia();
  // Form State
  const [activeTab, setActiveTab] = useState<'general' | 'username' | 'interests' | 'social'>('general');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [location, setLocation] = useState(currentUser.location || '');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [website, setWebsite] = useState(currentUser.website || '');
  const [username, setUsername] = useState(currentUser.username);
  const [interests, setInterests] = useState<string[]>(
    (currentUser.interests || []).map((t) => t.replace(/^#+/, ''))
  );
  const [customInterestInput, setCustomInterestInput] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(currentUser.socialLinks || []);

  // Avatar Picker Modal / Sheet State
  const [isAvatarSheetOpen, setIsAvatarSheetOpen] = useState(false);

  // New Social Link Input State
  const [newPlatform, setNewPlatform] = useState<SocialLink['platform']>('instagram');
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [isAddingSocial, setIsAddingSocial] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAvatar(currentUser.avatar || '');
      setName(currentUser.name || '');
      setBio(currentUser.bio || '');
      setLocation(currentUser.location || '');
      setWebsite(currentUser.website || '');
      setUsername(currentUser.username || '');
      setInterests((currentUser.interests || []).map((t) => t.replace(/^#+/, '')));
      setSocialLinks(currentUser.socialLinks || []);
    }
  }, [isOpen, currentUser]);

  // Username 90-day cooldown logic
  const calculateDaysSinceUsernameChange = (): { daysPassed: number; daysRemaining: number; canChange: boolean; lastDateStr: string } => {
    if (!currentUser.usernameLastChangedAt) {
      return { daysPassed: 999, daysRemaining: 0, canChange: true, lastDateStr: 'Never' };
    }
    const lastChanged = new Date(currentUser.usernameLastChangedAt).getTime();
    const now = Date.now();
    const diffMs = now - lastChanged;
    const daysPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, 90 - daysPassed);
    const canChange = daysRemaining === 0;
    const lastDateStr = new Date(currentUser.usernameLastChangedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return { daysPassed, daysRemaining, canChange, lastDateStr };
  };

  const usernameStatus = calculateDaysSinceUsernameChange();

  if (!isOpen) return null;

  // Handle Pick Avatar from Device Gallery
  const handlePickAvatarFromGallery = async () => {
    const res = await chooseFromGallery({
      accept: 'image/*',
      featureName: 'Profile Picture',
    });
    if (res) {
      setAvatar(res.url);
      setIsAvatarSheetOpen(false);
      if (onShowToast) onShowToast('Profile picture selected (preview updated) 📸');
    }
  };

  // Handle Capture Avatar with Camera
  const handleCaptureAvatarWithCamera = async () => {
    const res = await takePhoto({
      facingMode: 'user',
      title: 'Snap Profile Picture',
    });
    if (res) {
      setAvatar(res.url);
      setIsAvatarSheetOpen(false);
      if (onShowToast) onShowToast('Camera selfie captured! 📸');
    }
  };

  // Remove Profile Picture
  const handleRemoveProfilePicture = () => {
    const defaultPlaceholder = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'Funshann')}&backgroundColor=5B9DFF,3B82F6&textColor=ffffff`;
    setAvatar(defaultPlaceholder);
    setIsAvatarSheetOpen(false);
    if (onShowToast) onShowToast('Profile picture removed (using avatar placeholder)');
  };

  // Toggle Interest
  const handleToggleInterest = (tag: string) => {
    const cleanTag = tag.replace(/^#+/, '');
    if (interests.includes(cleanTag)) {
      setInterests(interests.filter((t) => t !== cleanTag));
    } else {
      if (interests.length >= 10) {
        if (onShowToast) onShowToast('Maximum 10 interests allowed');
        return;
      }
      setInterests([...interests, cleanTag]);
    }
  };

  const handleAddCustomInterest = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customInterestInput.trim().replace(/^#+/, '');
    if (!clean) return;
    if (interests.includes(clean)) {
      if (onShowToast) onShowToast('Interest already added');
      return;
    }
    if (interests.length >= 10) {
      if (onShowToast) onShowToast('Maximum 10 interests allowed');
      return;
    }
    setInterests([...interests, clean]);
    setCustomInterestInput('');
  };

  // Social Links management
  const handleAddSocialLink = (e: React.FormEvent) => {
    e.preventDefault();
    let cleanUrl = newUrl.trim();
    if (!cleanUrl) return;

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      if (newPlatform === 'whatsapp') {
        const phone = cleanUrl.replace(/[^0-9+]/g, '').replace(/^\+/, '');
        cleanUrl = `https://wa.me/${phone}`;
      } else if (newPlatform === 'snapchat' && !cleanUrl.includes('snapchat.com')) {
        cleanUrl = `https://snapchat.com/add/${cleanUrl.replace('@', '')}`;
      } else if (newPlatform === 'telegram' && !cleanUrl.includes('t.me')) {
        cleanUrl = `https://t.me/${cleanUrl.replace('@', '')}`;
      } else if (newPlatform === 'discord' && !cleanUrl.includes('discord.')) {
        cleanUrl = `https://discord.gg/${cleanUrl}`;
      } else if (newPlatform === 'pinterest' && !cleanUrl.includes('pinterest.com')) {
        cleanUrl = `https://pinterest.com/${cleanUrl.replace('@', '')}`;
      } else if (newPlatform === 'tiktok' && !cleanUrl.includes('tiktok.com')) {
        cleanUrl = `https://tiktok.com/@${cleanUrl.replace('@', '')}`;
      } else if (newPlatform === 'instagram' && !cleanUrl.includes('instagram.com')) {
        cleanUrl = `https://instagram.com/${cleanUrl.replace('@', '')}`;
      } else if (newPlatform === 'twitter' && !cleanUrl.includes('x.com') && !cleanUrl.includes('twitter.com')) {
        cleanUrl = `https://x.com/${cleanUrl.replace('@', '')}`;
      } else if (newPlatform === 'threads' && !cleanUrl.includes('threads.net')) {
        cleanUrl = `https://threads.net/@${cleanUrl.replace('@', '')}`;
      } else if (newPlatform === 'github' && !cleanUrl.includes('github.com')) {
        cleanUrl = `https://github.com/${cleanUrl.replace('@', '')}`;
      } else if (newPlatform === 'youtube' && !cleanUrl.includes('youtube.com')) {
        cleanUrl = `https://youtube.com/@${cleanUrl.replace('@', '')}`;
      } else if (newPlatform === 'linkedin' && !cleanUrl.includes('linkedin.com')) {
        cleanUrl = `https://linkedin.com/in/${cleanUrl.replace('@', '')}`;
      } else {
        cleanUrl = `https://${cleanUrl}`;
      }
    }

    const newLink: SocialLink = {
      id: `sl_${Date.now()}`,
      platform: newPlatform,
      title: newTitle.trim() || PLATFORM_CONFIG[newPlatform].label,
      url: cleanUrl,
    };

    setSocialLinks([...socialLinks, newLink]);
    setNewUrl('');
    setNewTitle('');
    setIsAddingSocial(false);
    if (onShowToast) onShowToast(`${PLATFORM_CONFIG[newPlatform].label} link added`);
  };

  const handleRemoveSocialLink = (id: string) => {
    setSocialLinks(socialLinks.filter((l) => l.id !== id));
  };

  // Submit master profile changes
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updates: Partial<UserType> = {
      avatar: avatar.trim() || currentUser.avatar,
      name: name.trim() || currentUser.name,
      bio: bio.trim(),
      location: location.trim(),
      website: website.trim(),
      interests,
      socialLinks,
    };

    // If username changed and allowed
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9._]/g, '');
    if (cleanUsername && cleanUsername !== currentUser.username) {
      if (!usernameStatus.canChange) {
        if (onShowToast) onShowToast(`Username can only be changed once every 90 days (${usernameStatus.daysRemaining} days left)`);
        return;
      }
      updates.username = cleanUsername;
      updates.usernameLastChangedAt = new Date().toISOString();
    }

    onSave(updates);
    if (onShowToast) onShowToast('Profile saved successfully! ✨');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="neu-flat rounded-[30px] max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Edit Your Profile</h3>
              <p className="text-[10px] text-slate-400">Personalize your identity, picture and links</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full neu-raised flex items-center justify-center text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="px-4 pt-3 pb-1 bg-slate-50/40">
          <div className="grid grid-cols-4 gap-1 neu-inset p-1 rounded-full">
            <button
              onClick={() => setActiveTab('general')}
              className={`h-7 rounded-full text-[11px] font-bold transition-all ${
                activeTab === 'general'
                  ? 'neu-active-blue text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('username')}
              className={`h-7 rounded-full text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === 'username'
                  ? 'neu-active-blue text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Handle</span>
              {!usernameStatus.canChange && (
                <Clock className="w-2.5 h-2.5 text-amber-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('interests')}
              className={`h-7 rounded-full text-[11px] font-bold transition-all ${
                activeTab === 'interests'
                  ? 'neu-active-blue text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Interests
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`h-7 rounded-full text-[11px] font-bold transition-all ${
                activeTab === 'social'
                  ? 'neu-active-blue text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Social
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: GENERAL (Profile Picture, Name, Bio, Location, Website) */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* 📷 Interactive Profile Picture Editor Card */}
              <div className="neu-flat rounded-[24px] p-4 flex flex-col items-center text-center relative">
                <div className="relative group cursor-pointer" onClick={() => setIsAvatarSheetOpen(true)}>
                  {/* Circular Avatar Preview with Neumorphic Ring */}
                  <div className="w-24 h-24 rounded-full neu-raised p-1.5 transition-transform group-hover:scale-105">
                    <img
                      src={avatar || currentUser.avatar}
                      alt="Profile Avatar Preview"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>

                  {/* Small Camera/Edit Badge on Profile Picture */}
                  <div
                    id="edit-profile-avatar-badge"
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#5B9DFF] text-white shadow-md flex items-center justify-center ring-2 ring-white group-hover:bg-blue-600 transition-colors"
                  >
                    <Camera className="w-4 h-4 stroke-[2.2]" />
                  </div>
                </div>

                <div className="mt-2.5 space-y-1">
                  <button
                    type="button"
                    onClick={() => setIsAvatarSheetOpen(true)}
                    className="text-xs font-bold text-[#5B9DFF] hover:underline flex items-center gap-1.5 mx-auto"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Change Profile Picture</span>
                  </button>
                  <p className="text-[10px] text-slate-400">
                    Tap the photo to choose from Gallery, Camera, or Presets
                  </p>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between mb-1">
                    <span>Full Display Name</span>
                    <span className="text-[10px] text-slate-400">{name.length}/40</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={name}
                      maxLength={40}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full h-10 pl-9 pr-3 text-xs neu-inset rounded-full text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between mb-1">
                    <span>Bio Description</span>
                    <span className="text-[10px] text-slate-400">{bio.length}/160</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={bio}
                      maxLength={160}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder="Tell the community about yourself, your art, or what inspires you..."
                      className="w-full p-3 text-xs neu-inset rounded-[20px] text-slate-800 focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Location
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        setIsDetectingLocation(true);
                        try {
                          const loc = await getLocation('Profile Location Tagging');
                          if (loc) {
                            setLocation(loc);
                            if (onShowToast) onShowToast(`Location updated to ${loc} 📍`);
                          } else if (onShowToast) {
                            onShowToast('Could not detect location. You can type it manually! 📍');
                          }
                        } finally {
                          setIsDetectingLocation(false);
                        }
                      }}
                      disabled={isDetectingLocation}
                      className="text-[10px] font-bold text-[#5B9DFF] hover:text-blue-700 flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                    >
                      {isDetectingLocation ? (
                        <span className="w-2.5 h-2.5 border-2 border-[#5B9DFF] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Crosshair className="w-3 h-3" />
                      )}
                      <span>{isDetectingLocation ? 'Detecting...' : 'Current Location'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-[#5B9DFF] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country (e.g. Barcelona, Spain)"
                      className="w-full h-10 pl-9 pr-3 text-xs neu-inset rounded-full text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between mb-1">
                    <span>Primary Website / Portfolio</span>
                    <span className="text-[10px] text-slate-400">Optional</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-3.5 h-3.5 text-[#5B9DFF] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="yourwebsite.com"
                      className="w-full h-10 pl-9 pr-3 text-xs neu-inset rounded-full text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERNAME WITH 90-DAY LIMIT */}
          {activeTab === 'username' && (
            <div className="space-y-4">
              {/* 90-Day Policy Alert Box */}
              <div
                className={`rounded-[22px] p-3.5 ${
                  usernameStatus.canChange
                    ? 'neu-flat border border-emerald-500/30 bg-emerald-50/20'
                    : 'neu-flat border border-amber-500/30 bg-amber-50/20'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      usernameStatus.canChange
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {usernameStatus.canChange ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      {usernameStatus.canChange
                        ? 'Username Change Available'
                        : '90-Day Cooldown Active'}
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                      {usernameStatus.canChange
                        ? 'You can change your username handle now. Once changed, you must wait 90 days before modifying it again.'
                        : `To protect community trust & prevent impersonation, usernames can only be changed once every 90 days. You have ${usernameStatus.daysRemaining} days remaining.`}
                    </p>
                    {currentUser.usernameLastChangedAt && (
                      <p className="text-[10px] font-semibold text-slate-400 mt-1">
                        Last changed: {usernameStatus.lastDateStr}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Username Input Field */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Username Handle (@)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#5B9DFF]">
                    @
                  </span>
                  <input
                    type="text"
                    disabled={!usernameStatus.canChange}
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                    placeholder="yourusername"
                    className={`w-full h-10 pl-8 pr-3 text-xs rounded-full font-semibold focus:outline-none ${
                      usernameStatus.canChange
                        ? 'neu-inset text-slate-800 focus:ring-1 focus:ring-[#5B9DFF]'
                        : 'bg-slate-100/70 border border-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 pl-1">
                  Only lowercase letters (a-z), numbers (0-9), dots (.), and underscores (_) allowed.
                </p>
              </div>

              {/* URL Preview */}
              <div className="neu-inset rounded-[18px] p-3 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700 block mb-0.5">Your Profile Link:</span>
                <span className="text-[#5B9DFF] font-mono">
                  funshann.com/@{username || 'username'}
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: INTERESTS & TAGS */}
          {activeTab === 'interests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Your Topics & Passions</h4>
                  <p className="text-[10px] text-slate-400">Select up to 10 interests to discover tailored feeds</p>
                </div>
                <span className="text-[11px] font-bold text-[#5B9DFF] px-2 py-0.5 rounded-full neu-raised">
                  {interests.length}/10
                </span>
              </div>

              {/* Selected Interests Chips */}
              {interests.length > 0 ? (
                <div className="neu-flat rounded-[20px] p-3 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Active Interests
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {interests.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1.5 rounded-full neu-active-blue text-white text-[11px] font-bold shadow-xs"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleInterest(tag)}
                          className="w-4 h-4 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="neu-inset rounded-[20px] p-4 text-center">
                  <p className="text-xs font-semibold text-slate-500">No interests selected yet</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Pick from suggestions below or add your own</p>
                </div>
              )}

              {/* Add Custom Interest Input */}
              <form onSubmit={handleAddCustomInterest} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-[#5B9DFF] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={customInterestInput}
                    onChange={(e) => setCustomInterestInput(e.target.value)}
                    placeholder="Add custom topic (e.g. Graphic Novels)..."
                    className="w-full h-10 pl-9 pr-3 text-xs neu-inset rounded-full text-slate-800 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!customInterestInput.trim() || interests.length >= 10}
                  className="h-10 px-3.5 rounded-full neu-active-blue text-white text-xs font-bold flex items-center gap-1 disabled:opacity-50 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>

              {/* Suggestions Tag Cloud */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Suggested Topics
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_INTERESTS.map((tag) => {
                    const isSelected = interests.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleInterest(tag)}
                        className={`h-7 px-3 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'neu-active-blue text-white shadow-xs'
                            : 'neu-raised text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>{tag}</span>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SOCIAL MEDIA LINKS */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Connected Social Profiles</h4>
                  <p className="text-[10px] text-slate-400">Display verified link buttons on your profile card</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingSocial(!isAddingSocial)}
                  className="h-7 px-2.5 rounded-full neu-active-blue text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isAddingSocial ? 'Cancel' : 'Add Link'}</span>
                </button>
              </div>

              {/* Add Social Link Sub-Form */}
              <AnimatePresence>
                {isAddingSocial && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="neu-flat rounded-[22px] p-3.5 space-y-3 overflow-hidden border border-[#5B9DFF]/30"
                  >
                    <h5 className="text-xs font-bold text-slate-800">New Social Channel</h5>

                    {/* Platform Selector Grid */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {(Object.keys(PLATFORM_CONFIG) as SocialLink['platform'][]).map((plat) => {
                        const Icon = PLATFORM_CONFIG[plat].icon;
                        const isSelected = newPlatform === plat;
                        return (
                          <button
                            key={plat}
                            type="button"
                            onClick={() => setNewPlatform(plat)}
                            className={`p-2 rounded-xl text-left flex items-center gap-1.5 transition text-[11px] font-bold ${
                              isSelected
                                ? 'neu-active-blue text-white shadow-xs'
                                : 'neu-raised text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{PLATFORM_CONFIG[plat].label.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Label/Title & URL Inputs */}
                    <div className="space-y-2 pt-1">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder={`Custom button title (optional, e.g. ${PLATFORM_CONFIG[newPlatform].label})`}
                        className="w-full h-9 px-3 text-xs neu-inset rounded-full text-slate-800 focus:outline-none"
                      />

                      <div className="relative">
                        <LinkIcon className="w-3.5 h-3.5 text-[#5B9DFF] absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={newUrl}
                          onChange={(e) => setNewUrl(e.target.value)}
                          placeholder={PLATFORM_CONFIG[newPlatform].placeholder}
                          className="w-full h-9 pl-8 pr-3 text-xs neu-inset rounded-full text-slate-800 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddSocialLink}
                      disabled={!newUrl.trim()}
                      className="w-full h-9 rounded-full neu-active-blue text-white text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-50 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Social Link</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Current Social Links List */}
              {socialLinks.length === 0 ? (
                <div className="neu-inset rounded-[20px] p-5 text-center space-y-1">
                  <Globe className="w-6 h-6 text-slate-400 mx-auto stroke-1" />
                  <p className="text-xs font-semibold text-slate-600">No social media links connected</p>
                  <p className="text-[10px] text-slate-400">Add your Instagram, X, YouTube or portfolio links</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {socialLinks.map((link) => {
                    const Icon = PLATFORM_CONFIG[link.platform]?.icon || Globe;
                    return (
                      <div
                        key={link.id}
                        className="neu-flat rounded-[20px] p-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF] shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-slate-800 truncate">
                              {link.title || PLATFORM_CONFIG[link.platform]?.label || 'Link'}
                            </h5>
                            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                              {link.url}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSocialLink(link.id)}
                          className="w-7 h-7 rounded-full neu-raised flex items-center justify-center text-rose-500 hover:bg-rose-50 transition shrink-0"
                          title="Remove link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Bar with Master Save */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-full neu-raised text-slate-600 text-xs font-bold hover:text-slate-900 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 h-11 rounded-full neu-active-blue text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:brightness-105 transition"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Save Profile</span>
          </button>
        </div>
      </motion.div>

      {/* 🖼️ EDIT PROFILE PICTURE ACTION SHEET / PICKER MODAL */}
      <AnimatePresence>
        {isAvatarSheetOpen && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="neu-flat rounded-t-[32px] sm:rounded-[32px] max-w-sm w-full p-5 space-y-4 shadow-2xl bg-white/95"
            >
              {/* Sheet Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF]">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Change Profile Picture</h4>
                    <p className="text-[10px] text-slate-400">Choose how you want to update your avatar</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvatarSheetOpen(false)}
                  className="w-7 h-7 rounded-full neu-raised flex items-center justify-center text-slate-500 hover:text-slate-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 3 Main Action Choices */}
              <div className="space-y-2">
                {/* 1. Choose from Gallery */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handlePickAvatarFromGallery}
                  className="w-full h-12 rounded-[20px] neu-raised px-4 flex items-center gap-3 text-left hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#5B9DFF] flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Choose from Gallery</span>
                    <span className="text-[10px] text-slate-400">Upload any photo from your device</span>
                  </div>
                </motion.button>

                {/* 2. Take a New Picture with Camera */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleCaptureAvatarWithCamera}
                  className="w-full h-12 rounded-[20px] neu-raised px-4 flex items-center gap-3 text-left hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Take Photo with Camera</span>
                    <span className="text-[10px] text-slate-400">Snap a fresh selfie or portrait</span>
                  </div>
                </motion.button>

                {/* 3. Remove Current Profile Picture */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleRemoveProfilePicture}
                  className="w-full h-12 rounded-[20px] neu-raised px-4 flex items-center gap-3 text-left hover:bg-rose-50/50 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-rose-600 block">Remove Current Picture</span>
                    <span className="text-[10px] text-slate-400">Reset to default initial avatar placeholder</span>
                  </div>
                </motion.button>
              </div>

              {/* Curated Presets Grid */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Or Pick Curated Avatar Preset
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatar(url);
                        setIsAvatarSheetOpen(false);
                        if (onShowToast) onShowToast('Preset avatar selected ✨');
                      }}
                      className={`relative w-full aspect-square rounded-2xl overflow-hidden neu-raised p-0.5 transition-transform hover:scale-105 ${
                        avatar === url ? 'ring-2 ring-[#5B9DFF]' : ''
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full rounded-xl object-cover" />
                      {avatar === url && (
                        <div className="absolute inset-0 bg-[#5B9DFF]/40 flex items-center justify-center text-white">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Close Sheet Button */}
              <button
                type="button"
                onClick={() => setIsAvatarSheetOpen(false)}
                className="w-full h-10 rounded-full neu-inset text-slate-600 text-xs font-bold hover:text-slate-900 transition"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
