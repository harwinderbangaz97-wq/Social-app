import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserX,
  Search,
  ShieldCheck,
  Check,
  Trash2,
  Lock,
  UserPlus,
} from 'lucide-react';
import { BlockedUserItem, User } from '../../types';
import {
  getBlockedUsers,
  unblockUser,
  saveBlockedUsers,
} from '../../services/privacySettingsService';

interface BlockedListSubPageProps {
  users?: User[];
  onShowToast: (msg: string) => void;
}

export const BlockedListSubPage: React.FC<BlockedListSubPageProps> = ({
  users = [],
  onShowToast,
}) => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserItem[]>(() => getBlockedUsers());
  const [searchQuery, setSearchQuery] = useState('');

  const handleUnblock = (userId: string, username: string) => {
    const updated = unblockUser(userId);
    setBlockedUsers(updated);
    onShowToast(`Unblocked @${username}`);
  };

  const filteredList = blockedUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4 pb-4">
      {/* Search Filter */}
      <div className="relative">
        <div className="w-full neu-inset rounded-full h-11 flex items-center px-4 transition-all focus-within:ring-2 focus-within:ring-[#5B9DFF]/40">
          <Search className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search blocked accounts..."
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[10px] text-slate-400 hover:text-slate-600 px-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Blocked Explanation */}
      <div className="neu-flat rounded-[24px] p-4 flex items-start gap-3 bg-slate-50/50">
        <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-red-500 flex-shrink-0">
          <UserX className="w-4 h-4" />
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Blocked accounts cannot view your profile, posts, stories, or send direct messages to you.
          They are not notified when they are blocked.
        </p>
      </div>

      {/* Blocked Accounts List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Blocked Accounts ({blockedUsers.length})
          </span>
        </div>

        {filteredList.length === 0 ? (
          <div className="neu-flat rounded-[24px] p-6 text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800">
              {searchQuery ? 'No matching blocked users' : 'No Blocked Accounts'}
            </h4>
            <p className="text-[11px] text-slate-500">
              {searchQuery
                ? 'Try a different username search query'
                : 'You have not blocked any accounts.'}
            </p>
          </div>
        ) : (
          <div className="neu-flat rounded-[24px] divide-y divide-slate-100/80 overflow-hidden">
            {filteredList.map((user) => (
              <div key={user.id} className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover neu-raised"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{user.name}</h4>
                    <p className="text-[11px] text-[#5B9DFF] font-medium">@{user.username}</p>
                    {user.reason && (
                      <p className="text-[10px] text-slate-400 italic mt-0.5">
                        Reason: {user.reason}
                      </p>
                    )}
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleUnblock(user.userId, user.username)}
                  className="px-3.5 py-1.5 rounded-full neu-raised text-xs font-bold text-slate-700 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <span>Unblock</span>
                </motion.button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
