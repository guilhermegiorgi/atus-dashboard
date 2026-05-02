import { NextRequest, NextResponse } from "next/server";

const WUZAPI_URL = process.env.WUZAPI_URL || process.env.NEXT_PUBLIC_ATUS_BOT_URL || "http://localhost:80";

function getWuzapiToken(request: NextRequest): string | null {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

export async function POST(request: NextRequest) {
  try {
    const token = getWuzapiToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { Phone, Image, Audio, Document, FileName, Caption } = body;

    if (!Phone) {
      return NextResponse.json(
        { success: false, error: "Phone is required" },
        { status: 400 },
      );
    }

    // Determine endpoint and payload based on media type
    let endpoint = "";
    let payload = {};

    if (Image) {
      endpoint = "/chat/send/image";
      payload = { Phone, Image, Caption };
    } else if (Audio) {
      endpoint = "/chat/send/audio";
      payload = { Phone, Audio, PTT: true };
    } else if (Document) {
      endpoint = "/chat/send/document";
      payload = { Phone, Document, FileName, Caption };
    } else {
      return NextResponse.json(
        { success: false, error: "No media provided" },
        { status: 400 },
      );
    }

    const response = await fetch(`${WUZAPI_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json(
        { success: false, error: data.error || "Failed to send media" },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      id: data.data?.Id || data.data?.id,
    });
  } catch (error) {
    console.error("WhatsApp send media error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
