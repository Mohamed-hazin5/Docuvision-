/**
 * AI Report Generation Client
 * Helper functions for generating and exporting AI reports
 */

export interface ReportGenerationOptions {
    charts: any[];
    dashboardStats?: {
        totalReports: number;
        dataPointsProcessed: number;
    };
    reportType?: 'executive' | 'detailed';
}

export interface ReportResult {
    success: boolean;
    report?: string;
    metadata?: {
        chartsAnalyzed: number;
        reportType: string;
        generatedAt: string;
        optimized?: boolean;
        apiCallsUsed?: number;
    };
    error?: string;
    message?: string;
    suggestion?: string;
    warnings?: string[];
    details?: string[];
}

/**
 * Generate AI report from charts
 */
export async function generateAIReport(
    options: ReportGenerationOptions
): Promise<ReportResult> {
    try {
        const response = await fetch('/api/generate-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(options),
        });

        const result = await response.json();

        // Handle quota errors specifically
        if (!response.ok && response.status === 429) {
            return {
                success: false,
                error: result.error || 'API Quota Exceeded',
                message: result.message || 'You have exceeded the Gemini API free tier limit.',
                suggestion: result.suggestion || 'Please wait for the quota to reset or upgrade your API plan.',
                details: result.details,
            };
        }

        return result;
    } catch (error: any) {
        console.error('Error generating report:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate report',
            message: 'An unexpected error occurred while generating the report.',
        };
    }
}

/**
 * Convert markdown report to formatted HTML
 */
export function markdownToHTML(markdown: string): string {
    // Simple markdown to HTML conversion
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-slate-900 mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-slate-900 mt-10 mb-6">$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Lists
    html = html.replace(/^\- (.+)$/gim, '<li class="ml-6 mb-2">$1</li>');
    html = html.replace(/^(\d+)\. (.+)$/gim, '<li class="ml-6 mb-2">$2</li>');

    // Wrap lists
    html = html.replace(/(<li.*<\/li>)/g, '<ul class="list-disc space-y-1 my-4">$1</ul>');

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p class="text-slate-700 leading-relaxed mb-4">');
    html = '<p class="text-slate-700 leading-relaxed mb-4">' + html + '</p>';

    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr class="my-8 border-slate-200" />');

    // Code blocks
    html = html.replace(/`(.+?)`/g, '<code class="px-2 py-1 bg-slate-100 text-violet-600 rounded text-sm font-mono">$1</code>');

    return html;
}

/**
 * Export report as PDF
 */
export async function exportReportAsPDF(
    reportContent: string,
    filename: string = 'ai-report.pdf'
): Promise<void> {
    const { exportReportAsPDF: exportPDF } = await import('@/lib/export-utils');
    await exportPDF(reportContent, filename, {
        title: 'AI Analysis Report',
        includeCharts: false,
    });
}

/**
 * Download report as Markdown file
 */
export function downloadReportAsMarkdown(
    reportContent: string,
    filename: string = 'report.md'
): void {
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Copy report to clipboard
 */
export async function copyReportToClipboard(reportContent: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(reportContent);
        return true;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}
