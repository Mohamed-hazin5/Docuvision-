"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;

const getLenis = () => {
  if (!lenisInstance) {
    lenisInstance = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
    });
  }
  return lenisInstance;
};

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const lenis = getLenis();

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    document.documentElement.classList.add("lenis");
    document.body.classList.add("lenis-body");

    lenis.on("scroll", ScrollTrigger.update);
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (typeof value === "number") {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });
    ScrollTrigger.defaults({ scroller: document.body });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off("scroll", ScrollTrigger.update);
      document.documentElement.classList.remove("lenis");
      document.body.classList.remove("lenis-body");
    };
  }, []);

  return <>{children}</>;
}


