import { NextResponse } from "next/server";

// This route has been moved to `/api/suggest`. Keep a lightweight proxy here
// for backward compatibility by redirecting callers to the new route.
export async function POST(req) {
  const url = new URL(req.url);
  // Respond with a 307 redirect to the new suggest endpoint path
  return NextResponse.redirect(url.origin + "/api/suggest", 307);
}
