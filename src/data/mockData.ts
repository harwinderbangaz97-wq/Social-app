import { User, Story, Post, ChatThread, NotificationItem } from '../types';

export const CURRENT_USER: User = {
  id: '',
  name: '',
  username: '',
  avatar: '',
  bio: '',
  location: '',
  website: '',
  interests: [],
  socialLinks: [],
  birthday: '',
  mobileNumber: '',
  email: '',
  twoFactorEnabled: false,
  twoFactorMethod: 'authenticator',
  usernameLastChangedAt: new Date().toISOString(),
  postsCount: 0,
  followersCount: 0,
  followingCount: 0,
  isVerified: false,
  isOnline: false,
};

export const MOCK_USERS: User[] = [];

export const INITIAL_STORIES: Story[] = [];

export const INITIAL_POSTS: Post[] = [];

export const INITIAL_CHAT_THREADS: ChatThread[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
