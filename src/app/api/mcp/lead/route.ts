export { dynamic, revalidate } from "@/lib/server/atus-route";

import { NextRequest } from "next/server";
import { proxyAtusJson } from "@/lib/server/atus-proxy";

export async function POST(request: NextRequest) {
  return proxyAtusJson({
    path: "/mcp/lead",
    method: "POST",
    body: await request.json(),
  });
}
