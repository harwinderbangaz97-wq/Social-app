import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertOctagon,
  Lock,
  X,
  Sparkles,
} from 'lucide-react';
import { UserReportItem } from '../../types';
import { getUserReports } from '../../services/userReportsService';

interface MyReportsSubPageProps {
  onShowToast: (msg: string) => void;
}

export const MyReportsSubPage: React.FC<MyReportsSubPageProps> = ({ onShowToast }) => {
  const [reports, setReports] = useState<UserReportItem[]>(() => getUserReports());
  const [selectedReport, setSelectedReport] = useState<UserReportItem | null>(null);

  const totalReportsCount = reports.length;
  const actionTakenCount = reports.filter((r) => r.status === 'action_taken' || r.status === 'resolved').length;
  const underReviewCount = reports.filter((r) => r.status === 'under_review').length;

  const formatStatus = (status: UserReportItem['status']) => {
    switch (status) {
      case 'action_taken':
        return { label: 'Action Taken', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'resolved':
        return { label: 'Resolved', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'under_review':
        return { label: 'Under Review', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'dismissed':
        return { label: 'Reviewed / No Violation', color: 'bg-slate-50 text-slate-600 border-slate-200' };
      default:
        return { label: status, color: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };

  const formatCategory = (cat: UserReportItem['category']) => {
    switch (cat) {
      case 'spam':
        return 'Spam & Automated Bots';
      case 'harassment':
        return 'Harassment & Bullying';
      case 'hate_speech':
        return 'Hate Speech & Discrimination';
      case 'scam':
        return 'Scam & Financial Fraud';
      case 'impersonation':
        return 'Impersonation';
      case 'inappropriate':
        return 'Inappropriate Media';
      default:
        return 'Community Violation';
    }
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Metric Overview Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="neu-flat rounded-2xl p-3 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submitted</p>
          <p className="text-lg font-black text-slate-800 mt-0.5">{totalReportsCount}</p>
          <span className="text-[9px] text-slate-500 font-medium">Total Cases</span>
        </div>

        <div className="neu-flat rounded-2xl p-3 text-center">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Actioned</p>
          <p className="text-lg font-black text-emerald-600 mt-0.5">{actionTakenCount}</p>
          <span className="text-[9px] text-slate-500 font-medium">Strikes / Fixes</span>
        </div>

        <div className="neu-flat rounded-2xl p-3 text-center">
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Pending</p>
          <p className="text-lg font-black text-amber-600 mt-0.5">{underReviewCount}</p>
          <span className="text-[9px] text-slate-500 font-medium">In Queue</span>
        </div>
      </div>

      {/* Reporter Privacy Guarantee */}
      <div className="neu-inset rounded-2xl p-3 bg-blue-50/40 border border-blue-100/60 flex items-start gap-2.5">
        <Lock className="w-4 h-4 text-[#5B9DFF] flex-shrink-0 mt-0.5" />
        <div className="text-[11px] text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-800">Confidential Reporting:</span> Reported accounts
          never see who filed the report. Your identity is strictly shielded by Funshann Trust & Safety protocols.
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 block">
          Your Report History
        </span>

        {reports.length === 0 ? (
          <div className="neu-flat rounded-[24px] p-6 text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800">No Reports Submitted</h4>
            <p className="text-[11px] text-slate-500">
              You have not filed any user safety reports. Thank you for keeping Funshann safe!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {reports.map((report) => {
              const statusCfg = formatStatus(report.status);
              return (
                <motion.div
                  key={report.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedReport(report)}
                  className="neu-flat rounded-[22px] p-3.5 flex items-center justify-between hover:bg-slate-50/50 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-slate-700">
                      <ShieldAlert className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          {formatCategory(report.category)}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Reported @{report.reportedUsername} • {new Date(report.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Report Details Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.95 }}
              className="w-full max-w-sm bg-white rounded-[28px] p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#5B9DFF]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Report #{selectedReport.id}</h3>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="neu-inset rounded-2xl p-3.5 space-y-2 bg-slate-50">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Violation Type:</span>
                  <span className="font-bold text-slate-800">{formatCategory(selectedReport.category)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Reported Account:</span>
                  <span className="font-bold text-slate-800">@{selectedReport.reportedUsername}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Filed On:</span>
                  <span className="font-medium text-slate-700">{new Date(selectedReport.submittedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Current Status:</span>
                  <span className="font-bold text-emerald-600">
                    {formatStatus(selectedReport.status).label}
                  </span>
                </div>
              </div>

              {selectedReport.evidenceSnippet && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Reported Evidence
                  </span>
                  <p className="text-xs text-slate-700 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/60">
                    "{selectedReport.evidenceSnippet}"
                  </p>
                </div>
              )}

              {selectedReport.resolutionNotes && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Trust & Safety Resolution
                  </span>
                  <p className="text-xs text-slate-700 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/60">
                    {selectedReport.resolutionNotes}
                  </p>
                </div>
              )}

              <button
                onClick={() => setSelectedReport(null)}
                className="w-full h-10 rounded-2xl neu-active-blue text-xs font-bold text-white shadow-xs"
              >
                Close Report Details
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
