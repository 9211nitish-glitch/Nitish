import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export default function AnimatedCounter({ 
  end, 
  duration = 2000, 
  suffix = "", 
  prefix = "", 
  className 
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            
            const startTime = Date.now();
            const startValue = 0;
            
            const animate = () => {
              const elapsedTime = Date.now() - startTime;
              const progress = Math.min(elapsedTime / duration, 1);
              
              // Easing function for smooth animation
              const easeOutQuart = 1 - Math.pow(1 - progress, 4);
              const currentValue = Math.round(startValue + (end - startValue) * easeOutQuart);
              
              setCount(currentValue);
              
              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            };
            
            animate();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <div ref={counterRef} className={cn("", className)}>
      {prefix}{count}{suffix}
    </div>
  );
}
