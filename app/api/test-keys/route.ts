import { NextResponse } from "next/server";
import { getKeyManager } from "@/lib/multi-key-manager";

/**
 * Test endpoint to verify API keys are loaded
 */
export async function GET() {
    try {
        const keyManager = getKeyManager();
        const stats = keyManager.getStats();

        return NextResponse.json({
            success: true,
            message: "API keys loaded successfully",
            keyCount: stats.length,
            keys: stats.map(s => ({
                index: s.keyIndex,
                preview: s.keyPreview,
                usageCount: s.usageCount,
                lastUsed: s.lastUsed,
            })),
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
        }, { status: 500 });
    }
}
