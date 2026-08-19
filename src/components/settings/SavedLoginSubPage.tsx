import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  KeyRound,
  ShieldCheck,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Info,
  Trash2,
  Lock,
} from 'lucide-react';
import {
  getSavedLoginEnabled,
  saveSavedLoginEnabled,
} from '../../services/privacySettingsService';

interface SavedLoginSubPageProps {
  onShowToast: (msg: string) => void;
}

interface DeviceSession {
  id: string;
  deviceName: string;
  deviceType: 'phone' | 'desktop' | 'tablet';
  location: string;
  lastActive: string;
  isCurrent: boolean;
  ipAddressMasked: string;
}

const INITIAL_SESSIONS: DeviceSession[] = [
  {
    id: 'dev_1',
    deviceName: 'Google Pixel 9 Pro (This Device)',
    deviceType: 'phone',
    location: 'Barcelona, Spain',
    lastActive: 'Active now',
    isCurrent: true,
    ipAddressMasked: '192.168.***.***',
  },
  {
    id: 'dev_2',
    deviceName: 'MacBook Pro 16" (Chrome Browser)',
    deviceType: 'desktop',
    location: 'Barcelona, Spain',
    lastActive: 'Yesterday at 18:40',
    isCurrent: false,
    ipAddressMasked: '84.120.***.***',
  },
  {
    id: 'dev_3',
    deviceName: 'Samsung Galaxy Tab S9',
    deviceType: 'tablet',
    location: 'Madrid, Spain',
    lastActive: 'August 10, 2026',
    isCurrent: false,
    ipAddressMasked: '83.45.***.***',
  },
];

export const SavedLoginSubPage: React.FC<SavedLoginSubPageProps> = ({ onShowToast }) => {
  const [isSavedLoginEnabled, setIsSavedLoginEnabled] = useState<boolean>(() => {
    return getSavedLoginEnabled();
  });
  const [sessions, setSessions] = useState<DeviceSession[]>(INITIAL_SESSIONS);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState<string | null>(null);

  const handleToggleSavedLogin = () => {
    const nextVal = !isSavedLoginEnabled;
    setIsSavedLoginEnabled(nextVal);
    saveSavedLoginEnabled(nextVal);

    if (nextVal) {
      onShowToast('Saved login enabled for this device. Faster seamless sign-in active.');
    } else {
      onShowToast('Saved login disabled. Session tokens will be cleared upon manual logout.');
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    const target = sessions.find((s) => s.id === sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setShowRevokeConfirm(null);
    onShowToast(`Session on ${target?.deviceName || 'device'} revoked successfully.`);
  };

  const handleRevokeAllOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    onShowToast('All other device sessions have been logged out securely.');
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Primary Toggle Card */}
      <div className="neu-flat rounded-[24px] p-4.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF]">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">Saved Login Info</h4>
              <p className="text-[11px] font-medium text-slate-500">
                Remember authentication state on this device
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleSavedLogin}
            className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
              isSavedLoginEnabled ? 'bg-[#5B9DFF]' : 'bg-slate-300'
            }`}
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform ${
                isSavedLoginEnabled ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Security & Password Exemption Guarantee */}
        <div className="p-3 neu-inset rounded-2xl bg-blue-50/50 border border-blue-100/60 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#5B9DFF] flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-600 leading-relaxed">
            <p className="font-bold text-slate-800 mb-0.5">Zero Plaintext Password Exposure</p>
            Funshann utilizes industry-standard cryptographic OAuth & refresh tokens. Your account
            password is <span className="font-semibold text-slate-800">never stored or visible</span> on this device.
          </div>
        </div>
      </div>

      {/* Explanatory Details */}
      <div className="neu-flat rounded-[24px] p-4 space-y-2.5 text-[11px] text-slate-600">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
          <Info className="w-4 h-4 text-[#5B9DFF]" />
          <span>How Saved Login Works</span>
        </div>
        <ul className="space-y-1.5 list-disc list-inside text-slate-500 pl-1">
          <li>
            <strong className="text-slate-700">When ON:</strong> You will not need to re-enter your username or credentials when reopening Funshann on this device.
          </li>
          <li>
            <strong className="text-slate-700">When OFF:</strong> Session tokens are purged from device storage upon logout or application restart.
          </li>
          <li>
            Biometric authentication (Fingerprint / Face Unlock) can still be used for fast app unlock.
          </li>
        </ul>
      </div>

      {/* Active Device Sessions */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Device Sessions ({sessions.length})
          </span>
          {sessions.length > 1 && (
            <button
              onClick={handleRevokeAllOtherSessions}
              className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors"
            >
              Log out other devices
            </button>
          )}
        </div>

        <div className="neu-flat rounded-[24px] divide-y divide-slate-100/80 overflow-hidden">
          {sessions.map((session) => (
            <div key={session.id} className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-slate-600">
                  {session.deviceType === 'phone' ? (
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Laptop className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-800">{session.deviceName}</p>
                    {session.isCurrent && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {session.location} • {session.lastActive}
                  </p>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  className="p-2 rounded-full neu-raised text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                  title="Revoke session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
