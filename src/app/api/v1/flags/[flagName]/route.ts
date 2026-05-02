export { dynamic, revalidate } from "@/lib/server/atus-route";

import { proxyAtusJson } from "@/lib/server/atus-proxy";

type RouteContext = {
  params: Promise<{ flagName: string }>;
};

export async function PUT(request: Request, { params }: RouteContext) {
  const { flagName } = await params;
  const body = await request.json();
  return proxyAtusJson({
    path: `/api/v1/flags/${flagName}`,
    method: "PUT",
    body,
  });
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const { flagName } = await params;
  return proxyAtusJson({
    path: `/api/v1/flags/${flagName}`,
    method: "DELETE",
  });
}
