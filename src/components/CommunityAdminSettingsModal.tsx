import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Crown,
  Shield,
  User,
  Zap,
  Camera,
  Edit3,
  Users,
  Megaphone,
  Trash2,
  Check,
  Lock,
  Globe,
  Search,
  UserPlus,
  UserX,
  Settings,
  Sparkles,
  Sliders,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  VolumeX,
  Volume2,
  Ban,
  Flag,
  UserCheck
} from 'lucide-react';

export interface CommunityMember {
  id: string;
  name: string;
  avatar?: string;
  role: 'Owner' | 'Admin' | 'Moderator' | 'Member';
  status: string;
  joinedDate: string;
  isMuted?: boolean;
  isBlocked?: boolean;
}

export interface CommunityAdminSettings {
  name: string;
  description: string;
  category: string;
  isPrivate: boolean;
  avatarUrl?: string;
  avatarEmoji?: string;
  gradient: string;
}

export interface CommunityPermissions {
  allowMemberPosts: boolean;
  allowMemberInvites: boolean;
  requireAdminApproval: boolean;
  allowMemberReactions: boolean;
}

interface CommunityAdminSettingsModalProps {
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
  };
  incomingRequests?: Array<{ id: string; name: string; note: string; timestamp: string }>;
  onUpdateCommunity: (updatedData: Partial<CommunityAdminSettingsModalProps['community']>) => void;
  onApproveRequest?: (reqId: string, applicantName: string) => void;
  onRejectRequest?: (reqId: string, applicantName: string) => void;
  onSendBroadcast?: (message: string) => void;
  onDeleteCommunity?: (communityId: string, communityName: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

const PRESET_EMOJIS = ['🚀', '⚡', '💻', '🎨', '🌿', '🔒', '👑', '💬', '📸', '🎵', '🎮', '🏆', '🔥', '💡'];

const PRESET_GRADIENTS = [
  { g: 'from-indigo-500 to-blue-600', label: 'Indigo Sky' },
  { g: 'from-emerald-500 to-teal-600', label: 'Emerald Forest' },
  { g: 'from-purple-500 to-pink-600', label: 'Purple Haze' },
  { g: 'from-amber-500 to-orange-600', label: 'Sunset Amber' },
  { g: 'from-rose-500 to-red-600', label: 'Rose Velvet' },
  { g: 'from-cyan-500 to-blue-600', label: 'Ocean Blue' },
];

export const CommunityAdminSettingsModal: React.FC<CommunityAdminSettingsModalProps> = ({
  isOpen,
  onClose,
  community,
  incomingRequests = [],
  onUpdateCommunity,
  onApproveRequest,
  onRejectRequest,
  onSendBroadcast,
  onDeleteCommunity,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'roles' | 'requests' | 'broadcast' | 'danger'>('general');

  // General & Avatar Form State
  const [name, setName] = useState(community.name);
  const [description, setDescription] = useState(community.description);
  const [category, setCategory] = useState(community.category);
  const [isPrivate, setIsPrivate] = useState(community.isPrivate);
  const [gradient, setGradient] = useState(community.gradient || 'from-indigo-500 to-blue-600');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(community.avatarUrl);
  const [avatarEmoji, setAvatarEmoji] = useState<string | undefined>(community.avatarEmoji || '⚡');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Broadcast state
  const [broadcastText, setBroadcastText] = useState('');

  // Member Roles State
  const [memberSearch, setMemberSearch] = useState('');
  const [membersList, setMembersList] = useState<CommunityMember[]>([
    { id: 'm1', name: community.adminName || 'You', role: 'Owner', status: 'Online', joinedDate: 'Creator' },
    { id: 'm2', name: 'Alex Rivera', role: 'Admin', status: 'Online', joinedDate: 'Joined 2w ago' },
    { id: 'm3', name: 'Jordan Smith', role: 'Moderator', status: 'Away', joinedDate: 'Joined 1w ago' },
    { id: 'm4', name: 'Sam Wilson', role: 'Member', status: 'Offline', joinedDate: 'Joined 3d ago' },
    { id: 'm5', name: 'Taylor Swift', role: 'Member', status: 'Online', joinedDate: 'Joined 1d ago' },
  ]);

  // Permissions State
  const [permissions, setPermissions] = useState<CommunityPermissions>({
    allowMemberPosts: true,
    allowMemberInvites: true,
    requireAdminApproval: community.isPrivate,
    allowMemberReactions: true,
  });

  const handleTogglePrivacyMode = (newIsPrivate: boolean) => {
    setIsPrivate(newIsPrivate);
    setPermissions((prev) => ({
      ...prev,
      requireAdminApproval: newIsPrivate,
    }));
    if (onShowToast) {
      if (newIsPrivate) {
        onShowToast('Switched to Private Mode: Join Request system enabled 🔒', 'info');
      } else {
        onShowToast('Switched to Public Mode: Direct 1-click joining enabled 🌐', 'info');
      }
    }
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        if (onShowToast) onShowToast('Community avatar image updated! 📸', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      if (onShowToast) onShowToast('Please enter a community name', 'warning');
      return;
    }

    onUpdateCommunity({
      name: name.trim(),
      description: description.trim(),
      category,
      isPrivate,
      gradient,
      avatarUrl,
      avatarEmoji,
    });

    if (onShowToast) {
      onShowToast(`Community settings for "${name.trim()}" saved! ⚙️`, 'success');
    }
  };

  const handleRoleChange = (memberId: string, newRole: CommunityMember['role']) => {
    setMembersList((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    const member = membersList.find((m) => m.id === memberId);
    if (onShowToast && member) {
      onShowToast(`Updated ${member.name}'s role to ${newRole} 🛡️`, 'info');
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    setMembersList((prev) => prev.filter((m) => m.id !== memberId));
    if (onShowToast) {
      onShowToast(`Removed ${memberName} from community 🚫`, 'warning');
    }
  };

  const handleToggleMuteMember = (memberId: string, memberName: string) => {
    setMembersList((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const newMuted = !m.isMuted;
          if (onShowToast) {
            onShowToast(
              newMuted
                ? `Muted ${memberName} in community chat 🔇`
                : `Unmuted ${memberName} in community chat 🔊`,
              newMuted ? 'warning' : 'info'
            );
          }
          return { ...m, isMuted: newMuted };
        }
        return m;
      })
    );
  };

  const handleBlockMember = (memberId: string, memberName: string) => {
    setMembersList((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, isBlocked: true } : m))
    );
    if (onShowToast) {
      onShowToast(`Blocked ${memberName} from community ⛔`, 'warning');
    }
  };

  const handleUnblockMember = (memberId: string, memberName: string) => {
    setMembersList((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, isBlocked: false } : m))
    );
    if (onShowToast) {
      onShowToast(`Unblocked ${memberName} ✅`, 'info');
    }
  };

  // Report Modal State
  const [reportModalMember, setReportModalMember] = useState<CommunityMember | null>(null);
  const [reportReason, setReportReason] = useState('Spam or Unsolicited Promotion');
  const [reportDetails, setReportDetails] = useState('');

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalMember) return;
    const memberName = reportModalMember.name;
    setReportModalMember(null);
    setReportDetails('');
    if (onShowToast) {
      onShowToast(`Report submitted for user "${memberName}". Our moderation team will review it. 🚩`, 'success');
    }
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    if (onSendBroadcast) onSendBroadcast(broadcastText.trim());
    setBroadcastText('');
  };

  const filteredMembers = membersList.filter((m) =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.role.toLowerCase().includes(memberSearch.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-white rounded-3xl p-4 sm:p-5 max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {/* Current Avatar Icon Preview */}
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${gradient} text-white flex items-center justify-center font-bold shadow-md flex-shrink-0 relative overflow-hidden`}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl">{avatarEmoji || '⚡'}</span>
                )}
                <div className="absolute -bottom-1 -right-1 bg-amber-400 p-0.5 rounded-full ring-2 ring-white">
                  <Crown className="w-2.5 h-2.5 text-slate-900 fill-slate-900" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-800 truncate">{name || community.name}</h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300/70 flex items-center gap-1">
                    <Crown className="w-2.5 h-2.5 text-amber-600 fill-amber-500" /> Owner
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Admin Settings & Role Management</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl mt-3 flex-shrink-0 overflow-x-auto no-scrollbar">
            {[
              { id: 'general', label: 'General & Avatar', icon: Edit3 },
              { id: 'roles', label: `Roles (${membersList.length})`, icon: Shield },
              { id: 'requests', label: `Requests (${incomingRequests.length})`, icon: UserPlus },
              { id: 'broadcast', label: 'Broadcast', icon: Megaphone },
              { id: 'danger', label: 'Danger', icon: Trash2 },
            ].map((t) => {
              const IconComp = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex-1 min-w-[75px] py-1.5 text-[10px] sm:text-[11px] font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                    activeTab === t.id
                      ? 'bg-white text-slate-900 shadow-xs font-black'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <IconComp className="w-3 h-3 flex-shrink-0" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Modal Content Area */}
          <div className="flex-1 overflow-y-auto pt-3.5 space-y-4 no-scrollbar">
            {/* TAB 1: General Info & Avatar Settings */}
            {activeTab === 'general' && (
              <form onSubmit={handleSaveGeneralSettings} className="space-y-4">
                {/* Avatar Section */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                    Community Avatar & Appearance
                  </label>

                  <div className="flex items-center gap-4">
                    {/* Live Avatar Preview */}
                    <div className="relative group">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${gradient} text-white flex items-center justify-center shadow-md relative overflow-hidden transition-transform group-hover:scale-105`}>
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Community avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">{avatarEmoji || '⚡'}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 p-1.5 bg-slate-900 text-white rounded-full shadow-md hover:bg-slate-800 transition cursor-pointer"
                        title="Upload custom image avatar"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileUpload}
                        className="hidden"
                      />
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#5B9DFF]" />
                          Upload Custom Avatar
                        </button>
                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setAvatarUrl(undefined)}
                            className="px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-[11px] font-bold transition cursor-pointer"
                          >
                            Remove Custom
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Select a custom photo, or pick a preset icon & color gradient below.
                      </p>
                    </div>
                  </div>

                  {/* Preset Emoji Icon Picker */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">
                      Choose Preset Icon Emoji
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                      {PRESET_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setAvatarEmoji(emoji);
                            setAvatarUrl(undefined);
                          }}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition-transform cursor-pointer ${
                            !avatarUrl && avatarEmoji === emoji
                              ? 'bg-white ring-2 ring-[#5B9DFF] scale-110 shadow-xs'
                              : 'bg-white/60 hover:bg-white border border-slate-200/50 hover:scale-105'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Theme Gradient Selector */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">
                      Theme Color Gradient
                    </span>
                    <div className="grid grid-cols-6 gap-2">
                      {PRESET_GRADIENTS.map((item) => (
                        <button
                          key={item.g}
                          type="button"
                          onClick={() => setGradient(item.g)}
                          className={`h-7 rounded-xl bg-gradient-to-tr ${item.g} border-2 transition-transform cursor-pointer ${
                            gradient === item.g ? 'border-slate-900 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                          }`}
                          title={item.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Community Details */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Community Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. AI & Machine Learning Club"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]/30 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Community guidelines, focus topics, and goals..."
                      className="w-full h-20 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]/30 resize-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]/30 font-semibold"
                    >
                      {['Tech', 'Outdoors', 'Design', 'Crypto', 'Arts', 'Gaming', 'Lifestyle'].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Public vs Private Visibility & Join Request Logic Switch */}
                  <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
                          Visibility & Access Control
                        </label>
                        <span className="text-[10px] text-slate-400 block">
                          Controls how members discover & join your community
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border flex items-center gap-1 transition ${
                          isPrivate
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                        }`}
                      >
                        {isPrivate ? <Lock className="w-3 h-3 text-amber-600" /> : <Globe className="w-3 h-3 text-blue-600" />}
                        {isPrivate ? 'Private Mode' : 'Public Mode'}
                      </span>
                    </div>

                    {/* Interactive Toggle Switch */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/60 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => handleTogglePrivacyMode(false)}
                        className={`py-2 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          !isPrivate
                            ? 'bg-white text-blue-600 shadow-xs font-black'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Public Mode</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePrivacyMode(true)}
                        className={`py-2 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          isPrivate
                            ? 'bg-white text-amber-600 shadow-xs font-black'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Private Mode</span>
                      </button>
                    </div>

                    {/* Dynamic Join Request Logic Explanation Card */}
                    <div
                      className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                        isPrivate
                          ? 'bg-amber-50/80 border-amber-200/80 text-amber-900'
                          : 'bg-blue-50/80 border-blue-200/80 text-blue-900'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        {isPrivate ? (
                          <Lock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        )}
                        <span>
                          {isPrivate ? 'Join Request System Active 📩' : 'Direct Instant Join Active 🚀'}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-90 font-medium">
                        {isPrivate
                          ? '🔒 Non-members see a "Request to Join" button. They must submit a join request with a note, requiring admin review and approval.'
                          : '🌐 Anyone can discover this community and click "Join" to become a member instantly without needing join request approval.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    Save General Settings & Avatar
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Member Roles & Permissions Management */}
            {activeTab === 'roles' && (
              <div className="space-y-4">
                {/* Search Bar & Stats */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-50 rounded-xl px-3 py-2 flex items-center gap-2 border border-slate-200/80 focus-within:ring-2 focus-within:ring-[#5B9DFF]/30 transition">
                    <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      placeholder="Search members by name or role..."
                      className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Member Permissions Quick Toggles */}
                <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2">
                  <h4 className="text-[11px] font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    Community Role Permissions
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {[
                      { key: 'allowMemberPosts', label: 'Members can post messages' },
                      { key: 'allowMemberInvites', label: 'Members can invite friends' },
                      { key: 'requireAdminApproval', label: 'Require Admin join approval' },
                      { key: 'allowMemberReactions', label: 'Allow custom reactions' },
                    ].map((item) => {
                      const isChecked = (permissions as any)[item.key];
                      return (
                        <label
                          key={item.key}
                          className="flex items-center justify-between p-2 bg-white rounded-xl border border-indigo-100/80 text-[11px] font-semibold text-slate-700 cursor-pointer"
                        >
                          <span>{item.label}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              setPermissions((prev) => ({
                                ...prev,
                                [item.key]: e.target.checked,
                              }))
                            }
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Members List with Role Selector & Owner Moderation Rights */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center justify-between px-1">
                    <span>Community Roster & Moderation</span>
                    <span>{filteredMembers.filter(m => !m.isBlocked).length} Members</span>
                  </h4>

                  <div className="space-y-2 max-h-[260px] overflow-y-auto no-scrollbar pr-0.5">
                    {filteredMembers.map((m) => {
                      const isCreator = m.role === 'Owner';
                      if (m.isBlocked) return null; // Rendered in blocked section below

                      return (
                        <div
                          key={m.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/70 hover:bg-slate-100/60 transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-2xs relative">
                              {m.name.charAt(0)}
                              {m.isMuted && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 rounded-full flex items-center justify-center text-white ring-1 ring-white" title="Muted user">
                                  <VolumeX className="w-2 h-2" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h5 className="text-xs font-bold text-slate-800 truncate">{m.name}</h5>
                                {m.role === 'Owner' && (
                                  <Crown className="w-3 h-3 text-amber-500 fill-amber-400" />
                                )}
                                {m.role === 'Admin' && (
                                  <Shield className="w-3 h-3 text-indigo-600" />
                                )}
                                {m.role === 'Moderator' && (
                                  <Zap className="w-3 h-3 text-amber-500" />
                                )}
                                {m.isMuted && (
                                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-0.5">
                                    <VolumeX className="w-2.5 h-2.5" /> Muted
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 block">{m.joinedDate}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0 self-end sm:self-center flex-wrap">
                            {isCreator ? (
                              <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300/60">
                                Owner 👑
                              </span>
                            ) : (
                              <>
                                <select
                                  value={m.role}
                                  onChange={(e) => handleRoleChange(m.id, e.target.value as any)}
                                  className="px-2 py-1 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#5B9DFF] cursor-pointer"
                                >
                                  <option value="Admin">Admin 🛡️</option>
                                  <option value="Moderator">Mod ⚡</option>
                                  <option value="Member">Member 👤</option>
                                </select>

                                {/* Mute / Unmute Button */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleMuteMember(m.id, m.name)}
                                  className={`p-1.5 rounded-xl border text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                                    m.isMuted
                                      ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                  }`}
                                  title={m.isMuted ? 'Unmute member' : 'Mute member from sending messages'}
                                >
                                  {m.isMuted ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                                </button>

                                {/* Report User Button */}
                                <button
                                  type="button"
                                  onClick={() => setReportModalMember(m)}
                                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition cursor-pointer"
                                  title="Report user for violations"
                                >
                                  <Flag className="w-3.5 h-3.5" />
                                </button>

                                {/* Block User Button */}
                                <button
                                  type="button"
                                  onClick={() => handleBlockMember(m.id, m.name)}
                                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 transition cursor-pointer"
                                  title="Block user from rejoining community"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </button>

                                {/* Remove Member Button */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMember(m.id, m.name)}
                                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition cursor-pointer"
                                  title="Kick member from community"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Blocked Members Section */}
                {membersList.some((m) => m.isBlocked) && (
                  <div className="p-3 bg-rose-50/60 rounded-2xl border border-rose-200/80 space-y-2 mt-2">
                    <h5 className="text-[11px] font-extrabold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Ban className="w-3.5 h-3.5 text-rose-600" />
                      Blocked Community Users
                    </h5>
                    <div className="space-y-1.5">
                      {membersList
                        .filter((m) => m.isBlocked)
                        .map((b) => (
                          <div
                            key={b.id}
                            className="flex items-center justify-between p-2 bg-white rounded-xl border border-rose-100 text-xs"
                          >
                            <span className="font-bold text-slate-800">{b.name}</span>
                            <button
                              type="button"
                              onClick={() => handleUnblockMember(b.id, b.name)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold hover:bg-emerald-100 transition cursor-pointer"
                            >
                              Unblock User
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Pending Join Requests */}
            {activeTab === 'requests' && (
              <div className="space-y-3 min-h-[160px]">
                {incomingRequests.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-1">
                    <Users className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                    <p className="font-bold text-slate-600">No pending join requests</p>
                    <p className="text-[11px] text-slate-400">Requests sent to your private community will show here.</p>
                  </div>
                ) : (
                  incomingRequests.map((req) => (
                    <div key={req.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                            {req.name.charAt(0)}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-800">{req.name}</h5>
                            <span className="text-[10px] text-slate-400">{req.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      {req.note && (
                        <p className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200/50 italic">
                          "{req.note}"
                        </p>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => onRejectRequest && onRejectRequest(req.id, req.name)}
                          className="flex-1 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => onApproveRequest && onApproveRequest(req.id, req.name)}
                          className="flex-1 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition shadow-xs cursor-pointer"
                        >
                          Approve Member
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: Broadcast Announcement */}
            {activeTab === 'broadcast' && (
              <form onSubmit={handleBroadcastSubmit} className="space-y-3">
                <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-1">
                  <h5 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5 text-[#5B9DFF]" />
                    Owner Announcement
                  </h5>
                  <p className="text-[11px] text-blue-700/80">
                    Send a broadcast push notification to all members of {name || community.name}.
                  </p>
                </div>

                <div>
                  <textarea
                    value={broadcastText}
                    onChange={(e) => setBroadcastText(e.target.value)}
                    placeholder="Type your official announcement here..."
                    className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]/30 resize-none font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#5B9DFF] text-white text-xs font-bold hover:bg-blue-600 transition flex items-center justify-center gap-1.5 shadow-md shadow-[#5B9DFF]/20 cursor-pointer"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  Send Broadcast to Members
                </button>
              </form>
            )}

            {/* TAB 5: Danger Zone */}
            {activeTab === 'danger' && (
              <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100 space-y-3">
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    Delete Community
                  </h5>
                  <p className="text-[11px] text-rose-700">
                    Permanently delete <span className="font-bold">{name || community.name}</span>. All channels, messages, and member access will be erased.
                  </p>
                </div>
                <button
                  onClick={() => onDeleteCommunity && onDeleteCommunity(community.id, name || community.name)}
                  className="w-full py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-200" />
                  Permanently Delete Community
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Report User Dialog Modal */}
        {reportModalMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Flag className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Report Member</h4>
                    <span className="text-[10px] text-slate-400">Target: {reportModalMember.name}</span>
                  </div>
                </div>
                <button
                  onClick={() => setReportModalMember(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Select Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="Spam or Unsolicited Promotion">Spam or Unsolicited Promotion 🚫</option>
                    <option value="Harassment or Hate Speech">Harassment or Abuse ⚠️</option>
                    <option value="Inappropriate Content or Media">Inappropriate Media 🔞</option>
                    <option value="Offensive Conduct">Offensive Behavior 🛑</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide context or recent message details..."
                    className="w-full h-20 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalMember(null)}
                    className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    Submit Report
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
