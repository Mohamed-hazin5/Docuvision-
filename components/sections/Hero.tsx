"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-kicker", { opacity: 0, y: 12, duration: 0.5 })
        .from(".hero-title-line", { opacity: 0, y: 48, duration: 1, stagger: 0.08 }, "-=0.05")
        .from(".hero-copy", { opacity: 0, y: 18, duration: 0.8 }, "-=0.45")
        .from(".hero-cta", { opacity: 0, y: 14, duration: 0.6, stagger: 0.1 }, "-=0.3");

      gsap.from(".hero-float", {
        opacity: 0,
        y: 40,
        scale: 0.96,
        duration: 1.4,
        ease: "power3.out",
        delay: 0.2,
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden px-6 pb-24 pt-20 sm:px-12 md:px-16 lg:px-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.25),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.25),transparent_25%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.25),transparent_32%)]" />

      <div className="relative grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-6">
          <div className="hero-kicker inline-flex items-center gap-2 rounded-full bg-black text-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20">
            GSAP + Lenis + Swup
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </div>

          <h1 className="text-balance text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
            <span className="hero-title-line block">Silky-smooth, animated</span>
            <span className="hero-title-line block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500">
              Next.js experiences
            </span>
          </h1>

          <p className="hero-copy max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            Lenis-powered scrolling, GSAP micro-interactions, and Swup page transitions—
            the exact toolkit used by premium Awwwards sites, right inside your app router.
          </p>

          <div className="hero-cta flex flex-wrap items-center gap-3">
            <MagneticButton className="bg-indigo-600 hover:bg-indigo-500">
              Build with this stack
            </MagneticButton>
            <MagneticButton className="bg-slate-900 hover:bg-slate-800">
              Watch the motion
            </MagneticButton>
            <span className="text-sm text-slate-500">Scroll to see reveals & parallax</span>
          </div>
        </div>

        <div className="hero-float relative">
          <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/80 p-6 shadow-2xl backdrop-blur lg:p-8">
            <div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Motion recipe
              <span className="h-px flex-1 bg-gradient-to-r from-indigo-500/50 to-transparent" />
            </div>
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
                <div>
                  <p className="font-semibold text-slate-900">Lenis</p>
                  <p>Smooths scroll velocity, syncs with ScrollTrigger, removes jitter.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.15)]" />
                <div>
                  <p className="font-semibold text-slate-900">GSAP + ScrollTrigger</p>
                  <p>Reveal, stagger, and parallax timelines tied to scroll positions.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
                <span className="mt-1 h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.15)]" />
                <div>
                  <p className="font-semibold text-slate-900">Swup</p>
                  <p>Page transitions that feel like a native app—fade, slide, or wipe.</p>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
              <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <p className="text-3xl font-bold text-slate-900">0.9s</p>
                <p className="text-slate-500">Max reveal timing</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <p className="text-3xl font-bold text-slate-900">60fps</p>
                <p className="text-slate-500">Lenis scroll loop</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


