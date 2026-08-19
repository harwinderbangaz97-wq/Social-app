import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Post, User } from '../types';

interface FullPostModalProps {
  post: Post | null;
  currentUser?: User;
  isOpen: boolean;
  onClose: () => void;
  onLike?: (postId: string) => void;
  onDislike?: (postId: string) => void;
  onReact?: (postId: string, reaction: 'like' | 'dislike') => void;
  onAddComment?: (postId: string, text: string) => void;
  onShareClick?: (post: Post) => void;
  onUserClick?: (user: User) => void;
  onToggleSave?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
  onHidePost?: (postId: string) => void;
  onUpdateCaption?: (postId: string, newCaption: string) => void;
  onShowToast?: (message: string) => void;
}

export const FullPostModal: React.FC<FullPostModalProps> = ({
  post,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !post) return null;

  const isVideo =
    post.imageUrl.endsWith('.mp4') ||
    post.imageUrl.startsWith('data:video') ||
    post.imageUrl.includes('video');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-0 md:p-6 select-none overflow-hidden"
        onClick={onClose}
      >
        {/* Simple Top Back / Close Button */}
        <div className="absolute top-4 left-4 z-20">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition cursor-pointer shadow-lg"
            aria-label="Back / Close"
          >
            <ArrowLeft className="w-5.5 h-5.5" />
          </motion.button>
        </div>

        {/* Media Container */}
        <div
          className="relative w-full h-full flex items-center justify-center p-4 md:p-12 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {isVideo ? (
            <video
              src={post.imageUrl}
              controls
              autoPlay
              loop
              playsInline
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            />
          ) : (
            <img
              src={post.imageUrl}
              alt={post.caption || 'Post image'}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl select-none"
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
