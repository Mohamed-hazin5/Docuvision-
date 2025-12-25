import { NextResponse } from "next/server";
import Papa from "papaparse";
import { read, utils } from "xlsx"; // ✅ correct import

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const buffer = Buffer.from(await file.arrayBuffer());

    let rows = [];
    let columns = [];

    // CSV
    if (file.name.endsWith(".csv")) {
      const text = buffer.toString("utf8");
      const parsed = Papa.parse(text, { header: true });
      rows = parsed.data;

      columns = parsed.meta.fields || [];
    }

    // Excel
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const workbook = read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = utils.sheet_to_json(sheet);
      rows = json;

      // collect ALL columns from all rows
      const allColumns = new Set();
      json.forEach((row) => {
        Object.keys(row).forEach((col) => allColumns.add(col));
      });
      columns = Array.from(allColumns);
    }

    return NextResponse.json({
      success: true,
      columns,
      rows: rows.slice(0, 20), // preview only
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
