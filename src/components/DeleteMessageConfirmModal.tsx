import React from 'react';
import { motion } from 'motion/react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Message } from '../types';

interface DeleteMessageConfirmModalProps {
  isOpen: boolean;
  message: Message | null;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export const DeleteMessageConfirmModal: React.FC<DeleteMessageConfirmModalProps> = ({
  isOpen,
  message,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen || !message) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="neu-flat rounded-[28px] max-w-sm w-full p-5 bg-white shadow-2xl border border-slate-200/80 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <Trash2 className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full neu-raised flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-slate-900">Delete message for everyone?</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            This message will be permanently removed from this conversation for both you and the recipient. This action cannot be undone.
          </p>
        </div>

        {/* Message preview snippet */}
        <div className="neu-inset rounded-[16px] p-2.5 bg-slate-50/70 text-xs text-slate-700 font-medium truncate border border-slate-200/60">
          {message.text || (message.imageUrl ? '📷 Photo Attachment' : '🎙️ Voice Note')}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-9.5 rounded-full neu-raised text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => {
              onConfirmDelete();
              onClose();
            }}
            className="flex-1 h-9.5 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:bg-rose-700 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete for All</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
