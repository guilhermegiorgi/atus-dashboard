import { NextRequest } from "next/server";
export { dynamic, revalidate } from "@/lib/server/atus-route";

import { proxyAtusJson } from "@/lib/server/atus-proxy";

export async function GET() {
  return proxyAtusJson({ path: "/mcp/stats" });
}

export async function POST(request: NextRequest) {
  return proxyAtusJson({
    path: "/mcp/chat",
    method: "POST",
    body: await request.json(),
  });
}
