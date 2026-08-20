import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserX,
  Trash2,
  RotateCcw,
  Eye,
  FileText,
  Clock,
  UserCheck,
  ChevronRight,
  ExternalLink,
  Lock,
  MessageSquare,
} from 'lucide-react';
import {
  UniversalReportItem,
  ModerationLogEntry,
  ModerationActionType,
  OFFICIAL_REPORT_REASONS,
} from '../types/safety';
import {
  getUniversalReports,
  saveUniversalReports,
  getModerationLogs,
  appendModerationLog,
  setContentRemovedStatus,
  setRestrictedStatus,
  setBannedStatus,
  issueUserWarning,
} from '../services/safetyService';

interface ModerationDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  onRemovePost?: (postId: string) => void;
}

export const ModerationDashboardModal: React.FC<ModerationDashboardModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onRemovePost,
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'logs'>('reports');
  const [reports, setReports] = useState<UniversalReportItem[]>(() => getUniversalReports());
  const [logs, setLogs] = useState<ModerationLogEntry[]>(() => getModerationLogs());
  const [selectedReport, setSelectedReport] = useState<UniversalReportItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionNotes, setActionNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleAction = (
    report: UniversalReportItem,
    action: ModerationActionType,
    notes?: string
  ) => {
    let newStatus: UniversalReportItem['status'] = 'resolved';
    let defaultReason = '';

    if (action === 'remove_content') {
      newStatus = 'action_taken';
      defaultReason = `Content removed for violating ${report.reasonLabel}`;
      setContentRemovedStatus(report.contentId, true);
      if (report.contentType === 'post' && onRemovePost) {
        onRemovePost(report.contentId);
      }
      onShowToast(`Content removed & author notified`);
    } else if (action === 'restore_content') {
      newStatus = 'resolved';
      defaultReason = `Content restored after review`;
      setContentRemovedStatus(report.contentId, false);
      onShowToast(`Content restored`);
    } else if (action === 'warn_user') {
      newStatus = 'action_taken';
      const warningCount = issueUserWarning(report.targetUserId);
      defaultReason = `Official Strike ${warningCount} Warning issued to @${report.targetUsername}`;
      onShowToast(`Official warning issued to @${report.targetUsername}`);
    } else if (action === 'restrict_user') {
      newStatus = 'action_taken';
      setRestrictedStatus(report.targetUserId, true);
      defaultReason = `Account restricted (commenting & DMs disabled)`;
      onShowToast(`Account @${report.targetUsername} restricted`);
    } else if (action === 'ban_account' || action === 'suspend_account') {
      newStatus = 'action_taken';
      setBannedStatus(report.targetUserId, true);
      defaultReason = `Account permanently suspended for high-severity violation`;
      onShowToast(`Account @${report.targetUsername} permanently suspended`);
    } else if (action === 'dismiss') {
      newStatus = 'dismissed';
      defaultReason = `Report dismissed (no violation observed)`;
      onShowToast(`Report dismissed`);
    } else {
      newStatus = 'resolved';
      defaultReason = `Report resolved`;
      onShowToast(`Report marked resolved`);
    }

    // Update Report status
    const updatedReports = reports.map((r) =>
      r.id === report.id
        ? {
            ...r,
            status: newStatus,
            resolutionNotes: notes || defaultReason,
            resolvedAt: new Date().toISOString(),
            resolvedBy: 'Admin Moderator',
          }
        : r
    );
    setReports(updatedReports);
    saveUniversalReports(updatedReports);

    // Append to audit logs
    const newLog = appendModerationLog({
      reportId: report.id,
      action,
      moderatorId: 'admin_mod_01',
      moderatorName: 'Lead Trust & Safety Admin',
      targetUserId: report.targetUserId,
      targetUsername: report.targetUsername,
      contentType: report.contentType,
      contentId: report.contentId,
      reason: defaultReason,
      notes: notes || actionNotes,
    });
    setLogs([newLog, ...logs]);

    setSelectedReport(null);
    setActionNotes('');
  };

  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.targetUsername.toLowerCase().includes(q) ||
        r.reasonLabel.toLowerCase().includes(q) ||
        (r.snippet && r.snippet.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-[85] bg-black/65 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 select-none">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="neu-flat rounded-[28px] max-w-2xl w-full h-[85vh] flex flex-col bg-white overflow-hidden shadow-2xl border border-slate-200"
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-white/90 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-purple-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Safety Moderation Hub</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  Staff Only
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Review reports, enforce community guidelines, manage penalties &amp; view audit logs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-full neu-raised text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-5 pt-3 pb-2 flex items-center gap-2 border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'neu-active-blue text-white shadow-xs'
                : 'neu-raised text-slate-600 hover:text-slate-800'
            }`}
          >
            <span>Active Reports</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
              {reports.filter((r) => r.status === 'pending_review' || r.status === 'under_investigation').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'neu-active-blue text-white shadow-xs'
                : 'neu-raised text-slate-600 hover:text-slate-800'
            }`}
          >
            <span>Audit Logs</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
              {logs.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Reports Queue */}
        {activeTab === 'reports' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Filter & Search Bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 neu-inset rounded-full h-10 flex items-center px-3.5 bg-slate-50/70">
                <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user, reason or snippet..."
                  className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter reports by status"
                className="h-10 px-3 rounded-full neu-raised text-xs font-bold text-slate-700 bg-white focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending_review">Pending</option>
                <option value="under_investigation">Investigating</option>
                <option value="action_taken">Action Taken</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            {/* Reports List */}
            {filteredReports.length === 0 ? (
              <div className="neu-flat rounded-[24px] p-8 text-center space-y-2">
                <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">Queue is Clear</h4>
                <p className="text-[11px] text-slate-500">No reports matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="neu-flat rounded-[22px] p-4 border border-slate-100/80 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {report.targetUserAvatar ? (
                          <img
                            src={report.targetUserAvatar}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover neu-raised shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-slate-600 shrink-0 font-bold text-xs">
                            {report.targetUsername[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-800">
                              @{report.targetUsername}
                            </span>
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600">
                              {report.contentType}
                            </span>
                          </div>
                          <p className="text-[11px] font-semibold text-rose-600 truncate">
                            {report.reasonLabel}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                          report.status === 'action_taken'
                            ? 'bg-rose-100 text-rose-700'
                            : report.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : report.status === 'dismissed'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {report.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Content Snippet & Details */}
                    {report.snippet && (
                      <div className="p-2.5 rounded-xl neu-inset bg-slate-50 text-[11.5px] text-slate-700 italic">
                        "{report.snippet}"
                      </div>
                    )}

                    {report.details && (
                      <p className="text-[11px] text-slate-500">
                        <strong className="text-slate-700">Reporter Note:</strong> {report.details}
                      </p>
                    )}

                    {report.resolutionNotes && (
                      <div className="p-2 rounded-lg bg-emerald-50 text-[11px] text-emerald-800">
                        <strong>Resolution:</strong> {report.resolutionNotes}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] text-slate-400">
                        Submitted: {new Date(report.submittedAt).toLocaleString()}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAction(report, 'dismiss')}
                          className="px-2.5 py-1 rounded-full neu-raised text-[11px] font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                        >
                          Dismiss
                        </button>

                        <button
                          onClick={() => handleAction(report, 'warn_user')}
                          className="px-2.5 py-1 rounded-full neu-raised text-[11px] font-bold text-amber-600 hover:bg-amber-50 cursor-pointer"
                        >
                          Warn User
                        </button>

                        <button
                          onClick={() => handleAction(report, 'remove_content')}
                          className="px-2.5 py-1 rounded-full neu-raised text-[11px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          Remove Content
                        </button>

                        <button
                          onClick={() => handleAction(report, 'ban_account')}
                          className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700 cursor-pointer shadow-xs"
                        >
                          Suspend User
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Moderation Audit Logs */}
        {activeTab === 'logs' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {logs.length === 0 ? (
              <div className="neu-flat rounded-[24px] p-8 text-center space-y-2">
                <Clock className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">No Action Logs</h4>
                <p className="text-[11px] text-slate-500">Moderator actions will be recorded here.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="neu-flat rounded-2xl p-3.5 border border-slate-100 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">
                        {log.moderatorName}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-700">
                        {log.action.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Target: <strong>@{log.targetUsername || log.targetUserId}</strong> ({log.contentType})
                    </p>
                    <p className="text-slate-500 text-[10.5px] italic">
                      "{log.reason}" {log.notes && `• Note: ${log.notes}`}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
