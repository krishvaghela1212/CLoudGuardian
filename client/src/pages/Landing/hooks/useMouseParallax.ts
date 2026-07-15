import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook that provides damped, normalized mouse coordinates in the range [-1, 1].
 * Uses requestAnimationFrame for smooth lerp/damping of mouse movement.
 *
 * @param sensitivity - Damping factor for interpolation (default 0.05). Lower values = smoother/slower response.
 * @returns {{ x: number, y: number }} Damped normalized coordinates in [-1, 1]
 */
export function useMouseParallax(sensitivity: number = 0.05) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    // Normalize mouse position to [-1, 1]
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = (event.clientY / window.innerHeight) * 2 - 1;

    // Clamp to [-1, 1]
    targetRef.current = {
      x: Math.min(Math.max(x, -1), 1),
      y: Math.min(Math.max(y, -1), 1),
    };
  }, []);

  useEffect(() => {
    function animate() {
      const current = currentRef.current;
      const target = targetRef.current;

      // Lerp towards target with damping
      current.x += (target.x - current.x) * sensitivity;
      current.y += (target.y - current.y) * sensitivity;

      // Clamp output to [-1, 1]
      const clampedX = Math.min(Math.max(current.x, -1), 1);
      const clampedY = Math.min(Math.max(current.y, -1), 1);

      currentRef.current = { x: clampedX, y: clampedY };
      setPosition({ x: clampedX, y: clampedY });

      rafRef.current = requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [sensitivity, handleMouseMove]);

  return position;
}
