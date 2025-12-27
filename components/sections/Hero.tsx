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
            AI-Powered Analytics
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <h1 className="text-balance text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
            <span className="hero-title-line block">Turn documents into</span>
            <span className="hero-title-line block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500">
              Interactive Insights
            </span>
          </h1>

          <p className="hero-copy max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            Upload PDFs, Excel, or CSV files. Let our advanced AI analyze the data, generate
            beautiful visualizations, and create comprehensive reports in seconds.
          </p>

          <div className="hero-cta flex flex-wrap items-center gap-3">
            <a href="/dashboard/upload" className="block">
              <MagneticButton className="bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)]">
                Launch Dashboard →
              </MagneticButton>
            </a>
            <MagneticButton className="bg-slate-900 hover:bg-slate-800">
              View Demo
            </MagneticButton>
            <span className="text-sm text-slate-500">No account required to try</span>
          </div>
        </div>

        <div className="hero-float relative">
          <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/80 p-6 shadow-2xl backdrop-blur lg:p-8">
            <div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Analysis Capabilities
              <span className="h-px flex-1 bg-gradient-to-r from-indigo-500/50 to-transparent" />
            </div>
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-transform hover:scale-[1.02]">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
                <div>
                  <p className="font-semibold text-slate-900">Instant Visualization</p>
                  <p>Automatically turn data tables into interactive charts and graphs.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 transition-transform hover:scale-[1.02]">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.15)]" />
                <div>
                  <p className="font-semibold text-slate-900">AI Deep Dive</p>
                  <p>Ask questions about your data and get analyst-grade answers.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/70 p-4 transition-transform hover:scale-[1.02]">
                <span className="mt-1 h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.15)]" />
                <div>
                  <p className="font-semibold text-slate-900">PDF to Report</p>
                  <p>Extract structured data from unstructured PDF documents effortlessly.</p>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
              <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm text-center">
                <p className="text-3xl font-bold text-slate-900">3+</p>
                <p className="text-slate-500">File Formats</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm text-center">
                <p className="text-3xl font-bold text-slate-900">Gemini</p>
                <p className="text-slate-500">2.5 Flash Powered</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


