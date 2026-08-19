import React, { useState } from 'react';
import { X, Send, Heart, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Post, User } from '../types';

interface CommentsModalProps {
  post: Post | null;
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (postId: string, text: string) => void;
  onUserClick?: (user: User) => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  post,
  currentUser,
  isOpen,
  onClose,
  onAddComment,
  onUserClick,
}) => {
  const [commentText, setCommentText] = useState('');
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});

  if (!isOpen || !post) return null;

  const handleUserSelect = (user: User) => {
    if (onUserClick) {
      onUserClick(user);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim());
    setCommentText('');
  };

  const handleToggleCommentLike = (commentId: string) => {
    setLikedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="w-full max-w-lg neu-flat rounded-t-[32px] sm:rounded-[32px] max-h-[88vh] h-[580px] flex flex-col p-5 bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100/90">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800 font-['Outfit']">
                Comments
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#5B9DFF]/15 text-[#5B9DFF] text-xs font-bold">
                {post.comments.length}
              </span>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </motion.button>
          </div>

          {/* Original Post mini summary */}
          <div className="py-3 px-1 flex items-start gap-3 border-b border-slate-100">
            <div
              onClick={() => handleUserSelect(post.user)}
              className="w-9 h-9 rounded-full neu-raised p-0.5 flex-shrink-0 cursor-pointer hover:scale-105 transition"
            >
              <img
                src={post.user.avatar}
                alt={post.user.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="flex-1 text-xs">
              <span
                onClick={() => handleUserSelect(post.user)}
                className="font-bold text-slate-900 mr-1.5 cursor-pointer hover:text-[#5B9DFF] transition"
              >
                {post.user.name}
              </span>
              <span className="text-slate-700">{post.caption}</span>
              <div className="text-[11px] text-slate-400 mt-1">{post.timestamp}</div>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-3.5">
            {post.comments.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No comments yet. Be the first to share your thoughts!
              </div>
            ) : (
              post.comments.map((comment) => {
                const isCommentLiked = likedComments[comment.id] || comment.isLiked;
                return (
                  <div
                    key={comment.id}
                    className="flex items-start justify-between gap-3 px-1"
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div
                        onClick={() => handleUserSelect(comment.user)}
                        className="w-8.5 h-8.5 rounded-full neu-raised p-0.5 flex-shrink-0 cursor-pointer hover:scale-105 transition"
                      >
                        <img
                          src={comment.user.avatar}
                          alt={comment.user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            onClick={() => handleUserSelect(comment.user)}
                            className="text-xs font-bold text-slate-800 cursor-pointer hover:text-[#5B9DFF] transition"
                          >
                            {comment.user.name}
                          </span>
                          {comment.user.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#5B9DFF] fill-[#5B9DFF]/20" />
                          )}
                          <span className="text-[10px] text-slate-400 ml-1">
                            {comment.timestamp}
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-700 mt-0.5 leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label="Like comment"
                      onClick={() => handleToggleCommentLike(comment.id)}
                      className="flex flex-col items-center text-slate-400 hover:text-rose-500 pt-1 transition"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isCommentLiked ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                      {(comment.likesCount > 0 || isCommentLiked) && (
                        <span className="text-[10px] font-bold mt-0.5 text-slate-500">
                          {comment.likesCount + (isCommentLiked && !comment.isLiked ? 1 : 0)}
                        </span>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Slightly Larger, Clean Comments Input Field (Requirement 1) */}
          <form
            onSubmit={handleSubmit}
            className="pt-3 flex items-center gap-2.5 border-t border-slate-100/90"
          >
            <div className="w-9 h-9 rounded-full neu-raised overflow-hidden flex-shrink-0">
              <img
                src={currentUser.avatar}
                alt="Me"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full text-sm h-12 pl-4 pr-12 rounded-full neu-inset text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]/40"
              />
              <motion.button
                type="submit"
                disabled={!commentText.trim()}
                whileTap={{ scale: 0.9 }}
                className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  commentText.trim()
                    ? 'neu-active-blue text-white shadow-md cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
                aria-label="Send comment"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
