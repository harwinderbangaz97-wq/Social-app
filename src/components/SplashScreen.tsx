import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] bg-gradient-to-b from-[#F2F6FC] via-[#EDF3FA] to-[#E5EEF9] flex flex-col items-center justify-center select-none overflow-hidden"
    >
      {/* 3D Floating Marbles & Background Accents */}
      <div className="absolute top-12 left-8 w-10 h-10 rounded-full bg-gradient-to-br from-[#60A5FA] via-[#2563EB] to-[#1D4ED8] shadow-[0_10px_20px_rgba(37,99,235,0.35)] pointer-events-none transform -rotate-12 animate-pulse" />
      <div className="absolute bottom-16 right-10 w-9 h-9 rounded-full bg-gradient-to-br from-white via-[#F1F5F9] to-[#CBD5E1] shadow-[0_8px_16px_rgba(148,163,184,0.35)] pointer-events-none" />

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', damping: 20 }}
        className="flex flex-col items-center justify-center text-center px-6"
      >
        {/* Center 3D Circular Medallion with Funshann Logo */}
        <div className="w-56 h-56 rounded-full bg-gradient-to-b from-[#FFFFFF] to-[#F4F7FB] shadow-[0_24px_50px_-8px_rgba(100,116,139,0.32),0_10px_20px_-4px_rgba(148,163,184,0.2),inset_0_2px_6px_rgba(255,255,255,0.95)] flex items-center justify-center border border-white/80 p-2 mb-6">
          <div className="flex items-center justify-center tracking-tight font-extrabold text-[2.8rem] leading-none select-none">
            <span className="text-[#1E242E] drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] relative font-black">
              Fun
            </span>
            <span className="text-[#2F7CF6] drop-shadow-[0_4px_10px_rgba(37,99,235,0.45)] relative font-black ml-[1px]">
              shann
              <span className="absolute -top-1.5 -right-3 w-3 h-3 rounded-full bg-gradient-to-br from-[#60A5FA] to-[#1D4ED8] shadow-[0_3px_6px_rgba(37,99,235,0.45),inset_0_1px_2px_rgba(255,255,255,0.7)] inline-block" />
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col items-center gap-2"
        >
          <h2 className="text-xl font-extrabold text-[#1E293B] tracking-tight font-['Outfit']">
            Funshann
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2F7CF6] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[#2F7CF6] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-[#2F7CF6] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
