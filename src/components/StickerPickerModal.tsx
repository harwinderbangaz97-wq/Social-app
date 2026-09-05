import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Heart, Smile, Sparkles, PartyPopper, ThumbsUp, Flame } from 'lucide-react';

interface StickerItem {
  emoji: string;
  name: string;
  keywords: string[];
}

// Categorized stickers matching: Popular, Love, Funny, Celebrations, Reactions
const CATEGORIZED_STICKERS: Record<string, StickerItem[]> = {
  popular: [
    { emoji: '🔥', name: 'Fire', keywords: ['fire', 'hot', 'lit', 'awesome', 'cool'] },
    { emoji: '😂', name: 'Tears of Joy', keywords: ['laugh', 'lol', 'funny', 'haha', 'crying'] },
    { emoji: '❤️', name: 'Red Heart', keywords: ['love', 'like', 'heart', 'red'] },
    { emoji: '😮', name: 'Surprise', keywords: ['wow', 'surprise', 'omg', 'shocked'] },
    { emoji: '👏', name: 'Clap', keywords: ['clap', 'applause', 'bravo', 'congrats'] },
    { emoji: '🎉', name: 'Party Popper', keywords: ['party', 'celebrate', 'congratulations', 'tada'] },
    { emoji: '👍', name: 'Thumbs Up', keywords: ['like', 'approve', 'yes', 'agree', 'good'] },
    { emoji: '💯', name: '100', keywords: ['100', 'perfect', 'score', 'excellent'] },
    { emoji: '😍', name: 'Heart Eyes', keywords: ['love', 'crush', 'heart eyes', 'adoring'] },
    { emoji: '🚀', name: 'Rocket', keywords: ['rocket', 'launch', 'fast', 'hyped', 'go'] },
  ],
  love: [
    { emoji: '❤️', name: 'Red Heart', keywords: ['love', 'like', 'heart', 'red'] },
    { emoji: '😍', name: 'Heart Eyes', keywords: ['love', 'crush', 'heart eyes', 'adoring'] },
    { emoji: '💖', name: 'Sparkling Heart', keywords: ['sparkle', 'love', 'glow'] },
    { emoji: '💗', name: 'Growing Heart', keywords: ['excited', 'pulse', 'love'] },
    { emoji: '💓', name: 'Beating Heart', keywords: ['heartbeat', 'thump', 'love'] },
    { emoji: '💞', name: 'Revolving Hearts', keywords: ['in love', 'hearts', 'romance'] },
    { emoji: '💕', name: 'Two Hearts', keywords: ['love', 'affinity', 'sweet'] },
    { emoji: '❤️‍🔥', name: 'Heart on Fire', keywords: ['passion', 'burning love', 'intense'] },
    { emoji: '😘', name: 'Blow Kiss', keywords: ['kiss', 'love', 'flirt'] },
    { emoji: '🫰', name: 'Finger Heart', keywords: ['finger heart', 'korean heart', 'love'] },
    { emoji: '🤟', name: 'I Love You Gesture', keywords: ['ily', 'love you', 'hand'] },
  ],
  funny: [
    { emoji: '😂', name: 'Tears of Joy', keywords: ['laugh', 'lol', 'funny', 'haha', 'crying'] },
    { emoji: '🤣', name: 'ROFL', keywords: ['rofl', 'hilarious', 'laughing'] },
    { emoji: '😜', name: 'Winking Tongue', keywords: ['winky', 'playful', 'silly'] },
    { emoji: '🤪', name: 'Zany Face', keywords: ['crazy', 'wild', 'fun'] },
    { emoji: '😆', name: 'Squinting Laugh', keywords: ['laugh', 'haha', 'joke'] },
    { emoji: '😅', name: 'Grinning Sweat', keywords: ['whew', 'relief', 'nervous laugh'] },
    { emoji: '😋', name: 'Yummy Face', keywords: ['yum', 'delicious', 'tasty'] },
    { emoji: '😎', name: 'Sunglasses', keywords: ['cool', 'shades', 'boss'] },
    { emoji: '🤡', name: 'Clown', keywords: ['clown', 'funny', 'joke', 'silly'] },
    { emoji: '👽', name: 'Alien', keywords: ['alien', 'weird', 'space', 'funny'] },
  ],
  celebrations: [
    { emoji: '🎉', name: 'Party Popper', keywords: ['party', 'celebrate', 'congratulations', 'tada'] },
    { emoji: '🎊', name: 'Confetti Ball', keywords: ['celebrate', 'party', 'tada'] },
    { emoji: '🎈', name: 'Balloon', keywords: ['balloon', 'birthday', 'celebration', 'fun'] },
    { emoji: '🎂', name: 'Birthday Cake', keywords: ['cake', 'bday', 'party', 'sweet'] },
    { emoji: '🎁', name: 'Wrapped Gift', keywords: ['present', 'gift', 'surprise'] },
    { emoji: '🏆', name: 'Trophy', keywords: ['winner', 'champion', 'first place', 'victory'] },
    { emoji: '🥇', name: 'Gold Medal', keywords: ['gold', 'first', 'win'] },
    { emoji: '🌟', name: 'Glowing Star', keywords: ['star', 'shine', 'glow', 'super'] },
    { emoji: '🥳', name: 'Partying Face', keywords: ['celebration', 'birthday', 'party', 'hat'] },
    { emoji: '🍻', name: 'Clinking Beer Mugs', keywords: ['beer', 'cheers', 'drink', 'celebration'] },
  ],
  reactions: [
    { emoji: '👍', name: 'Thumbs Up', keywords: ['like', 'approve', 'yes', 'agree', 'good'] },
    { emoji: '👎', name: 'Thumbs Down', keywords: ['dislike', 'no', 'disapprove', 'bad'] },
    { emoji: '👏', name: 'Clap', keywords: ['clap', 'applause', 'bravo', 'congrats'] },
    { emoji: '🙌', name: 'Raising Hands', keywords: ['praise', 'celebrate', 'hooray'] },
    { emoji: '👐', name: 'Open Hands', keywords: ['hug', 'open', 'welcome'] },
    { emoji: '🙏', name: 'Folded Hands', keywords: ['pray', 'please', 'thank you', 'namaste'] },
    { emoji: '🫡', name: 'Saluting Face', keywords: ['salute', 'respect', 'yes sir'] },
    { emoji: '👀', name: 'Eyes', keywords: ['looking', 'see', 'peek', 'shifty'] },
    { emoji: '🤯', name: 'Exploding Head', keywords: ['mind blown', 'shocked', 'unbelievable'] },
    { emoji: '😱', name: 'Scream Face', keywords: ['scream', 'scared', 'shock'] },
    { emoji: '🥱', name: 'Yawning Face', keywords: ['yawn', 'tired', 'sleepy'] },
    { emoji: '😢', name: 'Crying Face', keywords: ['sad', 'cry', 'tear', 'upset'] },
    { emoji: '😤', name: 'Steam Nose', keywords: ['triumph', 'proud', 'furious'] },
  ],
};

