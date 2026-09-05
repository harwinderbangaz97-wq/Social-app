import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, X, Flame, Heart, Smile, Sparkles, ThumbsUp, PartyPopper } from 'lucide-react';

export interface EmojiPickerPopupProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
  selectedEmoji?: string | null;
  align?: 'left' | 'right' | 'center';
  position?: 'top' | 'bottom';
}

interface EmojiItem {
  emoji: string;
  name: string;
  category: 'quick' | 'smileys' | 'gestures' | 'hearts' | 'party' | 'objects' | 'nature';
  keywords: string[];
}

const POPULAR_REACTIONS: EmojiItem[] = [
  { emoji: '❤️', name: 'Red Heart', category: 'quick', keywords: ['love', 'like', 'heart', 'red'] },
  { emoji: '🔥', name: 'Fire', category: 'quick', keywords: ['hot', 'lit', 'fire', 'cool', 'awesome'] },
  { emoji: '😂', name: 'Face with Tears of Joy', category: 'quick', keywords: ['laugh', 'lol', 'funny', 'haha', 'crying'] },
  { emoji: '😮', name: 'Face with Open Mouth', category: 'quick', keywords: ['wow', 'surprise', 'omg', 'shocked'] },
  { emoji: '😢', name: 'Crying Face', category: 'quick', keywords: ['sad', 'cry', 'tear', 'upset'] },
  { emoji: '👏', name: 'Clapping Hands', category: 'quick', keywords: ['clap', 'applause', 'bravo', 'congrats'] },
  { emoji: '🎉', name: 'Party Popper', category: 'quick', keywords: ['party', 'celebrate', 'congratulations', 'tada'] },
  { emoji: '💯', name: 'Hundred Points', category: 'quick', keywords: ['100', 'perfect', 'score', 'keep it real'] },
  { emoji: '😍', name: 'Smiling Face with Heart-Eyes', category: 'quick', keywords: ['love', 'crush', 'heart eyes', 'adoring'] },
  { emoji: '🚀', name: 'Rocket', category: 'quick', keywords: ['rocket', 'launch', 'to the moon', 'fast', 'hyped'] },
  { emoji: '👍', name: 'Thumbs Up', category: 'quick', keywords: ['like', 'approve', 'yes', 'agree', 'good'] },
  { emoji: '👎', name: 'Thumbs Down', category: 'quick', keywords: ['dislike', 'no', 'disapprove', 'bad'] },
];

