"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { MagneticButton } from "@/components/ui/MagneticButton";

const features = [
  {
    title: "Intelligent Extraction",
    copy: "Automatically identifies tables, metrics, and key data points from unstructured PDFs and spreadsheets.",
  },
  {
    title: "Dynamic Visualizations",
    copy: "Instantly generates interactive line, bar, and pie charts tailored to your specific data context.",
  },
  {
    title: "Deep AI Analysis",
    copy: "Gemini 2.5 Flash analyzes trends, detects anomalies, and explains 'why' the numbers changed.",
  },
  {
    title: "Export Ready",
    copy: "Download comprehensive PDF reports and high-resolution chart images for your presentations.",
  },
];

const workflowSteps = [
  "Upload your financial reports, sales data, or research papers (PDF/CSV/Excel).",
  "AI automatically cleans, parses, and structures the raw data into usable formats.",
  "Dashboard generates a suite of interactive visualizations for you to explore.",
  "Ask the AI Chat Analyst specific questions to uncover hidden insights.",
];

export default function Home() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".marquee-track", {
        xPercent: -50,
        repeat: -1,
        ease: "none",
        duration: 30,
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
            Core Capabilities
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Everything you need to understand your data
            </h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {features.map((item, index) => (
            <RevealOnScroll key={item.title} delay={index * 0.06}>
              <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-indigo-200/30 transition-transform duration-500 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-transparent to-rose-50 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 font-semibold shrink-0">
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
                <span>PDF Analysis</span>
                <span>Excel Support</span>
                <span>Automated Reporting</span>
                <span>Trend Forecasting</span>
                <span>Anomaly Detection</span>
                <span>Multi-Model AI</span>
                <span>Secure Processing</span>
                <span>Canvas Export</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 sm:px-12 md:px-16 lg:px-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <RevealOnScroll>
          <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-indigo-100/40">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-indigo-500">
              How it Works
            </p>
            <h3 className="text-3xl font-semibold leading-tight text-slate-900">
              From raw file to actionable insights in four simple steps
            </h3>
            <ol className="space-y-4 text-slate-700">
              {workflowSteps.map((step, idx) => (
                <li
                  key={step}
                  className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4"
                >
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="pt-2">
              <Link href="/dashboard/upload" className="inline-block w-full sm:w-auto">
                <MagneticButton className="bg-slate-900 hover:bg-slate-800 w-full sm:w-auto justify-center">
                  Start Analyzing Now →
                </MagneticButton>
              </Link>
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.08}>
          <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl min-h-[400px] flex flex-col justify-center">
            <div className="absolute inset-0 opacity-40 mix-blend-screen">
              <div className="absolute -left-24 top-0 h-64 w-64 rounded-full bg-indigo-500/50 blur-3xl" />
              <div className="absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-rose-500/40 blur-3xl" />
            </div>

            <div className="relative space-y-6 text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md ring-1 ring-white/20 mb-2">
                <span className="text-4xl">🚀</span>
              </div>

              <h3 className="text-2xl font-bold">Ready to see it in action?</h3>
              <p className="text-slate-300 max-w-sm mx-auto">
                Stop manually crunching numbers. Let DocuVis handle the heavy lifting so you can focus on strategy.
              </p>

              <div className="pt-4">
                <Link href="/dashboard/upload">
                  <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold py-3 px-8 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm">
                    Try DocuVis Free
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </div>
  );
}
