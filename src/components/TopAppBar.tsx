import React from 'react';
import { Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../context/LanguageContext';

interface TopAppBarProps {
  unreadNotificationsCount: number;
  unreadMessagesCount?: number;
  onOpenNotifications: () => void;
  onOpenChat?: () => void;
  onLogoClick?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  unreadNotificationsCount,
  onOpenNotifications,
  onLogoClick,
}) => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 w-full px-5 py-3.5 bg-gradient-to-b from-[#f4f7fb]/95 via-[#f4f7fb]/90 to-transparent backdrop-blur-md transition-all">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {/* Left: App Title */}
        <button
          id="app-logo-btn"
          onClick={onLogoClick}
          className="text-left focus:outline-none group flex items-center gap-2.5"
        >
          <img
            src="/logo.png"
            alt="Funshann"
            className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200/80"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23ffffff'/%3E%3Ctext x='50' y='68' font-size='55' font-weight='bold' text-anchor='middle' fill='%23000000' font-family='sans-serif'%3EF%3C/text%3E%3C/svg%3E";
            }}
          />
          <div className="flex flex-col">
            <span className="text-[24px] font-black tracking-tight text-slate-850 font-['Outfit'] flex items-center gap-1.5 drop-shadow-sm">
              <span className="text-slate-800">Fun</span>
              <span className="text-[#5B9DFF]">shann</span>
              <span className="inline-block w-2 h-2 rounded-full bg-[#5B9DFF] mb-1"></span>
            </span>
          </div>
        </button>

        {/* Right: Raised 3D Notification Icon */}
        <div className="flex items-center gap-3">
          {/* Notification Button */}
          <motion.button
            id="top-notification-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={onOpenNotifications}
            aria-label={t('nav_notifications')}
            title={t('nav_notifications')}
            className="relative w-12 h-12 rounded-full neu-raised flex items-center justify-center text-slate-600 hover:text-[#5B9DFF] transition-colors cursor-pointer"
          >
            <Bell className="w-6 h-6 transition-transform" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[11px] font-bold text-white bg-[#5B9DFF] rounded-full shadow-md animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
};
