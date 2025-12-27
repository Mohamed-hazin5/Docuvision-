"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function MagneticButton({
  children,
  className = "",
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = ref.current;
    if (!button) return;

    const xTo = gsap.quickTo(button, "x", {
      duration: 0.35,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(button, "y", {
      duration: 0.35,
      ease: "power3.out",
    });

    const handleMove = (e: PointerEvent) => {
      const rect = button.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      xTo(dx * 0.18);
      yTo(dy * 0.18);
    };

    const reset = () => {
      xTo(0);
      yTo(0);
    };

    button.addEventListener("pointermove", handleMove);
    button.addEventListener("pointerleave", reset);
    return () => {
      button.removeEventListener("pointermove", handleMove);
      button.removeEventListener("pointerleave", reset);
    };
  }, []);

  return (
    <button
      ref={ref}
      {...props}
      className={`relative isolate overflow-hidden rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${className}`}
    >
      <span className="pointer-events-none">{children}</span>
    </button>
  );
}


