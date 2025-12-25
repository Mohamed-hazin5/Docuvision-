import { getKeyManager } from "@/lib/multi-key-manager";

/**
 * Enhanced Report Generation using Direct REST API calls to Google Gemini v1 API
 * Uses multiple sequential AI calls with different specialized prompts
 */

export interface ReportGenerationInput {
    charts: any[];
    dashboardStats?: any;
    reportType: 'executive' | 'detailed';
}

export interface ReportGenerationOutput {
    dataAnalysis: string;
    trendAnalysis: string;
    insightGeneration: string;
    finalReport: string;
    errors: string[];
}

/**
 * Call Gemini API directly using v1 endpoint (not v1beta)
 * Includes retry logic for handling temporary overload errors and quota limits
 */
async function callGeminiAPI(prompt: string, apiKey: string, temperature: number = 0.7, maxTokens: number = 2048, retries: number = 3): Promise<string> {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }],
                        generationConfig: {
                            temperature,
                            maxOutputTokens: maxTokens,
                        }
                    })
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                let errorData;

                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { error: { message: errorText } };
                }

                // Handle 429 (Quota Exceeded) errors
                if (response.status === 429) {
                    const retryDelay = errorData?.error?.details?.find((d: any) => d['@type']?.includes('RetryInfo'))?.retryDelay;
                    const quotaInfo = errorData?.error?.details?.find((d: any) => d['@type']?.includes('QuotaFailure'));

                    // Extract retry delay (e.g., "41s" -> 41000ms)
                    let waitTime = 60000; // Default 60 seconds
                    if (retryDelay) {
                        const seconds = parseInt(retryDelay.replace('s', ''));
                        waitTime = seconds * 1000;
                    }

                    const quotaMessage = quotaInfo?.violations?.[0]?.quotaMetric || 'API quota';

                    throw new Error(
                        `Quota Exceeded: ${quotaMessage}. ` +
                        `You've hit the free tier limit (20 requests/day). ` +
                        `Please wait ${Math.ceil(waitTime / 1000)}s or upgrade your API plan. ` +
                        `Visit: https://ai.google.dev/pricing`
                    );
                }

                // Handle 503 (Service Overloaded) errors with retry
                if (response.status === 503 && attempt < retries) {
                    const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
                    console.log(`[Gemini API] Model overloaded, retrying in ${waitTime}ms (attempt ${attempt + 1}/${retries})...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue; // Retry
                }

                throw new Error(`Gemini API Error: ${response.status} - ${errorData?.error?.message || errorText}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error: any) {
            // If it's a quota error or last attempt, throw immediately
            if (error.message.includes('Quota Exceeded') || attempt === retries) {
                throw error;
            }
            // Otherwise, wait and retry
            const waitTime = Math.pow(2, attempt) * 1000;
            console.log(`[Gemini API] Error occurred, retrying in ${waitTime}ms (attempt ${attempt + 1}/${retries})...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    throw new Error('Failed after all retry attempts');
}

/**
 * Generate comprehensive report using optimized 2-step agent workflow
 * Reduced from 4 calls to 2 calls to minimize quota usage
 */
export async function generateReportWithAgents(
    input: ReportGenerationInput
): Promise<ReportGenerationOutput> {
    const { charts, dashboardStats, reportType } = input;
    const errors: string[] = [];

    let dataAnalysis = '';
    let trendAnalysis = '';
    let insightGeneration = '';
    let finalReport = '';

    try {
        const keyManager = getKeyManager();

        // Prepare chart summaries
        const chartSummaries = charts.map((chart: any, i: number) => `
Chart ${i + 1}: ${chart.chartType}
- X: ${chart.xAxis} | Y: ${chart.yAxis}
- Data points: ${chart.dataSnapshot?.x?.length || 0}
- Values: ${JSON.stringify(chart.dataSnapshot?.y?.slice(0, 10) || [])}
    `).join('\n');

        console.log('[Agent Workflow] Step 1: Combined Data & Trend Analysis');

        // OPTIMIZED: Combine Agent 1 (Data Analysis) + Agent 2 (Trend Analysis) into ONE call
        // RETRY LOGIC: Try with multiple keys if exhaustion occurs
        let step1Success = false;
        let step1Attempts = 0;
        const maxKeyRetries = 3;

        while (!step1Success && step1Attempts < maxKeyRetries) {
            const currentKey = keyManager.getNextKey();
            try {
                const prompt = `
You are a Data & Trend Analysis Agent. Analyze chart data comprehensively.

Charts Data:
${chartSummaries}

Total Charts: ${charts.length}

Provide a comprehensive analysis with TWO sections:

## DATA ANALYSIS
1. Summary statistics for each chart
2. Data ranges and distributions
3. Key data points

## TREND ANALYSIS
1. Upward trends
2. Downward trends
3. Patterns and correlations

Output: Clear, structured analysis in markdown with both sections.
                `;

                const combinedAnalysis = await callGeminiAPI(prompt, currentKey, 0.4, 3072);

                // Split the response into two parts for compatibility
                const sections = combinedAnalysis.split('## TREND ANALYSIS');
                dataAnalysis = sections[0].replace('## DATA ANALYSIS', '').trim();
                trendAnalysis = sections[1] ? '## TREND ANALYSIS' + sections[1] : combinedAnalysis;
                step1Success = true;

            } catch (error: any) {
                if (error.message.includes('Quota Exceeded')) {
                    console.log(`[Agent Workflow] Key exhausted, trying next key...`);
                    keyManager.markExhausted(currentKey);
                    step1Attempts++;
                    if (keyManager.isAllExhausted() || step1Attempts >= maxKeyRetries) {
                        errors.push(`Data & Trend Analysis: All API keys exhausted. ${error.message}`);
                        break;
                    }
                    continue; // Try with next key
                }
                errors.push(`Data & Trend Analysis: ${error.message}`);
                break;
            }
        }

        console.log('[Agent Workflow] Step 2: Insight Generation & Report Synthesis');

        // OPTIMIZED: Combine Agent 3 (Insight Generation) + Agent 4 (Report Synthesis) into ONE call
        let step2Success = false;
        let step2Attempts = 0;

        while (!step2Success && step2Attempts < maxKeyRetries) {
            const currentKey = keyManager.getLeastUsedKey();
            try {
                const synthesisPrompt = reportType === 'executive'
                    ? getOptimizedExecutivePrompt(dataAnalysis, trendAnalysis, charts.length)
                    : getOptimizedDetailedPrompt(dataAnalysis, trendAnalysis, charts.length);

                const fullReport = await callGeminiAPI(synthesisPrompt, currentKey, 0.6, 4096);

                // Extract insights section for compatibility
                const insightMatch = fullReport.match(/## Key (Insights|Findings)([\s\S]*?)##/);
                insightGeneration = insightMatch ? insightMatch[0] : '';
                finalReport = fullReport;
                step2Success = true;

            } catch (error: any) {
                if (error.message.includes('Quota Exceeded')) {
                    console.log(`[Agent Workflow] Key exhausted during synthesis, trying next key...`);
                    keyManager.markExhausted(currentKey);
                    step2Attempts++;
                    if (keyManager.isAllExhausted() || step2Attempts >= maxKeyRetries) {
                        errors.push(`Insight & Report Generation: All API keys exhausted. ${error.message}`);
                        break;
                    }
                    continue; // Try with next key
                }
                errors.push(`Insight & Report Generation: ${error.message}`);
                break;
            }
        }

        console.log('[Agent Workflow] Complete (Optimized: 2 API calls instead of 4)');

    } catch (error: any) {
        errors.push(`Workflow Error: ${error.message}`);
    }

    return {
        dataAnalysis,
        trendAnalysis,
        insightGeneration,
        finalReport,
        errors,
    };
}

function getOptimizedExecutivePrompt(
    dataAnalysis: string,
    trendAnalysis: string,
    totalCharts: number
) {
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return `
You are a Report Synthesis Agent creating an Executive Summary with actionable insights.

Analysis Data:
${dataAnalysis}

${trendAnalysis}

Create a comprehensive executive summary:

# Executive Summary

## Overview
[2-3 sentences of high-level findings]

## Key Findings
[3-5 bullet points with specific data points]

## Trends & Patterns
[Major trends identified from the analysis]

## Key Insights
[3-5 actionable insights derived from the data]

## Recommendations
[3-5 specific, actionable recommendations]

## Conclusion
[1-2 sentences summarizing the overall picture]

---
*Report generated on ${date} | Charts analyzed: ${totalCharts}*

Use professional business language. Be concise, specific, and actionable.
    `;
}

function getOptimizedDetailedPrompt(
    dataAnalysis: string,
    trendAnalysis: string,
    totalCharts: number
) {
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return `
You are a Report Synthesis Agent creating a Detailed Analysis Report with comprehensive insights.

Analysis Data:
${dataAnalysis}

${trendAnalysis}

Create a detailed, comprehensive report:

# Comprehensive Data Analysis Report

## Executive Summary
[Brief overview of key findings]

## Data Analysis
${dataAnalysis}

## Trend Analysis
${trendAnalysis}

## Key Insights
[Comprehensive insights derived from the data and trends]

## Detailed Recommendations
[Comprehensive, actionable recommendations with rationale]

## Conclusion
[Summary of findings and next steps]

---
*Report generated on ${date} | Charts analyzed: ${totalCharts}*

Use professional, technical language. Be thorough and detailed.
    `;
}

function getExecutiveSynthesisPrompt(
    dataAnalysis: string,
    trendAnalysis: string,
    insightGeneration: string,
    totalCharts: number
) {
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return `
You are a Report Synthesis Agent creating an Executive Summary.

Combine the following analyses:

Data Analysis:
${dataAnalysis}

Trend Analysis:
${trendAnalysis}

Insights:
${insightGeneration}

Create an executive summary:

# Executive Summary

## Overview
[2-3 sentences of high-level findings]

## Key Findings
[3-5 bullet points]

## Trends & Patterns
[Major trends]

## Recommendations
[3-5 actionable recommendations]

## Conclusion
[1-2 sentences]

---
*Report generated on ${date} | Charts analyzed: ${totalCharts}*

Use professional business language. Be concise and actionable.
    `;
}

function getDetailedSynthesisPrompt(
    dataAnalysis: string,
    trendAnalysis: string,
    insightGeneration: string,
    totalCharts: number
) {
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return `
You are a Report Synthesis Agent creating a Detailed Analysis Report.

Combine the following analyses:

Data Analysis:
${dataAnalysis}

Trend Analysis:
${trendAnalysis}

Insights:
${insightGeneration}

Create a detailed report:

# Comprehensive Data Analysis Report

## Executive Summary
[Brief overview]

## Data Analysis
${dataAnalysis}

## Trend Analysis
${trendAnalysis}

## Key Insights
${insightGeneration}

## Detailed Recommendations
[Comprehensive recommendations]

## Conclusion
[Summary]

---
*Report generated on ${date} | Charts analyzed: ${totalCharts}*

Use professional, technical language. Be thorough.
    `;
}
