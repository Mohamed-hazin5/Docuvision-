import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "No API key found in env (NEXT_PUBLIC_GEMINI_API_KEY or GEMINI_API_KEY)" }, { status: 400 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);
    const text = await res.text();

    // Try to parse JSON, otherwise return raw text
    try {
      const json = JSON.parse(text);
      return NextResponse.json({ success: true, data: json });
    } catch (e) {
      return NextResponse.json({ success: true, data: text });
    }
  } catch (err) {
    console.error("List Models REST Error:", err);
    return NextResponse.json({ success: false, error: err.message || String(err) }, { status: 500 });
  }
}
