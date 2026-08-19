import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, X, CheckCircle2, AlertTriangle, MessageSquare, Flag, Lock } from 'lucide-react';
import { Message, MessageReportReason, User } from '../types';

interface ReportMessageModalProps {
  isOpen: boolean;
  message: Message | null;
  participant: User;
  onClose: () => void;
  onSubmitReport: (reason: MessageReportReason, details?: string) => void;
}

const REPORT_REASONS: {
  key: MessageReportReason;
  label: string;
  desc: string;
  icon: string;
}[] = [
  {
    key: 'spam',
    label: 'Spam or Commercial',
    desc: 'Unsolicited advertisements, repetitive links, or bot messages',
    icon: '🚨',
  },
  {
    key: 'harassment',
    label: 'Harassment or Bullying',
    desc: 'Targeted hostility, intimidation, or unwelcome personal remarks',
    icon: '⚠️',
  },
  {
    key: 'abuse',
    label: 'Hate Speech or Abuse',
    desc: 'Discriminatory attacks, hate symbols, or violent threats',
    icon: '🚫',
  },
  {
    key: 'inappropriate',
    label: 'Inappropriate Content',
    desc: 'Sexually explicit material, graphic violence, or safety violations',
    icon: '🔞',
  },
  {
    key: 'scam',
    label: 'Scam, Fraud or Impersonation',
    desc: 'Financial requests, fake identities, phishing or deception',
    icon: '💸',
  },
  {
    key: 'other',
    label: 'Other Community Violation',
    desc: 'Any other violation of Funshann community safety guidelines',
    icon: '❓',
  },
];

export const ReportMessageModal: React.FC<ReportMessageModalProps> = ({
  isOpen,
  message,
  participant,
  onClose,
  onSubmitReport,
}) => {
  const [selectedReason, setSelectedReason] = useState<MessageReportReason>('spam');
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !message) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReport(selectedReason, details);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setDetails('');
      setSelectedReason('spam');
      onClose();
    }, 1400);
  };

  const getSnippet = () => {
    if (message.text) return `"${message.text}"`;
    if (message.imageUrl) return '📷 Photo attachment';
    if (message.voiceNote) return '🎙️ Voice note';
    return 'Message content';
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="neu-flat rounded-t-[30px] sm:rounded-[28px] max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden bg-white shadow-2xl border border-slate-200/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-xs">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Report Message</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Sent by {participant.name} (@{participant.username})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full neu-raised flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-3 flex flex-col items-center justify-center min-h-[300px]">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center neu-raised mb-1"
            >
              <CheckCircle2 className="w-7 h-7" />
            </motion.div>
            <h4 className="text-base font-bold text-slate-800">Report Submitted</h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Thank you for keeping Funshann safe. Our safety team will review this message confidentially. Your identity is strictly protected.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Snippet Card */}
            <div className="neu-inset rounded-[18px] p-3 bg-slate-50/70 border border-slate-200/60 flex items-start gap-2.5">
              <MessageSquare className="w-4 h-4 text-[#5B9DFF] flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Reported Message
                </span>
                <p className="text-xs text-slate-700 font-medium truncate mt-0.5">
                  {getSnippet()}
                </p>
              </div>
            </div>

            {/* Reason Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-0.5">
                Select Reason for Report
              </label>

              <div className="space-y-1.5">
                {REPORT_REASONS.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setSelectedReason(r.key)}
                    className={`w-full p-2.5 rounded-[16px] text-left flex items-start gap-3 transition-all cursor-pointer ${
                      selectedReason === r.key
                        ? 'neu-inset ring-2 ring-rose-500/40 bg-rose-50/30'
                        : 'neu-raised hover:bg-slate-50/60'
                    }`}
                  >
                    <span className="text-base flex-shrink-0 mt-0.5">{r.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${selectedReason === r.key ? 'text-rose-700' : 'text-slate-800'}`}>
                          {r.label}
                        </span>
                        {selectedReason === r.key && (
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                        {r.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-0.5">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide any context that will help our safety review..."
                rows={2}
                maxLength={300}
                className="w-full neu-inset rounded-[16px] p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-none bg-slate-50/50"
              />
            </div>

            {/* Reporter Privacy Guarantee Callout */}
            <div className="flex items-center gap-2 p-2.5 rounded-[14px] bg-blue-50/60 text-[#5B9DFF] text-[11px] font-semibold">
              <Lock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Your identity is completely confidential and anonymous to the sender.</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 rounded-full neu-raised text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
              >
                Cancel
              </button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 h-10 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:bg-rose-700 transition cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Submit Report</span>
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
