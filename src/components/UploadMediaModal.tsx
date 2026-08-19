import React, { useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  Camera,
  X,
  Check,
  RefreshCw,
  Crosshair,
} from 'lucide-react';
import { motion } from 'motion/react';
import { User, Post } from '../types';
import { usePermissionAndMedia } from '../context/PermissionAndMediaContext';

interface UploadMediaModalProps {
  currentUser: User;
  onClose?: () => void;
  onPublishPost: (
    newPost: Omit<
      Post,
      'id' | 'likesCount' | 'dislikesCount' | 'commentsCount' | 'isLiked' | 'isDisliked' | 'userReaction' | 'isSaved' | 'isAutoRemoved' | 'comments' | 'timestamp'
    >
  ) => void;
  initialImage?: string | null;
  onShowToast?: (msg: string) => void;
}

const FILTERS = [
  { id: 'none', name: 'Original', class: '' },
  { id: 'cool', name: 'Nordic Blue', class: 'hue-rotate-15 contrast-105 saturate-95' },
  { id: 'warm', name: 'Warm Amber', class: 'sepia-[0.18] brightness-105' },
  { id: 'crisp', name: 'Vivid Clarity', class: 'contrast-115 saturate-110' },
  { id: 'mono', name: 'Monochrome', class: 'grayscale contrast-110' },
];

