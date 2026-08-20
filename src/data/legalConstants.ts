/**
 * Funshann Legal & Compliance Configuration Constants
 * 
 * IMPORTANT: Configurable business and compliance placeholders.
 * Do not invent fake company names, addresses, or officers.
 */

export const LEGAL_CONFIG = {
  LEGAL_NAME: 'FUNSHANN_LEGAL_NAME',
  SUPPORT_EMAIL: 'FUNSHANN_SUPPORT_EMAIL',
  PRIVACY_EMAIL: 'FUNSHANN_PRIVACY_EMAIL',
  GRIEVANCE_EMAIL: 'FUNSHANN_GRIEVANCE_EMAIL',
  BUSINESS_ADDRESS: 'FUNSHANN_BUSINESS_ADDRESS',
  WEBSITE: 'FUNSHANN_WEBSITE',
  LAST_UPDATED: 'FUNSHANN_LAST_UPDATED',
  APP_VERSION: 'v2.4.0 (Build 2026.08.20)',
  MINIMUM_AGE: 13,
} as const;

export type LegalDocumentType =
  | 'privacy_policy'
  | 'terms_of_service'
  | 'community_guidelines'
  | 'copyright_ip'
  | 'child_safety'
  | 'about'
  | 'disclaimer'
  | 'more_info'
  | 'other_legal';
