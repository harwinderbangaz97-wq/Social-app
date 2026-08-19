import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Shield,
  BookOpen,
  Info,
  Scale,
  ExternalLink,
  Code,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface LegalDocumentsSubPageProps {
  documentType: 'privacy_policy' | 'terms_of_service' | 'more_info' | 'other_legal';
  onShowToast: (msg: string) => void;
}

export const LegalDocumentsSubPage: React.FC<LegalDocumentsSubPageProps> = ({
  documentType,
  onShowToast,
}) => {
  if (documentType === 'more_info') {
    return (
      <div className="space-y-4 pb-4">
        {/* App Card */}
        <div className="neu-flat rounded-[28px] p-6 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#5B9DFF] to-blue-400 neu-raised flex items-center justify-center mx-auto text-white shadow-md">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-black text-slate-800">Funshann for Android</h3>
            <p className="text-xs font-bold text-[#5B9DFF]">Version 2.4.0 (Build 2026.08.16)</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Architectural social discovery, ephemeral encrypted messaging, and tactile neumorphic design.
            </p>
          </div>
        </div>

        {/* Specifications */}
        <div className="neu-flat rounded-[24px] divide-y divide-slate-100/80 overflow-hidden text-xs">
          <div className="p-3.5 flex justify-between">
            <span className="text-slate-500 font-medium">Platform Runtime:</span>
            <span className="font-bold text-slate-800">Android 15 (ARM64-v8a)</span>
          </div>
          <div className="p-3.5 flex justify-between">
            <span className="text-slate-500 font-medium">Design System:</span>
            <span className="font-bold text-slate-800">Neumorphism Soft 3.0</span>
          </div>
          <div className="p-3.5 flex justify-between">
            <span className="text-slate-500 font-medium">Cryptography:</span>
            <span className="font-bold text-slate-800">SHA-256 / AES-GCM 256</span>
          </div>
          <div className="p-3.5 flex justify-between">
            <span className="text-slate-500 font-medium">Developer:</span>
            <span className="font-bold text-slate-800">Funshann Global Labs Inc.</span>
          </div>
          <div className="p-3.5 flex justify-between">
            <span className="text-slate-500 font-medium">License:</span>
            <span className="font-bold text-slate-800">Proprietary Commercial</span>
          </div>
        </div>
      </div>
    );
  }

  if (documentType === 'privacy_policy') {
    return (
      <div className="space-y-4 pb-4 text-slate-700 text-xs leading-relaxed">
        <div className="neu-flat rounded-[24px] p-4 flex items-center gap-3 bg-blue-50/40 border border-blue-100/60">
          <Shield className="w-8 h-8 text-[#5B9DFF] flex-shrink-0" />
          <div>
            <h3 className="text-xs font-bold text-slate-800">Funshann Privacy Policy</h3>
            <p className="text-[10px] text-slate-500">Effective Date: August 16, 2026</p>
          </div>
        </div>

        <div className="neu-flat rounded-[24px] p-4.5 space-y-3.5">
          <section className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900">1. Information We Collect</h4>
            <p className="text-[11px] text-slate-600">
              We collect information you provide directly to us when creating an account, editing your profile, uploading stories, and communicating with friends. Device identifiers and anonymous crash analytics are collected only to maintain system stability.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900">2. Ephemeral Messages & Privacy</h4>
            <p className="text-[11px] text-slate-600">
              Direct messages configured with Disappearing Timers or After-Seen destruction rules are permanently shredded from active memory and disk storage once the expiration condition is satisfied.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900">3. Contact Syncing Privacy</h4>
            <p className="text-[11px] text-slate-600">
              When contact syncing is enabled, phone numbers are transformed into irreversible cryptographic hashes on your device before matching. Funshann never sells personal address books to third-party advertisers.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900">4. Your Data Rights (GDPR & CCPA)</h4>
            <p className="text-[11px] text-slate-600">
              You have the full right to export your data, modify personal attributes, revoke permissions at will, and permanently delete your account and all associated media from our platform.
            </p>
          </section>
        </div>
      </div>
    );
  }

  if (documentType === 'terms_of_service') {
    return (
      <div className="space-y-4 pb-4 text-slate-700 text-xs leading-relaxed">
        <div className="neu-flat rounded-[24px] p-4 flex items-center gap-3 bg-blue-50/40 border border-blue-100/60">
          <BookOpen className="w-8 h-8 text-[#5B9DFF] flex-shrink-0" />
          <div>
            <h3 className="text-xs font-bold text-slate-800">Terms of Service</h3>
            <p className="text-[10px] text-slate-500">Last Updated: August 16, 2026</p>
          </div>
        </div>

        <div className="neu-flat rounded-[24px] p-4.5 space-y-3.5">
          <section className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900">1. Acceptance of Terms</h4>
            <p className="text-[11px] text-slate-600">
              By accessing or using Funshann, you agree to be bound by these Terms of Service and our Community Guidelines. If you do not agree to these terms, do not access or use our services.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900">2. User Conduct & Acceptable Use</h4>
            <p className="text-[11px] text-slate-600">
              You agree not to engage in unlawful harassment, spam dissemination, unauthorized bot scraping, trademark infringement, or impersonation of individuals or entities.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900">3. Intellectual Property Rights</h4>
            <p className="text-[11px] text-slate-600">
              You retain full ownership and copyright of all original photographs, stories, captions, and creative media you upload to Funshann.
            </p>
          </section>

          <section className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900">4. Account Termination</h4>
            <p className="text-[11px] text-slate-600">
              We reserve the right to suspend or terminate accounts that repeatedly violate safety policies after appropriate notice and appeal opportunity.
            </p>
          </section>
        </div>
      </div>
    );
  }

  // Other Legal
  return (
    <div className="space-y-4 pb-4">
      <div className="neu-flat rounded-[24px] p-4 flex items-center gap-3 bg-purple-50/40 border border-purple-100/60">
        <Scale className="w-8 h-8 text-purple-600 flex-shrink-0" />
        <div>
          <h3 className="text-xs font-bold text-slate-800">Legal & Open Source Notices</h3>
          <p className="text-[10px] text-slate-500">Compliance, Copyright & Open Source Attributions</p>
        </div>
      </div>

      <div className="neu-flat rounded-[24px] p-4.5 space-y-3">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-900">Open Source Software Attributions</h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Funshann is built with modern open-source software libraries, including React, Tailwind CSS, Lucide Icons, and Motion under MIT & Apache 2.0 licenses.
          </p>
        </div>

        <div className="p-3 neu-inset rounded-2xl bg-slate-50 space-y-1.5 font-mono text-[10px] text-slate-600">
          <p>• Lucide React — ISC License</p>
          <p>• Motion (Framer) — MIT License</p>
          <p>• Tailwind CSS — MIT License</p>
          <p>• Canvas Confetti — MIT License</p>
        </div>

        <div className="space-y-1 pt-1">
          <h4 className="text-xs font-bold text-slate-900">Copyright Notice</h4>
          <p className="text-[11px] text-slate-500">
            © 2026 Funshann Global Labs Inc. All rights reserved. Funshann and the Funshann glyph are registered trademarks.
          </p>
        </div>
      </div>
    </div>
  );
};
