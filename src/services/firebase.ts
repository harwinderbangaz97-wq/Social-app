import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
  StorageReference,
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, Post, Story, ChatThread, Message, NotificationItem, UserReportItem, BugReportItem } from '../types';

// Initialize Firebase App instance safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with custom databaseId if configured
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Lazy-initialize Firebase Cloud Storage safely
let storageClient: any = null;
export const getStorageClient = () => {
  if (!storageClient) {
    try {
      storageClient = firebaseConfig.storageBucket
        ? getStorage(app, `gs://${firebaseConfig.storageBucket}`)
        : getStorage(app);
    } catch (e) {
      try {
        storageClient = getStorage(app);
      } catch (err) {
        console.warn('Firebase Storage not available in current configuration:', err);
        return null;
      }
    }
  }
  return storageClient;
};

// Keep an authenticated session active (anonymous sign-in fallback ensures security rules pass smoothly)
export const ensureFirebaseAuth = async (): Promise<FirebaseUser | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        try {
          const userCredential = await signInAnonymously(auth);
          resolve(userCredential.user);
        } catch (error) {
          console.warn('Firebase anonymous authentication note:', error);
          resolve(null);
        }
      }
    });
  });
};

// ==========================================
// Firebase Phone & Google Authentication
// ==========================================

export type { ConfirmationResult };

/**
 * Standardizes international and Indian mobile phone numbers into E.164 format (+91XXXXXXXXXX)
 */
export const formatPhoneNumber = (rawPhone: string): string => {
  const cleaned = rawPhone.trim().replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  // Standard Indian 10-digit mobile number
  if (/^\d{10}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }
  // 11-digit number starting with 0 (e.g. 09876543210)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return `+91${cleaned.slice(1)}`;
  }
  // 12-digit number starting with 91 (e.g. 919876543210)
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  return `+${cleaned}`;
};

/**
 * Safely initializes or clears an invisible RecaptchaVerifier on the specified HTML container element ID
 */
export const setupRecaptchaVerifier = (containerId: string = 'recaptcha-container'): RecaptchaVerifier => {
  const windowObj = window as any;
  if (windowObj.recaptchaVerifier) {
    try {
      windowObj.recaptchaVerifier.clear();
    } catch (e) {
      console.warn('Error clearing existing RecaptchaVerifier:', e);
    }
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA verification passed
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired, user may need to retry');
    },
  });

  windowObj.recaptchaVerifier = verifier;
  return verifier;
};

export interface PhoneAuthSendResult {
  success: boolean;
  confirmationResult?: ConfirmationResult;
  error?: string;
}

/**
 * Sends a real SMS verification code to the target phone number using Firebase Phone Authentication.
 */
export const sendFirebasePhoneOtp = async (
  rawPhoneNumber: string,
  containerId: string = 'recaptcha-container'
): Promise<PhoneAuthSendResult> => {
  try {
    const formatted = formatPhoneNumber(rawPhoneNumber);
    if (!formatted || formatted.length < 8) {
      return {
        success: false,
        error: 'Please enter a valid mobile number with country code.',
      };
    }

    const verifier = setupRecaptchaVerifier(containerId);
    const confirmationResult = await signInWithPhoneNumber(auth, formatted, verifier);

    return {
      success: true,
      confirmationResult,
    };
  } catch (error: any) {
    console.error('Firebase sendPhoneOtp error details:', error);
    let message = 'Failed to send SMS verification code. Please try again.';
    if (error?.code === 'auth/invalid-phone-number') {
      message = 'Invalid phone number format. Please enter a valid 10-digit mobile number.';
    } else if (error?.code === 'auth/quota-exceeded' || error?.code === 'auth/too-many-requests') {
      message = 'SMS quota or rate limit reached. Please wait a moment before trying again.';
    } else if (error?.code === 'auth/captcha-check-failed') {
      message = 'reCAPTCHA check failed. Please refresh the page and try again.';
    } else if (error?.code === 'auth/operation-not-allowed' || error?.code === 'auth/admin-restricted-operation') {
      message = 'Phone Authentication must be enabled under Firebase Console > Authentication > Sign-in method.';
    } else if (error?.message) {
      message = error.message;
    }

    return {
      success: false,
      error: message,
    };
  }
};

