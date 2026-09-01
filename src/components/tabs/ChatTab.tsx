import React from 'react';
import { ChatView } from '../ChatView';
import { ChatThread, User, VoiceNoteData, MessagePrivacyMode, Message, MessageReportReason } from '../../types';

interface ChatTabProps {
  threads: ChatThread[];
  currentUser: User;
  activeChatUserId: string | null;
  onSelectThread: (threadId: string) => void;
  onBackToList: () => void;
  onBackToHome: () => void;
  onSendMessage: (receiverId: string, text?: string, imageUrl?: string, voiceNote?: VoiceNoteData, privacyMode?: MessagePrivacyMode, isForwarded?: boolean, forwardedFrom?: string) => void;
  onDeleteMessage: (threadId: string, messageId: string) => void;
  onReportMessage: (threadId: string, message: Message, reason: MessageReportReason, details?: string) => void;
  onMarkMessageSeen: (threadId: string, messageId: string) => void;
  lockedChatUserIds: string[];
  chatLockPasscode: string;
  isChatLockEnabled: boolean;
  onShowToast: (msg: string) => void;
  onOpenUserProfile: (user: User) => void;
  onToggleFollow: (userId: string) => void;
  onToggleLockChat: (userId: string) => void;
  onClearChat: (threadId: string) => void;
  onToggleReaction: (threadId: string, messageId: string, emoji: string) => void;
  onCreateGroup: (name: string, description: string, avatar: string, memberIds: string[]) => void;
  onUpdateGroup: (groupId: string, updates: any) => void;
  onLeaveGroup: (groupId: string) => void;
  allUsers: User[];
}

export const ChatTab: React.FC<ChatTabProps> = (props) => {
  return <ChatView {...props} />;
};
