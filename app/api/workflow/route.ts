import { NextRequest, NextResponse } from "next/server";
import { appWorkflow } from "@/lib/agents/workflow";

export async function POST(req: NextRequest) {
    try {
        const { documentContent } = await req.json();

        if (!documentContent) {
            return NextResponse.json(
                { error: "Missing documentContent" },
                { status: 400 }
            );
        }

        const initialInput = {
            documentContent,
        };

        const result = await appWorkflow.invoke(initialInput);

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("Workflow failed:", error);
        return NextResponse.json(
            { error: "Workflow failed", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
