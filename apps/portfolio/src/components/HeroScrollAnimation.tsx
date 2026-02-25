"use client";

import { Children, isValidElement, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type AnimationType = "none" | "fade" | "slide-up";

interface HeroScrollAnimationProps {
  animation: AnimationType;
  children: ReactNode;
  className?: string;
  /** When true, each direct child animates in sequence with a stagger delay */
  stagger?: boolean;
}

export function HeroScrollAnimation({
  animation,
  children,
  className = "",
  stagger = false,
}: HeroScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (animation === "none") {
      setInView(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animation]);

  if (animation === "none") {
    return <div className={className}>{children}</div>;
  }

  const baseClass = "transition-all duration-700 ease-out";
  const hiddenClass =
    animation === "fade"
      ? "opacity-0"
      : "opacity-0 translate-y-4";
  const visibleClass =
    animation === "fade"
      ? "opacity-100"
      : "opacity-100 translate-y-0";

  if (stagger) {
    const staggerDelayMs = 120;
    return (
      <div ref={ref} className={className}>
        {Children.map(children, (child, index) => {
          if (!isValidElement(child)) return child;
          return (
            <div
              key={child.key ?? index}
              className={`${baseClass} ${inView ? visibleClass : hiddenClass}`}
              style={{ transitionDelay: inView ? `${index * staggerDelayMs}ms` : "0ms" }}
            >
              {child}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`${baseClass} ${inView ? visibleClass : hiddenClass} ${className}`}
    >
      {children}
    </div>
  );
}
