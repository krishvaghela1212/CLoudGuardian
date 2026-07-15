import { useEffect, useState, useRef } from 'react';

/**
 * Custom hook that reveals text character by character at a configurable speed.
 * Only starts when startTrigger becomes true.
 *
 * @param text - The full text to reveal
 * @param speed - Milliseconds per character (default 40)
 * @param startTrigger - Whether to start the animation (default true)
 * @returns {{ displayText: string, isComplete: boolean }}
 */
export function useTypingAnimation(
  text: string,
  speed: number = 40,
  startTrigger: boolean = true
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const prevTextRef = useRef(text);

  // Reset index when text changes
  useEffect(() => {
    if (prevTextRef.current !== text) {
      setCurrentIndex(0);
      prevTextRef.current = text;
    }
  }, [text]);

  useEffect(() => {
    if (!startTrigger) return;
    if (currentIndex >= text.length) return;

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [currentIndex, text, speed, startTrigger]);

  return {
    displayText: text.substring(0, currentIndex),
    isComplete: currentIndex >= text.length,
  };
}
