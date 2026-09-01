import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle,
  CheckCircle2,
  X,
  Lock,
  Search,
} from 'lucide-react';
import { ChatThread } from '../../types';

interface ClearConversationsSubPageProps {
  chatThreads: ChatThread[];
  onDeleteThreads: (threadIds: string[]) => void;
  onShowToast: (msg: string) => void;
}

export const ClearConversationsSubPage: React.FC<ClearConversationsSubPageProps> = ({
  chatThreads,
  onDeleteThreads,
  onShowToast,
}) => {
  const [selectedThreadIds, setSelectedThreadIds] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThreads = chatThreads.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.participant.name.toLowerCase().includes(q) ||
      t.participant.username.toLowerCase().includes(q) ||
      (t.lastMessage.text && t.lastMessage.text.toLowerCase().includes(q))
    );
  });

  const handleToggleSelect = (id: string) => {
    if (selectedThreadIds.includes(id)) {
      setSelectedThreadIds((prev) => prev.filter((item) => item !== id));
      setIsSelectAll(false);
    } else {
      const updated = [...selectedThreadIds, id];
      setSelectedThreadIds(updated);
      if (updated.length === chatThreads.length) {
        setIsSelectAll(true);
      }
    }
  };

  const handleToggleSelectAll = () => {
    if (isSelectAll || selectedThreadIds.length === chatThreads.length) {
      setSelectedThreadIds([]);
      setIsSelectAll(false);
    } else {
      setSelectedThreadIds(chatThreads.map((t) => t.id));
      setIsSelectAll(true);
    }
  };

  const handleConfirmDelete = () => {
    const idsToDelete = singleDeleteId ? [singleDeleteId] : selectedThreadIds;
    onDeleteThreads(idsToDelete);
    onShowToast(`Deleted ${idsToDelete.length} conversation${idsToDelete.length > 1 ? 's' : ''}`);
    setSelectedThreadIds([]);
    setSingleDeleteId(null);
    setShowConfirmModal(false);
    setIsSelectAll(false);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Search & Bulk Action Header */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <div className="w-full neu-inset rounded-full h-11 flex items-center px-4">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {chatThreads.length > 0 && (
          <button
            onClick={handleToggleSelectAll}
            className="px-3.5 h-11 rounded-full neu-raised text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer flex-shrink-0 shadow-xs"
          >
            {isSelectAll ? (
              <CheckSquare className="w-4 h-4 text-[#5B9DFF]" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>{isSelectAll ? 'Deselect' : 'Select All'}</span>
          </button>
        )}
      </div>

      {/* Selected Action Bar */}
      {selectedThreadIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 neu-flat rounded-2xl bg-red-50/50 border border-red-200/60 flex items-center justify-between"
        >
          <span className="text-xs font-bold text-red-900">
            {selectedThreadIds.length} conversation{selectedThreadIds.length > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => {
              setSingleDeleteId(null);
              setShowConfirmModal(true);
            }}
            className="px-3.5 py-1.5 rounded-full bg-red-500 hover:bg-red-600 text-xs font-bold text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Selected</span>
          </button>
        </motion.div>
      )}

      {/* Threads List */}
      <div className="space-y-2">
        {filteredThreads.length === 0 ? (
          <div className="neu-flat rounded-[24px] p-6 text-center space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-xs font-bold text-slate-800">No Conversations Found</h4>
            <p className="text-[11px] text-slate-500">Your chat inbox is empty or no threads match your search.</p>
          </div>
        ) : (
          <div className="neu-flat rounded-[24px] divide-y divide-slate-100/80 overflow-hidden">
            {filteredThreads.map((thread) => {
              const isChecked = selectedThreadIds.includes(thread.id);
              return (
                <div
                  key={thread.id}
                  className={`p-3.5 flex items-center justify-between transition-colors ${
                    isChecked ? 'bg-blue-50/40' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div
                    onClick={() => handleToggleSelect(thread.id)}
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                  >
                    <button
                      type="button"
                      className="p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#5B9DFF]" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>

                    <img
                      src={thread.participant.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={thread.participant.name}
                      className="w-10 h-10 rounded-full object-cover neu-raised flex-shrink-0"
                    />

                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-800 truncate">
                          {thread.participant.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {thread.lastMessage.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {thread.lastMessage.text || 'Photo attachment'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSingleDeleteId(thread.id);
                      setShowConfirmModal(true);
                    }}
                    className="p-2 rounded-full neu-raised text-slate-400 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0 ml-2"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
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
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 neu-raised flex items-center justify-center text-red-600 flex-shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Clear Conversation?</h3>
                  <p className="text-[11px] text-slate-500">
                    {singleDeleteId
                      ? 'Are you sure you want to delete this conversation from your inbox?'
                      : `Are you sure you want to delete ${selectedThreadIds.length} conversation(s)?`}
                  </p>
                </div>
              </div>

              <div className="p-3 neu-inset rounded-2xl bg-amber-50/60 border border-amber-100 text-[11px] text-amber-900 leading-snug">
                This will remove message histories from your device. In accordance with privacy rules, other participants retain their conversation copies.
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 h-11 rounded-2xl neu-raised text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 h-11 rounded-2xl bg-red-500 hover:bg-red-600 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
