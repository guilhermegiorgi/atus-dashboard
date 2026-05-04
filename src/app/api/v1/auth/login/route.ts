export { dynamic } from "@/lib/server/atus-route";

import { NextRequest, NextResponse } from "next/server";
import { getAtusBotConfig } from "@/lib/server/atus-config";

const SESSION_COOKIE = "atus-session";

type LoginResponsePayload = {
  error?: string;
  message?: string;
  token?: string;
  accessToken?: string;
  access_token?: string;
  jwt?: string;
  user?: unknown;
  data?: unknown;
};

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function extractLoginSession(payload: unknown) {
  const root = asObject(payload);
  const data = asObject(root?.data);

  const token =
    (typeof root?.token === "string" && root.token) ||
    (typeof root?.accessToken === "string" && root.accessToken) ||
    (typeof root?.access_token === "string" && root.access_token) ||
    (typeof root?.jwt === "string" && root.jwt) ||
    (typeof data?.token === "string" && data.token) ||
    (typeof data?.accessToken === "string" && data.accessToken) ||
    (typeof data?.access_token === "string" && data.access_token) ||
    (typeof data?.jwt === "string" && data.jwt) ||
    null;

  const user = root?.user ?? data?.user ?? root?.data ?? null;

  return { token, user };
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { baseUrl } = getAtusBotConfig();

  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as LoginResponsePayload;

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error || data.message || "Credenciais inválidas" },
      { status: response.status },
    );
  }

  const { token, user } = extractLoginSession(data);

  if (!token) {
    return NextResponse.json(
      {
        error:
          "Login concluído no backend, mas a resposta não trouxe um token de sessão utilizável.",
      },
      { status: 502 },
    );
  }

  const res = NextResponse.json({ token, user });

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}
