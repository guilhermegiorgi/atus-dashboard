export { dynamic, revalidate } from "@/lib/server/atus-route";

import { proxyAtusJson } from "@/lib/server/atus-proxy";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  return proxyAtusJson({ path: `/api/v1/users${query ? `?${query}` : ""}` });
}

export async function POST(request: Request) {
  const body = await request.json();
  return proxyAtusJson({
    path: "/api/v1/users",
    method: "POST",
    body,
  });
}
