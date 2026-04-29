import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const WUZAPI_URL = process.env.WUZAPI_URL || "http://localhost:8080";

async function getWuzapiToken(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.token) return null;
  return session.user.token;
}

export async function POST(request: NextRequest) {
  try {
    const token = await getWuzapiToken();
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
