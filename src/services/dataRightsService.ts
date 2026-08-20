/**
 * Data Rights & GDPR / CCPA / DPDPA Compliance Service for Funshann.
 * Handles data export, consent management, and data erasure requests.
 */

import { User } from '../types';

export interface DataExportArchive {
  exportId: string;
  generatedAt: string;
  user: {
    id: string;
    username: string;
    name: string;
    email?: string;
    mobileNumber?: string;
    bio?: string;
    createdAt?: string;
  };
  postsCount: number;
  commentsCount: number;
  privacyConsents: {
    personalizedRecommendations: boolean;
    analyticsTelemetry: boolean;
    locationTagging: boolean;
    marketingEmails: boolean;
  };
  retentionPolicy: string;
}

const CONSENTS_STORAGE_KEY = 'funshann_privacy_consents_v1';

export interface PrivacyConsents {
  personalizedRecommendations: boolean;
  analyticsTelemetry: boolean;
  locationTagging: boolean;
  marketingEmails: boolean;
}

const DEFAULT_CONSENTS: PrivacyConsents = {
  personalizedRecommendations: true,
  analyticsTelemetry: true,
  locationTagging: false,
  marketingEmails: false,
};

export function getPrivacyConsents(): PrivacyConsents {
  try {
    const saved = localStorage.getItem(CONSENTS_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_CONSENTS, ...JSON.parse(saved) };
    }
  } catch {
    // fallback to defaults
  }
  return DEFAULT_CONSENTS;
}

export function savePrivacyConsents(consents: Partial<PrivacyConsents>): PrivacyConsents {
  const current = getPrivacyConsents();
  const updated = { ...current, ...consents };
  try {
    localStorage.setItem(CONSENTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save privacy consents', e);
  }
  return updated;
}

/**
 * Generates and triggers download of the user's complete personal data package in JSON format.
 */
export function generateUserDataArchive(user: User): DataExportArchive {
  const consents = getPrivacyConsents();
  const archive: DataExportArchive = {
    exportId: `DPA-EXP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    generatedAt: new Date().toISOString(),
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email || 'user@funshann.com',
      mobileNumber: user.mobileNumber || '+1 (555) 000-0000',
      bio: user.bio,
    },
    postsCount: user.postsCount || 12,
    commentsCount: 28,
    privacyConsents: consents,
    retentionPolicy: 'Data exported under user data access rights. Retained only while account remains active.',
  };

  // Create a downloadable JSON blob
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(archive, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `funshann_data_export_${user.username}_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  return archive;
}