export interface PhoneAuthVerifyResult {
  success: boolean;
  user?: FirebaseUser;
  error?: string;
}

/**
 * Verifies the SMS verification code entered by the user against Firebase ConfirmationResult
 */
export const verifyFirebasePhoneOtp = async (
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<PhoneAuthVerifyResult> => {
  try {
    if (!confirmationResult) {
      return {
        success: false,
        error: 'No active SMS verification session. Please request a new verification code.',
      };
    }

    const trimmedCode = otpCode.trim();
    if (!trimmedCode) {
      return {
        success: false,
        error: 'Please enter the SMS verification code.',
      };
    }

    const userCredential = await confirmationResult.confirm(trimmedCode);
    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error: any) {
    console.error('Firebase verifyPhoneOtp error details:', error);
    let message = 'Verification failed. Please check the code and try again.';
    if (error?.code === 'auth/invalid-verification-code') {
      message = 'Incorrect SMS verification code. Please check your SMS and try again.';
    } else if (error?.code === 'auth/code-expired') {
      message = 'The verification code has expired. Please request a new SMS code.';
    } else if (error?.message) {
      message = error.message;
    }

    return {
      success: false,
      error: message,
    };
  }
};

/**
 * Signs in user with Google Account using Firebase Auth popup
 */
export const signInWithGooglePopup = async (): Promise<{ success: boolean; user?: FirebaseUser; error?: string }> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    return {
      success: true,
      user: result.user,
    };
  } catch (error: any) {
    console.warn('Firebase Google Sign-In note:', error);
    return {
      success: false,
      error: error?.message || 'Google Sign-In failed or was cancelled.',
    };
  }
};

// ==========================================
// Firebase Cloud Storage Helper Functions
// ==========================================

export interface UploadStorageOptions {
  dataOrUrlOrFile: File | Blob | string;
  storagePath: string;
  contentType?: string;
}

/**
 * Universal upload function to Firebase Cloud Storage.
 * Handles Files, Blobs, and base64 Data URLs. Returns the permanent public download URL.
 */
export const uploadMediaToStorage = async (
  options: UploadStorageOptions
): Promise<string> => {
  const { dataOrUrlOrFile, storagePath, contentType } = options;
  if (!dataOrUrlOrFile) return '';

  // If already an external hosted URL (not a base64 Data URL), return as is
  if (
    typeof dataOrUrlOrFile === 'string' &&
    (dataOrUrlOrFile.startsWith('http://') || dataOrUrlOrFile.startsWith('https://')) &&
    !dataOrUrlOrFile.startsWith('data:')
  ) {
    return dataOrUrlOrFile;
  }

  try {
    await ensureFirebaseAuth();
    const storage = getStorageClient();
    if (!storage) {
      return typeof dataOrUrlOrFile === 'string' ? dataOrUrlOrFile : '';
    }
    const storageRef: StorageReference = ref(storage, storagePath);

    if (dataOrUrlOrFile instanceof File || dataOrUrlOrFile instanceof Blob) {
      // Direct binary file or blob upload
      const metadata = contentType ? { contentType } : undefined;
      await uploadBytes(storageRef, dataOrUrlOrFile, metadata);
    } else if (typeof dataOrUrlOrFile === 'string' && dataOrUrlOrFile.startsWith('data:')) {
      // Base64 Data URL string upload
      await uploadString(storageRef, dataOrUrlOrFile, 'data_url');
    } else if (typeof dataOrUrlOrFile === 'string') {
      // Raw string format
      await uploadString(storageRef, dataOrUrlOrFile, 'raw', contentType ? { contentType } : undefined);
    }

    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.warn(`Firebase Cloud Storage upload fallback for ${storagePath}:`, error);
    // If storage is pending initial bucket rules or network is limited, return original data URL seamlessly
    return typeof dataOrUrlOrFile === 'string' ? dataOrUrlOrFile : '';
  }
};

