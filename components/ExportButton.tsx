/**
 * ExportButton Component
 * Reusable button for exporting charts and dashboards
 */

'use client';

import { useState } from 'react';

interface ExportButtonProps {
    onExport: () => Promise<void>;
    label?: string;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}

export function ExportButton({
    onExport,
    label = 'Export',
    icon,
    variant = 'secondary',
    size = 'md',
    disabled = false,
}: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await onExport();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const baseClasses = 'inline-flex items-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-violet-600 text-white hover:bg-violet-700 active:scale-95',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-95',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 active:scale-95',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            onClick={handleExport}
            disabled={disabled || isExporting}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
        >
            {isExporting ? (
                <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Exporting...</span>
                </>
            ) : (
                <>
                    {icon || (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    )}
                    <span>{label}</span>
                </>
            )}
        </button>
    );
}

/**
 * ExportMenu Component
 * Dropdown menu with multiple export options
 */

interface ExportMenuProps {
    options: Array<{
        label: string;
        icon?: React.ReactNode;
        onClick: () => Promise<void>;
    }>;
    buttonLabel?: string;
}

export function ExportMenu({ options, buttonLabel = 'Export' }: ExportMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleOptionClick = async (onClick: () => Promise<void>) => {
        setIsExporting(true);
        setIsOpen(false);
        try {
            await onClick();
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isExporting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-all duration-200 disabled:opacity-50"
            >
                {isExporting ? (
                    <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Exporting...</span>
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>{buttonLabel}</span>
                        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </>
                )}
            </button>

            {isOpen && !isExporting && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-20">
                        {options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleOptionClick(option.onClick)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                {option.icon || (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                    </svg>
                                )}
                                <span className="font-medium">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