export const UploadMediaModal: React.FC<UploadMediaModalProps> = ({
  currentUser,
  onClose,
  onPublishPost,
  initialImage,
  onShowToast,
}) => {
  const { chooseFromGallery, takePhoto, getLocation } = usePermissionAndMedia();
  const [selectedMedia, setSelectedMedia] = useState<string>(
    initialImage && !(initialImage.endsWith('.mp4') || initialImage.startsWith('data:video'))
      ? initialImage
      : ''
  );
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('San Francisco, CA');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [activeFilter, setActiveFilter] = useState('none');
  const [isPublishing, setIsPublishing] = useState(false);

  React.useEffect(() => {
    if (initialImage) {
      if (initialImage.endsWith('.mp4') || initialImage.startsWith('data:video')) {
        if (onShowToast) {
          onShowToast('Normal posts allow photos only. Videos can be shared in Stories! 📸');
        }
        setSelectedMedia('');
      } else {
        setSelectedMedia(initialImage);
      }
    }
  }, [initialImage, onShowToast]);

  const handlePickFromGallery = async () => {
    const res = await chooseFromGallery({
      accept: 'image/*',
      featureName: 'Create Post Photo Gallery',
    });
    if (res) {
      if (res.isVideo) {
        if (onShowToast) {
          onShowToast('Normal posts allow photos only. Videos can be shared in Stories! 📸');
        }
        return;
      }
      setSelectedMedia(res.url);
      if (onShowToast) {
        onShowToast('Photo loaded from Gallery! 📸');
      }
    }
  };

  const handleTakePhoto = async () => {
    const res = await takePhoto({
      facingMode: 'environment',
      title: 'Take Post Photo',
    });
    if (res) {
      setSelectedMedia(res.url);
      if (onShowToast) {
        onShowToast('Photo captured with camera! 📸');
      }
    }
  };

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const loc = await getLocation('Post Location Tagging');
      if (loc) {
        setLocation(loc);
        if (onShowToast) {
          onShowToast(`Location updated to ${loc} 📍`);
        }
      } else if (onShowToast) {
        onShowToast('Could not detect location. You can type it manually! 📍');
      }
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handlePublish = () => {
    if (!selectedMedia) {
      if (onShowToast) {
        onShowToast('Please select a photo from your device first! 📸');
      }
      handlePickFromGallery();
      return;
    }

    setIsPublishing(true);

    setTimeout(() => {
      onPublishPost({
        userId: currentUser.id,
        user: currentUser,
        imageUrl: selectedMedia,
        caption: caption.trim(),
        location: location.trim() || undefined,
      });
      setIsPublishing(false);
      if (onShowToast) {
        onShowToast('Post published successfully to feed! 🎉');
      }
      if (onClose) onClose();
    }, 350);
  };

  const addHashtag = (tag: string) => {
    setCaption((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 pb-28 pt-2">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight font-['Outfit']">
          Create Post
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Upload photos directly from your device
        </p>
      </div>

      {/* Main Form Container */}
      <div className="neu-flat rounded-[28px] p-5 space-y-5 shadow-lg">
        {/* Media Preview / Selection Dropzone */}
        <div className="space-y-3">
          {selectedMedia ? (
            <div className="relative w-full aspect-[4/5] rounded-[24px] overflow-hidden neu-inset bg-slate-950 flex items-center justify-center group shadow-inner">
              <img
                src={selectedMedia}
                alt="Upload preview"
                className={`w-full h-full object-cover transition-all duration-300 ${
                  FILTERS.find((f) => f.id === activeFilter)?.class || ''
                }`}
              />

              {/* Floating Action Badges on Media */}
              <div className="absolute top-3.5 right-3.5 flex items-center gap-2 z-10">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  onClick={handlePickFromGallery}
                  className="h-9 px-3.5 rounded-full bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold shadow-lg flex items-center gap-1.5 hover:bg-white hover:text-[#5B9DFF] transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#5B9DFF]" />
                  <span>Change</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  onClick={() => setSelectedMedia('')}
                  className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-rose-600 transition shadow-lg cursor-pointer"
                  title="Remove selected photo"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Overlay hint */}
              <div className="absolute bottom-3 left-3 right-3 py-1.5 px-3 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium text-center opacity-0 group-hover:opacity-100 transition-opacity">
                Tap Change button to pick a different photo
              </div>
            </div>
          ) : (
            <div
              onClick={handlePickFromGallery}
              className="relative w-full aspect-[4/5] rounded-[24px] overflow-hidden neu-inset bg-slate-50/80 border-2 border-dashed border-slate-300 hover:border-[#5B9DFF] flex flex-col items-center justify-center p-6 text-center cursor-pointer group transition-colors"
            >
              <div className="w-16 h-16 rounded-3xl neu-raised flex items-center justify-center text-[#5B9DFF] mb-3 group-hover:scale-105 transition-transform shadow-md">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">
                Select Photo
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mb-4">
                Tap to browse photos from your device gallery, or use your phone camera
              </p>

              {/* Two Direct Action Buttons for Posts: Gallery & Take Photo */}
              <div className="flex items-center justify-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePickFromGallery();
                  }}
                  aria-label="Choose from Gallery"
                  title="Choose from Gallery"
                  className="flex items-center gap-1.5 h-11 px-4 rounded-full neu-active-blue text-white shadow-md hover:bg-blue-600 transition cursor-pointer text-xs font-bold"
                >
                  <ImageIcon className="w-4 h-4 text-white" />
                  <span>Gallery</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTakePhoto();
                  }}
                  aria-label="Take Photo"
                  title="Take Photo"
                  className="flex items-center gap-1.5 h-11 px-4 rounded-full neu-raised text-slate-700 hover:text-[#5B9DFF] shadow-sm transition cursor-pointer text-xs font-bold"
                >
                  <Camera className="w-4 h-4 text-[#5B9DFF]" />
                  <span>Take Photo</span>
                </motion.button>
              </div>
            </div>
          )}
        </div>

        {/* Aesthetic Filter Tone Selector (When image is loaded) */}
        {selectedMedia && (
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-['Outfit']">
              Aesthetic Filters
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeFilter === f.id
                      ? 'neu-active-blue text-white shadow-md'
                      : 'neu-raised text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Caption Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block font-['Outfit']">
            Caption & Story
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            placeholder="Write a caption or add hashtags like #travel #punjab #photography #fun..."
            className="w-full neu-inset rounded-[20px] p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]/50 resize-none leading-relaxed"
          />

          {/* Optional Quick Tag Suggestions */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              '#travel',
              '#punjab',
              '#photography',
              '#fun',
              '#moments',
              '#vibes',
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addHashtag(tag)}
                className="px-3 py-1 rounded-full bg-slate-100/90 hover:bg-blue-50 hover:text-[#5B9DFF] text-xs font-medium text-slate-600 transition cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Location Input with Auto-detect button */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 block font-['Outfit']">
              Add Location
            </label>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className="text-[11px] font-bold text-[#5B9DFF] hover:text-blue-700 flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
            >
              {isDetectingLocation ? (
                <span className="w-3 h-3 border-2 border-[#5B9DFF] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Crosshair className="w-3.5 h-3.5" />
              )}
              <span>{isDetectingLocation ? 'Detecting...' : 'Current Location'}</span>
            </button>
          </div>
          <div className="w-full neu-inset rounded-full h-11 px-4 flex items-center gap-2.5">
            <MapPin className="w-4.5 h-4.5 text-[#5B9DFF] flex-shrink-0" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kyoto, Japan or Amalfi Coast"
              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Publish Action Button */}
        <div className="pt-2">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePublish}
            disabled={isPublishing}
            className="w-full h-13 rounded-full neu-active-blue text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-[#5B9DFF]/30 transition-all cursor-pointer"
          >
            {isPublishing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Publishing to Funshann...
              </span>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Share Photo Post</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};
