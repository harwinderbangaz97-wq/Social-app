import {
  collection,
  doc,
  addDoc,
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
import { db, ensureFirebaseAuth } from './firebase';
import { Message, VoiceNoteData, MessagePrivacyMode, User } from '../types';

/**
 * Consistent Room Path:
 * Define chatId dynamically as [currentUser.uid, targetUser.uid].sort().join('_')
 * so both users consistently subscribe to and write to the exact same path:
 * chats/{chatId}/messages
 */
export const getChatRoomId = (userA: string, userB: string): string => {
  const uidA = (userA || '').trim();
  const uidB = (userB || '').trim();
  if (!uidA || !uidB) return '';
  return [uidA, uidB].sort().join('_');
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
  } else if (raw?.createdAt?.toMillis && typeof raw.createdAt.toMillis === 'function') {
    createdAt = raw.createdAt.toMillis();
  } else if (typeof raw?.timestamp === 'number') {
    createdAt = raw.timestamp;
  } else if (raw?.timestamp?.toMillis && typeof raw.timestamp.toMillis === 'function') {
    createdAt = raw.timestamp.toMillis();
  }

  let timestampStr = 'Just now';
  if (typeof raw?.timestampStr === 'string' && raw.timestampStr) {
    timestampStr = raw.timestampStr;
  } else if (typeof raw?.timestamp === 'string' && raw.timestamp !== 'Just now') {
    timestampStr = raw.timestamp;
  } else if (createdAt) {
    timestampStr = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return {
    id: id || raw?.id || `m_${Date.now()}`,
    senderId: raw?.senderId || '',
    receiverId: raw?.receiverId || '',
    text: raw?.text || undefined,
    imageUrl: raw?.imageUrl || undefined,
    voiceNote: raw?.voiceNote || undefined,
    timestamp: timestampStr,
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
 * In-memory cache for loaded chat messages across component mounts
 * Prevents empty array flashes when switching tabs or navigating screens
 */
const chatMessagesCache = new Map<string, Message[]>();

export const getCachedChatMessages = (chatId: string): Message[] => {
  return chatMessagesCache.get(chatId) || [];
};

export const setCachedChatMessages = (chatId: string, messages: Message[]): void => {
  chatMessagesCache.set(chatId, messages);
};

/**
 * Clear Session Side-effects:
 * Loads existing message history directly from Firestore chats/{chatId}/messages
 * rather than starting with an empty array.
 */
export const loadChatHistory = async (chatId: string): Promise<Message[]> => {
  if (!chatId) return [];
  try {
    await ensureFirebaseAuth();
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    let snapshot;
    try {
      const q = query(messagesRef, orderBy('createdAt', 'asc'));
      snapshot = await getDocs(q);
    } catch {
      try {
        const qFallback = query(messagesRef, orderBy('timestamp', 'asc'));
        snapshot = await getDocs(qFallback);
      } catch {
        snapshot = await getDocs(messagesRef);
      }
    }

    const messages: Message[] = [];
    snapshot.forEach((docSnap) => {
      if (docSnap.exists()) {
        messages.push(normalizeMessage(docSnap.id, docSnap.data()));
      }
    });

    messages.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    setCachedChatMessages(chatId, messages);
    return messages;
  } catch (error) {
    console.warn('Error loading chat history from Firestore:', error);
    return getCachedChatMessages(chatId);
  }
};

/**
 * Firestore Real-time Listener:
 * Attaches an onSnapshot listener to chats/{chatId}/messages sorted by timestamp ascending.
 * Maps snapshot docs directly to messages array.
 */
export const subscribeToChatMessages = (
  chatId: string,
  callback: (messages: Message[]) => void
): Unsubscribe => {
  if (!chatId) return () => {};

  try {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    // Primary query ordered by createdAt ascending
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (snapshot) => {
        const messages: Message[] = snapshot.docs.map((docSnap) => {
          const normalized = normalizeMessage(docSnap.id, docSnap.data());
          normalized.isDelivered = !docSnap.metadata.hasPendingWrites;
          return normalized;
        });

        messages.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        setCachedChatMessages(chatId, messages);
        callback(messages);
      },
      (error) => {
        console.warn('Real-time chat messages listener on createdAt fallback to timestamp:', error);
        try {
          const qFallback = query(messagesRef, orderBy('timestamp', 'asc'));
          return onSnapshot(qFallback, (snapshot) => {
            const messages = snapshot.docs.map((docSnap) => normalizeMessage(docSnap.id, docSnap.data()));
            messages.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
            setCachedChatMessages(chatId, messages);
            callback(messages);
          });
        } catch (err) {
          console.warn('Fallback onSnapshot error:', err);
        }
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn('Failed to subscribe to chat messages:', error);
    return () => {};
  }
};

/**
 * Explicit Write to Firestore using addDoc:
 * Do NOT use Local State Pushes (setMessages([...messages, newMessage])).
 * Instead, perform an explicit write using addDoc(collection(db, 'chats', chatId, 'messages'), messageData).
 */
export const addChatMessageToFirestore = async (
  chatId: string,
  messageData: {
    senderId: string;
    receiverId: string;
    text?: string;
    imageUrl?: string;
    voiceNote?: VoiceNoteData;
    privacyMode?: MessagePrivacyMode;
    isForwarded?: boolean;
    forwardedFrom?: string;
    timestamp?: number;
    disappearingSeconds?: number;
  }
): Promise<string> => {
  if (!chatId) throw new Error('Missing chatId for addChatMessageToFirestore');
  await ensureFirebaseAuth();
  const now = Date.now();

  const disappearingSeconds =
    messageData.disappearingSeconds !== undefined
      ? messageData.disappearingSeconds
      : messageData.privacyMode === 'immediate'
      ? 5
      : messageData.privacyMode === 'after_seen'
      ? 6
      : undefined;

  const payload: any = {
    senderId: messageData.senderId,
    receiverId: messageData.receiverId,
    text: messageData.text || null,
    imageUrl: messageData.imageUrl || null,
    voiceNote: messageData.voiceNote || null,
    timestamp: messageData.timestamp || now,
    createdAt: now,
    createdAtServer: serverTimestamp(),
    timestampStr: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isRead: false,
    privacyMode: messageData.privacyMode || 'normal',
    disappearingSeconds: disappearingSeconds ?? null,
    isForwarded: Boolean(messageData.isForwarded),
    forwardedFrom: messageData.forwardedFrom || null,
    reactions: [],
  };

  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const docRef = await addDoc(messagesRef, payload);

  // Update room parent document at chats/{chatId} for thread listings and previews
  const summaryText = payload.voiceNote
    ? `Voice note (0:${payload.voiceNote.durationSeconds < 10 ? '0' : ''}${payload.voiceNote.durationSeconds})`
    : payload.text || (payload.imageUrl ? 'Photo attachment' : '');

  const chatRoomRef = doc(db, 'chats', chatId);
  const participantIds = [messageData.senderId, messageData.receiverId].sort();
  await setDoc(
    chatRoomRef,
    {
      id: chatId,
      participantIds,
      participants: participantIds,
      lastMessage: {
        text: summaryText,
        imageUrl: payload.imageUrl,
        isVoice: !!payload.voiceNote,
        voiceDuration: payload.voiceNote?.durationSeconds,
        timestamp: 'Just now',
        isRead: false,
        senderId: messageData.senderId,
      },
      updatedAt: serverTimestamp(),
      lastActivityMs: now,
    },
    { merge: true }
  ).catch(console.warn);

  // Mirror to chat_threads for backward compatibility with existing thread indexes
  const legacyThreadRef = doc(db, 'chat_threads', chatId);
  await setDoc(
    legacyThreadRef,
    {
      id: chatId,
      participantIds,
      participants: participantIds,
      lastMessage: {
        text: summaryText,
        imageUrl: payload.imageUrl,
        isVoice: !!payload.voiceNote,
        voiceDuration: payload.voiceNote?.durationSeconds,
        timestamp: 'Just now',
        isRead: false,
        senderId: messageData.senderId,
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  ).catch(() => {});

  return docRef.id;
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
  const chatId = getChatRoomId(senderId, receiverId);
  const now = Date.now();
  const docId = await addChatMessageToFirestore(chatId, {
    senderId,
    receiverId,
    ...payload,
  });

  return {
    id: docId,
    senderId,
    receiverId,
    text: payload.text,
    imageUrl: payload.imageUrl,
    voiceNote: payload.voiceNote,
    timestamp: 'Just now',
    isRead: false,
    privacyMode: payload.privacyMode || 'normal',
    createdAt: now,
    disappearingSeconds: payload.privacyMode === 'immediate' ? 5 : (payload.privacyMode === 'after_seen' ? 6 : undefined),
    isForwarded: payload.isForwarded,
    forwardedFrom: payload.forwardedFrom,
    reactions: [],
    isDelivered: true,
  };
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
 * Ensures or creates the main chat document at chats/{chatId} with participantIds: [user1Id, user2Id]
 */
export const createOrEnsureChatDocument = async (
  user1Id: string,
  user2Id: string,
  extraData?: {
    lastMessage?: any;
    participantsInfo?: Record<string, Partial<User>>;
  }
): Promise<string> => {
  const chatId = getChatRoomId(user1Id, user2Id);
  if (!chatId) return '';
  await ensureFirebaseAuth();
  const chatRoomRef = doc(db, 'chats', chatId);
  const participantIds = [user1Id, user2Id].sort();
  await setDoc(
    chatRoomRef,
    {
      id: chatId,
      participantIds,
      participants: participantIds,
      updatedAt: serverTimestamp(),
      lastActivityMs: Date.now(),
      ...(extraData?.lastMessage ? { lastMessage: extraData.lastMessage } : {}),
      ...(extraData?.participantsInfo ? { participantsInfo: extraData.participantsInfo } : {}),
    },
    { merge: true }
  ).catch(console.warn);
  return chatId;
};

/**
 * Real-time listener for all chat rooms in the chats collection
 */
export const subscribeToAllChatRooms = (
  callback: (rooms: Array<{ id: string; participantIds: string[]; participants: string[]; lastMessage?: any; updatedAt?: any }>) => void
): Unsubscribe => {
  try {
    const chatsRef = collection(db, 'chats');
    const unsubscribe = onSnapshot(
      chatsRef,
      (snapshot) => {
        const rooms: Array<{ id: string; participantIds: string[]; participants: string[]; lastMessage?: any; updatedAt?: any }> = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const pIds = Array.isArray(data.participantIds)
              ? data.participantIds
              : Array.isArray(data.participants)
              ? data.participants
              : [];
            rooms.push({
              id: docSnap.id,
              participantIds: pIds,
              participants: pIds,
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
