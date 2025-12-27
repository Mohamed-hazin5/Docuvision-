import { NextResponse } from 'next/server';
import { getKeyManager } from '@/lib/multi-key-manager';

async function callGeminiChat(prompt: string, apiKey: string, retries: number = 2): Promise<string> {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
                            temperature: 0.7,
                            maxOutputTokens: 1024,
                        }
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Quota Exceeded');
                }
                throw new Error(data.error?.message || 'Gemini API Error');
            }

            return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';
        } catch (error: any) {
            console.error(`[Chat API] Attempt ${attempt + 1} failed:`, error.message);

            // If it's a network error or 5xx, retry
            if (attempt < retries && (error.code === 'ENOTFOUND' || error.message.includes('50'))) {
                const waitTime = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            throw error;
        }
    }
    throw new Error('Failed after all retries');
}

export async function POST(req: Request) {
    try {
        const { messages, context, settings } = await req.json();
        const keyManager = getKeyManager();
        let reply = '';
        let success = false;
        let attempts = 0;
        const maxKeyRetries = 3;

        const verbosityMap: Record<string, string> = {
            brief: "Keep your response extremely concise. Use bullet points and maximize information density. Avoid fluff.",
            balanced: "Provide a balanced response with standard analytical detail and clear structure.",
            detailed: "Provide a comprehensive analysis. Explore correlations, edge cases, and provide deep context where possible."
        };
        const verbosityInstructions = verbosityMap[settings?.verbosity] || verbosityMap.balanced;

        while (!success && attempts < maxKeyRetries) {
            const currentKey = keyManager.getNextKey();
            try {
                // Construct the system prompt with context
                const systemPrompt = `
SYSTEM ROLE: Conversational Data Analyst for Doc-Vis

You are an AI data analyst embedded inside a document visualization dashboard.
Your job is to help users understand charts, tables, and reports accurately and professionally.

VERBOSITY SETTING: ${settings?.verbosity || 'balanced'}
${verbosityInstructions}

════════════════════════════════════
CORE DATA CONTRACT (NON-NEGOTIABLE)
════════════════════════════════════
You receive TWO different data contexts representing DIFFERENT scopes of truth. You MUST NEVER confuse them.

DATA CONTEXT JSON:
${JSON.stringify({
                    fullDataContext: context.fullDataContext,
                    visibleDataContext: context.visibleDataContext
                }, null, 2)}

CHARTS CONTEXT:
${context.charts.map((c: any, i: number) => `
Chart ${i + 1} (${c.type}):
- X-Axis: ${c.xAxis}
- Y-Axis: ${c.yAxis}
- Insights: ${c.insight || 'None'}
- Aggregates (Chart-specific): Min=${c.aggregates?.min || 'N/A'}, Max=${c.aggregates?.max || 'N/A'}, Avg=${c.aggregates?.avg || 'N/A'}
`).join('\n')}

════════════════════════════════════
BEHAVIORAL RULES (STRICT)
════════════════════════════════════
1. FULL DATA AUTHORIZATION: "fullDataContext.rowCount" is the ONLY authoritative dataset size. 
   - If "fullDataContext.rowCount" is missing, you MUST say: "The full dataset size is unknown."
   - Never assume the visible preview rows represent the full dataset.
2. PREVIEW VS GLOBAL: If visibleRows.length < fullDataContext.rowCount, you MUST explicitly state that the UI shows only a preview.
3. CLEAR LABELING: You MUST label every insight as either: 
   - "Based on the full dataset…"
   - "Based on the rows currently visible…"
4. NO HALLUCINATION: NEVER invent or claim exact row values (IDs, specific names, transaction IDs) not present in "visibleDataContext.visibleRows".
5. UNANSWERABLE: If asked for exact values from unseen rows or specific IDs not visible, respond EXACTLY with:
   "I can analyze overall trends, but that specific row-level detail is not visible on screen."
6. TONE: Maintain a professional, analytical tone matching enterprise BI tools (PowerBI / Tableau Copilot).

CHAT HISTORY:
${messages.slice(-5, -1).map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

USER QUESTION:
${messages[messages.length - 1].content}

Response:`;

                reply = await callGeminiChat(systemPrompt, currentKey);
                success = true;
            } catch (error: any) {
                if (error.message.includes('Quota')) {
                    console.log(`[Chat API] Key exhausted, trying next key...`);
                    keyManager.markExhausted(currentKey);
                    attempts++;
                    if (keyManager.isAllExhausted() || attempts >= maxKeyRetries) {
                        throw new Error('All API keys exhausted. Please wait a while or upgrade your plan.');
                    }
                    continue;
                }
                throw error;
            }
        }

        return NextResponse.json({
            success: true,
            reply
        });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to generate response' },
            { status: error.message.includes('Quota') ? 429 : 500 }
        );
    }
}
