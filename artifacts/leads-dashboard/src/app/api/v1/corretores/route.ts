export { dynamic, revalidate } from "@/lib/server/atus-route";

import { NextRequest } from "next/server";
import { proxyAtusJson } from "@/lib/server/atus-proxy";

export async function GET(request: NextRequest) {
  return proxyAtusJson({
    path: "/api/v1/corretores",
    searchParams: request.nextUrl.searchParams,
  });
}

export async function POST(request: NextRequest) {
  return proxyAtusJson({
    path: "/api/v1/corretores",
    method: "POST",
    body: await request.json(),
  });
}
