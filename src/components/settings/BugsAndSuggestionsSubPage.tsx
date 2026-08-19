import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bug,
  Lightbulb,
  Send,
  Smartphone,
  CheckCircle2,
  Paperclip,
  Sparkles,
} from 'lucide-react';
import { BugReportItem } from '../../types';
import { submitBugReport } from '../../services/userReportsService';

interface BugsAndSuggestionsSubPageProps {
  onShowToast: (msg: string) => void;
}

export const BugsAndSuggestionsSubPage: React.FC<BugsAndSuggestionsSubPageProps> = ({
  onShowToast,
}) => {
  const [feedbackType, setFeedbackType] = useState<'bug' | 'suggestion'>('bug');
  const [category, setCategory] = useState('Messaging & Chat');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [attachDeviceInfo, setAttachDeviceInfo] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    'Messaging & Chat',
    'Camera & Photos',
    'Stories & Feed',
    'Profile & Settings',
    'App Performance / Lag',
    'User Interface & Theme',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      onShowToast('Please provide a title and detailed description.');
      return;
    }

    submitBugReport({
      type: feedbackType,
      category,
      title: title.trim(),
      description: description.trim(),
      stepsToReproduce: steps.trim() || undefined,
      deviceInfo: attachDeviceInfo
        ? 'Android 15 (API 35) • Google Pixel 9 Pro • Funshann v2.4.0'
        : 'Anonymous Device Data',
    });

    setIsSubmitted(true);
    onShowToast(`Thank you! Your ${feedbackType === 'bug' ? 'bug report' : 'suggestion'} has been submitted.`);
  };

  if (isSubmitted) {
    return (
      <div className="neu-flat rounded-[28px] p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 neu-raised flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Feedback Submitted</h3>
          <p className="text-xs text-slate-500 mt-1">
            Thank you for helping us craft a better experience. Our engineering team actively reviews all submissions.
          </p>
        </div>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setTitle('');
            setDescription('');
            setSteps('');
          }}
          className="w-full h-11 rounded-2xl neu-active-blue text-xs font-bold text-white shadow-xs"
        >
          Submit Another Report
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-4">
      {/* Type Toggle */}
      <div className="flex p-1 neu-inset rounded-full">
        <button
          type="button"
          onClick={() => setFeedbackType('bug')}
          className={`flex-1 h-9 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            feedbackType === 'bug'
              ? 'neu-active-blue text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bug className="w-3.5 h-3.5" />
          <span>Report a Bug</span>
        </button>

        <button
          type="button"
          onClick={() => setFeedbackType('suggestion')}
          className={`flex-1 h-9 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            feedbackType === 'suggestion'
              ? 'neu-active-blue text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Idea / Suggestion</span>
        </button>
      </div>

      {/* Category Dropdown */}
      <div className="neu-flat rounded-[24px] p-4 space-y-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600">Category Area</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-10 px-3 rounded-xl neu-inset bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600">
            {feedbackType === 'bug' ? 'Short Issue Summary' : 'Feature Title'}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              feedbackType === 'bug'
                ? 'e.g. Chat message timer failed to trigger'
                : 'e.g. Add custom folder categories in chat'
            }
            className="w-full h-10 px-3 rounded-xl neu-inset bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600">
            {feedbackType === 'bug' ? 'Detailed Problem Description' : 'Describe Your Idea'}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what happened or what you would like to see..."
            rows={3}
            className="w-full p-3 rounded-xl neu-inset bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]"
          />
        </div>

        {/* Steps (if bug) */}
        {feedbackType === 'bug' && (
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600">
              Steps to Reproduce (Optional)
            </label>
            <textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder="1. Go to Chat&#10;2. Tap disappearing timer&#10;3. Send photo..."
              rows={2}
              className="w-full p-3 rounded-xl neu-inset bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]"
            />
          </div>
        )}

        {/* Device Info Toggle */}
        <div className="p-3 neu-inset rounded-2xl bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-xs font-bold text-slate-800">Attach Device Diagnostics</p>
              <p className="text-[10px] text-slate-400">Android 15 • Funshann v2.4.0</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAttachDeviceInfo(!attachDeviceInfo)}
            className={`w-10 h-5.5 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
              attachDeviceInfo ? 'bg-[#5B9DFF]' : 'bg-slate-300'
            }`}
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform ${
                attachDeviceInfo ? 'translate-x-4.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full h-11 rounded-2xl neu-active-blue text-xs font-bold text-white shadow-xs flex items-center justify-center gap-2 cursor-pointer"
      >
        <Send className="w-4 h-4" />
        <span>Submit {feedbackType === 'bug' ? 'Bug Report' : 'Suggestion'}</span>
      </button>
    </form>
  );
};
