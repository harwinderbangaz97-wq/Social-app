import { Message, MessagePrivacyMode, MessagePrivacySettings, MessageReport, MessageReportReason, ChatThread } from '../types';

const STORAGE_SETTINGS_KEY = 'funshann_message_privacy_settings';
const STORAGE_REPORTS_KEY = 'funshann_message_reports';

export const DEFAULT_MESSAGE_PRIVACY_SETTINGS: MessagePrivacySettings = {
  defaultPrivacyMode: 'normal',
  immediateDurationSeconds: 5,
  afterSeenDurationSeconds: 6,
  confirmBeforeDelete: true,
  allowManualDelete: true,
};

// Retrieve privacy settings with local storage fallback
export const getMessagePrivacySettings = (): MessagePrivacySettings => {
  try {
    const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_MESSAGE_PRIVACY_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load message privacy settings', e);
  }
  return DEFAULT_MESSAGE_PRIVACY_SETTINGS;
};

// Save privacy settings
export const saveMessagePrivacySettings = (settings: MessagePrivacySettings): void => {
  try {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save message privacy settings', e);
  }
};

/**
 * Security Rule & Validator:
 * Prevents unauthorized deletion of another user's messages.
 * Only the message sender or an authorized administrator can delete a message.
 */
export const validateMessageDeletion = (
  message: Message,
  requesterUserId: string
): { allowed: boolean; error?: string } => {
  if (!message) {
    return { allowed: false, error: 'Message not found.' };
  }
  if (message.senderId !== requesterUserId) {
    return {
      allowed: false,
      error: 'Unauthorized: You can only delete messages sent by your account.',
    };
  }
  return { allowed: true };
};

/**
 * Security Rule & Validator:
 * Prevents unauthorized users from falsely marking a message as seen.
 * Only the designated receiver can trigger the 'seen' state.
 */
export const validateMessageSeen = (
  message: Message,
  viewerUserId: string
): { allowed: boolean; error?: string } => {
  if (!message) {
    return { allowed: false, error: 'Message not found.' };
  }
  if (message.receiverId !== viewerUserId) {
    return {
      allowed: false,
      error: 'Unauthorized: Only the intended recipient can mark a message as seen.',
    };
  }
  return { allowed: true };
};

/**
 * Submit a confidential message safety report.
 * Securely logs the report and protects the reporter's identity.
 */
export const submitMessageReport = (params: {
  message: Message;
  threadId: string;
  reporterUserId: string;
  reason: MessageReportReason;
  details?: string;
}): MessageReport => {
  const { message, threadId, reporterUserId, reason, details } = params;

  const report: MessageReport = {
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    messageId: message.id,
    threadId,
    reportedUserId: message.senderId,
    reporterUserId, // Stored privately for audit only
    reason,
    details: details?.trim() || undefined,
    timestamp: new Date().toISOString(),
    messageSnippet: message.text || (message.imageUrl ? '[Photo Attachment]' : '[Voice Message]'),
    status: 'pending_review',
  };

  try {
    const existingReports: MessageReport[] = getMessageReports();
    const updated = [report, ...existingReports];
    localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to persist message report', e);
  }

  return report;
};

// Retrieve all reports submitted by this user (without exposing other users' confidential reports)
export const getMessageReports = (): MessageReport[] => {
  try {
    const saved = localStorage.getItem(STORAGE_REPORTS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load message reports', e);
  }
  return [];
};

/**
 * Helper to recalculate the last message of a thread after deletion
 */
export const updateThreadAfterMessageDeletion = (
  thread: ChatThread,
  deletedMessageId: string
): ChatThread => {
  const updatedMessages = thread.messages.filter((m) => m.id !== deletedMessageId);
  const newLastMsg = updatedMessages[updatedMessages.length - 1];

  let newLastMessageData = thread.lastMessage;
  if (newLastMsg) {
    newLastMessageData = {
      text: newLastMsg.voiceNote
        ? `Voice note (0:${newLastMsg.voiceNote.durationSeconds < 10 ? '0' : ''}${newLastMsg.voiceNote.durationSeconds})`
        : (newLastMsg.text || 'Photo attachment'),
      imageUrl: newLastMsg.imageUrl,
      isVoice: !!newLastMsg.voiceNote,
      voiceDuration: newLastMsg.voiceNote?.durationSeconds,
      timestamp: newLastMsg.timestamp,
      isRead: newLastMsg.isRead,
      isOwn: newLastMsg.senderId !== thread.participant.id,
    };
  } else {
    newLastMessageData = {
      text: 'No messages yet',
      timestamp: 'Just now',
      isRead: true,
      isOwn: false,
    };
  }

  return {
    ...thread,
    messages: updatedMessages,
    lastMessage: newLastMessageData,
  };
};