const CATEGORIES = [
  { id: 'popular', label: 'Popular', icon: Flame },
  { id: 'love', label: 'Love', icon: Heart },
  { id: 'funny', label: 'Funny', icon: Smile },
  { id: 'celebrations', label: 'Celebrations', icon: PartyPopper },
  { id: 'reactions', label: 'Reactions', icon: ThumbsUp },
];

interface StickerPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSticker: (emoji: string) => void;
}

export const StickerPickerModal: React.FC<StickerPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectSticker,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('popular');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle outside click & escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Combined sticker list for search
  const allStickers = useMemo(() => {
    const unique = new Map<string, StickerItem>();
    Object.values(CATEGORIZED_STICKERS).forEach((list) => {
      list.forEach((item) => {
        unique.set(item.emoji, item);
      });
    });
    return Array.from(unique.values());
  }, []);

  // Filter stickers based on category or search query
  const filteredStickers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      return allStickers.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.keywords.some((kw) => kw.includes(query)) ||
          item.emoji === query
      );
    }
    return CATEGORIZED_STICKERS[activeCategory] || [];
  }, [searchQuery, activeCategory, allStickers]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      {/* Background overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col z-10 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#5B9DFF]" />
            <h3 className="font-bold text-slate-800 text-base">Select Sticker Reaction</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sticker emojis..."
              className="w-full h-11 pl-10 pr-9 text-xs rounded-xl bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-100 focus:border-[#5B9DFF] text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category horizontal scrolling tabs */}
        {!searchQuery && (
          <div className="px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-50">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#5B9DFF] text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Stickers Grid */}
        <div className="p-5 overflow-y-auto max-h-[300px] min-h-[180px] no-scrollbar">
          {filteredStickers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <span className="text-3xl">🔍</span>
              <p className="text-xs font-bold">No stickers match &ldquo;{searchQuery}&rdquo;</p>
              <p className="text-[11px] text-slate-400">Try searching for other words like fire, love, laugh, congrats...</p>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-3">
              {filteredStickers.map((item) => (
                <motion.button
                  key={item.emoji}
                  whileHover={{ scale: 1.25, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    onSelectSticker(item.emoji);
                    onClose();
                  }}
                  className="w-14 h-14 rounded-2xl bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-slate-200 shadow-xs flex items-center justify-center text-3xl transition-all cursor-pointer"
                  title={item.name}
                >
                  {item.emoji}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
