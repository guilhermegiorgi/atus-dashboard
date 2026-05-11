import "server-only";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAtusBotConfig } from "./atus-config";

type ProxyInput = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  searchParams?: URLSearchParams;
  body?: unknown;
};

function buildUrl(path: string, searchParams?: URLSearchParams) {
  const { baseUrl } = getAtusBotConfig();
  const query = searchParams?.toString();
  return `${baseUrl}${path}${query ? `?${query}` : ""}`;
}

export async function proxyAtusJson({
  path,
  method = "GET",
  searchParams,
  body,
}: ProxyInput) {
  const { apiKey } = getAtusBotConfig();

  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-api-key": apiKey,
  };

  // Tenta incluir o token de sessão automaticamente se estiver disponível nos cookies
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("atus-session")?.value;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  } catch {
    // Ignora se cookies() não puder ser acessado (ex: fora de contexto de request)
  }

  const response = await fetch(buildUrl(path, searchParams), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";
  let payload: any;

  if (contentType.includes("application/json")) {
    try {
      const text = await response.text();
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { error: "Erro ao processar resposta JSON do servidor" };
    }
  } else {
    payload = { error: await response.text() };
  }

  return NextResponse.json(payload, { status: response.status });
}

