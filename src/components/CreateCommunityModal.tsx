import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Globe, Users, Image as ImageIcon, Briefcase, Heart, Cpu } from 'lucide-react';

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 'tech', label: 'Technology', icon: Cpu, color: 'text-indigo-500', bg: 'bg-indigo-100' },
  { id: 'social', label: 'Social', icon: Users, color: 'text-blue-500', bg: 'bg-blue-100' },
  { id: 'hobbies', label: 'Hobbies', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-100' },
  { id: 'professional', label: 'Professional', icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  { id: 'general', label: 'General', icon: Globe, color: 'text-amber-500', bg: 'bg-amber-100' },
];

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    
    // In a real app, we would save this to the backend here
    console.log({
      name,
      description,
      categoryId: selectedCategory,
      image: previewImage
    });
    
    onClose();
    
    // Reset state
    setTimeout(() => {
      setName('');
      setDescription('');
      setSelectedCategory('general');
      setPreviewImage(null);
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:w-full sm:max-w-md sm:max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex-none flex items-center justify-between p-4 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-800">Create Community</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* Image Upload */}
              <div className="flex flex-col items-center">
                <div 
                  onClick={handleImageClick}
                  className="relative w-24 h-24 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition group overflow-hidden"
                >
                  {previewImage ? (
                    <>
                      <img src={previewImage} alt="Community preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 group-hover:text-[#5B9DFF] transition">
                      <ImageIcon className="w-8 h-8 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Community Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Local Hikers"
                  maxLength={50}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]/30 focus:border-[#5B9DFF]/50 transition text-slate-800 placeholder-slate-400 font-medium"
                />
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition ${
                        selectedCategory === cat.id 
                          ? 'border-[#5B9DFF] bg-blue-50/50 shadow-sm' 
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.bg}`}>
                        <cat.icon className={`w-4 h-4 ${cat.color}`} />
                      </div>
                      <span className={`text-sm font-bold ${selectedCategory === cat.id ? 'text-slate-800' : 'text-slate-600'}`}>
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this community about?"
                  rows={3}
                  maxLength={200}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5B9DFF]/30 focus:border-[#5B9DFF]/50 transition text-slate-800 placeholder-slate-400 font-medium resize-none"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="flex-none p-4 border-t border-slate-100 bg-white sm:rounded-b-3xl">
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 ${
                  name.trim() 
                    ? 'bg-[#5B9DFF] text-white shadow-lg shadow-[#5B9DFF]/30 hover:bg-blue-600' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Launch Community
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
