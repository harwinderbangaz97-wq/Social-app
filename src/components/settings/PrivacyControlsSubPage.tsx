import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Lock,
  AtSign,
  Tag,
  Share2,
  Activity,
  CheckCheck,
  Eye,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { PrivacyControlsSettings } from '../../types';
import {
  getPrivacyControls,
  savePrivacyControls,
} from '../../services/privacySettingsService';

interface PrivacyControlsSubPageProps {
  onShowToast: (msg: string) => void;
}

export const PrivacyControlsSubPage: React.FC<PrivacyControlsSubPageProps> = ({
  onShowToast,
}) => {
  const [controls, setControls] = useState<PrivacyControlsSettings>(() => {
    return getPrivacyControls();
  });

  const handleToggleBoolean = (key: keyof PrivacyControlsSettings) => {
    const updated = { ...controls, [key]: !controls[key] };
    setControls(updated);
    savePrivacyControls(updated);
    onShowToast('Privacy settings updated');
  };

  const handleSelectEnum = (
    key: 'whoCanMention' | 'whoCanTag' | 'allowStoryReplies',
    value: 'everyone' | 'following' | 'nobody'
  ) => {
    const updated = { ...controls, [key]: value };
    setControls(updated);
    savePrivacyControls(updated);
    onShowToast('Privacy preference saved');
  };

  return (
    <div className="space-y-4 pb-4">
      {/* 1. Account Privacy (Public vs Private) */}
      <div className="neu-flat rounded-[24px] p-4.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Private Account</h4>
              <p className="text-[11px] font-medium text-slate-500">
                Only approved followers can see your posts & stories
              </p>
            </div>
          </div>

          <button
            onClick={() => handleToggleBoolean('isPrivateAccount')}
            className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
              controls.isPrivateAccount ? 'bg-[#5B9DFF]' : 'bg-slate-300'
            }`}
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform ${
                controls.isPrivateAccount ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. Activity Indicator (Requirement 20) */}
      <div className="neu-flat rounded-[24px] p-4.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-emerald-500">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-slate-800">Activity Indicator</h4>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                  Online Status
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                Show when you are currently active on Funshann
              </p>
            </div>
          </div>

          <button
            onClick={() => handleToggleBoolean('showActivityIndicator')}
            className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
              controls.showActivityIndicator ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform ${
                controls.showActivityIndicator ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 pl-1">
          When turned off, other users won't see your green online dot, and you won't see theirs.
        </p>
      </div>

      {/* 3. Read Receipts */}
      <div className="neu-flat rounded-[24px] p-4.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-blue-500">
            <CheckCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Read Receipts (Blue Ticks)</h4>
            <p className="text-[11px] font-medium text-slate-500">
              Let chat partners know when you have read their messages
            </p>
          </div>
        </div>

        <button
          onClick={() => handleToggleBoolean('readReceiptsEnabled')}
          className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
            controls.readReceiptsEnabled ? 'bg-[#5B9DFF]' : 'bg-slate-300'
          }`}
        >
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform ${
              controls.readReceiptsEnabled ? 'translate-x-5.5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* 4. Mentions & Tags Controls */}
      <div className="neu-flat rounded-[24px] p-4 space-y-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Mentions & Tagging
        </span>

        {/* Who can mention */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <AtSign className="w-3.5 h-3.5 text-[#5B9DFF]" />
            <span>Who can @mention you in comments and stories</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-1 neu-inset rounded-2xl">
            {(['everyone', 'following', 'nobody'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelectEnum('whoCanMention', opt)}
                className={`py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  controls.whoCanMention === opt
                    ? 'neu-active-blue text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt === 'following' ? 'Friends only' : opt}
              </button>
            ))}
          </div>
        </div>

        {/* Who can tag */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Tag className="w-3.5 h-3.5 text-[#5B9DFF]" />
            <span>Who can tag you in photos and media</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-1 neu-inset rounded-2xl">
            {(['everyone', 'following', 'nobody'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelectEnum('whoCanTag', opt)}
                className={`py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  controls.whoCanTag === opt
                    ? 'neu-active-blue text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt === 'following' ? 'Friends only' : opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Story Resharing & Replies */}
      <div className="neu-flat rounded-[24px] p-4 space-y-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Story Privacy
        </span>

        <div className="flex items-center justify-between">
          <div className="flex items-start gap-2.5">
            <Share2 className="w-4 h-4 text-slate-600 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-800">Allow Story Resharing</h4>
              <p className="text-[10px] text-slate-500">Allow other users to share your public stories to messages</p>
            </div>
          </div>
          <button
            onClick={() => handleToggleBoolean('allowStoryReshare')}
            className={`w-10 h-5.5 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
              controls.allowStoryReshare ? 'bg-[#5B9DFF]' : 'bg-slate-300'
            }`}
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`w-4.5 h-4.5 rounded-full bg-white shadow-md transform ${
                controls.allowStoryReshare ? 'translate-x-4.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
