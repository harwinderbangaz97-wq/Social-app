import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Send,
  Image as ImageIcon,
  Camera,
  Check,
  CheckCheck,
  MoreVertical,
  X,
  Mic,
  Trash2,
  Sparkles,
  Search,
  Lock, Globe,
  Unlock,
  EyeOff,
  ShieldCheck,
  Palette,
  Flame,
  Eye,
  Shield,
  Flag,
  Copy,
  Clock,
  AlertTriangle,
  Info,
  Smile,
  Plus,
  Forward,
  Bell,
  BellOff,
  Users as UsersIcon,
  UserPlus,
  Crown,
  Settings,
  Edit3,
  Megaphone,
  MessageSquare,
  Share2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ChatThread, Message, VoiceNoteData, MessagePrivacyMode, MessageReportReason } from '../types';
import { MOCK_USERS } from '../data/mockData';
import { ShareCommunityModal } from './ShareCommunityModal';
import { VoiceMessageBubble } from './VoiceMessageBubble';
import { ChatWallpaperModal, ChatWallpaperSettings } from './ChatWallpaperModal';
import { DeleteMessageConfirmModal } from './DeleteMessageConfirmModal';
import { IndividualUserMenu } from './IndividualUserMenu';
import { UniversalReportModal } from './UniversalReportModal';
import { CreateGroupModal } from './CreateGroupModal';
import { GroupInfoModal } from './GroupInfoModal';
import { CommunityAdminSettingsModal } from './CommunityAdminSettingsModal';
import { CommunityChannelModal } from './CommunityChannelModal';
import { CHAT_WALLPAPERS } from '../data/wallpapers';
import { useNavigation } from '../context/NavigationContext';
import { usePermissionAndMedia } from '../context/PermissionAndMediaContext';
import { audioRecorder } from '../services/audioRecorderService';
import { validateMessageDeletion, getMessagePrivacySettings } from '../data/messagePrivacyService';
import { getIndividualChatSettings, saveIndividualChatSettings } from '../services/individualChatSettingsService';

export const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🎉'];
export const MORE_REACTIONS = [
  '👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🎉',
  '😍', '🥰', '🤩', '🥳', '💯', '✨', '💡', '🚀',
  '👀', '💪', '🙌', '🤝', '🎯', '💎', '🌟', '⚡',
  '😎', '🤔', '🫡', '🌸', '☕', '🎨', '🏖️', '⛰️',
];

interface ChatViewProps {
  threads: ChatThread[];
  currentUser: User;
  activeChatUserId?: string | null;
  onSelectThread: (threadId: string) => void;
  onBackToList: () => void;
  onSendMessage: (
    receiverId: string,
    text?: string,
    imageUrl?: string,
    voiceNote?: VoiceNoteData,
    privacyMode?: MessagePrivacyMode,
    isForwarded?: boolean,
    forwardedFrom?: string
  ) => void;
  onDeleteMessage?: (threadId: string, messageId: string) => void;
  onReportMessage?: (
    threadId: string,
    message: Message,
    reason: MessageReportReason,
    details?: string
  ) => void;
  onMarkMessageSeen?: (threadId: string, messageId: string) => void;
  onToggleReaction?: (threadId: string, messageId: string, emoji: string) => void;
  lockedChatUserIds?: string[];
  chatLockPasscode?: string;
  isChatLockEnabled?: boolean;
  onShowToast?: (message: string) => void;
  onOpenUserProfile?: (user: User) => void;
  onBackToHome?: () => void;
  onToggleFollow?: (userId: string) => void;
  onToggleLockChat?: (userId: string) => void;
  onClearChat?: (userId: string) => void;
  onCreateGroup?: (name: string, description: string, avatar: string, memberIds: string[]) => void;
  onUpdateGroup?: (groupId: string, updates: { name?: string; description?: string; avatar?: string; memberIds?: string[] }) => void;
  onLeaveGroup?: (groupId: string) => void;
  allUsers?: User[];
}

const CHAT_SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
];

