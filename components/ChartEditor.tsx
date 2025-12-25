/**
 * ChartEditor Component
 * Advanced controls for customizing charts
 */

'use client';

import { useState } from 'react';

export interface ChartEditorProps {
    chartId: string;
    initialTitle?: string;
    initialXLabel?: string;
    initialYLabel?: string;
    initialChartType?: string;
    initialColor?: string;
    showLegend?: boolean;
    onSave: (updates: {
        title?: string;
        xLabel?: string;
        yLabel?: string;
        chartType?: string;
        color?: string;
        showLegend?: boolean;
    }) => void;
    onClose: () => void;
}

const CHART_TYPES = [
    { value: 'line', label: 'Line Chart', icon: '📈' },
    { value: 'bar', label: 'Bar Chart', icon: '📊' },
    { value: 'pie', label: 'Pie Chart', icon: '🥧' },
];

const COLOR_PRESETS = [
    { name: 'Violet', value: '#6366f1' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Teal', value: '#14b8a6' },
];

export function ChartEditor({
    chartId,
    initialTitle = '',
    initialXLabel = '',
    initialYLabel = '',
    initialChartType = 'line',
    initialColor = '#6366f1',
    showLegend = true,
    onSave,
    onClose,
}: ChartEditorProps) {
    const [title, setTitle] = useState(initialTitle);
    const [xLabel, setXLabel] = useState(initialXLabel);
    const [yLabel, setYLabel] = useState(initialYLabel);
    const [chartType, setChartType] = useState(initialChartType);
    const [color, setColor] = useState(initialColor);
    const [legend, setLegend] = useState(showLegend);

    const handleSave = () => {
        onSave({
            title,
            xLabel,
            yLabel,
            chartType,
            color,
            showLegend: legend,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Edit Chart</h2>
                        <p className="text-sm text-slate-500 mt-1">Customize your visualization</p>
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
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Chart Title */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Chart Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter chart title..."
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    {/* Axis Labels */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                X-Axis Label
                            </label>
                            <input
                                type="text"
                                value={xLabel}
                                onChange={(e) => setXLabel(e.target.value)}
                                placeholder="X-axis..."
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Y-Axis Label
                            </label>
                            <input
                                type="text"
                                value={yLabel}
                                onChange={(e) => setYLabel(e.target.value)}
                                placeholder="Y-axis..."
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Chart Type */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Chart Type
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {CHART_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setChartType(type.value)}
                                    className={`p-4 rounded-xl border-2 transition-all ${chartType === type.value
                                            ? 'border-violet-600 bg-violet-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="text-3xl mb-2">{type.icon}</div>
                                    <div className="text-sm font-semibold text-slate-900">{type.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                            Color Theme
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                            {COLOR_PRESETS.map((preset) => (
                                <button
                                    key={preset.value}
                                    onClick={() => setColor(preset.value)}
                                    className={`p-3 rounded-xl border-2 transition-all ${color === preset.value
                                            ? 'border-slate-900 ring-2 ring-slate-900/20'
                                            : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div
                                        className="w-full h-8 rounded-lg mb-2"
                                        style={{ backgroundColor: preset.value }}
                                    />
                                    <div className="text-xs font-medium text-slate-700">{preset.name}</div>
                                </button>
                            ))}
                        </div>

                        {/* Custom Color */}
                        <div className="mt-3 flex items-center gap-3">
                            <label className="text-sm font-medium text-slate-700">Custom:</label>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-16 h-10 rounded-lg border-2 border-slate-300 cursor-pointer"
                            />
                            <span className="text-sm text-slate-500 font-mono">{color}</span>
                        </div>
                    </div>

                    {/* Legend Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                            <div className="font-semibold text-slate-900">Show Legend</div>
                            <div className="text-sm text-slate-500">Display chart legend</div>
                        </div>
                        <button
                            onClick={() => setLegend(!legend)}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${legend ? 'bg-violet-600' : 'bg-slate-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${legend ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save Changes</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * ChartControls Component
 * Toolbar with quick chart controls
 */

export interface ChartControlsProps {
    onEdit: () => void;
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    onReset?: () => void;
    onFullscreen?: () => void;
    showZoom?: boolean;
}

export function ChartControls({
    onEdit,
    onZoomIn,
    onZoomOut,
    onReset,
    onFullscreen,
    showZoom = true,
}: ChartControlsProps) {
    return (
        <div className="flex items-center gap-2">
            {/* Edit Button */}
            <button
                onClick={onEdit}
                className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                title="Edit chart"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            </button>

            {showZoom && (
                <>
                    {/* Zoom In */}
                    <button
                        onClick={onZoomIn}
                        className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                        title="Zoom in"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                    </button>

                    {/* Zoom Out */}
                    <button
                        onClick={onZoomOut}
                        className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                        title="Zoom out"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                        </svg>
                    </button>

                    {/* Reset */}
                    <button
                        onClick={onReset}
                        className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                        title="Reset view"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </>
            )}

            {/* Fullscreen */}
            <button
                onClick={onFullscreen}
                className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                title="Fullscreen"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
            </button>
        </div>
    );
}
