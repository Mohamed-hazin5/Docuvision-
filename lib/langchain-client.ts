/**
 * LangChain API Client
 * Helper functions to interact with LangChain-powered endpoints
 */

export interface AIAnalysisResult {
    success: boolean;
    extractedData?: string;
    error?: string;
    message?: string;
}

export interface AIVisualizationResult {
    success: boolean;
    suggestions?: string;
    error?: string;
    message?: string;
}

export interface AIReportResult {
    success: boolean;
    report?: string;
    error?: string;
    message?: string;
}

export interface AIWorkflowResult {
    success: boolean;
    workflow?: {
        extractedData: string;
        visualizationSuggestions: string;
        finalReport: string;
    };
    error?: string;
    message?: string;
}

export interface AIInsightsResult {
    success: boolean;
    insights?: {
        insights: Array<{
            title: string;
            description: string;
            chartSuggestion: {
                type: string;
                xAxis: string;
                yAxis: string;
                reason: string;
            };
        }>;
        summary: string;
        recommendations: string[];
    };
    error?: string;
    message?: string;
}

/**
 * Analyze document content using LangChain
 */
export async function analyzeDocument(documentContent: string): Promise<AIAnalysisResult> {
    const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentContent }),
    });
    return response.json();
}

/**
 * Get visualization suggestions using LangChain
 */
export async function getVisualizationSuggestions(
    extractedData?: string,
    columns?: string[],
    rows?: any[]
): Promise<AIVisualizationResult> {
    const response = await fetch("/api/ai/visualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extractedData, columns, rows }),
    });
    return response.json();
}

/**
 * Generate comprehensive report using LangChain
 */
export async function generateReport(
    extractedData: string,
    visualizationSuggestions: string
): Promise<AIReportResult> {
    const response = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extractedData, visualizationSuggestions }),
    });
    return response.json();
}

/**
 * Run complete AI workflow using LangGraph
 */
export async function runCompleteWorkflow(documentContent: string): Promise<AIWorkflowResult> {
    const response = await fetch("/api/ai/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentContent }),
    });
    return response.json();
}

/**
 * Get AI-powered data insights using LangChain
 */
export async function getDataInsights(
    columns: string[],
    rows: any[],
    chartType?: string,
    xAxis?: string,
    yAxis?: string
): Promise<AIInsightsResult> {
    const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columns, rows, chartType, xAxis, yAxis }),
    });
    return response.json();
}
