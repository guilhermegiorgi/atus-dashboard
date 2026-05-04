export { dynamic, revalidate } from "@/lib/server/atus-route";

import { proxyAtusJson } from "@/lib/server/atus-proxy";

export async function PUT(request: Request) {
  const body = await request.json();
  return proxyAtusJson({
    path: "/api/v1/kanban/stages/reorder",
    method: "PUT",
    body,
  });
}
