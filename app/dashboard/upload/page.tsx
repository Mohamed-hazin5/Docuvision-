"use client";
import { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import gsap from "gsap";
import { useUser } from "@/components/providers/UserProvider";
import { ChatAnalyst } from "@/components/ChatAnalyst";
import { useUISettings } from "@/components/providers/UISettingsProvider";

// Fix for React 19 type compatibility
const EChartsComponent = ReactECharts as any;

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const { addActivity, savedCharts, addSavedChart, removeSavedChart } = useUser();
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [chartType, setChartType] = useState("line");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedInsight, setSelectedInsight] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Animation Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };
  const resultsRef = useRef<HTMLDivElement>(null);

  const { settings, isInitialized } = useUISettings();
  const [accentColor, setAccentColor] = useState('#7c3aed');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const style = getComputedStyle(document.documentElement);
      const accent = style.getPropertyValue('--accent').trim() || '#7c3aed';
      setAccentColor(accent);
    }
  }, [settings.accentColor, isInitialized]);

  // GSAP Entry Animation
  useEffect(() => {
    if (!isInitialized || settings.motionLevel === "off") return;

    const isReduced = settings.motionLevel === "reduced";
    const isSnappy = settings.animationStyle === "snappy";
    const isMinimal = settings.animationStyle === "minimal";

    const duration = isReduced ? 0.3 : (isSnappy ? 0.4 : 0.8);
    const ease = isReduced ? "power1.out" : (isSnappy ? "expo.out" : "back.out(1.2)");

    const animProps: any = {
      opacity: 0,
      duration,
      stagger: isReduced ? 0 : 0.15,
      ease,
    };

    if (!isMinimal) {
      animProps.y = isReduced ? 10 : 20;
    }

    const ctx = gsap.context(() => {
      gsap.from(".animate-entry", animProps);
    }, containerRef);
    return () => ctx.revert();
  }, [isInitialized, settings.motionLevel, settings.animationStyle]);

  // GSAP Results Reveal
  useEffect(() => {
    if (rows.length > 0 && resultsRef.current && settings.motionLevel !== "off") {
      const isReduced = settings.motionLevel === "reduced";
      const isMinimal = settings.animationStyle === "minimal";

      const animProps: any = { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" };
      const fromProps: any = { opacity: 0 };

      if (!isMinimal) {
        fromProps.y = isReduced ? 10 : 20;
      }

      gsap.fromTo(resultsRef.current, fromProps, animProps);
    }
  }, [rows, settings.motionLevel, settings.animationStyle]);

  const uploadFile = async () => {
    if (!file) return alert("Select a file first");

    // Handle PDF separately
    if (file.name?.toLowerCase().endsWith(".pdf")) {
      try {
        setLoadingAI(true);
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/pdf/parse", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        setLoadingAI(false);

        if (!data.success) {
          alert("PDF parse failed: " + (data.error || "unknown"));
          return;
        }

        setColumns(data.columns || []);
        setRows(data.rows || []);
        setChartType("line");
        setXAxis("");
        setYAxis("");
        setSuggestions([]);
        setSelectedInsight("");
        addActivity(file.name, "upload");
        return;
      } catch (err: any) {
        setLoadingAI(false);
        console.error(err);
        alert("PDF parse failed: " + (err?.message || String(err)));
        return;
      }
    }

    // Default: CSV / Excel upload
    const formData = new FormData();
    formData.append("file", file!);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (!data.success) return alert("Upload Failed");

    setColumns(data.columns);
    setRows(data.rows);
    setChartType("line");
    setXAxis("");
    setYAxis("");
    setSuggestions([]);
    setSelectedInsight("");
    addActivity(file.name, "upload");
  };

  const getAISuggestions = async () => {
    setLoadingAI(true);

    const res = await fetch("/api/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columns, rows }),
    });

    const data = await res.json();
    setLoadingAI(false);

    // Support both older array responses and newer { success, suggestions } shape
    const suggestionsData = Array.isArray(data) ? data : data?.suggestions || [];

    if (!Array.isArray(suggestionsData) || suggestionsData.length === 0) {
      // If API returned retry info, show that too
      if (data && data.retryAfter) {
        alert(`AI suggest failed: ${data.error || 'quota'}. Retry in ${data.retryAfter}s.`);
      } else {
        alert("No AI suggestions could be generated!");
      }
      return;
    }

    setSuggestions(suggestionsData);

    // Animate suggestions in
    gsap.fromTo(".suggestion-card",
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, stagger: 0.05, duration: 0.4, ease: "back.out(1.7)" }
    );
  };

  const addChartToDashboard = () => {
    if (!xAxis || !yAxis) return alert("Select X and Y axes before adding to dashboard.");

    const id = (typeof crypto !== "undefined" && (crypto as any).randomUUID)
      ? (crypto as any).randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const xData = rows.map((r) => r[xAxis]);
    const yData = rows.map((r) =>
      Number(String(r[yAxis] ?? "0").replace(/[^0-9.-]+/g, ""))
    );

    const newChart = {
      id,
      xAxis,
      yAxis,
      chartType,
      insight: selectedInsight || "",
      dataSnapshot: {
        x: xData,
        y: yData
      }
    };

    try {
      addSavedChart(newChart);
    } catch (e) {
      alert("Failed to save chart: Data might be too large.");
      console.error(e);
    }
  };

  const deleteChart = (chartId: string) => {
    removeSavedChart(chartId);
  };

  const buildChartOptions = (chart: any) => {
    const xValues = chart.dataSnapshot?.x || [];
    const yValues = chart.dataSnapshot?.y || [];

    const commonOptions = {
      animation: settings.chartAnimations,
      tooltip: { trigger: "item" },
    };

    if (chart.chartType === "pie") {
      return {
        ...commonOptions,
        series: [
          {
            name: chart.yAxis,
            type: "pie",
            radius: ["40%", "70%"],
            center: ['50%', '50%'],
            data: xValues.map((x: any, i: number) => ({
              name: x,
              value: yValues[i],
            })),
            itemStyle: {
              borderRadius: 6,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: { show: false },
            emphasis: {
              label: { show: false }
            }
          },
        ],
      };
    }

    return {
      ...commonOptions,
      tooltip: { trigger: "axis" },
      grid: { left: "5%", right: "5%", bottom: "10%", top: "15%", containLabel: true },
      xAxis: {
        type: "category",
        data: xValues,
        boundaryGap: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false }
      },
      yAxis: {
        type: "value",
        splitLine: { show: false },
        axisLabel: { show: false }
      },
      series: [{
        type: chart.chartType || "line",
        data: yValues,
        smooth: true,
        symbol: 'none',
        itemStyle: { color: accentColor },
        areaStyle: {
          opacity: 0.2,
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accentColor },
              { offset: 1, color: 'rgba(99, 102, 241, 0)' }
            ]
          }
        }
      }],
    };
  };

  const chartOptions = () => {
    if (!xAxis || !yAxis) return {};

    const commonOptions = {
      animation: settings.chartAnimations,
    };

    if (chartType === "pie") {
      return {
        ...commonOptions,
        tooltip: { trigger: "item" },
        series: [
          {
            name: yAxis,
            type: "pie",
            radius: ["40%", "70%"],
            data: rows.map((r) => ({
              name: r[xAxis],
              value: Number(String(r[yAxis] ?? "0").replace(/[^0-9.-]+/g, "")),
            })),
            itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 }
          },
        ],
      };
    }

    const xValues = rows.map((r) => r[xAxis]);
    const yValues = rows.map((r) =>
      Number(String(r[yAxis] ?? "0").replace(/[^0-9.-]+/g, ""))
    );

    return {
      ...commonOptions,
      tooltip: { trigger: "axis" },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: { type: "category", data: xValues, boundaryGap: false },
      yAxis: { type: "value" },
      series: [{
        type: chartType,
        data: yValues,
        smooth: true,
        symbolSize: 8,
        itemStyle: { color: accentColor },
      }],
    };
  };

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto space-y-16 pb-20">

      {/* Header */}
      <div className="animate-entry text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-[image:var(--gradient-primary)] tracking-tight">
          Upload & Visualize
        </h1>
        <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto px-4 leading-relaxed">
          Transform your raw data into actionable insights with our AI-powered engine.
          Supports CSV, Excel, and PDF.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`animate-entry group relative rounded-[2.5rem] p-10 md:p-16 border-2 border-dashed transition-all duration-500 text-center overflow-hidden
        ${isDragging
            ? "border-violet-500 bg-violet-500/5 scale-[1.02] shadow-2xl shadow-violet-500/20"
            : "border-border bg-surface/50 hover:border-violet-400 hover:shadow-xl hover:shadow-violet-100/50"
          }`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br from-violet-50/0 via-fuchsia-50/20 to-violet-50/50 transition-opacity duration-500 rounded-[2.5rem] -z-10 ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 -z-10"></div>

        <div className="flex flex-col items-center justify-center space-y-6 relative z-10">
          <div className="h-28 w-28 rounded-3xl bg-surface shadow-lg shadow-violet-500/10 flex items-center justify-center text-violet-600 mb-2 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-border">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div className="space-y-4 relative z-20">
            <label className="relative cursor-pointer inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-bold text-white transition-all duration-200 bg-foreground rounded-2xl hover:bg-foreground/90 hover:ring-4 hover:ring-foreground/10 shadow-xl shadow-foreground/10 active:scale-95">
              <span>{file ? file.name : (isDragging ? "Drop File Here" : "Select Data File")}</span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
            <p className="text-sm font-medium text-muted">or drag and drop here</p>
          </div>

          {file && (
            <div className="pt-6">
              <button
                onClick={uploadFile}
                className="px-8 py-3 bg-[image:var(--gradient-primary)] text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 transform transition hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/40"
              >
                Analyze Data →
              </button>
            </div>
          )}
        </div>
      </div>

      {rows.length > 0 && (
        <div ref={resultsRef} className="space-y-16">

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center text-sm font-bold">#</span>
                Data Preview
              </h2>
              <span className="bg-surface/50 text-muted px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                {rows.length} rows
              </span>
            </div>
            <div className="overflow-x-auto rounded-[1.5rem] border border-border shadow-sm bg-surface">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface/80 backdrop-blur-sm text-foreground font-bold border-b border-border">
                  <tr>
                    {columns.map((c) => <th key={c} className="p-5 whitespace-nowrap">{c}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.slice(0, 5).map((row, i) => (
                    <tr key={i} className="group hover:bg-violet-50/30 transition-colors">
                      {columns.map((c) => (
                        <td key={c} className="p-5 text-muted font-medium group-hover:text-violet-900 transition-colors">
                          {row[c] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {rows.length > 5 && (
                    <tr>
                      <td colSpan={columns.length} className="p-4 text-center text-muted italic bg-surface/30">
                        ... and {rows.length - 5} more rows
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="animate-entry grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map(col => {
              const numericValues = rows.map(r => Number(String(r[col] ?? "0").replace(/[^0-9.-]+/g, ""))).filter(v => !isNaN(v));
              if (numericValues.length < 2) return null;

              const max = Math.max(...numericValues);
              const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;

              return (
                <div key={col} className="bg-surface border border-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">{col} Overview</p>
                  <h4 className="text-lg font-bold text-foreground leading-tight">Max: {max.toLocaleString()}</h4>
                  <p className="text-sm text-muted mt-1">Average: {avg.toLocaleString(undefined, { maximumFractionDigits: 1 })}</p>
                </div>
              );
            }).filter(Boolean).slice(0, 4)}
          </div>

          <div className="bg-foreground rounded-[2.5rem] p-8 md:p-14 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[image:var(--gradient-dark)] opacity-90"></div>
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-violet-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-fuchsia-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                <div>
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">AI Analyst</h2>
                  <p className="text-muted mt-2 max-w-md text-lg">Let our advanced model find hidden patterns and anomalies in your data automatically.</p>
                </div>
                <button
                  onClick={getAISuggestions}
                  disabled={loadingAI}
                  className="bg-surface text-foreground px-8 py-4 rounded-xl font-bold shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.4)] hover:bg-surface/80 transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  <span className="mr-2 group-hover:animate-pulse">✨</span>
                  {loadingAI ? "Analyzing..." : "Generate Insights"}
                </button>
              </div>

              {suggestions.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {suggestions.map((s, i) => (
                    <div key={i} className="suggestion-card bg-surface/5 backdrop-blur-xl border border-border/50 p-6 rounded-2xl hover:bg-surface/10 hover:border-border transition cursor-pointer group"
                      onClick={() => {
                        setXAxis(s.x);
                        setYAxis(s.y);
                        setChartType(s.type || "line");
                        setSelectedInsight(s.reason);
                      }}>
                      <div className="flex items-start justify-between mb-4">
                        <span className="bg-violet-500/20 text-violet-200 text-xs font-bold px-2.5 py-1 rounded-lg border border-violet-500/20 uppercase tracking-widest">
                          {s.type || 'Insight'}
                        </span>
                      </div>
                      <h4 className="font-bold text-xl leading-tight mb-3 text-foreground group-hover:text-violet-200 transition-colors">{s.title}</h4>
                      <p className="text-sm text-muted leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{s.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-foreground">Visual Builder</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">X Axis</label>
                <div className="relative">
                  <select
                    value={xAxis}
                    onChange={(e) => setXAxis(e.target.value)}
                    className="w-full p-4 pr-10 rounded-xl border border-border bg-surface focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all duration-200 appearance-none font-medium text-foreground cursor-pointer hover:border-violet-400/50"
                  >
                    <option value="">Select Column</option>
                    {columns.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Y Axis</label>
                <div className="relative">
                  <select
                    value={yAxis}
                    onChange={(e) => setYAxis(e.target.value)}
                    className="w-full p-4 pr-10 rounded-xl border border-border bg-surface focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all duration-200 appearance-none font-medium text-foreground cursor-pointer hover:border-violet-400/50"
                  >
                    <option value="">Select Column</option>
                    {columns.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase tracking-wider ml-1">Chart Type</label>
                <div className="relative">
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                    className="w-full p-4 pr-10 rounded-xl border border-border bg-surface focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all duration-200 appearance-none font-medium text-foreground cursor-pointer hover:border-violet-400/50"
                  >
                    <option value="line">Line</option>
                    <option value="bar">Bar</option>
                    <option value="scatter">Scatter</option>
                    <option value="pie">Pie</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-[2rem] shadow-xl shadow-violet-500/10 p-8 border border-border relative group overflow-hidden">
              <div className="min-h-[450px]">
                {xAxis && yAxis ? (
                  <EChartsComponent option={chartOptions()} style={{ height: 450 }} />
                ) : (
                  <div className="h-full min-h-[450px] flex flex-col items-center justify-center text-muted border-2 border-dashed border-border rounded-3xl bg-surface/30">
                    <span className="text-6xl mb-6 grayscale opacity-30">📊</span>
                    <p className="font-semibold text-lg text-muted">Select axes above to preview chart</p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={addChartToDashboard}
                  className="flex items-center gap-2 bg-foreground text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-foreground/80 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                >
                  <span className="text-xl">⊕</span>
                  <span>Add to Dashboard</span>
                </button>
              </div>
            </div>

            {selectedInsight && (
              <div className="bg-violet-500/10 border border-violet-500/20 p-6 rounded-2xl flex items-start gap-4">
                <span className="text-3xl">💡</span>
                <div>
                  <h4 className="font-bold text-foreground text-lg">Selected Insight</h4>
                  <p className="text-muted leading-relaxed mt-1">{selectedInsight}</p>
                </div>
              </div>
            )}
          </div>

          {savedCharts.length > 0 && (
            <div className="pt-10 border-t border-border">
              <h3 className="text-2xl font-bold mb-8 text-foreground">Current Session Charts</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {savedCharts.map((ch) => (
                  <div
                    key={ch.id}
                    className="bg-surface rounded-3xl shadow-lg border border-border p-6 transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-foreground">{`${ch.chartType} • ${ch.xAxis} vs ${ch.yAxis}`}</h4>
                      <button
                        onClick={() => deleteChart(ch.id)}
                        className="text-red-300 hover:text-red-500 hover:bg-red-500/10 p-1 rounded-full transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="rounded-2xl bg-background overflow-hidden border border-border">
                      <EChartsComponent option={buildChartOptions(ch)} style={{ height: 200 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
      <ChatAnalyst
        columns={columns}
        rows={rows}
        charts={savedCharts}
      />
    </div>
  );
}
