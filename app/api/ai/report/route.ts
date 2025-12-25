import { NextResponse } from "next/server";
import { contentGeneratingAgent } from "@/lib/agents/agents";

/**
 * AI Report Generation Endpoint
 * Uses LangChain to generate comprehensive reports
 */
export async function POST(req: Request) {
    try {
        const { extractedData, visualizationSuggestions } = await req.json();

        if (!extractedData || !visualizationSuggestions) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Both extractedData and visualizationSuggestions are required"
                },
                { status: 400 }
            );
        }

        // Use LangChain agent to generate comprehensive report
        const report = await contentGeneratingAgent(
            extractedData,
            visualizationSuggestions
        );

        return NextResponse.json({
            success: true,
            report,
            message: "Report generated successfully using LangChain"
        });
    } catch (error: any) {
        console.error("AI Report Generation Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to generate report"
            },
            { status: 500 }
        );
    }
}
