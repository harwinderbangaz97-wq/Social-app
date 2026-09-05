import React, { useState } from 'react';
import { X, Users, UserPlus, LogOut, Trash2, Bell, BellOff, Shield, Image as ImageIcon, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { ChatThread, User } from '../types';

interface GroupInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  thread: ChatThread;
  currentUser: User;
  allUsers: User[];
  onUpdateGroup?: (groupId: string, updates: { name?: string; description?: string; avatar?: string; memberIds?: string[] }) => void;
  onLeaveGroup?: (groupId: string) => void;
  onClearChat?: (threadId: string) => void;
  onShowToast?: (msg: string) => void;
}

export const GroupInfoModal: React.FC<GroupInfoModalProps> = ({
  isOpen,
  onClose,
  thread,
  currentUser,
  allUsers,
  onUpdateGroup,
  onLeaveGroup,
  onClearChat,
  onShowToast,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState(thread.groupName || '');
  const [groupDesc, setGroupDesc] = useState(thread.groupDescription || '');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [selectedAddId, setSelectedAddId] = useState('');

  if (!isOpen || !thread.isGroup) return null;

  const isAdmin = thread.groupAdminIds?.includes(currentUser.id);
  const members = thread.groupMembers || [];
  const sharedImages = thread.messages
    .filter((m) => m.imageUrl)
    .map((m) => m.imageUrl as string);

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    if (onUpdateGroup) {
      onUpdateGroup(thread.id, {
        name: groupName.trim(),
        description: groupDesc.trim(),
      });
    }
    setIsEditing(false);
    if (onShowToast) onShowToast('Group info updated successfully!');
  };

  const handleAddMemberSubmit = () => {
    if (!selectedAddId) return;
    const userToAdd = allUsers.find((u) => u.id === selectedAddId);
    if (!userToAdd) return;

    if (members.some((m) => m.id === userToAdd.id)) {
      if (onShowToast) onShowToast(`${userToAdd.name} is already in the group`);
      return;
    }

    const updatedMembers = [...members, userToAdd];
    const updatedMemberIds = updatedMembers.map((m) => m.id);

    if (onUpdateGroup) {
      onUpdateGroup(thread.id, {
        memberIds: updatedMemberIds,
      });
    }
    setSelectedAddId('');
    setIsAddingMember(false);
    if (onShowToast) onShowToast(`Added ${userToAdd.name} to the group! 🎉`);
  };

  const handleRemoveMember = (memberId: string) => {
    const memberToRemove = members.find((m) => m.id === memberId);
    const updatedMembers = members.filter((m) => m.id !== memberId);
    const updatedMemberIds = updatedMembers.map((m) => m.id);

    if (onUpdateGroup) {
      onUpdateGroup(thread.id, {
        memberIds: updatedMemberIds,
      });
    }
    if (onShowToast && memberToRemove) {
      onShowToast(`Removed ${memberToRemove.name} from group`);
    }
  };

  const availableUsersToAdd = allUsers.filter(
    (u) => u.id !== currentUser.id && !members.some((m) => m.id === u.id)
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-[28px] max-w-lg w-full p-6 shadow-2xl border border-slate-200/80 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden neu-inset flex-shrink-0">
              <img
                src={thread.groupAvatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80'}
                alt={thread.groupName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 truncate max-w-[240px]">
                {thread.groupName}
              </h3>
              <p className="text-xs text-slate-500">{members.length} members</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full neu-raised flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-5 py-4 pr-1 no-scrollbar">
          {/* Description & Edit */}
          <div className="neu-flat rounded-[20px] p-4 bg-slate-50/80 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Group Description
              </span>
              {isAdmin && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Edit Info
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveInfo} className="space-y-3 pt-1">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3 py-2 rounded-[12px] bg-white border border-blue-300 text-xs font-bold text-slate-900 outline-hidden"
                  placeholder="Group Name"
                  required
                />
                <textarea
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-[12px] bg-white border border-blue-300 text-xs text-slate-700 outline-hidden resize-none h-16"
                  placeholder="Group Description"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-[10px] bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-[10px] neu-active-blue text-white text-xs font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {thread.groupDescription || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Members List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-500" />
                <span>Members ({members.length})</span>
              </span>
              {isAdmin && (
                <button
                  onClick={() => setIsAddingMember((prev) => !prev)}
                  className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded-[10px] flex items-center gap-1 transition cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Member</span>
                </button>
              )}
            </div>

            {/* Add Member Form */}
            {isAddingMember && (
              <div className="p-3 rounded-[16px] neu-flat bg-blue-50/50 border border-blue-200 space-y-2">
                <span className="text-[11px] font-bold text-blue-700 block">Select Contact to Add:</span>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedAddId}
                    onChange={(e) => setSelectedAddId(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-[12px] bg-white border border-slate-200 text-xs text-slate-800 outline-hidden"
                  >
                    <option value="">-- Choose member --</option>
                    {availableUsersToAdd.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} (@{u.username})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddMemberSubmit}
                    disabled={!selectedAddId}
                    className="px-3 py-2 rounded-[12px] neu-active-blue text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1.5 max-h-52 overflow-y-auto no-scrollbar">
              {members.map((member) => {
                const isMemberAdmin = thread.groupAdminIds?.includes(member.id);
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2.5 rounded-[14px] bg-white border border-slate-200/60 shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={member.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-800 truncate">
                            {member.id === currentUser.id ? 'You' : member.name}
                          </h4>
                          {isMemberAdmin && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-extrabold flex items-center gap-0.5">
                              <Shield className="w-2.5 h-2.5" /> Admin
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">@{member.username}</p>
                      </div>
                    </div>

                    {isAdmin && member.id !== currentUser.id && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-[11px] font-bold text-rose-500 hover:bg-rose-50 px-2.5 py-1 rounded-[10px] transition cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shared Media Gallery */}
          {sharedImages.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 px-1">
                <ImageIcon className="w-4 h-4 text-emerald-500" />
                <span>Shared Media ({sharedImages.length})</span>
              </span>
              <div className="grid grid-cols-4 gap-2">
                {sharedImages.map((imgUrl, i) => (
                  <div key={i} className="aspect-square rounded-[12px] overflow-hidden border border-slate-200">
                    <img src={imgUrl} alt="Shared" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group Actions */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            {onClearChat && (
              <button
                onClick={() => {
                  onClearChat(thread.id);
                  onClose();
                  if (onShowToast) onShowToast('Group chat history cleared');
                }}
                className="w-full px-4 py-2.5 rounded-[14px] text-left text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-slate-500" />
                <span>Clear Chat History</span>
              </button>
            )}

            {onLeaveGroup && (
              <button
                onClick={() => {
                  onLeaveGroup(thread.id);
                  onClose();
                  if (onShowToast) onShowToast(`You left group "${thread.groupName}"`);
                }}
                className="w-full px-4 py-2.5 rounded-[14px] text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Leave Group</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