/**
 * Upload an avatar/profile picture to Cloud Storage
 */
export const uploadUserAvatarToStorage = async (
  userId: string,
  media: File | Blob | string
): Promise<string> => {
  const ext = typeof media === 'string' && media.startsWith('data:image/png') ? 'png' : 'jpg';
  const path = `users/${userId}/avatar_${Date.now()}.${ext}`;
  return uploadMediaToStorage({
    dataOrUrlOrFile: media,
    storagePath: path,
    contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
  });
};

/**
 * Upload a post image to Cloud Storage
 */
export const uploadPostImageToStorage = async (
  userId: string,
  media: File | Blob | string
): Promise<string> => {
  const path = `posts/${userId}/${Date.now()}_post.jpg`;
  return uploadMediaToStorage({
    dataOrUrlOrFile: media,
    storagePath: path,
    contentType: 'image/jpeg',
  });
};

/**
 * Upload a story photo or video to Cloud Storage
 */
export const uploadStoryMediaToStorage = async (
  userId: string,
  media: File | Blob | string,
  isVideo = false
): Promise<string> => {
  const ext = isVideo ? 'mp4' : 'jpg';
  const mime = isVideo ? 'video/mp4' : 'image/jpeg';
  const path = `stories/${userId}/${Date.now()}_story.${ext}`;
  return uploadMediaToStorage({
    dataOrUrlOrFile: media,
    storagePath: path,
    contentType: mime,
  });
};

/**
 * Upload chat attachment / voice recording to Cloud Storage
 */
export const uploadChatMediaToStorage = async (
  threadId: string,
  media: File | Blob | string,
  mediaType: 'image' | 'video' | 'audio' = 'image'
): Promise<string> => {
  const extMap = { image: 'jpg', video: 'mp4', audio: 'webm' };
  const mimeMap = { image: 'image/jpeg', video: 'video/mp4', audio: 'audio/webm' };
  const path = `chats/${threadId}/${mediaType}_${Date.now()}.${extMap[mediaType]}`;
  return uploadMediaToStorage({
    dataOrUrlOrFile: media,
    storagePath: path,
    contentType: mimeMap[mediaType],
  });
};

// ==========================================
// Firestore Data Sync & Persistence Helpers
// ==========================================

// 1. User Profiles
export const syncUserProfileToFirestore = async (user: Partial<User>): Promise<void> => {
  try {
    await ensureFirebaseAuth();
    if (!user || !user.id) return;
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      ...user,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore user profile sync fallback to local:', error);
  }
};

export const getUserProfileFromFirestore = async (userId: string): Promise<User | null> => {
  try {
    await ensureFirebaseAuth();
    if (!userId) return null;
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as User;
    }
    return null;
  } catch (error) {
    console.warn('Firestore read user profile fallback:', error);
    return null;
  }
};

