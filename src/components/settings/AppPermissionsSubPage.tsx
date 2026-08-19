import React from 'react';
import { motion } from 'motion/react';
import {
  Camera,
  Mic,
  MapPin,
  Image,
  Users,
  Bell,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Shield,
  Info,
  RefreshCw,
} from 'lucide-react';
import { AppPermissionsState, AppPermissionType, AppPermissionStatus } from '../../types';
import { APP_PERMISSIONS } from '../../services/permissionService';

interface AppPermissionsSubPageProps {
  permissionsState: AppPermissionsState;
  onUpdatePermissions: (updated: AppPermissionsState) => void;
  onOpenSystemSettings: () => void;
  onShowToast: (msg: string) => void;
}

export const AppPermissionsSubPage: React.FC<AppPermissionsSubPageProps> = ({
  permissionsState,
  onUpdatePermissions,
  onOpenSystemSettings,
  onShowToast,
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'camera':
        return Camera;
      case 'microphone':
        return Mic;
      case 'location':
        return MapPin;
      case 'photos':
        return Image;
      case 'contacts':
        return Users;
      default:
        return Bell;
    }
  };

  const getStatusBadge = (status: AppPermissionStatus) => {
    switch (status) {
      case 'granted':
        return {
          label: 'Allowed',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: CheckCircle2,
        };
      case 'limited':
        return {
          label: 'Selected Only',
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: CheckCircle2,
        };
      case 'denied':
        return {
          label: 'Not Allowed',
          color: 'bg-red-50 text-red-600 border-red-200',
          icon: XCircle,
        };
      case 'prompt':
      default:
        return {
          label: 'Ask Every Time',
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: Info,
        };
    }
  };

  const handleToggle = (permId: AppPermissionType) => {
    const current = permissionsState[permId];
    const next: AppPermissionStatus = current === 'granted' ? 'denied' : 'granted';
    const updated = { ...permissionsState, [permId]: next };
    onUpdatePermissions(updated);
    onShowToast(`${permId.toUpperCase()} permission set to ${next === 'granted' ? 'Allowed' : 'Not Allowed'}`);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Android System Integration Banner */}
      <div className="neu-flat rounded-[24px] p-4 flex items-center justify-between bg-blue-50/40 border border-blue-100/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Android System Permissions</h4>
            <p className="text-[11px] text-slate-500">Manage fine-grained hardware & privacy access</p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onOpenSystemSettings}
          className="px-3 py-1.5 rounded-full neu-raised text-xs font-bold text-[#5B9DFF] hover:text-blue-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>App Info</span>
        </motion.button>
      </div>

      {/* Permissions List */}
      <div className="space-y-2.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 block">
          App Permissions Status
        </span>

        <div className="neu-flat rounded-[24px] divide-y divide-slate-100/80 overflow-hidden">
          {APP_PERMISSIONS.map((perm) => {
            const Icon = getIcon(perm.id);
            const status = permissionsState[perm.id as AppPermissionType] || 'prompt';
            const badge = getStatusBadge(status);
            const BadgeIcon = badge.icon;
            const isGranted = status === 'granted';

            return (
              <div key={perm.id} className="p-4 flex items-start justify-between">
                <div className="flex items-start gap-3 pr-2">
                  <div className="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-slate-700 flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-[#5B9DFF]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800">{perm.name}</h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badge.color}`}>
                        <BadgeIcon className="w-2.5 h-2.5" />
                        <span>{badge.label}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{perm.explanation}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">{perm.androidManifestName}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(perm.id as AppPermissionType)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 flex-shrink-0 cursor-pointer ${
                    isGranted ? 'bg-[#5B9DFF]' : 'bg-slate-300'
                  }`}
                >
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform ${
                      isGranted ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
