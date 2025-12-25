import { NextResponse } from "next/server";
import { visualizationThinkingAgent } from "@/lib/agents/agents";

/**
 * AI Visualization Suggestions Endpoint
 * Uses LangChain to suggest optimal chart types and visualizations
 */
export async function POST(req: Request) {
    try {
        const { extractedData, columns, rows } = await req.json();

        let dataToAnalyze = extractedData;

        // If no extracted data, create a summary from columns/rows
        if (!dataToAnalyze && columns && rows) {
            dataToAnalyze = `
        Available Columns: ${columns.join(", ")}
        Sample Data: ${JSON.stringify(rows.slice(0, 5))}
        Total Rows: ${rows.length}
      `;
        }

        if (!dataToAnalyze) {
            return NextResponse.json(
                { success: false, error: "No data provided for visualization analysis" },
                { status: 400 }
            );
        }

        // Use LangChain agent to suggest visualizations
        const suggestions = await visualizationThinkingAgent(dataToAnalyze);

        return NextResponse.json({
            success: true,
            suggestions,
            message: "Visualization suggestions generated using LangChain"
        });
    } catch (error: any) {
        console.error("AI Visualization Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to generate visualization suggestions"
            },
            { status: 500 }
        );
    }
}
