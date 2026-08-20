import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Send,
  Image as ImageIcon,
  Camera,
  CheckCheck,
  MoreVertical,
  X,
  Mic,
  Trash2,
  Sparkles,
  Search,
  Lock,
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ChatThread, Message, VoiceNoteData, MessagePrivacyMode, MessageReportReason } from '../types';
import { VoiceMessageBubble } from './VoiceMessageBubble';
import { ChatWallpaperModal, ChatWallpaperSettings } from './ChatWallpaperModal';
import { DeleteMessageConfirmModal } from './DeleteMessageConfirmModal';
import { IndividualUserMenu } from './IndividualUserMenu';
import { UniversalReportModal } from './UniversalReportModal';
import { CHAT_WALLPAPERS } from '../data/wallpapers';
import { useNavigation } from '../context/NavigationContext';
import { usePermissionAndMedia } from '../context/PermissionAndMediaContext';
import { audioRecorder } from '../services/audioRecorderService';
import { validateMessageDeletion, getMessagePrivacySettings } from '../data/messagePrivacyService';
import { getIndividualChatSettings } from '../services/individualChatSettingsService';

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
    privacyMode?: MessagePrivacyMode
  ) => void;
  onDeleteMessage?: (threadId: string, messageId: string) => void;
  onReportMessage?: (
    threadId: string,
    message: Message,
    reason: MessageReportReason,
    details?: string
  ) => void;
  onMarkMessageSeen?: (threadId: string, messageId: string) => void;
  lockedChatUserIds?: string[];
  chatLockPasscode?: string;
  isChatLockEnabled?: boolean;
  onShowToast?: (message: string) => void;
  onOpenUserProfile?: (user: User) => void;
  onBackToHome?: () => void;
  onToggleFollow?: (userId: string) => void;
  onToggleLockChat?: (userId: string) => void;
  onClearChat?: (userId: string) => void;
}

const CHAT_SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
];

