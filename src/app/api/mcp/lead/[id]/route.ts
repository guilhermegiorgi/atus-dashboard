export { dynamic, revalidate } from "@/lib/server/atus-route";

import { NextRequest } from "next/server";
import { proxyAtusJson } from "@/lib/server/atus-proxy";

type Params = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  return proxyAtusJson({ path: `/mcp/lead/${params.id}` });
}

export async function PUT(request: NextRequest, { params }: Params) {
  return proxyAtusJson({
    path: `/mcp/lead/${params.id}`,
    method: "PUT",
    body: await request.json(),
  });
}