const ALL_EMOJIS: EmojiItem[] = [
  // Quick
  ...POPULAR_REACTIONS,
  // Smileys
  { emoji: '😀', name: 'Grinning Face', category: 'smileys', keywords: ['smile', 'happy', 'grin'] },
  { emoji: '😃', name: 'Grinning Face with Big Eyes', category: 'smileys', keywords: ['happy', 'joy', 'smile'] },
  { emoji: '😄', name: 'Grinning Face with Smiling Eyes', category: 'smileys', keywords: ['happy', 'laugh', 'pleased'] },
  { emoji: '😁', name: 'Beaming Face with Smiling Eyes', category: 'smileys', keywords: ['teeth', 'grin', 'happy'] },
  { emoji: '😆', name: 'Grinning Squinting Face', category: 'smileys', keywords: ['laugh', 'haha', 'joke'] },
  { emoji: '😅', name: 'Grinning Face with Sweat', category: 'smileys', keywords: ['whew', 'relief', 'nervous laugh'] },
  { emoji: '🤣', name: 'Rolling on the Floor Laughing', category: 'smileys', keywords: ['rofl', 'hilarious', 'laughing'] },
  { emoji: '🥹', name: 'Face Holding Back Tears', category: 'smileys', keywords: ['touched', 'emotional', 'grateful', 'proud'] },
  { emoji: '😊', name: 'Smiling Face with Smiling Eyes', category: 'smileys', keywords: ['blush', 'warm', 'friendly'] },
  { emoji: '😇', name: 'Smiling Face with Halo', category: 'smileys', keywords: ['angel', 'innocent', 'good'] },
  { emoji: '🥰', name: 'Smiling Face with Hearts', category: 'smileys', keywords: ['love', 'adore', 'fond'] },
  { emoji: '😘', name: 'Face Blowing a Kiss', category: 'smileys', keywords: ['kiss', 'love', 'flirt'] },
  { emoji: '😋', name: 'Face Savoring Food', category: 'smileys', keywords: ['yum', 'delicious', 'tasty'] },
  { emoji: '😜', name: 'Winking Face with Tongue', category: 'smileys', keywords: ['winky', 'playful', 'silly'] },
  { emoji: '🤪', name: 'Zany Face', category: 'smileys', keywords: ['crazy', 'wild', 'party'] },
  { emoji: '🤩', name: 'Star-Struck', category: 'smileys', keywords: ['stars', 'amazed', 'wow', 'celebrity'] },
  { emoji: '🥳', name: 'Partying Face', category: 'smileys', keywords: ['celebration', 'birthday', 'party', 'hat'] },
  { emoji: '😎', name: 'Smiling Face with Sunglasses', category: 'smileys', keywords: ['cool', 'boss', 'shades'] },
  { emoji: '🤓', name: 'Nerd Face', category: 'smileys', keywords: ['geek', 'smart', 'glasses'] },
  { emoji: '🧐', name: 'Face with Monocle', category: 'smileys', keywords: ['curious', 'investigating', 'hmm'] },
  { emoji: '🤔', name: 'Thinking Face', category: 'smileys', keywords: ['think', 'wonder', 'ponder'] },
  { emoji: '🫡', name: 'Saluting Face', category: 'smileys', keywords: ['salute', 'respect', 'yes sir'] },
  { emoji: '🤫', name: 'Shushing Face', category: 'smileys', keywords: ['quiet', 'secret', 'hush'] },
  { emoji: '🫠', name: 'Melting Face', category: 'smileys', keywords: ['melt', 'hot', 'awkward', 'disappearing'] },
  { emoji: '🤯', name: 'Exploding Head', category: 'smileys', keywords: ['mind blown', 'shocked', 'unbelievable'] },
  { emoji: '😱', name: 'Face Screaming in Fear', category: 'smileys', keywords: ['scream', 'scared', 'shock'] },
  { emoji: '🥺', name: 'Pleading Face', category: 'smileys', keywords: ['please', 'puppy eyes', 'begging'] },
  { emoji: '😤', name: 'Face with Steam From Nose', category: 'smileys', keywords: ['triumph', 'proud', 'furious'] },
  { emoji: '😴', name: 'Sleeping Face', category: 'smileys', keywords: ['sleep', 'tired', 'zzz'] },
  { emoji: '🤤', name: 'Drooling Face', category: 'smileys', keywords: ['drool', 'craving', 'delicious'] },

  // Gestures
  { emoji: '🙌', name: 'Raising Hands', category: 'gestures', keywords: ['praise', 'celebrate', 'hooray'] },
  { emoji: '👐', name: 'Open Hands', category: 'gestures', keywords: ['hug', 'open', 'welcome'] },
  { emoji: '🤝', name: 'Handshake', category: 'gestures', keywords: ['deal', 'agreement', 'partner'] },
  { emoji: '🙏', name: 'Folded Hands', category: 'gestures', keywords: ['pray', 'please', 'thank you', 'namaste'] },
  { emoji: '✌️', name: 'Victory Hand', category: 'gestures', keywords: ['peace', 'v', 'victory'] },
  { emoji: '🤞', name: 'Crossed Fingers', category: 'gestures', keywords: ['luck', 'hope', 'wish'] },
  { emoji: '🫰', name: 'Hand with Index Finger and Thumb Crossed', category: 'gestures', keywords: ['finger heart', 'korean heart', 'love'] },
  { emoji: '🤟', name: 'Love-You Gesture', category: 'gestures', keywords: ['ily', 'love you', 'rock'] },
  { emoji: '🤘', name: 'Sign of the Horns', category: 'gestures', keywords: ['rock on', 'metal', 'cool'] },
  { emoji: '🤙', name: 'Call Me Hand', category: 'gestures', keywords: ['shaka', 'hang loose', 'call'] },
  { emoji: '👋', name: 'Waving Hand', category: 'gestures', keywords: ['hello', 'bye', 'wave'] },
  { emoji: '💪', name: 'Flexed Biceps', category: 'gestures', keywords: ['strong', 'muscle', 'power', 'gym'] },
  { emoji: '👊', name: 'Oncoming Fist', category: 'gestures', keywords: ['fist bump', 'punch', 'bro'] },
  { emoji: '🤌', name: 'Pinched Fingers', category: 'gestures', keywords: ['italian', 'what do you mean', 'gesture'] },
  { emoji: '👀', name: 'Eyes', category: 'gestures', keywords: ['looking', 'see', 'peek', 'shifty'] },
  { emoji: '✨', name: 'Sparkles', category: 'gestures', keywords: ['shine', 'magic', 'clean', 'special'] },

  // Hearts
  { emoji: '💖', name: 'Sparkling Heart', category: 'hearts', keywords: ['sparkle', 'love', 'glow'] },
  { emoji: '💗', name: 'Growing Heart', category: 'hearts', keywords: ['excited', 'pulse', 'love'] },
  { emoji: '💓', name: 'Beating Heart', category: 'hearts', keywords: ['heartbeat', 'thump', 'love'] },
  { emoji: '💞', name: 'Revolving Hearts', category: 'hearts', keywords: ['in love', 'hearts', 'romance'] },
  { emoji: '💕', name: 'Two Hearts', category: 'hearts', keywords: ['love', 'affinity', 'sweet'] },
  { emoji: '❤️‍🔥', name: 'Heart on Fire', category: 'hearts', keywords: ['passion', 'burning love', 'intense'] },
  { emoji: '❤️‍🩹', name: 'Mending Heart', category: 'hearts', keywords: ['healing', 'recovering', 'better'] },
  { emoji: '🧡', name: 'Orange Heart', category: 'hearts', keywords: ['orange', 'friendship', 'warm'] },
  { emoji: '💛', name: 'Yellow Heart', category: 'hearts', keywords: ['yellow', 'sunshine', 'loyalty'] },
  { emoji: '💚', name: 'Green Heart', category: 'hearts', keywords: ['green', 'nature', 'envy', 'growth'] },
  { emoji: '💙', name: 'Blue Heart', category: 'hearts', keywords: ['blue', 'peace', 'calm', 'trust'] },
  { emoji: '💜', name: 'Purple Heart', category: 'hearts', keywords: ['purple', 'glamour', 'honor'] },
  { emoji: '🤍', name: 'White Heart', category: 'hearts', keywords: ['white', 'pure', 'peace'] },
  { emoji: '🤎', name: 'Brown Heart', category: 'hearts', keywords: ['brown', 'chocolate', 'warm'] },
  { emoji: '🖤', name: 'Black Heart', category: 'hearts', keywords: ['black', 'dark', 'goth', 'sorrow'] },
  { emoji: '💔', name: 'Broken Heart', category: 'hearts', keywords: ['breakup', 'heartbreak', 'sad'] },

  // Party & Fun
  { emoji: '🎊', name: 'Confetti Ball', category: 'party', keywords: ['celebrate', 'party', 'tada'] },
  { emoji: '🎈', name: 'Balloon', category: 'party', keywords: ['birthday', 'celebration', 'fun'] },
  { emoji: '🎂', name: 'Birthday Cake', category: 'party', keywords: ['cake', 'bday', 'party', 'sweet'] },
  { emoji: '🎁', name: 'Wrapped Gift', category: 'party', keywords: ['present', 'gift', 'surprise'] },
  { emoji: '🏆', name: 'Trophy', category: 'party', keywords: ['winner', 'champion', 'first place', 'victory'] },
  { emoji: '🥇', name: '1st Place Medal', category: 'party', keywords: ['gold', 'first', 'win'] },
  { emoji: '🎯', name: 'Bullseye', category: 'party', keywords: ['target', 'direct hit', 'spot on'] },
  { emoji: '👑', name: 'Crown', category: 'party', keywords: ['king', 'queen', 'royal', 'legend'] },
  { emoji: '💎', name: 'Gem Stone', category: 'party', keywords: ['diamond', 'valuable', 'sparkle', 'gem'] },
  { emoji: '🌟', name: 'Glowing Star', category: 'party', keywords: ['star', 'shine', 'glow', 'super'] },
  { emoji: '⚡', name: 'High Voltage', category: 'party', keywords: ['lightning', 'energy', 'zap', 'fast'] },

  // Objects & Symbols
  { emoji: '💡', name: 'Light Bulb', category: 'objects', keywords: ['idea', 'bright', 'smart', 'insight'] },
  { emoji: '💬', name: 'Speech Balloon', category: 'objects', keywords: ['chat', 'message', 'talk'] },
  { emoji: '☕', name: 'Hot Beverage', category: 'objects', keywords: ['coffee', 'tea', 'morning', 'relax'] },
  { emoji: '📸', name: 'Camera with Flash', category: 'objects', keywords: ['photo', 'picture', 'snap'] },
  { emoji: '🎧', name: 'Headphone', category: 'objects', keywords: ['music', 'audio', 'listen', 'vibes'] },
  { emoji: '🌈', name: 'Rainbow', category: 'objects', keywords: ['colors', 'pride', 'sky', 'beautiful'] },
  { emoji: '☀️', name: 'Sun', category: 'objects', keywords: ['sunny', 'bright', 'weather', 'warm'] },
  { emoji: '🌸', name: 'Cherry Blossom', category: 'objects', keywords: ['flower', 'spring', 'petal', 'pink'] },
  { emoji: '🍀', name: 'Four Leaf Clover', category: 'objects', keywords: ['lucky', 'fortune', 'irish'] },
];

