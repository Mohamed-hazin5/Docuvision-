import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ success: false, error: "File must be a PDF" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfBytes = new Uint8Array(arrayBuffer);

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"

    });

    const result = await model.generateContent([
      {
        inlineData: {
          data: Buffer.from(pdfBytes).toString("base64"),
          mimeType: "application/pdf",
        },
      },
      {
        text: `
          Extract the first table from this PDF.
          Return JSON with this format only:
          {
            "columns": ["col1", "col2", ...],
            "rows": [
              { "col1": "value", "col2": "value" }
            ]
          }
          If no table exists, return:
          { "columns": [], "rows": [] }
        `
      }
    ]);

    const responseText = result.response.text();
    const clean = responseText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      console.error("Failed JSON:", clean);
      return NextResponse.json({ success: false, error: "Gemini output parsing failed" }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      columns: parsed.columns || [],
      rows: parsed.rows || []
    });

  } catch (err) {
    console.error("PDF extract error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
