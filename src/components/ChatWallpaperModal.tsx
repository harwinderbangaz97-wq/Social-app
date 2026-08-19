import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Image as ImageIcon,
  Check,
  Sparkles,
  Sliders,
  Upload,
  RefreshCw,
  Eye,
  Layers,
  Palette,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { CHAT_WALLPAPERS, ChatWallpaper } from '../data/wallpapers';
import { usePermissionAndMedia } from '../context/PermissionAndMediaContext';

export interface ChatWallpaperSettings {
  wallpaperId: string;
  customUrl?: string;
  dimming: number; // 0 to 80 percent
  blur: number; // 0 to 12 px
  applyToAll: boolean;
}

interface ChatWallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: ChatWallpaperSettings;
  onSaveWallpaper: (settings: ChatWallpaperSettings) => void;
  participantName?: string;
  onShowToast?: (msg: string) => void;
}

export const ChatWallpaperModal: React.FC<ChatWallpaperModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSaveWallpaper,
  participantName = 'this conversation',
  onShowToast,
}) => {
  const { pickMedia } = usePermissionAndMedia();
  const [activeCategory, setActiveCategory] = useState<'all' | 'minimal' | 'gradient' | 'nature' | 'dark'>('all');
  const [selectedWallpaperId, setSelectedWallpaperId] = useState(currentSettings?.wallpaperId || 'clean-default');
  const [customUrl, setCustomUrl] = useState(currentSettings?.customUrl || '');
  const [dimming, setDimming] = useState(currentSettings?.dimming ?? 15);
  const [blur, setBlur] = useState(currentSettings?.blur ?? 0);
  const [applyToAll, setApplyToAll] = useState(currentSettings?.applyToAll ?? false);

  // Sync state whenever modal is opened or currentSettings changes
  useEffect(() => {
    if (isOpen && currentSettings) {
      setSelectedWallpaperId(currentSettings.wallpaperId || 'clean-default');
      setCustomUrl(currentSettings.customUrl || '');
      setDimming(typeof currentSettings.dimming === 'number' ? currentSettings.dimming : 15);
      setBlur(typeof currentSettings.blur === 'number' ? currentSettings.blur : 0);
      setApplyToAll(Boolean(currentSettings.applyToAll));
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) return null;

  const filteredWallpapers = CHAT_WALLPAPERS.filter((wp) => {
    if (activeCategory === 'all') return true;
    return wp.category === activeCategory;
  });

  const activeWallpaper =
    CHAT_WALLPAPERS.find((wp) => wp.id === selectedWallpaperId) || CHAT_WALLPAPERS[0];

  const handleCustomUpload = async () => {
    const res = await pickMedia({
      accept: 'image/*',
      featureName: 'Chat Wallpaper',
    });
    if (res) {
      setCustomUrl(res.url);
      setSelectedWallpaperId('custom');
      if (onShowToast) onShowToast('Custom wallpaper loaded from device! ✨');
    }
  };

  const handleApply = () => {
    const payload: ChatWallpaperSettings = {
      wallpaperId: selectedWallpaperId,
      customUrl: selectedWallpaperId === 'custom' ? customUrl : undefined,
      dimming,
      blur,
      applyToAll,
    };
    onSaveWallpaper(payload);
    if (onShowToast) {
      onShowToast(
        applyToAll
          ? 'Chat wallpaper applied to all conversations! 🌟'
          : `Wallpaper set for ${participantName} ✨`
      );
    }
    onClose();
  };

  const handleResetToDefault = () => {
    const defaultSettings: ChatWallpaperSettings = {
      wallpaperId: 'clean-default',
      customUrl: undefined,
      dimming: 0,
      blur: 0,
      applyToAll,
    };
    setSelectedWallpaperId('clean-default');
    setCustomUrl('');
    setDimming(0);
    setBlur(0);
    onSaveWallpaper(defaultSettings);
    if (onShowToast) onShowToast('Wallpaper reset to clean default! 🧼');
    onClose();
  };

  // Helper to compute background styling for the live preview
  const getPreviewBackgroundStyle = () => {
    if (selectedWallpaperId === 'custom' && customUrl) {
      return {
        backgroundImage: `url(${customUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    if (activeWallpaper.id === 'clean-default') {
      return {
        background: '#f8fafc',
      };
    }
    if (activeWallpaper.type === 'image') {
      return {
        backgroundImage: `url(${activeWallpaper.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    if (activeWallpaper.type === 'gradient') {
      return {
        background: activeWallpaper.value,
      };
    }
    if (activeWallpaper.type === 'pattern') {
      return {
        backgroundColor: '#f8fafc',
        backgroundImage: activeWallpaper.value,
        backgroundSize: activeWallpaper.id === 'dot-grid' ? '18px 18px' : '24px 24px',
        backgroundPosition: 'center',
      };
    }
    return {
      background: '#f8fafc',
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 12 }}
        className="w-full max-w-md bg-[#f4f7fb] rounded-[32px] overflow-hidden neu-flat max-h-[92vh] flex flex-col shadow-2xl border border-white/70"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF]">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Chat Wallpaper Studio</h3>
              <p className="text-[10px] text-slate-500 font-medium">
                Select clean textures, photography, or upload
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full neu-raised flex items-center justify-center text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* Live Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#5B9DFF]" />
                Live Chat Simulation
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#5B9DFF] border border-blue-100">
                {selectedWallpaperId === 'custom' ? 'Custom Upload' : activeWallpaper.name}
              </span>
            </div>

            <div className="relative h-44 rounded-[24px] overflow-hidden neu-inset p-3 flex flex-col justify-end border border-slate-200/60">
              {/* Wallpaper Canvas Layer */}
              <div
                className="absolute inset-0 transition-all duration-300"
                style={{
                  ...getPreviewBackgroundStyle(),
                  filter: blur > 0 ? `blur(${blur}px)` : undefined,
                  transform: blur > 0 ? 'scale(1.08)' : undefined,
                }}
              />

              {/* Dimming & Contrast Overlay */}
              {selectedWallpaperId !== 'clean-default' && (
                <div
                  className="absolute inset-0 bg-slate-950 transition-opacity duration-200 pointer-events-none"
                  style={{ opacity: dimming / 100 }}
                />
              )}

              {/* Sample Bubble 1 (Received) */}
              <div className="relative z-10 self-start max-w-[78%] mb-2">
                <div className="bg-white/95 backdrop-blur-md rounded-[18px] rounded-bl-xs p-2.5 text-[11px] text-slate-800 shadow-sm border border-white/80">
                  <p className="leading-snug font-medium">Hey! How does this clean wallpaper texture look?</p>
                </div>
                <span className="text-[9px] text-slate-500 font-bold ml-1 bg-white/70 backdrop-blur-xs px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                  10:42 AM
                </span>
              </div>

              {/* Sample Bubble 2 (Sent) */}
              <div className="relative z-10 self-end max-w-[78%]">
                <div className="neu-active-blue rounded-[18px] rounded-br-xs p-2.5 text-[11px] text-white shadow-md">
                  <p className="leading-snug font-medium">It feels super clean, aesthetic and readable! ✨</p>
                </div>
                <div className="flex items-center justify-end gap-1 mt-0.5 mr-1 text-[9px] text-slate-500 font-bold">
                  <span className="bg-white/70 backdrop-blur-xs px-1.5 py-0.5 rounded-md">10:43 AM</span>
                  <CheckCheck className="w-3 h-3 text-[#5B9DFF]" />
                </div>
              </div>
            </div>
          </div>

          {/* Categories Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'minimal', label: 'Minimal & Patterns' },
              { id: 'gradient', label: 'Gradients' },
              { id: 'nature', label: 'Nature Scenic' },
              { id: 'dark', label: 'Dark & Cyber' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as typeof activeCategory)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'neu-active-blue text-white shadow-xs'
                    : 'neu-raised text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Wallpaper Thumbnails Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Custom Upload Card */}
            <motion.div
              whileTap={{ scale: 0.96 }}
              onClick={handleCustomUpload}
              className={`relative h-24 rounded-[20px] overflow-hidden cursor-pointer flex flex-col items-center justify-center p-2 text-center transition-all ${
                selectedWallpaperId === 'custom'
                  ? 'ring-2 ring-[#5B9DFF] border-2 border-white shadow-md'
                  : 'neu-raised border border-dashed border-blue-300 hover:border-[#5B9DFF]'
              }`}
            >
              {customUrl ? (
                <>
                  <img src={customUrl} alt="Custom" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1">
                    <span className="text-[10px] font-bold text-white leading-tight">Change Upload</span>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-[#5B9DFF] mb-1" />
                  <span className="text-[10px] font-bold text-slate-700 leading-tight">Upload Photo</span>
                  <span className="text-[8px] text-slate-400">PNG, JPG, WebP</span>
                </>
              )}

              {selectedWallpaperId === 'custom' && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#5B9DFF] text-white flex items-center justify-center shadow-md">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </motion.div>

            {/* Curated Wallpapers */}
            {filteredWallpapers.map((wp) => {
              const isSelected = selectedWallpaperId === wp.id;
              return (
                <motion.div
                  key={wp.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedWallpaperId(wp.id)}
                  className={`relative h-24 rounded-[20px] overflow-hidden cursor-pointer group transition-all ${
                    isSelected
                      ? 'ring-2 ring-[#5B9DFF] border-2 border-white shadow-md'
                      : 'neu-flat hover:shadow-md'
                  }`}
                >
                  {/* Thumbnail Rendering */}
                  {wp.type === 'gradient' ? (
                    <div style={{ background: wp.value }} className="w-full h-full" />
                  ) : wp.type === 'pattern' ? (
                    <div
                      style={{
                        backgroundColor: '#f8fafc',
                        backgroundImage: wp.value,
                        backgroundSize: '16px 16px',
                        backgroundPosition: 'center',
                      }}
                      className="w-full h-full"
                    />
                  ) : wp.type === 'solid' ? (
                    <div className="w-full h-full bg-[#f8fafc] flex flex-col items-center justify-center p-2 text-slate-400">
                      <Layers className="w-5 h-5 mb-1 text-slate-300" />
                      <span className="text-[9px] font-bold">Clean Minimal</span>
                    </div>
                  ) : (
                    <img
                      src={wp.thumbnail}
                      alt={wp.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {/* Title Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-1.5 pt-4">
                    <p className="text-[10px] font-bold text-white leading-tight truncate drop-shadow-xs">
                      {wp.name}
                    </p>
                  </div>

                  {/* Selected Check Indicator */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#5B9DFF] text-white flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Visual Atmosphere Tuning */}
          <div className="neu-flat rounded-[22px] p-3.5 space-y-3 border border-slate-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#5B9DFF]" />
              <h4 className="text-xs font-bold text-slate-800">Wallpaper Atmosphere Tuning</h4>
            </div>

            {/* Dimming Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-600">Background Dimming & Contrast</span>
                <span className="font-bold text-[#5B9DFF]">{dimming}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="70"
                step="5"
                value={dimming}
                onChange={(e) => setDimming(Number(e.target.value))}
                className="w-full accent-[#5B9DFF] cursor-pointer"
              />
              <p className="text-[9px] text-slate-400">
                Enhances contrast so text bubbles remain crisp and legible against photos.
              </p>
            </div>

            {/* Blur Level Buttons */}
            <div className="space-y-1 pt-1 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-600 block">Soft Focus Blur</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Off', val: 0 },
                  { label: 'Low', val: 2 },
                  { label: 'Medium', val: 4 },
                  { label: 'Soft', val: 8 },
                ].map((b) => (
                  <button
                    key={b.val}
                    type="button"
                    onClick={() => setBlur(b.val)}
                    className={`py-1 rounded-xl text-[10px] font-bold transition-all ${
                      blur === b.val
                        ? 'neu-active-blue text-white shadow-xs'
                        : 'neu-raised text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scope Toggle: Apply to All vs Current */}
          <div className="neu-flat rounded-[20px] p-3 flex items-center justify-between border border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-800">Apply to All Chats</p>
              <p className="text-[10px] text-slate-400">
                Set as global default for every conversation
              </p>
            </div>
            <button
              type="button"
              onClick={() => setApplyToAll(!applyToAll)}
              className={`w-11 h-6 rounded-full transition-all relative p-0.5 ${
                applyToAll ? 'bg-[#5B9DFF]' : 'neu-inset'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  applyToAll ? 'translate-x-5 shadow-sm' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Modal Footer Buttons */}
        <div className="p-4 border-t border-slate-200/80 bg-white/80 backdrop-blur-md flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="h-10 px-3.5 rounded-full neu-raised text-rose-500 hover:text-rose-600 text-xs font-bold flex items-center gap-1.5 transition"
            title="Reset wallpaper to default minimal"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex-1 h-10 rounded-full neu-active-blue text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Apply Wallpaper</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

