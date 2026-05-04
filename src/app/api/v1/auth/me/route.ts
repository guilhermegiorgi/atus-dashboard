export { dynamic } from "@/lib/server/atus-route";

import { NextRequest, NextResponse } from "next/server";
import { getAtusBotConfig } from "@/lib/server/atus-config";

const SESSION_COOKIE = "atus-session";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { baseUrl } = getAtusBotConfig();

  const response = await fetch(`${baseUrl}/api/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error || data.message || "Sessão inválida" },
      { status: response.status },
    );
  }

  return NextResponse.json(data);
}
