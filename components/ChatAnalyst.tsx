'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useUISettings } from '@/components/providers/UISettingsProvider';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatAnalystProps {
    columns: string[];
    rows: any[];
    charts: any[];
}

// import { UISettingsModal } from '@/components/UISettingsModal';

export function ChatAnalyst({ columns, rows, charts }: ChatAnalystProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Determine initial state/message
    const hasContext = columns.length > 0 && rows.length > 0;

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

    // Initial message based on context
    useEffect(() => {
        if (hasContext && !hasOpenedOnce) {
            setIsOpen(true);
            setHasOpenedOnce(true);
            setInput('Summarize this dashboard');
            setMessages([{
                role: 'assistant',
                content: 'Welcome! I am your dashboard analyst. I can help you understand the visible charts, identify trends, and explain metrics. Ask me about this dashboard.'
            }]);
        } else if (!hasContext && messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: 'Open a dashboard to begin.'
            }]);
        }
    }, [hasContext, hasOpenedOnce, messages.length]);

    const { settings } = useUISettings();

    const scrollRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]); // Scroll on messages or loading state change

    const toggleChat = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);

        if (nextState && settings.motionLevel !== 'off') {
            const isReduced = settings.motionLevel === 'reduced';
            const isMinimal = settings.animationStyle === 'minimal';

            const duration = isReduced ? 0.25 : (settings.animationStyle === 'snappy' ? 0.3 : 0.6);
            const ease = isReduced ? 'power1.out' : (settings.animationStyle === 'snappy' ? 'expo.out' : 'back.out(1.4)');

            const initialProps: any = { opacity: 0 };
            const animProps: any = { opacity: 1, duration, ease };

            if (!isMinimal) {
                initialProps.y = isReduced ? 10 : 30;
                animProps.y = 0;
                if (!isReduced) {
                    initialProps.scale = 0.95;
                    animProps.scale = 1;
                }
            }

            gsap.fromTo(chatRef.current, initialProps, animProps);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

        if (!hasContext) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Open a dashboard to begin. I can only help with data from an active dashboard.' }]);
            return;
        }

        setIsLoading(true);

        try {
            // Compute global aggregates for the full dataset
            const globalAggregates: any = {};
            columns.forEach(col => {
                const vals = rows.map(r => Number(String(r[col] ?? "0").replace(/[^0-9.-]+/g, ""))).filter(v => !isNaN(v));
                if (vals.length > 0) {
                    globalAggregates[col] = {
                        min: Math.min(...vals),
                        max: Math.max(...vals),
                        avg: vals.reduce((a, b) => a + b, 0) / vals.length,
                        uniqueCount: new Set(rows.map(r => r[col])).size
                    };
                }
            });

            // Prepare context with distinction between Full and Visible data
            const chatContext = {
                fullDataContext: {
                    columns: columns,
                    rowCount: rows.length,
                    aggregates: {
                        perColumn: globalAggregates
                    }
                },
                visibleDataContext: {
                    type: "table-preview",
                    rowLimit: 5,
                    visibleColumns: columns,
                    visibleRows: rows.slice(0, 5),
                    note: "This is only a UI preview of the full dataset"
                },
                charts: charts.map(c => ({
                    id: c.id,
                    type: c.chartType,
                    xAxis: c.xAxis,
                    yAxis: c.yAxis,
                    insight: c.insight,
                    aggregates: c.dataSnapshot ? {
                        min: Math.min(...c.dataSnapshot.y),
                        max: Math.max(...c.dataSnapshot.y),
                        avg: c.dataSnapshot.y.reduce((a: number, b: number) => a + b, 0) / c.dataSnapshot.y.length
                    } : null
                })),
                latestReport: ""
            };

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, { role: 'user', content: userMessage }],
                    context: chatContext,
                    settings: {
                        verbosity: settings.aiVerbosity
                    }
                })
            });

            const data = await res.json();

            if (data.success) {
                setMessages(prev => {
                    const newMessages: Message[] = [...prev, { role: 'assistant', content: data.reply }];
                    // Keep history manageable but don't slice too aggressively
                    return newMessages.length > 20 ? newMessages.slice(-20) : newMessages;
                });
            } else {
                const errorMsg = data.error?.includes('Quota')
                    ? "Daily quota reached. Please try again tomorrow or upgrade your plan."
                    : data.error?.includes('ENOTFOUND') || data.error?.includes('retries')
                        ? "I'm having trouble connecting to my brain! Please check your internet connection and try again."
                        : "Sorry, I'm having trouble connecting right now. Please try again.";
                setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Network error. Please check your connection and try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div
                    ref={chatRef}
                    className="bg-surface rounded-[2rem] shadow-2xl border border-border w-[380px] h-[550px] mb-4 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                    {/* Header */}
                    <div className="bg-foreground p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                <span className="text-xl">✨</span>
                            </div>
                            <div>
                                <h3 className="text-surface font-bold text-sm">AI Data Analyst</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[10px] text-surface/60 font-bold uppercase tracking-wider">Online</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={toggleChat}
                            className="text-surface/60 hover:text-surface transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-5 space-y-4 bg-background/50 overscroll-contain"
                        data-lenis-prevent
                        onWheel={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                    >
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-violet-600 text-white rounded-tr-none shadow-lg shadow-violet-500/10'
                                        : 'bg-surface text-foreground rounded-tl-none border border-border shadow-sm'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-surface p-4 rounded-2xl rounded-tl-none border border-border shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        </div>
                                        <span className="text-xs font-bold text-muted uppercase tracking-widest animate-pulse">Analyzing charts...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-border bg-surface">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about your data..."
                                className="w-full bg-background border-none rounded-xl py-3 pl-4 pr-12 text-sm text-foreground focus:ring-2 focus:ring-violet-500/20 outline-none transition-all placeholder:text-muted"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 p-2 rounded-lg bg-violet-600 text-white disabled:opacity-50 disabled:bg-muted transition-all active:scale-95"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-2-9-18-9 18 9 2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <div className="flex flex-col items-end gap-3">
                    <button
                        onClick={toggleChat}
                        className="group flex items-center gap-3 bg-slate-900 border border-slate-800 p-2.5 pl-5 rounded-2xl shadow-2xl hover:bg-slate-800 transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
                    >
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-0.5">Analyst is</span>
                            <span className="text-white font-bold text-sm leading-none">Ready →</span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center text-2xl shadow-lg shadow-violet-500/20 group-hover:rotate-12 transition-transform">
                            ✨
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
}
