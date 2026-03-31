import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://chatbot.atusbr.com.br";
const API_KEY =
  process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || "atus-mcp-api-key-2026";

async function proxyRequest(url: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyRequest(`/mcp/lead/${params.id}`);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  return proxyRequest(`/mcp/lead/${params.id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
