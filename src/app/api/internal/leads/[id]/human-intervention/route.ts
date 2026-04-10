export { dynamic, revalidate } from "@/lib/server/atus-route";

import { NextRequest } from "next/server";
import { proxyAtusJson } from "@/lib/server/atus-proxy";

type Params = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  return proxyAtusJson({
    path: `/api/v1/leads/${params.id}/human-intervention`,
  });
}

export async function POST(request: NextRequest, { params }: Params) {
  return proxyAtusJson({
    path: `/api/v1/leads/${params.id}/human-intervention`,
    method: "POST",
    body: await request.json(),
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return proxyAtusJson({
    path: `/api/v1/leads/${params.id}/human-intervention`,
    method: "DELETE",
  });
}
