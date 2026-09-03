import React from 'react';
import { ProfileView } from '../ProfileView';
import { User, Post, ThemeMode } from '../../types';

interface ProfileTabProps {
  currentUser: User;
  profileUser: User | null;
  userPosts: Post[];
  savedPosts: Post[];
  onOpenSettings: () => void;
  onOpenThemeStudio: () => void;
  onUpdateUser: (updated: Partial<User>) => void;
  theme: ThemeMode;
  onUpdateTheme: (theme: ThemeMode) => void;
  onShowToast: (msg: string) => void;
  onBack: () => void;
  onToggleFollow: (userId: string) => void;
  onOpenDirectChat: (user: User) => void;
  lockedChatUserIds: string[];
  onToggleLockChat: (userId: string) => void;
  onClearChat: (threadId: string) => void;
  allUsers?: User[];
  onUserClick?: (user: User) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = (props) => {
  return <ProfileView {...props} />;
};
