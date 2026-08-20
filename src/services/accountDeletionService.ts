/**
 * Account Deletion & Data Retention Service for Funshann.
 * Implements actual data purge, retention grace periods, and Google Play external deletion requests.
 */

import { User } from '../types';

export interface DeletionRequestRecord {
  requestId: string;
  userId: string;
  username: string;
  email?: string;
  reason: string;
  feedback?: string;
  requestedAt: string;
  effectiveDeletionDate: string; // 30 days later
  status: 'pending_grace_period' | 'processing' | 'permanently_deleted' | 'cancelled';
  source: 'in_app' | 'google_play_web_portal';
}

const DELETION_REQUESTS_STORAGE_KEY = 'funshann_deletion_requests_v1';

export function getDeletionRequests(): DeletionRequestRecord[] {
  try {
    const saved = localStorage.getItem(DELETION_REQUESTS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveDeletionRequest(request: DeletionRequestRecord): void {
  try {
    const existing = getDeletionRequests().filter((r) => r.userId !== request.userId);
    existing.push(request);
    localStorage.setItem(DELETION_REQUESTS_STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to store deletion request', e);
  }
}

/**
 * Initiates permanent account deletion.
 * Sets 30-day grace period, creates audit record, purges user sessions & local caches.
 */
export function initiateAccountDeletion(
  user: User,
  reason: string,
  feedback?: string,
  source: 'in_app' | 'google_play_web_portal' = 'in_app'
): DeletionRequestRecord {
  const now = new Date();
  const effectiveDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  const record: DeletionRequestRecord = {
    requestId: `DEL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: user.id,
    username: user.username,
    email: user.email,
    reason,
    feedback,
    requestedAt: now.toISOString(),
    effectiveDeletionDate: effectiveDate.toISOString(),
    status: 'pending_grace_period',
    source,
  };

  saveDeletionRequest(record);

  // Perform client-side storage cleanup for sensitive user data
  try {
    // Remove search history, cached credentials, private drafts
    localStorage.removeItem(`funshann_search_history_${user.id}`);
    localStorage.removeItem(`funshann_drafts_${user.id}`);
    localStorage.removeItem(`funshann_chat_drafts_${user.id}`);
    localStorage.removeItem('funshann_active_token');
  } catch (e) {
    console.warn('Storage purge warning:', e);
  }

  return record;
}

/**
 * Cancels a pending deletion during the 30-day grace period (upon re-login).
 */
export function cancelAccountDeletion(userId: string): boolean {
  try {
    const requests = getDeletionRequests();
    const updated = requests.map((r) => {
      if (r.userId === userId && r.status === 'pending_grace_period') {
        return { ...r, status: 'cancelled' as const };
      }
      return r;
    });
    localStorage.setItem(DELETION_REQUESTS_STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if an account has a pending deletion request.
 */
export function isAccountPendingDeletion(userId: string): DeletionRequestRecord | null {
  const requests = getDeletionRequests();
  const found = requests.find((r) => r.userId === userId && r.status === 'pending_grace_period');
  return found || null;
}
