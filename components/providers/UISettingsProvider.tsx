'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = "light" | "dark" | "system";
export type AccentColor = "purple" | "blue" | "green" | "orange";
export type SidebarMode = "expanded" | "collapsed";
export type LayoutDensity = "comfortable" | "compact";
export type MotionLevel = "full" | "reduced" | "off";
export type AnimationStyle = "smooth" | "snappy" | "minimal";
export type AIVerbosity = "brief" | "balanced" | "detailed";

export interface UISettings {
    theme: Theme;
    accentColor: AccentColor;
    sidebarMode: SidebarMode;
    layoutDensity: LayoutDensity;
    motionLevel: MotionLevel;
    animationStyle: AnimationStyle;
    chartAnimations: boolean;
    pageTransitions: boolean;
    aiVerbosity: AIVerbosity;
}

const DEFAULT_SETTINGS: UISettings = {
    theme: "light",
    accentColor: "purple",
    sidebarMode: "expanded",
    layoutDensity: "comfortable",
    motionLevel: "full",
    animationStyle: "smooth",
    chartAnimations: true,
    pageTransitions: true,
    aiVerbosity: "balanced",
};

interface UISettingsContextType {
    settings: UISettings;
    updateSettings: (newSettings: Partial<UISettings>) => void;
    isInitialized: boolean;
}

const UISettingsContext = createContext<UISettingsContextType | undefined>(undefined);

export function UISettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<UISettings>(DEFAULT_SETTINGS);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize settings from localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem('docu-vision-ui-settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings({ ...DEFAULT_SETTINGS, ...parsed });
            } catch (e) {
                console.error('Failed to parse UI settings', e);
            }
        }

        // Check for prefers-reduced-motion
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mediaQuery.matches && settings.motionLevel === 'full') {
            setSettings(prev => ({ ...prev, motionLevel: 'reduced' }));
        }

        setIsInitialized(true);
    }, []);

    // Sync settings to localStorage and apply global classes
    useEffect(() => {
        if (!isInitialized) return;

        localStorage.setItem('docu-vision-ui-settings', JSON.stringify(settings));

        // Apply theme
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        if (settings.theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(settings.theme);
        }

        // Apply accent color
        root.setAttribute('data-accent', settings.accentColor);

        // Apply layout density
        root.setAttribute('data-density', settings.layoutDensity);

    }, [settings, isInitialized]);

    const updateSettings = (newSettings: Partial<UISettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <UISettingsContext.Provider value={{ settings, updateSettings, isInitialized }}>
            {children}
        </UISettingsContext.Provider>
    );
}

export function useUISettings() {
    const context = useContext(UISettingsContext);
    if (context === undefined) {
        throw new Error('useUISettings must be used within a UISettingsProvider');
    }
    return context;
}
