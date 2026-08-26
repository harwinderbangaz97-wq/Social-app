import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Lock,
  Globe,
  Crown,
  Shield,
  Users,
  MessageSquare,
  Info,
  Settings,
  VolumeX,
  AlertTriangle,
  Smile,
  Paperclip,
  CheckCircle2,
  Share2
} from 'lucide-react';

interface CommunityMessage {
  id: string;
  senderName: string;
  senderRole?: 'Owner' | 'Admin' | 'Member';
  text: string;
  timestamp: string;
  isOwnerMsg?: boolean;
}

interface CommunityChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: {
    id: string;
    name: string;
    description: string;
    category: string;
    isPrivate: boolean;
    adminName: string;
    ownerId?: string;
    gradient: string;
    avatarUrl?: string;
    avatarEmoji?: string;
    members: string;
    lastMessage?: string;
  };
  isJoined: boolean;
  isOwner: boolean;
  isMuted?: boolean;
  onJoinToggle: () => void;
  onOpenOwnerAdmin: () => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const CommunityChannelModal: React.FC<CommunityChannelModalProps> = ({
  isOpen,
  onClose,
  community,
  isJoined,
  isOwner,
  isMuted = false,
  onJoinToggle,
  onOpenOwnerAdmin,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'info' | 'members'>('chat');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<CommunityMessage[]>([
    {
      id: 'm1',
      senderName: community.adminName || 'Community Creator',
      senderRole: 'Owner',
      text: `Welcome everyone to ${community.name}! 🎉 Feel free to share ideas and ask questions here in our general channel.`,
      timestamp: 'Today at 10:00 AM',
      isOwnerMsg: true,
    },
    {
      id: 'm2',
      senderName: 'Alex Rivera',
      senderRole: 'Admin',
      text: 'Glad to be here! Looking forward to collaborating with everyone.',
      timestamp: 'Today at 10:15 AM',
    },
    {
      id: 'm3',
      senderName: 'Jordan Smith',
      senderRole: 'Member',
      text: community.lastMessage || 'Hey team! Anyone working on new projects this week?',
      timestamp: 'Today at 11:30 AM',
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (isMuted) {
      if (onShowToast) {
        onShowToast('You are muted by the community owner and cannot send messages.', 'warning');
      }
      return;
    }

    if (!isJoined && !isOwner) {
      if (onShowToast) {
        onShowToast('Join this community first to participate in discussions.', 'info');
      }
      return;
    }

    const newMsg: CommunityMessage = {
      id: Date.now().toString(),
      senderName: isOwner ? `${community.adminName} (You)` : 'You',
      senderRole: isOwner ? 'Owner' : 'Member',
      text: inputText.trim(),
      timestamp: 'Just now',
      isOwnerMsg: isOwner,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 12 }}
          className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Banner & Header */}
          <div className={`relative h-28 bg-gradient-to-tr ${community.gradient} p-4 flex items-end justify-between text-white`}>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 transition cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Community Avatar & Info */}
            <div className="flex items-end gap-3 translate-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white p-1 shadow-lg flex-shrink-0 relative overflow-hidden">
                <div className={`w-full h-full rounded-xl bg-gradient-to-tr ${community.gradient} text-white flex items-center justify-center font-black overflow-hidden relative`}>
                  {community.avatarUrl ? (
                    <img src={community.avatarUrl} alt={community.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">{community.avatarEmoji || '⚡'}</span>
                  )}
                </div>
              </div>
              <div className="mb-1 text-slate-900">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-base font-black text-slate-900 drop-shadow-xs">{community.name}</h3>
                  {isOwner ? (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                      <Crown className="w-2.5 h-2.5 text-amber-600 fill-amber-500" /> Owner
                    </span>
                  ) : community.isPrivate ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-amber-600" /> Private
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5 text-blue-600" /> Public
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {community.category} • {community.members} Members
                </p>
              </div>
            </div>

            {/* Top Header Actions */}
            <div className="flex items-center gap-2 mb-1">
              {isOwner ? (
                <button
                  onClick={() => {
                    onClose();
                    onOpenOwnerAdmin();
                  }}
                  className="px-3 py-1.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin Settings</span>
                </button>
              ) : (
                <button
                  onClick={onJoinToggle}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer ${
                    isJoined
                      ? 'bg-white/90 text-slate-800 hover:bg-white'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {isJoined ? 'Joined ✓' : community.isPrivate ? 'Request Join 🔒' : 'Join Community 🌐'}
                </button>
              )}
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="pt-7 px-4 pb-2 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-full">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'chat' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#5B9DFF]" />
                <span># general-chat</span>
              </button>
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'info' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Info className="w-3.5 h-3.5 text-indigo-500" />
                <span>About & Guidelines</span>
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'members' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span>Members ({community.members})</span>
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 no-scrollbar">
            {/* TAB 1: General Community Chat */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full justify-between space-y-3">
                {/* Messages Feed */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[320px] pr-1 no-scrollbar">
                  <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-100 text-center space-y-1">
                    <p className="text-xs font-bold text-blue-900">
                      Welcome to the official #{community.name} group channel!
                    </p>
                    <p className="text-[11px] text-blue-700/80">
                      All messages are visible to verified community members.
                    </p>
                  </div>

                  {messages.map((m) => (
                    <div key={m.id} className="flex items-start gap-2.5 group">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-2xs mt-0.5">
                        {m.senderName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800">{m.senderName}</span>
                          {m.senderRole === 'Owner' && (
                            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-black rounded-full border border-amber-300 flex items-center gap-0.5">
                              <Crown className="w-2 h-2 text-amber-600 fill-amber-500" /> Owner
                            </span>
                          )}
                          {m.senderRole === 'Admin' && (
                            <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 text-[9px] font-black rounded-full border border-indigo-200">
                              Admin 🛡️
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">{m.timestamp}</span>
                        </div>
                        <div className="mt-1 p-3 bg-white rounded-2xl rounded-tl-xs border border-slate-200/80 text-xs text-slate-800 shadow-2xs leading-relaxed font-normal">
                          {m.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Muted Warning Banner */}
                {isMuted && (
                  <div className="p-2.5 bg-rose-50 rounded-2xl border border-rose-200 flex items-center gap-2 text-rose-800 text-xs font-bold">
                    <VolumeX className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>You are muted by the community owner and cannot send messages.</span>
                  </div>
                )}

                {/* Chat Input Bar */}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-1 flex-shrink-0">
                  <div className="flex-1 bg-white rounded-2xl border border-slate-200 px-3 py-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-[#5B9DFF]/30 transition shadow-2xs">
                    <Smile className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
                    <input
                      type="text"
                      disabled={isMuted}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={
                        isMuted
                          ? 'You are muted by community admin...'
                          : !isJoined && !isOwner
                          ? 'Join community to participate in chat...'
                          : 'Message # general...'
                      }
                      className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium disabled:opacity-50"
                    />
                    <Paperclip className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
                  </div>
                  <button
                    type="submit"
                    disabled={isMuted || !inputText.trim()}
                    className="w-10 h-10 rounded-2xl bg-[#5B9DFF] text-white flex items-center justify-center hover:bg-blue-600 transition shadow-md shadow-[#5B9DFF]/20 disabled:opacity-40 cursor-pointer flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: About & Guidelines */}
            {activeTab === 'info' && (
              <div className="space-y-4 text-xs text-slate-700">
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-2 shadow-2xs">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                    About this Community
                  </h4>
                  <p className="leading-relaxed font-medium text-slate-600">
                    {community.description || 'Welcome to our official community hub! Connect with fellow members, share knowledge, and explore exciting topics.'}
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-2 shadow-2xs">
                  <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Community Rules
                  </h4>
                  <ul className="space-y-1.5 text-[11px] text-slate-600 font-medium list-disc list-inside">
                    <li>Be respectful and constructive with all members.</li>
                    <li>No spamming, self-promotion, or off-topic advertising.</li>
                    <li>Owner & admins reserve the right to mute, remove, or ban rule violators.</li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/70 space-y-1">
                  <h4 className="font-extrabold text-amber-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" /> Community Leadership
                  </h4>
                  <p className="text-[11px] text-amber-800 font-semibold">
                    Created & Managed by <span className="font-bold">{community.adminName}</span>
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: Members Preview */}
            {activeTab === 'members' && (
              <div className="space-y-2">
                <div className="p-3 bg-white rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                      Active Community Roster
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">{community.members} Members</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {[
                      { name: community.adminName, role: 'Owner', badge: '👑 Owner' },
                      { name: 'Alex Rivera', role: 'Admin', badge: '🛡️ Admin' },
                      { name: 'Jordan Smith', role: 'Moderator', badge: '⚡ Mod' },
                      { name: 'Sam Wilson', role: 'Member', badge: 'Member' },
                      { name: 'Taylor Swift', role: 'Member', badge: 'Member' },
                    ].map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs">
                            {m.name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-slate-800">{m.name}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          m.role === 'Owner' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {m.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
