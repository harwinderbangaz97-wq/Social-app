import React, { useState, useEffect, Component, ErrorInfo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import {
  CURRENT_USER,
  MOCK_USERS,
  INITIAL_STORIES,
  INITIAL_POSTS,
  INITIAL_CHAT_THREADS,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';
import {
  User,
  Story,
  Post,
  ChatThread,
  Message,
  VoiceNoteData,
  NotificationItem,
  TabType,
  ThemeMode,
  MessagePrivacyMode,
  MessageReportReason,
} from './types';
import {
  validateMessageDeletion,
  validateMessageSeen,
  submitMessageReport,
  updateThreadAfterMessageDeletion,
} from './data/messagePrivacyService';
import { TopAppBar } from './components/TopAppBar';
import { StoriesSection } from './components/StoriesSection';
import { FeedCard } from './components/FeedCard';
import { BottomNavigation } from './components/BottomNavigation';
import { SearchPeopleView } from './components/SearchPeopleView';
import { UploadMediaModal } from './components/UploadMediaModal';
import { ChatView } from './components/ChatView';
import { ProfileView } from './components/ProfileView';
import { StoryViewerModal } from './components/StoryViewerModal';
import { CreateStoryModal } from './components/CreateStoryModal';
import { CommentsModal } from './components/CommentsModal';
import { ShareSheetModal } from './components/ShareSheetModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { FullPostModal } from './components/FullPostModal';
import { DeviceFrame } from './components/DeviceFrame';
import { SettingsModal, SettingsSection } from './components/SettingsModal';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { PermissionAndMediaProvider, usePermissionAndMedia } from './context/PermissionAndMediaContext';
import { LanguageProvider, useTranslation } from './context/LanguageContext';
import { AndroidGestureBack } from './components/AndroidGestureBack';
import { SplashScreen } from './components/SplashScreen';
import { WelcomeAuthScreen } from './components/WelcomeAuthScreen';

function AppContent() {
  const {
    navState,
    goBack,
    navigateToTab,
    openUserProfile,
    popUserProfile,
    openChatThread,
    closeChatThread,
    openStoryViewer,
    closeStoryViewer,
    openComments,
    closeComments,
    openShareSheet,
    closeShareSheet,
    openNotifications,
    closeNotifications,
    openSettings,
    closeSettings,
    openPostPreview,
    closePostPreview,
    canGoBack,
  } = useNavigation();

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('funshann_current_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...CURRENT_USER, ...parsed };
      }
    } catch (e) {
      console.error(e);
    }
    return CURRENT_USER;
  });

  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      // Only display splash screen once during genuine cold start of the session
      const alreadyShown = sessionStorage.getItem('funshann_splash_shown');
      return alreadyShown !== 'true';
    } catch {
      return false;
    }
  });

  const handleFinishSplash = () => {
    try {
      sessionStorage.setItem('funshann_splash_shown', 'true');
    } catch (e) {
      console.error(e);
    }
    setShowSplash(false);
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const explicitAuth = localStorage.getItem('funshann_is_authenticated');
      return explicitAuth === 'true';
    } catch {
      return false;
    }
  });

  const handleAuthenticate = (userData: Partial<User>) => {
    handleUpdateCurrentUser(userData);
    try {
      localStorage.setItem('funshann_is_authenticated', 'true');
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(true);
    showToast('Welcome to Funshann! 🎉');
  };

  const handleUpdateCurrentUser = (updated: Partial<User>) => {
    setCurrentUser((prev) => {
      const nextUser = { ...prev, ...updated };
      try {
        localStorage.setItem('funshann_current_user', JSON.stringify(nextUser));
      } catch (e) {
        console.error(e);
      }
      return nextUser;
    });

    if (updated.avatar || updated.name || updated.username) {
      // Sync with posts created by current user
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.userId === currentUser.id || post.user?.id === currentUser.id) {
            return {
              ...post,
              user: {
                ...post.user,
                ...(updated.avatar ? { avatar: updated.avatar } : {}),
                ...(updated.name ? { name: updated.name } : {}),
                ...(updated.username ? { username: updated.username } : {}),
              },
            };
          }
          return post;
        })
      );
      // Sync with stories created by current user
      setStories((prevStories) =>
        prevStories.map((story) => {
          if (story.userId === currentUser.id || story.user?.id === currentUser.id) {
            return {
              ...story,
              user: {
                ...story.user,
                ...(updated.avatar ? { avatar: updated.avatar } : {}),
                ...(updated.name ? { name: updated.name } : {}),
                ...(updated.username ? { username: updated.username } : {}),
              },
            };
          }
          return story;
        })
      );
    }
  };
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(INITIAL_CHAT_THREADS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isCreatingStory, setIsCreatingStory] = useState<boolean>(false);

  // App Permissions State from central PermissionAndMediaContext
  const { permissionsState, setAllPermissions } = usePermissionAndMedia();

  // Theme Customization State (Light, Dark, Golden)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('funshann_theme');
      if (saved && ['light', 'dark', 'golden'].includes(saved)) {
        return saved as ThemeMode;
      }
      return 'light';
    } catch {
      return 'light';
    }
  });

  // Seamless Network Connectivity & Recovery Listener
  useEffect(() => {
    const handleOnline = () => {
      showToast('Connection restored 🌐');
    };

    const handleOffline = () => {
      showToast('Network change detected. Reconnecting...');
    };

    // Attach to global window object for Android WebView bridge
    (window as unknown as { __onFunshannNetworkRecovered?: () => void }).__onFunshannNetworkRecovered = () => {
      showToast('Network reconnected 🌐');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      delete (window as unknown as { __onFunshannNetworkRecovered?: () => void }).__onFunshannNetworkRecovered;
    };
  }, []);

  const handleUpdateTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('funshann_theme', newTheme);
    } catch (e) {
      console.error(e);
    }
  };

  const activeTab = navState.tab;

  const handleOpenProfile = (user: User) => {
    if (user.id === currentUser.id) {
      navigateToTab('profile');
    } else {
      const matchedUser = users.find((u) => u.id === user.id) || user;
      openUserProfile(matchedUser);
    }
  };

  const handleOpenThemeStudio = () => {
    openSettings('theme');
  };

  // Locked / Hidden Chat Privacy States
  const [lockedChatUserIds, setLockedChatUserIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('funshann_locked_chats');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [chatLockPasscode, setChatLockPasscode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('funshann_chat_pin');
      return saved || '123456';
    } catch {
      return '123456';
    }
  });

  const [isChatLockEnabled, setIsChatLockEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('funshann_chat_lock_enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const handleUpdateLockedChatUserIds = (newIds: string[]) => {
    setLockedChatUserIds(newIds);
    try {
      localStorage.setItem('funshann_locked_chats', JSON.stringify(newIds));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateChatLockPasscode = (pin: string) => {
    setChatLockPasscode(pin);
    try {
      localStorage.setItem('funshann_chat_pin', pin);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateChatLockEnabled = (enabled: boolean) => {
    setIsChatLockEnabled(enabled);
    try {
      localStorage.setItem('funshann_chat_lock_enabled', JSON.stringify(enabled));
    } catch (e) {
      console.error(e);
    }
  };

  // Floating Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Like or Dislike Reaction on a Post with Automated Community Safety Removal
  const handleReaction = (postId: string, reaction: 'like' | 'dislike') => {
    let removedPostInfo: { post: Post; authorId: string; wasRemoved: boolean } | null = null;

    setPosts((prevPosts) => {
      const target = prevPosts.find((p) => p.id === postId);
      if (!target) return prevPosts;

      let nextLikesCount = target.likesCount;
      let nextDislikesCount = target.dislikesCount || 0;
      let nextIsLiked = target.isLiked || false;
      let nextIsDisliked = target.isDisliked || false;
      let nextUserReaction = target.userReaction;

      if (reaction === 'like') {
        if (target.isLiked) {
          // User already liked -> remove like
          nextLikesCount = Math.max(0, nextLikesCount - 1);
          nextIsLiked = false;
          nextUserReaction = null;
        } else {
          // User wants to like
          nextLikesCount = nextLikesCount + 1;
          nextIsLiked = true;
          // If was disliked, remove dislike
          if (target.isDisliked) {
            nextDislikesCount = Math.max(0, nextDislikesCount - 1);
            nextIsDisliked = false;
          }
          nextUserReaction = 'like';
        }
      } else if (reaction === 'dislike') {
        if (target.isDisliked) {
          // User already disliked -> remove dislike
          nextDislikesCount = Math.max(0, nextDislikesCount - 1);
          nextIsDisliked = false;
          nextUserReaction = null;
        } else {
          // User wants to dislike
          nextDislikesCount = nextDislikesCount + 1;
          nextIsDisliked = true;
          // If was liked, remove like
          if (target.isLiked) {
            nextLikesCount = Math.max(0, nextLikesCount - 1);
            nextIsLiked = false;
          }
          nextUserReaction = 'dislike';
        }
      }

      // Check Community Post Protection rule:
      // When a post reaches 1,000 or more Likes AND Dislikes > Likes, remove post immediately.
      // Posts with < 1,000 Likes are never automatically removed under this rule.
      const shouldAutoRemove = nextLikesCount >= 1000 && nextDislikesCount > nextLikesCount;

      if (shouldAutoRemove) {
        removedPostInfo = {
          post: target,
          authorId: target.userId || target.user?.id || '',
          wasRemoved: true,
        };
        // Filter out this post from active feed
        return prevPosts.filter((p) => p.id !== postId);
      }

      // Update post in state
      return prevPosts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            likesCount: nextLikesCount,
            dislikesCount: nextDislikesCount,
            isLiked: nextIsLiked,
            isDisliked: nextIsDisliked,
            userReaction: nextUserReaction,
          };
        }
        return p;
      });
    });

    // Handle post removal notification and cleanup if auto-removed
    if (removedPostInfo && removedPostInfo.wasRemoved) {
      const { post: removedPost, authorId } = removedPostInfo;

      // Close post preview if this post was currently open
      if (navState.previewPost && navState.previewPost.id === postId) {
        closePostPreview();
      }

      // Update author postsCount if it was currentUser
      if (authorId === currentUser.id) {
        setCurrentUser((prev) => ({
          ...prev,
          postsCount: Math.max(0, prev.postsCount - 1),
        }));
      }

      // Send Community Safety Notification to post author
      const safetyNotif: NotificationItem = {
        id: `notif_safety_${Date.now()}`,
        type: 'safety_removal',
        user: {
          id: 'funshann_safety',
          name: 'Funshann Safety Team',
          username: 'safety',
          avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
          bio: 'Official Funshann Community Trust & Safety Team',
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          isFollowing: false,
        },
        text: 'Your post received more Dislikes than Likes. To protect privacy and maintain a safe community, we are removing this post from the Funshann platform.',
        timestamp: 'Just now',
        read: false,
        previewImage: removedPost.imageUrl,
      };

      setNotifications((prev) => [safetyNotif, ...prev]);
      showToast('Post removed due to community safety protection');
    }
  };

  const handleLikePost = (postId: string) => handleReaction(postId, 'like');
  const handleDislikePost = (postId: string) => handleReaction(postId, 'dislike');

  // Add Comment to Post
  const handleAddComment = (postId: string, text: string) => {
    const newComment = {
      id: `c_${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      text,
      timestamp: 'Just now',
      likesCount: 0,
      isLiked: false,
    };

    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          const updatedComments = [newComment, ...p.comments];
          return {
            ...p,
            comments: updatedComments,
            commentsCount: p.commentsCount + 1,
          };
        }
        return p;
      })
    );

    // Also update modal post if open
    if (navState.activeCommentPost && navState.activeCommentPost.id === postId) {
      openComments({
        ...navState.activeCommentPost,
        comments: [newComment, ...navState.activeCommentPost.comments],
        commentsCount: navState.activeCommentPost.commentsCount + 1,
      });
    }

    showToast('Comment posted!');
  };

  // Toggle Save Post
  const handleToggleSavePost = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          const nextSaved = !p.isSaved;
          showToast(nextSaved ? 'Saved to your collection! 🔖' : 'Removed from saved posts');
          return { ...p, isSaved: nextSaved };
        }
        return p;
      })
    );
  };

  // Delete Post
  const handleDeletePost = (postId: string) => {
    const target = posts.find((p) => p.id === postId);
    setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
    if (target && (target.userId === currentUser.id || target.user.id === currentUser.id)) {
      setCurrentUser((prev) => ({
        ...prev,
        postsCount: Math.max(0, prev.postsCount - 1),
      }));
    }
    showToast('Post deleted successfully');
  };

  // Hide Post
  const handleHidePost = (postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
    showToast('Post hidden from your feed');
  };

  // Update Post Caption
  const handleUpdateCaption = (postId: string, newCaption: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.id === postId ? { ...p, caption: newCaption } : p))
    );
  };

  // Publish New Photo Post
  const handlePublishPost = (
    newPostData: Omit<
      Post,
      'id' | 'likesCount' | 'dislikesCount' | 'commentsCount' | 'isLiked' | 'isDisliked' | 'userReaction' | 'isSaved' | 'isAutoRemoved' | 'comments' | 'timestamp'
    >
  ) => {
    const createdPost: Post = {
      ...newPostData,
      id: `post_${Date.now()}`,
      timestamp: 'Just now',
      likesCount: 1,
      dislikesCount: 0,
      commentsCount: 0,
      isLiked: true,
      isDisliked: false,
      userReaction: 'like',
      isAutoRemoved: false,
      comments: [],
    };

    setPosts([createdPost, ...posts]);
    setCurrentUser((prev) => ({
      ...prev,
      postsCount: prev.postsCount + 1,
    }));
    navigateToTab('home');
    showToast('Your photo has been shared to Funshann!');
  };

  // Follow / Unfollow user
  const handleToggleFollow = (userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === userId) {
          const isFollowing = !u.isFollowing;
          showToast(isFollowing ? `Following ${u.name}` : `Unfollowed ${u.name}`);
          return {
            ...u,
            isFollowing,
            followersCount: isFollowing ? u.followersCount + 1 : u.followersCount - 1,
          };
        }
        return u;
      })
    );
  };

  // Open Direct Chat with user
  const handleOpenDirectChat = (user: User) => {
    const existing = chatThreads.find((t) => t.participant.id === user.id);
    if (!existing) {
      const newThread: ChatThread = {
        id: `chat_${user.id}`,
        participant: user,
        lastMessage: {
          text: 'Say hello!',
          timestamp: 'Just now',
          isRead: true,
          isOwn: true,
        },
        unreadCount: 0,
        messages: [],
      };
      setChatThreads([newThread, ...chatThreads]);
    }
    navigateToTab('chat');
    openChatThread(user.id);
  };

  // Handle Notification Item Tap: Mark only that specific notification as read
  const handleNotificationClick = (notif: NotificationItem) => {
    // 1. Mark ONLY this specific tapped notification as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    // User remains in the notification list/details view.
    // Do NOT navigate automatically to Post, Profile, Chat, or Comments.
  };

  // Explicit Notification Actions (Triggered ONLY when user explicitly taps action buttons inside notification)
  const handleExplicitViewPost = (postId: string) => {
    const targetPost = posts.find((p) => p.id === postId);
    if (targetPost) {
      closeNotifications();
      openPostPreview(targetPost);
    } else {
      showToast('Post not found');
    }
  };

  const handleExplicitViewComments = (postId: string) => {
    const targetPost = posts.find((p) => p.id === postId);
    if (targetPost) {
      closeNotifications();
      openComments(targetPost);
    } else {
      showToast('Post not found');
    }
  };

  const handleExplicitOpenProfile = (user: User) => {
    closeNotifications();
    handleOpenProfile(user);
  };

  const handleExplicitOpenChat = (user: User) => {
    closeNotifications();
    handleOpenDirectChat(user);
  };

  // Send Message in Chat (Supports Normal, Immediate Vanish, and Delete After Seen)
  const handleSendMessage = (
    receiverId: string,
    text?: string,
    imageUrl?: string,
    voiceNote?: VoiceNoteData,
    privacyMode: MessagePrivacyMode = 'normal'
  ) => {
    const newMsg: Message = {
      id: `m_${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      text,
      imageUrl,
      voiceNote,
      timestamp: 'Just now',
      isRead: true,
      privacyMode,
      createdAt: Date.now(),
      disappearingSeconds: privacyMode === 'immediate' ? 5 : (privacyMode === 'after_seen' ? 6 : undefined),
    };

    setChatThreads((prevThreads) =>
      prevThreads.map((thread) => {
        if (thread.participant.id === receiverId || thread.id === receiverId) {
          return {
            ...thread,
            lastMessage: {
              text: voiceNote ? `Voice note (0:${voiceNote.durationSeconds < 10 ? '0' : ''}${voiceNote.durationSeconds})` : (text || 'Photo attachment'),
              imageUrl,
              isVoice: !!voiceNote,
              voiceDuration: voiceNote?.durationSeconds,
              timestamp: 'Just now',
              isRead: true,
              isOwn: true,
            },
            messages: [...thread.messages, newMsg],
          };
        }
        return thread;
      })
    );

    // Simulate natural reply after 1.4 seconds
    setTimeout(() => {
      const isVoiceResponse = !!voiceNote && Math.random() > 0.4;

      let replyMsg: Message;
      let lastMsgPreview: {
        text: string;
        isVoice?: boolean;
        voiceDuration?: number;
      };

      if (isVoiceResponse) {
        const simulatedSecs = Math.floor(Math.random() * 8) + 6;
        replyMsg = {
          id: `m_reply_${Date.now()}`,
          senderId: receiverId,
          receiverId: currentUser.id,
          voiceNote: {
            durationSeconds: simulatedSecs,
            waveform: [20, 50, 75, 40, 85, 90, 60, 45, 70, 95, 65, 35, 20],
          },
          timestamp: 'Just now',
          isRead: false,
          privacyMode: 'normal',
        };
        lastMsgPreview = {
          text: `Voice note (0:${simulatedSecs < 10 ? '0' : ''}${simulatedSecs})`,
          isVoice: true,
          voiceDuration: simulatedSecs,
        };
      } else {
        const friendReplies = voiceNote
          ? [
              'Got your voice note! Love the creative direction on this.',
              'Hearing your voice made my day! The acoustic quality is so crisp.',
              'Sounds like a solid plan! Let me prep the sketches.',
            ]
          : [
              'Awesome composition! Really love the soft 3D tones.',
              'Looks fantastic! Funshann is so smooth.',
              'Thanks for sharing! Let me check the details.',
              'Super clean aesthetic! 💙',
            ];
        const randomReply = friendReplies[Math.floor(Math.random() * friendReplies.length)];

        replyMsg = {
          id: `m_reply_${Date.now()}`,
          senderId: receiverId,
          receiverId: currentUser.id,
          text: randomReply,
          timestamp: 'Just now',
          isRead: false,
          privacyMode: 'normal',
        };
        lastMsgPreview = {
          text: randomReply,
          isVoice: false,
        };
      }

      setChatThreads((prevThreads) =>
        prevThreads.map((thread) => {
          if (thread.participant.id === receiverId || thread.id === receiverId) {
            return {
              ...thread,
              lastMessage: {
                text: lastMsgPreview.text,
                isVoice: lastMsgPreview.isVoice,
                voiceDuration: lastMsgPreview.voiceDuration,
                timestamp: 'Just now',
                isRead: false,
                isOwn: false,
              },
              messages: [...thread.messages, replyMsg],
            };
          }
          return thread;
        })
      );
    }, 1400);
  };

  // Delete message for everyone in a thread
  const handleDeleteMessage = (threadId: string, messageId: string) => {
    setChatThreads((prevThreads) =>
      prevThreads.map((thread) => {
        if (thread.id === threadId || thread.participant.id === threadId) {
          return updateThreadAfterMessageDeletion(thread, messageId);
        }
        return thread;
      })
    );
  };

  // Mark message as seen by recipient and timestamp it
  const handleMarkMessageSeen = (threadId: string, messageId: string) => {
    setChatThreads((prevThreads) =>
      prevThreads.map((thread) => {
        if (thread.id === threadId || thread.participant.id === threadId) {
          const updatedMessages = thread.messages.map((m) => {
            if (m.id === messageId && !m.isRead) {
              return {
                ...m,
                isRead: true,
                seenAt: Date.now(),
              };
            }
            return m;
          });
          return {
            ...thread,
            unreadCount: 0,
            messages: updatedMessages,
          };
        }
        return thread;
      })
    );
  };

  // Report message handler
  const handleReportMessage = (
    threadId: string,
    message: Message,
    reason: MessageReportReason,
    details?: string
  ) => {
    submitMessageReport({
      message,
      threadId,
      reporterUserId: currentUser.id,
      reason,
      details,
    });

    showToast('Report submitted confidentially. Our safety team is reviewing.');
  };

  // Clear conversation messages for a specific user thread
  const handleClearChatThread = (participantUserId: string) => {
    setChatThreads((prevThreads) =>
      prevThreads.map((thread) => {
        if (thread.participant.id === participantUserId || thread.id === participantUserId) {
          return {
            ...thread,
            messages: [],
            lastMessage: {
              text: 'Chat cleared',
              timestamp: 'Just now',
              isRead: true,
              isOwn: true,
            },
            unreadCount: 0,
          };
        }
        return thread;
      })
    );
    showToast('Chat history cleared');
  };

  // Toggle individual user chat lock / vault status
  const handleToggleLockChat = (targetUserId: string) => {
    const isCurrentlyLocked = lockedChatUserIds.includes(targetUserId);
    let updatedIds: string[];
    if (isCurrentlyLocked) {
      updatedIds = lockedChatUserIds.filter((id) => id !== targetUserId);
      showToast('Chat unlocked');
    } else {
      updatedIds = [...lockedChatUserIds, targetUserId];
      showToast('Chat locked & moved to Secret Vault 🔒');
    }
    handleUpdateLockedChatUserIds(updatedIds);
  };

  // Add Story trigger
  const handleAddStory = () => {
    setIsCreatingStory(true);
  };

  const handlePublishStory = (newStory: Story) => {
    setStories((prev) => [newStory, ...prev]);
    showToast('Your new story has been added! ✨');
    openStoryViewer(0);
  };

  // Profile data resolution from navigation history
  const currentProfileUser = navState.profileHistory && navState.profileHistory.length > 0
    ? navState.profileHistory[navState.profileHistory.length - 1]
    : null;

  const activeUser = currentUser || CURRENT_USER;
  const displayedProfileUser = currentProfileUser
    ? (users.find((u) => u.id === currentProfileUser.id) || currentProfileUser)
    : activeUser;

  const currentUserId = activeUser.id;
  const displayedUserId = displayedProfileUser?.id || currentUserId;

  const profileUserPosts = displayedUserId === currentUserId
    ? posts.filter((p) => (p.userId && p.userId === currentUserId) || (p.user && p.user.id === currentUserId))
    : posts.filter((p) => (p.userId && p.userId === displayedUserId) || (p.user && p.user.id === displayedUserId));

  const userPosts = profileUserPosts.length > 0
    ? profileUserPosts
    : (displayedUserId === currentUserId ? posts.slice(0, 3) : []);
  const savedPosts = posts.filter((p) => p.isSaved);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const unreadMessagesCount = chatThreads
    .filter((t) => !(isChatLockEnabled && lockedChatUserIds.includes(t.participant.id)))
    .reduce((acc, t) => acc + t.unreadCount, 0);

  const handleLogout = () => {
    setCurrentUser(CURRENT_USER);
    try {
      localStorage.removeItem('funshann_current_user');
      localStorage.setItem('funshann_is_authenticated', 'false');
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(false);
    showToast('Logged out successfully');
  };

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onFinish={handleFinishSplash} />
        )}
      </AnimatePresence>

      {!showSplash && !isAuthenticated ? (
        <WelcomeAuthScreen onAuthenticate={handleAuthenticate} theme={theme} />
      ) : (
        !showSplash && (
          <DeviceFrame theme={theme} onThemeChange={handleUpdateTheme}>
      {/* Android Native Edge Swipe Back Handler & Visual Indicator */}
      <AndroidGestureBack onBack={goBack} canGoBack={canGoBack} />

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full neu-active-blue text-white text-xs font-bold shadow-xl flex items-center gap-2 pointer-events-none"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top App Bar - hidden when in full-screen ChatActivity */}
      {activeTab !== 'chat' && (
        <TopAppBar
          unreadNotificationsCount={unreadNotificationsCount}
          unreadMessagesCount={unreadMessagesCount}
          onOpenNotifications={openNotifications}
          onOpenChat={() => {
            navigateToTab('chat');
          }}
          onLogoClick={() => navigateToTab('home')}
        />
      )}

      {/* Main Tab Views */}
      <main className="w-full">
            {/* Tab 1: Home Feed */}
            {activeTab === 'home' && (
              <div className="w-full pb-28 pt-1">
                {/* Stories Section (Horizontal Scroll) */}
                <StoriesSection
                  stories={stories}
                  currentUser={currentUser}
                  onSelectStory={(index) => openStoryViewer(index)}
                  onAddStory={handleAddStory}
                />

                {/* Feed Cards Section */}
                <div className="mt-3">
                  {posts.map((post) => (
                    <FeedCard
                      key={post.id}
                      post={post}
                      currentUser={currentUser}
                      onLike={handleLikePost}
                      onDislike={handleDislikePost}
                      onReact={handleReaction}
                      onCommentClick={(p) => openComments(p)}
                      onShareClick={(p) => openShareSheet(p)}
                      onOpenPost={openPostPreview}
                      onUserClick={handleOpenProfile}
                      onAddComment={handleAddComment}
                      onToggleSave={handleToggleSavePost}
                      onDeletePost={handleDeletePost}
                      onHidePost={handleHidePost}
                      onUpdateCaption={handleUpdateCaption}
                      onShowToast={showToast}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Search / Discover People */}
            {activeTab === 'search' && (
              <SearchPeopleView
                users={users}
                onToggleFollow={handleToggleFollow}
                onOpenDirectChat={handleOpenDirectChat}
                onUserSelect={handleOpenProfile}
                onShowToast={showToast}
              />
            )}

            {/* Tab 3: Upload Photos */}
            {activeTab === 'upload' && (
              <UploadMediaModal
                currentUser={currentUser}
                onClose={goBack}
                onPublishPost={handlePublishPost}
              />
            )}

            {/* Tab 4: 1-on-1 Direct Chat (Full-Screen ChatActivity) */}
            {activeTab === 'chat' && (
              <ChatView
                threads={chatThreads}
                currentUser={currentUser}
                activeChatUserId={navState.activeChatUserId}
                onSelectThread={(threadId) => openChatThread(threadId)}
                onBackToList={closeChatThread}
                onBackToHome={goBack}
                onSendMessage={handleSendMessage}
                onDeleteMessage={handleDeleteMessage}
                onReportMessage={handleReportMessage}
                onMarkMessageSeen={handleMarkMessageSeen}
                lockedChatUserIds={lockedChatUserIds}
                chatLockPasscode={chatLockPasscode}
                isChatLockEnabled={isChatLockEnabled}
                onShowToast={showToast}
                onOpenUserProfile={handleOpenProfile}
                onToggleFollow={handleToggleFollow}
                onToggleLockChat={handleToggleLockChat}
                onClearChat={handleClearChatThread}
              />
            )}

            {/* Tab 5: Profile */}
            {activeTab === 'profile' && (
              <ProfileView
                currentUser={currentUser}
                profileUser={currentProfileUser ? displayedProfileUser : null}
                userPosts={userPosts}
                savedPosts={savedPosts.length > 0 ? savedPosts : posts.slice(1, 4)}
                onOpenSettings={() => openSettings('main')}
                onOpenThemeStudio={handleOpenThemeStudio}
                onUpdateUser={(updated) => {
                  handleUpdateCurrentUser(updated);
                }}
                theme={theme}
                onUpdateTheme={handleUpdateTheme}
                onShowToast={showToast}
                onBack={popUserProfile}
                onToggleFollow={handleToggleFollow}
                onOpenDirectChat={handleOpenDirectChat}
                lockedChatUserIds={lockedChatUserIds}
                onToggleLockChat={handleToggleLockChat}
                onClearChat={handleClearChatThread}
              />
            )}
          </main>

          {/* Floating Bottom Navigation (Hidden when in full-screen ChatActivity) */}
          {activeTab !== 'chat' && (
            <BottomNavigation
              activeTab={activeTab}
              onTabChange={(tab) => {
                navigateToTab(tab);
              }}
              unreadChatCount={unreadMessagesCount}
            />
          )}

          {/* Interactive Story Viewer Modal */}
          {navState.selectedStoryIndex !== null && (
            <StoryViewerModal
              stories={stories}
              initialIndex={navState.selectedStoryIndex}
              isOpen={navState.selectedStoryIndex !== null}
              currentUser={currentUser}
              onClose={closeStoryViewer}
              onSendReply={(storyUserId, text) => {
                handleSendMessage(storyUserId, text);
                showToast('Reply sent to direct messages!');
                closeStoryViewer();
              }}
              onUserClick={handleOpenProfile}
            />
          )}

          {/* Comments Drawer Modal */}
          <CommentsModal
            post={navState.activeCommentPost}
            currentUser={currentUser}
            isOpen={navState.activeCommentPost !== null}
            onClose={closeComments}
            onAddComment={handleAddComment}
            onUserClick={handleOpenProfile}
            onShowToast={showToast}
          />

          {/* Share Sheet Modal */}
          <ShareSheetModal
            post={navState.activeSharePost}
            users={users}
            isOpen={navState.activeSharePost !== null}
            onClose={closeShareSheet}
            onSendToContact={(userName) => {
              showToast(`Shared post with ${userName}!`);
            }}
          />

          {/* Notification Drawer */}
          <NotificationDrawer
            notifications={notifications}
            isOpen={navState.isNotificationOpen}
            onClose={closeNotifications}
            onMarkAllRead={() => {
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
              showToast('All notifications marked as read');
            }}
            onNotificationClick={handleNotificationClick}
            onViewPost={handleExplicitViewPost}
            onViewComments={handleExplicitViewComments}
            onOpenProfile={handleExplicitOpenProfile}
            onOpenChat={handleExplicitOpenChat}
          />

          {/* Settings & Preferences Modal */}
          <SettingsModal
            isOpen={navState.isSettingsOpen}
            initialSection={navState.settingsSection || 'main'}
            currentUser={currentUser}
            onClose={closeSettings}
            onUpdateUser={(updated) => {
              setCurrentUser((prev) => ({ ...prev, ...updated }));
            }}
            onShowToast={showToast}
            onResetData={() => {
              setCurrentUser(CURRENT_USER);
            }}
            users={users}
            chatThreads={chatThreads}
            onDeleteChatThreads={(ids) => {
              setChatThreads((prev) => prev.filter((t) => !ids.includes(t.id)));
            }}
            lockedChatUserIds={lockedChatUserIds}
            chatLockPasscode={chatLockPasscode}
            isChatLockEnabled={isChatLockEnabled}
            onUpdateLockedChatUserIds={handleUpdateLockedChatUserIds}
            onUpdateChatLockPasscode={handleUpdateChatLockPasscode}
            onUpdateChatLockEnabled={handleUpdateChatLockEnabled}
            theme={theme}
            onUpdateTheme={handleUpdateTheme}
            onLogout={handleLogout}
            permissionsState={permissionsState}
            onUpdatePermissions={setAllPermissions}
          />

          {/* Add / Create Story Modal */}
          <CreateStoryModal
            isOpen={isCreatingStory}
            onClose={() => setIsCreatingStory(false)}
            currentUser={currentUser}
            onPublishStory={handlePublishStory}
            onShowToast={showToast}
          />

          {/* Full Post View Modal with Android Back and In-Screen Back Support */}
          <FullPostModal
            post={posts.find((p) => p.id === navState.previewPost?.id) || navState.previewPost}
            currentUser={currentUser}
            isOpen={navState.previewPost !== null}
            onClose={closePostPreview}
            onLike={handleLikePost}
            onDislike={handleDislikePost}
            onReact={handleReaction}
            onAddComment={handleAddComment}
            onShareClick={(p) => openShareSheet(p)}
            onUserClick={handleOpenProfile}
            onToggleSave={handleToggleSavePost}
            onDeletePost={handleDeletePost}
            onHidePost={handleHidePost}
            onUpdateCaption={handleUpdateCaption}
            onShowToast={showToast}
          />
          </DeviceFrame>
        )
      )}
    </>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    try {
      sessionStorage.setItem('funshann_splash_shown', 'true');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#f4f7fb] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-[#5B9DFF] shadow-md">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2 font-['Outfit']">Funshann</h1>
          <p className="text-sm text-slate-500 max-w-xs mb-6">
            Something unexpected occurred. Tap below to refresh the experience.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="px-6 py-3 rounded-2xl neu-active-blue text-white font-bold text-sm shadow-lg hover:brightness-105 active:scale-95 transition-all"
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <PermissionAndMediaProvider>
          <NavigationProvider>
            <AppContent />
          </NavigationProvider>
        </PermissionAndMediaProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
