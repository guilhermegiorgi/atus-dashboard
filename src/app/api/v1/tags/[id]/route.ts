export { dynamic, revalidate } from "@/lib/server/atus-route";

import { proxyAtusJson } from "@/lib/server/atus-proxy";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params;
  return proxyAtusJson({ path: `/api/v1/tags/${id}` });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const body = await request.json();
  return proxyAtusJson({
    path: `/api/v1/tags/${id}`,
    method: "PUT",
    body,
  });
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const { id } = await params;
  return proxyAtusJson({
    path: `/api/v1/tags/${id}`,
    method: "DELETE",
  });
}
