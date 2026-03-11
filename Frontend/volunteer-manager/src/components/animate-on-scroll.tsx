'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type Animation = 'fade-up' | 'fade-left' | 'fade-right' | 'fade-in';

interface AnimateOnScrollProps {
  children: ReactNode;
  animation?: Animation;
  delay?: number;
  className?: string;
}

export function AnimateOnScroll({
  children,
  animation = 'fade-up',
  delay = 0,
  className = '',
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add('scroll-visible');
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`scroll-hidden scroll-${animation} ${className}`}>
      {children}
    </div>
  );
}
