"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Hero } from "@/components/sections/Hero";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { MagneticButton } from "@/components/ui/MagneticButton";

const highlights = [
  {
    title: "GSAP timelines",
    copy: "Staggers, reveals, parallax, and micro-interactions all in one API.",
  },
  {
    title: "Lenis smooth scroll",
    copy: "Webflow-level inertial scrolling that stays in sync with ScrollTrigger.",
  },
  {
    title: "Swup transitions",
    copy: "SPA-feel fades and slides between pages without losing scroll context.",
  },
  {
    title: "Tailwind layouts",
    copy: "Fast grid + flex composition with design tokens already wired in.",
  },
];

const motionPlan = [
  "Initialize Lenis + ScrollTrigger once at layout level.",
  "Use GSAP timelines inside client components for hero + sections.",
  "Wrap pages in Swup container for fade/slide transitions.",
  "Add hover/magnetic micro-interactions for CTAs and cards.",
];

export default function Home() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".marquee-track", {
        xPercent: -50,
        repeat: -1,
        ease: "none",
        duration: 20,
      });
    }, marqueeRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50/50 to-white text-slate-900">
      <Hero />

      <section className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-20 sm:px-12 md:px-16 lg:px-24">
        <div className="flex flex-col gap-4">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">
            Motion pillars
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
              The stack your favorite showcase sites actually use
            </h2>
            <MagneticButton className="bg-indigo-600 hover:bg-indigo-500">
              View component code
            </MagneticButton>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {highlights.map((item, index) => (
            <RevealOnScroll key={item.title} delay={index * 0.06}>
              <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-indigo-200/30 transition-transform duration-500 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-transparent to-rose-50 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 font-semibold">
                    {index + 1}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-base text-slate-600">{item.copy}</p>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <section
        ref={marqueeRef}
        className="border-y border-slate-100 bg-white/70 backdrop-blur"
      >
        <div className="relative overflow-hidden py-6">
          <div className="marquee-track flex min-w-[200%] gap-10 whitespace-nowrap px-6 text-sm font-semibold uppercase tracking-[0.32em] text-slate-400 sm:px-12 md:px-16 lg:px-24">
            {Array.from({ length: 2 }).map((_, outerIdx) => (
              <div key={outerIdx} className="flex items-center gap-10">
                <span>GSAP</span>
                <span>ScrollTrigger</span>
                <span>Lenis Smooth</span>
                <span>Swup Transitions</span>
                <span>Tailwind Layouts</span>
                <span>Micro-interactions</span>
                <span>Parallax</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:px-12 md:px-16 lg:px-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <RevealOnScroll>
          <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-indigo-100/40">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-indigo-500">
              Build order
            </p>
            <h3 className="text-3xl font-semibold leading-tight text-slate-900">
              Follow this sequence to ship motion without breaking SSR
            </h3>
            <ol className="space-y-4 text-slate-700">
              {motionPlan.map((step, idx) => (
                <li
                  key={step}
                  className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4"
                >
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap gap-3">
              <MagneticButton className="bg-slate-900 hover:bg-slate-800">
                Add motion to dashboard →
              </MagneticButton>
              <MagneticButton className="bg-indigo-600 hover:bg-indigo-500">
                Trigger a reveal now
              </MagneticButton>
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.08}>
          <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl">
            <div className="absolute inset-0 opacity-40 mix-blend-screen">
              <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-indigo-500/50 blur-3xl" />
              <div className="absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-rose-500/40 blur-3xl" />
            </div>
            <div className="relative space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">
                ScrollTrigger snippet
              </p>
              <div className="rounded-2xl bg-slate-900/60 p-5 ring-1 ring-white/10 backdrop-blur">
                <pre className="font-mono text-sm leading-6 text-indigo-100">
{`gsap.from(".card", {
  opacity: 0,
  y: 48,
  scrollTrigger: { trigger: ".card", start: "top 80%" },
});`}
                </pre>
                <div className="mt-3 text-xs text-indigo-200/80">
                  Runs in a client component, already wired to Lenis proxy.
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-indigo-100">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(74,222,128,0.25)]" />
                Prefers-reduced-motion friendly: Lenis/GSAP skip when requested.
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </div>
  );
}
