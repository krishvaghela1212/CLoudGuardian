import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook that animates a counter from 0 to endValue with ease-out cubic easing.
 * Triggers when the referenced element becomes visible in the viewport via IntersectionObserver.
 * Only triggers once.
 *
 * @param endValue - The target value to count up to
 * @param duration - Animation duration in milliseconds (default 2500)
 * @returns {{ value: number, ref: RefObject<HTMLElement> }}
 */
export function useCountUp(endValue: number, duration: number = 2500) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          startAnimation();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);

    function startAnimation() {
      const startTime = performance.now();

      function animate(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic: 1 - (1 - t)^3
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * endValue);

        // Ensure monotonically non-decreasing and bounded
        setValue((prev) => Math.min(Math.max(current, prev), endValue));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }

      requestAnimationFrame(animate);
    }

    return () => {
      observer.disconnect();
    };
  }, [endValue, duration]);

  return { value, ref };
}
