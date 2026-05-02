export { dynamic, revalidate } from "@/lib/server/atus-route";

import { NextRequest } from "next/server";
import { proxyAtusJson } from "@/lib/server/atus-proxy";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyAtusJson({
    path: `/api/v1/leads/${params.id}/actions`,
    searchParams: request.nextUrl.searchParams,
  });
}
