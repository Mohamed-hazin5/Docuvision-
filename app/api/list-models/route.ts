import { NextResponse } from 'next/server';

/**
 * Diagnostic endpoint to list available Gemini models
 */
export async function GET() {
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'No API key found' }, { status: 500 });
        }

        // Try v1beta API
        const v1betaResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );

        const v1betaData = await v1betaResponse.json();

        // Try v1 API
        const v1Response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
        );

        const v1Data = await v1Response.json();

        return NextResponse.json({
            v1beta: {
                status: v1betaResponse.status,
                models: v1betaData.models?.map((m: any) => ({
                    name: m.name,
                    displayName: m.displayName,
                    supportedMethods: m.supportedGenerationMethods
                })) || []
            },
            v1: {
                status: v1Response.status,
                models: v1Data.models?.map((m: any) => ({
                    name: m.name,
                    displayName: m.displayName,
                    supportedMethods: m.supportedGenerationMethods
                })) || []
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
