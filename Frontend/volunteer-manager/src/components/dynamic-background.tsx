'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface DynamicBackgroundProps {
  children: ReactNode;
  className?: string;
}

export function DynamicBackground({ children, className = '' }: DynamicBackgroundProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onScroll() {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;

      // How far the section is from being centered in viewport
      // 1 = fully visible/centered, 0 = far away
      const sectionCenter = rect.top + rect.height / 2;
      const viewCenter = windowH / 2;
      const distance = Math.abs(sectionCenter - viewCenter);
      const maxDistance = windowH / 2 + rect.height / 2;
      const proximity = Math.max(0, 1 - distance / maxDistance);

      // Interpolate from light (zinc-100 ~= #f4f4f5) to dark (zinc-950 ~= #09090b)
      const lightR = 244, lightG = 244, lightB = 245;
      const darkR = 9, darkG = 9, darkB = 11;

      const r = Math.round(lightR + (darkR - lightR) * proximity);
      const g = Math.round(lightG + (darkG - lightG) * proximity);
      const b = Math.round(lightB + (darkB - lightB) * proximity);

      el.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

      // Also transition text color for readability
      const textOpacity = proximity;
      const mutedOpacity = 0.45 + (proximity * 0.15); // zinc-400 feel when dark
      el.style.setProperty('--dynamic-text-r', String(Math.round(255 * proximity + 9 * (1 - proximity))));
      el.style.setProperty('--dynamic-text-g', String(Math.round(255 * proximity + 9 * (1 - proximity))));
      el.style.setProperty('--dynamic-text-b', String(Math.round(255 * proximity + 11 * (1 - proximity))));
      el.style.setProperty('--dynamic-muted-opacity', String(mutedOpacity));
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section ref={ref} className={className}>
      {children}
    </section>
  );
}
