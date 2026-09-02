import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { db, auth, ensureFirebaseAuth } from './firebase';
import { Message, ChatThread, User, VoiceNoteData, MessagePrivacyMode } from '../types';

/**
 * Deterministic Chat Room ID Generator for any user pair
 * Ensures both users connect to the exact same Firestore document & subcollection:
 * chats/{chatId}/messages
 */
export const getChatRoomId = (userA: string, userB: string): string => {
  if (!userA || !userB) return '';
  return [userA.trim(), userB.trim()].sort().join('_');
};

/**
 * Normalizes a raw Firestore message document into our typed Message interface
 */
export const normalizeMessage = (id: string, raw: any): Message => {
  let createdAt = Date.now();
  if (typeof raw?.createdAt === 'number') {
    createdAt = raw.createdAt;
  } else if (raw?.createdAtServer instanceof Timestamp) {
    createdAt = raw.createdAtServer.toMillis();
  } else if (raw?.timestamp && typeof raw.timestamp === 'number') {
    createdAt = raw.timestamp;
  }

  return {
    id: id || raw?.id || `m_${Date.now()}`,
    senderId: raw?.senderId || '',
    receiverId: raw?.receiverId || '',
    text: raw?.text || undefined,
    imageUrl: raw?.imageUrl || undefined,
    voiceNote: raw?.voiceNote || undefined,
    timestamp: raw?.timestampStr || 'Just now',
    isRead: Boolean(raw?.isRead),
    privacyMode: raw?.privacyMode || 'normal',
    createdAt,
    disappearingSeconds: raw?.disappearingSeconds,
    isForwarded: Boolean(raw?.isForwarded),
    forwardedFrom: raw?.forwardedFrom,
    reactions: Array.isArray(raw?.reactions) ? raw.reactions : [],
    isDelivered: raw?.isDelivered !== undefined ? raw.isDelivered : true,
  };
};

/**
 * Real-time listener for messages in chats/{chatId}/messages sorted by createdAt/timestamp ascending
 */
export const subscribeToChatMessages = (
  chatId: string,
  callback: (messages: Message[]) => void
): Unsubscribe => {
  if (!chatId) return () => {};

  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        const messages: Message[] = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const normalized = normalizeMessage(docSnap.id, data);
            normalized.isDelivered = !docSnap.metadata.hasPendingWrites;
            messages.push(normalized);
          }
        });
        callback(messages);
      },
      (error) => {
        console.warn('Real-time chat messages listener warning:', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn('Failed to initialize onSnapshot listener for chat messages:', error);
    return () => {};
  }
};

/**
 * Sends a message in the 1-on-1 chat room: chats/{chatId}/messages
 */
