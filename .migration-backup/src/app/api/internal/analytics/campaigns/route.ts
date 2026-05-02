export { dynamic, revalidate } from "@/lib/server/atus-route";

import { NextRequest } from "next/server";
import { proxyAtusJson } from "@/lib/server/atus-proxy";

export async function GET(request: NextRequest) {
  return proxyAtusJson({
    path: "/api/v1/analytics/campaigns",
    searchParams: request.nextUrl.searchParams,
  });
}
