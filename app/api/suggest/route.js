import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const body = await req.text();
    const { columns, rows } = JSON.parse(body);

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    // Use model names that exist on the REST ListModels response. Allow override with GEMINI_MODEL_LIST.
    const candidateModels = (process.env.GEMINI_MODEL_LIST || "gemini-pro-latest,gemini-2.5-pro,gemini-2.5-flash,gemini-flash-latest,gemma-3-1b-it").split(",").map((s) => s.trim()).filter(Boolean);

    const prompt = `
      You are a data visualization expert.
      Based on the data columns below, suggest exactly 3 useful charts in JSON format:

      Columns:
      ${columns.join(", ")}

      Sample Data (first rows):
      ${JSON.stringify(rows)}

      Follow this strict format:
      [
        {
          "title": "...",
          "x": "COLUMN_NAME",
          "y": "COLUMN_NAME",
          "reason": "Why this chart is useful"
        }
      ]

      Rules:
      - Only use columns that exist
      - Prefer columns with numeric values for Y axis
      - Ensure suggestions are different from each other
    `;

    let lastErr = null;
    let suggestions = [];
    let retryAfterSeconds = null;

    for (const candidate of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: candidate });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const cleanJson = text.replace(/```json|```/g, "").trim();
        suggestions = JSON.parse(cleanJson);
        // success — stop trying further models
        lastErr = null;
        break;
      } catch (err) {
        // store and try next candidate
        lastErr = err;
        // detect quota / rate-limit (HTTP 429) and extract retry time if present
        try {
          const msg = err && (err.message || JSON.stringify(err));
          console.warn(`Model ${candidate} failed:`, msg);

          // Example message contains: "Please retry in 56.10447239s." — extract seconds
          const m = String(msg).match(/Please retry in\s*([0-9]+(?:\.[0-9]+)?)s/i);
          if (m) {
            const secs = Math.ceil(Number(m[1]));
            // keep the maximum retry suggestion across candidates
            retryAfterSeconds = Math.max(retryAfterSeconds || 0, secs);
          }
        } catch (e) {
          console.warn("Error parsing model error:", e);
        }

        continue;
      }
    }

    if (lastErr) {
      console.error("AI Suggest Error — all candidate models failed:", lastErr);
      const status = (lastErr && lastErr.status === 429) || retryAfterSeconds ? 429 : 502;
      const body = { success: false, error: lastErr.message || String(lastErr) };
      if (retryAfterSeconds) body.retryAfter = retryAfterSeconds;
      // Return structured object so callers can inspect retry info
      return NextResponse.json(body, { status });
    }

    // Return suggestions array (keep compatible with older clients expecting array)
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("AI Suggest Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}
