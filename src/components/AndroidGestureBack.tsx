import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

/**
 * Android 13/14+ Predictive Back Gesture & Edge Swipe Handler
 * Intercepts edge swipe gestures on touch devices and desktop drag testing,
 * providing native Android tactile visual feedback and triggering goBack().
 */
interface AndroidGestureBackProps {
  onBack?: () => void;
  canGoBack?: boolean;
}

export const AndroidGestureBack: React.FC<AndroidGestureBackProps> = ({
  onBack: propOnBack,
  canGoBack: propCanGoBack,
}) => {
  const nav = useNavigation();
  const goBack = propOnBack || nav.goBack;
  const canGoBack = propCanGoBack !== undefined ? propCanGoBack : nav.canGoBack;
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0); // 0 to 1
  const [swipeY, setSwipeY] = useState(0);

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isValidEdgeGestureRef = useRef<boolean>(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (!canGoBack) return;
      const touch = e.touches[0];
      if (!touch) return;

      // Check if touch starts within 35px of the left edge (or right edge for dual-side)
      if (touch.clientX <= 35) {
        touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
        isValidEdgeGestureRef.current = true;
        setSwipeY(touch.clientY);
      } else {
        isValidEdgeGestureRef.current = false;
        touchStartRef.current = null;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isValidEdgeGestureRef.current || !touchStartRef.current || !canGoBack) return;
      const touch = e.touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

      // If user is scrolling vertically rather than swiping horizontally, cancel
      if (deltaY > 60 && deltaX < 40) {
        isValidEdgeGestureRef.current = false;
        setIsSwiping(false);
        return;
      }

      if (deltaX > 15) {
        setIsSwiping(true);
        // Calculate normalized progress up to 100px swipe
        const progress = Math.min(1, Math.max(0, (deltaX - 15) / 80));
        setSwipeProgress(progress);
        setSwipeY(touch.clientY);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isValidEdgeGestureRef.current || !touchStartRef.current || !canGoBack) {
        setIsSwiping(false);
        setSwipeProgress(0);
        return;
      }

      const touch = e.changedTouches[0];
      if (touch) {
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
        const elapsed = Date.now() - touchStartRef.current.time;

        // If swipe traveled > 55px horizontally and wasn't a vertical scroll
        if (deltaX > 55 && deltaY < 80 && elapsed < 800) {
          goBack();
        }
      }

      setIsSwiping(false);
      setSwipeProgress(0);
      touchStartRef.current = null;
      isValidEdgeGestureRef.current = false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [canGoBack, goBack]);

  if (!canGoBack || !isSwiping) return null;

  return (
    <AnimatePresence>
      {isSwiping && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed left-0 z-[9999] pointer-events-none flex items-center"
          style={{
            top: Math.max(80, Math.min(window.innerHeight - 80, swipeY - 24)),
            transform: `translateX(${swipeProgress * 20}px)`,
          }}
        >
          <div
            className={`w-11 h-11 rounded-r-full shadow-2xl flex items-center justify-center transition-colors ${
              swipeProgress >= 0.8
                ? 'bg-[#5B9DFF] text-white scale-110'
                : 'bg-white/95 text-slate-700 backdrop-blur-md border-r border-y border-slate-200'
            }`}
          >
            <ArrowLeft
              className={`w-5 h-5 transition-transform ${
                swipeProgress >= 0.8 ? '-translate-x-1' : ''
              }`}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
