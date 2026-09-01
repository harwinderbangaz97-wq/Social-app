import React, { useState } from 'react';
import {
  Settings,
  Edit3,
  Grid,
  Bookmark,
  MapPin,
  Link as LinkIcon,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Sun,
  Moon,
  Sparkles,
  Palette,
  ExternalLink,
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
  MessageSquare,
  Globe,
  Tag,
  AtSign,
  ArrowLeft,
  UserPlus,
  UserCheck,
  Share2,
  MoreVertical,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Post, ThemeMode, SocialLink } from '../types';
import { EditProfileModal } from './EditProfileModal';
import { IndividualUserMenu } from './IndividualUserMenu';
import { useNavigation } from '../context/NavigationContext';

interface ProfileViewProps {
  currentUser: User;
  profileUser?: User | null;
  userPosts: Post[];
  savedPosts: Post[];
  onUpdateUser: (updated: Partial<User>) => void;
  onPostSelect?: (post: Post) => void;
  onOpenSettings?: () => void;
  onOpenThemeStudio?: () => void;
  theme?: ThemeMode;
  onUpdateTheme?: (theme: ThemeMode) => void;
  onShowToast?: (msg: string) => void;
  onBack?: () => void;
  onToggleFollow?: (userId: string) => void;
  onOpenDirectChat?: (user: User) => void;
  lockedChatUserIds?: string[];
  onToggleLockChat?: (userId: string) => void;
  onClearChat?: (userId: string) => void;
}

const getSocialIcon = (platform: SocialLink['platform']) => {
  switch (platform) {
    case 'whatsapp':
      return PhoneCall;
    case 'snapchat':
      return Ghost;
    case 'instagram':
      return Instagram;
    case 'twitter':
      return Twitter;
    case 'threads':
      return AtSign;
    case 'youtube':
      return Youtube;
    case 'tiktok':
      return Music;
    case 'spotify':
      return Disc;
    case 'telegram':
      return Send;
    case 'discord':
      return Gamepad2;
    case 'pinterest':
      return Pin;
    case 'github':
      return Github;
    case 'linkedin':
      return Linkedin;
    default:
      return Globe;
  }
};

