import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  HeartHandshake,
  AlertTriangle,
  PhoneCall,
  Lock,
  UserX,
  FileText,
  Sparkles,
  ChevronRight,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

interface SafetyCentreSubPageProps {
  onShowToast: (msg: string) => void;
  onOpenBlockedList?: () => void;
  onOpenPrivacyControls?: () => void;
}

export const SafetyCentreSubPage: React.FC<SafetyCentreSubPageProps> = ({
  onShowToast,
  onOpenBlockedList,
  onOpenPrivacyControls,
}) => {
  const [expandedTopic, setExpandedTopic] = useState<string | null>('crisis');

  const topics = [
    {
      id: 'crisis',
      title: 'Crisis Helplines & Mental Health',
      icon: HeartHandshake,
      color: 'text-pink-500',
      content: (
        <div className="space-y-2 text-xs text-slate-600">
          <p>
            If you or someone you know is going through a difficult time or experiencing distress, free confidential help is available 24/7:
          </p>
          <div className="p-3 neu-inset rounded-2xl bg-pink-50/50 border border-pink-100/60 space-y-1.5">
            <div className="flex justify-between items-center font-bold text-pink-900">
              <span>988 Suicide & Crisis Lifeline</span>
              <a href="tel:988" className="px-2.5 py-0.5 rounded-full bg-pink-500 text-white text-[10px]">
                Call 988
              </a>
            </div>
            <div className="flex justify-between items-center font-bold text-pink-900">
              <span>Crisis Text Line</span>
              <span className="text-[10px] text-pink-700">Text HOME to 741741</span>
            </div>
            <div className="flex justify-between items-center font-bold text-pink-900">
              <span>International Resources</span>
              <span className="text-[10px] text-pink-700">befrienders.org</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'harassment',
      title: 'Anti-Harassment & Bullying Prevention',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      content: (
        <div className="space-y-2 text-xs text-slate-600">
          <p>
            Funshann strictly prohibits bullying, stalking, threats, or unsolicited harassment. You have direct tools to protect your peace:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-500">
            <li><strong>Block:</strong> Block any user to instantly hide your profile and cease all communications.</li>
            <li><strong>Restrict:</strong> Filter offensive comments and hide direct message requests without alerting them.</li>
            <li><strong>Report:</strong> Submit a confidential report so our Trust & Safety team can take swift administrative action.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'scams',
      title: 'Scam & Financial Fraud Protection',
      icon: AlertTriangle,
      color: 'text-amber-500',
      content: (
        <div className="space-y-2 text-xs text-slate-600">
          <p>
            Never share your passwords, two-factor OTP codes, or financial banking details with anyone claiming to represent Funshann staff.
          </p>
          <p className="p-2.5 neu-inset rounded-xl bg-amber-50 text-amber-900 text-[11px]">
            Official staff will never ask for your password via direct message or email.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 pb-4">
      {/* Banner */}
      <div className="neu-flat rounded-[24px] p-4.5 flex items-start gap-3 bg-gradient-to-r from-emerald-50/50 via-white to-white border border-emerald-100/60">
        <div className="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-emerald-600 flex-shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-800">Funshann Safety & Well-being</h4>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
            Resources, crisis support contacts, and safety guidance to ensure a respectful community.
          </p>
        </div>
      </div>

      {/* Safety Hub Accordion */}
      <div className="space-y-2.5">
        {topics.map((t) => {
          const Icon = t.icon;
          const isExpanded = expandedTopic === t.id;
          return (
            <div key={t.id} className="neu-flat rounded-[24px] overflow-hidden transition-all">
              <button
                onClick={() => setExpandedTopic(isExpanded ? null : t.id)}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${t.color}`} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">{t.title}</h4>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    isExpanded ? 'rotate-180 text-[#5B9DFF]' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 pt-1 border-t border-slate-100"
                  >
                    {t.content}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Quick Access Tools */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 block">
          Quick Safety Actions
        </span>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              if (onOpenBlockedList) onOpenBlockedList();
              else onShowToast('Opening Blocked List...');
            }}
            className="neu-flat rounded-2xl p-3 text-left hover:bg-slate-50/50 cursor-pointer transition-all"
          >
            <UserX className="w-5 h-5 text-red-500 mb-1" />
            <p className="text-xs font-bold text-slate-800">Blocked Accounts</p>
            <p className="text-[10px] text-slate-400">Manage blocked users</p>
          </button>

          <button
            onClick={() => {
              if (onOpenPrivacyControls) onOpenPrivacyControls();
              else onShowToast('Opening Privacy Controls...');
            }}
            className="neu-flat rounded-2xl p-3 text-left hover:bg-slate-50/50 cursor-pointer transition-all"
          >
            <Lock className="w-5 h-5 text-[#5B9DFF] mb-1" />
            <p className="text-xs font-bold text-slate-800">Privacy Hub</p>
            <p className="text-[10px] text-slate-400">Lock down visibility</p>
          </button>
        </div>
      </div>
    </div>
  );
};
