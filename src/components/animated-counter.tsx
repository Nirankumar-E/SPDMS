"use client";
import { useEffect, useState, useRef } from "react";

const AnimatedCounter = ({ value, className }: { value: number; className?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInViewRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInViewRef.current) {
          isInViewRef.current = true;
          let start = 0;
          const end = value;
          if (start === end) return;

          const duration = 2000;
          const startTime = performance.now();

          const animateCount = (timestamp: number) => {
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            setCount(current);

            if (progress < 1) {
              requestAnimationFrame(animateCount);
            } else {
              setCount(end);
            }
          };

          requestAnimationFrame(animateCount);
        }
      },
      {
        threshold: 0.5,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [value]);

  return <span ref={ref} className={className}>{count.toLocaleString('en-IN')}</span>;
};

export default AnimatedCounter;
