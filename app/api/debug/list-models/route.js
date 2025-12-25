import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    // The SDK exposes methods for model-level operations; try to call listModels
    // If unavailable, catch and return a helpful error.
    if (typeof genAI.listModels === "function") {
      const res = await genAI.listModels();
      return NextResponse.json({ success: true, models: res });
    }

    // Fallback: attempt to call a known helper if present on the instance
    if (typeof genAI.getAvailableModels === "function") {
      const res = await genAI.getAvailableModels();
      return NextResponse.json({ success: true, models: res });
    }

    return NextResponse.json({
      success: false,
      error: "SDK does not expose a listModels helper. Check SDK docs or call ListModels via REST API.",
    });
  } catch (err) {
    console.error("List Models Error:", err);
    return NextResponse.json({ success: false, error: err.message || String(err) }, { status: 500 });
  }
}
