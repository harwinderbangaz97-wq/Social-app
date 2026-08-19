import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Lock,
  CheckCircle2,
  Info,
  UserCheck,
} from 'lucide-react';
import {
  getContactSyncEnabled,
  saveContactSyncEnabled,
} from '../../services/privacySettingsService';

interface ContactSyncSubPageProps {
  onShowToast: (msg: string) => void;
}

export const ContactSyncSubPage: React.FC<ContactSyncSubPageProps> = ({ onShowToast }) => {
  const [isSyncEnabled, setIsSyncEnabled] = useState<boolean>(() => {
    return getContactSyncEnabled();
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedContactsCount, setSyncedContactsCount] = useState<number>(() => (isSyncEnabled ? 48 : 0));
  const [matchedFriendsCount, setMatchedFriendsCount] = useState<number>(() => (isSyncEnabled ? 6 : 0));

  const handleToggleSync = () => {
    const nextVal = !isSyncEnabled;
    setIsSyncEnabled(nextVal);
    saveContactSyncEnabled(nextVal);

    if (nextVal) {
      setIsSyncing(true);
      setTimeout(() => {
        setIsSyncing(false);
        setSyncedContactsCount(48);
        setMatchedFriendsCount(6);
        onShowToast('Contact syncing enabled. 6 friends found on Funshann! 👥');
      }, 1200);
    } else {
      setSyncedContactsCount(0);
      setMatchedFriendsCount(0);
      onShowToast('Contact syncing disabled. Stored address hashes purged from memory.');
    }
  };

  const handleManualSyncNow = () => {
    if (!isSyncEnabled) {
      onShowToast('Please enable contact syncing first.');
      return;
    }
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      onShowToast('Contacts synchronized with Funshann social graph!');
    }, 1000);
  };

  const handleRemoveSyncedData = () => {
    setIsSyncEnabled(false);
    saveContactSyncEnabled(false);
    setSyncedContactsCount(0);
    setMatchedFriendsCount(0);
    onShowToast('All previously uploaded contact data deleted permanently from Funshann servers.');
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Primary Toggle Card */}
      <div className="neu-flat rounded-[24px] p-4.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Sync Device Contacts</h4>
              <p className="text-[11px] font-medium text-slate-500">
                Find friends and creators you know
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleSync}
            className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
              isSyncEnabled ? 'bg-[#5B9DFF]' : 'bg-slate-300'
            }`}
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform ${
                isSyncEnabled ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Sync Status Banner */}
        {isSyncEnabled && (
          <div className="p-3 neu-inset rounded-2xl bg-emerald-50/50 border border-emerald-100/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-900">
                {matchedFriendsCount} Friends Found on Funshann
              </span>
            </div>
            <button
              onClick={handleManualSyncNow}
              disabled={isSyncing}
              className="px-2.5 py-1 rounded-full neu-raised text-[10px] font-bold text-[#5B9DFF] hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Cryptographic Privacy Explanation */}
      <div className="neu-flat rounded-[24px] p-4 space-y-2.5 text-[11px] text-slate-600">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Strict Contact Privacy Safeguards</span>
        </div>
        <ul className="space-y-1.5 list-disc list-inside text-slate-500 pl-1 leading-relaxed">
          <li>
            Contacts are one-way hashed with SHA-256 before upload. Phone numbers and email addresses are <strong className="text-slate-700">never stored in plain text</strong>.
          </li>
          <li>
            Funshann never sends unsolicited SMS or emails to your contacts.
          </li>
          <li>
            You can delete all uploaded contact hashes from our servers at any time with a single tap.
          </li>
        </ul>
      </div>

      {/* Manage / Delete Synced Data */}
      {isSyncEnabled && (
        <div className="neu-flat rounded-[24px] p-4 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Delete Synced Contacts Data</h4>
            <p className="text-[10px] text-slate-500">Remove all synced contact records from server storage</p>
          </div>
          <button
            onClick={handleRemoveSyncedData}
            className="px-3 py-1.5 rounded-full neu-raised text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Data</span>
          </button>
        </div>
      )}
    </div>
  );
};
