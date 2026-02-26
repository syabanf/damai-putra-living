import { useEffect, useState, useRef } from 'react';

export function usePullToRefresh(onRefresh) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e) => {
      startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (isRefreshing) return;
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      // Only trigger if scrolled to top and pulling down
      if (container.scrollTop === 0 && diff > 60) {
        setIsRefreshing(true);
        onRefresh().then(() => setIsRefreshing(false));
      }
    };

    container.addEventListener('touchstart', handleTouchStart, false);
    container.addEventListener('touchmove', handleTouchMove, false);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart, false);
      container.removeEventListener('touchmove', handleTouchMove, false);
    };
  }, [isRefreshing, onRefresh]);

  return { isRefreshing, containerRef };
}