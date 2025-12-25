import { NextResponse } from "next/server";
import { generateReportWithAgents } from "@/lib/agents/report-workflow";

/**
 * Enhanced AI Report Generation Endpoint
 * Uses optimized 2-agent workflow (reduced from 4 to save quota)
 */
export async function POST(req: Request) {
    try {
        const { charts, dashboardStats, reportType = "executive" } = await req.json();

        if (!charts || charts.length === 0) {
            return NextResponse.json(
                { success: false, error: "No charts provided for report generation" },
                { status: 400 }
            );
        }

        console.log(`[Report Generation] Starting ${reportType} report for ${charts.length} charts`);

        // Execute the optimized 2-agent workflow
        const result = await generateReportWithAgents({
            charts,
            dashboardStats,
            reportType,
        });

        console.log(`[Report Generation] Workflow completed`);

        // Check for errors
        if (result.errors && result.errors.length > 0) {
            console.error('[Report Generation] Errors occurred:', result.errors);

            // Check if it's a quota error
            const hasQuotaError = result.errors.some(err => err.includes('Quota Exceeded'));

            if (hasQuotaError) {
                const quotaError = result.errors.find(err => err.includes('Quota Exceeded'));
                return NextResponse.json(
                    {
                        success: false,
                        error: 'API Quota Exceeded',
                        message: quotaError || 'You have exceeded the Gemini API free tier limit (20 requests/day).',
                        suggestion: 'Please wait for the quota to reset or upgrade your API plan at https://ai.google.dev/pricing',
                        details: result.errors,
                    },
                    { status: 429 }
                );
            }

            // If we still got a report despite errors, return it with warnings
            if (result.finalReport) {
                return NextResponse.json({
                    success: true,
                    report: result.finalReport,
                    warnings: result.errors,
                    metadata: {
                        chartsAnalyzed: charts.length,
                        reportType,
                        generatedAt: new Date().toISOString(),
                        workflow: {
                            dataAnalysis: !!result.dataAnalysis,
                            trendAnalysis: !!result.trendAnalysis,
                            insightGeneration: !!result.insightGeneration,
                            finalReport: !!result.finalReport,
                        },
                        optimized: true,
                        apiCallsUsed: 2, // Down from 4
                    },
                    message: "Report generated with some warnings",
                });
            }

            // No report generated
            return NextResponse.json(
                {
                    success: false,
                    error: 'Report generation failed',
                    details: result.errors,
                },
                { status: 500 }
            );
        }

        // Return the final report
        return NextResponse.json({
            success: true,
            report: result.finalReport,
            metadata: {
                chartsAnalyzed: charts.length,
                reportType,
                generatedAt: new Date().toISOString(),
                workflow: {
                    dataAnalysis: !!result.dataAnalysis,
                    trendAnalysis: !!result.trendAnalysis,
                    insightGeneration: !!result.insightGeneration,
                    finalReport: !!result.finalReport,
                },
                optimized: true,
                apiCallsUsed: 2, // Down from 4
            },
            message: "Report generated successfully using optimized workflow (2 API calls)",
        });
    } catch (error: any) {
        console.error("AI Report Generation Error:", error);

        // Handle quota errors at the top level
        if (error.message?.includes('Quota Exceeded')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'API Quota Exceeded',
                    message: error.message,
                    suggestion: 'Please wait for the quota to reset or upgrade your API plan at https://ai.google.dev/pricing'
                },
                { status: 429 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to generate report"
            },
            { status: 500 }
        );
    }
}
