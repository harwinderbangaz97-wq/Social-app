import {
  UniversalReportItem,
  ReportReasonKey,
  ReportContentType,
  OFFICIAL_REPORT_REASONS,
  ModerationLogEntry,
  ModerationActionType,
} from '../types/safety';
import { BlockedUserItem, User } from '../types';
import { syncUserReportToFirestore } from './firebase';

const STORAGE_UNIVERSAL_REPORTS = 'funshann_universal_reports';
const STORAGE_MODERATION_LOGS = 'funshann_moderation_logs';
const STORAGE_BLOCKED_USERS = 'funshann_blocked_users';
const STORAGE_REMOVED_CONTENT_IDS = 'funshann_removed_content_ids';
const STORAGE_RESTRICTED_USERS = 'funshann_restricted_users';
const STORAGE_BANNED_USERS = 'funshann_banned_users';
const STORAGE_USER_WARNINGS = 'funshann_user_warnings';

// Initial seed reports to showcase real admin/moderator dashboard capability
export const INITIAL_SEED_REPORTS: UniversalReportItem[] = [];

export const INITIAL_MODERATION_LOGS: ModerationLogEntry[] = [];

/**
 * Retrieve all reports from storage
 */
export const getUniversalReports = (): UniversalReportItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_UNIVERSAL_REPORTS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load universal reports', e);
  }
  return INITIAL_SEED_REPORTS;
};

/**
 * Persist reports
 */
export const saveUniversalReports = (reports: UniversalReportItem[]): void => {
  try {
    localStorage.setItem(STORAGE_UNIVERSAL_REPORTS, JSON.stringify(reports));
  } catch (e) {
    console.error('Failed to persist universal reports', e);
  }
};

/**
 * Submit a universal report for Post, Comment, Profile, or Message
 * Prevents unnecessary duplicate reports from the same user for the same content.
 */
export const submitUniversalReport = (params: {
  contentType: ReportContentType;
  contentId: string;
  targetUserId: string;
  targetUsername: string;
  targetUserAvatar?: string;
  reporterUserId: string;
  reasonKey: ReportReasonKey;
  details?: string;
  snippet?: string;
  mediaUrl?: string;
  postId?: string;
  threadId?: string;
}): { success: boolean; isDuplicate: boolean; report: UniversalReportItem } => {
  const current = getUniversalReports();

  // Check duplicate: Same reporter, same contentId
  const existing = current.find(
    (r) =>
      r.contentType === params.contentType &&
      r.contentId === params.contentId &&
      r.reporterUserId === params.reporterUserId
  );

  if (existing) {
    return {
      success: true,
      isDuplicate: true,
      report: existing,
    };
  }

  const reasonDef = OFFICIAL_REPORT_REASONS.find((r) => r.key === params.reasonKey);

  const newReport: UniversalReportItem = {
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    contentType: params.contentType,
    contentId: params.contentId,
    targetUserId: params.targetUserId,
    targetUsername: params.targetUsername,
    targetUserAvatar: params.targetUserAvatar,
    reporterUserId: params.reporterUserId, // Protected securely
    reasonKey: params.reasonKey,
    reasonLabel: reasonDef ? reasonDef.label : params.reasonKey,
    details: params.details?.trim() || undefined,
    snippet: params.snippet?.trim() || undefined,
    mediaUrl: params.mediaUrl,
    postId: params.postId,
    threadId: params.threadId,
    submittedAt: new Date().toISOString(),
    status: 'pending_review',
  };

  const updated = [newReport, ...current];
  saveUniversalReports(updated);
  syncUserReportToFirestore(newReport).catch(console.warn);

  return {
    success: true,
    isDuplicate: false,
    report: newReport,
  };
};

/**
 * Moderation Logs management
 */
