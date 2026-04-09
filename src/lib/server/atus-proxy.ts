import "server-only";

import { NextResponse } from "next/server";
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
  const response = await fetch(buildUrl(path, searchParams), {
    method,
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : { error: await response.text() };

  return NextResponse.json(payload, { status: response.status });
}
