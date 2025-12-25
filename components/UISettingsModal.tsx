'use client';

import React, { useEffect, useRef } from 'react';
import { useUISettings, UISettings } from '@/components/providers/UISettingsProvider';
import { gsap } from 'gsap';

export function UISettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { settings, updateSettings } = useUISettings();
    const modalRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (settings.motionLevel !== 'off') {
                gsap.to(overlayRef.current, { opacity: 1, duration: 0.3 });
                gsap.fromTo(modalRef.current,
                    { scale: 0.95, opacity: 0, y: 20 },
                    { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
                );
            }
        }
    }, [isOpen, settings.motionLevel]);

    if (!isOpen) return null;

    const handleClose = () => {
        if (settings.motionLevel !== 'off') {
            gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
            gsap.to(modalRef.current, {
                scale: 0.95, opacity: 0, y: 10, duration: 0.2,
                onComplete: onClose
            });
        } else {
            onClose();
        }
    };

    const OptionGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</h4>
            <div className="flex flex-wrap gap-2">
                {children}
            </div>
        </div>
    );

    const Selectable = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${active
                ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-500/20'
                : 'bg-background text-foreground border-border hover:border-muted/50'
                }`}
        >
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div
                ref={overlayRef}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm opacity-0"
                onClick={handleClose}
            />

            <div
                ref={modalRef}
                className="relative bg-surface rounded-[2.5rem] shadow-2xl border border-border w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Experience Settings</h2>
                        <p className="text-sm text-slate-500">Customize how DocuVision looks and feels.</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-full hover:bg-background transition-colors"
                    >
                        <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-8 scrollbar-none">

                    <OptionGroup label="Appearance">
                        <Selectable active={settings.theme === 'light'} onClick={() => updateSettings({ theme: 'light' })}>Light</Selectable>
                        <Selectable active={settings.theme === 'dark'} onClick={() => updateSettings({ theme: 'dark' })}>Dark</Selectable>
                        <Selectable active={settings.theme === 'system'} onClick={() => updateSettings({ theme: 'system' })}>System</Selectable>
                    </OptionGroup>

                    <OptionGroup label="Accent Color">
                        <Selectable active={settings.accentColor === 'purple'} onClick={() => updateSettings({ accentColor: 'purple' })}>Purple</Selectable>
                        <Selectable active={settings.accentColor === 'blue'} onClick={() => updateSettings({ accentColor: 'blue' })}>Blue</Selectable>
                        <Selectable active={settings.accentColor === 'green'} onClick={() => updateSettings({ accentColor: 'green' })}>Green</Selectable>
                        <Selectable active={settings.accentColor === 'orange'} onClick={() => updateSettings({ accentColor: 'orange' })}>Orange</Selectable>
                    </OptionGroup>

                    <OptionGroup label="Motion Level">
                        <Selectable active={settings.motionLevel === 'full'} onClick={() => updateSettings({ motionLevel: 'full' })}>Full Motion</Selectable>
                        <Selectable active={settings.motionLevel === 'reduced'} onClick={() => updateSettings({ motionLevel: 'reduced' })}>Reduced</Selectable>
                        <Selectable active={settings.motionLevel === 'off'} onClick={() => updateSettings({ motionLevel: 'off' })}>None</Selectable>
                    </OptionGroup>

                    <OptionGroup label="Animation Style">
                        <Selectable active={settings.animationStyle === 'smooth'} onClick={() => updateSettings({ animationStyle: 'smooth' })}>Smooth</Selectable>
                        <Selectable active={settings.animationStyle === 'snappy'} onClick={() => updateSettings({ animationStyle: 'snappy' })}>Snappy</Selectable>
                        <Selectable active={settings.animationStyle === 'minimal'} onClick={() => updateSettings({ animationStyle: 'minimal' })}>Minimal</Selectable>
                    </OptionGroup>

                    <OptionGroup label="Layout Density">
                        <Selectable active={settings.layoutDensity === 'comfortable'} onClick={() => updateSettings({ layoutDensity: 'comfortable' })}>Comfortable</Selectable>
                        <Selectable active={settings.layoutDensity === 'compact'} onClick={() => updateSettings({ layoutDensity: 'compact' })}>Compact</Selectable>
                    </OptionGroup>

                    <OptionGroup label="AI Feedback">
                        <Selectable active={settings.aiVerbosity === 'brief'} onClick={() => updateSettings({ aiVerbosity: 'brief' })}>Brief</Selectable>
                        <Selectable active={settings.aiVerbosity === 'balanced'} onClick={() => updateSettings({ aiVerbosity: 'balanced' })}>Balanced</Selectable>
                        <Selectable active={settings.aiVerbosity === 'detailed'} onClick={() => updateSettings({ aiVerbosity: 'detailed' })}>Detailed Analysis</Selectable>
                    </OptionGroup>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-900">Chart Animations</h4>
                            <p className="text-xs text-slate-500">Enable reveal effects on charts.</p>
                        </div>
                        <button
                            onClick={() => updateSettings({ chartAnimations: !settings.chartAnimations })}
                            className={`w-12 h-6 rounded-full transition-colors relative ${settings.chartAnimations ? 'bg-violet-600' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.chartAnimations ? 'translate-x-6' : ''}`} />
                        </button>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-8 pt-4 bg-slate-50 border-t border-slate-100">
                    <button
                        onClick={handleClose}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                    >
                        Save Preferences
                    </button>
                </div>
            </div>
        </div>
    );
}
