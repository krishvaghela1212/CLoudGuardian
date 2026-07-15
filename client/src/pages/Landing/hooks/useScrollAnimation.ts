import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimationConfig {
  start?: string;
  end?: string;
  scrub?: boolean | number;
}

/**
 * Custom hook that provides scroll-driven animation progress using GSAP ScrollTrigger.
 * Returns a ref to attach to the target element, a progress value in [0, 1],
 * and an isInView boolean indicating whether the element is within the trigger zone.
 */
export function useScrollAnimation(config?: ScrollAnimationConfig) {
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: config?.start ?? 'top 80%',
      end: config?.end ?? 'bottom 20%',
      scrub: config?.scrub ?? false,
      onUpdate: (self) => {
        setProgress(Math.min(Math.max(self.progress, 0), 1));
      },
      onEnter: () => setIsInView(true),
      onLeave: () => setIsInView(false),
      onEnterBack: () => setIsInView(true),
      onLeaveBack: () => setIsInView(false),
    });

    return () => {
      trigger.kill();
    };
  }, [config?.start, config?.end, config?.scrub]);

  return { ref, progress, isInView };
}