// 2. Posts & Live Feed
export const syncPostToFirestore = async (post: Post): Promise<void> => {
  try {
    await ensureFirebaseAuth();
    if (!post || !post.id) return;
    const postRef = doc(db, 'posts', post.id);
    await setDoc(postRef, {
      ...post,
      syncedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore post sync fallback to local:', error);
  }
};

export const getPostsFromFirestore = async (): Promise<Post[]> => {
  try {
    await ensureFirebaseAuth();
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, limit(50));
    const querySnapshot = await getDocs(q);
    const result: Post[] = [];
    querySnapshot.forEach((docSnap) => {
      if (docSnap.exists()) {
        result.push(docSnap.data() as Post);
      }
    });
    return result;
  } catch (error) {
    console.warn('Firestore getPosts fallback:', error);
    return [];
  }
};

// 3. Chat Threads & Direct Messages
export const syncChatThreadToFirestore = async (thread: ChatThread): Promise<void> => {
  try {
    await ensureFirebaseAuth();
    if (!thread || !thread.id) return;
    const threadRef = doc(db, 'chat_threads', thread.id);
    await setDoc(threadRef, {
      ...thread,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore chat thread sync fallback to local:', error);
  }
};

export const syncChatMessageToFirestore = async (threadId: string, message: Message): Promise<void> => {
  try {
    await ensureFirebaseAuth();
    if (!threadId || !message || !message.id) return;
    const msgRef = doc(db, 'chat_threads', threadId, 'messages', message.id);
    await setDoc(msgRef, {
      ...message,
      syncedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore message sync fallback:', error);
  }
};

export const getChatThreadsFromFirestore = async (): Promise<ChatThread[]> => {
  try {
    await ensureFirebaseAuth();
    const threadsRef = collection(db, 'chat_threads');
    const q = query(threadsRef, limit(50));
    const querySnapshot = await getDocs(q);
    const result: ChatThread[] = [];
    querySnapshot.forEach((docSnap) => {
      if (docSnap.exists()) {
        result.push(docSnap.data() as ChatThread);
      }
    });
    return result;
  } catch (error) {
    console.warn('Firestore getChatThreads fallback:', error);
    return [];
  }
};

// 4. Stories
export const syncStoryToFirestore = async (story: Story): Promise<void> => {
  try {
    await ensureFirebaseAuth();
    if (!story || !story.id) return;
    const storyRef = doc(db, 'stories', story.id);
    await setDoc(storyRef, {
      ...story,
      syncedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore story sync fallback to local:', error);
  }
};

export const getStoriesFromFirestore = async (): Promise<Story[]> => {
  try {
    await ensureFirebaseAuth();
    const storiesRef = collection(db, 'stories');
    const q = query(storiesRef, limit(30));
    const querySnapshot = await getDocs(q);
    const result: Story[] = [];
    querySnapshot.forEach((docSnap) => {
      if (docSnap.exists()) {
        result.push(docSnap.data() as Story);
      }
    });
    return result;
  } catch (error) {
    console.warn('Firestore getStories fallback:', error);
    return [];
  }
};

// 5. Communities
export const syncCommunityToFirestore = async (community: any): Promise<void> => {
  try {
    await ensureFirebaseAuth();
    if (!community || !community.id) return;
    const commRef = doc(db, 'communities', community.id);
    await setDoc(commRef, {
      ...community,
      syncedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore community sync fallback:', error);
  }
};

// 6. Notifications
export const syncNotificationToFirestore = async (notification: NotificationItem): Promise<void> => {
  try {
    await ensureFirebaseAuth();
    if (!notification || !notification.id) return;
    const notifRef = doc(db, 'notifications', notification.id);
    await setDoc(notifRef, {
      ...notification,
      syncedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore notification sync fallback to local:', error);
  }
};

export const getNotificationsFromFirestore = async (): Promise<NotificationItem[]> => {
  try {
    await ensureFirebaseAuth();
    const notifsRef = collection(db, 'notifications');
    const q = query(notifsRef, limit(40));
    const querySnapshot = await getDocs(q);
    const result: NotificationItem[] = [];
    querySnapshot.forEach((docSnap) => {
      if (docSnap.exists()) {
        result.push(docSnap.data() as NotificationItem);
      }
    });
    return result;
  } catch (error) {
    console.warn('Firestore getNotifications fallback:', error);
    return [];
  }
};

// 7. User Reports & Grievances
export const syncUserReportToFirestore = async (report: UserReportItem): Promise<void> => {
  try {
    await ensureFirebaseAuth();
    if (!report || !report.id) return;
    const reportRef = doc(db, 'universal_reports', report.id);
    await setDoc(reportRef, {
      ...report,
      syncedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore user report sync fallback to local:', error);
  }
};

export const syncBugReportToFirestore = async (report: BugReportItem): Promise<void> => {
  try {
    await ensureFirebaseAuth();
    if (!report || !report.id) return;
    const reportRef = doc(db, 'bug_reports', report.id);
    await setDoc(reportRef, {
      ...report,
      syncedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore bug report sync fallback to local:', error);
  }
};
