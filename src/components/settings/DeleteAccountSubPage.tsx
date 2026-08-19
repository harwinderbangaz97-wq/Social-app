import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  Trash2,
  ShieldAlert,
  Lock,
  Mail,
  CheckCircle2,
  X,
  HelpCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { User } from '../../types';

interface DeleteAccountSubPageProps {
  currentUser: User;
  onCancel: () => void;
  onConfirmDelete: (reason: string, feedback: string) => void;
  onShowToast: (msg: string) => void;
}

const DELETION_REASONS = [
  'Privacy concerns or data tracking',
  'Too distracting / Spending too much time',
  'Creating a new or alternative account',
  'Trouble getting started or using the app',
  'Safety / receiving unwanted direct messages',
  'Other reason',
];

export const DeleteAccountSubPage: React.FC<DeleteAccountSubPageProps> = ({
  currentUser,
  onCancel,
  onConfirmDelete,
  onShowToast,
}) => {
  const [step, setStep] = useState<'reason' | 'warning' | 'otp_verify' | 'final_confirm'>('reason');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customFeedback, setCustomFeedback] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [confirmPhrase, setConfirmPhrase] = useState<string>('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleSendOtp = () => {
    setOtpSent(true);
    setResendTimer(45);
    onShowToast(`Verification code sent to ${currentUser.email || 'your registered email'}`);
    setStep('otp_verify');
  };

  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const updated = [...otpCode];
    updated[index] = clean;
    setOtpCode(updated);

    // Auto-focus next input
    if (clean && index < 5) {
      const nextInput = document.getElementById(`del-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const code = otpCode.join('');
    if (code.length < 6) {
      onShowToast('Please enter the complete 6-digit verification code.');
      return;
    }
    // Verified successfully -> move to final double-confirmation
    onShowToast('Identity verified successfully.');
    setStep('final_confirm');
  };

  const handleExecuteDeletion = () => {
    if (confirmPhrase.trim().toUpperCase() !== 'DELETE') {
      onShowToast('Please type "DELETE" exactly to confirm permanent deletion.');
      return;
    }

    onConfirmDelete(selectedReason, customFeedback);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Warning Header Banner */}
      <div className="neu-flat rounded-[24px] p-4 bg-red-50/40 border border-red-100/70 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 neu-raised flex items-center justify-center text-red-600 flex-shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-red-900">Permanent Account Deletion</h4>
          <p className="text-[11px] text-red-700/90 leading-relaxed mt-0.5">
            This action is irreversible. All your posts, stories, followers, direct messages, and saved
            media will be permanently removed from Funshann.
          </p>
        </div>
      </div>

      {step === 'reason' && (
        <div className="space-y-4">
          <div className="neu-flat rounded-[24px] p-4 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">
              Why are you deleting your account?
            </span>
            <p className="text-[11px] text-slate-500">
              Please let us know why you're leaving so we can continue improving Funshann.
            </p>

            <div className="space-y-2 pt-1">
              {DELETION_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full p-3 rounded-2xl text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    selectedReason === reason
                      ? 'neu-active-blue text-white shadow-xs'
                      : 'neu-inset text-slate-700 hover:bg-slate-100/80'
                  }`}
                >
                  <span>{reason}</span>
                  {selectedReason === reason && <CheckCircle2 className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>

            {selectedReason && (
              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-bold text-slate-600">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={customFeedback}
                  onChange={(e) => setCustomFeedback(e.target.value)}
                  placeholder="Tell us what we could have done better..."
                  rows={3}
                  className="w-full p-3 rounded-2xl neu-inset bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 h-11 rounded-2xl neu-raised text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (!selectedReason) {
                  onShowToast('Please select a reason before proceeding.');
                  return;
                }
                setStep('warning');
              }}
              disabled={!selectedReason}
              className={`flex-1 h-11 rounded-2xl text-xs font-bold text-white transition-all ${
                selectedReason ? 'neu-active-blue cursor-pointer shadow-xs' : 'bg-slate-300 opacity-60 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 'warning' && (
        <div className="space-y-4">
          <div className="neu-flat rounded-[24px] p-4.5 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">
              What will be permanently erased:
            </span>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                <p>
                  <strong>Profile & Handle:</strong> @{currentUser.username} will be released and your profile removed.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                <p>
                  <strong>Content & Media:</strong> All {currentUser.postsCount || 18} posts, stories, and saved bookmarks will be deleted.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                <p>
                  <strong>Direct Conversations:</strong> Message histories will be securely purged from servers.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                <p>
                  <strong>Social Graph:</strong> Followers and following connections will be disconnected.
                </p>
              </div>
            </div>

            <div className="p-3 neu-inset rounded-2xl bg-amber-50/60 border border-amber-200/60 text-[11px] text-amber-900 flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>30-Day Deactivation Grace Period:</strong> You can cancel deletion by logging back in within 30 days. After 30 days, purge is permanent.
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep('reason')}
              className="flex-1 h-11 rounded-2xl neu-raised text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleSendOtp}
              className="flex-1 h-11 rounded-2xl bg-red-500 hover:bg-red-600 text-xs font-bold text-white shadow-xs cursor-pointer"
            >
              Verify Identity with OTP
            </button>
          </div>
        </div>
      )}

      {step === 'otp_verify' && (
        <div className="space-y-4">
          <div className="neu-flat rounded-[24px] p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full neu-raised flex items-center justify-center mx-auto text-[#5B9DFF]">
              <Mail className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-800">Security Verification Code</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Enter the 6-digit verification code sent to{' '}
                <strong className="text-slate-700">{currentUser.email || 'your registered email'}</strong>
              </p>
            </div>

            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-2 pt-1">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <input
                  key={idx}
                  id={`del-otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otpCode[idx]}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-10 h-12 rounded-2xl neu-inset bg-white text-center text-base font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              ))}
            </div>

            {/* Hint & Resend */}
            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-slate-400 text-[11px]">Simulated demo code: 123456</span>
              {resendTimer > 0 ? (
                <span className="text-slate-400 text-[11px]">Resend in {resendTimer}s</span>
              ) : (
                <button
                  onClick={handleSendOtp}
                  className="text-xs font-bold text-[#5B9DFF] hover:underline"
                >
                  Resend Code
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep('warning')}
              className="flex-1 h-11 rounded-2xl neu-raised text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleVerifyOtp}
              className="flex-1 h-11 rounded-2xl neu-active-blue text-xs font-bold text-white shadow-xs cursor-pointer"
            >
              Verify & Proceed
            </button>
          </div>
        </div>
      )}

      {step === 'final_confirm' && (
        <div className="space-y-4">
          <div className="neu-flat rounded-[24px] p-5 space-y-4 text-center border-2 border-red-300">
            <div className="w-14 h-14 rounded-full bg-red-100 neu-raised flex items-center justify-center mx-auto text-red-600 shadow-sm">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-800">Final Security Confirmation</h3>
              <p className="text-xs text-slate-500 mt-1">
                Type <span className="font-extrabold text-red-600">DELETE</span> in capital letters below to confirm permanent deletion of @{currentUser.username}.
              </p>
            </div>

            <input
              type="text"
              value={confirmPhrase}
              onChange={(e) => setConfirmPhrase(e.target.value)}
              placeholder="Type DELETE here"
              className="w-full h-11 px-4 rounded-2xl neu-inset bg-white text-center text-sm font-black tracking-widest text-red-600 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 h-12 rounded-2xl neu-raised text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel & Keep Account
            </button>
            <button
              onClick={handleExecuteDeletion}
              disabled={confirmPhrase.trim().toUpperCase() !== 'DELETE'}
              className={`flex-1 h-12 rounded-2xl text-xs font-bold text-white transition-all ${
                confirmPhrase.trim().toUpperCase() === 'DELETE'
                  ? 'bg-red-600 hover:bg-red-700 shadow-md cursor-pointer'
                  : 'bg-slate-300 opacity-60 cursor-not-allowed'
              }`}
            >
              Delete Account Permanently
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
