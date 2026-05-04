export { dynamic, revalidate } from "@/lib/server/atus-route";

import { NextRequest } from "next/server";
import { proxyAtusJson } from "@/lib/server/atus-proxy";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  return proxyAtusJson({
    path: "/api/v1/audit",
    searchParams,
  });
}
