import { NextResponse } from "next/server";
import { appWorkflow } from "@/lib/agents/workflow";

/**
 * AI Complete Workflow Endpoint
 * Uses LangGraph to run the entire document → visualization → report pipeline
 */
export async function POST(req: Request) {
    try {
        const { documentContent } = await req.json();

        if (!documentContent) {
            return NextResponse.json(
                { success: false, error: "No document content provided" },
                { status: 400 }
            );
        }

        // Run the complete LangGraph workflow
        const result = await appWorkflow.invoke({
            documentContent
        });

        return NextResponse.json({
            success: true,
            workflow: {
                extractedData: result.extractedData,
                visualizationSuggestions: result.visualizationSuggestions,
                finalReport: result.finalReport
            },
            message: "Complete AI workflow executed successfully using LangGraph"
        });
    } catch (error: any) {
        console.error("AI Workflow Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to execute AI workflow"
            },
            { status: 500 }
        );
    }
}
