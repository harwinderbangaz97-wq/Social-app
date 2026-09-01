import { UserReportItem, BugReportItem } from '../types';
import { syncUserReportToFirestore, syncBugReportToFirestore } from './firebase';

const STORAGE_USER_REPORTS = 'funshann_user_submitted_reports';
const STORAGE_BUG_REPORTS = 'funshann_bug_reports';

export const INITIAL_USER_REPORTS: UserReportItem[] = [];

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
  syncUserReportToFirestore(item).catch(console.warn);
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
  syncBugReportToFirestore(item).catch(console.warn);
  return item;
};
