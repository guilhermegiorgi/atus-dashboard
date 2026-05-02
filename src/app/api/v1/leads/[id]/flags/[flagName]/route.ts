export { dynamic, revalidate } from "@/lib/server/atus-route";

import { proxyAtusJson } from "@/lib/server/atus-proxy";

type RouteContext = {
  params: Promise<{ id: string; flagName: string }>;
};

export async function PUT(request: Request, { params }: RouteContext) {
  const { id, flagName } = await params;
  const body = await request.json();
  return proxyAtusJson({
    path: `/api/v1/leads/${id}/flags/${flagName}`,
    method: "PUT",
    body,
  });
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const { id, flagName } = await params;
  return proxyAtusJson({
    path: `/api/v1/leads/${id}/flags/${flagName}`,
    method: "DELETE",
  });
}
