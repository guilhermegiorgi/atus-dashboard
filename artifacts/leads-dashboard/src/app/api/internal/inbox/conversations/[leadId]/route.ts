export { dynamic, revalidate } from "@/lib/server/atus-route";

import { proxyAtusJson } from "@/lib/server/atus-proxy";

export async function GET(
  _request: Request,
  { params }: { params: { leadId: string } }
) {
  return proxyAtusJson({
    path: `/api/v1/inbox/conversations/${params.leadId}`,
  });
}
