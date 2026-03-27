import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://chatbot.atusbr.com.br';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'atus-mcp-api-key-2026';

async function proxyRequest(url: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}

// GET /api/v1/leads
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const url = status ? `/api/v1/leads?status=${status}` : '/api/v1/leads';
  return proxyRequest(url);
}