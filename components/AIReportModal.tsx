/**
 * AIReportModal Component
 * Modal for generating and displaying AI-powered reports
 */

'use client';

import { useState } from 'react';
import { generateAIReport, markdownToHTML, downloadReportAsMarkdown, copyReportToClipboard } from '@/lib/report-client';
import { exportReportAsPDF } from '@/lib/export-utils';

interface AIReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    charts: any[];
    dashboardStats?: {
        totalReports: number;
        dataPointsProcessed: number;
    };
}

export function AIReportModal({ isOpen, onClose, charts, dashboardStats }: AIReportModalProps) {
    const [reportType, setReportType] = useState<'executive' | 'detailed'>('executive');
    const [isGenerating, setIsGenerating] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingTip, setLoadingTip] = useState(0);
    const tips = [
        "Analyzing data patterns...",
        "Identifying key trends...",
        "Extracting actionable insights...",
        "Synthesizing final report...",
        "Applying professional formatting..."
    ];

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);

        // Cycle tips every 2.5 seconds
        const tipInterval = setInterval(() => {
            setLoadingTip(prev => (prev + 1) % tips.length);
        }, 2500);

        try {
            const result = await generateAIReport({
                charts,
                dashboardStats,
                reportType,
            });

            if (result.success && result.report) {
                setReport(result.report);
            } else {
                setError(result.error || result.message || 'Failed to generate report');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsGenerating(false);
            clearInterval(tipInterval);
        }
    };

    const handleCopy = async () => {
        if (report) {
            const success = await copyReportToClipboard(report);
            if (success) {
                alert('Report copied to clipboard!');
            }
        }
    };

    const handleDownloadMarkdown = () => {
        if (report) {
            downloadReportAsMarkdown(report, `ai-report-${Date.now()}.md`);
        }
    };

    const handleDownloadPDF = async () => {
        if (report) {
            await exportReportAsPDF(report, `ai-report-${Date.now()}.pdf`);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">AI Report Generator</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Generate comprehensive insights from your {charts.length} chart{charts.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!report ? (
                        <div className="space-y-6">
                            {/* Report Type Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">
                                    Report Type
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setReportType('executive')}
                                        className={`p-4 rounded-xl border-2 transition-all ${reportType === 'executive'
                                            ? 'border-violet-600 bg-violet-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full border-2 ${reportType === 'executive' ? 'border-violet-600 bg-violet-600' : 'border-slate-300'
                                                }`}>
                                                {reportType === 'executive' && (
                                                    <div className="w-full h-full rounded-full bg-white scale-50" />
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <div className="font-semibold text-slate-900">Executive Summary</div>
                                                <div className="text-xs text-slate-500">Concise, high-level insights</div>
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setReportType('detailed')}
                                        className={`p-4 rounded-xl border-2 transition-all ${reportType === 'detailed'
                                            ? 'border-violet-600 bg-violet-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full border-2 ${reportType === 'detailed' ? 'border-violet-600 bg-violet-600' : 'border-slate-300'
                                                }`}>
                                                {reportType === 'detailed' && (
                                                    <div className="w-full h-full rounded-full bg-white scale-50" />
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <div className="font-semibold text-slate-900">Detailed Analysis</div>
                                                <div className="text-xs text-slate-500">Comprehensive, in-depth report</div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                <h3 className="font-semibold text-slate-900 mb-2">What's Included:</h3>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    {reportType === 'executive' ? (
                                        <>
                                            <li className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Key findings and insights
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Trends and patterns
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Actionable recommendations
                                            </li>
                                        </>
                                    ) : (
                                        <>
                                            <li className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Chart-by-chart analysis
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Cross-chart insights
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Predictive insights & risk assessment
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            {error && (
                                <div className={`rounded-2xl p-6 border transition-all animate-in fade-in duration-500 ${error.includes('Quota') || error.includes('limit')
                                    ? 'bg-amber-50 border-amber-200 text-amber-900 shadow-sm'
                                    : 'bg-red-50 border-red-200 text-red-900 shadow-sm'
                                    }`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-xl ${error.includes('Quota') || error.includes('limit') ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                            {error.includes('Quota') || error.includes('limit') ? (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg mb-1">
                                                {error.includes('Quota') || error.includes('limit') ? 'Daily Quota Reached' : 'Generation Failed'}
                                            </h4>
                                            <p className="text-sm opacity-90 leading-relaxed mb-3">
                                                {error}
                                            </p>

                                            {error.includes('Quota') && (
                                                <div className="mt-4 space-y-4">
                                                    <div className="bg-white/50 rounded-xl p-3 border border-amber-200/50">
                                                        <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">Recommendation</p>
                                                        <p className="text-sm">The free tier allows 10 reports per day. You can wait for the reset or switch to a pro key.</p>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        <a
                                                            href="https://ai.google.dev/pricing"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700 transition-colors inline-block"
                                                        >
                                                            Upgrade Plan
                                                        </a>
                                                        <button
                                                            onClick={() => setError(null)}
                                                            className="px-4 py-2 bg-white text-amber-700 border border-amber-200 rounded-lg text-sm font-semibold hover:bg-amber-100 transition-colors"
                                                        >
                                                            Try Again Later
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="prose prose-slate max-w-none animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div dangerouslySetInnerHTML={{ __html: markdownToHTML(report) }} />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 flex items-center justify-between">
                    {!report ? (
                        <>
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || charts.length === 0}
                                className="px-6 py-2.5 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span className="animate-pulse">{tips[loadingTip]}</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span>Generate Report</span>
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setReport(null)}
                                className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition-colors"
                            >
                                ← Back
                            </button>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleCopy}
                                    className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition-colors flex items-center gap-2"
                                    title="Copy to clipboard"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy
                                </button>
                                <button
                                    onClick={handleDownloadMarkdown}
                                    className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition-colors flex items-center gap-2"
                                    title="Download as Markdown"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    .MD
                                </button>
                                <button
                                    onClick={handleDownloadPDF}
                                    className="px-4 py-2.5 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors flex items-center gap-2"
                                    title="Download as PDF"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    PDF
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