// Single Message Bubble Item with Countdown, Long-press and Reaction Overlays
const MessageBubbleItem: React.FC<{
  msg: Message;
  isOwn: boolean;
  activeThreadId: string;
  currentUserId: string;
  onDeleteMessage?: (messageId: string) => void;
  onOpenContextMenu: (msg: Message) => void;
  onForward?: (msg: Message) => void;
  onImageClick: (url: string) => void;
  onToggleReaction?: (messageId: string, emoji: string) => void;
}> = ({
  msg,
  isOwn,
  currentUserId,
  onDeleteMessage,
  onOpenContextMenu,
  onForward,
  onImageClick,
  onToggleReaction,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const touchTimerRef = useRef<number | null>(null);
  const isTouchMoved = useRef(false);

  const initialDuration = msg.disappearingSeconds || (msg.privacyMode === 'immediate' ? 5 : 6);

  // Auto-Destruct countdown logic for Immediate and Seen modes
  useEffect(() => {
    let shouldCountDown = false;

    if (msg.privacyMode === 'immediate') {
      shouldCountDown = true;
    } else if (msg.privacyMode === 'after_seen' && msg.isRead) {
      shouldCountDown = true;
    }

    if (shouldCountDown) {
      setSecondsRemaining(initialDuration);
      const interval = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            if (onDeleteMessage) {
              onDeleteMessage(msg.id);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [msg.privacyMode, msg.isRead, msg.id, initialDuration, onDeleteMessage]);

  const handleTouchStart = () => {
    isTouchMoved.current = false;
    touchTimerRef.current = window.setTimeout(() => {
      if (!isTouchMoved.current) {
        if (navigator.vibrate) navigator.vibrate(40);
        onOpenContextMenu(msg);
      }
    }, 400);
  };

  const handleTouchMove = () => {
    isTouchMoved.current = true;
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.vibrate) navigator.vibrate(30);
    onOpenContextMenu(msg);
  };

  const percentLeft = secondsRemaining !== null && initialDuration > 0
    ? (secondsRemaining / initialDuration) * 100
    : 100;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      className={`group flex flex-col ${isOwn ? 'items-end' : 'items-start'} relative select-none`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onContextMenu={handleContextMenu}
    >
      {/* Bubble Container */}
      <div
        className={`relative max-w-[85%] rounded-[22px] p-3 text-xs leading-relaxed transition-all cursor-pointer ${
          isOwn
            ? msg.privacyMode === 'immediate'
              ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-br-sm shadow-md'
              : msg.privacyMode === 'after_seen'
              ? 'bg-gradient-to-r from-indigo-600 to-[#5B9DFF] text-white rounded-br-sm shadow-md'
              : 'neu-active-blue text-white rounded-br-sm shadow-md'
            : msg.privacyMode === 'immediate'
            ? 'bg-amber-50/95 text-amber-950 rounded-bl-sm border border-amber-200/80 shadow-xs'
            : msg.privacyMode === 'after_seen'
            ? 'bg-indigo-50/95 text-indigo-950 rounded-bl-sm border border-indigo-200/80 shadow-xs'
            : 'bg-white/95 backdrop-blur-md text-slate-800 rounded-bl-sm border border-slate-200/80 shadow-xs'
        }`}
      >
        {/* Sender Name in Group Chat */}
        {!isOwn && msg.senderName && (
          <span className="text-[10px] font-bold text-blue-600 mb-1 block">
            {msg.senderName}
          </span>
        )}

        {/* Forwarded Message Indicator Badge */}
        {msg.isForwarded && (
          <div className="flex items-center gap-1 mb-1.5 opacity-80 text-[10px] font-medium italic select-none">
            <Forward className="w-3 h-3" />
            <span>Forwarded{msg.forwardedFrom ? ` from ${msg.forwardedFrom}` : ''}</span>
          </div>
        )}

        {/* Privacy Vanishing Status Badge */}
        {msg.privacyMode === 'immediate' && (
          <div className="flex items-center gap-1 mb-1.5 px-1.5 py-0.5 rounded-full bg-black/20 text-[10px] font-bold w-fit">
            <Flame className="w-3 h-3 text-amber-300 animate-pulse" />
            <span>
              {secondsRemaining !== null
                ? `Vanishing in ${secondsRemaining}s...`
                : 'Vanishing message'}
            </span>
          </div>
        )}

        {msg.privacyMode === 'after_seen' && (
          <div className="flex items-center gap-1 mb-1.5 px-1.5 py-0.5 rounded-full bg-black/20 text-[10px] font-bold w-fit">
            <Eye className="w-3 h-3 text-indigo-200" />
            <span>
              {msg.isRead
                ? secondsRemaining !== null
                  ? `Seen • Vanishing in ${secondsRemaining}s...`
                  : 'Seen'
                : 'Disappears once seen'}
            </span>
          </div>
        )}

        {/* Voice Note Bubble */}
        {msg.voiceNote && (
          <VoiceMessageBubble voiceNote={msg.voiceNote} isOwn={isOwn} />
        )}

        {/* Optional Image */}
        {msg.imageUrl && (
          <div
            className="mb-2 rounded-[14px] overflow-hidden cursor-pointer neu-inset"
            onClick={(e) => {
              e.stopPropagation();
              onImageClick(msg.imageUrl || '');
            }}
          >
            <img
              src={msg.imageUrl}
              alt="Sent attachment"
              className="w-full max-h-60 object-cover hover:scale-102 transition-transform duration-300"
            />
          </div>
        )}

        {/* Text Message */}
        {msg.text && <p className="font-normal whitespace-pre-wrap">{msg.text}</p>}

        {/* Animated Countdown Progress Bar for Ephemeral Messages */}
        {secondsRemaining !== null && (
          <div className="w-full h-1 bg-black/20 rounded-full mt-2 overflow-hidden">
            <motion.div
              className={`h-full ${msg.privacyMode === 'immediate' ? 'bg-amber-300' : 'bg-indigo-300'}`}
              style={{ width: `${percentLeft}%` }}
              transition={{ ease: 'linear', duration: 1 }}
            />
          </div>
        )}
      </div>

      {/* Reaction Icons & Count Overlay (Attached below the bubble) */}
      {msg.reactions && msg.reactions.length > 0 && (
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex flex-wrap items-center gap-1 mt-1 z-10 select-none ${
            isOwn ? 'justify-end pr-1' : 'justify-start pl-1'
          }`}
        >
          {msg.reactions.map((r) => {
            const hasUserReacted = r.userIds.includes(currentUserId);
            return (
              <motion.button
                key={r.emoji}
                type="button"
                whileTap={{ scale: 0.82 }}
                whileHover={{ scale: 1.1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleReaction) {
                    if (navigator.vibrate) navigator.vibrate(20);
                    onToggleReaction(msg.id, r.emoji);
                  }
                }}
                className={`group/r flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shadow-xs transition cursor-pointer backdrop-blur-md ${
                  hasUserReacted
                    ? 'bg-blue-50/95 border border-[#5B9DFF] text-[#1d4ed8] shadow-sm ring-1 ring-[#5B9DFF]/30 font-bold'
                    : 'bg-white/95 border border-slate-200/90 text-slate-700 hover:bg-slate-50'
                }`}
                title={
                  hasUserReacted
                    ? `You reacted with ${r.emoji} (tap to remove)`
                    : `React with ${r.emoji} (${r.count})`
                }
              >
                <span className="text-sm leading-none transition-transform group-hover/r:scale-120">
                  {r.emoji}
                </span>
                {r.count > 1 && (
                  <span className="text-[10px] font-bold opacity-90">{r.count}</span>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* Timestamp, Seen Status, and Quick Options Button */}
      <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-slate-500 font-semibold drop-shadow-xs">
        <span className="bg-white/70 backdrop-blur-xs px-1.5 py-0.2 rounded-md">{msg.timestamp}</span>
        {isOwn && (
          <span title={msg.isRead ? 'Seen by recipient' : 'Delivered'}>
            <CheckCheck
              className={`w-3 h-3 ${msg.isRead ? 'text-[#5B9DFF]' : 'text-slate-400'}`}
            />
          </span>
        )}

        {/* Quick Forward Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onForward) onForward(msg);
            else onOpenContextMenu(msg);
          }}
          className="opacity-60 hover:opacity-100 p-0.5 text-slate-400 hover:text-blue-600 transition cursor-pointer"
          title="Forward message"
        >
          <Forward className="w-3 h-3" />
        </button>

        {/* Quick React & Context options trigger on hover/tap */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenContextMenu(msg);
          }}
          className="opacity-60 hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          title="More options (long-press or right-click)"
        >
          <MoreVertical className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
};

// Animated Typing Indicator Bubble for the other participant
const TypingIndicatorBubble: React.FC<{ participant: User }> = ({ participant }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.92 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className="flex items-end gap-2.5 max-w-[85%] select-none my-1.5"
    >
      {/* Participant Avatar */}
      <div className="w-8 h-8 rounded-full neu-raised p-0.5 flex-shrink-0 mb-1">
        <img
          src={participant.avatar}
          alt={participant.name}
          className="w-full h-full rounded-full object-cover"
        />
      </div>

      {/* Typing Bubble */}
      <div className="flex flex-col items-start">
        <div className="neu-flat-soft rounded-[22px] rounded-tl-sm px-4 py-3 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm flex items-center gap-3">
          {/* 3 Animated Bouncing Dots */}
          <div className="flex items-center gap-1.5 py-0.5 px-0.5">
            <motion.span
              animate={{ y: [0, -6, 0], scale: [0.9, 1.25, 0.9] }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0,
              }}
              className="w-2.5 h-2.5 rounded-full bg-[#5B9DFF] shadow-xs"
            />
            <motion.span
              animate={{ y: [0, -6, 0], scale: [0.9, 1.25, 0.9] }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.2,
              }}
              className="w-2.5 h-2.5 rounded-full bg-[#5B9DFF] shadow-xs"
            />
            <motion.span
              animate={{ y: [0, -6, 0], scale: [0.9, 1.25, 0.9] }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.4,
              }}
              className="w-2.5 h-2.5 rounded-full bg-[#5B9DFF] shadow-xs"
            />
          </div>

          {/* Typing Label */}
          <span className="text-[11px] font-semibold text-slate-600 italic tracking-tight">
            {participant.name.split(' ')[0]} is typing...
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export const ChatView: React.FC<ChatViewProps> = ({
  threads,
  currentUser,
  activeChatUserId,
  onSelectThread,
  onBackToList,
  onSendMessage,
  onDeleteMessage,
  onReportMessage,
  onMarkMessageSeen,
  onToggleReaction,
  lockedChatUserIds = [],
  chatLockPasscode = '123456',
  isChatLockEnabled = true,
  onShowToast,
  onOpenUserProfile,
  onBackToHome,
  onToggleFollow,
  onToggleLockChat,
  onClearChat,
  onCreateGroup,
  onUpdateGroup,
  onLeaveGroup,
  allUsers = [],
}) => {
  const {
    navState,
    setChatAttachmentOpen,
    setChatWallpaperOpen,
    setChatLightboxUrl,
    setChatMenuOpen,
  } = useNavigation();
  const { chooseFromGallery, takePhoto, requestPermission } = usePermissionAndMedia();

  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const showImagePicker = navState.chatAttachmentOpen;
  const setShowImagePicker = setChatAttachmentOpen;
  const lightboxImage = navState.chatLightboxUrl;
  const setLightboxImage = setChatLightboxUrl;
  const isWallpaperModalOpen = navState.chatWallpaperOpen;
  const setIsWallpaperModalOpen = setChatWallpaperOpen;
  const showThreadMenu = navState.chatMenuOpen;
  const setShowThreadMenu = setChatMenuOpen;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMainTab, setActiveMainTab] = useState<'messages' | 'communities'>('messages');

    // Communities Tab State
  const [communitySearchQuery, setCommunitySearchQuery] = useState('');
  const [selectedCommunityCategory, setSelectedCommunityCategory] = useState<string>('All');
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<string[]>(['c1', 'c2']);
  const [pendingJoinRequests, setPendingJoinRequests] = useState<string[]>([]);
  const [joinRequestModalCommunity, setJoinRequestModalCommunity] = useState<any | null>(null);
  const [selectedChannelCommunity, setSelectedChannelCommunity] = useState<any | null>(null);
  const [shareCommunityTarget, setShareCommunityTarget] = useState<any | null>(null);
  const [showInputEmojiPicker, setShowInputEmojiPicker] = useState(false);
  const [joinRequestNote, setJoinRequestNote] = useState('');
  const [localToast, setLocalToast] = useState<{ id: string; message: string; type?: 'success' | 'info' | 'warning' } | null>(null);

  const triggerCommunityToast = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    if (onShowToast) {
      onShowToast(message);
    }
    setLocalToast({ id: Date.now().toString(), message, type });
    setTimeout(() => {
      setLocalToast((curr) => (curr?.message === message ? null : curr));
    }, 3500);
  };

  const handleToggleCommunityState = (community: any) => {
    if (joinedCommunityIds.includes(community.id)) {
      setJoinedCommunityIds((prev) => prev.filter((id) => id !== community.id));
      triggerCommunityToast(`You left "${community.name}"`, 'info');
    } else if (community.isPrivate) {
      if (pendingJoinRequests.includes(community.id)) {
        setPendingJoinRequests((prev) => prev.filter((id) => id !== community.id));
        triggerCommunityToast(`Join request cancelled for "${community.name}"`, 'info');
      } else {
        setJoinRequestModalCommunity(community);
        setJoinRequestNote('');
      }
    } else {
      setJoinedCommunityIds((prev) => [...prev, community.id]);
      triggerCommunityToast(`Joined "${community.name}" 🎉`, 'success');
    }
  };

  const handleSendJoinRequest = () => {
    if (!joinRequestModalCommunity) return;
    const comm = joinRequestModalCommunity;
    setPendingJoinRequests((prev) => [...prev, comm.id]);
    setJoinRequestModalCommunity(null);
    triggerCommunityToast(`Join request sent to admin (${comm.adminName}) for "${comm.name}" 📩`, 'success');
  };

  // Create Community Modal & Form State
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createCategory, setCreateCategory] = useState('Tech');
  const [createIsPrivate, setCreateIsPrivate] = useState(false);
  const [createGradient, setCreateGradient] = useState('from-indigo-500 to-blue-600');

  // Owner Options / Manage Community Modal State
  const [ownerManageCommunity, setOwnerManageCommunity] = useState<any | null>(null);
  const [ownerActiveTab, setOwnerActiveTab] = useState<'edit' | 'requests' | 'broadcast' | 'danger'>('edit');
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editIsPrivate, setEditIsPrivate] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // Admin Join Requests per Community
  const [incomingJoinRequests, setIncomingJoinRequests] = useState<{ [communityId: string]: Array<{ id: string; name: string; note: string; timestamp: string }> }>({
    c3: [
      { id: 'req_1', name: 'Jordan Smith', note: 'Hi! Would love portfolio critiques.', timestamp: '10m ago' },
      { id: 'req_2', name: 'Taylor Swift', note: 'UI designer looking for design system teardowns.', timestamp: '1h ago' },
    ],
  });

  // Dynamic Communities State (c1 & c3 are owned by current user!)
  const [communities, setCommunities] = useState<any[]>([
    {
      id: 'c1',
      name: 'Tech Enthusiasts',
      description: 'Discuss web dev, React 19, AI models, and modern frameworks.',
      lastMessage: 'React Developer: Has anyone tried React 19 hooks yet?',
      members: '12.5k',
      isPrivate: false,
      adminName: currentUser.name || 'You',
      ownerId: currentUser.id,
      category: 'Tech',
      gradient: 'from-indigo-500 to-blue-600',
      bgLight: 'bg-indigo-50',
      borderLight: 'border-indigo-200/60',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'c2',
      name: 'Local Hikers & Explorers',
      description: 'Share trail recommendations, gear tips, and organize weekend group climbs.',
      lastMessage: 'Sarah: See you all at 8 AM tomorrow at the main trailhead!',
      members: '3.2k',
      isPrivate: false,
      adminName: 'Sarah Jenkins',
      category: 'Outdoors',
      gradient: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50',
      borderLight: 'border-emerald-200/60',
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'c3',
      name: 'UI/UX Designers Guild',
      description: 'Private community for portfolio critiques, Figma tricks, and design systems.',
      lastMessage: 'Alex (Admin): Weekly design system teardown begins in 1 hr.',
      members: '4.8k',
      isPrivate: true,
      adminName: currentUser.name || 'You',
      ownerId: currentUser.id,
      category: 'Design',
      gradient: 'from-purple-500 to-pink-600',
      bgLight: 'bg-purple-50',
      borderLight: 'border-purple-200/60',
      badgeColor: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'c4',
      name: 'Crypto & Web3 Pioneers',
      description: 'Private circle exploring DeFi protocols, smart contracts, and Web3 security.',
      lastMessage: 'Marcus (Admin): New analysis paper posted in general channel.',
      members: '1.9k',
      isPrivate: true,
      adminName: 'Marcus Vance',
      category: 'Crypto',
      gradient: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50',
      borderLight: 'border-amber-200/60',
      badgeColor: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'c5',
      name: 'Photography & Visual Arts',
      description: 'Showcase high-res landscape & portrait shots, color grading, and camera gear.',
      lastMessage: 'Elena: Just shared my golden hour photo series from Yosemite!',
      members: '45.1k',
      isPrivate: false,
      adminName: 'Elena Rostova',
      category: 'Arts',
      gradient: 'from-rose-500 to-red-600',
      bgLight: 'bg-rose-50',
      borderLight: 'border-rose-200/60',
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'c6',
      name: 'React & TypeScript Mastery',
      description: 'Advanced design patterns, generic type mastery, and state engine optimization.',
      lastMessage: 'David: Created a reusable state machine helper for React forms!',
      members: '8.9k',
      isPrivate: false,
      adminName: 'David Chen',
      category: 'Tech',
      gradient: 'from-cyan-500 to-blue-600',
      bgLight: 'bg-cyan-50',
      borderLight: 'border-cyan-200/60',
      badgeColor: 'bg-cyan-100 text-cyan-700',
    },
  ]);

  const filteredCommunities = communities.filter((community) => {
    const matchesQuery =
      community.name.toLowerCase().includes(communitySearchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(communitySearchQuery.toLowerCase()) ||
      community.category.toLowerCase().includes(communitySearchQuery.toLowerCase());

    if (!matchesQuery) return false;

    if (selectedCommunityCategory === 'Joined') return joinedCommunityIds.includes(community.id);
    if (selectedCommunityCategory === 'Owned') return community.adminName === currentUser.name || community.ownerId === currentUser.id;
    if (selectedCommunityCategory === 'Private') return community.isPrivate;
    if (selectedCommunityCategory === 'Public') return !community.isPrivate;
    return true;
  });

  const handleCreateCommunitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      triggerCommunityToast('Please enter a community name', 'warning');
      return;
    }
    const newId = 'c_' + Date.now();
    const newComm = {
      id: newId,
      name: createName.trim(),
      description: createDesc.trim() || `A community created by ${currentUser.name || 'You'}`,
      lastMessage: `${currentUser.name || 'You'}: Welcome to ${createName.trim()}! 🎉`,
      members: '1 member',
      isPrivate: createIsPrivate,
      adminName: currentUser.name || 'You',
      ownerId: currentUser.id,
      category: createCategory,
      gradient: createGradient,
      bgLight: 'bg-indigo-50',
      borderLight: 'border-indigo-200/60',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    };

    setCommunities((prev) => [newComm, ...prev]);
    setJoinedCommunityIds((prev) => [...prev, newId]);
    setIsCreateCommunityOpen(false);
    setCreateName('');
    setCreateDesc('');
    setCreateCategory('Tech');
    setCreateIsPrivate(false);
    triggerCommunityToast(`Community "${newComm.name}" created! You are the owner 👑`, 'success');
  };

  const openOwnerManager = (community: any) => {
    setOwnerManageCommunity(community);
    setEditName(community.name);
    setEditDesc(community.description);
    setEditCategory(community.category);
    setEditIsPrivate(community.isPrivate);
    setOwnerActiveTab('edit');
  };

  const handleSaveOwnerEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerManageCommunity) return;
    setCommunities((prev) =>
      prev.map((c) =>
        c.id === ownerManageCommunity.id
          ? {
              ...c,
              name: editName.trim() || c.name,
              description: editDesc.trim() || c.description,
              category: editCategory || c.category,
              isPrivate: editIsPrivate,
            }
          : c
      )
    );
    setOwnerManageCommunity(null);
    triggerCommunityToast(`Updated community settings for "${editName}" ⚙️`, 'success');
  };

  const handleApproveJoinRequest = (communityId: string, reqId: string, applicantName: string) => {
    setIncomingJoinRequests((prev) => ({
      ...prev,
      [communityId]: (prev[communityId] || []).filter((r) => r.id !== reqId),
    }));
    triggerCommunityToast(`Approved join request for ${applicantName}! 🎉`, 'success');
  };

  const handleRejectJoinRequest = (communityId: string, reqId: string, applicantName: string) => {
    setIncomingJoinRequests((prev) => ({
      ...prev,
      [communityId]: (prev[communityId] || []).filter((r) => r.id !== reqId),
    }));
    triggerCommunityToast(`Declined join request from ${applicantName}`, 'info');
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim() || !ownerManageCommunity) return;
    triggerCommunityToast(`📢 Broadcast sent to ${ownerManageCommunity.name}: "${broadcastMessage.trim()}"`, 'success');
    setBroadcastMessage('');
  };

  const handleDeleteCommunity = (communityId: string, communityName: string) => {
    setCommunities((prev) => prev.filter((c) => c.id !== communityId));
    setJoinedCommunityIds((prev) => prev.filter((id) => id !== communityId));
    setOwnerManageCommunity(null);
    triggerCommunityToast(`Community "${communityName}" has been deleted`, 'warning');
  };
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);

  // Context Menu & Modals State
  const [contextMessage, setContextMessage] = useState<Message | null>(null);
  const [showExtendedReactions, setShowExtendedReactions] = useState(false);
  const [reportTargetMessage, setReportTargetMessage] = useState<Message | null>(null);
  const [deleteTargetMessage, setDeleteTargetMessage] = useState<Message | null>(null);
  const [forwardTargetMessage, setForwardTargetMessage] = useState<Message | null>(null);
  const [forwardSearchQuery, setForwardSearchQuery] = useState('');

  const [globalWallpaper, setGlobalWallpaper] = useState<ChatWallpaperSettings>(() => {
    try {
      const saved = localStorage.getItem('funshann_global_chat_wallpaper');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      wallpaperId: 'clean-default',
      dimming: 15,
      blur: 0,
      applyToAll: true,
    };
  });

  const [wallpapersByThread, setWallpapersByThread] = useState<Record<string, ChatWallpaperSettings>>(() => {
    try {
      const saved = localStorage.getItem('funshann_chat_wallpapers');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveWaveform, setLiveWaveform] = useState<number[]>([20, 40, 60, 30, 75, 45, 90, 60, 30, 80, 50, 40]);
  const [chatTabFilter, setChatTabFilter] = useState<'direct' | 'groups'>('direct');
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isGroupInfoModalOpen, setIsGroupInfoModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = activeChatUserId
    ? threads.find((t) => t.participant?.id === activeChatUserId || t.id === activeChatUserId)
    : null;

  // Auto scroll to bottom when messages update or typing state changes
  useEffect(() => {
    if (activeThread) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread?.messages, activeThread?.isTyping]);

  // When active thread changes or opens, mark unread incoming messages as seen
  useEffect(() => {
    if (activeThread && onMarkMessageSeen) {
      activeThread.messages.forEach((m) => {
        if (m.receiverId === currentUser.id && !m.isRead) {
          onMarkMessageSeen(activeThread.id, m.id);
        }
      });
    }
  }, [activeThread?.id, activeThread?.messages, currentUser.id, onMarkMessageSeen]);

  // Prune messages according to individual chat setting (48 hours or 1 week)
  useEffect(() => {
    if (!activeThread || !onDeleteMessage) return;
    const settings = getIndividualChatSettings((activeThread.isGroup ? activeThread.id : activeThread.participant?.id || ''));
    const now = Date.now();

    if (settings.autoDelete === '48h') {
      const maxAgeMs = 48 * 3600 * 1000;
      activeThread.messages.forEach((m) => {
        const msgTime = m.createdAt || (m.timestamp === 'Just now' ? now : 0);
        if (msgTime && now - msgTime > maxAgeMs) {
          onDeleteMessage(activeThread.id, m.id);
        }
      });
    } else if (settings.autoDelete === '1week') {
      const maxAgeMs = 7 * 24 * 3600 * 1000;
      activeThread.messages.forEach((m) => {
        const msgTime = m.createdAt || (m.timestamp === 'Just now' ? now : 0);
        if (msgTime && now - msgTime > maxAgeMs) {
          onDeleteMessage(activeThread.id, m.id);
        }
      });
    }
  }, [activeThread?.id, activeThread?.messages.length, onDeleteMessage]);

  // Clean up any active recording streams on unmount
  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, []);

  const cleanupRecording = () => {
    audioRecorder.cancelRecording();
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  // Start Voice Recording
  const handleStartRecording = async () => {
    // Request microphone permission on demand if not granted
    const hasMicPermission = await requestPermission('microphone', 'Voice Messages');
    if (!hasMicPermission) {
      return;
    }

    setIsRecordingVoice(true);
    setRecordingSeconds(0);

    const ok = await audioRecorder.startRecording({
      onWaveform: (waveform) => {
        setLiveWaveform(waveform);
      },
      onTick: (seconds) => {
        setRecordingSeconds(seconds);
      },
    });

    if (!ok) {
      setIsRecordingVoice(false);
      setRecordingSeconds(0);
    }
  };

  const handleCancelRecording = () => {
    cleanupRecording();
  };

  const handleSendVoiceNote = async () => {
    if (!activeThread) {
      cleanupRecording();
      return;
    }

    const result = await audioRecorder.stopRecording();

    const voiceData: VoiceNoteData = {
      audioUrl: result.audioUrl,
      durationSeconds: result.durationSeconds,
      waveform: result.waveform,
    };

    const userSettings = getIndividualChatSettings((activeThread.isGroup ? activeThread.id : activeThread.participant?.id || ''));
    const privacySettings = getMessagePrivacySettings();
    let effectivePrivacyMode: MessagePrivacyMode = 'normal';
    if (userSettings.autoDelete === 'seen') {
      effectivePrivacyMode = 'after_seen';
    } else if (privacySettings.deleteImmediately || privacySettings.defaultPrivacyMode === 'immediate') {
      effectivePrivacyMode = 'immediate';
    } else if (privacySettings.deleteAfterSeen || privacySettings.defaultPrivacyMode === 'after_seen') {
      effectivePrivacyMode = 'after_seen';
    }

    onSendMessage(
      (activeThread.isGroup ? activeThread.id : activeThread.participant?.id || ''),
      undefined,
      undefined,
      voiceData,
      effectivePrivacyMode
    );

    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachedImage) || !activeThread) return;

    const userSettings = getIndividualChatSettings((activeThread.isGroup ? activeThread.id : activeThread.participant?.id || ''));
    const privacySettings = getMessagePrivacySettings();
    let effectivePrivacyMode: MessagePrivacyMode = 'normal';
    if (userSettings.autoDelete === 'seen') {
      effectivePrivacyMode = 'after_seen';
    } else if (privacySettings.deleteImmediately || privacySettings.defaultPrivacyMode === 'immediate') {
      effectivePrivacyMode = 'immediate';
    } else if (privacySettings.deleteAfterSeen || privacySettings.defaultPrivacyMode === 'after_seen') {
      effectivePrivacyMode = 'after_seen';
    }

    onSendMessage(
      (activeThread.isGroup ? activeThread.id : activeThread.participant?.id || ''),
      inputText.trim() || undefined,
      attachedImage || undefined,
      undefined,
      effectivePrivacyMode
    );
    setInputText('');
    setAttachedImage(null);
    setShowImagePicker(false);
  };

  const handleSelectAttachment = (imageUrl: string) => {
    setAttachedImage(imageUrl);
    setShowImagePicker(false);
  };

  const handlePickAttachmentGallery = async () => {
    const res = await chooseFromGallery({
      accept: 'image/*,video/*',
      featureName: 'Chat Media Attachment',
    });
    if (res) {
      setAttachedImage(res.url);
      setShowImagePicker(false);
    }
  };

  const handleCaptureAttachmentCamera = async () => {
    const res = await takePhoto({
      facingMode: 'environment',
      title: 'Snap Chat Photo',
    });
    if (res) {
      setAttachedImage(res.url);
      setShowImagePicker(false);
    }
  };

  // Resolved wallpaper settings
  const currentThreadWallpaper: ChatWallpaperSettings =
    (activeThread && wallpapersByThread[(activeThread.isGroup ? activeThread.id : activeThread.participant?.id || '')]) || globalWallpaper;

  const handleSaveWallpaper = (settings: ChatWallpaperSettings) => {
    if (settings.applyToAll) {
      setGlobalWallpaper(settings);
      setWallpapersByThread({});
      try {
        localStorage.setItem('funshann_global_chat_wallpaper', JSON.stringify(settings));
        localStorage.removeItem('funshann_chat_wallpapers');
      } catch {}
    } else if (activeThread) {
      const updated = {
        ...wallpapersByThread,
        [(activeThread.isGroup ? activeThread.id : activeThread.participant?.id || '')]: settings,
      };
      setWallpapersByThread(updated);
      try {
        localStorage.setItem('funshann_chat_wallpapers', JSON.stringify(updated));
      } catch {}
    } else {
      setGlobalWallpaper(settings);
      try {
        localStorage.setItem('funshann_global_chat_wallpaper', JSON.stringify(settings));
      } catch {}
    }
  };

  const getThreadBackgroundStyle = () => {
    if (currentThreadWallpaper.wallpaperId === 'custom' && currentThreadWallpaper.customUrl) {
      return {
        backgroundImage: `url(${currentThreadWallpaper.customUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    const def =
      CHAT_WALLPAPERS.find((w) => w.id === currentThreadWallpaper.wallpaperId) || CHAT_WALLPAPERS[0];
    if (def.id === 'clean-default') {
      return {
        background: 'transparent',
      };
    }
    if (def.type === 'image') {
      return {
        backgroundImage: `url(${def.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    if (def.type === 'gradient') {
      return {
        background: def.value,
      };
    }
    if (def.type === 'pattern') {
      return {
        backgroundColor: '#f8fafc',
        backgroundImage: def.value,
        backgroundSize: def.id === 'dot-grid' ? '18px 18px' : '24px 24px',
        backgroundPosition: 'center',
      };
    }
    return {
      background: 'transparent',
    };
  };

  // Perform permanent manual deletion with security validation
  const handleConfirmPermanentDelete = () => {
    if (!deleteTargetMessage || !activeThread) return;

    const validation = validateMessageDeletion(deleteTargetMessage, currentUser.id);
    if (!validation.allowed) {
      if (onShowToast) onShowToast(validation.error || 'Cannot delete message.');
      return;
    }

    if (onDeleteMessage) {
      onDeleteMessage(activeThread.id, deleteTargetMessage.id);
    }
    if (onShowToast) {
      onShowToast('Message deleted for everyone 🗑️');
    }
    setDeleteTargetMessage(null);
  };

  // Auto delete message (for immediate & after_seen timers)
  const handleAutoDeleteMessage = (messageId: string) => {
    if (!activeThread) return;
    if (onDeleteMessage) {
      onDeleteMessage(activeThread.id, messageId);
    }
  };

  // Copy text to clipboard
  const handleCopyMessageText = (msg: Message) => {
    if (msg.text) {
      navigator.clipboard?.writeText(msg.text);
      if (onShowToast) onShowToast('Message copied to clipboard 📋');
    }
    setContextMessage(null);
  };

  // Forward message to selected contact
  const handleForwardMessage = (recipientUser: User | { id: string; name: string; username?: string; avatar: string }) => {
    if (!forwardTargetMessage) return;

    // Determine sender attribution name
    let originSenderName = 'Someone';
    if (forwardTargetMessage.senderId === currentUser.id) {
      originSenderName = currentUser.name;
    } else if (activeThread && forwardTargetMessage.senderId === (activeThread.isGroup ? activeThread.id : activeThread.participant?.id || '')) {
      originSenderName = (activeThread.isGroup ? activeThread.groupName || '' : activeThread.participant?.name || '');
    } else if (forwardTargetMessage.senderName) {
      originSenderName = forwardTargetMessage.senderName;
    } else {
      const foundSender = MOCK_USERS.find((u) => u.id === forwardTargetMessage.senderId);
      if (foundSender) originSenderName = foundSender.name;
    }

    // Call onSendMessage with forwarded payload
    onSendMessage(
      recipientUser.id,
      forwardTargetMessage.text,
      forwardTargetMessage.imageUrl,
      forwardTargetMessage.voiceNote,
      'normal',
      true,
      originSenderName
    );

    if (onShowToast) {
      onShowToast(`Message forwarded to ${recipientUser.name} ✈️`);
    }

    // Close forward modal and reset state
    setForwardTargetMessage(null);
    setForwardSearchQuery('');
  };

  // Open active thread
  if (activeThread) {
    return (
      <div className="fixed inset-0 z-50 bg-[#f4f7fb] flex flex-col h-[100dvh] w-full overflow-hidden pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
        {/* Thread Top Bar */}
        <div className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 py-3 flex items-center justify-between z-20 shadow-xs flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onBackToList();
              }}
              className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-slate-700 hover:text-[#5B9DFF] transition flex-shrink-0 cursor-pointer select-none touch-manipulation active:scale-95"
              title="Back to conversations"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5 pointer-events-none" />
            </button>

            <div
              onClick={() => onOpenUserProfile && onOpenUserProfile(activeThread.participant!)}
              className="flex items-center gap-2.5 cursor-pointer group min-w-0"
              title="View Profile"
            >
              <div className="relative w-10 h-10 rounded-full neu-raised p-0.5 flex-shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src={(activeThread.isGroup ? activeThread.groupAvatar || '' : activeThread.participant?.avatar || '')}
                  alt={(activeThread.isGroup ? activeThread.groupName || '' : activeThread.participant?.name || '')}
                  className="w-full h-full rounded-full object-cover"
                />
                {(activeThread.isGroup ? true : activeThread.participant?.isOnline) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#5B9DFF] ring-2 ring-white" />
                )}
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-[#5B9DFF] transition-colors">
                  {(activeThread.isGroup ? activeThread.groupName || '' : activeThread.participant?.name || '')}
                </h3>
                {activeThread.isTyping ? (
                  <p className="text-[11px] text-[#5B9DFF] font-bold truncate flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5B9DFF] inline-block animate-ping" />
                    <span className="italic">typing...</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-[#5B9DFF] font-semibold truncate">
                    {(activeThread.isGroup ? true : activeThread.participant?.isOnline) ? 'Online now' : 'Active recently'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Mute Toggle */}
            {(() => {
              const currentSettings = getIndividualChatSettings((activeThread.isGroup ? activeThread.id : activeThread.participant?.id || ''));
              const isMuted = currentSettings.isMuted;
              return (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newMuted = !isMuted;
                    const duration = newMuted ? 'permanent' : 'off';
                    saveIndividualChatSettings((activeThread.isGroup ? activeThread.id : activeThread.participant?.id || ''), {
                      isMuted: newMuted,
                      muteDuration: duration,
                    });
                    if (onShowToast) {
                      onShowToast(newMuted ? `Muted notifications from ${(activeThread.isGroup ? activeThread.groupName || '' : activeThread.participant?.name || '')}` : `Unmuted notifications from ${(activeThread.isGroup ? activeThread.groupName || '' : activeThread.participant?.name || '')}`);
                    }
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer select-none touch-manipulation active:scale-95 z-30 ${
                    isMuted ? 'neu-inset text-rose-500 bg-rose-50/50' : 'neu-raised text-slate-600 hover:text-slate-900'
                  }`}
                  title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
                  aria-label={isMuted ? 'Unmute notifications' : 'Mute notifications'}
                >
                  {isMuted ? <BellOff className="w-4.5 h-4.5 pointer-events-none text-rose-500" /> : <Bell className="w-4.5 h-4.5 pointer-events-none" />}
                </button>
              );
            })()}

            {/* More Menu Trigger */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowThreadMenu(true);
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 neu-raised transition cursor-pointer select-none touch-manipulation active:scale-95 z-30"
              title="Individual conversation settings"
              aria-label="Individual conversation settings"
            >
              <MoreVertical className="w-5 h-5 pointer-events-none" />
            </button>
          </div>
        </div>

        {/* Message Bubble List with Wallpaper Backdrop */}
        <div className="relative flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Wallpaper Canvas Layer */}
          <div
            className="absolute inset-0 transition-all duration-300 pointer-events-none"
            style={{
              ...getThreadBackgroundStyle(),
              filter: (currentThreadWallpaper.blur ?? 0) > 0 ? `blur(${currentThreadWallpaper.blur}px)` : undefined,
              transform: (currentThreadWallpaper.blur ?? 0) > 0 ? 'scale(1.08)' : undefined,
            }}
          />

          {/* Dimming & Contrast Layer */}
          {currentThreadWallpaper.wallpaperId !== 'clean-default' && (
            <div
              className="absolute inset-0 bg-slate-950 pointer-events-none transition-opacity duration-300"
              style={{ opacity: (currentThreadWallpaper.dimming ?? 15) / 100 }}
            />
          )}

          {/* Scrollable Messages Area */}
          <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar space-y-3 px-3.5 py-3 max-w-2xl mx-auto w-full">
            {activeThread.messages.length === 0 && !activeThread.isTyping ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
                <div className="w-12 h-12 rounded-full neu-raised flex items-center justify-center text-slate-400">
                  <ShieldCheck className="w-6 h-6 text-[#5B9DFF]" />
                </div>
                <p className="text-xs font-bold text-slate-700">End-to-End Private Conversation</p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Messages in this chat support vanishing timers, manual deletions, and confidential reporting.
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {activeThread.messages.map((msg) => {
                  const isOwn = msg.senderId === currentUser.id;
                  return (
                    <MessageBubbleItem
                      key={msg.id}
                      msg={msg}
                      isOwn={isOwn}
                      activeThreadId={activeThread.id}
                      currentUserId={currentUser.id}
                      onDeleteMessage={handleAutoDeleteMessage}
                      onOpenContextMenu={(targetMsg) => {
                        setShowExtendedReactions(false);
                        setContextMessage(targetMsg);
                      }}
                      onForward={(targetMsg) => {
                        setForwardTargetMessage(targetMsg);
                        setForwardSearchQuery('');
                      }}
                      onImageClick={(url) => setLightboxImage(url)}
                      onToggleReaction={(messageId, emoji) => {
                        onToggleReaction?.(activeThread.id, messageId, emoji);
                      }}
                    />
                  );
                })}
                {activeThread.isTyping && (
                  <TypingIndicatorBubble
                    key="participant-typing-bubble"
                    participant={activeThread.participant!}
                  />
                )}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar / Live Voice Recording Interface */}
        <div className="w-full p-2.5 pb-4 bg-white/95 backdrop-blur-md border-t border-slate-200/80 z-20 flex-shrink-0">
          <div className="max-w-2xl mx-auto w-full">
            {/* Image Attachment Picker Popover */}
            <AnimatePresence>
              {showImagePicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="neu-flat rounded-[22px] p-3 mb-2 border border-blue-100 bg-white shadow-lg"
                >
                  <div className="flex items-center justify-between mb-2.5 px-1">
                    <span className="text-xs font-bold text-slate-700">
                      Attach Image
                    </span>
                    <button
                      onClick={() => setShowImagePicker(false)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                    <button
                      type="button"
                      onClick={handlePickAttachmentGallery}
                      className="w-16 h-16 rounded-[14px] neu-active-blue text-white flex flex-col items-center justify-center flex-shrink-0 cursor-pointer shadow-md transition-transform hover:scale-105"
                      title="Choose from device gallery"
                    >
                      <ImageIcon className="w-5 h-5" />
                      <span className="text-[10px] font-bold mt-1">Gallery</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCaptureAttachmentCamera}
                      className="w-16 h-16 rounded-[14px] neu-raised text-emerald-600 flex flex-col items-center justify-center flex-shrink-0 cursor-pointer shadow-md transition-transform hover:scale-105"
                      title="Snap photo with camera"
                    >
                      <Camera className="w-5 h-5" />
                      <span className="text-[10px] font-bold mt-1 text-slate-700">Camera</span>
                    </button>

                    {CHAT_SAMPLE_IMAGES.map((imgUrl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectAttachment(imgUrl)}
                        className="w-16 h-16 rounded-[14px] overflow-hidden flex-shrink-0 border-2 border-slate-200 hover:border-[#5B9DFF] transition cursor-pointer"
                      >
                        <img src={imgUrl} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Attached Image Preview Staging */}
            <AnimatePresence>
              {attachedImage && !isRecordingVoice && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 6 }}
                  className="mb-2 neu-flat rounded-[18px] p-2 flex items-center justify-between gap-3 bg-white border border-blue-200/80"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-12 h-12 rounded-[12px] overflow-hidden neu-inset flex-shrink-0">
                      <img
                        src={attachedImage}
                        alt="Attached preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 block truncate">
                        Photo attached
                      </span>
                      <span className="text-[10px] text-[#5B9DFF] font-semibold">
                        Ready to send
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAttachedImage(null)}
                    className="w-7 h-7 rounded-full neu-raised flex items-center justify-center text-slate-500 hover:text-rose-500 transition cursor-pointer"
                    title="Remove attachment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {isRecordingVoice ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="neu-flat rounded-full p-2 flex items-center justify-between gap-3 border border-blue-200/80 shadow-md bg-white"
              >
                {/* Cancel Button */}
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={handleCancelRecording}
                  className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                  title="Cancel recording"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>

                {/* Live Recording Indicator */}
                <div className="flex-1 flex items-center gap-2.5 px-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      0:{recordingSeconds < 10 ? '0' : ''}
                      {recordingSeconds}
                    </span>
                  </div>

                  <div className="flex-1 flex items-center gap-1 h-6 overflow-hidden">
                    {liveWaveform.map((val, idx) => (
                      <motion.div
                        key={idx}
                        animate={{ height: `${val}%` }}
                        transition={{ duration: 0.1 }}
                        className="flex-1 bg-[#5B9DFF] rounded-full min-w-[3px] max-w-[5px]"
                      />
                    ))}
                  </div>
                </div>

                {/* Send Voice Note Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSendVoiceNote}
                  className="w-10 h-10 rounded-full neu-active-blue text-white shadow-md flex items-center justify-center flex-shrink-0 cursor-pointer"
                  title="Send Voice Message"
                >
                  <Send className="w-4 h-4 -translate-x-0.5 translate-y-0.5" />
                </motion.button>
              </motion.div>
            ) : (
              <div className="relative">
                {/* Quick Emoji Popover */}
                <AnimatePresence>
                  {showInputEmojiPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full mb-2 left-0 z-30 bg-white neu-flat rounded-2xl p-2 border border-slate-200/80 shadow-lg flex items-center gap-1.5 flex-wrap max-w-xs"
                    >
                      {['😊', '❤️', '🔥', '😂', '👍', '🎉', '✨', '🙌', '💯', '🚀', '😍', '👀', '💡', '👏', '🥳'].map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => {
                            setInputText((prev) => prev + em);
                            setShowInputEmojiPicker(false);
                          }}
                          className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-base transition cursor-pointer"
                        >
                          {em}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form
                  onSubmit={handleSend}
                  className="neu-flat rounded-full p-1.5 flex items-center gap-1.5 bg-white border border-slate-200/80 shadow-sm"
                >
                  {/* Gallery / Attachment Popover Button */}
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(!showImagePicker)}
                    className={`w-9 h-9 rounded-full neu-raised flex items-center justify-center transition cursor-pointer shrink-0 ${
                      showImagePicker || attachedImage
                        ? 'text-[#5B9DFF] ring-2 ring-[#5B9DFF]/40'
                        : 'text-slate-500 hover:text-[#5B9DFF]'
                    }`}
                    title="Attach Media"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  {/* Emoji Picker Button */}
                  <button
                    type="button"
                    onClick={() => setShowInputEmojiPicker(!showInputEmojiPicker)}
                    className={`w-9 h-9 rounded-full neu-raised flex items-center justify-center transition cursor-pointer shrink-0 ${
                      showInputEmojiPicker
                        ? 'text-[#5B9DFF] ring-2 ring-[#5B9DFF]/40'
                        : 'text-slate-500 hover:text-[#5B9DFF]'
                    }`}
                    title="Emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  {/* Rounded Pill-Shaped Input Field with Inline Microphone Icon on Right End */}
                  <div className="flex-1 neu-inset rounded-full px-3.5 py-1.5 flex items-center gap-2 bg-slate-50 border border-slate-200/60 focus-within:bg-white focus-within:border-[#5B9DFF]/60 transition min-w-0">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Send chat"
                      className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none min-w-0 font-medium"
                    />
                    {/* Inline Microphone Button on the Right End */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={handleStartRecording}
                      className="text-slate-400 hover:text-[#5B9DFF] p-1 rounded-full transition cursor-pointer shrink-0"
                      title="Hold or tap to record voice message"
                    >
                      <Mic className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Circular Camera Button on Right Side */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCaptureAttachmentCamera}
                    className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-slate-500 hover:text-[#5B9DFF] transition cursor-pointer shrink-0"
                    title="Take Photo with Camera"
                  >
                    <Camera className="w-4 h-4" />
                  </motion.button>

                  {/* Send Button */}
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.9 }}
                    disabled={!inputText.trim() && !attachedImage}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      inputText.trim() || attachedImage
                        ? 'neu-active-blue text-white shadow-md'
                        : 'neu-inset text-slate-300 cursor-not-allowed opacity-50'
                    }`}
                    title="Send"
                  >
                    <Send className="w-4 h-4 -translate-x-0.5 translate-y-0.5" />
                  </motion.button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Message Long-Press / Context Action Sheet */}
        <AnimatePresence>
          {contextMessage && (
            <div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
              onClick={() => setContextMessage(null)}
            >
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="neu-flat rounded-t-[28px] sm:rounded-[28px] max-w-sm w-full p-4 bg-white shadow-2xl border border-slate-200/80 space-y-3"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header snippet */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 px-1">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Message Actions
                    </span>
                    <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                      {contextMessage.text || (contextMessage.imageUrl ? '📷 Photo Attachment' : '🎙️ Voice Note')}
                    </p>
                  </div>
                  <button
                    onClick={() => setContextMessage(null)}
                    className="w-7 h-7 rounded-full neu-raised flex items-center justify-center text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Reaction Emoji Bar */}
                {(() => {
                  const liveMsg = activeThread?.messages.find((m) => m.id === contextMessage.id) || contextMessage;

                  const handleSendReactionAndClose = (emoji: string) => {
                    if (activeThread && onToggleReaction) {
                      if (navigator.vibrate) navigator.vibrate(25);
                      onToggleReaction(activeThread.id, liveMsg.id, emoji);
                      // Auto-hide reaction popup after sending reaction
                      setTimeout(() => {
                        setContextMessage(null);
                        setShowExtendedReactions(false);
                      }, 120);
                    }
                  };

                  return (
                    <div className="py-1">
                      <div className="flex items-center justify-between px-1 mb-1.5">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                          <Smile className="w-3.5 h-3.5 text-[#5B9DFF]" />
                          Add Reaction
                        </span>
                        <span className="text-[10px] text-slate-400">Tap to react</span>
                      </div>

                      <div className="flex items-center justify-between gap-1 p-1.5 bg-slate-50/90 rounded-[20px] border border-slate-200/80">
                        {QUICK_REACTIONS.map((emoji) => {
                          const isReacted = liveMsg.reactions?.some(
                            (r) => r.emoji === emoji && r.userIds.includes(currentUser.id)
                          );
                          return (
                            <motion.button
                              key={emoji}
                              type="button"
                              whileHover={{ scale: 1.25 }}
                              whileTap={{ scale: 0.85 }}
                              onClick={() => handleSendReactionAndClose(emoji)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all cursor-pointer select-none ${
                                isReacted
                                  ? 'bg-blue-100 ring-2 ring-[#5B9DFF] shadow-xs'
                                  : 'hover:bg-white active:bg-slate-200'
                              }`}
                              title={isReacted ? `Remove ${emoji}` : `React ${emoji}`}
                            >
                              {emoji}
                            </motion.button>
                          );
                        })}

                        {/* Plus button to toggle extra emoji list */}
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.85 }}
                          onClick={() => setShowExtendedReactions((prev) => !prev)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                            showExtendedReactions
                              ? 'bg-[#5B9DFF] text-white shadow-xs'
                              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                          }`}
                          title="More reactions"
                        >
                          <Plus
                            className={`w-4 h-4 transition-transform duration-200 ${
                              showExtendedReactions ? 'rotate-45' : ''
                            }`}
                          />
                        </motion.button>
                      </div>

                      {/* Extended Reaction Grid Palette */}
                      <AnimatePresence>
                        {showExtendedReactions && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden mt-2"
                          >
                            <div className="grid grid-cols-8 gap-1.5 p-2 bg-slate-50/90 rounded-[18px] border border-slate-200/80 max-h-36 overflow-y-auto no-scrollbar">
                              {MORE_REACTIONS.map((emoji) => {
                                const isReacted = liveMsg.reactions?.some(
                                  (r) => r.emoji === emoji && r.userIds.includes(currentUser.id)
                                );
                                return (
                                  <motion.button
                                    key={emoji}
                                    type="button"
                                    whileHover={{ scale: 1.25 }}
                                    whileTap={{ scale: 0.85 }}
                                    onClick={() => handleSendReactionAndClose(emoji)}
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all cursor-pointer ${
                                      isReacted
                                        ? 'bg-blue-100 ring-2 ring-[#5B9DFF]'
                                        : 'hover:bg-white active:bg-slate-200'
                                    }`}
                                  >
                                    {emoji}
                                  </motion.button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Active reactions breakdown */}
                      {liveMsg.reactions && liveMsg.reactions.length > 0 && (
                        <div className="mt-2 px-2 py-1.5 bg-slate-50/80 rounded-[14px] flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600 border border-slate-200/60">
                          <span className="font-semibold text-slate-400 text-[10px]">Reactions:</span>
                          {liveMsg.reactions.map((r) => {
                            const hasMe = r.userIds.includes(currentUser.id);
                            const hasOther = r.userIds.some((id) => id !== currentUser.id);
                            let names = '';
                            if (hasMe && hasOther) {
                              names = `You & ${activeThread?.participant.name || 'other'}`;
                            } else if (hasMe) {
                              names = 'You';
                            } else {
                              names = activeThread?.participant.name || 'Friend';
                            }
                            return (
                              <button
                                key={r.emoji}
                                type="button"
                                onClick={() => handleSendReactionAndClose(r.emoji)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border transition cursor-pointer ${
                                  hasMe
                                    ? 'bg-blue-50/90 border-[#5B9DFF] text-[#1d4ed8] font-bold'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}
                              >
                                <span>{r.emoji}</span>
                                <span>{names}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Actions list */}
                <div className="space-y-1 pt-1 border-t border-slate-100">
                  {/* Delete message option (If user's own message) */}
                  {contextMessage.senderId === currentUser.id && (
                    <button
                      onClick={() => {
                        setDeleteTargetMessage(contextMessage);
                        setContextMessage(null);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-[16px] text-left text-xs font-bold text-rose-600 hover:bg-rose-50/80 flex items-center gap-3 transition cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block">Delete for Everyone</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          Permanently remove from this chat
                        </span>
                      </div>
                    </button>
                  )}

                  {/* Forward message option */}
                  <button
                    onClick={() => {
                      setForwardTargetMessage(contextMessage);
                      setForwardSearchQuery('');
                      setContextMessage(null);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-[16px] text-left text-xs font-bold text-blue-600 hover:bg-blue-50/80 flex items-center gap-3 transition cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Forward className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block">Forward</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Share message with another contact
                      </span>
                    </div>
                  </button>

                  {/* Copy message text */}
                  {contextMessage.text && (
                    <button
                      onClick={() => handleCopyMessageText(contextMessage)}
                      className="w-full px-3.5 py-2.5 rounded-[16px] text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full neu-raised flex items-center justify-center text-slate-600">
                        <Copy className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block">Copy Text</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          Copy message to clipboard
                        </span>
                      </div>
                    </button>
                  )}

                  {/* Report message option (Always available) */}
                  <button
                    onClick={() => {
                      setReportTargetMessage(contextMessage);
                      setContextMessage(null);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-[16px] text-left text-xs font-bold text-amber-700 hover:bg-amber-50/80 flex items-center gap-3 transition cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                      <Flag className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block">Report Message</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Submit confidential safety report
                      </span>
                    </div>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <DeleteMessageConfirmModal
          isOpen={deleteTargetMessage !== null}
          message={deleteTargetMessage}
          onClose={() => setDeleteTargetMessage(null)}
          onConfirmDelete={handleConfirmPermanentDelete}
        />

        {/* Universal Report Message Modal */}
        {reportTargetMessage && (
          <UniversalReportModal
            isOpen={Boolean(reportTargetMessage)}
            contentType="message"
            contentId={reportTargetMessage.id}
            targetUser={activeThread.isGroup ? { id: reportTargetMessage.senderId, name: reportTargetMessage.senderName || 'Group Member', username: 'group', avatar: '' } : activeThread.participant!}
            reporterUserId={currentUser.id}
            snippet={reportTargetMessage.text || (reportTargetMessage.imageUrl ? 'Photo attachment' : 'Voice note')}
            mediaUrl={reportTargetMessage.imageUrl}
            onClose={() => setReportTargetMessage(null)}
            onShowToast={onShowToast}
          />
        )}

        {/* Image Lightbox */}
        <AnimatePresence>
          {lightboxImage && (
            <div
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
              onClick={() => setLightboxImage(null)}
            >
              <div className="relative max-w-sm w-full">
                <img
                  src={lightboxImage}
                  alt="Full size view"
                  className="w-full rounded-[24px] object-contain shadow-2xl"
                />
                <button
                  onClick={() => setLightboxImage(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Chat Wallpaper Studio Modal */}
        <ChatWallpaperModal
          isOpen={isWallpaperModalOpen}
          onClose={() => setIsWallpaperModalOpen(false)}
          currentSettings={currentThreadWallpaper}
          onSaveWallpaper={handleSaveWallpaper}
          participantName={(activeThread.isGroup ? activeThread.groupName || '' : activeThread.participant?.name || '')}
          onShowToast={onShowToast}
        />

        {/* Individual Conversation 3-Dot Settings Menu */}
        {activeThread && !activeThread.isGroup && (
          <IndividualUserMenu
            isOpen={showThreadMenu}
            onClose={() => setShowThreadMenu(false)}
            user={activeThread.participant!}
            isFollowing={activeThread.participant?.isFollowing || false}
            onToggleFollow={onToggleFollow}
            onClearChat={onClearChat}
            isLocked={lockedChatUserIds?.includes(activeThread.participant?.id || '')}
            onToggleLockChat={onToggleLockChat}
            onShowToast={onShowToast}
          />
        )}

        {/* Forward Message Recipient Selection Modal */}
        <AnimatePresence>
          {forwardTargetMessage && (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
              onClick={() => {
                setForwardTargetMessage(null);
                setForwardSearchQuery('');
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Forward className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Forward Message</h3>
                      <p className="text-[11px] text-slate-500">Select a contact to share this message with</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setForwardTargetMessage(null);
                      setForwardSearchQuery('');
                    }}
                    className="w-8 h-8 rounded-full neu-raised flex items-center justify-center text-slate-500 hover:text-slate-700 transition cursor-pointer"
                    aria-label="Close forward modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Message preview snippet */}
                <div className="my-3 p-3 rounded-[16px] bg-slate-50 border border-slate-200/80 flex items-center gap-3 flex-shrink-0">
                  {forwardTargetMessage.imageUrl && (
                    <img
                      src={forwardTargetMessage.imageUrl}
                      alt="Attachment preview"
                      className="w-11 h-11 rounded-[10px] object-cover flex-shrink-0 border border-slate-200"
                    />
                  )}
                  {forwardTargetMessage.voiceNote && (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                      <Mic className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Message Content
                    </span>
                    <p className="text-xs text-slate-700 font-medium truncate">
                      {forwardTargetMessage.text ||
                        (forwardTargetMessage.imageUrl
                          ? 'Photo attachment'
                          : `Voice note (0:${(forwardTargetMessage.voiceNote?.durationSeconds || 0) < 10 ? '0' : ''}${forwardTargetMessage.voiceNote?.durationSeconds || 0})`)}
                    </p>
                  </div>
                </div>

                {/* Contact Search Input */}
                <div className="relative mb-3 flex-shrink-0">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={forwardSearchQuery}
                    onChange={(e) => setForwardSearchQuery(e.target.value)}
                    placeholder="Search contacts..."
                    className="w-full pl-9 pr-8 py-2 rounded-[14px] bg-slate-100/90 border border-transparent focus:border-blue-400 focus:bg-white text-xs outline-hidden transition text-slate-800"
                  />
                  {forwardSearchQuery && (
                    <button
                      onClick={() => setForwardSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Contact List */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[160px] max-h-[300px]">
                  {(() => {
                    const rawList: (User | { id: string; name: string; username?: string; avatar: string; isOnline?: boolean; isGroup?: boolean })[] = [
                      ...threads.map((t) =>
                        t.isGroup
                          ? {
                              id: t.id,
                              name: t.groupName || 'Group Chat',
                              username: 'group',
                              avatar: t.groupAvatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150',
                              isOnline: true,
                              isGroup: true,
                            }
                          : t.participant
                      ),
                      ...MOCK_USERS,
                      ...(allUsers || []),
                    ];

                    const contacts = Array.from(
                      new Map(
                        rawList
                          .filter((u): u is User => Boolean(u && u.id && u.id !== currentUser.id))
                          .map((u) => [u.id, u])
                      ).values()
                    ).filter((u) => {
                      if (!forwardSearchQuery.trim()) return true;
                      const q = forwardSearchQuery.toLowerCase();
                      const name = (u.name || '').toLowerCase();
                      const username = (u.username || '').toLowerCase();
                      return name.includes(q) || username.includes(q);
                    });

                    if (contacts.length === 0) {
                      return (
                        <div className="text-center py-8 text-slate-400 text-xs">
                          No contacts found matching "{forwardSearchQuery}"
                        </div>
                      );
                    }

                    return contacts.map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => handleForwardMessage(contact as any)}
                        className="w-full flex items-center justify-between p-2.5 rounded-[16px] hover:bg-blue-50/60 active:bg-blue-100/70 transition group cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-10 h-10 rounded-full flex-shrink-0">
                            <img
                              src={contact.avatar}
                              alt={contact.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                            {contact.isOnline && (
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate">
                              {contact.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 truncate">
                              @{contact.username || 'user'}
                            </p>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-slate-100 group-hover:bg-[#5B9DFF] group-hover:text-white text-slate-600 text-[11px] font-semibold flex items-center gap-1 transition flex-shrink-0 ml-2 shadow-2xs">
                          <span>Send</span>
                          <Forward className="w-3 h-3" />
                        </div>
                      </button>
                    ));
                  })()}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Handle search query change & 6-digit passcode check
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);

    if (isChatLockEnabled && chatLockPasscode && val.trim() === chatLockPasscode.trim()) {
      if (!isVaultUnlocked) {
        setIsVaultUnlocked(true);
        if (onShowToast) {
          onShowToast('🔓 Secret Vault Unlocked! Showing hidden chats.');
        }
      }
    }
  };

  const handleLockVault = () => {
    setIsVaultUnlocked(false);
    setSearchQuery('');
    if (onShowToast) {
      onShowToast('🔒 Secret Vault locked & hidden.');
    }
  };

  // Filter Active Now users
  const activeNowThreads = threads.filter((thread) => {
    const isLocked = isChatLockEnabled && lockedChatUserIds.includes((thread.isGroup ? thread.id : thread.participant?.id || ''));
    if (isLocked && !isVaultUnlocked) return false;
    return true;
  });

  // Filtered threads list (matching participant name, username, bio, last message, or any message history text/transcripts)
  const filteredThreads = threads.filter((thread) => {
    const isLocked = isChatLockEnabled && lockedChatUserIds.includes((thread.isGroup ? thread.id : thread.participant?.id || ''));

    if (isLocked && !isVaultUnlocked) {
      return false;
    }

    if (isChatLockEnabled && chatLockPasscode && searchQuery.trim() === chatLockPasscode.trim()) {
      return true;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (thread.isGroup ? thread.groupName || '' : thread.participant?.name || '').toLowerCase().includes(q);
      const matchUser = (thread.isGroup ? thread.groupName || '' : thread.participant?.username || '').toLowerCase().includes(q);
      const matchBio = (thread.isGroup ? thread.groupDescription || '' : thread.participant?.bio || '')?.toLowerCase().includes(q);
      const matchLastMsg = thread.lastMessage.text?.toLowerCase().includes(q);
      const matchAnyMsg = thread.messages?.some(
        (m) =>
          m.text?.toLowerCase().includes(q) ||
          m.voiceNote?.transcript?.toLowerCase().includes(q) ||
          m.reactions?.some((r) => r.emoji.includes(q))
      );
      return matchName || matchUser || matchBio || matchLastMsg || matchAnyMsg;
    }

    return true;
  });

  // Main Conversations List Screen
  return (
    <div className="fixed inset-0 z-50 bg-[#f4f7fb] flex flex-col h-[100dvh] w-full overflow-hidden pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
      {/* Header */}
      <div className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 py-3 flex items-center justify-between z-20 shadow-xs flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onBackToHome) {
                onBackToHome();
              } else if (onBackToList) {
                onBackToList();
              }
            }}
            className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-slate-700 hover:text-[#5B9DFF] transition flex-shrink-0 cursor-pointer select-none touch-manipulation active:scale-95"
            title="Back"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 pointer-events-none" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight font-['Outfit']">
              Messages
            </h2>
          </div>
        </div>
      </div>

      
      {/* Top Toggle Tabs */}
      <div className="w-full bg-white px-4 py-2.5 border-b border-slate-200/80 flex-shrink-0 z-10 shadow-xs">
        <div className="flex items-center gap-2 max-w-[500px] mx-auto bg-slate-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveMainTab('messages')}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeMainTab === 'messages' 
                ? 'bg-white text-[#5B9DFF] shadow-xs' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            Messages
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab('communities')}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeMainTab === 'communities' 
                ? 'bg-white text-[#5B9DFF] shadow-xs' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            Communities
          </button>
        </div>
      </div>

      {/* Scrollable Body - Tab View */}
      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar w-full h-full bg-slate-50/50 items-center">
          {/* Main Content Area */}
          <div className="w-full max-w-[600px] space-y-4 h-full overflow-y-auto no-scrollbar pb-12 px-4 py-4">
            {activeMainTab === 'messages' && (
              <div className="space-y-4 animate-in fade-in duration-300">

        {/* 3D Neumorphic Search Bar */}
        <div>
          <div className="neu-flat rounded-[20px] px-3.5 py-2.5 flex items-center gap-2.5 border border-slate-200/80 focus-within:ring-2 focus-within:ring-[#5B9DFF]/30 transition bg-white shadow-xs">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSearchQuery('');
              }}
              placeholder="Search by name or message content..."
              className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Result Feedback Badge */}
          {searchQuery.trim() && !isVaultUnlocked && (
            <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-slate-500">
              <span>
                {filteredThreads.length === 0
                  ? 'No matching results'
                  : `Found ${filteredThreads.length} conversation${filteredThreads.length === 1 ? '' : 's'}`}
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#5B9DFF] font-semibold hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Vault Unlocked Banner */}
        {isVaultUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="neu-flat rounded-[20px] p-3 border border-blue-200/90 bg-blue-50/60 flex items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#5B9DFF] flex items-center justify-center neu-raised">
                <Unlock className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">
                    Secret Vault Unlocked
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-500">
                  {lockedChatUserIds.length} hidden {lockedChatUserIds.length === 1 ? 'chat' : 'chats'} revealed
                </p>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleLockVault}
              className="neu-raised px-3 py-1.5 rounded-full text-[11px] font-bold text-slate-700 hover:text-rose-500 flex items-center gap-1.5 transition bg-white cursor-pointer"
            >
              <Lock className="w-3 h-3 text-rose-500" />
              <span>Lock & Hide</span>
            </motion.button>
          </motion.div>
        )}

        {/* Active Online Friends Horizontal Reel */}
        {!searchQuery.trim() && activeNowThreads.length > 0 && (
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 px-1">
              Active Now
            </span>
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
              {activeNowThreads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => onSelectThread((thread.isGroup ? thread.id : thread.participant?.id || ''))}
                  className="flex flex-col items-center flex-shrink-0 group cursor-pointer select-none"
                >
                  <div className="relative w-13 h-13 rounded-full neu-raised p-0.5 transition-transform group-hover:scale-105">
                    <img
                      src={(thread.isGroup ? thread.groupAvatar || '' : thread.participant?.avatar || '')}
                      alt={(thread.isGroup ? thread.groupName || '' : thread.participant?.name || '')}
                      className="w-full h-full rounded-full object-cover"
                    />
                    {(thread.isGroup ? true : thread.participant?.isOnline) && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#5B9DFF] ring-2 ring-white" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-[#5B9DFF] transition-colors mt-1.5 max-w-[58px] truncate text-center">
                    {(thread.isGroup ? thread.groupName || '' : thread.participant?.name || '').split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Joined Communities Horizontal Reel */}
        {!searchQuery.trim() && (
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <UsersIcon className="w-3.5 h-3.5 text-[#5B9DFF]" /> Your Communities
              </span>
              <button
                type="button"
                onClick={() => setActiveMainTab('communities')}
                className="text-[11px] font-bold text-[#5B9DFF] hover:underline"
              >
                Explore All
              </button>
            </div>
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {communities
                .filter(
                  (c) =>
                    joinedCommunityIds.includes(c.id) ||
                    c.adminName === currentUser.name ||
                    c.ownerId === currentUser.id
                )
                .map((comm) => (
                  <button
                    key={comm.id}
                    type="button"
                    onClick={() => setSelectedChannelCommunity(comm)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white border border-slate-200/80 hover:border-[#5B9DFF]/60 hover:shadow-sm transition flex-shrink-0 cursor-pointer group text-left"
                  >
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${comm.gradient} text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform overflow-hidden`}>
                      {(comm as any).avatarUrl ? (
                        <img src={(comm as any).avatarUrl} alt={comm.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{(comm as any).avatarEmoji || '⚡'}</span>
                      )}
                    </div>
                    <div className="max-w-[120px] truncate">
                      <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#5B9DFF] transition-colors">
                        {comm.name}
                      </p>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {comm.members} members
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Threads List */}
        <div className="space-y-3 pb-8">
          {filteredThreads.length === 0 ? (
            <div className="neu-inset rounded-[24px] p-8 text-center text-slate-400 text-xs bg-white space-y-3">
              <p>No conversations found matching "{searchQuery}"</p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="neu-raised px-4 py-1.5 rounded-full text-xs font-bold text-[#5B9DFF] hover:bg-blue-50 transition cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const isThisLocked = isChatLockEnabled && lockedChatUserIds.includes((thread.isGroup ? thread.id : thread.participant?.id || ''));
              const q = searchQuery.trim().toLowerCase();
              const matchedHistoricalMsg = q
                ? thread.messages?.find((m) => m.text?.toLowerCase().includes(q) || m.voiceNote?.transcript?.toLowerCase().includes(q))
                : null;
              return (
                <motion.div
                  key={thread.id}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectThread((thread.isGroup ? thread.id : thread.participant?.id || ''))}
                  className={`neu-flat rounded-[22px] p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:shadow-md transition-all bg-white ${
                    isThisLocked ? 'border border-blue-200/80 bg-blue-50/20' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative w-12 h-12 rounded-full neu-raised p-0.5 flex-shrink-0">
                    <img
                      src={(thread.isGroup ? thread.groupAvatar || '' : thread.participant?.avatar || '')}
                      alt={(thread.isGroup ? thread.groupName || '' : thread.participant?.name || '')}
                      className="w-full h-full rounded-full object-cover"
                    />
                    {(thread.isGroup ? true : thread.participant?.isOnline) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#5B9DFF] ring-2 ring-white" />
                    )}
                    {isThisLocked && (
                      <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-500 text-white flex items-center justify-center ring-2 ring-white shadow-xs">
                        <Lock className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  {/* Info & Last message */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <h4 className="text-xs font-bold text-slate-800 truncate">
                          {(thread.isGroup ? thread.groupName || '' : thread.participant?.name || '')}
                        </h4>
                        {getIndividualChatSettings((thread.isGroup ? thread.id : thread.participant?.id || '')).isMuted && (
                          <span className="text-slate-400 flex-shrink-0" title="Muted chat">
                            <BellOff className="w-3 h-3 text-slate-400" />
                          </span>
                        )}
                        {isThisLocked && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-600 flex-shrink-0">
                            LOCKED
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium flex-shrink-0 ml-1">
                        {thread.lastMessage.timestamp}
                      </span>
                    </div>
                    <div
                      className={`text-xs truncate flex items-center gap-1.5 ${
                        thread.isTyping
                          ? 'text-[#5B9DFF] font-semibold italic'
                          : thread.unreadCount > 0
                          ? 'font-bold text-slate-900'
                          : 'text-slate-500'
                      }`}
                    >
                      {thread.isTyping ? (
                        <span className="flex items-center gap-1.5 text-[#5B9DFF]">
                          <span className="flex items-center gap-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#5B9DFF] animate-bounce" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#5B9DFF] animate-bounce [animation-delay:0.15s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#5B9DFF] animate-bounce [animation-delay:0.3s]" />
                          </span>
                          <span>typing...</span>
                        </span>
                      ) : (
                        <>
                          {thread.lastMessage.isOwn && <span>You: </span>}
                          {thread.lastMessage.isVoice ? (
                            <span className="flex items-center gap-1 text-[#5B9DFF] font-semibold">
                              <Mic className="w-3 h-3" />
                              <span>
                                Voice note {thread.lastMessage.voiceDuration ? `(0:${thread.lastMessage.voiceDuration < 10 ? '0' : ''}${thread.lastMessage.voiceDuration})` : ''}
                              </span>
                            </span>
                          ) : thread.lastMessage.imageUrl ? (
                            <span>📷 Photo attachment</span>
                          ) : (
                            <span>{thread.lastMessage.text}</span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Matched message snippet chip when searching historical messages */}
                    {matchedHistoricalMsg && matchedHistoricalMsg.text && matchedHistoricalMsg.text !== thread.lastMessage.text && (
                      <div className="mt-1">
                        <span className="inline-block text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200/60 max-w-full truncate">
                          Matched text: "{matchedHistoricalMsg.text}"
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Unread badge */}
                  {thread.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#5B9DFF] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                      {thread.unreadCount}
                    </span>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

              </div>
            )}
            {activeMainTab === "communities" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Search Bar + Create Community Action */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 neu-flat rounded-[20px] px-3.5 py-2.5 flex items-center gap-2 border border-slate-200/80 focus-within:ring-2 focus-within:ring-[#5B9DFF]/30 transition bg-white shadow-xs">
                    <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={communitySearchQuery}
                      onChange={(e) => setCommunitySearchQuery(e.target.value)}
                      placeholder="Search communities by name, topic..."
                      className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                    />
                    {communitySearchQuery && (
                      <button
                        onClick={() => setCommunitySearchQuery('')}
                        className="text-slate-400 hover:text-slate-600 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreateCommunityOpen(true)}
                    className="px-3.5 py-2.5 rounded-[20px] bg-[#5B9DFF] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-blue-600 transition shadow-xs shadow-[#5B9DFF]/30 flex-shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create</span>
                  </button>
                </div>

                {/* Category Pill Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {['All', 'Joined', 'Owned', 'Public', 'Private'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCommunityCategory(cat)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition flex-shrink-0 cursor-pointer flex items-center gap-1 ${
                        selectedCommunityCategory === cat
                          ? 'bg-[#5B9DFF] text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200/70 hover:bg-slate-50'
                      }`}
                    >
                      {cat === 'Owned' && <Crown className="w-3 h-3 text-amber-300" />}
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>

                {/* Communities List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <UsersIcon className="w-3.5 h-3.5 text-[#5B9DFF]" />
                      Communities ({filteredCommunities.length})
                    </h3>
                  </div>

                  {filteredCommunities.length === 0 ? (
                    <div className="bg-white neu-flat rounded-2xl p-6 text-center border border-slate-200/60 shadow-sm space-y-2">
                      <UsersIcon className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">No communities found</p>
                      <p className="text-[11px] text-slate-400">Try adjusting your search or category filter</p>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={() => {
                            setCommunitySearchQuery('');
                            setSelectedCommunityCategory('All');
                          }}
                          className="text-xs text-[#5B9DFF] font-bold hover:underline"
                        >
                          Reset Filters
                        </button>
                        <button
                          onClick={() => setIsCreateCommunityOpen(true)}
                          className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Create Community
                        </button>
                      </div>
                    </div>
                  ) : (
                    filteredCommunities.map((community) => {
                      const isJoined = joinedCommunityIds.includes(community.id);
                      const isPending = pendingJoinRequests.includes(community.id);
                      const isOwner = community.adminName === currentUser.name || community.ownerId === currentUser.id;
                      const reqCount = (incomingJoinRequests[community.id] || []).length;

                      return (
                        <div
                          key={community.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white neu-flat rounded-2xl border border-slate-200/60 shadow-xs hover:border-[#5B9DFF]/40 hover:shadow-md transition cursor-pointer group"
                          onClick={() => setSelectedChannelCommunity(community)}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${community.gradient} text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform overflow-hidden relative`}>
                              {(community as any).avatarUrl ? (
                                <img src={(community as any).avatarUrl} alt={community.name} className="w-full h-full object-cover" />
                              ) : (community as any).avatarEmoji ? (
                                <span className="text-xl">{(community as any).avatarEmoji}</span>
                              ) : community.isPrivate ? (
                                <Lock className="w-5 h-5 text-white" />
                              ) : (
                                <Globe className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-[#5B9DFF] transition-colors">
                                  {community.name}
                                </h4>
                                {isOwner ? (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300/70 flex items-center gap-1 shadow-2xs">
                                    <Crown className="w-2.5 h-2.5 text-amber-600 fill-amber-500" /> Owner
                                  </span>
                                ) : community.isPrivate ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/50 flex items-center gap-1">
                                    <Lock className="w-2.5 h-2.5" /> Private
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
                                    <Globe className="w-2.5 h-2.5" /> Public
                                  </span>
                                )}
                                <span className="text-[10px] font-semibold text-slate-400">
                                  {community.members} members
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-normal">
                                {community.description}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate mt-1 italic">
                                "{community.lastMessage}"
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 flex-shrink-0 pt-1 sm:pt-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setShareCommunityTarget(community)}
                              className="p-1.5 rounded-xl text-xs font-bold bg-blue-50 text-[#5B9DFF] border border-blue-200/80 hover:bg-blue-100 transition flex items-center justify-center cursor-pointer shadow-2xs"
                              title="Share Community"
                            >
                              <Share2 className="w-4 h-4 text-[#5B9DFF]" />
                            </button>

                            {(isJoined || isOwner) && (
                              <button
                                type="button"
                                onClick={() => setSelectedChannelCommunity(community)}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-[#5B9DFF] text-white hover:bg-blue-600 transition flex items-center gap-1.5 cursor-pointer shadow-xs shadow-[#5B9DFF]/20"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Open Chat</span>
                              </button>
                            )}

                            {isOwner ? (
                              <button
                                type="button"
                                onClick={() => openOwnerManager(community)}
                                className="p-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100 transition flex items-center gap-1 cursor-pointer shadow-2xs relative"
                                title="Community Owner Settings"
                              >
                                <Settings className="w-4 h-4 text-amber-600" />
                                {reqCount > 0 && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                                    {reqCount}
                                  </span>
                                )}
                              </button>
                            ) : isJoined ? (
                              <button
                                type="button"
                                onClick={() => handleToggleCommunityState(community)}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition flex items-center gap-1 cursor-pointer shadow-xs group/btn"
                                title="Click to leave community"
                              >
                                <Check className="w-3.5 h-3.5 group-hover/btn:hidden" />
                                <X className="w-3.5 h-3.5 hidden group-hover/btn:block" />
                                <span className="group-hover/btn:hidden text-[11px]">Joined</span>
                                <span className="hidden group-hover/btn:inline text-[11px]">Leave</span>
                              </button>
                            ) : isPending ? (
                              <button
                                type="button"
                                onClick={() => handleToggleCommunityState(community)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition flex items-center gap-1.5 cursor-pointer shadow-xs group/btn"
                                title="Click to cancel join request"
                              >
                                <Clock className="w-3.5 h-3.5 animate-pulse group-hover/btn:hidden text-amber-500" />
                                <X className="w-3.5 h-3.5 hidden group-hover/btn:block text-rose-500" />
                                <span className="group-hover/btn:hidden">Pending Approval</span>
                                <span className="hidden group-hover/btn:inline">Cancel Request</span>
                              </button>
                            ) : community.isPrivate ? (
                              <button
                                type="button"
                                onClick={() => handleToggleCommunityState(community)}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Lock className="w-3.5 h-3.5 text-amber-400" />
                                Request to Join
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleCommunityState(community)}
                                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#5B9DFF] text-white hover:bg-blue-600 transition flex items-center gap-1.5 cursor-pointer shadow-xs shadow-[#5B9DFF]/20"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Join
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <button
                  onClick={() => setIsCreateCommunityOpen(true)}
                  className="w-full mt-3 py-3 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 text-[#5B9DFF] hover:bg-blue-50 transition flex items-center justify-center gap-2 text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Create Your Own Community
                </button>
              </div>
            )}
          </div>
      </div>

      {/* Global Wallpaper Modal in Messages overview */}
      <ChatWallpaperModal
        isOpen={isWallpaperModalOpen}
        onClose={() => setIsWallpaperModalOpen(false)}
        currentSettings={globalWallpaper}
        onSaveWallpaper={handleSaveWallpaper}
        participantName="all conversations"
        onShowToast={onShowToast}
      />

      {/* Individual Conversation 3-Dot Settings Menu */}
      {activeThread && !activeThread.isGroup && (
        <IndividualUserMenu
          isOpen={showThreadMenu}
          onClose={() => setShowThreadMenu(false)}
          user={activeThread.participant!}
          isFollowing={(activeThread.isGroup ? false : activeThread.participant?.isFollowing)}
          onToggleFollow={onToggleFollow}
          onClearChat={onClearChat}
          isLocked={lockedChatUserIds?.includes((activeThread.isGroup ? activeThread.id : activeThread.participant?.id || ''))}
          onToggleLockChat={onToggleLockChat}
          onShowToast={onShowToast}
        />
      )}

      {/* CreateGroupModal */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        currentUser={currentUser}
        allUsers={allUsers || MOCK_USERS}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onCreateGroup={(name, desc, avatar, memberIds) => {
          if (onCreateGroup) {
            onCreateGroup(name, desc, avatar, memberIds);
          }
          setIsCreateGroupModalOpen(false);
          if (onShowToast) {
            onShowToast(`Group "${name}" created successfully! 🎉`);
          }
        }}
      />

      {/* GroupInfoModal */}
      {activeThread && activeThread.isGroup && (
        <GroupInfoModal
          isOpen={isGroupInfoModalOpen}
          thread={activeThread}
          currentUser={currentUser}
          allUsers={allUsers || MOCK_USERS}
          onClose={() => setIsGroupInfoModalOpen(false)}
          onUpdateGroup={(groupId, updates) => {
            if (onUpdateGroup) {
              onUpdateGroup(groupId, updates);
            }
            if (onShowToast) {
              onShowToast('Group settings updated successfully!');
            }
          }}
          onLeaveGroup={() => {
            if (onLeaveGroup) {
              onLeaveGroup(activeThread.id);
            }
            setIsGroupInfoModalOpen(false);
            if (onShowToast) {
              onShowToast(`You left group "${activeThread.groupName}"`);
            }
          }}
        />
      )}


      

      {/* Create Community Modal */}
      <AnimatePresence>
        {isCreateCommunityOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Create New Community</h3>
                    <p className="text-[11px] text-slate-500">You will be designated as the Community Owner 👑</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateCommunityOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleCreateCommunitySubmit} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Community Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. AI & Machine Learning Club"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]/30 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Description
                  </label>
                  <textarea
                    value={createDesc}
                    onChange={(e) => setCreateDesc(e.target.value)}
                    placeholder="What is this community about? Share guidelines or topics..."
                    className="w-full h-20 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]/30 resize-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Category
                    </label>
                    <select
                      value={createCategory}
                      onChange={(e) => setCreateCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]/30 font-semibold"
                    >
                      {['Tech', 'Outdoors', 'Design', 'Crypto', 'Arts', 'Gaming', 'Lifestyle'].map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Privacy Mode
                    </label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setCreateIsPrivate(false)}
                        className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition ${
                          !createIsPrivate ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Public
                      </button>
                      <button
                        type="button"
                        onClick={() => setCreateIsPrivate(true)}
                        className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition ${
                          createIsPrivate ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        Private
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Theme Color Gradient
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { g: 'from-indigo-500 to-blue-600', label: 'Indigo' },
                      { g: 'from-emerald-500 to-teal-600', label: 'Emerald' },
                      { g: 'from-purple-500 to-pink-600', label: 'Purple' },
                      { g: 'from-amber-500 to-orange-600', label: 'Amber' },
                      { g: 'from-rose-500 to-red-600', label: 'Rose' },
                      { g: 'from-cyan-500 to-blue-600', label: 'Cyan' },
                    ].map((item) => (
                      <button
                        key={item.g}
                        type="button"
                        onClick={() => setCreateGradient(item.g)}
                        className={`h-8 rounded-xl bg-gradient-to-tr ${item.g} border-2 transition-transform ${
                          createGradient === item.g ? 'border-slate-900 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                        }`}
                        title={item.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateCommunityOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#5B9DFF] text-white text-xs font-bold hover:bg-blue-600 transition flex items-center justify-center gap-1.5 shadow-md shadow-[#5B9DFF]/20 cursor-pointer"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    Create Community
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Comprehensive Community Admin Settings Modal */}
      {ownerManageCommunity && (
        <CommunityAdminSettingsModal
          isOpen={!!ownerManageCommunity}
          onClose={() => setOwnerManageCommunity(null)}
          community={ownerManageCommunity}
          incomingRequests={incomingJoinRequests[ownerManageCommunity.id] || []}
          onUpdateCommunity={(updatedData) => {
            if (!ownerManageCommunity) return;
            setCommunities((prev) =>
              prev.map((c) => (c.id === ownerManageCommunity.id ? { ...c, ...updatedData } : c))
            );
            setOwnerManageCommunity((prev: any) => (prev ? { ...prev, ...updatedData } : null));
          }}
          onApproveRequest={(reqId, applicantName) => {
            handleApproveJoinRequest(ownerManageCommunity.id, reqId, applicantName);
          }}
          onRejectRequest={(reqId, applicantName) => {
            handleRejectJoinRequest(ownerManageCommunity.id, reqId, applicantName);
          }}
          onSendBroadcast={(msg) => {
            triggerCommunityToast(`Broadcast sent to ${ownerManageCommunity.name} members 📢`, 'success');
          }}
          onDeleteCommunity={(id, name) => {
            handleDeleteCommunity(id, name);
          }}
          onShowToast={triggerCommunityToast}
        />
      )}

      {/* Join Request Modal for Private Communities */}
      <AnimatePresence>
        {joinRequestModalCommunity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Private Join Request</h3>
                    <p className="text-[11px] text-slate-500">Requires admin review to access</p>
                  </div>
                </div>
                <button
                  onClick={() => setJoinRequestModalCommunity(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/60 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${joinRequestModalCommunity.gradient} text-white flex items-center justify-center font-bold shadow-xs flex-shrink-0`}>
                  <UsersIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{joinRequestModalCommunity.name}</h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    Admin: <span className="font-semibold text-slate-700">{joinRequestModalCommunity.adminName}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Message for Admin (Optional)
                </label>
                <textarea
                  value={joinRequestNote}
                  onChange={(e) => setJoinRequestNote(e.target.value)}
                  placeholder="Hi! I'd love to join this community..."
                  className="w-full h-20 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]/30 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setJoinRequestModalCommunity(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendJoinRequest}
                  className="flex-1 py-2 rounded-xl bg-[#5B9DFF] text-white text-xs font-bold hover:bg-blue-600 transition flex items-center justify-center gap-1.5 shadow-md shadow-[#5B9DFF]/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Community Channel & Detail View Modal */}
      {selectedChannelCommunity && (
        <CommunityChannelModal
          isOpen={!!selectedChannelCommunity}
          onClose={() => setSelectedChannelCommunity(null)}
          community={selectedChannelCommunity}
          isJoined={joinedCommunityIds.includes(selectedChannelCommunity.id)}
          isOwner={
            selectedChannelCommunity.adminName === currentUser.name ||
            selectedChannelCommunity.ownerId === currentUser.id
          }
          onJoinToggle={() => handleToggleCommunityState(selectedChannelCommunity)}
          onOpenOwnerAdmin={() => openOwnerManager(selectedChannelCommunity)}
          onShowToast={(msg, type) => triggerCommunityToast(msg, type || 'info')}
          onForwardMessage={(receiverId, text, imageUrl, voiceNote) => {
            onSendMessage(
              receiverId,
              text,
              imageUrl,
              voiceNote,
              'normal',
              true,
              selectedChannelCommunity.name
            );
          }}
        />
      )}

      {/* Share Community Modal */}
      <ShareCommunityModal
        community={shareCommunityTarget}
        isOpen={shareCommunityTarget !== null}
        onClose={() => setShareCommunityTarget(null)}
        users={MOCK_USERS}
        onShowToast={(msg, type) => triggerCommunityToast(msg, (type as any) || 'info')}
      />

      {/* Floating Real-Time Toast Notification */}
      <AnimatePresence>
        {localToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold shadow-xl border border-white/10 flex items-center gap-2 pointer-events-auto"
          >
            <Sparkles className="w-4 h-4 text-[#5B9DFF]" />
            <span>{localToast.message}</span>
            <button
              onClick={() => setLocalToast(null)}
              className="ml-1 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
