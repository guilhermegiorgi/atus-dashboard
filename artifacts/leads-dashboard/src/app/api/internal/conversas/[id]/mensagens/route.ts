export { dynamic, revalidate } from "@/lib/server/atus-route";

import { NextRequest } from "next/server";
import { proxyAtusJson } from "@/lib/server/atus-proxy";

type Params = { params: { id: string } };

export async function GET(request: NextRequest, { params }: Params) {
  return proxyAtusJson({
    path: `/api/v1/conversas/${params.id}/mensagens`,
    searchParams: request.nextUrl.searchParams,
  });
}
