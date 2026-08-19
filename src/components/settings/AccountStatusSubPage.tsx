import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  Sparkles,
  Lock,
  FileCheck,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { User } from '../../types';

interface AccountStatusSubPageProps {
  currentUser: User;
  onShowToast: (msg: string) => void;
  onOpenGuidelines?: () => void;
}

export const AccountStatusSubPage: React.FC<AccountStatusSubPageProps> = ({
  currentUser,
  onShowToast,
  onOpenGuidelines,
}) => {
  // Account health metrics
  const activeStrikes = 0;
  const isGoodStanding = activeStrikes === 0;

  const features = [
    {
      title: 'Story Publishing & Live Feeds',
      status: 'Active',
      good: true,
      desc: 'No restrictions on posting stories or reels',
    },
    {
      title: 'Direct Messaging & Chat Channels',
      status: 'Active',
      good: true,
      desc: 'Full rate limits and encrypted channels available',
    },
    {
      title: 'Comments & Interactions',
      status: 'Active',
      good: true,
      desc: 'Standard spam filters in normal operating range',
    },
    {
      title: 'Monetization & Creator Badges',
      status: currentUser.isVerified ? 'Verified Creator' : 'Eligible',
      good: true,
      desc: currentUser.isVerified ? 'Official blue badge active' : 'Eligible for creator program',
    },
  ];

  return (
    <div className="space-y-4 pb-4">
      {/* Primary Standing Badge Card */}
      <div className="neu-flat rounded-[28px] p-5 text-center space-y-3 bg-gradient-to-b from-emerald-50/40 via-white to-white border border-emerald-100/50">
        <div className="w-16 h-16 rounded-full bg-emerald-100/80 neu-raised flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
          <ShieldCheck className="w-9 h-9 stroke-[2.2]" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-[11px] font-extrabold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Account in Good Standing</span>
          </div>
          <h3 className="text-base font-black text-slate-800">
            {currentUser.name} (@{currentUser.username})
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Thank you for following our Community Guidelines. You have zero active strikes,
            warnings, or administrative restrictions on Funshann.
          </p>
        </div>

        {/* Community Strikes Progress Indicator */}
        <div className="p-3.5 neu-inset rounded-2xl bg-white space-y-2 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Community Policy Strikes</span>
            <span className="font-extrabold text-emerald-600">0 / 3 Strikes</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
            <div className="w-0 bg-emerald-500 h-full transition-all" />
          </div>
          <p className="text-[10px] text-slate-400">
            Accounts with 3 active strikes are temporarily suspended pending security review.
          </p>
        </div>
      </div>

      {/* Feature Access Breakdown */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 block">
          Feature Status & Privileges
        </span>

        <div className="neu-flat rounded-[24px] divide-y divide-slate-100/80 overflow-hidden">
          {features.map((f, i) => (
            <div key={i} className="p-3.5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-800">{f.title}</p>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    {f.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">{f.desc}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Information & Appeals Link */}
      <div className="neu-flat rounded-[24px] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-blue-500">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Community Guidelines</h4>
            <p className="text-[10px] text-slate-500">Learn about our safety standards and appeal process</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (onOpenGuidelines) onOpenGuidelines();
            else onShowToast('Funshann Community Guidelines: Respectful, Authentic, and Safe for Everyone');
          }}
          className="text-xs font-bold text-[#5B9DFF] hover:underline"
        >
          View
        </button>
      </div>
    </div>
  );
};
