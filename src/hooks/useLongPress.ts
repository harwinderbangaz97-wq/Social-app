import { useCallback, useRef } from 'react';

export interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
}

export function useLongPress({
  onLongPress,
  onClick,
  delay = 500,
}: UseLongPressOptions) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggered = useRef<boolean>(false);
  const startCoords = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPressed = useRef<boolean>(false);

  const start = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      // Ignore right/middle clicks
      if ('button' in e && e.button !== 0) return;

      const clientX =
        'touches' in e && e.touches.length > 0
          ? e.touches[0].clientX
          : (e as React.MouseEvent).clientX;
      const clientY =
        'touches' in e && e.touches.length > 0
          ? e.touches[0].clientY
          : (e as React.MouseEvent).clientY;

      startCoords.current = { x: clientX, y: clientY };
      isLongPressTriggered.current = false;
      isPressed.current = true;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        if (isPressed.current) {
          isLongPressTriggered.current = true;
          try {
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate?.(45);
            }
          } catch (_) {}
          onLongPress();
        }
      }, delay);
    },
    [onLongPress, delay]
  );

  const move = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isPressed.current) return;

    const clientX =
      'touches' in e && e.touches.length > 0
        ? e.touches[0].clientX
        : (e as React.MouseEvent).clientX;
    const clientY =
      'touches' in e && e.touches.length > 0
        ? e.touches[0].clientY
        : (e as React.MouseEvent).clientY;

    const dx = Math.abs(clientX - startCoords.current.x);
    const dy = Math.abs(clientY - startCoords.current.y);

    // Cancel if movement exceeds threshold (scrolling / dragging)
    if (dx > 9 || dy > 9) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      isPressed.current = false;
    }
  }, []);

  const end = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    isPressed.current = false;
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      // If long press was triggered, suppress the regular short click action
      if (isLongPressTriggered.current) {
        e.preventDefault();
        // Reset after short delay so subsequent fresh clicks work
        setTimeout(() => {
          isLongPressTriggered.current = false;
        }, 120);
        return;
      }

      if (onClick) {
        onClick();
      }
    },
    [onClick]
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (isLongPressTriggered.current) {
      e.preventDefault();
    }
  }, []);

  return {
    onTouchStart: start,
    onTouchMove: move,
    onTouchEnd: end,
    onTouchCancel: end,
    onMouseDown: start,
    onMouseMove: move,
    onMouseUp: end,
    onMouseLeave: end,
    onClick: handleClick,
    onContextMenu: handleContextMenu,
  };
}