// Single Message Bubble Item with Countdown and Long-press support
const MessageBubbleItem: React.FC<{
  msg: Message;
  isOwn: boolean;
  activeThreadId: string;
  onDeleteMessage?: (messageId: string) => void;
  onOpenContextMenu: (msg: Message) => void;
  onImageClick: (url: string) => void;
}> = ({ msg, isOwn, onDeleteMessage, onOpenContextMenu, onImageClick }) => {
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
        if (navigator.vibrate) navigator.vibrate(35);
        onOpenContextMenu(msg);
      }
    }, 450);
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

        {/* Context options trigger on hover/tap */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenContextMenu(msg);
          }}
          className="opacity-60 hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 transition"
          title="Message options"
        >
          <MoreVertical className="w-3 h-3" />
        </button>
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
  lockedChatUserIds = [],
  chatLockPasscode = '123456',
  isChatLockEnabled = true,
  onShowToast,
  onOpenUserProfile,
  onBackToHome,
  onToggleFollow,
  onToggleLockChat,
  onClearChat,
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
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);

  // Context Menu & Modals State
  const [contextMessage, setContextMessage] = useState<Message | null>(null);
  const [reportTargetMessage, setReportTargetMessage] = useState<Message | null>(null);
  const [deleteTargetMessage, setDeleteTargetMessage] = useState<Message | null>(null);

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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = activeChatUserId
    ? threads.find((t) => t.participant.id === activeChatUserId || t.id === activeChatUserId)
    : null;

  // Auto scroll to bottom when messages update
  useEffect(() => {
    if (activeThread) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread?.messages]);

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
    const settings = getIndividualChatSettings(activeThread.participant.id);
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

    const userSettings = getIndividualChatSettings(activeThread.participant.id);
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
      activeThread.participant.id,
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

    const userSettings = getIndividualChatSettings(activeThread.participant.id);
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
      activeThread.participant.id,
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
    (activeThread && wallpapersByThread[activeThread.participant.id]) || globalWallpaper;

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
        [activeThread.participant.id]: settings,
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
              onClick={() => onOpenUserProfile && onOpenUserProfile(activeThread.participant)}
              className="flex items-center gap-2.5 cursor-pointer group min-w-0"
              title="View Profile"
            >
              <div className="relative w-10 h-10 rounded-full neu-raised p-0.5 flex-shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src={activeThread.participant.avatar}
                  alt={activeThread.participant.name}
                  className="w-full h-full rounded-full object-cover"
                />
                {activeThread.participant.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#5B9DFF] ring-2 ring-white" />
                )}
              </div>

              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-[#5B9DFF] transition-colors">
                  {activeThread.participant.name}
                </h3>
                <p className="text-[11px] text-[#5B9DFF] font-semibold truncate">
                  {activeThread.participant.isOnline ? 'Online now' : 'Active recently'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
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
            {activeThread.messages.length === 0 ? (
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
                      onDeleteMessage={handleAutoDeleteMessage}
                      onOpenContextMenu={(targetMsg) => setContextMessage(targetMsg)}
                      onImageClick={(url) => setLightboxImage(url)}
                    />
                  );
                })}
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

                {/* Direct Camera Button */}
                <button
                  type="button"
                  onClick={handleCaptureAttachmentCamera}
                  className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-slate-500 hover:text-[#5B9DFF] transition cursor-pointer shrink-0"
                  title="Take Photo with Camera"
                >
                  <Camera className="w-4 h-4" />
                </button>

                {/* Voice Message Trigger Button */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={handleStartRecording}
                  className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-slate-600 hover:text-[#5B9DFF] transition cursor-pointer shrink-0"
                  title="Hold or tap to record voice message"
                >
                  <Mic className="w-4 h-4" />
                </motion.button>

                {/* Input Text Box */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message ${activeThread.participant.name.split(' ')[0]}...`}
                  className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none px-2 min-w-0"
                />

                {/* Send Button */}
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.9 }}
                  disabled={!inputText.trim() && !attachedImage}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    inputText.trim() || attachedImage
                      ? 'neu-active-blue text-white shadow-md'
                      : 'neu-inset text-slate-300 cursor-not-allowed'
                  }`}
                  title="Send"
                >
                  <Send className="w-4 h-4 -translate-x-0.5 translate-y-0.5" />
                </motion.button>
              </form>
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
                className="neu-flat rounded-t-[28px] sm:rounded-[28px] max-w-sm w-full p-4 bg-white shadow-2xl border border-slate-200/80 space-y-2.5"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header snippet */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-1">
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

                {/* Actions list */}
                <div className="space-y-1 pt-1">
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
            targetUser={activeThread.participant}
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
          participantName={activeThread.participant.name}
          onShowToast={onShowToast}
        />

        {/* Individual Conversation 3-Dot Settings Menu */}
        <IndividualUserMenu
          isOpen={showThreadMenu}
          onClose={() => setShowThreadMenu(false)}
          user={activeThread.participant}
          isFollowing={activeThread.participant.isFollowing}
          onToggleFollow={onToggleFollow}
          onClearChat={onClearChat}
          isLocked={lockedChatUserIds?.includes(activeThread.participant.id)}
          onToggleLockChat={onToggleLockChat}
          onShowToast={onShowToast}
        />
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
    const isLocked = isChatLockEnabled && lockedChatUserIds.includes(thread.participant.id);
    if (isLocked && !isVaultUnlocked) return false;
    return true;
  });

  // Filtered threads list
  const filteredThreads = threads.filter((thread) => {
    const isLocked = isChatLockEnabled && lockedChatUserIds.includes(thread.participant.id);

    if (isLocked && !isVaultUnlocked) {
      return false;
    }

    if (isChatLockEnabled && chatLockPasscode && searchQuery.trim() === chatLockPasscode.trim()) {
      return true;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = thread.participant.name.toLowerCase().includes(q);
      const matchUser = thread.participant.username.toLowerCase().includes(q);
      const matchMsg = thread.lastMessage.text?.toLowerCase().includes(q);
      return matchName || matchUser || matchMsg;
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

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3.5 py-3 space-y-4 max-w-xl mx-auto w-full">
        {/* 3D Neumorphic Search Bar */}
        <div>
          <div className="neu-flat rounded-[20px] px-3.5 py-2.5 flex items-center gap-2.5 border border-slate-200/80 focus-within:ring-2 focus-within:ring-[#5B9DFF]/30 transition bg-white">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search conversations or enter 6-digit PIN..."
              className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
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
        {activeNowThreads.length > 0 && (
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 px-1">
              Active Now
            </span>
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
              {activeNowThreads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => onSelectThread(thread.participant.id)}
                  className="flex flex-col items-center flex-shrink-0 group cursor-pointer select-none"
                >
                  <div className="relative w-13 h-13 rounded-full neu-raised p-0.5 transition-transform group-hover:scale-105">
                    <img
                      src={thread.participant.avatar}
                      alt={thread.participant.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                    {thread.participant.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#5B9DFF] ring-2 ring-white" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 group-hover:text-[#5B9DFF] transition-colors mt-1.5 max-w-[58px] truncate text-center">
                    {thread.participant.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Threads List */}
        <div className="space-y-3 pb-8">
          {filteredThreads.length === 0 ? (
            <div className="neu-inset rounded-[24px] p-8 text-center text-slate-400 text-xs bg-white">
              No conversations found
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const isThisLocked = isChatLockEnabled && lockedChatUserIds.includes(thread.participant.id);
              return (
                <motion.div
                  key={thread.id}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectThread(thread.participant.id)}
                  className={`neu-flat rounded-[22px] p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:shadow-md transition-all bg-white ${
                    isThisLocked ? 'border border-blue-200/80 bg-blue-50/20' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative w-12 h-12 rounded-full neu-raised p-0.5 flex-shrink-0">
                    <img
                      src={thread.participant.avatar}
                      alt={thread.participant.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                    {thread.participant.isOnline && (
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
                          {thread.participant.name}
                        </h4>
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
                        thread.unreadCount > 0
                          ? 'font-bold text-slate-900'
                          : 'text-slate-500'
                      }`}
                    >
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
                    </div>
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
      {activeThread && (
        <IndividualUserMenu
          isOpen={showThreadMenu}
          onClose={() => setShowThreadMenu(false)}
          user={activeThread.participant}
          isFollowing={activeThread.participant.isFollowing}
          onToggleFollow={onToggleFollow}
          onClearChat={onClearChat}
          isLocked={lockedChatUserIds?.includes(activeThread.participant.id)}
          onToggleLockChat={onToggleLockChat}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};
