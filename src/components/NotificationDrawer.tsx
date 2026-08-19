import React, { useState } from 'react';
import {
  X,
  ThumbsUp,
  ThumbsDown,
  UserPlus,
  MessageCircle,
  MessageSquare,
  Sparkles,
  CheckCheck,
  ShieldAlert,
  Eye,
  User as UserIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationItem, User } from '../types';

interface NotificationDrawerProps {
  notifications: NotificationItem[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
  onNotificationClick: (notif: NotificationItem) => void;
  onViewPost?: (postId: string) => void;
  onViewComments?: (postId: string) => void;
  onOpenProfile?: (user: User) => void;
  onOpenChat?: (user: User) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllRead,
  onNotificationClick,
  onViewPost,
  onViewComments,
  onOpenProfile,
  onOpenChat,
}) => {
  const [selectedNotifId, setSelectedNotifId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleItemClick = (notif: NotificationItem) => {
    // 1. Mark only this notification as read
    onNotificationClick(notif);
    // 2. Toggle or set selected notification details
    setSelectedNotifId((prev) => (prev === notif.id ? null : notif.id));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-16">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          className="w-full max-w-sm neu-flat rounded-[28px] p-5 bg-white shadow-2xl max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800">Notifications</h3>
              <span className="w-2 h-2 rounded-full bg-[#5B9DFF]" />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onMarkAllRead}
                className="text-[11px] font-bold text-[#5B9DFF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Read all
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full neu-raised flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                You are all caught up!
              </div>
            ) : (
              notifications.map((notif) => {
                const isSelected = selectedNotifId === notif.id;

                const getIcon = () => {
                  switch (notif.type) {
                    case 'like':
                      return <ThumbsUp className="w-3 h-3 text-[#5B9DFF] fill-[#5B9DFF]" />;
                    case 'dislike':
                      return <ThumbsDown className="w-3 h-3 text-rose-500 fill-rose-500" />;
                    case 'safety_removal':
                      return <ShieldAlert className="w-3 h-3 text-amber-600" />;
                    case 'follow':
                      return <UserPlus className="w-3 h-3 text-[#5B9DFF]" />;
                    case 'comment':
                      return <MessageCircle className="w-3 h-3 text-[#5B9DFF]" />;
                    case 'message':
                      return <MessageSquare className="w-3 h-3 text-[#5B9DFF] fill-[#5B9DFF]/20" />;
                    default:
                      return <Sparkles className="w-3 h-3 text-[#5B9DFF]" />;
                  }
                };

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={`p-3 rounded-[20px] transition cursor-pointer flex flex-col gap-2 ${
                      notif.read
                        ? 'bg-transparent opacity-85 hover:opacity-100 hover:bg-slate-50/70 border border-slate-100/60'
                        : 'neu-inset bg-blue-50/25 border border-blue-100/50'
                    }`}
                  >
                    {/* Main Row */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className="relative w-9 h-9 rounded-full neu-raised p-0.5 flex-shrink-0">
                          <img
                            src={notif.user.avatar}
                            alt={notif.user.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full rounded-full object-cover"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white shadow flex items-center justify-center">
                            {getIcon()}
                          </div>
                        </div>

                        {/* Text and Info */}
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="text-slate-800 leading-snug">
                            <span className="font-bold mr-1 text-slate-900">
                              {notif.user.name}
                            </span>
                            <span className="text-slate-600">{notif.text}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {notif.timestamp}
                            </span>
                            {!notif.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#5B9DFF] ring-2 ring-blue-100" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Optional Thumbnail or Arrow */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {notif.previewImage && (
                          <div className="w-10 h-10 rounded-[10px] overflow-hidden neu-raised flex-shrink-0">
                            <img
                              src={notif.previewImage}
                              alt="Post thumbnail"
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="text-slate-400 hover:text-slate-600 p-0.5">
                          {isSelected ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Explicit Action Buttons (Only when expanded/selected or has explicit actions) */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2"
                      >
                        {/* View Post Button */}
                        {notif.postId && (
                          <button
                            type="button"
                            onClick={() => {
                              onViewPost?.(notif.postId!);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-raised text-[11px] font-bold text-[#5B9DFF] hover:bg-blue-50/50 active:scale-95 transition cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Post</span>
                          </button>
                        )}

                        {/* View Comments Button */}
                        {notif.type === 'comment' && notif.postId && (
                          <button
                            type="button"
                            onClick={() => {
                              if (onViewComments) {
                                onViewComments(notif.postId!);
                              } else {
                                onViewPost?.(notif.postId!);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-raised text-[11px] font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition cursor-pointer"
                          >
                            <MessageCircle className="w-3 h-3 text-[#5B9DFF]" />
                            <span>View Comments</span>
                          </button>
                        )}

                        {/* Open Chat Button */}
                        {(notif.type === 'message' || notif.chatUserId) && (
                          <button
                            type="button"
                            onClick={() => {
                              onOpenChat?.(notif.user);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-raised text-[11px] font-bold text-[#5B9DFF] hover:bg-blue-50/50 active:scale-95 transition cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Open Chat</span>
                          </button>
                        )}

                        {/* Open Profile Button */}
                        {notif.user && (
                          <button
                            type="button"
                            onClick={() => {
                              onOpenProfile?.(notif.user);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-raised text-[11px] font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition cursor-pointer"
                          >
                            <UserIcon className="w-3 h-3 text-slate-500" />
                            <span>Open Profile</span>
                          </button>
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
