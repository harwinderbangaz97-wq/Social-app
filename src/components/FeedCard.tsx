import React, { useState, useRef, useEffect } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Send,
  CheckCircle2,
  MapPin,
  X,
  Link2,
  EyeOff,
  Bell,
  BellOff,
  Flag,
  Trash2,
  Edit3,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Post, User } from '../types';

interface FeedCardProps {
  post: Post;
  currentUser: User;
  onLike: (postId: string) => void;
  onDislike?: (postId: string) => void;
  onReact?: (postId: string, reaction: 'like' | 'dislike') => void;
  onCommentClick: (post: Post) => void;
  onShareClick: (post: Post) => void;
  onOpenPost?: (post: Post) => void;
  onUserClick?: (user: User) => void;
  onAddComment?: (postId: string, text: string) => void;
  onToggleSave?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
  onHidePost?: (postId: string) => void;
  onUpdateCaption?: (postId: string, newCaption: string) => void;
  onShowToast?: (message: string) => void;
}

const FeedCardComponent: React.FC<FeedCardProps> = ({
  post,
  currentUser,
  onLike,
  onDislike,
  onReact,
  onCommentClick,
  onShareClick,
  onOpenPost,
  onUserClick,
  onAddComment,
  onToggleSave,
  onDeletePost,
  onHidePost,
  onUpdateCaption,
  onShowToast,
}) => {
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [commentInput, setCommentInput] = useState('');
  const [showLikeOverlay, setShowLikeOverlay] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editedCaption, setEditedCaption] = useState(post.caption);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const lastTapRef = useRef<number>(0);
  const tapTimeoutRef = useRef<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentUserId = currentUser?.id;
  const isOwnPost = Boolean(
    currentUserId && (post.userId === currentUserId || post.user?.id === currentUserId)
  );

  // Sync isSaved when post prop updates
  useEffect(() => {
    setIsSaved(post.isSaved || false);
  }, [post.isSaved]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowOptionsMenu(false);
      }
    };
    if (showOptionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptionsMenu]);

  // Media tap handling (Single tap -> Open Post, Double tap -> Like)
  const handleMediaTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 280;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
      if (!post.isLiked) {
        if (onReact) {
          onReact(post.id, 'like');
        } else {
          onLike(post.id);
        }
      }
      setShowLikeOverlay(true);
      setTimeout(() => setShowLikeOverlay(false), 900);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      tapTimeoutRef.current = setTimeout(() => {
        if (onOpenPost) {
          onOpenPost(post);
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handleCardClick = () => {
    if (onOpenPost) {
      onOpenPost(post);
    }
  };

  const handleQuickCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!commentInput.trim() || !onAddComment) return;
    onAddComment(post.id, commentInput.trim());
    setCommentInput('');
    if (onShowToast) {
      onShowToast('Comment posted! 💬');
    }
  };

  const handleSaveToggle = () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    if (onToggleSave) {
      onToggleSave(post.id);
    } else if (onShowToast) {
      onShowToast(nextSaved ? 'Saved to your collection! 🔖' : 'Removed from saved posts');
    }
  };

  const handleCopyLink = async () => {
    setShowOptionsMenu(false);
    const postUrl = `${window.location.origin}${window.location.pathname}#post-${post.id}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(postUrl);
      }
    } catch {
      // Fallback
    }
    if (onShowToast) {
      onShowToast('Post link copied to clipboard! 📋');
    }
  };

  const handleToggleNotifications = () => {
    setShowOptionsMenu(false);
    const nextState = !notificationsEnabled;
    setNotificationsEnabled(nextState);
    if (onShowToast) {
      onShowToast(
        nextState
          ? 'Post notifications turned on! 🔔'
          : 'Post notifications turned off'
      );
    }
  };

  const handleHide = () => {
    setShowOptionsMenu(false);
    if (onHidePost) {
      onHidePost(post.id);
    } else if (onShowToast) {
      onShowToast('Post hidden from your feed');
    }
  };

  const handleSaveEditedCaption = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateCaption) {
      onUpdateCaption(post.id, editedCaption.trim());
    }
    setIsEditingCaption(false);
    if (onShowToast) {
      onShowToast('Caption updated successfully! ✨');
    }
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    if (onDeletePost) {
      onDeletePost(post.id);
    } else if (onShowToast) {
      onShowToast('Post deleted');
    }
  };

  const handleReport = (reason: string) => {
    setShowReportDialog(false);
    if (onShowToast) {
      onShowToast(`Report submitted: ${reason}. Thank you for keeping Funshann safe.`);
    }
  };

  const isVideo = post.imageUrl.endsWith('.mp4') || post.imageUrl.startsWith('data:video');

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="w-full max-w-lg mx-auto px-3 sm:px-4 mb-4"
    >
      <div
        className="w-full bg-white rounded-[24px] border border-slate-100/90 shadow-[0_2px_14px_rgba(0,0,0,0.05)] overflow-hidden transition-all group"
      >
        {/* Author Header */}
        <div className="px-4 pt-3.5 pb-2.5 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group/user"
            onClick={(e) => {
              e.stopPropagation();
              if (onUserClick) onUserClick(post.user);
            }}
          >
            {/* Circular profile picture */}
            <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#5B9DFF] to-blue-400 overflow-hidden flex-shrink-0 transition-transform group-hover/user:scale-105">
              <img
                src={post.user.avatar}
                alt={post.user.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full rounded-full object-cover border border-white"
              />
            </div>

            {/* Username and details */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[15.5px] text-slate-900 tracking-tight group-hover/user:text-[#5B9DFF] transition-colors font-['Outfit']">
                  {post.user.name}
                </span>
                {post.user.isVerified && (
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#5B9DFF] fill-[#5B9DFF]/20" />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-slate-500">
                <span>@{post.user.username}</span>
                {post.location && (
                  <div className="relative inline-flex items-center">
                    <span className="text-slate-300 mr-1">•</span>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowLocation(!showLocation);
                      }}
                      title="Tap to view location"
                      aria-label="View post location"
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-[#5B9DFF] transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#5B9DFF]" />
                      <span className="truncate max-w-[130px]">{post.location}</span>
                    </motion.button>

                    {/* Full Location Popover on Tap */}
                    <AnimatePresence>
                      {showLocation && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.85, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.85, y: -4 }}
                          transition={{ type: 'spring', damping: 22, stiffness: 320 }}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute left-0 top-full mt-1.5 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold shadow-xl border border-white/15 whitespace-nowrap"
                        >
                          <MapPin className="w-4 h-4 text-[#5B9DFF] flex-shrink-0" />
                          <span>{post.location}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowLocation(false);
                            }}
                            className="ml-1 w-4.5 h-4.5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white/80 hover:text-white transition"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Time on right & options */}
          <div
            className="flex items-center gap-2 relative"
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[12.5px] font-medium text-slate-400 tracking-tight">
              {post.timestamp}
            </span>
            <motion.button
              type="button"
              whileTap={{ scale: 0.88 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowOptionsMenu(!showOptionsMenu);
              }}
              aria-label="Post options"
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <MoreHorizontal className="w-5.5 h-5.5" />
            </motion.button>

            {/* 3-Dot Options Action Dropdown Menu */}
            <AnimatePresence>
              {showOptionsMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-11 w-60 rounded-2xl bg-white/98 backdrop-blur-md p-1.5 z-50 border border-slate-200 shadow-2xl space-y-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Save / Unsave */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      handleSaveToggle();
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-[13.5px] font-bold text-slate-700 hover:bg-blue-50 hover:text-[#5B9DFF] flex items-center gap-2.5 transition"
                  >
                    <Bookmark
                      className={`w-4.5 h-4.5 ${
                        isSaved ? 'fill-[#5B9DFF] text-[#5B9DFF]' : 'text-slate-500'
                      }`}
                    />
                    <span>{isSaved ? 'Remove from Saved' : 'Save Post'}</span>
                  </button>

                  {/* Copy Link */}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-[13.5px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
                  >
                    <Link2 className="w-4.5 h-4.5 text-slate-500" />
                    <span>Copy Link</span>
                  </button>

                  {/* Share Post */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      onShareClick(post);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-[13.5px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
                  >
                    <Share2 className="w-4.5 h-4.5 text-slate-500" />
                    <span>Share to...</span>
                  </button>

                  {/* Post Notifications */}
                  <button
                    type="button"
                    onClick={handleToggleNotifications}
                    className="w-full px-3 py-2.5 rounded-xl text-left text-[13.5px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
                  >
                    {notificationsEnabled ? (
                      <BellOff className="w-4.5 h-4.5 text-slate-500" />
                    ) : (
                      <Bell className="w-4.5 h-4.5 text-slate-500" />
                    )}
                    <span>
                      {notificationsEnabled
                        ? 'Turn Off Notifications'
                        : 'Turn On Notifications'}
                    </span>
                  </button>

                  {/* Own Post Actions: Edit & Delete */}
                  {isOwnPost ? (
                    <>
                      <div className="h-px bg-slate-100 my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptionsMenu(false);
                          setEditedCaption(post.caption);
                          setIsEditingCaption(true);
                        }}
                        className="w-full px-3 py-2.5 rounded-xl text-left text-[13.5px] font-bold text-slate-700 hover:bg-blue-50 hover:text-[#5B9DFF] flex items-center gap-2.5 transition"
                      >
                        <Edit3 className="w-4.5 h-4.5 text-[#5B9DFF]" />
                        <span>Edit Caption</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowOptionsMenu(false);
                          setShowDeleteConfirm(true);
                        }}
                        className="w-full px-3 py-2.5 rounded-xl text-left text-[13.5px] font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-2.5 transition"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                        <span>Delete Post</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="h-px bg-slate-100 my-1" />
                      {/* Hide Post */}
                      <button
                        type="button"
                        onClick={handleHide}
                        className="w-full px-3 py-2.5 rounded-xl text-left text-[13.5px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
                      >
                        <EyeOff className="w-4.5 h-4.5 text-slate-500" />
                        <span>Not Interested / Hide</span>
                      </button>

                      {/* Report Post */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowOptionsMenu(false);
                          setShowReportDialog(true);
                        }}
                        className="w-full px-3 py-2.5 rounded-xl text-left text-[13.5px] font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-2.5 transition"
                      >
                        <Flag className="w-4.5 h-4.5 text-rose-500" />
                        <span>Report Post</span>
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Middle: 4:5 Portrait Media Content with Floating Overlaid Engagement Controls */}
        <div className="px-3 sm:px-3.5 py-1">
          <div
            className="relative w-full aspect-[4/5] rounded-[22px] overflow-hidden bg-slate-950 cursor-pointer select-none shadow-xs"
            onClick={handleMediaTap}
          >
            {isVideo ? (
              <video
                src={post.imageUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={post.imageUrl}
                alt={post.caption}
                loading="lazy"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover transition-all duration-300 ${
                  imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-102'
                }`}
              />
            )}

            {/* Floating Double-tap ThumbsUp Animation */}
            <AnimatePresence>
              {showLikeOverlay && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.3, opacity: 1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                >
                  <div className="w-18 h-18 rounded-full bg-white/75 backdrop-blur-md flex items-center justify-center shadow-2xl">
                    <ThumbsUp className="w-10 h-10 text-[#5B9DFF] fill-[#5B9DFF]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating Overlaid Engagement Controls on Right Edge (Like, Dislike, Comments, Share) */}
            <div
              className="absolute bottom-3.5 right-3 sm:right-3.5 flex flex-col items-center gap-3 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 👍 1. Like Action */}
              <motion.button
                id={`like-btn-${post.id}`}
                type="button"
                whileTap={{ scale: 0.88 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onReact) {
                    onReact(post.id, 'like');
                  } else {
                    onLike(post.id);
                  }
                }}
                aria-label={post.isLiked ? 'Unlike' : 'Like'}
                className="flex flex-col items-center gap-0.5 cursor-pointer group select-none touch-manipulation focus:outline-none"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-[0_4px_14px_rgba(0,0,0,0.35)] ${
                    post.isLiked
                      ? 'bg-[#5B9DFF] text-white ring-2 ring-white/70 shadow-[0_4px_16px_rgba(91,157,255,0.5)]'
                      : 'bg-black/40 hover:bg-black/55 text-white border border-white/30'
                  }`}
                >
                  <ThumbsUp
                    className={`w-5.5 h-5.5 transition-transform ${
                      post.isLiked
                        ? 'fill-white text-white scale-110'
                        : 'text-white group-hover:scale-110 drop-shadow-sm'
                    }`}
                  />
                </div>
                <span className="text-[12px] font-bold text-white font-['Outfit'] tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {post.likesCount.toLocaleString()}
                </span>
              </motion.button>

              {/* 👎 2. Dislike Action */}
              <motion.button
                id={`dislike-btn-${post.id}`}
                type="button"
                whileTap={{ scale: 0.88 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onReact) {
                    onReact(post.id, 'dislike');
                  } else if (onDislike) {
                    onDislike(post.id);
                  }
                }}
                aria-label={post.isDisliked ? 'Remove Dislike' : 'Dislike'}
                className="flex flex-col items-center gap-0.5 cursor-pointer group select-none touch-manipulation focus:outline-none"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-[0_4px_14px_rgba(0,0,0,0.35)] ${
                    post.isDisliked
                      ? 'bg-rose-500 text-white ring-2 ring-white/70 shadow-[0_4px_16px_rgba(244,63,94,0.5)]'
                      : 'bg-black/40 hover:bg-black/55 text-white border border-white/30'
                  }`}
                >
                  <ThumbsDown
                    className={`w-5.5 h-5.5 transition-transform ${
                      post.isDisliked
                        ? 'fill-white text-white scale-110'
                        : 'text-white group-hover:scale-110 drop-shadow-sm'
                    }`}
                  />
                </div>
                <span className="text-[12px] font-bold text-white font-['Outfit'] tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {(post.dislikesCount || 0).toLocaleString()}
                </span>
              </motion.button>

              {/* 💬 3. Comments Action */}
              <motion.button
                id={`comment-btn-${post.id}`}
                type="button"
                whileTap={{ scale: 0.88 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onCommentClick(post);
                }}
                aria-label="Comments"
                className="flex flex-col items-center gap-0.5 cursor-pointer group select-none touch-manipulation focus:outline-none"
              >
                <div className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/55 text-white border border-white/30 backdrop-blur-md flex items-center justify-center transition-all shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
                  <MessageCircle className="w-5.5 h-5.5 text-white transition-transform group-hover:scale-110 drop-shadow-sm" />
                </div>
                <span className="text-[12px] font-bold text-white font-['Outfit'] tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {post.commentsCount}
                </span>
              </motion.button>

              {/* 📤 4. Share Action */}
              <motion.button
                id={`share-btn-${post.id}`}
                type="button"
                whileTap={{ scale: 0.88 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onShareClick(post);
                }}
                aria-label="Share post"
                className="flex flex-col items-center gap-0.5 cursor-pointer group select-none touch-manipulation focus:outline-none"
              >
                <div className="w-11 h-11 rounded-full bg-black/40 hover:bg-black/55 text-white border border-white/30 backdrop-blur-md flex items-center justify-center transition-all shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
                  <Share2 className="w-5.5 h-5.5 text-white transition-transform group-hover:scale-110 drop-shadow-sm" />
                </div>
                <span className="text-[12px] font-bold text-white font-['Outfit'] tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  Share
                </span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Caption & Post Details Section Below Media */}
        <div className="px-4 pb-3.5 pt-1.5 space-y-2">
          {isEditingCaption ? (
            <form
              onSubmit={handleSaveEditedCaption}
              onClick={(e) => e.stopPropagation()}
              className="space-y-2"
            >
              <textarea
                value={editedCaption}
                onChange={(e) => setEditedCaption(e.target.value)}
                rows={2}
                className="w-full text-[14.5px] p-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-[#5B9DFF] focus:bg-white"
                placeholder="Edit your post caption..."
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingCaption(false)}
                  className="px-3.5 py-1.5 rounded-full bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-full bg-[#5B9DFF] text-white text-xs font-bold flex items-center gap-1 hover:bg-blue-600 shadow-sm"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-1.5">
              {/* Main Caption Line */}
              <div className="text-[15px] text-slate-800 leading-relaxed font-normal">
                <span
                  className="font-bold text-slate-900 mr-2 cursor-pointer hover:text-[#5B9DFF] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onUserClick) onUserClick(post.user);
                  }}
                >
                  {post.user.name}
                </span>

                {isExpanded ? (
                  <span>{post.caption}</span>
                ) : (
                  <span>
                    {post.caption.length > 75
                      ? `${post.caption.slice(0, 72)}...`
                      : post.caption}
                  </span>
                )}

                {/* Inline Read More */}
                {!isExpanded && post.caption.length > 75 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(true);
                    }}
                    className="inline-flex items-center gap-0.5 text-[13px] font-bold text-slate-400 hover:text-[#5B9DFF] ml-1.5 transition cursor-pointer"
                  >
                    <span>more</span>
                  </button>
                )}
              </div>

              {/* View Comments Link */}
              {post.comments && post.comments.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCommentClick(post);
                    }}
                    className="text-[13px] font-semibold text-slate-400 hover:text-[#5B9DFF] transition-colors cursor-pointer"
                  >
                    View all {post.comments.length} comments
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Clean, Slightly Larger Comments Input Box (Requirement 1) */}
          <form
            onSubmit={handleQuickCommentSubmit}
            onClick={(e) => e.stopPropagation()}
            className="pt-1.5 flex items-center gap-2.5"
          >
            <div className="w-8.5 h-8.5 rounded-full overflow-hidden flex-shrink-0 border border-slate-200 shadow-xs">
              <img
                src={currentUser.avatar}
                alt="Me"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Add a comment..."
                className="w-full text-[14.5px] h-11.5 pl-4 pr-11 rounded-full neu-inset text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]/40"
              />
              {commentInput.trim() && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8.5 h-8.5 rounded-full bg-[#5B9DFF] text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-blue-600 transition"
                  aria-label="Post comment"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-xs bg-white rounded-[26px] p-5 neu-flat text-center space-y-3 shadow-2xl border border-slate-100"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center neu-raised">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Delete Post?</h4>
              <p className="text-xs text-slate-500">
                This action cannot be undone and will permanently remove this post from your feed and profile.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-10 rounded-full neu-raised text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 h-10 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report Modal Dialog */}
      <AnimatePresence>
        {showReportDialog && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-xs bg-white rounded-[26px] p-5 neu-flat text-left space-y-3 shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-500">
                  <AlertTriangle className="w-4 h-4" />
                  <h4 className="text-sm font-bold text-slate-800">Report Post</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReportDialog(false)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Why are you reporting this post from @{post.user.username}?
              </p>

              <div className="space-y-1.5 pt-1">
                {[
                  'Spam or misleading',
                  'Inappropriate content',
                  'Harassment or hate speech',
                  'Intellectual property violation',
                  'Other reason',
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => handleReport(reason)}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export const FeedCard = React.memo(FeedCardComponent);
