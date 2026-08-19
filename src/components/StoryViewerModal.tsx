import React, { useState, useEffect } from 'react';
import { X, Heart, Send, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Story, User } from '../types';

interface StoryViewerModalProps {
  stories: Story[];
  initialIndex: number;
  isOpen: boolean;
  currentUser: User;
  onClose: () => void;
  onSendReply?: (storyUserId: string, text: string) => void;
  onUserClick?: (user: User) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialIndex,
  isOpen,
  currentUser,
  onClose,
  onSendReply,
  onUserClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [liked, setLiked] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setProgress(0);
      setLiked(false);
      setReplyText('');
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (!isOpen || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 1.5;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [isOpen, isPaused, currentIndex, stories.length, onClose]);

  if (!isOpen || !stories[currentIndex]) return null;

  const currentStory = stories[currentIndex];

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
      setLiked(false);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
      setLiked(false);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    if (!liked) {
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 800);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (onSendReply) {
      onSendReply(currentStory.userId, replyText);
    }
    setReplyText('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-0 sm:p-4">
        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-sm h-full sm:h-[840px] max-h-[95vh] bg-black sm:rounded-[32px] overflow-hidden flex flex-col justify-between shadow-2xl"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Background Story Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={currentStory.mediaUrl}
              alt="Story"
              className="w-full h-full object-cover"
            />
            {/* Top & Bottom gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
          </div>

          {/* Heart Pop Animation */}
          <AnimatePresence>
            {showHeartAnim && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.4, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
              >
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Heart className="w-16 h-16 text-[#5B9DFF] fill-[#5B9DFF]" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top Progress Bars & Header */}
          <div className="relative z-10 px-4 pt-4 pb-2">
            {/* Progress Bars */}
            <div className="flex gap-1.5 mb-3">
              {stories.map((s, idx) => (
                <div
                  key={s.id}
                  className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                    style={{
                      width:
                        idx === currentIndex
                          ? `${progress}%`
                          : idx < currentIndex
                          ? '100%'
                          : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* User Info Bar */}
            <div className="flex items-center justify-between">
              <div
                onClick={() => {
                  if (onUserClick) {
                    onUserClick(currentStory.user);
                    onClose();
                  }
                }}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-full ring-2 ring-[#5B9DFF] p-0.5 overflow-hidden bg-white shadow group-hover:scale-105 transition-transform">
                  <img
                    src={currentStory.user.avatar}
                    alt={currentStory.user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-white tracking-wide group-hover:underline">
                      {currentStory.user.name}
                    </span>
                    {currentStory.user.isVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#5B9DFF] fill-white" />
                    )}
                  </div>
                  <span className="text-xs text-white/70">
                    {currentStory.timestamp}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                id="close-story-btn"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Left/Right Tap Target Zones */}
          <div className="absolute inset-y-16 inset-x-0 z-10 flex">
            <button
              onClick={handlePrev}
              aria-label="Previous Story"
              className="w-1/3 h-full cursor-pointer focus:outline-none flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center">
                <ChevronLeft className="w-5 h-5" />
              </div>
            </button>
            <div className="w-1/3 h-full" />
            <button
              onClick={handleNext}
              aria-label="Next Story"
              className="w-1/3 h-full cursor-pointer focus:outline-none flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center">
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          </div>

          {/* Bottom Story Caption & Reply Field */}
          <div className="relative z-20 px-4 pb-6 pt-3 space-y-3">
            {currentStory.caption && (
              <p className="text-sm font-medium text-white/95 drop-shadow-md text-center">
                {currentStory.caption}
              </p>
            )}

            <form onSubmit={handleSend} className="flex items-center gap-2.5">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${currentStory.user.name}...`}
                  className="w-full h-11 pl-4 pr-10 text-sm text-white placeholder-white/60 bg-white/20 backdrop-blur-lg rounded-full border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]/60"
                />
                {replyText.trim() && (
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#5B9DFF] text-white flex items-center justify-center"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Like Button */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={handleLike}
                className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-lg border transition-all ${
                  liked
                    ? 'bg-[#5B9DFF] text-white border-[#5B9DFF]'
                    : 'bg-white/20 text-white border-white/20 hover:bg-white/30'
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    liked ? 'fill-white text-white' : 'text-white'
                  }`}
                />
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
