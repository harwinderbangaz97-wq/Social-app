import React, { useEffect, useRef } from 'react';
import { StoriesSection } from '../StoriesSection';
import { FeedCard } from '../FeedCard';
import { User, Post, Story } from '../../types';
import { Loader2 } from 'lucide-react';

interface HomeTabProps {
  stories: Story[];
  currentUser: User;
  posts: Post[];
  onSelectStory: (index: number) => void;
  onAddStory: () => void;
  onLike: (postId: string) => void;
  onDislike: (postId: string) => void;
  onReact: (postId: string, reaction: 'like' | 'dislike') => void;
  onCommentClick: (post: Post) => void;
  onShareClick: (post: Post) => void;
  onOpenPost: (post: Post) => void;
  onUserClick: (user: User) => void;
  onAddComment: (postId: string, text: string) => void;
  onToggleSave: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onHidePost: (postId: string) => void;
  onUpdateCaption: (postId: string, caption: string) => void;
  onShowToast: (msg: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  stories,
  currentUser,
  posts,
  onSelectStory,
  onAddStory,
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
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '400px' }
    );

    const el = sentinelRef.current;
    if (el) {
      observer.observe(el);
    }
    return () => {
      if (el) {
        observer.unobserve(el);
      }
    };
  }, [onLoadMore, hasMore, isLoadingMore]);

  return (
    <div className="w-full pb-28 pt-1">
      <StoriesSection
        stories={stories}
        currentUser={currentUser}
        onSelectStory={onSelectStory}
        onAddStory={onAddStory}
      />
      <div className="mt-3">
        {posts.map((post) => (
          <FeedCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onLike={onLike}
            onDislike={onDislike}
            onReact={onReact}
            onCommentClick={onCommentClick}
            onShareClick={onShareClick}
            onOpenPost={onOpenPost}
            onUserClick={onUserClick}
            onAddComment={onAddComment}
            onToggleSave={onToggleSave}
            onDeletePost={onDeletePost}
            onHidePost={onHidePost}
            onUpdateCaption={onUpdateCaption}
            onShowToast={onShowToast}
          />
        ))}
      </div>

      {/* Infinite scroll sentinel and subtle loader */}
      <div ref={sentinelRef} className="w-full py-4 flex items-center justify-center">
        {isLoadingMore && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-[#5B9DFF]" />
            <span>Loading more posts...</span>
          </div>
        )}
      </div>
    </div>
  );
};
