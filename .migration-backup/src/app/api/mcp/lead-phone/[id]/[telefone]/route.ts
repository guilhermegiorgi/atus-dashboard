export { dynamic, revalidate } from "@/lib/server/atus-route";

import { NextRequest } from "next/server";
import { proxyAtusJson } from "@/lib/server/atus-proxy";

type Params = { params: { telefone: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  return proxyAtusJson({
    path: `/mcp/lead/${params.telefone}`,
  });
}

export async function POST(request: NextRequest) {
  return proxyAtusJson({
    path: "/mcp/lead",
    method: "POST",
    body: await request.json(),
  });
}
