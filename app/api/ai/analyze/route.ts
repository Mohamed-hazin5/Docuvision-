import { NextResponse } from "next/server";
import { documentExtractingAgent } from "@/lib/agents/agents";

/**
 * AI Document Analysis Endpoint
 * Uses LangChain to extract structured data from uploaded documents
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

        // Use LangChain agent to extract structured data
        const extractedData = await documentExtractingAgent(documentContent);

        return NextResponse.json({
            success: true,
            extractedData,
            message: "Document analyzed successfully using LangChain"
        });
    } catch (error: any) {
        console.error("AI Analysis Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to analyze document"
            },
            { status: 500 }
        );
    }
}