const ProfileViewComponent: React.FC<ProfileViewProps> = ({
  currentUser,
  profileUser,
  userPosts,
  savedPosts,
  onUpdateUser,
  onPostSelect,
  onOpenSettings,
  onOpenThemeStudio,
  theme = 'light',
  onUpdateTheme,
  onShowToast,
  onBack,
  onToggleFollow,
  onOpenDirectChat,
  lockedChatUserIds = [],
  onToggleLockChat,
  onClearChat,
}) => {
  const { navState, setIsEditProfileOpen, openPostPreview, closePostPreview } = useNavigation();
  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'saved'>('posts');
  const [isIndividualMenuOpen, setIsIndividualMenuOpen] = useState(false);
  const isEditModalOpen = navState.isEditProfileOpen;
  const selectedPreviewPost = navState.previewPost;

  const activeUser = currentUser;
  const displayedUser: User = profileUser || activeUser || {
    id: 'user_fallback',
    name: 'Funshann Member',
    username: 'user',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
  };
  const isOwnProfile = Boolean(displayedUser?.id && activeUser?.id && displayedUser.id === activeUser.id);
  const isUserLocked = lockedChatUserIds.includes(displayedUser.id);
  const userAvatar =
    displayedUser.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  const displayPosts = isOwnProfile
    ? activeSubTab === 'posts'
      ? userPosts
      : savedPosts
    : userPosts;

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}${window.location.pathname}#user-${displayedUser.username}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(profileUrl);
      }
    } catch {
      // ignore
    }
    if (onShowToast) {
      onShowToast(`@${displayedUser.username}'s profile link copied! 📋`);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 pb-28 pt-2">
      {/* Top Header Bar when viewing another user's profile */}
      {!isOwnProfile && (
        <div className="flex items-center justify-between mb-3 px-1">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onBack}
            className="h-9 px-3.5 rounded-full neu-raised text-xs font-bold text-slate-700 hover:text-[#5B9DFF] flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </motion.button>

          <div className="text-center">
            <span className="text-xs font-bold text-slate-800 tracking-tight block">
              {displayedUser.name}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              @{displayedUser.username}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleShareProfile}
              aria-label="Share profile"
              className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-slate-600 hover:text-[#5B9DFF] transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsIndividualMenuOpen(true)}
              aria-label="User settings"
              className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-slate-600 hover:text-[#5B9DFF] transition cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="neu-flat rounded-[28px] p-5 sm:p-6 mb-4 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          {/* Raised 3D Circular Avatar - Clearly larger & visually balanced */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full neu-raised p-1.5 shrink-0 self-start sm:self-center">
            <img
              src={userAvatar}
              alt={displayedUser.name || 'User'}
              loading="lazy"
              decoding="async"
              className="w-full h-full rounded-full object-cover shadow-xs"
            />
            {displayedUser.isVerified && (
              <div
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-md border-2 border-white dark:border-slate-800 flex items-center justify-center"
                title="Verified User"
              >
                <CheckCircle2 className="w-5 h-5 text-[#5B9DFF] fill-[#5B9DFF]/20" />
              </div>
            )}
          </div>

          {/* Action Buttons - Spacious, balanced, responsive */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            {isOwnProfile ? (
              <>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setIsEditProfileOpen(true)}
                  className="h-11 px-5 rounded-full neu-raised text-[13.5px] font-bold text-slate-700 hover:text-[#5B9DFF] flex items-center justify-center gap-2 transition-colors cursor-pointer flex-1 sm:flex-initial"
                >
                  <Edit3 className="w-4 h-4 text-[#5B9DFF]" />
                  <span>Edit Profile</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={onOpenSettings}
                  aria-label="Settings"
                  className="w-11 h-11 rounded-full neu-raised flex items-center justify-center text-slate-600 hover:text-[#5B9DFF] transition-colors cursor-pointer shrink-0"
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
              </>
            ) : (
              <>
                {/* Follow / Following Button */}
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => onToggleFollow && onToggleFollow(displayedUser.id)}
                  className={`h-11 px-5 rounded-full text-[13.5px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-initial shadow-sm ${
                    displayedUser.isFollowing
                      ? 'neu-inset text-slate-600 border border-slate-200/80'
                      : 'neu-active-blue text-white shadow-md'
                  }`}
                >
                  {displayedUser.isFollowing ? (
                    <>
                      <UserCheck className="w-4.5 h-4.5" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4.5 h-4.5" />
                      <span>Follow</span>
                    </>
                  )}
                </motion.button>

                {/* Direct Message Button */}
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => onOpenDirectChat && onOpenDirectChat(displayedUser)}
                  className="h-11 px-5 rounded-full neu-raised flex items-center justify-center gap-2 text-[13.5px] font-bold text-slate-700 hover:text-[#5B9DFF] transition cursor-pointer flex-1 sm:flex-initial shadow-sm"
                >
                  <MessageSquare className="w-4.5 h-4.5 text-[#5B9DFF]" />
                  <span>Message</span>
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="space-y-1.5 mb-3.5">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[22px] font-bold text-slate-800 tracking-tight">
              {displayedUser.name}
            </h2>
          </div>
          <p className="text-[13.5px] font-semibold text-[#5B9DFF]">
            @{displayedUser.username}
          </p>
          {displayedUser.bio && (
            <p className="text-[13.5px] text-slate-600 leading-relaxed pt-0.5">
              {displayedUser.bio}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3.5 text-[13px] text-slate-500 pt-1">
            {displayedUser.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-[#5B9DFF]" />
                {displayedUser.location}
              </span>
            )}
            {displayedUser.website && (
              <a
                href={
                  displayedUser.website.startsWith('http')
                    ? displayedUser.website
                    : `https://${displayedUser.website}`
                }
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[#5B9DFF] font-semibold hover:underline"
              >
                <LinkIcon className="w-4 h-4" />
                <span>{displayedUser.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}
          </div>
        </div>

        {/* User Interests / Passions Tags */}
        {displayedUser.interests && displayedUser.interests.length > 0 && (
          <div className="mb-3.5 pt-2 border-t border-slate-100/80">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Tag className="w-3.5 h-3.5 text-[#5B9DFF]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Interests & Passions
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {displayedUser.interests.map((tag) => {
                const cleanTag = tag.replace(/^#+/, '');
                return (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full neu-raised text-xs font-bold text-slate-700 hover:text-[#5B9DFF] transition-colors"
                  >
                    {cleanTag}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Connected Social Media Links - Icon Only */}
        {displayedUser.socialLinks && displayedUser.socialLinks.length > 0 && (
          <div className="mb-3.5 pt-2 border-t border-slate-100/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-[#5B9DFF]" />
                Connected Channels
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">
                {displayedUser.socialLinks.length} active
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {displayedUser.socialLinks.map((link) => {
                const Icon = getSocialIcon(link.platform);
                return (
                  <motion.a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    title={link.title || link.platform}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF] hover:border-[#5B9DFF]/50 transition group shadow-xs cursor-pointer"
                  >
                    <Icon className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                  </motion.a>
                );
              })}
            </div>
          </div>
        )}

        {/* 3D Neumorphic Statistics Counters */}
        <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-100 max-w-[370px] mx-auto w-full">
          <div className="neu-inset rounded-[15px] py-1.5 px-2 text-center">
            <span className="block text-[16.5px] font-extrabold text-slate-800 font-['Outfit'] leading-tight">
              {displayedUser.postsCount}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">
              Posts
            </span>
          </div>

          <div className="neu-inset rounded-[15px] py-1.5 px-2 text-center">
            <span className="block text-[16.5px] font-extrabold text-slate-800 font-['Outfit'] leading-tight">
              {displayedUser.followersCount > 999
                ? `${(displayedUser.followersCount / 1000).toFixed(1)}k`
                : displayedUser.followersCount}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">
              Followers
            </span>
          </div>

          <div className="neu-inset rounded-[15px] py-1.5 px-2 text-center">
            <span className="block text-[16.5px] font-extrabold text-slate-800 font-['Outfit'] leading-tight">
              {displayedUser.followingCount}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">
              Following
            </span>
          </div>
        </div>
      </div>

      {/* Tabs: Grid vs Saved (or just Grid for other users) */}
      {isOwnProfile ? (
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setActiveSubTab('posts')}
            className={`flex-1 h-11.5 rounded-full text-[13.5px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'posts'
                ? 'neu-active-blue text-white shadow-md'
                : 'neu-raised text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-4.5 h-4.5" />
            <span>My Photos ({userPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('saved')}
            className={`flex-1 h-11.5 rounded-full text-[13.5px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'saved'
                ? 'neu-active-blue text-white shadow-md'
                : 'neu-raised text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-4.5 h-4.5" />
            <span>Saved ({savedPosts.length})</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Grid className="w-4.5 h-4.5 text-[#5B9DFF]" />
            <span className="text-sm font-bold text-slate-800">
              Posts & Captures ({displayPosts.length})
            </span>
          </div>
        </div>
      )}

      {/* Photo Gallery Grid */}
      {displayPosts.length === 0 ? (
        <div className="neu-flat rounded-[24px] p-8 text-center">
          <p className="text-sm font-semibold text-slate-700">No posts in this collection</p>
          <p className="text-xs text-slate-400 mt-1">
            {isOwnProfile
              ? 'Upload photos to showcase your moments'
              : `@${displayedUser.username} has not shared photos yet`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5">
          {displayPosts.map((post) => (
            <motion.div
              key={post.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openPostPreview(post)}
              className="relative aspect-[4/5] rounded-[20px] overflow-hidden neu-raised cursor-pointer group"
            >
              <img
                src={post.imageUrl}
                alt={post.caption}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Hover overlay with likes and comments */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                <p className="text-[11px] line-clamp-2 mb-2 font-medium">
                  {post.caption}
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 font-bold">
                    <ThumbsUp className="w-3.5 h-3.5 fill-white" />
                    {post.likesCount}
                  </span>
                  {(post.dislikesCount || 0) > 0 && (
                    <span className="flex items-center gap-1 font-bold text-rose-200">
                      <ThumbsDown className="w-3.5 h-3.5 fill-rose-200" />
                      {post.dislikesCount}
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-bold">
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                    {post.commentsCount}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Custom Full-Featured Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && isOwnProfile && (
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditProfileOpen(false)}
            currentUser={currentUser}
            onSave={onUpdateUser}
            onShowToast={onShowToast}
          />
        )}
      </AnimatePresence>

      {/* Individual User Settings Menu */}
      {!isOwnProfile && (
        <IndividualUserMenu
          isOpen={isIndividualMenuOpen}
          onClose={() => setIsIndividualMenuOpen(false)}
          user={displayedUser}
          isFollowing={displayedUser.isFollowing}
          onToggleFollow={onToggleFollow}
          onClearChat={onClearChat}
          isLocked={isUserLocked}
          onToggleLockChat={onToggleLockChat}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};

export const ProfileView = React.memo(ProfileViewComponent);