export const sendChatMessage = async (
  senderId: string,
  receiverId: string,
  payload: {
    text?: string;
    imageUrl?: string;
    voiceNote?: VoiceNoteData;
    privacyMode?: MessagePrivacyMode;
    isForwarded?: boolean;
    forwardedFrom?: string;
  }
): Promise<Message> => {
  await ensureFirebaseAuth();
  const chatId = getChatRoomId(senderId, receiverId);
  const messageId = `m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();

  const disappearingSeconds =
    payload.privacyMode === 'immediate'
      ? 5
      : payload.privacyMode === 'after_seen'
      ? 6
      : undefined;

  const newMsg: Message = {
    id: messageId,
    senderId,
    receiverId,
    text: payload.text,
    imageUrl: payload.imageUrl,
    voiceNote: payload.voiceNote,
    timestamp: 'Just now',
    isRead: false,
    privacyMode: payload.privacyMode || 'normal',
    createdAt: now,
    disappearingSeconds,
    isForwarded: payload.isForwarded,
    forwardedFrom: payload.forwardedFrom,
    reactions: [],
    isDelivered: false,
  };

  const lastMessageSummary = {
    text: payload.voiceNote
      ? `Voice note (0:${payload.voiceNote.durationSeconds < 10 ? '0' : ''}${payload.voiceNote.durationSeconds})`
      : payload.text || (payload.imageUrl ? 'Photo attachment' : ''),
    imageUrl: payload.imageUrl,
    isVoice: !!payload.voiceNote,
    voiceDuration: payload.voiceNote?.durationSeconds,
    timestamp: 'Just now',
    isRead: false,
    isOwn: true,
  };

  try {
    // 1. Write the message document to chats/{chatId}/messages/{messageId}
    const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
    await setDoc(
      msgRef,
      {
        ...newMsg,
        createdAtServer: serverTimestamp(),
      },
      { merge: true }
    );

    // 2. Update the parent room document at chats/{chatId}
    const chatRoomRef = doc(db, 'chats', chatId);
    await setDoc(
      chatRoomRef,
      {
        id: chatId,
        participants: [senderId, receiverId],
        lastMessage: lastMessageSummary,
        updatedAt: serverTimestamp(),
        lastActivityMs: now,
      },
      { merge: true }
    );

    // Also mirror to chat_threads for backward-compatibility with thread list
    const legacyThreadRef = doc(db, 'chat_threads', chatId);
    await setDoc(
      legacyThreadRef,
      {
        id: chatId,
        participants: [senderId, receiverId],
        lastMessage: lastMessageSummary,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    ).catch(() => {});
  } catch (error) {
    console.warn('Error saving message to Firestore:', error);
  }

  return newMsg;
};

/**
 * Marks incoming messages as read in chats/{chatId}/messages/{messageId}
 */
export const markMessageAsReadInFirestore = async (
  chatId: string,
  messageId: string
): Promise<void> => {
  try {
    await ensureFirebaseAuth();
    if (!chatId || !messageId) return;
    const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
    await updateDoc(msgRef, {
      isRead: true,
      readAt: serverTimestamp(),
    }).catch(async () => {
      // Fallback merge
      await setDoc(msgRef, { isRead: true }, { merge: true });
    });
  } catch (error) {
    console.warn('Error marking message as read in Firestore:', error);
  }
};

/**
 * Deletes a message in chats/{chatId}/messages/{messageId}
 */
export const deleteChatMessageFromFirestore = async (
  chatId: string,
  messageId: string
): Promise<void> => {
  try {
    await ensureFirebaseAuth();
    if (!chatId || !messageId) return;
    const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
    await deleteDoc(msgRef);
  } catch (error) {
    console.warn('Error deleting message from Firestore:', error);
  }
};

/**
 * Toggles a message emoji reaction in chats/{chatId}/messages/{messageId}
 */
export const toggleMessageReactionInFirestore = async (
  chatId: string,
  messageId: string,
  userId: string,
  emoji: string
): Promise<void> => {
  try {
    await ensureFirebaseAuth();
    if (!chatId || !messageId || !userId) return;
    const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
    const snap = await getDoc(msgRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const currentReactions: Array<{ emoji: string; count: number; userIds: string[] }> =
      Array.isArray(data.reactions) ? [...data.reactions] : [];

    const existingIndex = currentReactions.findIndex((r) => r.emoji === emoji);

    if (existingIndex > -1) {
      const reaction = currentReactions[existingIndex];
      const hasUser = reaction.userIds.includes(userId);

      if (hasUser) {
        const nextUserIds = reaction.userIds.filter((id) => id !== userId);
        if (nextUserIds.length === 0) {
          currentReactions.splice(existingIndex, 1);
        } else {
          currentReactions[existingIndex] = {
            ...reaction,
            count: nextUserIds.length,
            userIds: nextUserIds,
          };
        }
      } else {
        currentReactions[existingIndex] = {
          ...reaction,
          count: reaction.count + 1,
          userIds: [...reaction.userIds, userId],
        };
      }
    } else {
      currentReactions.push({
        emoji,
        count: 1,
        userIds: [userId],
      });
    }

    await updateDoc(msgRef, {
      reactions: currentReactions,
    });
  } catch (error) {
    console.warn('Error toggling reaction in Firestore:', error);
  }
};

/**
 * Real-time listener for all chat rooms in the chats collection
 */
export const subscribeToAllChatRooms = (
  callback: (rooms: Array<{ id: string; participants: string[]; lastMessage?: any; updatedAt?: any }>) => void
): Unsubscribe => {
  try {
    const chatsRef = collection(db, 'chats');
    const unsubscribe = onSnapshot(
      chatsRef,
      (snapshot) => {
        const rooms: Array<{ id: string; participants: string[]; lastMessage?: any; updatedAt?: any }> = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            rooms.push({
              id: docSnap.id,
              participants: Array.isArray(data.participants) ? data.participants : [],
              lastMessage: data.lastMessage,
              updatedAt: data.updatedAt,
            });
          }
        });
        callback(rooms);
      },
      (error) => {
        console.warn('Chat rooms onSnapshot warning:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe to chat rooms:', err);
    return () => {};
  }
};
