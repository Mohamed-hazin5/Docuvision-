"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface UserProfile {
    name: string;
    email: string;
    avatar: string; // Initials or URL
    plan: string;
}

export interface Activity {
    id: string;
    name: string;
    time: string;
    timestamp: number;
    type: "upload" | "chart" | "insight";
}

interface RealTimeStats {
    totalReports: number;
    usagePercent: number;
    systemStatus: "Operational" | "Degraded" | "Maintenance";
    onlineUsers: number;
    dataPointsProcessed: number;
}

export interface ChartData {
    id: string;
    xAxis: string;
    yAxis: string;
    chartType: string;
    insight: string;
    dataSnapshot: {
        x: any[];
        y: any[];
    };
    // Customization fields
    customTitle?: string;
    customXLabel?: string;
    customYLabel?: string;
    customColor?: string;
    showLegend?: boolean;
}

interface UserContextType {
    user: UserProfile;
    stats: RealTimeStats;
    recentActivity: Activity[];
    loading: boolean;
    addActivity: (name: string, type: "upload" | "chart" | "insight") => void;
    savedCharts: ChartData[];
    addSavedChart: (chart: ChartData) => void;
    removeSavedChart: (id: string) => void;
    updateSavedChart: (id: string, updates: Partial<ChartData>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile>({
        name: "Alex Morgan",
        email: "alex.morgan@docuvision.ai",
        avatar: "AM",
        plan: "Enterprise",
    });

    const [stats, setStats] = useState<RealTimeStats>({
        totalReports: 0,
        usagePercent: 0,
        systemStatus: "Operational",
        onlineUsers: 0,
        dataPointsProcessed: 0,
    });

    const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

    const [savedCharts, setSavedCharts] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(false);

    // Internal flag to track if we've finished loading from localStorage
    // This prevents saving default "0" state over persisted data during mount
    const [isLoaded, setIsLoaded] = useState(false);

    const { data: session, status } = useSession();

    // Load User Data (Sync with DB)
    useEffect(() => {
        if (status !== "authenticated") return;

        const loadData = async () => {
            try {
                // First try loading from local storage for instant render
                const localCharts = localStorage.getItem("dashboardCharts");
                if (localCharts) setSavedCharts(JSON.parse(localCharts));

                // Then fetch from server
                const res = await fetch('/api/user/sync');
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        setSavedCharts(data.savedCharts || []);
                        setRecentActivity(data.recentActivity || []);
                        setStats(prev => ({ ...prev, ...(data.stats || {}) }));
                    }
                }
            } catch (e) {
                console.error("Failed to load user data", e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadData();
    }, [status]);

    // Sync to Server on Change (Debounced)
    useEffect(() => {
        if (!isLoaded) return;

        // Save to local immediately
        localStorage.setItem("dashboardCharts", JSON.stringify(savedCharts));

        // Only sync to server if logged in
        if (status !== "authenticated") return;

        const syncToServer = setTimeout(async () => {
            try {
                await fetch('/api/user/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        savedCharts,
                        recentActivity,
                        stats: {
                            totalReports: stats.totalReports,
                            dataPointsProcessed: stats.dataPointsProcessed
                        }
                    })
                });
            } catch (e) {
                console.error("Sync failed", e);
            }
        }, 2000); // Debounce 2s

        return () => clearTimeout(syncToServer);
    }, [savedCharts, recentActivity, stats.totalReports, stats.dataPointsProcessed, isLoaded, status]);

    // Simulate real-time updates
    useEffect(() => {
        if (!isLoaded) return; // Don't start modifying data until we've loaded existing data

        const interval = setInterval(() => {
            setStats((prev) => ({
                ...prev,
                // Randomly fluctuate online users
                onlineUsers: Math.max(100, prev.onlineUsers + Math.floor(Math.random() * 10 - 4)),
                // Occasionally change usage
                usagePercent: Math.min(100, Math.max(0, prev.usagePercent + (Math.random() > 0.7 ? (Math.random() * 2 - 1) : 0))),
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, [isLoaded]);

    const addActivity = (name: string, type: "upload" | "chart" | "insight") => {
        const newActivity: Activity = {
            id: Date.now().toString(),
            name,
            time: "Just now",
            timestamp: Date.now(),
            type
        };

        setRecentActivity((prev) => [newActivity, ...prev].slice(0, 5)); // Keep last 5

        // Update stats based on activity
        setStats((prev) => {
            let newStats = { ...prev };
            if (type === "upload") {
                newStats.totalReports += 1;
                newStats.dataPointsProcessed += Math.floor(Math.random() * 500) + 100; // Simulate data points
            }
            return newStats;
        });
    };

    const addSavedChart = (chart: ChartData) => {
        setSavedCharts((prev) => [chart, ...prev]);
        addActivity(`Chart: ${chart.xAxis} vs ${chart.yAxis}`, "chart");
    };

    const removeSavedChart = (id: string) => {
        setSavedCharts((prev) => prev.filter((c) => c.id !== id));
    };

    const updateSavedChart = (id: string, updates: Partial<ChartData>) => {
        setSavedCharts((prev) =>
            prev.map((chart) =>
                chart.id === id ? { ...chart, ...updates } : chart
            )
        );
    };

    // Update relative times every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setRecentActivity((prev) => prev.map(a => ({
                ...a,
                time: getRelativeTime(a.timestamp)
            })));
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <UserContext.Provider value={{ user, stats, recentActivity, loading, addActivity, savedCharts, addSavedChart, removeSavedChart, updateSavedChart }}>
            {children}
        </UserContext.Provider>
    );
}

function getRelativeTime(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
