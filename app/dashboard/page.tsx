"use client";

import * as echarts from "echarts";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import ReactECharts from "echarts-for-react";
import { useUser } from "@/components/providers/UserProvider";
import { ExportMenu } from "@/components/ExportButton";
import { exportDashboardAsPDF, exportChartsAsZIP, getTimestampedFilename } from "@/lib/export-utils";
import { AIReportModal } from "@/components/AIReportModal";
import { useUISettings } from "@/components/providers/UISettingsProvider";

// Fix for React 19 type compatibility
const EChartsComponent = ReactECharts as any;

export default function DashboardPage() {
    const { stats, recentActivity, savedCharts, removeSavedChart } = useUser();
    const { settings, isInitialized } = useUISettings();

    // Safety check for stats to prevent crashes if context is partial
    const safeStats = stats || { totalReports: 0, dataPointsProcessed: 0 };
    const safeActivity = Array.isArray(recentActivity) ? recentActivity : [];

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [accentColor, setAccentColor] = useState('#7c3aed');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const style = getComputedStyle(document.documentElement);
            const accent = style.getPropertyValue('--accent').trim() || '#7c3aed';
            setAccentColor(accent);
        }
    }, [settings.accentColor, isInitialized]);

    useEffect(() => {
        if (!isInitialized || settings.motionLevel === 'off') return;

        // Set initial visibility to prevent flash
        gsap.set(".header-text, .bento-item", { opacity: 1 });

        const ctx = gsap.context(() => {
            // Header Animation
            gsap.from(".header-text", {
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.08,
                ease: "power3.out",
                clearProps: "all",
            });

            // Bento Grid Animation
            gsap.from(".bento-item", {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.06,
                delay: 0.15,
                ease: "power2.out",
                clearProps: "all",
            });
        }, containerRef);
        return () => ctx.revert();
    }, [isInitialized, settings.motionLevel]);

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
                        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
                        label: { show: false }
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
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: accentColor },
                        { offset: 1, color: 'rgba(99, 102, 241, 0)' }
                    ])
                }
            }],
        };
    };

    return (
        <div ref={containerRef} className="max-w-7xl mx-auto space-y-[var(--grid-gap,2.5rem)] pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                <div>
                    <h1 className="header-text text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                        Your <span className="text-transparent bg-clip-text bg-[image:var(--gradient-primary)]">Insights</span> <br />
                        Dashboard.
                    </h1>
                    <p className="header-text text-lg text-muted mt-4 max-w-xl">
                        Welcome back. Monitor your key performance indicators and AI-generated analytics in one unified view.
                    </p>
                </div>
                <div className="header-text flex items-center gap-3">
                    <ExportMenu
                        buttonLabel="Export Dashboard"
                        options={[
                            {
                                label: "Export as PDF",
                                onClick: async () => {
                                    if (containerRef.current) {
                                        await exportDashboardAsPDF(
                                            containerRef.current,
                                            getTimestampedFilename('dashboard', 'pdf'),
                                            {
                                                title: 'DocuVision Dashboard',
                                                includeDate: true
                                            }
                                        );
                                    }
                                }
                            },
                            {
                                label: "Export Charts as ZIP",
                                onClick: async () => {
                                    const chartElements = document.querySelectorAll('.chart-export-target');
                                    const charts = Array.from(chartElements).map((el, i) => ({
                                        element: el as HTMLElement,
                                        name: `chart-${i + 1}`
                                    }));
                                    if (charts.length > 0) {
                                        await exportChartsAsZIP(charts, getTimestampedFilename('charts', 'zip'));
                                    } else {
                                        alert('No charts to export');
                                    }
                                }
                            }
                        ]}
                    />
                    <button
                        onClick={() => setIsReportModalOpen(true)}
                        disabled={savedCharts.length === 0}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-full hover:from-violet-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={savedCharts.length === 0 ? "Add charts to generate report" : "Generate AI Report"}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Generate Report</span>
                    </button>
                    <Link href="/dashboard/upload" className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 bg-slate-900 rounded-full hover:bg-slate-800 hover:ring-4 hover:ring-slate-900/20 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
                        <span className="mr-2">New Analysis</span>
                        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Link>
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

                {/* Main Action Block - Large */}
                <div className="bento-item col-span-1 md:col-span-2 lg:col-span-2 row-span-2 relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white p-10 flex flex-col justify-between hover-card group">
                    <div className="relative z-10 mt-10">
                        <Link href="/dashboard/upload" className="inline-flex items-center gap-3 bg-surface text-foreground px-6 py-4 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95">
                            Upload Data File
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        </Link>
                    </div>
                </div>

                {/* Stats Card 1 */}
                <div className="bento-item col-span-1 md:col-span-1 bg-surface p-8 rounded-[2rem] border border-border shadow-sm hover-card relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 text-violet-500 bg-violet-500/10 rounded-bl-3xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <p className="text-muted font-medium mb-1">Total Reports</p>
                    <h3 className="text-4xl font-extrabold text-foreground">{safeStats.totalReports}</h3>
                    <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <span>↑ 14%</span>
                        <span className="text-emerald-600/60 font-normal">vs last week</span>
                    </div>
                </div>

                {/* Stats Card 2 */}
                <div className="bento-item col-span-1 md:col-span-1 bg-surface p-8 rounded-[2rem] border border-border shadow-sm hover-card relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 text-pink-500 bg-pink-500/10 rounded-bl-3xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <p className="text-muted font-medium mb-1">Data Points</p>
                    <h3 className="text-4xl font-extrabold text-foreground">{savedCharts.reduce((acc, c) => acc + (c.dataSnapshot?.x?.length || 0), 0) + safeStats.dataPointsProcessed}</h3>
                    <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <span>↑ 5.2%</span>
                        <span className="text-emerald-600/60 font-normal">vs last month</span>
                    </div>
                </div>

                {/* Recent Activity List */}
                <div className="bento-item col-span-1 md:col-span-2 bg-surface p-8 rounded-[2rem] border border-border shadow-sm hover-card flex flex-col">
                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                        Recent Activity
                    </h3>
                    <div className="space-y-4 flex-1">
                        {safeActivity.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-background transition-colors group cursor-pointer">
                                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center text-lg group-hover:bg-[#e0e7ff] group-hover:text-[#4f46e5] transition-colors">
                                    {item.type === 'upload' ? '📄' : item.type === 'chart' ? '📊' : '💡'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-foreground truncate">{item.name}</h4>
                                    <p className="text-xs text-muted">{item.time}</p>
                                </div>
                                <div className="text-slate-300 group-hover:text-violet-500 transition-colors">
                                    →
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Saved Charts Grid - Variable Width */}
                {savedCharts.length > 0 && (
                    <div className="col-span-1 md:col-span-3 lg:col-span-4 mt-8">
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">Your Saved Visualizations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedCharts.map((chart, i) => (
                                <div
                                    key={chart.id}
                                    className="bento-item chart-export-target bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover-card relative group"
                                >
                                    <div className="mb-4 flex items-start justify-between">
                                        <div>
                                            <span className="inline-block px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-bold uppercase tracking-wider mb-2">
                                                {chart.chartType}
                                            </span>
                                            <h3 className="font-bold text-slate-900 text-lg">{chart.xAxis} vs {chart.yAxis}</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={async () => {
                                                    const chartEl = document.getElementById(`chart-${chart.id}`);
                                                    if (chartEl) {
                                                        const { exportChartWithMetadata } = await import('@/lib/export-utils');
                                                        await exportChartWithMetadata(
                                                            chartEl,
                                                            {
                                                                title: `${chart.xAxis} vs ${chart.yAxis}`,
                                                                xAxisLabel: chart.xAxis,
                                                                yAxisLabel: chart.yAxis,
                                                                insight: chart.insight
                                                            },
                                                            'png',
                                                            `${chart.xAxis}_${chart.yAxis}.png`
                                                        );
                                                    }
                                                }}
                                                className="p-2 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-full transition-colors"
                                                title="Export chart"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </button>
                                            <button onClick={() => removeSavedChart(chart.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Delete chart">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div id={`chart-${chart.id}`} className="h-40 w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                                        {chart.dataSnapshot ? (
                                            <EChartsComponent option={buildChartOptions(chart)} style={{ height: '100%', width: '100%' }} />
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                                <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                                <span className="text-xs font-medium">Data Missing</span>
                                            </div>
                                        )}
                                    </div>

                                    {chart.insight && (
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-2 mb-2 text-violet-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                <span className="text-xs font-extrabold uppercase">AI Insight</span>
                                            </div>
                                            <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                                                {chart.insight}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* AI Report Modal */}
            <AIReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                charts={savedCharts}
                dashboardStats={safeStats}
            />
        </div>
    );
}
