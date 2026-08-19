import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  MessageSquare,
  Shield,
  User,
  Sparkles,
  Camera,
  CheckCircle2,
  Mail,
  Send,
} from 'lucide-react';

interface HelpCentreSubPageProps {
  onShowToast: (msg: string) => void;
}

interface FAQItem {
  id: string;
  category: 'account' | 'messages' | 'posts' | 'privacy';
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'faq_1',
    category: 'account',
    question: 'How often can I change my username?',
    answer: 'To prevent impersonation and maintain account security, usernames can only be changed once every 90 days. You can view your remaining cooldown days in Account Settings > Username.',
  },
  {
    id: 'faq_2',
    category: 'account',
    question: 'How do I enable Two-Factor Authentication (2FA)?',
    answer: 'Navigate to Settings > Two-Factor Authentication. You can link an authenticator app (such as Google Authenticator) or enable SMS verification for extra login protection.',
  },
  {
    id: 'faq_3',
    category: 'messages',
    question: 'What are Disappearing Messages and how do they work?',
    answer: 'Disappearing messages automatically delete from both participants\' devices either immediately after delivery or after being viewed, according to your privacy timer settings.',
  },
  {
    id: 'faq_4',
    category: 'privacy',
    question: 'Can someone see if I view their profile or story?',
    answer: 'Story views are shared with the story creator for 24 hours. Profile visits are completely private and never broadcasted to account holders.',
  },
  {
    id: 'faq_5',
    category: 'posts',
    question: 'What is the maximum resolution for uploaded photos?',
    answer: 'Funshann supports ultra-crisp high-resolution photos up to 4K (3840x2160) with lossless WebP compression for lightning-fast feed rendering.',
  },
];

export const HelpCentreSubPage: React.FC<HelpCentreSubPageProps> = ({ onShowToast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'account' | 'messages' | 'privacy' | 'posts'>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq_1');
  const [showContactModal, setShowContactModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCat = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesQuery =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) {
      onShowToast('Please write a message describing your inquiry.');
      return;
    }
    setShowContactModal(false);
    setSupportMessage('');
    onShowToast('Support ticket #SUP-4421 created! Our support team will reply within a few hours.');
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Search Header */}
      <div className="relative">
        <div className="w-full neu-inset rounded-full h-12 flex items-center px-4 transition-all focus-within:ring-2 focus-within:ring-[#5B9DFF]/40">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help topics, FAQs, guides..."
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'All Topics' },
          { id: 'account', label: 'Account & 2FA' },
          { id: 'messages', label: 'Direct Messages' },
          { id: 'privacy', label: 'Privacy & Security' },
          { id: 'posts', label: 'Stories & Posts' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? 'neu-active-blue text-white shadow-xs'
                : 'neu-raised text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQs List */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 block">
          Frequently Asked Questions ({filteredFaqs.length})
        </span>

        {filteredFaqs.length === 0 ? (
          <div className="neu-flat rounded-[24px] p-6 text-center space-y-2">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No help articles found</p>
            <p className="text-[11px] text-slate-400">Try different search keywords or contact support below.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div key={faq.id} className="neu-flat rounded-[22px] overflow-hidden transition-all">
                  <button
                    onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                    className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-800 pr-2">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${
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
                        className="px-4 pb-4 pt-1 border-t border-slate-100/80 text-xs text-slate-600 leading-relaxed"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Still Need Help Card */}
      <div className="neu-flat rounded-[24px] p-4 flex items-center justify-between bg-blue-50/30 border border-blue-100/60">
        <div>
          <h4 className="text-xs font-bold text-slate-800">Still need assistance?</h4>
          <p className="text-[11px] text-slate-500">Contact our 24/7 dedicated user support team</p>
        </div>
        <button
          onClick={() => setShowContactModal(true)}
          className="px-3.5 py-2 rounded-full neu-active-blue text-xs font-bold text-white shadow-xs cursor-pointer"
        >
          Contact Support
        </button>
      </div>

      {/* Support Ticket Modal */}
      <AnimatePresence>
        {showContactModal && (
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
              className="w-full max-w-sm bg-white rounded-[28px] p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[#5B9DFF]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Send Support Request</h3>
                </div>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              <textarea
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Describe what issue or question you have with Funshann in detail..."
                rows={4}
                className="w-full p-3 rounded-2xl neu-inset bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]"
              />

              <button
                onClick={handleSendSupport}
                className="w-full h-11 rounded-2xl neu-active-blue text-xs font-bold text-white shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Ticket</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
