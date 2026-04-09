export { dynamic, revalidate } from "@/lib/server/atus-route";

import { NextRequest } from "next/server";
import { proxyAtusJson } from "@/lib/server/atus-proxy";

export async function POST(
  request: NextRequest,
  { params }: { params: { leadId: string } }
) {
  const body = await request.json();

  return proxyAtusJson({
    path: `/api/v1/inbox/conversations/${params.leadId}/assign`,
    method: "POST",
    body,
  });
}
