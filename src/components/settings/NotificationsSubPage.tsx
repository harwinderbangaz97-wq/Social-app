import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Sparkles,
  MessageSquare,
  Radio,
  UserCheck,
  UserPlus,
  Check,
  X,
  Volume2,
} from 'lucide-react';
import {
  NotificationPreferences,
  getNotificationPreferences,
  saveNotificationPreferences,
} from '../../services/notificationSettingsService';

interface NotificationsSubPageProps {
  onShowToast: (msg: string) => void;
}

export const NotificationsSubPage: React.FC<NotificationsSubPageProps> = ({ onShowToast }) => {
  const [prefs, setPrefs] = useState<NotificationPreferences>(() => getNotificationPreferences());

  const handleToggle = (key: keyof NotificationPreferences) => {
    const updated = {
      ...prefs,
      [key]: !prefs[key],
    };
    setPrefs(updated);
    saveNotificationPreferences(updated);
    const label =
      key === 'story'
        ? 'Story'
        : key === 'message'
        ? 'Message'
        : key === 'updates'
        ? 'Updates'
        : key === 'following'
        ? 'Following'
        : 'Followers';
    onShowToast(`${label} notifications ${updated[key] ? 'enabled (ON)' : 'disabled (OFF)'}`);
  };

  const allOn = Object.values(prefs).every(Boolean);

  const handleToggleAll = () => {
    const nextState = !allOn;
    const updated: NotificationPreferences = {
      story: nextState,
      message: nextState,
      updates: nextState,
      following: nextState,
      followers: nextState,
    };
    setPrefs(updated);
    saveNotificationPreferences(updated);
    onShowToast(nextState ? 'All notifications turned ON' : 'All notifications muted (OFF)');
  };

  const notificationItems: Array<{
    key: keyof NotificationPreferences;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      key: 'story',
      title: 'Story',
      description: 'Alerts when friends share stories or reply to your story moments',
      icon: <Radio className="w-4 h-4" />,
      color: '#EC4899',
    },
    {
      key: 'message',
      title: 'Message',
      description: 'Instant direct chat message alerts, audio voice notes & media',
      icon: <MessageSquare className="w-4 h-4" />,
      color: '#3B82F6',
    },
    {
      key: 'updates',
      title: 'Updates',
      description: 'Funshann app feature releases, security tips & community bulletins',
      icon: <Sparkles className="w-4 h-4" />,
      color: '#8B5CF6',
    },
    {
      key: 'following',
      title: 'Following',
      description: 'New posts, live sessions and creative drops from accounts you follow',
      icon: <UserCheck className="w-4 h-4" />,
      color: '#10B981',
    },
    {
      key: 'followers',
      title: 'Followers',
      description: 'Notifications when someone new starts following your creator profile',
      icon: <UserPlus className="w-4 h-4" />,
      color: '#F59E0B',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header Info Card */}
      <div className="neu-flat rounded-[24px] p-4 space-y-3 border border-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl neu-raised flex items-center justify-center text-amber-500">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Push Notification Preferences</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Configure alerts and push channels independently
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleToggleAll}
            className="px-2.5 py-1 rounded-full neu-raised text-[10px] font-bold text-[#5B9DFF] hover:text-blue-700 cursor-pointer"
          >
            {allOn ? 'Mute All' : 'Turn All On'}
          </motion.button>
        </div>
      </div>

      {/* Individual Switches List */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Notification Channels
        </span>

        <div className="neu-flat rounded-[22px] overflow-hidden divide-y divide-slate-100/80">
          {notificationItems.map((item) => {
            const isEnabled = prefs[item.key];
            return (
              <div
                key={item.key}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/40 transition-colors"
              >
                <div className="flex items-center gap-3 pr-2">
                  <div
                    className="w-9 h-9 rounded-full neu-raised flex items-center justify-center"
                    style={{ color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-800">{item.title}</p>
                      <span
                        className={`text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isEnabled
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isEnabled ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{item.description}</p>
                  </div>
                </div>

                {/* Independent Toggle Switch */}
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleToggle(item.key)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center shrink-0 cursor-pointer ${
                    isEnabled ? 'neu-active-blue justify-end' : 'neu-inset justify-start'
                  }`}
                  role="switch"
                  aria-checked={isEnabled}
                  aria-label={`${item.title} notification switch`}
                >
                  <motion.div
                    layout
                    className="w-4.5 h-4.5 rounded-full bg-white shadow-sm flex items-center justify-center"
                  >
                    {isEnabled ? (
                      <Check className="w-2.5 h-2.5 text-[#5B9DFF] stroke-[3]" />
                    ) : (
                      <X className="w-2.5 h-2.5 text-slate-400" />
                    )}
                  </motion.div>
                </motion.button>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Sound & Vibrate Note */}
      <div className="p-3 rounded-2xl bg-white/60 neu-inset text-[11px] text-slate-500 flex items-start gap-2.5">
        <Volume2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p>
          Notification delivery honors your Android system volume and Do Not Disturb schedule.
          Preferences are saved automatically.
        </p>
      </div>
    </div>
  );
};
