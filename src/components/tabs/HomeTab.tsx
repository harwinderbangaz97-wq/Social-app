import React from 'react';
import { StoriesSection } from '../StoriesSection';
import { FeedCard } from '../FeedCard';
import { User, Post, Story } from '../../types';

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
}) => {
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
    </div>
  );
};
