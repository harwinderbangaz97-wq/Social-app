import React, { useState } from 'react';
import { Search, CheckCircle2, UserPlus, UserCheck, MessageSquare, MapPin, Sparkles, Users, ShieldCheck, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../types';
import { useTranslation } from '../context/LanguageContext';

interface SearchPeopleViewProps {
  users: User[];
  onToggleFollow: (userId: string) => void;
  onOpenDirectChat: (user: User) => void;
  onUserSelect?: (user: User) => void;
  onShowToast?: (msg: string) => void;
}

const SearchPeopleViewComponent: React.FC<SearchPeopleViewProps> = ({
  users,
  onToggleFollow,
  onOpenDirectChat,
  onUserSelect,
  onShowToast,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'verified' | 'creators' | 'following' | 'contacts'>('all');

  const categories = [
    { id: 'all', label: t('search_filter_all') },
    { id: 'contacts', label: t('search_filter_contacts') },
    { id: 'verified', label: t('search_filter_verified') },
    { id: 'creators', label: t('search_filter_creators') },
    { id: 'following', label: t('search_filter_following') },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesQuery =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.bio && user.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.location && user.location.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesQuery) return false;

    if (activeCategory === 'contacts') return user.id === 'user-2' || user.id === 'user-3' || user.id === 'user-5';
    if (activeCategory === 'verified') return user.isVerified;
    if (activeCategory === 'creators') return user.followersCount > 20000;
    if (activeCategory === 'following') return user.isFollowing;
    return true;
  });

  return (
    <div className="w-full max-w-lg mx-auto px-4 pb-28 pt-2">
      {/* Header */}
      <div className="mb-3.5">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          {t('search_title')}
        </h2>
      </div>

      {/* Neumorphic Search Bar */}
      <div className="relative mb-5">
        <div className="w-full neu-inset rounded-full h-12 flex items-center px-4 transition-all focus-within:ring-2 focus-within:ring-[#5B9DFF]/40">
          <Search className="w-5.5 h-5.5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            id="search-people-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder')}
            className="w-full bg-transparent text-[14.5px] text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1 cursor-pointer"
            >
              {t('common_clear')}
            </button>
          )}
        </div>
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-3 mb-4">
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'neu-active-blue text-white shadow-md'
                : 'neu-raised text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </motion.button>
        ))}
      </div>

      {/* Trending Spotlight / Contacts Privacy Banner */}
      {activeCategory === 'contacts' ? (
        <div className="mb-6 neu-flat rounded-[22px] p-4 flex items-center justify-between border border-blue-100/50 bg-gradient-to-r from-white via-blue-50/30 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10.5 h-10.5 rounded-full bg-[#5B9DFF]/15 flex items-center justify-center text-[#5B9DFF]">
              <Users className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-[13.5px] font-bold text-slate-800">{t('search_contacts_banner_title')}</h4>
              <p className="text-[12px] text-slate-500">
                {t('search_contacts_banner_desc')}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('common_private')}</span>
          </span>
        </div>
      ) : (
        <div className="mb-6 neu-flat rounded-[22px] p-4 flex items-center justify-between border border-blue-100/50 bg-gradient-to-r from-white via-blue-50/20 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10.5 h-10.5 rounded-full bg-[#5B9DFF]/15 flex items-center justify-center text-[#5B9DFF]">
              <Sparkles className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-[13.5px] font-bold text-slate-800">{t('search_curated_banner_title')}</h4>
              <p className="text-[12px] text-slate-500">{t('search_curated_banner_desc')}</p>
            </div>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#5B9DFF]/15 text-[#5B9DFF]">
            {t('common_trending')}
          </span>
        </div>
      )}

      {/* People 2-Column Grid */}
      <div>
        {filteredUsers.length === 0 ? (
          <div className="neu-flat rounded-[24px] p-8 text-center">
            <p className="text-[15px] font-semibold text-slate-700">{t('search_no_results_title')}</p>
            <p className="text-[13px] text-slate-400 mt-1">{t('search_no_results_desc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                className="neu-flat rounded-[20px] p-2.5 sm:p-3 flex flex-col justify-between items-center text-center transition-all hover:shadow-md border border-slate-100/50"
              >
                {/* Top Profile Area - Clickable to open Profile */}
                <div
                  className="w-full flex flex-col items-center cursor-pointer group"
                  onClick={() => onUserSelect && onUserSelect(user)}
                >
                  {/* Circular Avatar - Made slightly larger */}
                  <div className="relative w-19 h-19 sm:w-20 sm:h-20 rounded-full neu-raised p-1 mb-2 mx-auto transition-transform group-hover:scale-105">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full rounded-full object-cover"
                    />
                    {user.isOnline && (
                      <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#5B9DFF] ring-2 ring-white" />
                    )}
                  </div>

                  {/* Display Name + Verified Badge */}
                  <div className="flex items-center justify-center gap-1 w-full max-w-[130px] px-0.5">
                    <span className="font-bold text-[13px] text-slate-800 truncate group-hover:text-[#5B9DFF] transition-colors">
                      {user.name}
                    </span>
                    {user.isVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#5B9DFF] fill-[#5B9DFF]/20 flex-shrink-0" />
                    )}
                  </div>
                </div>

                {/* Bottom Actions: Follow Button & Message Button */}
                <div className="w-full pt-2.5 mt-2 flex items-center gap-1.5 border-t border-slate-100/60 dark:border-white/5">
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFollow(user.id);
                    }}
                    className={`flex-1 h-8 rounded-full text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      user.isFollowing
                        ? 'neu-inset text-slate-600 border border-slate-200/80'
                        : 'neu-active-blue text-white shadow-sm'
                    }`}
                  >
                    {user.isFollowing ? (
                      <>
                        <UserCheck className="w-3 h-3" />
                        <span>{t('common_following')}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3" />
                        <span>{t('common_follow')}</span>
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDirectChat(user);
                    }}
                    aria-label={`Chat with ${user.name}`}
                    className="w-8 h-8 rounded-full neu-raised flex items-center justify-center text-slate-600 hover:text-[#5B9DFF] transition-colors flex-shrink-0 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const SearchPeopleView = React.memo(SearchPeopleViewComponent);

