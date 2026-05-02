export { dynamic, revalidate } from "@/lib/server/atus-route";

import { proxyAtusJson } from "@/lib/server/atus-proxy";

type RouteContext = {
  params: Promise<{ id: string; tagId: string }>;
};

export async function DELETE(_: Request, { params }: RouteContext) {
  const { id, tagId } = await params;
  return proxyAtusJson({
    path: `/api/v1/leads/${id}/tags/${tagId}`,
    method: "DELETE",
  });
}