export const getModerationLogs = (): ModerationLogEntry[] => {
  try {
    const saved = localStorage.getItem(STORAGE_MODERATION_LOGS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load moderation logs', e);
  }
  return INITIAL_MODERATION_LOGS;
};

export const appendModerationLog = (entry: Omit<ModerationLogEntry, 'id' | 'timestamp'>): ModerationLogEntry => {
  const newEntry: ModerationLogEntry = {
    ...entry,
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  try {
    const current = getModerationLogs();
    const updated = [newEntry, ...current];
    localStorage.setItem(STORAGE_MODERATION_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to append moderation log', e);
  }

  return newEntry;
};

/**
 * Content removal registry (Tracks posts/comments removed by moderation)
 */
export const getRemovedContentIds = (): string[] => {
  try {
    const saved = localStorage.getItem(STORAGE_REMOVED_CONTENT_IDS);
    if (saved) return JSON.parse(saved);
  } catch {
    return [];
  }
  return [];
};

export const setContentRemovedStatus = (contentId: string, isRemoved: boolean): void => {
  try {
    const current = getRemovedContentIds();
    let updated: string[];
    if (isRemoved) {
      updated = Array.from(new Set([...current, contentId]));
    } else {
      updated = current.filter((id) => id !== contentId);
    }
    localStorage.setItem(STORAGE_REMOVED_CONTENT_IDS, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
};

/**
 * User Penalties (Warnings, Restrictions, Bans)
 */
export const getUserWarnings = (): Record<string, number> => {
  try {
    const saved = localStorage.getItem(STORAGE_USER_WARNINGS);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {};
};

export const issueUserWarning = (userId: string): number => {
  const current = getUserWarnings();
  const count = (current[userId] || 0) + 1;
  current[userId] = count;
  try {
    localStorage.setItem(STORAGE_USER_WARNINGS, JSON.stringify(current));
  } catch {}
  return count;
};

export const getRestrictedUserIds = (): string[] => {
  try {
    const saved = localStorage.getItem(STORAGE_RESTRICTED_USERS);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
};

export const setRestrictedStatus = (userId: string, isRestricted: boolean): void => {
  const current = getRestrictedUserIds();
  const updated = isRestricted
    ? Array.from(new Set([...current, userId]))
    : current.filter((id) => id !== userId);
  try {
    localStorage.setItem(STORAGE_RESTRICTED_USERS, JSON.stringify(updated));
  } catch {}
};

export const getBannedUserIds = (): string[] => {
  try {
    const saved = localStorage.getItem(STORAGE_BANNED_USERS);
    if (saved) return JSON.parse(saved);
  } catch {}
  return ['u_impersonator_vip'];
};

export const setBannedStatus = (userId: string, isBanned: boolean): void => {
  const current = getBannedUserIds();
  const updated = isBanned
    ? Array.from(new Set([...current, userId]))
    : current.filter((id) => id !== userId);
  try {
    localStorage.setItem(STORAGE_BANNED_USERS, JSON.stringify(updated));
  } catch {}
};

/**
 * Block System Management
 */
export const blockUserAccount = (targetUser: {
  id: string;
  name: string;
  username: string;
  avatar: string;
  reason?: string;
}): BlockedUserItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_BLOCKED_USERS);
    const list: BlockedUserItem[] = saved ? JSON.parse(saved) : [];
    
    // Prevent duplicate entries
    const filtered = list.filter((u) => u.userId !== targetUser.id && u.id !== targetUser.id);
    
    const newBlockedItem: BlockedUserItem = {
      id: `block_${Date.now()}`,
      userId: targetUser.id,
      name: targetUser.name,
      username: targetUser.username,
      avatar: targetUser.avatar,
      blockedAt: new Date().toISOString(),
      reason: targetUser.reason || 'User initiated block',
    };

    const updated = [newBlockedItem, ...filtered];
    localStorage.setItem(STORAGE_BLOCKED_USERS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to block user', e);
    return [];
  }
};

export const isUserBlocked = (userId: string): boolean => {
  try {
    const saved = localStorage.getItem(STORAGE_BLOCKED_USERS);
    if (!saved) return false;
    const list: BlockedUserItem[] = JSON.parse(saved);
    return list.some((u) => u.userId === userId || u.id === userId);
  } catch {
    return false;
  }
};
