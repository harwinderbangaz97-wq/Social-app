import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Globe,
  Search,
  Check,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  LANGUAGES_LIST,
  getSavedLanguage,
  saveSelectedLanguage,
  LanguageItem,
} from '../../services/languageService';

interface LanguageSubPageProps {
  onShowToast: (msg: string) => void;
  onLanguageChange?: (langCode: string) => void;
}

export const LanguageSubPage: React.FC<LanguageSubPageProps> = ({
  onShowToast,
  onLanguageChange,
}) => {
  const [selectedLang, setSelectedLang] = useState<string>(() => getSavedLanguage());
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLanguages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return LANGUAGES_LIST;
    return LANGUAGES_LIST.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const currentLanguageObj = LANGUAGES_LIST.find((l) => l.code === selectedLang) || LANGUAGES_LIST[6];

  const handleSelectLanguage = (lang: LanguageItem) => {
    setSelectedLang(lang.code);
    saveSelectedLanguage(lang.code);
    if (onLanguageChange) {
      onLanguageChange(lang.code);
    }
    onShowToast(`Language set to ${lang.name} (${lang.nativeName})`);
  };

  return (
    <div className="space-y-4">
      {/* Current Active Language Highlight */}
      <div className="neu-flat rounded-[24px] p-4 space-y-2.5 border border-blue-100 bg-gradient-to-br from-white via-blue-50/20 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl neu-raised flex items-center justify-center text-[#5B9DFF]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Current Language
                </span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-0.5">
                  <Check className="w-2.5 h-2.5" />
                  Active
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                {currentLanguageObj.name}{' '}
                <span className="text-xs font-normal text-slate-500">
                  ({currentLanguageObj.nativeName})
                </span>
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Search Filter Box */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search 42 languages (e.g. Spanish, हिन्दी, 日本語)..."
          className="w-full h-11 pl-10 pr-9 rounded-[20px] neu-inset bg-slate-50/50 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Languages List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            All Available Languages ({filteredLanguages.length})
          </span>
          <span className="text-[10px] text-slate-400">Tap to apply</span>
        </div>

        {filteredLanguages.length === 0 ? (
          <div className="neu-flat rounded-[22px] p-6 text-center text-slate-400 text-xs">
            No language matching &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          <div className="neu-flat rounded-[22px] overflow-hidden divide-y divide-slate-100/80 max-h-[380px] overflow-y-auto">
            {filteredLanguages.map((lang) => {
              const isSelected = selectedLang === lang.code;
              return (
                <motion.button
                  key={lang.code}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectLanguage(lang)}
                  className={`w-full px-4 py-3 flex items-center justify-between transition-colors text-left cursor-pointer ${
                    isSelected ? 'bg-blue-50/60 font-semibold' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{lang.name}</span>
                      {isSelected && (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-[#5B9DFF] text-white">
                          Selected
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {lang.nativeName}
                    </span>
                  </div>

                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-[#5B9DFF] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full neu-inset" />
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
