import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  X,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Info,
  Lock,
  Flag,
} from 'lucide-react';
import {
  OFFICIAL_REPORT_REASONS,
  ReportReasonKey,
  ReportContentType,
  UniversalReportItem,
} from '../types/safety';
import { submitUniversalReport } from '../services/safetyService';

interface UniversalReportModalProps {
  isOpen: boolean;
  contentType: ReportContentType;
  contentId: string;
  targetUser: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  reporterUserId: string;
  snippet?: string;
  mediaUrl?: string;
  postId?: string;
  threadId?: string;
  onClose: () => void;
  onReportSubmitted?: (report: UniversalReportItem) => void;
  onShowToast?: (message: string) => void;
}

export const UniversalReportModal: React.FC<UniversalReportModalProps> = ({
  isOpen,
  contentType,
  contentId,
  targetUser,
  reporterUserId,
  snippet,
  mediaUrl,
  postId,
  threadId,
  onClose,
  onReportSubmitted,
  onShowToast,
}) => {
  const [selectedReason, setSelectedReason] = useState<ReportReasonKey>('harassment');
  const [details, setDetails] = useState('');
  const [step, setStep] = useState<'select' | 'details' | 'success'>('select');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectReason = (key: ReportReasonKey) => {
    setSelectedReason(key);
    setStep('details');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = submitUniversalReport({
      contentType,
      contentId,
      targetUserId: targetUser.id,
      targetUsername: targetUser.username,
      targetUserAvatar: targetUser.avatar,
      reporterUserId,
      reasonKey: selectedReason,
      details,
      snippet,
      mediaUrl,
      postId,
      threadId,
    });

    setIsSubmitting(false);
    setStep('success');

    if (onReportSubmitted) {
      onReportSubmitted(result.report);
    }

    if (onShowToast) {
      if (result.isDuplicate) {
        onShowToast('You have already submitted a report for this item.');
      } else {
        onShowToast('Report submitted confidentially. Thank you.');
      }
    }

    setTimeout(() => {
      handleClose();
    }, 1800);
  };

  const handleClose = () => {
    setStep('select');
    setDetails('');
    setSelectedReason('harassment');
    onClose();
  };

  const getContentTypeLabel = () => {
    switch (contentType) {
      case 'post':
        return 'Post';
      case 'comment':
        return 'Comment';
      case 'profile':
        return 'Profile';
      case 'message':
        return 'Message';
      default:
        return 'Content';
    }
  };

  const selectedReasonObj = OFFICIAL_REPORT_REASONS.find((r) => r.key === selectedReason);

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none"
      onClick={handleClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="neu-flat rounded-t-[32px] sm:rounded-[28px] max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden bg-white shadow-2xl border border-slate-200/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-xs">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Report {getContentTypeLabel()}</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                @{targetUser.username} • Confidential Report
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full neu-raised flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {step === 'success' ? (
          <div className="p-8 text-center space-y-3 flex flex-col items-center justify-center min-h-[280px]">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center neu-raised mb-1"
            >
              <CheckCircle2 className="w-7 h-7" />
            </motion.div>
            <h4 className="text-base font-bold text-slate-800">Report Submitted</h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Thank you for keeping Funshann safe. Our moderation team will review this report confidentially. Your identity is strictly protected.
            </p>
          </div>
        ) : step === 'details' ? (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Selected Reason Badge */}
            <div className="neu-inset rounded-[20px] p-3.5 bg-slate-50/70 border border-slate-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{selectedReasonObj?.icon}</span>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Selected Reason
                  </span>
                  <p className="text-xs font-bold text-slate-800">{selectedReasonObj?.label}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep('select')}
                className="text-[11px] font-bold text-[#5B9DFF] hover:underline"
              >
                Change
              </button>
            </div>

            {/* Target snippet / preview */}
            {snippet && (
              <div className="p-3 rounded-2xl neu-inset bg-slate-50/40 border border-slate-100 text-xs text-slate-600 line-clamp-3 italic">
                "{snippet}"
              </div>
            )}

            {/* Optional Details Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-0.5 block">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide additional context or timestamps to assist our safety team..."
                rows={3}
                className="w-full neu-inset rounded-2xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]/40 resize-none"
              />
            </div>

            {/* Confidentiality notice */}
            <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-blue-50/50 p-3 rounded-2xl border border-blue-100/60">
              <Lock className="w-4 h-4 text-[#5B9DFF] shrink-0 mt-0.5" />
              <p>
                <strong>Strictly Confidential:</strong> @{targetUser.username} will not see who submitted this report. Reports are sent directly to the Funshann moderation queue.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="flex-1 h-11 rounded-full neu-raised text-xs font-bold text-slate-700 hover:text-slate-900 transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-full neu-active-blue text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        ) : (
          /* Step 1: Reason Selector with 13 official reasons */
          <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[60vh]">
            <div className="px-1 pb-1">
              <p className="text-xs text-slate-500 leading-relaxed">
                Why are you reporting this {getContentTypeLabel().toLowerCase()}? Choose the option that best describes the issue:
              </p>
            </div>

            <div className="space-y-1.5">
              {OFFICIAL_REPORT_REASONS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => handleSelectReason(r.key)}
                  className="w-full p-3 rounded-2xl text-left neu-flat hover:bg-rose-50/40 hover:border-rose-200 transition-all flex items-center justify-between group cursor-pointer border border-transparent"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className="text-xl flex-shrink-0">{r.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-rose-600 transition-colors truncate">
                        {r.label}
                      </p>
                      <p className="text-[10.5px] text-slate-500 truncate mt-0.5">
                        {r.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