export const EmojiPickerPopup: React.FC<EmojiPickerPopupProps> = ({
  onSelectEmoji,
  onClose,
  selectedEmoji = null,
  align = 'left',
  position = 'top',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [onClose]);

  // Focus search input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Filter emojis based on search or category
  const filteredEmojis = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      return ALL_EMOJIS.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.keywords.some((kw) => kw.includes(query)) ||
          item.emoji === query
      );
    }

    if (activeCategory === 'all') {
      return ALL_EMOJIS;
    }

    if (activeCategory === 'quick') {
      return POPULAR_REACTIONS;
    }

    return ALL_EMOJIS.filter((item) => item.category === activeCategory);
  }, [searchQuery, activeCategory]);

  const categories = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'quick', label: 'Popular', icon: Flame },
    { id: 'smileys', label: 'Faces', icon: Smile },
    { id: 'gestures', label: 'Gestures', icon: ThumbsUp },
    { id: 'hearts', label: 'Hearts', icon: Heart },
    { id: 'party', label: 'Celebration', icon: PartyPopper },
  ];

  // Position calculation
  const alignClass =
    align === 'right'
      ? 'right-0'
      : align === 'center'
      ? 'left-1/2 -translate-x-1/2'
      : 'left-0';

  const positionClass = position === 'top' ? 'bottom-full mb-2.5' : 'top-full mt-2.5';

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.93, y: position === 'top' ? 10 : -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.93, y: position === 'top' ? 8 : -8 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`absolute ${positionClass} ${alignClass} z-50 w-[310px] sm:w-[340px] max-w-[94vw] bg-white/98 backdrop-blur-xl rounded-[24px] border border-slate-200/90 shadow-[0_12px_36px_rgba(0,0,0,0.18)] p-3.5 flex flex-col gap-2.5 select-none text-slate-800`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header & Quick Clear */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-['Outfit']">
            Reactions
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#5B9DFF] border border-blue-100">
            Tap to react
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-6.5 h-6.5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close emoji picker"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Favorite Reactions Ribbon */}
      <div className="p-2 rounded-2xl bg-slate-50/90 border border-slate-100/90">
        <div className="text-[10.5px] font-semibold text-slate-400 mb-1.5 px-0.5 flex items-center gap-1">
          <Flame className="w-3 h-3 text-amber-500" />
          <span>Quick Reactions</span>
        </div>
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-0.5">
          {POPULAR_REACTIONS.slice(0, 7).map((item) => {
            const isSelected = selectedEmoji === item.emoji;
            return (
              <motion.button
                key={`quick_${item.emoji}`}
                type="button"
                whileHover={{ scale: 1.25, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  onSelectEmoji(item.emoji);
                  onClose();
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xl transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-blue-100/90 ring-2 ring-[#5B9DFF] shadow-xs'
                    : 'hover:bg-white hover:shadow-sm active:scale-95'
                }`}
                title={item.name}
              >
                <span>{item.emoji}</span>
                {isSelected && (
                  <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#5B9DFF]" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Instant Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search emojis & reactions..."
          className="w-full h-8.5 pl-8 pr-7 text-xs rounded-xl bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-[#5B9DFF]/60 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]/20 transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Category Pills (Visible when not searching) */}
      {!searchQuery && (
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#5B9DFF] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Emoji Grid Scrollable Area */}
      <div className="max-h-48 overflow-y-auto no-scrollbar pr-0.5 rounded-xl">
        {filteredEmojis.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-1.5">
            <span className="text-xl">🔍</span>
            <span>No emoji reactions found for &ldquo;{searchQuery}&rdquo;</span>
          </div>
        ) : (
          <div className="grid grid-cols-7 sm:grid-cols-8 gap-1.5 p-1">
            {filteredEmojis.map((item, idx) => {
              const isSelected = selectedEmoji === item.emoji;
              return (
                <motion.button
                  key={`${item.emoji}_${idx}`}
                  type="button"
                  whileHover={{ scale: 1.25, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    onSelectEmoji(item.emoji);
                    onClose();
                  }}
                  className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center text-lg transition-colors cursor-pointer relative ${
                    isSelected
                      ? 'bg-blue-100/90 ring-2 ring-[#5B9DFF] shadow-xs'
                      : 'hover:bg-slate-100 active:bg-slate-200/70'
                  }`}
                  title={item.name}
                  aria-label={item.name}
                >
                  <span>{item.emoji}</span>
                  {isSelected && (
                    <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#5B9DFF]" />
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Indicator Footer */}
      {selectedEmoji && (
        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>Your reaction:</span>
            <span className="text-base">{selectedEmoji}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onSelectEmoji(selectedEmoji); // Toggles off
              onClose();
            }}
            className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
          >
            Remove reaction
          </button>
        </div>
      )}
    </motion.div>
  );
};
