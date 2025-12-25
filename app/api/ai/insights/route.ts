import { NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

/**
 * AI Data Insights Endpoint (LangChain-powered)
 * Replaces the old /api/suggest with LangChain implementation
 */
export async function POST(req: Request) {
    try {
        const { columns, rows, chartType, xAxis, yAxis } = await req.json();

        if (!columns || !rows) {
            return NextResponse.json(
                { success: false, error: "Columns and rows are required" },
                { status: 400 }
            );
        }

        // Initialize LangChain model
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-1.5-pro",
            maxOutputTokens: 2048,
            apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
        });

        // Create structured prompt
        const prompt = PromptTemplate.fromTemplate(`
You are an expert data analyst and visualization specialist.

Analyze the following dataset and provide insights:

Columns: {columns}
Sample Data (first 5 rows): {sampleData}
Total Rows: {totalRows}

{specificAnalysis}

Provide your response in the following JSON format:
{{
  "insights": [
    {{
      "title": "Insight title",
      "description": "Detailed insight description",
      "chartSuggestion": {{
        "type": "line|bar|pie",
        "xAxis": "column name",
        "yAxis": "column name",
        "reason": "Why this visualization works"
      }}
    }}
  ],
  "summary": "Overall data summary",
  "recommendations": ["Action item 1", "Action item 2"]
}}

Return ONLY the JSON, no markdown formatting.
    `);

        // Prepare data
        const sampleData = JSON.stringify(rows.slice(0, 5));
        const specificAnalysis = chartType && xAxis && yAxis
            ? `Current Chart: ${chartType} chart with X-axis: ${xAxis}, Y-axis: ${yAxis}. Provide insights specific to this visualization.`
            : "Suggest 3 different useful visualizations for this data.";

        // Create chain
        const chain = prompt.pipe(model).pipe(new StringOutputParser());

        // Execute
        const response = await chain.invoke({
            columns: columns.join(", "),
            sampleData,
            totalRows: rows.length,
            specificAnalysis
        });

        // Parse response
        const cleanJson = response.replace(/```json|```/g, "").trim();
        const insights = JSON.parse(cleanJson);

        return NextResponse.json({
            success: true,
            insights,
            message: "Insights generated using LangChain"
        });
    } catch (error: any) {
        console.error("AI Insights Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || "Failed to generate insights"
            },
            { status: 500 }
        );
    }
}
