import { UserReportItem, BugReportItem } from '../types';

const STORAGE_USER_REPORTS = 'funshann_user_submitted_reports';
const STORAGE_BUG_REPORTS = 'funshann_bug_reports';

export const INITIAL_USER_REPORTS: UserReportItem[] = [
  {
    id: 'rep_101',
    reportedUserId: 'u_spammer_99',
    reportedUserName: 'Crypto Boost Daily',
    reportedUsername: 'crypto_giveaway_bot',
    category: 'spam',
    status: 'action_taken',
    submittedAt: '2026-07-28T14:20:00Z',
    resolvedAt: '2026-07-28T16:05:00Z',
    resolutionNotes: 'Account restricted for mass automated direct messaging violation.',
    evidenceSnippet: 'Hey! Claim your 5.0 ETH welcome prize here...',
  },
  {
    id: 'rep_102',
    reportedUserId: 'u_troll_42',
    reportedUserName: 'Anonymous Phantom',
    reportedUsername: 'phantom_shadow',
    category: 'harassment',
    status: 'resolved',
    submittedAt: '2026-08-02T09:05:00Z',
    resolvedAt: '2026-08-02T11:30:00Z',
    resolutionNotes: 'Comments removed and user issued a formal Community Strike 1 warning.',
    evidenceSnippet: 'Harassing commentary on Mediterranean coastline photograph.',
  },
  {
    id: 'rep_103',
    reportedUserId: 'u_fake_store',
    reportedUserName: 'Luxury Fashion Clearance Outlet',
    reportedUsername: 'luxury_clearance_official',
    category: 'scam',
    status: 'under_review',
    submittedAt: '2026-08-14T19:40:00Z',
    resolutionNotes: 'Currently undergoing trust & safety fraud evaluation.',
    evidenceSnippet: 'Unverified external payment link in profile bio.',
  },
];

export const getUserReports = (): UserReportItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_USER_REPORTS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_USER_REPORTS;
};

export const saveUserReports = (reports: UserReportItem[]): void => {
  try {
    localStorage.setItem(STORAGE_USER_REPORTS, JSON.stringify(reports));
  } catch (e) {
    console.error(e);
  }
};

export const submitUserReport = (newReport: Omit<UserReportItem, 'id' | 'submittedAt' | 'status'>): UserReportItem => {
  const item: UserReportItem = {
    ...newReport,
    id: `rep_${Date.now()}`,
    submittedAt: new Date().toISOString(),
    status: 'under_review',
  };
  const current = getUserReports();
  const updated = [item, ...current];
  saveUserReports(updated);
  return item;
};

// Bug Reports
export const getBugReports = (): BugReportItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_BUG_REPORTS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return [];
};

export const submitBugReport = (report: Omit<BugReportItem, 'id' | 'submittedAt' | 'status'>): BugReportItem => {
  const item: BugReportItem = {
    ...report,
    id: `bug_${Date.now()}`,
    submittedAt: new Date().toISOString(),
    status: 'submitted',
  };
  const current = getBugReports();
  const updated = [item, ...current];
  try {
    localStorage.setItem(STORAGE_BUG_REPORTS, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
  return item;
};
