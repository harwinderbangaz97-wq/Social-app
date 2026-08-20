// 13 Official Funshann Community Safety & Report Reasons
export type ReportReasonKey =
  | 'nudity_sexual'
  | 'harassment'
  | 'hate_abuse'
  | 'violence_threat'
  | 'child_safety'
  | 'fake_account'
  | 'impersonation'
  | 'spam'
  | 'scam_fraud'
  | 'copyright'
  | 'privacy_violation'
  | 'illegal_content'
  | 'other';

export type ReportContentType = 'post' | 'comment' | 'profile' | 'message';

export interface ReportReasonOption {
  key: ReportReasonKey;
  label: string;
  desc: string;
  icon: string;
}

export const OFFICIAL_REPORT_REASONS: ReportReasonOption[] = [
  {
    key: 'nudity_sexual',
    label: 'Nudity or sexual content',
    desc: 'Sexually explicit material, non-consensual imagery, or adult services',
    icon: '🔞',
  },
  {
    key: 'harassment',
    label: 'Harassment or bullying',
    desc: 'Targeted hostility, intimidation, unwanted contact, or personal attacks',
    icon: '⚠️',
  },
  {
    key: 'hate_abuse',
    label: 'Hate speech or abuse',
    desc: 'Attacks on protected traits, derogatory slurs, or dehumanizing language',
    icon: '🚫',
  },
  {
    key: 'violence_threat',
    label: 'Violence or physical threats',
    desc: 'Threats of violence, glorification of harm, or dangerous activities',
    icon: '🔪',
  },
  {
    key: 'child_safety',
    label: 'Child safety violation',
    desc: 'Exploitation, endangerment, or inappropriate contact with minors (Priority 0)',
    icon: '🛡️',
  },
  {
    key: 'fake_account',
    label: 'Fake or automated bot account',
    desc: 'Misleading identity, bot automation, or coordinated inauthentic behavior',
    icon: '🤖',
  },
  {
    key: 'impersonation',
    label: 'Impersonation',
    desc: 'Pretending to be someone else, a public figure, or an organization',
    icon: '🎭',
  },
  {
    key: 'spam',
    label: 'Spam or commercial overload',
    desc: 'Unsolicited mass promotions, link farms, or repetitive noise',
    icon: '🚨',
  },
  {
    key: 'scam_fraud',
    label: 'Scam, phishing or financial fraud',
    desc: 'Deceptive financial schemes, phishing links, or unauthorized transactions',
    icon: '💸',
  },
  {
    key: 'copyright',
    label: 'Copyright or IP infringement',
    desc: 'Unauthorized use of copyrighted artwork, music, photography, or trademarks',
    icon: '©️',
  },
  {
    key: 'privacy_violation',
    label: 'Privacy violation (Doxxing)',
    desc: 'Sharing non-public personal information, phone numbers, or private documents',
    icon: '🔒',
  },
  {
    key: 'illegal_content',
    label: 'Illegal goods or prohibited items',
    desc: 'Regulated substances, contraband, weapon sales, or illegal activity',
    icon: '⚖️',
  },
  {
    key: 'other',
    label: 'Other safety violation',
    desc: 'Other violations contrary to Funshann Community Guidelines',
    icon: '❓',
  },
];

export type ModerationActionType =
  | 'dismiss'
  | 'resolve'
  | 'remove_content'
  | 'restore_content'
  | 'warn_user'
  | 'restrict_user'
  | 'suspend_account'
  | 'ban_account';

export interface ModerationLogEntry {
  id: string;
  reportId?: string;
  action: ModerationActionType;
  moderatorId: string;
  moderatorName: string;
  targetUserId: string;
  targetUsername?: string;
  contentType: ReportContentType;
  contentId: string;
  reason: string;
  notes?: string;
  timestamp: string;
}

export interface UniversalReportItem {
  id: string;
  contentType: ReportContentType;
  contentId: string;
  targetUserId: string;
  targetUsername: string;
  targetUserAvatar?: string;
  reporterUserId: string; // Securely stored, never exposed to reported user
  reasonKey: ReportReasonKey;
  reasonLabel: string;
  details?: string;
  snippet?: string; // Preview of post caption, comment text, message content, or profile bio
  mediaUrl?: string;
  postId?: string; // Linked post if reporting a comment or post
  threadId?: string; // Linked thread if reporting a message
  submittedAt: string;
  status: 'pending_review' | 'under_investigation' | 'action_taken' | 'resolved' | 'dismissed';
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}
