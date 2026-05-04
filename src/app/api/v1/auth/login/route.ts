export { dynamic } from "@/lib/server/atus-route";

import { NextRequest, NextResponse } from "next/server";
import { getAtusBotConfig } from "@/lib/server/atus-config";

const SESSION_COOKIE = "atus-session";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { baseUrl } = getAtusBotConfig();

  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error || data.message || "Credenciais inválidas" },
      { status: response.status },
    );
  }

  const res = NextResponse.json({ token: data.token, user: data.user });

  res.cookies.set(SESSION_COOKIE, data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}
