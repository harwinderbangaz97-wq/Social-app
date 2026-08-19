import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sun,
  Moon,
  Sparkles,
  Check,
  Smartphone,
  Palette,
  Sliders,
  Layers,
  Wand2,
  CircleDot,
  Heart,
  MessageCircle,
  Flame,
} from 'lucide-react';
import { ThemeMode, CustomThemeConfig } from '../../types';

interface AppAppearanceSubPageProps {
  currentTheme?: ThemeMode;
  theme?: ThemeMode;
  onUpdateTheme?: (theme: ThemeMode) => void;
  onShowToast: (msg: string) => void;
}

const ACCENT_PRESETS = [
  { name: 'Azure Blue', color: '#5B9DFF', theme: 'light' as ThemeMode },
  { name: 'Imperial Gold', color: '#F59E0B', theme: 'golden' as ThemeMode },
  { name: 'Midnight Neon', color: '#3B82F6', theme: 'dark' as ThemeMode },
  { name: 'Warm Amber', color: '#D97706', theme: 'golden' as ThemeMode },
  { name: 'Emerald Wave', color: '#10B981', theme: 'light' as ThemeMode },
  { name: 'Slate Minimal', color: '#475569', theme: 'light' as ThemeMode },
];

export const AppAppearanceSubPage: React.FC<AppAppearanceSubPageProps> = ({
  currentTheme: propCurrentTheme,
  theme,
  onUpdateTheme,
  onShowToast,
}) => {
  const currentTheme = propCurrentTheme || theme || 'light';
  const [themeSubTab, setThemeSubTab] = useState<'presets' | 'custom'>('presets');
  const [systemSync, setSystemSync] = useState<boolean>(() => {
    try {
      return localStorage.getItem('funshann_system_theme_sync') === 'true';
    } catch {
      return false;
    }
  });

  const [customAccent, setCustomAccent] = useState('#5B9DFF');
  const [customDepth, setCustomDepth] = useState<'soft' | 'balanced' | 'deep'>('balanced');
  const [customRadius, setCustomRadius] = useState<'pill' | 'squircle' | 'minimal'>('pill');
  const [interactiveLikeCount, setInteractiveLikeCount] = useState(142);
  const [isInteractiveLiked, setIsInteractiveLiked] = useState(false);

  const handleSelectTheme = (mode: ThemeMode, label: string) => {
    if (onUpdateTheme) {
      onUpdateTheme(mode);
    }
    setSystemSync(false);
    try {
      localStorage.setItem('funshann_system_theme_sync', 'false');
      localStorage.setItem('funshann_theme', mode);
    } catch (e) {
      console.error(e);
    }
    onShowToast(`${label} applied throughout the app! ✨`);
  };

  const handleToggleSystemSync = () => {
    const nextVal = !systemSync;
    setSystemSync(nextVal);
    try {
      localStorage.setItem('funshann_system_theme_sync', String(nextVal));
    } catch (e) {
      console.error(e);
    }

    if (nextVal) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const targetTheme: ThemeMode = prefersDark ? 'dark' : 'light';
      if (onUpdateTheme) onUpdateTheme(targetTheme);
      onShowToast(`Theme synchronized with Android System Default (${targetTheme})`);
    } else {
      onShowToast('Manual theme mode enabled');
    }
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Sub-tabs for presets vs custom studio */}
      <div className="flex items-center gap-2 p-1 neu-inset rounded-full">
        <button
          onClick={() => setThemeSubTab('presets')}
          className={`flex-1 h-9 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            themeSubTab === 'presets'
              ? 'neu-active-blue text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Theme Archetypes</span>
        </button>

        <button
          onClick={() => setThemeSubTab('custom')}
          className={`flex-1 h-9 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            themeSubTab === 'custom'
              ? 'neu-active-blue text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Custom Studio</span>
        </button>
      </div>

      {themeSubTab === 'presets' ? (
        <div className="space-y-3">
          {/* System Default Toggle Option */}
          <div className="neu-flat rounded-[22px] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-[#5B9DFF]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">Match System Default</h4>
                <p className="text-[11px] text-slate-500">
                  Automatically adjust when your device switches to Dark theme
                </p>
              </div>
            </div>
            <button
              onClick={handleToggleSystemSync}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer ${
                systemSync ? 'bg-[#5B9DFF]' : 'bg-slate-300'
              }`}
            >
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`w-5 h-5 rounded-full bg-white shadow-md transform ${
                  systemSync ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 block pt-1">
            Available App Themes
          </span>

          {/* 1. Light (Porcelain Light) */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectTheme('light', 'Light Theme')}
            className={`cursor-pointer rounded-[24px] p-4 transition-all flex items-center justify-between ${
              currentTheme === 'light' && !systemSync
                ? 'neu-active-blue-soft ring-2 ring-[#5B9DFF] shadow-md'
                : 'neu-flat hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200/80 neu-raised flex items-center justify-center text-amber-500 shadow-xs">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-800">Light Theme</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                    High Clarity
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Clean porcelain surfaces with Azure blue accents and crisp typography
                </p>
              </div>
            </div>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                currentTheme === 'light' && !systemSync
                  ? 'bg-[#5B9DFF] text-white shadow-xs'
                  : 'neu-inset text-transparent'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </motion.div>

          {/* 2. Dark (Obsidian Dark) */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectTheme('dark', 'Dark Theme')}
            className={`cursor-pointer rounded-[24px] p-4 transition-all flex items-center justify-between ${
              currentTheme === 'dark' && !systemSync
                ? 'neu-active-blue-soft ring-2 ring-[#5B9DFF] shadow-md'
                : 'neu-flat hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-700/60 neu-raised flex items-center justify-center text-blue-400 shadow-xs">
                <Moon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-800">Dark Theme</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-blue-300">
                    Eye-Safe
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Deep midnight slate and obsidian depth with soft glowing accents
                </p>
              </div>
            </div>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                currentTheme === 'dark' && !systemSync
                  ? 'bg-[#5B9DFF] text-white shadow-xs'
                  : 'neu-inset text-transparent'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </motion.div>

          {/* 3. Golden Hour (Imperial Gold Warm Theme) */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectTheme('golden', 'Golden Theme')}
            className={`cursor-pointer rounded-[24px] p-4 transition-all flex items-center justify-between ${
              currentTheme === 'golden' && !systemSync
                ? 'neu-active-blue-soft ring-2 ring-amber-500 shadow-md'
                : 'neu-flat hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/80 neu-raised flex items-center justify-center text-amber-600 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-800">Golden Theme</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Warm Luxury
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Warm amber tones, golden sunset highlights, and champagne shadows
                </p>
              </div>
            </div>
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                currentTheme === 'golden' && !systemSync
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'neu-inset text-transparent'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </motion.div>
        </div>
      ) : (
        /* Custom Studio */
        <div className="space-y-4">
          <div className="neu-inset rounded-[24px] p-4 space-y-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Accent Color Palette
            </span>
            <div className="grid grid-cols-3 gap-2">
              {ACCENT_PRESETS.map((preset) => (
                <motion.button
                  key={preset.name}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCustomAccent(preset.color);
                    if (onUpdateTheme) onUpdateTheme(preset.theme);
                    onShowToast(`Accent changed to ${preset.name}`);
                  }}
                  className={`p-2 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                    customAccent === preset.color
                      ? 'bg-white border-[#5B9DFF] shadow-xs'
                      : 'bg-white/40 border-transparent hover:bg-white/80'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-full shadow-xs flex items-center justify-center text-white"
                    style={{ backgroundColor: preset.color }}
                  >
                    {customAccent === preset.color && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <span className="text-[10px] font-bold text-slate-700">{preset.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Interactive Live Preview Component */}
          <div className="neu-flat rounded-[24px] p-4 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Live Preview
            </span>
            <div className="p-3 neu-inset rounded-2xl bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xs"
                  style={{ backgroundColor: customAccent }}
                >
                  FN
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Funshann Feed Card</p>
                  <p className="text-[10px] text-slate-400">Tactile Neumorphic Surface</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => {
                  setIsInteractiveLiked(!isInteractiveLiked);
                  setInteractiveLikeCount((c) => (isInteractiveLiked ? c - 1 : c + 1));
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isInteractiveLiked
                    ? 'text-white shadow-xs'
                    : 'neu-raised text-slate-600 hover:text-slate-900'
                }`}
                style={{ backgroundColor: isInteractiveLiked ? customAccent : undefined }}
              >
                <Heart className={`w-3.5 h-3.5 ${isInteractiveLiked ? 'fill-current' : ''}`} />
                <span>{interactiveLikeCount}</span>
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
