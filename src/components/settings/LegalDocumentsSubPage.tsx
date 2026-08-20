import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  BookOpen,
  Users,
  Copyright,
  Baby,
  Info,
  AlertTriangle,
  Mail,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Lock,
  Eye,
  FileText,
  Scale,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  Clock,
  HeartHandshake,
  Share2,
  Copy,
} from 'lucide-react';
import { LEGAL_CONFIG, LegalDocumentType } from '../../data/legalConstants';

interface LegalDocumentsSubPageProps {
  documentType: LegalDocumentType;
  onNavigateDocument?: (doc: LegalDocumentType) => void;
  onShowToast: (msg: string) => void;
}

export const LegalDocumentsSubPage: React.FC<LegalDocumentsSubPageProps> = ({
  documentType,
  onNavigateDocument,
  onShowToast,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    onShowToast(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Quick navigation helper card at the bottom of documents
  const renderRelatedDocs = (current: LegalDocumentType) => {
    if (!onNavigateDocument) return null;

    const allDocs: { id: LegalDocumentType; label: string; icon: React.FC<{ className?: string }> }[] = [
      { id: 'privacy_policy', label: 'Privacy Policy', icon: Shield },
      { id: 'terms_of_service', label: 'Terms & Conditions', icon: BookOpen },
      { id: 'community_guidelines', label: 'Community Guidelines', icon: HeartHandshake },
      { id: 'copyright_ip', label: 'Copyright & IP', icon: Copyright },
      { id: 'child_safety', label: 'Child Safety & Age', icon: Baby },
      { id: 'disclaimer', label: 'App Disclaimer', icon: AlertTriangle },
      { id: 'about', label: 'About Funshann', icon: Info },
    ];

    const otherDocs = allDocs.filter((d) => d.id !== current);

    return (
      <div className="pt-2 space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Other Legal &amp; Policy Documents
        </span>
        <div className="neu-flat rounded-[22px] overflow-hidden divide-y divide-slate-100/80">
          {otherDocs.map((doc) => {
            const Icon = doc.icon;
            return (
              <button
                key={doc.id}
                onClick={() => onNavigateDocument(doc.id)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-3.5 h-3.5 text-[#5B9DFF]" />
                  <span className="text-xs font-semibold text-slate-700">{doc.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // 1. PRIVACY POLICY
  // --------------------------------------------------------------------------
  if (documentType === 'privacy_policy') {
    return (
      <div className="space-y-4 pb-4 text-slate-700 text-xs leading-relaxed">
        {/* Header Badge */}
        <div className="neu-flat rounded-[24px] p-4 flex items-center gap-3 bg-blue-50/40 border border-blue-100/60">
          <div className="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF] flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">Funshann Privacy Policy</h3>
            <p className="text-[10px] text-slate-500">
              Last Updated: <span className="font-mono text-slate-600 font-semibold">{LEGAL_CONFIG.LAST_UPDATED}</span>
            </p>
          </div>
        </div>

        {/* Content Container */}
        <div className="neu-flat rounded-[24px] p-4.5 space-y-4">
          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>1. Introduction</span>
            </h4>
            <p className="text-[11px] text-slate-600">
              Welcome to Funshann. We respect your privacy and are committed to protecting your personal data through transparent, user-controlled privacy practices. This Privacy Policy explains how information is collected, used, protected, and retained when you use the Funshann application.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">2. Information We Collect</h4>
            <p className="text-[11px] text-slate-600">
              We only collect data necessary to provide and maintain Funshann features. Specifically:
            </p>
            <div className="neu-inset rounded-2xl p-3 bg-slate-50/70 space-y-2 text-[11px] text-slate-600">
              <div>
                <span className="font-bold text-slate-800">• Account Information: </span>
                When you create or manage your account, we store your username, display name, date of birth (for age eligibility verification), email address, mobile phone number (where provided for verification/recovery), encrypted authentication credentials, and two-factor authentication configuration.
              </div>
              <div>
                <span className="font-bold text-slate-800">• Profile Information: </span>
                Your optional bio, profile avatar photo, user-defined location tag, website link, selected interest tags, and external social media links.
              </div>
              <div>
                <span className="font-bold text-slate-800">• User Posts &amp; Stories: </span>
                Photographs, uploaded media, captions, likes, dislikes, and comments that you share publicly or with followers. Stories expire automatically after 24 hours.
              </div>
              <div>
                <span className="font-bold text-slate-800">• Direct Messages: </span>
                Text messages, media attachments, and voice notes with waveform metadata. Messages configured with ephemeral rules (Immediate 5s, After-Seen 6s) are permanently purged upon expiration.
              </div>
              <div>
                <span className="font-bold text-slate-800">• Device &amp; Hardware Permissions: </span>
                Camera access (for photo capture), Microphone access (for voice note recording), Photo Library access (for media uploads), and device theme/haptic preferences. Permissions are only accessed on-demand when actively initiated by you.
              </div>
              <div>
                <span className="font-bold text-slate-800">• Location Data: </span>
                Funshann does NOT track your continuous background location. Location information is only processed when you explicitly choose to tag a location on a photo post.
              </div>
              <div>
                <span className="font-bold text-slate-800">• Notifications &amp; Diagnostic Logs: </span>
                Notification preferences for interactions (likes, comments, mentions, messages) and standard operational logs needed to ensure system uptime.
              </div>
              <div>
                <span className="font-bold text-slate-800">• Cloud &amp; Third-Party Services: </span>
                Firebase Authentication, Firestore cloud database, and Firebase Storage for secure data synchronization.
              </div>
            </div>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">3. How Information Is Used</h4>
            <p className="text-[11px] text-slate-600">
              We use collected information strictly to:
            </p>
            <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-1 pl-1">
              <li>Authenticate your account and maintain secure sessions</li>
              <li>Display and organize your posts, stories, and feed interactions</li>
              <li>Deliver real-time direct messages and voice notes</li>
              <li>Enforce Community Guidelines, prevent harassment, and maintain platform safety</li>
              <li>Process user reports and safety infractions</li>
              <li>Deliver relevant in-app notifications according to your preferences</li>
            </ul>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">4. Data Sharing &amp; Third Parties</h4>
            <p className="text-[11px] text-slate-600">
              We do NOT sell, rent, or trade your personal information to advertisers or data brokers. Data is only shared with verified backend infrastructure providers (e.g. Firebase / Google Cloud) solely for hosting and data storage, or when strictly required by applicable law, court order, or governmental regulation.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">5. Data Security</h4>
            <p className="text-[11px] text-slate-600">
              We implement industry-standard administrative, technical, and physical security safeguards including Transport Layer Security (TLS/HTTPS) in transit, encrypted database storage at rest, hashed authentication tokens, and strict access controls to protect your data against unauthorized access.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">6. Data Retention &amp; Auto-Deletion</h4>
            <p className="text-[11px] text-slate-600">
              We retain account data for as long as your account remains active. Ephemeral messages and stories are purged according to their specific timers. When you delete your account, your profile, posts, comments, media, and private messages are permanently scheduled for immediate deactivation and permanent deletion.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">7. Your Rights &amp; Consent Controls</h4>
            <p className="text-[11px] text-slate-600">
              You maintain complete authority over your personal information:
            </p>
            <div className="neu-inset rounded-2xl p-3 bg-slate-50/70 space-y-1 text-[11px] text-slate-600">
              <p>• <span className="font-semibold text-slate-800">Access &amp; Rectification:</span> Edit your profile, name, bio, and birthday directly in App Settings.</p>
              <p>• <span className="font-semibold text-slate-800">Consent Withdrawal:</span> Revoke camera, microphone, or photo permissions at any time via App Settings or Android System Settings.</p>
              <p>• <span className="font-semibold text-slate-800">Data Deletion:</span> Clear search history, delete chat threads, or permanently delete your account via <span className="font-medium text-[#5B9DFF]">Settings &gt; Account &gt; Delete Account</span>.</p>
            </div>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">8. Children's Privacy</h4>
            <p className="text-[11px] text-slate-600">
              Funshann is strictly intended for individuals aged {LEGAL_CONFIG.MINIMUM_AGE} and older. We do not knowingly collect personal data from children under {LEGAL_CONFIG.MINIMUM_AGE}. If we become aware that an account belongs to a child under {LEGAL_CONFIG.MINIMUM_AGE}, we will take immediate steps to terminate the account and purge all associated records.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">9. Changes to this Policy</h4>
            <p className="text-[11px] text-slate-600">
              We may update this Privacy Policy periodically. Any significant revisions will be communicated through in-app notifications and reflected in the updated date above.
            </p>
          </section>

          <section className="space-y-2 pt-1 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900">10. Contact Us</h4>
            <p className="text-[11px] text-slate-600">
              If you have any questions, privacy inquiries, or data requests, please contact our Privacy Team:
            </p>
            <div className="neu-inset rounded-2xl p-3 bg-slate-50/80 space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500 text-[11px]">Privacy Officer:</span>
                <span className="font-mono text-[11px] text-[#5B9DFF]">{LEGAL_CONFIG.PRIVACY_EMAIL}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500 text-[11px]">Organization:</span>
                <span className="font-mono text-[11px] text-slate-800">{LEGAL_CONFIG.LEGAL_NAME}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500 text-[11px]">Address:</span>
                <span className="font-mono text-[11px] text-slate-800">{LEGAL_CONFIG.BUSINESS_ADDRESS}</span>
              </div>
            </div>
          </section>
        </div>

        {renderRelatedDocs('privacy_policy')}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 2. TERMS & CONDITIONS
  // --------------------------------------------------------------------------
  if (documentType === 'terms_of_service') {
    return (
      <div className="space-y-4 pb-4 text-slate-700 text-xs leading-relaxed">
        {/* Header Badge */}
        <div className="neu-flat rounded-[24px] p-4 flex items-center gap-3 bg-blue-50/40 border border-blue-100/60">
          <div className="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF] flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">Funshann Terms &amp; Conditions</h3>
            <p className="text-[10px] text-slate-500">
              Last Updated: <span className="font-mono text-slate-600 font-semibold">{LEGAL_CONFIG.LAST_UPDATED}</span>
            </p>
          </div>
        </div>

        {/* Content Container */}
        <div className="neu-flat rounded-[24px] p-4.5 space-y-4">
          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">1. Acceptance of Terms &amp; Eligibility</h4>
            <p className="text-[11px] text-slate-600">
              By accessing, installing, or using the Funshann application, you agree to be bound by these Terms &amp; Conditions and our Community Guidelines. You must be at least {LEGAL_CONFIG.MINIMUM_AGE} years of age to use Funshann. If you do not agree to these terms, you must not use or access the service.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">2. Account Creation &amp; User Responsibilities</h4>
            <p className="text-[11px] text-slate-600">
              You agree to provide accurate and truthful registration information. You are solely responsible for maintaining the confidentiality of your password, PIN, and two-factor credentials, and for all activities that occur under your account.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-rose-700">3. Strictly Prohibited Activities</h4>
            <p className="text-[11px] text-slate-600">
              You agree that you will NOT engage in or upload content related to:
            </p>
            <div className="neu-inset rounded-2xl p-3 bg-rose-50/40 space-y-1.5 text-[11px] text-slate-700 border border-rose-100/50">
              <p>• <span className="font-bold text-rose-800">Nudity &amp; Sexual Content:</span> Sexually explicit media, pornography, or non-consensual imagery.</p>
              <p>• <span className="font-bold text-rose-800">Child Sexual Abuse &amp; Exploitation:</span> Any material exploiting or endangering minors (CSAM/CSAE) is subject to zero tolerance, immediate permanent termination, and mandatory law enforcement reporting.</p>
              <p>• <span className="font-bold text-rose-800">Harassment &amp; Bullying:</span> Stalking, targeted intimidation, abusive messages, threats, or doxxing.</p>
              <p>• <span className="font-bold text-rose-800">Violence &amp; Hate Speech:</span> Promoting violence, terrorism, self-harm, discrimination, or hate-based harassment.</p>
              <p>• <span className="font-bold text-rose-800">Spam, Scams &amp; Fraud:</span> Phishing, deceptive financial schemes, automated bots, or fraudulent solicitations.</p>
              <p>• <span className="font-bold text-rose-800">Impersonation &amp; Fake Accounts:</span> Misrepresenting your identity or posing as another individual, brand, or entity.</p>
              <p>• <span className="font-bold text-rose-800">Copyright Infringement:</span> Uploading media you do not have legal authorization or ownership to share.</p>
              <p>• <span className="font-bold text-rose-800">Malicious Activity:</span> Distributing viruses, reverse-engineering client code, or attempting unauthorized access to server infrastructure.</p>
            </div>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">4. User-Generated Content &amp; License</h4>
            <p className="text-[11px] text-slate-600">
              You retain all ownership and copyright in your original photographs, posts, captions, and creative media. By posting on Funshann, you grant Funshann a non-exclusive, royalty-free, worldwide license solely to host, store, display, and transmit your content across the platform as directed by your privacy settings.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">5. Safety Moderation, Reporting &amp; Blocking</h4>
            <p className="text-[11px] text-slate-600">
              Funshann provides in-app tools to block users and report harmful content or messages. We review reports and reserve the right to remove offending content, issue formal warnings, temporarily suspend account privileges, or permanently terminate accounts found in violation of these Terms.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">6. Account Termination &amp; Suspension</h4>
            <p className="text-[11px] text-slate-600">
              You may terminate your account at any time via Settings. We reserve the right to suspend or terminate accounts that violate our terms, pose safety risks, or engage in unlawful activities.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">7. Service Availability &amp; Third-Party Services</h4>
            <p className="text-[11px] text-slate-600">
              Funshann is provided on an "AS IS" and "AS AVAILABLE" basis. We do not guarantee uninterrupted or error-free operation. Third-party links or integrations accessed through Funshann are subject to their respective terms.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">8. Limitation of Liability</h4>
            <p className="text-[11px] text-slate-600">
              To the maximum extent permitted by applicable law, Funshann and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the service.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">9. Changes to Terms &amp; Governing Law</h4>
            <p className="text-[11px] text-slate-600">
              We reserve the right to modify these Terms. Continued use of Funshann after modifications constitutes acceptance of the revised Terms. These terms are governed by applicable law without regard to conflict of law provisions.
            </p>
          </section>

          <section className="space-y-2 pt-1 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900">10. Contact Information</h4>
            <p className="text-[11px] text-slate-600">
              For questions regarding these Terms &amp; Conditions, please contact:
            </p>
            <div className="neu-inset rounded-2xl p-3 bg-slate-50/80 space-y-1 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500 text-[11px]">Support Email:</span>
                <span className="font-mono text-[11px] text-[#5B9DFF]">{LEGAL_CONFIG.SUPPORT_EMAIL}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500 text-[11px]">Entity:</span>
                <span className="font-mono text-[11px] text-slate-800">{LEGAL_CONFIG.LEGAL_NAME}</span>
              </div>
            </div>
          </section>
        </div>

        {renderRelatedDocs('terms_of_service')}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 3. COMMUNITY GUIDELINES
  // --------------------------------------------------------------------------
  if (documentType === 'community_guidelines') {
    return (
      <div className="space-y-4 pb-4 text-slate-700 text-xs leading-relaxed">
        {/* Header Badge */}
        <div className="neu-flat rounded-[24px] p-4 flex items-center gap-3 bg-emerald-50/50 border border-emerald-100/60">
          <div className="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-emerald-600 flex-shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">Funshann Community Guidelines</h3>
            <p className="text-[10px] text-slate-500">Standards for a safe, authentic &amp; creative environment</p>
          </div>
        </div>

        {/* Content Container */}
        <div className="neu-flat rounded-[24px] p-4.5 space-y-4">
          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">1. Our Core Mission</h4>
            <p className="text-[11px] text-slate-600">
              Funshann is built for genuine social discovery, photography sharing, and meaningful connection. We believe every person on Funshann deserves a safe, welcoming, and inspiring community.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="text-xs font-bold text-rose-700">2. Prohibited Behaviors &amp; Content</h4>
            <p className="text-[11px] text-slate-600">
              To keep our community safe, the following content and activities are strictly forbidden:
            </p>

            <div className="space-y-2 text-[11px]">
              <div className="neu-inset rounded-2xl p-2.5 bg-slate-50/70 space-y-0.5">
                <span className="font-bold text-slate-800">• Nudity &amp; Sexually Explicit Content: </span>
                <span className="text-slate-600">No sexually explicit photos, pornographic media, or sexual solicitation.</span>
              </div>
              <div className="neu-inset rounded-2xl p-2.5 bg-rose-50/40 border border-rose-100/50 space-y-0.5">
                <span className="font-bold text-rose-800">• Child Sexual Abuse Material (CSAM) &amp; Exploitation: </span>
                <span className="text-slate-600">Strict zero-tolerance policy. Immediate ban and mandatory law enforcement reporting.</span>
              </div>
              <div className="neu-inset rounded-2xl p-2.5 bg-slate-50/70 space-y-0.5">
                <span className="font-bold text-slate-800">• Harassment, Bullying &amp; Threats: </span>
                <span className="text-slate-600">No abusive comments, persistent unwanted messages, stalking, intimidation, or violence threats.</span>
              </div>
              <div className="neu-inset rounded-2xl p-2.5 bg-slate-50/70 space-y-0.5">
                <span className="font-bold text-slate-800">• Hate-Based Abuse &amp; Discrimination: </span>
                <span className="text-slate-600">No slurs, dehumanizing language, or attacks based on race, ethnicity, religion, disability, or identity.</span>
              </div>
              <div className="neu-inset rounded-2xl p-2.5 bg-slate-50/70 space-y-0.5">
                <span className="font-bold text-slate-800">• Illegal Activity &amp; Dangerous Goods: </span>
                <span className="text-slate-600">No sales or promotion of illegal drugs, firearms, stolen goods, or criminal acts.</span>
              </div>
              <div className="neu-inset rounded-2xl p-2.5 bg-slate-50/70 space-y-0.5">
                <span className="font-bold text-slate-800">• Spam, Scams &amp; Fraud: </span>
                <span className="text-slate-600">No fake giveaways, deceptive financial schemes, automated bot posting, or phishing links.</span>
              </div>
              <div className="neu-inset rounded-2xl p-2.5 bg-slate-50/70 space-y-0.5">
                <span className="font-bold text-slate-800">• Impersonation &amp; Doxxing: </span>
                <span className="text-slate-600">No pretending to be someone else or publishing private personal records (phone numbers, addresses, private documents).</span>
              </div>
              <div className="neu-inset rounded-2xl p-2.5 bg-slate-50/70 space-y-0.5">
                <span className="font-bold text-slate-800">• Copyright Infringement &amp; Non-Consensual Media: </span>
                <span className="text-slate-600">Only post content you have created or have explicit legal permission to share.</span>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900">3. Enforcement Framework</h4>
            <p className="text-[11px] text-slate-600">
              Violations are reviewed by our safety systems and Trust &amp; Safety moderators according to a progressive enforcement structure:
            </p>
            <div className="neu-inset rounded-2xl p-3 bg-slate-50/80 space-y-1.5 text-[11px] text-slate-600">
              <p><span className="font-bold text-slate-800">1. Formal Warning:</span> Educational alert explaining the guideline breach.</p>
              <p><span className="font-bold text-slate-800">2. Content Removal:</span> Deletion of offending post, story, comment, or message.</p>
              <p><span className="font-bold text-slate-800">3. Account Restriction:</span> Temporary restriction on commenting, posting, or messaging.</p>
              <p><span className="font-bold text-slate-800">4. Temporary Suspension:</span> Time-bounded lock on account access (24h to 30 days).</p>
              <p><span className="font-bold text-slate-800">5. Permanent Ban:</span> Permanent revocation of account access and device/IP restriction.</p>
              <p><span className="font-bold text-rose-700">6. Legal Escalation:</span> Referral to law enforcement authorities and NCMEC for severe criminal violations.</p>
            </div>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">4. How to Report Violations</h4>
            <p className="text-[11px] text-slate-600">
              If you see content or receive messages that violate these rules, tap the <span className="font-semibold text-slate-800">••• menu</span> on any post or message to submit an instant report, or file a ticket in <span className="font-medium text-[#5B9DFF]">Settings &gt; Support &gt; Report a Problem</span>.
            </p>
          </section>
        </div>

        {renderRelatedDocs('community_guidelines')}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 4. COPYRIGHT & INTELLECTUAL PROPERTY
  // --------------------------------------------------------------------------
  if (documentType === 'copyright_ip') {
    return (
      <div className="space-y-4 pb-4 text-slate-700 text-xs leading-relaxed">
        {/* Header Badge */}
        <div className="neu-flat rounded-[24px] p-4 flex items-center gap-3 bg-amber-50/50 border border-amber-100/60">
          <div className="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-amber-600 flex-shrink-0">
            <Copyright className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">Copyright &amp; Intellectual Property</h3>
            <p className="text-[10px] text-slate-500">DMCA policy, content ownership &amp; takedown procedures</p>
          </div>
        </div>

        {/* Content Container */}
        <div className="neu-flat rounded-[24px] p-4.5 space-y-4">
          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">1. Original Content Ownership</h4>
            <p className="text-[11px] text-slate-600">
              Funshann values creative authorship. Users must only upload photos, graphics, artwork, video snippets, and musical works that they own or have obtained written license and permission to distribute.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">2. Submitting a Copyright Complaint</h4>
            <p className="text-[11px] text-slate-600">
              If you believe your copyrighted work has been copied and published on Funshann in a way that constitutes infringement, please submit a formal notice to our designated agent containing:
            </p>
            <div className="neu-inset rounded-2xl p-3 bg-slate-50/70 space-y-1 text-[11px] text-slate-600">
              <p>• Identification of the copyrighted work claimed to have been infringed.</p>
              <p>• The URL or exact location of the infringing material on Funshann.</p>
              <p>• Your contact details (name, email address, physical address, phone number).</p>
              <p>• A statement that you have a good-faith belief that the use is not authorized by the copyright owner.</p>
              <p>• A physical or electronic signature of the authorized copyright holder.</p>
            </div>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">3. Review &amp; Content Removal</h4>
            <p className="text-[11px] text-slate-600">
              Upon receiving a valid takedown notice, our compliance team will promptly investigate and remove or disable access to the infringing material.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">4. Repeat Infringer Policy</h4>
            <p className="text-[11px] text-slate-600">
              In accordance with statutory guidelines, Funshann maintains a repeat infringer policy. Accounts with multiple substantiated copyright violations will face feature restrictions or permanent termination.
            </p>
          </section>

          <section className="space-y-2 pt-1 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900">5. Designated Copyright Contact</h4>
            <div className="neu-inset rounded-2xl p-3 bg-slate-50/80 space-y-1 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500 text-[11px]">DMCA &amp; IP Notices:</span>
                <span className="font-mono text-[11px] text-[#5B9DFF]">{LEGAL_CONFIG.SUPPORT_EMAIL}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500 text-[11px]">Grievance Officer:</span>
                <span className="font-mono text-[11px] text-[#5B9DFF]">{LEGAL_CONFIG.GRIEVANCE_EMAIL}</span>
              </div>
            </div>
          </section>
        </div>

        {renderRelatedDocs('copyright_ip')}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 5. CHILD SAFETY & AGE POLICY
  // --------------------------------------------------------------------------
  if (documentType === 'child_safety') {
    return (
      <div className="space-y-4 pb-4 text-slate-700 text-xs leading-relaxed">
        {/* Header Badge */}
        <div className="neu-flat rounded-[24px] p-4 flex items-center gap-3 bg-rose-50/50 border border-rose-100/60">
          <div className="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-rose-600 flex-shrink-0">
            <Baby className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">Child Safety &amp; Age Policy</h3>
            <p className="text-[10px] text-slate-500">Protection of minors &amp; zero-tolerance enforcement</p>
          </div>
        </div>

        {/* Content Container */}
        <div className="neu-flat rounded-[24px] p-4.5 space-y-4">
          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">1. Minimum Age Requirement</h4>
            <p className="text-[11px] text-slate-600">
              Funshann is strictly for individuals who are at least <span className="font-bold text-slate-800">{LEGAL_CONFIG.MINIMUM_AGE} years of age</span> (or the minimum legal age for digital consent in your jurisdiction, if higher). Anyone under {LEGAL_CONFIG.MINIMUM_AGE} is not permitted to register or use the platform.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-rose-700">2. Zero Tolerance for Child Sexual Exploitation &amp; Abuse</h4>
            <p className="text-[11px] text-slate-600">
              Funshann has an absolute, uncompromising zero-tolerance policy regarding Child Sexual Abuse Material (CSAM), Child Sexual Exploitation and Abuse (CSAE), minor grooming, sexualization, or endangerment.
            </p>
            <div className="neu-inset rounded-2xl p-3 bg-rose-50/50 border border-rose-100 text-[11px] text-rose-900 space-y-1">
              <p className="font-bold">Mandatory Protocol:</p>
              <p>• Immediate and permanent account termination and IP/device banning.</p>
              <p>• Immediate preservation of digital evidence records.</p>
              <p>• Mandatory reporting to the National Center for Missing &amp; Exploited Children (NCMEC) and appropriate international law enforcement agencies.</p>
            </div>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">3. Built-In Protections for Teenage Users</h4>
            <p className="text-[11px] text-slate-600">
              For users between ages {LEGAL_CONFIG.MINIMUM_AGE} and 17, Funshann provides heightened default privacy settings, restrictions on search visibility to strangers, and strict controls over direct messaging from unapproved accounts.
            </p>
          </section>

          <section className="space-y-2 pt-1 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900">4. Reporting Child Safety Concerns</h4>
            <p className="text-[11px] text-slate-600">
              Child safety concerns are expedited with highest urgency. If you encounter any material or interaction concerning child safety:
            </p>
            <div className="neu-inset rounded-2xl p-3 bg-slate-50/80 space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500 text-[11px]">Emergency Child Safety:</span>
                <span className="font-mono text-[11px] text-rose-600 font-bold">{LEGAL_CONFIG.GRIEVANCE_EMAIL}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500 text-[11px]">In-App Reporting:</span>
                <span className="text-[11px] text-slate-700 font-medium">Select "Child Safety" in Report Menu</span>
              </div>
            </div>
          </section>
        </div>

        {renderRelatedDocs('child_safety')}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 6. APP DISCLAIMER
  // --------------------------------------------------------------------------
  if (documentType === 'disclaimer') {
    return (
      <div className="space-y-4 pb-4 text-slate-700 text-xs leading-relaxed">
        {/* Header Badge */}
        <div className="neu-flat rounded-[24px] p-4 flex items-center gap-3 bg-amber-50/40 border border-amber-100/60">
          <div className="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-amber-600 flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">App Disclaimer</h3>
            <p className="text-[10px] text-slate-500">Service limitations, user content &amp; warranties</p>
          </div>
        </div>

        {/* Content Container */}
        <div className="neu-flat rounded-[24px] p-4.5 space-y-4">
          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">1. User-Generated Content Disclaimer</h4>
            <p className="text-[11px] text-slate-600">
              Funshann is an online social discovery platform. The views, opinions, photographs, stories, comments, and messages expressed on Funshann are solely those of the individual creators and do not reflect the views or endorsements of Funshann or its operators.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">2. "As-Is" &amp; "As-Available" Service</h4>
            <p className="text-[11px] text-slate-600">
              The service is provided on an "as is" and "as available" basis without warranties of any kind, whether express, statutory, or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, non-infringement, or uninterrupted availability.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">3. User Discretion &amp; Interactions</h4>
            <p className="text-[11px] text-slate-600">
              Users are advised to exercise personal caution when interacting with other users, exchanging contact information, or following external web links. Funshann is not responsible for offline interactions or agreements made outside the platform.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-900">4. No Professional Advice</h4>
            <p className="text-[11px] text-slate-600">
              Content shared by users on Funshann does not constitute medical, legal, financial, or other professional advice.
            </p>
          </section>
        </div>

        {renderRelatedDocs('disclaimer')}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // 7. ABOUT FUNSHANN (Simple, elegant, no invented company info)
  // --------------------------------------------------------------------------
  return (
    <div className="space-y-4 pb-4">
      {/* App Card */}
      <div className="neu-flat rounded-[28px] p-6 text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#5B9DFF] to-blue-400 neu-raised flex items-center justify-center mx-auto text-white shadow-md">
          <Sparkles className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-base font-black text-slate-800">Funshann</h3>
          <p className="text-xs font-bold text-[#5B9DFF]">{LEGAL_CONFIG.APP_VERSION}</p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Neumorphic social discovery, photography sharing, tactile interactions, and ephemeral communication.
          </p>
        </div>
      </div>

      {/* App Details & Technical Info */}
      <div className="neu-flat rounded-[24px] divide-y divide-slate-100/80 overflow-hidden text-xs">
        <div className="p-3.5 flex justify-between items-center">
          <span className="text-slate-500 font-medium">Platform:</span>
          <span className="font-bold text-slate-800">Funshann Android Experience</span>
        </div>
        <div className="p-3.5 flex justify-between items-center">
          <span className="text-slate-500 font-medium">Design Language:</span>
          <span className="font-bold text-slate-800">Tactile Neumorphism 3.0</span>
        </div>
        <div className="p-3.5 flex justify-between items-center">
          <span className="text-slate-500 font-medium">Support Contact:</span>
          <span className="font-mono font-bold text-[#5B9DFF]">{LEGAL_CONFIG.SUPPORT_EMAIL}</span>
        </div>
        <div className="p-3.5 flex justify-between items-center">
          <span className="text-slate-500 font-medium">Website:</span>
          <span className="font-mono font-bold text-slate-700">{LEGAL_CONFIG.WEBSITE}</span>
        </div>
        <div className="p-3.5 flex justify-between items-center">
          <span className="text-slate-500 font-medium">Copyright:</span>
          <span className="font-mono text-[11px] text-slate-600">© 2026 {LEGAL_CONFIG.LEGAL_NAME}</span>
        </div>
      </div>

      {/* Quick Legal Navigation Links */}
      {onNavigateDocument && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Legal &amp; Policy Documents
          </span>

          <div className="neu-flat rounded-[22px] overflow-hidden divide-y divide-slate-100/80">
            <button
              onClick={() => onNavigateDocument('privacy_policy')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-[#5B9DFF]" />
                <span className="text-xs font-bold text-slate-800">Privacy Policy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateDocument('terms_of_service')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-[#5B9DFF]" />
                <span className="text-xs font-bold text-slate-800">Terms &amp; Conditions</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateDocument('community_guidelines')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <HeartHandshake className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-800">Community Guidelines</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateDocument('copyright_ip')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Copyright className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-800">Copyright &amp; Intellectual Property</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateDocument('child_safety')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Baby className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-slate-800">Child Safety &amp; Age Policy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateDocument('disclaimer')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-800">App Disclaimer</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
